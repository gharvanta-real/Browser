use agent_protocol::{BrowserAction, PermissionTier};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StandingPermission {
    pub origin: String,
    pub max_tier: PermissionTier,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SafetyPolicy {
    pub max_automatic_tier: PermissionTier,
    pub standing_permissions: Vec<StandingPermission>,
    pub actions_per_minute_per_origin: u16,
    pub require_biometric_for_sensitive: bool,
}

impl Default for SafetyPolicy {
    fn default() -> Self {
        Self {
            max_automatic_tier: PermissionTier::NonSensitiveInput,
            standing_permissions: Vec::new(),
            actions_per_minute_per_origin: 30,
            require_biometric_for_sensitive: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionEvaluation {
    pub action_id: Uuid,
    pub required_tier: PermissionTier,
    pub decision: PolicyDecision,
    pub confirmation_required: bool,
    pub biometric_required: bool,
    pub reason: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PolicyDecision {
    Allow,
    RequireConfirmation,
    Block,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ActionOutcome {
    Planned,
    Allowed,
    Denied,
    Blocked,
    Succeeded,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionAuditEvent {
    pub event_id: Uuid,
    pub plan_id: Option<Uuid>,
    pub timestamp: DateTime<Utc>,
    pub action: BrowserAction,
    pub required_tier: PermissionTier,
    pub decision: PolicyDecision,
    pub outcome: ActionOutcome,
    pub origin: Option<String>,
    pub target_description: String,
}

impl SafetyPolicy {
    pub fn evaluate(&self, action: &BrowserAction, origin: Option<&str>) -> ActionEvaluation {
        let required_tier = action.required_tier();
        let action_id = Uuid::new_v4();

        if self.is_blocked(action) {
            return ActionEvaluation {
                action_id,
                required_tier,
                decision: PolicyDecision::Block,
                confirmation_required: false,
                biometric_required: false,
                reason: "Action violates browser safety policy.".to_string(),
            };
        }

        if required_tier >= PermissionTier::Transaction {
            return ActionEvaluation {
                action_id,
                required_tier,
                decision: PolicyDecision::RequireConfirmation,
                confirmation_required: true,
                biometric_required: self.require_biometric_for_sensitive,
                reason: "Tier 4/5 actions can never be fully automatic.".to_string(),
            };
        }

        if required_tier == PermissionTier::SensitiveInput {
            return ActionEvaluation {
                action_id,
                required_tier,
                decision: PolicyDecision::RequireConfirmation,
                confirmation_required: true,
                biometric_required: self.require_biometric_for_sensitive,
                reason: "Sensitive field input requires explicit user confirmation.".to_string(),
            };
        }

        if self.has_standing_permission(origin, required_tier)
            || required_tier <= self.max_automatic_tier
        {
            return ActionEvaluation {
                action_id,
                required_tier,
                decision: PolicyDecision::Allow,
                confirmation_required: false,
                biometric_required: false,
                reason: "Action is within automatic permission tier.".to_string(),
            };
        }

        ActionEvaluation {
            action_id,
            required_tier,
            decision: PolicyDecision::RequireConfirmation,
            confirmation_required: true,
            biometric_required: false,
            reason: "Action exceeds automatic permission tier.".to_string(),
        }
    }

    pub fn audit_event(
        &self,
        action: BrowserAction,
        evaluation: &ActionEvaluation,
        origin: Option<String>,
        target_description: String,
    ) -> ActionAuditEvent {
        ActionAuditEvent {
            event_id: Uuid::new_v4(),
            plan_id: None,
            timestamp: Utc::now(),
            required_tier: evaluation.required_tier,
            decision: evaluation.decision,
            outcome: match evaluation.decision {
                PolicyDecision::Allow => ActionOutcome::Allowed,
                PolicyDecision::RequireConfirmation => ActionOutcome::Planned,
                PolicyDecision::Block => ActionOutcome::Blocked,
            },
            action,
            origin,
            target_description,
        }
    }

    fn has_standing_permission(&self, origin: Option<&str>, required_tier: PermissionTier) -> bool {
        let Some(origin) = origin else {
            return false;
        };
        let now = Utc::now();
        self.standing_permissions.iter().any(|permission| {
            permission.origin == origin
                && permission.max_tier >= required_tier
                && permission.expires_at.is_none_or(|expires| expires > now)
                && permission.max_tier < PermissionTier::Transaction
        })
    }

    fn is_blocked(&self, action: &BrowserAction) -> bool {
        match action {
            BrowserAction::Navigate { url, .. } => is_dangerous_url(url),
            BrowserAction::TypeText { text, .. } => looks_like_secret_exfiltration(text),
            BrowserAction::ConfirmTransaction { description, .. } => {
                looks_like_mass_abuse(description)
            }
            _ => false,
        }
    }
}

fn is_dangerous_url(url: &str) -> bool {
    let lower = url.to_lowercase();
    lower.starts_with("javascript:")
        || lower.starts_with("data:")
        || lower.starts_with("file:")
        || lower.contains("localhost:9222")
}

fn looks_like_secret_exfiltration(text: &str) -> bool {
    let lower = text.to_lowercase();
    lower.contains("password=") || lower.contains("api_key=") || lower.contains("secret_key=")
}

fn looks_like_mass_abuse(text: &str) -> bool {
    let lower = text.to_lowercase();
    lower.contains("mass account")
        || lower.contains("spam")
        || lower.contains("captcha bypass")
        || lower.contains("scrape every")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tier_four_always_requires_confirmation() {
        let policy = SafetyPolicy::default();
        let action = BrowserAction::ConfirmTransaction {
            description: "Place order".to_string(),
            amount: Some("100".to_string()),
            payee: Some("Store".to_string()),
        };

        let evaluation = policy.evaluate(&action, Some("https://store.example"));

        assert_eq!(evaluation.decision, PolicyDecision::RequireConfirmation);
        assert!(evaluation.confirmation_required);
    }

    #[test]
    fn dangerous_navigation_is_blocked() {
        let policy = SafetyPolicy::default();
        let action = BrowserAction::Navigate {
            tab_id: "tab".to_string(),
            url: "javascript:alert(1)".to_string(),
        };

        let evaluation = policy.evaluate(&action, None);

        assert_eq!(evaluation.decision, PolicyDecision::Block);
    }
}
