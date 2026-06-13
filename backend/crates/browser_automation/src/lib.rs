use agent_protocol::{BrowserAction, PermissionTier};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationRequest {
    pub command: AutomationCommand,
    pub origin: Option<String>,
    pub user_visible_reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AutomationCommand {
    OpenPage {
        tab_id: Option<String>,
        url: String,
    },
    Click {
        tab_id: String,
        target: InteractionTarget,
        button: MouseButton,
    },
    Fill {
        tab_id: String,
        target: InteractionTarget,
        text: String,
        sensitive: bool,
    },
    KeyPress {
        tab_id: String,
        key: String,
        modifiers: Vec<KeyModifier>,
    },
    Scroll {
        tab_id: String,
        delta_x: i32,
        delta_y: i32,
    },
    ReadAccessibilityTree {
        tab_id: String,
    },
    CaptureScreenshot {
        tab_id: String,
        redact_sensitive: bool,
    },
    AddNetworkIntercept {
        rule: NetworkInterceptRule,
    },
    RemoveNetworkIntercept {
        rule_id: Uuid,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "target_type", rename_all = "snake_case")]
pub enum InteractionTarget {
    AccessibilityNode {
        ax_node_id: String,
        label: String,
    },
    Coordinates {
        x: i32,
        y: i32,
        frame_id: Option<String>,
        label: String,
    },
}

impl InteractionTarget {
    pub fn label(&self) -> &str {
        match self {
            InteractionTarget::AccessibilityNode { label, .. }
            | InteractionTarget::Coordinates { label, .. } => label,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MouseButton {
    Left,
    Middle,
    Right,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum KeyModifier {
    Alt,
    Control,
    Meta,
    Shift,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterceptRule {
    pub id: Uuid,
    pub url_pattern: String,
    pub resource_types: Vec<ResourceType>,
    pub action: InterceptAction,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ResourceType {
    Document,
    Script,
    Stylesheet,
    Image,
    Media,
    Font,
    Xhr,
    Fetch,
    WebSocket,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum InterceptAction {
    Block,
    Continue,
    AddHeaders {
        headers: Vec<HeaderMutation>,
    },
    MockResponse {
        status: u16,
        content_type: String,
        body: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeaderMutation {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationEvaluation {
    pub command_id: Uuid,
    pub required_tier: PermissionTier,
    pub native_executor_required: bool,
    pub safe_to_queue: bool,
    pub reason: String,
    pub mapped_action: Option<BrowserAction>,
}

#[derive(Debug, thiserror::Error)]
pub enum AutomationValidationError {
    #[error("unsafe URL scheme is not allowed")]
    UnsafeUrl,
    #[error("network intercept rule is too broad for automatic execution")]
    BroadIntercept,
    #[error("mock response cannot be used for document navigations")]
    MockDocumentNavigation,
    #[error("command requires a visible user reason")]
    MissingReason,
}

pub fn evaluate_automation(
    request: AutomationRequest,
) -> Result<AutomationEvaluation, AutomationValidationError> {
    if request.user_visible_reason.trim().is_empty() {
        return Err(AutomationValidationError::MissingReason);
    }

    let command_id = Uuid::new_v4();
    let mapped_action = map_to_browser_action(&request.command)?;
    let required_tier = mapped_action
        .as_ref()
        .map(BrowserAction::required_tier)
        .unwrap_or(PermissionTier::ReadOnly);

    Ok(AutomationEvaluation {
        command_id,
        required_tier,
        native_executor_required: true,
        safe_to_queue: true,
        reason: "Validated for native CDP/AXTree executor; no DOM script injection is permitted."
            .to_string(),
        mapped_action,
    })
}

fn map_to_browser_action(
    command: &AutomationCommand,
) -> Result<Option<BrowserAction>, AutomationValidationError> {
    match command {
        AutomationCommand::OpenPage { tab_id, url } => {
            validate_url(url)?;
            Ok(Some(BrowserAction::Navigate {
                tab_id: tab_id.clone().unwrap_or_else(|| "active".to_string()),
                url: url.clone(),
            }))
        }
        AutomationCommand::Click { tab_id, target, .. } => Ok(Some(BrowserAction::Click {
            tab_id: tab_id.clone(),
            ax_node_id: target_identity(target),
            label: target.label().to_string(),
        })),
        AutomationCommand::Fill {
            tab_id,
            target,
            text,
            sensitive,
        } => Ok(Some(BrowserAction::TypeText {
            tab_id: tab_id.clone(),
            ax_node_id: target_identity(target),
            label: target.label().to_string(),
            text: text.clone(),
            sensitive: *sensitive,
        })),
        AutomationCommand::ReadAccessibilityTree { tab_id } => Ok(Some(BrowserAction::ReadPage {
            tab_id: tab_id.clone(),
        })),
        AutomationCommand::CaptureScreenshot { tab_id, .. } => Ok(Some(BrowserAction::ReadPage {
            tab_id: tab_id.clone(),
        })),
        AutomationCommand::AddNetworkIntercept { rule } => {
            validate_intercept_rule(rule)?;
            Ok(None)
        }
        AutomationCommand::RemoveNetworkIntercept { .. }
        | AutomationCommand::KeyPress { .. }
        | AutomationCommand::Scroll { .. } => Ok(None),
    }
}

fn target_identity(target: &InteractionTarget) -> String {
    match target {
        InteractionTarget::AccessibilityNode { ax_node_id, .. } => ax_node_id.clone(),
        InteractionTarget::Coordinates { x, y, frame_id, .. } => {
            format!(
                "coords:{}:{}:{}",
                frame_id.as_deref().unwrap_or("main"),
                x,
                y
            )
        }
    }
}

fn validate_url(url: &str) -> Result<(), AutomationValidationError> {
    let lower = url.to_lowercase();
    if lower.starts_with("javascript:")
        || lower.starts_with("data:")
        || lower.starts_with("file:")
        || lower.starts_with("chrome://")
        || lower.starts_with("devtools://")
    {
        return Err(AutomationValidationError::UnsafeUrl);
    }
    Ok(())
}

fn validate_intercept_rule(rule: &NetworkInterceptRule) -> Result<(), AutomationValidationError> {
    let pattern = rule.url_pattern.trim();
    if pattern == "*" || pattern == "*://*/*" || pattern.len() < 8 {
        return Err(AutomationValidationError::BroadIntercept);
    }
    if rule.resource_types.contains(&ResourceType::Document)
        && matches!(rule.action, InterceptAction::MockResponse { .. })
    {
        return Err(AutomationValidationError::MockDocumentNavigation);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn open_page_maps_to_navigate() {
        let result = evaluate_automation(AutomationRequest {
            command: AutomationCommand::OpenPage {
                tab_id: Some("tab-1".to_string()),
                url: "https://example.com".to_string(),
            },
            origin: Some("https://example.com".to_string()),
            user_visible_reason: "Open requested page".to_string(),
        })
        .unwrap();

        assert_eq!(result.required_tier, PermissionTier::Navigate);
        assert!(result.native_executor_required);
    }

    #[test]
    fn blocks_script_url_navigation() {
        let result = evaluate_automation(AutomationRequest {
            command: AutomationCommand::OpenPage {
                tab_id: None,
                url: "javascript:alert(1)".to_string(),
            },
            origin: None,
            user_visible_reason: "Bad navigation".to_string(),
        });

        assert!(matches!(result, Err(AutomationValidationError::UnsafeUrl)));
    }

    #[test]
    fn broad_intercept_is_rejected() {
        let result = evaluate_automation(AutomationRequest {
            command: AutomationCommand::AddNetworkIntercept {
                rule: NetworkInterceptRule {
                    id: Uuid::new_v4(),
                    url_pattern: "*://*/*".to_string(),
                    resource_types: vec![ResourceType::Script],
                    action: InterceptAction::Block,
                    expires_at: None,
                },
            },
            origin: None,
            user_visible_reason: "Block every script".to_string(),
        });

        assert!(matches!(
            result,
            Err(AutomationValidationError::BroadIntercept)
        ));
    }
}
