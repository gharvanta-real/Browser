use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct BrowserProfile {
    pub id: Uuid,
    pub display_name: String,
    pub kind: ProfileKind,
    pub storage_policy: ProfileStoragePolicy,
    pub ai_policy: ProfileAiPolicy,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ProfileKind {
    Personal,
    Work,
    Guest,
    Private,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct ProfileStoragePolicy {
    pub encrypted_at_rest: bool,
    pub sync_enabled: bool,
    pub sync_backend: SyncBackend,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum SyncBackend {
    None,
    LocalOnly,
    UserCloudBlob,
    BrowserAccount,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct ProfileAiPolicy {
    pub cloud_ai_enabled: bool,
    pub local_only_mode: bool,
    pub persist_conversations: bool,
    pub persist_agent_memory: bool,
    pub blocked_ai_origins: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct BrowserWindow {
    pub id: Uuid,
    pub profile_id: Uuid,
    pub active_tab_id: Option<Uuid>,
    pub split_view: Option<SplitView>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct BrowserTab {
    pub id: Uuid,
    pub window_id: Uuid,
    pub profile_id: Uuid,
    pub workspace_id: Uuid,
    pub title: String,
    pub url: String,
    pub origin: Option<String>,
    pub pinned: bool,
    pub hibernated: bool,
    pub scroll_y: u32,
    pub last_active_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct SplitView {
    pub left_tab_id: Uuid,
    pub right_tab_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct Workspace {
    pub id: Uuid,
    pub profile_id: Uuid,
    pub name: String,
    pub color: String,
    pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct Bookmark {
    pub id: Uuid,
    pub profile_id: Uuid,
    pub folder_id: Option<Uuid>,
    pub title: String,
    pub url: String,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct HistoryEntry {
    pub id: Uuid,
    pub profile_id: Uuid,
    pub title: String,
    pub url: String,
    pub origin: String,
    pub visit_started_at: DateTime<Utc>,
    pub visit_duration_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct DownloadItem {
    pub id: Uuid,
    pub profile_id: Uuid,
    pub source_url: String,
    pub target_path: String,
    pub total_bytes: u64,
    pub downloaded_bytes: u64,
    pub state: DownloadState,
    pub safety_state: DownloadSafetyState,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DownloadState {
    Queued,
    Downloading,
    Paused,
    Completed,
    Cancelled,
    Failed,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DownloadSafetyState {
    Unknown,
    Scanning,
    Safe,
    Suspicious,
    BlockedMalware,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct ContentBlockingPolicy {
    pub mode: BlockingMode,
    pub per_origin_overrides: HashMap<String, BlockingMode>,
    pub ruleset_version: String,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum BlockingMode {
    Disabled,
    Standard,
    Strict,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct BrowserSettings {
    pub default_search_engine: String,
    pub https_first_mode: bool,
    pub safe_browsing_enabled: bool,
    pub telemetry_enabled: bool,
    pub crash_reporting_enabled: bool,
    pub action_log_retention_days: u16,
    pub content_blocking: ContentBlockingPolicy,
}
