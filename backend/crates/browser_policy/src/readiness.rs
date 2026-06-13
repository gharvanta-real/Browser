use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum FeatureStatus {
    NotStarted,
    ContractOnly,
    Partial,
    ProductionReady,
    NativeDependency,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum BrowserFeatureArea {
    TabsWindowManagement,
    OmniboxSearch,
    NavigationHistory,
    BookmarksReadingList,
    Downloads,
    PrivacyBlocking,
    Security,
    PasswordIdentity,
    MediaPdf,
    SyncProfiles,
    Customization,
    DeveloperTools,
    AiPageReading,
    AiActionExecution,
    PermissionsTrust,
    PrivacyDataHandling,
    TelemetryReliability,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureReadiness {
    pub area: BrowserFeatureArea,
    pub prd_section: String,
    pub status: FeatureStatus,
    pub backend_scope: String,
    pub missing_for_production: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureReadinessReport {
    pub summary: String,
    pub items: Vec<FeatureReadiness>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct QaStatus {
    pub is_db_encrypted: bool,
    pub is_db_profile_isolated: bool,
    pub passwords_encrypted: bool,
    pub state_snapshot_encrypted: bool,
    pub rate_limiter_active: bool,
}

pub fn production_readiness_report(qa: &QaStatus) -> FeatureReadinessReport {
    FeatureReadinessReport {
        summary: "Backend and Electron shell now cover core contracts plus Chromium webview hosting, session restore, native download controls with risky file warnings, local search indexing/query and omnibox suggestions, encrypted password/autofill profile storage, native Chromium AXTree capture for AI target resolution, AI provider setup/completion with fallback routing, AI page snapshots with prompt-injection context guard, policy-gated action compilation, action retry/verification signals, and renderer-to-native input dispatch. DPAPI-backed storage is active; Windows Hello, SmartScreen, extension isolation, and enterprise policy remain required for production."
            .to_string(),
        items: vec![
            item(
                BrowserFeatureArea::TabsWindowManagement,
                "7.1",
                FeatureStatus::Partial,
                "Tabs/workspaces are represented in app state and persisted for crash/startup restore in the Electron shell.",
                &["encrypted session store", "full crash restore with per-tab scroll/form state", "hibernation snapshots", "multi-window native host"],
            ),
            item(
                BrowserFeatureArea::OmniboxSearch,
                "7.2",
                FeatureStatus::Partial,
                "Local index/query API exists for history, bookmarks, tabs, reading list, and downloads; frontend state syncs searchable documents to the backend, the Search page consumes backend-ranked results, and the omnibox shows backend local suggestions.",
                &["custom engine shortcuts", "calculator/inline answers", "certificate security details", "AI intent ranking"],
            ),
            item(
                BrowserFeatureArea::NavigationHistory,
                "7.3",
                if qa.is_db_encrypted { FeatureStatus::Partial } else { FeatureStatus::ContractOnly },
                "History is indexable/searchable, and frontend navigation changes are captured into a DPAPI-encrypted persistent local history store.",
                if qa.is_db_encrypted {
                    &["granular clearing", "thumbnail navigation previews", "sync conflict handling"]
                } else {
                    &["encrypted SQLite history store", "granular clearing", "thumbnail navigation previews", "sync conflict handling"]
                },
            ),
            item(
                BrowserFeatureArea::BookmarksReadingList,
                "7.4",
                if qa.is_db_encrypted { FeatureStatus::Partial } else { FeatureStatus::ContractOnly },
                "Bookmark and reading-list documents are indexable/searchable and persisted in a DPAPI-encrypted local store.",
                if qa.is_db_encrypted {
                    &["folder mutation APIs", "sync encryption", "AI summaries pipeline"]
                } else {
                    &["encrypted bookmark store", "folder mutation APIs", "sync encryption", "AI summaries pipeline"]
                },
            ),
            item(
                BrowserFeatureArea::Downloads,
                "7.5",
                FeatureStatus::Partial,
                "Electron session download events feed the downloads UI with native pause, resume, cancel, open, show-in-folder controls, and native warnings before keeping executable/script file types.",
                &["retry manager", "SmartScreen integration", "per file-type routing", "dangerous file quarantine"],
            ),
            item(
                BrowserFeatureArea::PrivacyBlocking,
                "7.6",
                FeatureStatus::Partial,
                "Electron session blocks a starter set of known tracker/ad hosts through webRequest and reports blocked counters to the shell.",
                &["maintained filter lists", "per-site exceptions", "privacy report details", "cosmetic filtering"],
            ),
            item(
                BrowserFeatureArea::Security,
                "7.7, 15",
                FeatureStatus::Partial,
                "Safety policy blocks dangerous browser actions, Electron shows native confirmation for gated actions, and renderer only reaches guest input through preload IPC.",
                &["Chromium site isolation hardening", "safe browsing lists", "certificate inspector", "process sandbox review"],
            ),
            item(
                BrowserFeatureArea::PasswordIdentity,
                "7.8",
                if qa.passwords_encrypted { FeatureStatus::Partial } else { FeatureStatus::ContractOnly },
                "Credential records and autofill identity profiles are stored through backend APIs with DPAPI/protected local secrets; password manager UI can save, list, reveal, copy, and delete vault entries; address settings save to the protected backend profile; AI/user login fills can offer to save detected credentials.",
                if qa.passwords_encrypted {
                    &["Windows Hello integration", "passkey/WebAuthn store", "breach-check API", "multi-profile autofill records"]
                } else {
                    &["DPAPI credentials store", "Windows Hello integration", "passkey/WebAuthn store", "breach-check API", "multi-profile autofill records"]
                },
            ),
            item(
                BrowserFeatureArea::MediaPdf,
                "7.9",
                FeatureStatus::NativeDependency,
                "Requires Chromium/PDFium/native media stack.",
                &["PDFium viewer", "Widevine", "PiP", "Windows media controls"],
            ),
            item(
                BrowserFeatureArea::SyncProfiles,
                "7.10",
                if qa.is_db_profile_isolated { FeatureStatus::Partial } else { FeatureStatus::ContractOnly },
                "Privacy retention and data class rules exist, and SQLite storage is isolated within user profile directories.",
                if qa.is_db_profile_isolated {
                    &["encrypted blob sync", "account opt-in model"]
                } else {
                    &["profile-isolated stores", "encrypted blob sync", "account opt-in model"]
                },
            ),
            item(
                BrowserFeatureArea::AiPageReading,
                "10.1, 14.2",
                FeatureStatus::Partial,
                "Privacy policy supports cloud/local decisions; AI provider setup, provider response checks, provider-routed completion APIs, fallback provider routing, and heuristic prompt-injection context blocking are wired; the Electron shell captures active page title, text, headings, links, forms, visible DOM controls, and native Chromium AXTree roles/names/bounds for interactive controls; Security Center shows the last AI context disclosure with redacted command previews.",
                &["iframe/shadow-root AX coverage hardening", "screenshot OCR pipeline", "model-based prompt-injection classifier", "server-side disclosure export"],
            ),
            item(
                BrowserFeatureArea::AiActionExecution,
                "10.4, 13",
                FeatureStatus::Partial,
                "Agent actions, backend goal-to-command planning, strict JSON model-planner fallback, autofill profile planning, permission tiers, audit events, CDP compilation, Electron native input/key dispatch, sequential natural-language commands, native AXTree-backed field matching, live cursor/typing visualization, settings gates, interrupt/stop control, durable local action history, replace-on-fill, one-shot retry on resolved target failures, action verification signals, and label-to-coordinate element resolution are wired for navigation/click/fill/key/scroll primitives.",
                &["multi-frame AX target arbitration", "multi-step observe/act/verify model loop", "rollback model", "server-side action history export"],
            ),
            item(
                BrowserFeatureArea::PermissionsTrust,
                "13",
                FeatureStatus::Partial,
                "SafetyPolicy enforces Tier 3/4/5 confirmation rules; Electron prompts for sensitive site permissions and Security Center records/reset site permission decisions.",
                &["Windows Hello attestation", "persistent per-site permission backend", "enterprise standing permission policy"],
            ),
            item(
                BrowserFeatureArea::PrivacyDataHandling,
                "14",
                if qa.state_snapshot_encrypted { FeatureStatus::Partial } else { FeatureStatus::ContractOnly },
                "Data classes and cloud/local handling decisions are implemented; browser state snapshots, AI secrets, history, bookmarks, reading lists, and password vault secrets use protected storage/DPAPI.",
                if qa.state_snapshot_encrypted {
                    &["export/delete flows", "what-was-sent inspector", "per-profile key rotation"]
                } else {
                    &["encrypted state snapshot store", "export/delete flows", "what-was-sent inspector", "per-profile key rotation"]
                },
            ),
            item(
                BrowserFeatureArea::TelemetryReliability,
                "18",
                FeatureStatus::ContractOnly,
                "TelemetryMetric data class prevents page content telemetry by policy.",
                &["crash reporter", "perf regression gates", "agent auto-restart supervisor"],
            ),
        ],
    }
}

fn item(
    area: BrowserFeatureArea,
    prd_section: &str,
    status: FeatureStatus,
    backend_scope: &str,
    missing: &[&str],
) -> FeatureReadiness {
    FeatureReadiness {
        area,
        prd_section: prd_section.to_string(),
        status,
        backend_scope: backend_scope.to_string(),
        missing_for_production: missing.iter().map(|entry| entry.to_string()).collect(),
    }
}
