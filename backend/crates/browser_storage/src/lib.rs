use browser_ai::{
    AiProfile, AiProvider, AiProviderCheck, AiProviderSettings, AiProviderSetupRequest,
    AiResponseMode, check_provider, default_provider_settings, model_options, provider_limit_note,
};
use browser_crypto::{CryptoError, ProtectedSecret, protect_secret, reveal_secret};
use browser_policy::ActionAuditEvent;
use rusqlite::{Connection, params};
use search_core::SearchDocument;
use std::path::Path;

#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("sqlite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("crypto error: {0}")]
    Crypto(#[from] CryptoError),
}

pub type StorageResult<T> = Result<T, StorageError>;

pub struct BrowserStorage {
    conn: Connection,
}

impl BrowserStorage {
    pub fn open(path: impl AsRef<Path>) -> StorageResult<Self> {
        let conn = Connection::open(path)?;
        let storage = Self { conn };
        storage.migrate()?;
        Ok(storage)
    }

    pub fn open_memory() -> StorageResult<Self> {
        let conn = Connection::open_in_memory()?;
        let storage = Self { conn };
        storage.migrate()?;
        Ok(storage)
    }

    pub fn append_audit_event(&self, event: &ActionAuditEvent) -> StorageResult<()> {
        let payload = serde_json::to_string(event)?;
        self.conn.execute(
            "INSERT INTO action_audit_events (event_id, timestamp, required_tier, decision, outcome, origin, payload_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                event.event_id.to_string(),
                event.timestamp.to_rfc3339(),
                format!("{:?}", event.required_tier),
                format!("{:?}", event.decision),
                format!("{:?}", event.outcome),
                event.origin.as_deref(),
                payload
            ],
        )?;
        Ok(())
    }

    pub fn latest_audit_events(&self, limit: usize) -> StorageResult<Vec<ActionAuditEvent>> {
        let mut stmt = self.conn.prepare(
            "SELECT payload_json FROM action_audit_events ORDER BY timestamp DESC, rowid DESC LIMIT ?1",
        )?;
        let rows = stmt.query_map(params![limit.min(1000) as i64], |row| {
            row.get::<_, String>(0)
        })?;
        let mut events = Vec::new();
        for row in rows {
            events.push(serde_json::from_str(&row?)?);
        }
        Ok(events)
    }

    pub fn upsert_search_document(&self, document: &SearchDocument) -> StorageResult<()> {
        let payload = serde_json::to_string(document)?;
        self.conn.execute(
            "INSERT INTO search_documents (id, kind, title, url, source, updated_at, payload_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
             ON CONFLICT(id) DO UPDATE SET
                kind = excluded.kind,
                title = excluded.title,
                url = excluded.url,
                source = excluded.source,
                updated_at = excluded.updated_at,
                payload_json = excluded.payload_json",
            params![
                &document.id,
                format!("{:?}", document.kind),
                &document.title,
                document.url.as_deref(),
                &document.source,
                document.updated_at.to_rfc3339(),
                payload
            ],
        )?;
        Ok(())
    }

    pub fn all_search_documents(&self) -> StorageResult<Vec<SearchDocument>> {
        let mut stmt = self
            .conn
            .prepare("SELECT payload_json FROM search_documents ORDER BY updated_at DESC")?;
        let rows = stmt.query_map([], |row| row.get::<_, String>(0))?;
        let mut documents = Vec::new();
        for row in rows {
            documents.push(serde_json::from_str(&row?)?);
        }
        Ok(documents)
    }

    pub fn purge_audit_events_older_than(&self, cutoff_rfc3339: &str) -> StorageResult<usize> {
        let deleted = self.conn.execute(
            "DELETE FROM action_audit_events WHERE timestamp < ?1",
            params![cutoff_rfc3339],
        )?;
        Ok(deleted)
    }

    pub fn stats(&self) -> StorageResult<StorageStats> {
        let audit_events =
            self.conn
                .query_row("SELECT COUNT(*) FROM action_audit_events", [], |row| {
                    row.get::<_, u64>(0)
                })?;
        let search_documents =
            self.conn
                .query_row("SELECT COUNT(*) FROM search_documents", [], |row| {
                    row.get::<_, u64>(0)
                })?;
        let schema_version = self.conn.query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
            [],
            |row| row.get::<_, u32>(0),
        )?;

        Ok(StorageStats {
            schema_version,
            audit_events,
            search_documents,
        })
    }

    pub fn list_ai_providers(&self) -> StorageResult<Vec<AiProviderSettings>> {
        let mut providers = default_provider_settings();
        let mut stmt = self.conn.prepare(
            "SELECT provider, enabled, display_name, model, response_mode, api_key_json, endpoint FROM ai_provider_settings",
        )?;
        let rows = stmt.query_map([], |row| {
            let provider_key: String = row.get(0)?;
            let api_key_json: Option<String> = row.get(5)?;
            Ok((
                provider_key,
                row.get::<_, bool>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                api_key_json,
                row.get::<_, Option<String>>(6)?,
            ))
        })?;

        for row in rows {
            let (
                provider_key,
                enabled,
                display_name,
                selected_model,
                response_mode,
                api_key_json,
                endpoint,
            ) = row?;
            if let Some(provider) = parse_provider(&provider_key) {
                if let Some(slot) = providers.iter_mut().find(|item| item.provider == provider) {
                    slot.enabled = enabled;
                    slot.display_name = display_name;
                    slot.model = selected_model;
                    slot.response_mode = parse_response_mode(&response_mode);
                    slot.api_key_configured = api_key_json.is_some();
                    slot.endpoint = endpoint;
                    slot.models = model_options(provider);
                    slot.limit_note = provider_limit_note(provider).to_string();
                }
            }
        }

        Ok(providers)
    }

    pub fn save_ai_provider(
        &self,
        request: &AiProviderSetupRequest,
    ) -> StorageResult<AiProviderSettings> {
        let defaults = default_provider_settings();
        let default = defaults
            .iter()
            .find(|item| item.provider == request.provider)
            .cloned()
            .unwrap_or_else(|| default_provider_settings()[0].clone());
        let provider_key = provider_key(request.provider);
        let display_name = default.display_name;
        let api_key_json = match request
            .api_key
            .as_deref()
            .filter(|key| !key.trim().is_empty())
        {
            Some(key) => Some(serde_json::to_string(&protect_secret(key)?)?),
            None => self.existing_api_key_json(provider_key)?,
        };

        self.conn.execute(
            "INSERT INTO ai_provider_settings (provider, enabled, display_name, model, response_mode, api_key_json, endpoint)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
             ON CONFLICT(provider) DO UPDATE SET
                enabled = excluded.enabled,
                display_name = excluded.display_name,
                model = excluded.model,
                response_mode = excluded.response_mode,
                api_key_json = COALESCE(excluded.api_key_json, ai_provider_settings.api_key_json),
                endpoint = excluded.endpoint",
            params![
                provider_key,
                request.enabled,
                display_name,
                request.model,
                response_mode_key(request.response_mode),
                api_key_json,
                request.endpoint
            ],
        )?;

        Ok(AiProviderSettings {
            provider: request.provider,
            enabled: request.enabled,
            display_name,
            model: request.model.clone(),
            response_mode: request.response_mode,
            api_key_configured: self.existing_api_key_json(provider_key)?.is_some(),
            endpoint: request.endpoint.clone(),
            models: model_options(request.provider),
            limit_note: provider_limit_note(request.provider).to_string(),
        })
    }

    pub fn reveal_ai_provider_key(&self, provider: AiProvider) -> StorageResult<Option<String>> {
        let Some(json) = self.existing_api_key_json(provider_key(provider))? else {
            return Ok(None);
        };
        let secret: ProtectedSecret = serde_json::from_str(&json)?;
        Ok(Some(reveal_secret(&secret)?))
    }

    pub fn provider_checks(&self) -> StorageResult<Vec<AiProviderCheck>> {
        Ok(self
            .list_ai_providers()?
            .iter()
            .map(check_provider)
            .collect())
    }

    pub fn load_ai_profile(&self) -> StorageResult<AiProfile> {
        let profile_json = self.conn.query_row(
            "SELECT profile_json FROM ai_profile WHERE id = 1",
            [],
            |row| row.get::<_, String>(0),
        );
        match profile_json {
            Ok(json) => Ok(serde_json::from_str(&json)?),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(AiProfile::default()),
            Err(error) => Err(error.into()),
        }
    }

    pub fn save_ai_profile(&self, profile: &AiProfile) -> StorageResult<AiProfile> {
        let json = serde_json::to_string(profile)?;
        self.conn.execute(
            "INSERT INTO ai_profile (id, profile_json, updated_at)
             VALUES (1, ?1, CURRENT_TIMESTAMP)
             ON CONFLICT(id) DO UPDATE SET profile_json = excluded.profile_json, updated_at = CURRENT_TIMESTAMP",
            params![json],
        )?;
        Ok(profile.clone())
    }

    pub fn save_app_state_snapshot(&self, snapshot: &serde_json::Value) -> StorageResult<()> {
        let json = serde_json::to_string(snapshot)?;
        let protected = protect_secret(&json)?;
        let protected_json = serde_json::to_string(&protected)?;
        self.conn.execute(
            "INSERT INTO app_state_snapshot (id, protected_json, updated_at)
             VALUES (1, ?1, CURRENT_TIMESTAMP)
             ON CONFLICT(id) DO UPDATE SET protected_json = excluded.protected_json, updated_at = CURRENT_TIMESTAMP",
            params![protected_json],
        )?;
        Ok(())
    }

    pub fn load_app_state_snapshot(&self) -> StorageResult<Option<serde_json::Value>> {
        let protected_json = self.conn.query_row(
            "SELECT protected_json FROM app_state_snapshot WHERE id = 1",
            [],
            |row| row.get::<_, String>(0),
        );
        let protected_json = match protected_json {
            Ok(json) => json,
            Err(rusqlite::Error::QueryReturnedNoRows) => return Ok(None),
            Err(error) => return Err(error.into()),
        };
        let protected: ProtectedSecret = serde_json::from_str(&protected_json)?;
        let json = reveal_secret(&protected)?;
        Ok(Some(serde_json::from_str(&json)?))
    }

    fn existing_api_key_json(&self, provider_key: &str) -> StorageResult<Option<String>> {
        let result = self.conn.query_row(
            "SELECT api_key_json FROM ai_provider_settings WHERE provider = ?1",
            params![provider_key],
            |row| row.get::<_, Option<String>>(0),
        );
        match result {
            Ok(value) => Ok(value),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(error) => Err(error.into()),
        }
    }

    fn migrate(&self) -> StorageResult<()> {
        self.conn.execute_batch(
            "
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS action_audit_events (
                event_id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                required_tier TEXT NOT NULL,
                decision TEXT NOT NULL,
                outcome TEXT NOT NULL,
                origin TEXT,
                payload_json TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_action_audit_events_timestamp
                ON action_audit_events(timestamp DESC);

            CREATE INDEX IF NOT EXISTS idx_action_audit_events_origin
                ON action_audit_events(origin);

            CREATE TABLE IF NOT EXISTS search_documents (
                id TEXT PRIMARY KEY,
                kind TEXT NOT NULL,
                title TEXT NOT NULL,
                url TEXT,
                source TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                payload_json TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_search_documents_kind
                ON search_documents(kind);

            CREATE INDEX IF NOT EXISTS idx_search_documents_updated_at
                ON search_documents(updated_at DESC);

            CREATE TABLE IF NOT EXISTS ai_provider_settings (
                provider TEXT PRIMARY KEY,
                enabled INTEGER NOT NULL,
                display_name TEXT NOT NULL,
                model TEXT NOT NULL,
                response_mode TEXT NOT NULL DEFAULT 'fast',
                api_key_json TEXT,
                endpoint TEXT,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS ai_profile (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                profile_json TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS app_state_snapshot (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                protected_json TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            INSERT OR IGNORE INTO schema_migrations(version) VALUES (1);
            ",
        )?;
        self.ensure_column(
            "ai_provider_settings",
            "response_mode",
            "ALTER TABLE ai_provider_settings ADD COLUMN response_mode TEXT NOT NULL DEFAULT 'fast'",
        )?;
        Ok(())
    }

    fn ensure_column(&self, table: &str, column: &str, alter_sql: &str) -> StorageResult<()> {
        let mut stmt = self.conn.prepare(&format!("PRAGMA table_info({table})"))?;
        let columns = stmt.query_map([], |row| row.get::<_, String>(1))?;
        for existing in columns {
            if existing? == column {
                return Ok(());
            }
        }
        self.conn.execute(alter_sql, [])?;
        Ok(())
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Eq, PartialEq)]
pub struct StorageStats {
    pub schema_version: u32,
    pub audit_events: u64,
    pub search_documents: u64,
}

fn provider_key(provider: AiProvider) -> &'static str {
    match provider {
        AiProvider::OpenAi => "open_ai",
        AiProvider::Claude => "claude",
        AiProvider::Gemini => "gemini",
        AiProvider::Local => "local",
    }
}

fn parse_provider(provider: &str) -> Option<AiProvider> {
    match provider {
        "open_ai" => Some(AiProvider::OpenAi),
        "claude" => Some(AiProvider::Claude),
        "gemini" => Some(AiProvider::Gemini),
        "local" => Some(AiProvider::Local),
        _ => None,
    }
}

fn response_mode_key(mode: AiResponseMode) -> &'static str {
    match mode {
        AiResponseMode::Fast => "fast",
        AiResponseMode::Thinking => "thinking",
    }
}

fn parse_response_mode(mode: &str) -> AiResponseMode {
    match mode {
        "thinking" => AiResponseMode::Thinking,
        _ => AiResponseMode::Fast,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use agent_protocol::{BrowserAction, PermissionTier};
    use browser_policy::{ActionOutcome, PolicyDecision};
    use chrono::Utc;
    use search_core::DocumentKind;
    use uuid::Uuid;

    #[test]
    fn stores_and_reads_audit_events() {
        let storage = BrowserStorage::open_memory().unwrap();
        let event = ActionAuditEvent {
            event_id: Uuid::new_v4(),
            plan_id: None,
            timestamp: Utc::now(),
            action: BrowserAction::ReadPage {
                tab_id: "tab".to_string(),
            },
            required_tier: PermissionTier::ReadOnly,
            decision: PolicyDecision::Allow,
            outcome: ActionOutcome::Allowed,
            origin: Some("https://example.com".to_string()),
            target_description: "Read page".to_string(),
        };

        storage.append_audit_event(&event).unwrap();
        let events = storage.latest_audit_events(10).unwrap();

        assert_eq!(events.len(), 1);
        assert_eq!(events[0].event_id, event.event_id);
    }

    #[test]
    fn upserts_search_documents() {
        let storage = BrowserStorage::open_memory().unwrap();
        let document = SearchDocument {
            id: "bookmark:1".to_string(),
            kind: DocumentKind::Bookmark,
            title: "Aero Architecture".to_string(),
            url: Some("https://aero.internal/docs".to_string()),
            body: "Rust backend and Chromium shell".to_string(),
            tags: vec!["browser".to_string()],
            source: "test".to_string(),
            updated_at: Utc::now(),
        };

        storage.upsert_search_document(&document).unwrap();
        storage.upsert_search_document(&document).unwrap();
        let documents = storage.all_search_documents().unwrap();

        assert_eq!(documents.len(), 1);
        assert_eq!(documents[0].id, "bookmark:1");
    }

    #[test]
    fn saves_ai_provider_without_plaintext_key() {
        let storage = BrowserStorage::open_memory().unwrap();
        let saved = storage
            .save_ai_provider(&AiProviderSetupRequest {
                provider: AiProvider::OpenAi,
                enabled: true,
                model: "gpt-4.1-mini".to_string(),
                response_mode: AiResponseMode::Fast,
                api_key: Some("sk-secret".to_string()),
                endpoint: None,
            })
            .unwrap();

        assert!(saved.api_key_configured);
        let checks = storage.provider_checks().unwrap();
        let openai = checks
            .iter()
            .find(|check| check.provider == AiProvider::OpenAi)
            .unwrap();
        assert!(openai.ready);
    }

    #[test]
    fn saves_ai_profile() {
        let storage = BrowserStorage::open_memory().unwrap();
        let profile = AiProfile {
            selected_provider: AiProvider::Local,
            response_mode: AiResponseMode::Thinking,
            manual_mode: false,
            allow_cloud_ai: false,
            allow_page_reading: true,
            allow_action_execution: true,
            require_confirmation_for_actions: true,
        };

        storage.save_ai_profile(&profile).unwrap();
        assert_eq!(
            storage.load_ai_profile().unwrap().selected_provider,
            AiProvider::Local
        );
    }
}
