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

pub fn production_readiness_report() -> FeatureReadinessReport {
    FeatureReadinessReport {
        summary: "Backend and Electron shell now cover core contracts plus Chromium webview hosting, session restore, native download controls, AI page snapshots, policy-gated action compilation, and renderer-to-native input dispatch. DPAPI, Windows Hello, SmartScreen, encrypted stores, extension isolation, and enterprise policy remain required for production."
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
                "Local index and query API exist for history/bookmarks/tabs-style data.",
                &["custom engine shortcuts", "calculator/inline answers", "certificate security details", "AI intent ranking"],
            ),
            item(
                BrowserFeatureArea::NavigationHistory,
                "7.3",
                FeatureStatus::Partial,
                "History can be indexed/searchable and frontend navigation changes are captured into persisted local history.",
                &["encrypted SQLite history store", "granular clearing", "thumbnail navigation previews", "sync conflict handling"],
            ),
            item(
                BrowserFeatureArea::BookmarksReadingList,
                "7.4",
                FeatureStatus::Partial,
                "Bookmark and reading-list documents can be indexed.",
                &["folder mutation APIs", "sync encryption", "AI summaries pipeline"],
            ),
            item(
                BrowserFeatureArea::Downloads,
                "7.5",
                FeatureStatus::Partial,
                "Electron session download events feed the downloads UI with native pause, resume, cancel, open, and show-in-folder controls.",
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
                FeatureStatus::Partial,
                "Credential records are stored through backend APIs with DPAPI/protected local secrets, and the password manager UI can save, list, reveal, copy, and delete vault entries without seeded mock passwords.",
                &["Windows Hello integration", "passkey/WebAuthn store", "breach-check API", "autofill capture/fill pipeline"],
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
                FeatureStatus::ContractOnly,
                "Privacy retention and data class rules exist.",
                &["profile-isolated stores", "encrypted blob sync", "account opt-in model"],
            ),
            item(
                BrowserFeatureArea::AiPageReading,
                "10.1, 14.2",
                FeatureStatus::Partial,
                "Privacy policy supports cloud/local decisions; the Electron shell captures active page title, text, headings, links, forms, and visible interactive controls; Security Center shows the last AI context disclosure with redacted command previews.",
                &["native Chromium AXTree connector", "screenshot OCR pipeline", "prompt-injection classifier", "server-side disclosure export"],
            ),
            item(
                BrowserFeatureArea::AiActionExecution,
                "10.4, 13",
                FeatureStatus::Partial,
                "Agent actions, backend goal-to-command planning, autofill profile planning, permission tiers, audit events, CDP compilation, Electron native input/key dispatch, sequential natural-language commands, form-aware field matching, live cursor/typing visualization, settings gates, interrupt/stop control, durable local action history, replace-on-fill, and label-to-coordinate element resolution are wired for navigation/click/fill/key/scroll primitives.",
                &["native Chromium AXTree API integration", "multi-step model planner/tool loop", "rollback/retry model", "server-side action history export"],
            ),
            item(
                BrowserFeatureArea::PermissionsTrust,
                "13",
                FeatureStatus::Partial,
                "SafetyPolicy enforces Tier 3/4/5 confirmation rules.",
                &["non-bypassable native modal", "Windows Hello attestation", "standing permission UI"],
            ),
            item(
                BrowserFeatureArea::PrivacyDataHandling,
                "14",
                FeatureStatus::Partial,
                "Data classes and cloud/local handling decisions are implemented; browser state snapshots, AI secrets, and password vault secrets use protected storage/DPAPI where available.",
                &["export/delete flows", "what-was-sent inspector", "per-profile key rotation"],
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
