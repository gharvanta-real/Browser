use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DataClass {
    PublicPageContent,
    PageContent,
    BrowsingHistory,
    AiConversation,
    AgentMemory,
    Password,
    PaymentCard,
    PersonalIdentity,
    DownloadMetadata,
    TelemetryMetric,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DataUse {
    LocalIndexing,
    LocalAgentPlanning,
    CloudAiRequest,
    Autofill,
    Telemetry,
    Sync,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiDataPolicy {
    pub cloud_ai_enabled: bool,
    pub local_only_mode: bool,
    pub private_mode: bool,
    pub site_ai_disabled: bool,
}

impl Default for AiDataPolicy {
    fn default() -> Self {
        Self {
            cloud_ai_enabled: false,
            local_only_mode: true,
            private_mode: false,
            site_ai_disabled: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyPolicy {
    pub ai: AiDataPolicy,
    pub telemetry_enabled: bool,
    pub action_log_retention_days: u16,
    pub conversation_retention_days: u16,
    pub agent_memory_retention_days: u16,
}

impl Default for PrivacyPolicy {
    fn default() -> Self {
        Self {
            ai: AiDataPolicy::default(),
            telemetry_enabled: false,
            action_log_retention_days: 30,
            conversation_retention_days: 30,
            agent_memory_retention_days: 30,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloudAiDecision {
    pub allowed: bool,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataHandlingDecision {
    pub data_class: DataClass,
    pub data_use: DataUse,
    pub allowed: bool,
    pub local_encryption_required: bool,
    pub windows_hello_required: bool,
    pub cloud_ai: CloudAiDecision,
    pub retention_days: Option<u16>,
}

impl PrivacyPolicy {
    pub fn decide(&self, data_class: DataClass, data_use: DataUse) -> DataHandlingDecision {
        let local_encryption_required = matches!(
            data_class,
            DataClass::BrowsingHistory
                | DataClass::AiConversation
                | DataClass::AgentMemory
                | DataClass::Password
                | DataClass::PaymentCard
                | DataClass::PersonalIdentity
        );

        let windows_hello_required = matches!(
            data_class,
            DataClass::Password | DataClass::PaymentCard | DataClass::PersonalIdentity
        );

        let cloud_ai = self.cloud_ai_decision(data_class);
        let allowed = match (data_class, data_use) {
            (DataClass::Password | DataClass::PaymentCard, DataUse::CloudAiRequest) => false,
            (DataClass::BrowsingHistory, DataUse::CloudAiRequest) => false,
            (DataClass::TelemetryMetric, DataUse::Telemetry) => self.telemetry_enabled,
            (DataClass::PageContent, DataUse::CloudAiRequest) => cloud_ai.allowed,
            (DataClass::PublicPageContent, DataUse::CloudAiRequest) => cloud_ai.allowed,
            (_, DataUse::Autofill) => windows_hello_required,
            _ => true,
        };

        DataHandlingDecision {
            data_class,
            data_use,
            allowed,
            local_encryption_required,
            windows_hello_required,
            cloud_ai,
            retention_days: self.retention_for(data_class),
        }
    }

    fn cloud_ai_decision(&self, data_class: DataClass) -> CloudAiDecision {
        if self.ai.site_ai_disabled {
            return CloudAiDecision {
                allowed: false,
                reason: "AI page reading is disabled for this site.".to_string(),
            };
        }
        if self.ai.local_only_mode || !self.ai.cloud_ai_enabled {
            return CloudAiDecision {
                allowed: false,
                reason: "Cloud AI is disabled; use local model only.".to_string(),
            };
        }
        if self.ai.private_mode {
            return CloudAiDecision {
                allowed: false,
                reason: "Private mode prevents persisted or profile-linked cloud AI requests."
                    .to_string(),
            };
        }
        if matches!(
            data_class,
            DataClass::Password
                | DataClass::PaymentCard
                | DataClass::PersonalIdentity
                | DataClass::BrowsingHistory
        ) {
            return CloudAiDecision {
                allowed: false,
                reason: "Sensitive browser data is never sent to cloud AI.".to_string(),
            };
        }

        CloudAiDecision {
            allowed: true,
            reason: "Cloud AI is enabled for this profile and data class.".to_string(),
        }
    }

    fn retention_for(&self, data_class: DataClass) -> Option<u16> {
        match data_class {
            DataClass::AiConversation => Some(self.conversation_retention_days),
            DataClass::AgentMemory => Some(self.agent_memory_retention_days),
            DataClass::BrowsingHistory | DataClass::DownloadMetadata => {
                Some(self.action_log_retention_days)
            }
            DataClass::Password | DataClass::PaymentCard | DataClass::PersonalIdentity => None,
            _ => Some(self.action_log_retention_days),
        }
    }
}
