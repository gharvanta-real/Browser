use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
#[serde(rename_all = "snake_case")]
pub enum PermissionTier {
    ReadOnly = 0,
    Navigate = 1,
    NonSensitiveInput = 2,
    SensitiveInput = 3,
    Transaction = 4,
    ExternalSideEffect = 5,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum BrowserAction {
    ReadPage {
        tab_id: String,
    },
    Navigate {
        tab_id: String,
        url: String,
    },
    Click {
        tab_id: String,
        ax_node_id: String,
        label: String,
    },
    TypeText {
        tab_id: String,
        ax_node_id: String,
        label: String,
        text: String,
        sensitive: bool,
    },
    Extract {
        tab_id: String,
        schema: serde_json::Value,
    },
    ConfirmTransaction {
        description: String,
        amount: Option<String>,
        payee: Option<String>,
    },
    ChangeAccountSetting {
        tab_id: String,
        setting_name: String,
        new_value_summary: String,
        irreversible: bool,
    },
}

impl BrowserAction {
    pub fn required_tier(&self) -> PermissionTier {
        match self {
            BrowserAction::ReadPage { .. } | BrowserAction::Extract { .. } => {
                PermissionTier::ReadOnly
            }
            BrowserAction::Navigate { .. } | BrowserAction::Click { .. } => {
                PermissionTier::Navigate
            }
            BrowserAction::TypeText {
                sensitive: false, ..
            } => PermissionTier::NonSensitiveInput,
            BrowserAction::TypeText {
                sensitive: true, ..
            } => PermissionTier::SensitiveInput,
            BrowserAction::ConfirmTransaction { .. } => PermissionTier::Transaction,
            BrowserAction::ChangeAccountSetting { .. } => PermissionTier::ExternalSideEffect,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentPlanRequest {
    pub tab_id: String,
    pub user_goal: String,
    pub page_summary: Option<String>,
    pub max_allowed_tier: PermissionTier,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentPlan {
    pub plan_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub user_goal: String,
    pub max_required_tier: PermissionTier,
    pub needs_user_confirmation: bool,
    pub steps: Vec<AgentStep>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentStep {
    pub step_id: Uuid,
    pub action: BrowserAction,
    pub rationale: String,
    pub required_tier: PermissionTier,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionDecision {
    pub plan_id: Uuid,
    pub approved: bool,
    pub approved_tier: PermissionTier,
    pub biometric_verified: bool,
    pub decided_at: DateTime<Utc>,
}
