use browser_automation::{
    AutomationCommand, HeaderMutation, InteractionTarget, InterceptAction, KeyModifier,
    MouseButton, NetworkInterceptRule, ResourceType,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::net::IpAddr;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::atomic::{AtomicU64, Ordering};
use tungstenite::stream::MaybeTlsStream;
use tungstenite::{Message, WebSocket, connect};
use url::{Host, Url};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CdpCall {
    pub method: String,
    pub params: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CdpResponse {
    pub id: u64,
    pub method: String,
    pub result: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CdpCompileRequest {
    pub command: AutomationCommand,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CdpCompileResponse {
    pub calls: Vec<CdpCall>,
    pub requires_ax_resolution: bool,
    pub notes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CdpExecutionReport {
    pub dry_run: bool,
    pub responses: Vec<CdpResponse>,
}

#[derive(Debug, thiserror::Error)]
pub enum CdpCompileError {
    #[error("accessibility-node target must be resolved to coordinates before input dispatch")]
    NeedsAccessibilityResolution,
    #[error("unsupported key value")]
    UnsupportedKey,
    #[error("invalid network intercept rule")]
    InvalidIntercept,
}

#[derive(Debug, thiserror::Error)]
pub enum CdpExecutionError {
    #[error("CDP compile failed: {0}")]
    Compile(#[from] CdpCompileError),
    #[error("CDP transport failed: {0}")]
    Transport(String),
    #[error("CDP websocket URL must be loopback-only")]
    NonLoopbackUrl,
    #[error("CDP websocket URL is invalid: {0}")]
    InvalidWebSocketUrl(String),
    #[error("CDP response did not include result for call id {0}")]
    MissingResponse(u64),
}

pub trait CdpTransport: Send + Sync {
    fn send(&self, call_id: u64, call: &CdpCall) -> Result<CdpResponse, CdpExecutionError>;
}

#[derive(Debug, Default, Clone)]
pub struct MockCdpTransport;

impl CdpTransport for MockCdpTransport {
    fn send(&self, call_id: u64, call: &CdpCall) -> Result<CdpResponse, CdpExecutionError> {
        Ok(CdpResponse {
            id: call_id,
            method: call.method.clone(),
            result: json!({
                "ok": true,
                "mock": true,
                "method": call.method
            }),
        })
    }
}

pub struct WebSocketCdpTransport {
    socket: Mutex<WebSocket<MaybeTlsStream<std::net::TcpStream>>>,
}

impl WebSocketCdpTransport {
    pub fn connect_loopback(websocket_url: &str) -> Result<Self, CdpExecutionError> {
        validate_loopback_websocket_url(websocket_url)?;
        let (socket, _) = connect(websocket_url)
            .map_err(|error| CdpExecutionError::Transport(error.to_string()))?;
        Ok(Self {
            socket: Mutex::new(socket),
        })
    }
}

impl CdpTransport for WebSocketCdpTransport {
    fn send(&self, call_id: u64, call: &CdpCall) -> Result<CdpResponse, CdpExecutionError> {
        let payload = json!({
            "id": call_id,
            "method": call.method,
            "params": call.params
        });

        let mut socket = self
            .socket
            .lock()
            .map_err(|_| CdpExecutionError::Transport("CDP websocket lock poisoned".to_string()))?;
        socket
            .send(Message::Text(payload.to_string().into()))
            .map_err(|error| CdpExecutionError::Transport(error.to_string()))?;

        loop {
            let message = socket
                .read()
                .map_err(|error| CdpExecutionError::Transport(error.to_string()))?;
            let Message::Text(text) = message else {
                continue;
            };
            let value = serde_json::from_str::<Value>(&text)
                .map_err(|error| CdpExecutionError::Transport(error.to_string()))?;

            if value.get("id").and_then(Value::as_u64) != Some(call_id) {
                continue;
            }

            if let Some(error) = value.get("error") {
                return Err(CdpExecutionError::Transport(error.to_string()));
            }

            let result = value
                .get("result")
                .cloned()
                .ok_or(CdpExecutionError::MissingResponse(call_id))?;

            return Ok(CdpResponse {
                id: call_id,
                method: call.method.clone(),
                result,
            });
        }
    }
}

#[derive(Clone)]
pub struct CdpExecutor<T: CdpTransport> {
    transport: Arc<T>,
}

impl<T: CdpTransport> CdpExecutor<T> {
    pub fn new(transport: T) -> Self {
        Self {
            transport: Arc::new(transport),
        }
    }

    pub fn execute_command(
        &self,
        command: &AutomationCommand,
    ) -> Result<CdpExecutionReport, CdpExecutionError> {
        let compiled = compile_to_cdp(command)?;
        let responses = compiled
            .calls
            .iter()
            .map(|call| {
                let call_id = next_call_id();
                self.transport.send(call_id, call)
            })
            .collect::<Result<Vec<_>, _>>()?;

        Ok(CdpExecutionReport {
            dry_run: false,
            responses,
        })
    }
}

impl CdpExecutor<MockCdpTransport> {
    pub fn mock() -> Self {
        Self::new(MockCdpTransport)
    }

    pub fn execute_dry_run(
        &self,
        command: &AutomationCommand,
    ) -> Result<CdpExecutionReport, CdpExecutionError> {
        let mut report = self.execute_command(command)?;
        report.dry_run = true;
        Ok(report)
    }
}

fn next_call_id() -> u64 {
    static NEXT_ID: AtomicU64 = AtomicU64::new(1);
    NEXT_ID.fetch_add(1, Ordering::Relaxed)
}

pub fn validate_loopback_websocket_url(websocket_url: &str) -> Result<(), CdpExecutionError> {
    let url = Url::parse(websocket_url)
        .map_err(|error| CdpExecutionError::InvalidWebSocketUrl(error.to_string()))?;
    if !matches!(url.scheme(), "ws" | "wss") {
        return Err(CdpExecutionError::InvalidWebSocketUrl(
            "scheme must be ws or wss".to_string(),
        ));
    }
    let Some(host) = url.host() else {
        return Err(CdpExecutionError::InvalidWebSocketUrl(
            "host is required".to_string(),
        ));
    };
    match host {
        Host::Domain(domain) if domain.eq_ignore_ascii_case("localhost") => Ok(()),
        Host::Ipv4(ip) if ip.is_loopback() => Ok(()),
        Host::Ipv6(ip) if ip.is_loopback() => Ok(()),
        Host::Domain(domain) => {
            let Ok(ip) = domain.parse::<IpAddr>() else {
                return Err(CdpExecutionError::NonLoopbackUrl);
            };
            if ip.is_loopback() {
                Ok(())
            } else {
                Err(CdpExecutionError::NonLoopbackUrl)
            }
        }
        _ => Err(CdpExecutionError::NonLoopbackUrl),
    }
}

pub fn compile_to_cdp(command: &AutomationCommand) -> Result<CdpCompileResponse, CdpCompileError> {
    let mut notes = Vec::new();
    let mut requires_ax_resolution = false;
    let calls = match command {
        AutomationCommand::OpenPage { url, .. } => vec![CdpCall {
            method: "Page.navigate".to_string(),
            params: json!({ "url": url }),
        }],
        AutomationCommand::Click { target, button, .. } => {
            let (x, y) = coordinates(target)?;
            requires_ax_resolution = matches!(target, InteractionTarget::AccessibilityNode { .. });
            if requires_ax_resolution {
                notes.push("Resolve AX node bounds before dispatching mouse events.".to_string());
            }
            vec![
                CdpCall {
                    method: "Input.dispatchMouseEvent".to_string(),
                    params: json!({
                        "type": "mousePressed",
                        "x": x,
                        "y": y,
                        "button": mouse_button(*button),
                        "clickCount": 1
                    }),
                },
                CdpCall {
                    method: "Input.dispatchMouseEvent".to_string(),
                    params: json!({
                        "type": "mouseReleased",
                        "x": x,
                        "y": y,
                        "button": mouse_button(*button),
                        "clickCount": 1
                    }),
                },
            ]
        }
        AutomationCommand::Fill { target, text, .. } => {
            let (x, y) = coordinates(target)?;
            requires_ax_resolution = matches!(target, InteractionTarget::AccessibilityNode { .. });
            if requires_ax_resolution {
                notes.push(
                    "Resolve AX node bounds and focus target before inserting text.".to_string(),
                );
            }
            vec![
                CdpCall {
                    method: "Input.dispatchMouseEvent".to_string(),
                    params: json!({
                        "type": "mousePressed",
                        "x": x,
                        "y": y,
                        "button": "left",
                        "clickCount": 1
                    }),
                },
                CdpCall {
                    method: "Input.dispatchMouseEvent".to_string(),
                    params: json!({
                        "type": "mouseReleased",
                        "x": x,
                        "y": y,
                        "button": "left",
                        "clickCount": 1
                    }),
                },
                CdpCall {
                    method: "Input.dispatchKeyEvent".to_string(),
                    params: json!({
                        "type": "keyDown",
                        "key": "a",
                        "modifiers": modifiers_to_cdp(&[KeyModifier::Control])
                    }),
                },
                CdpCall {
                    method: "Input.dispatchKeyEvent".to_string(),
                    params: json!({
                        "type": "keyUp",
                        "key": "a",
                        "modifiers": modifiers_to_cdp(&[KeyModifier::Control])
                    }),
                },
                CdpCall {
                    method: "Input.dispatchKeyEvent".to_string(),
                    params: json!({
                        "type": "keyDown",
                        "key": "Backspace",
                        "modifiers": 0
                    }),
                },
                CdpCall {
                    method: "Input.dispatchKeyEvent".to_string(),
                    params: json!({
                        "type": "keyUp",
                        "key": "Backspace",
                        "modifiers": 0
                    }),
                },
                CdpCall {
                    method: "Input.insertText".to_string(),
                    params: json!({ "text": text }),
                },
            ]
        }
        AutomationCommand::KeyPress { key, modifiers, .. } => {
            let modifier_mask = modifiers_to_cdp(modifiers);
            let key_name = normalize_key(key)?;
            vec![
                CdpCall {
                    method: "Input.dispatchKeyEvent".to_string(),
                    params: json!({
                        "type": "keyDown",
                        "key": key_name,
                        "modifiers": modifier_mask
                    }),
                },
                CdpCall {
                    method: "Input.dispatchKeyEvent".to_string(),
                    params: json!({
                        "type": "keyUp",
                        "key": key_name,
                        "modifiers": modifier_mask
                    }),
                },
            ]
        }
        AutomationCommand::Scroll {
            delta_x, delta_y, ..
        } => vec![CdpCall {
            method: "Input.dispatchMouseEvent".to_string(),
            params: json!({
                "type": "mouseWheel",
                "x": 1,
                "y": 1,
                "deltaX": delta_x,
                "deltaY": delta_y
            }),
        }],
        AutomationCommand::ReadAccessibilityTree { .. } => vec![CdpCall {
            method: "Accessibility.getFullAXTree".to_string(),
            params: json!({}),
        }],
        AutomationCommand::CaptureScreenshot {
            redact_sensitive, ..
        } => {
            if *redact_sensitive {
                notes.push(
                    "Screenshot must be redacted by native layer before AI/cloud use.".to_string(),
                );
            }
            vec![CdpCall {
                method: "Page.captureScreenshot".to_string(),
                params: json!({
                    "format": "png",
                    "fromSurface": true,
                    "captureBeyondViewport": false
                }),
            }]
        }
        AutomationCommand::AddNetworkIntercept { rule } => compile_intercept(rule)?,
        AutomationCommand::RemoveNetworkIntercept { .. } => vec![CdpCall {
            method: "Fetch.disable".to_string(),
            params: json!({}),
        }],
    };

    Ok(CdpCompileResponse {
        calls,
        requires_ax_resolution,
        notes,
    })
}

fn coordinates(target: &InteractionTarget) -> Result<(i32, i32), CdpCompileError> {
    match target {
        InteractionTarget::Coordinates { x, y, .. } => Ok((*x, *y)),
        InteractionTarget::AccessibilityNode { .. } => {
            Err(CdpCompileError::NeedsAccessibilityResolution)
        }
    }
}

fn mouse_button(button: MouseButton) -> &'static str {
    match button {
        MouseButton::Left => "left",
        MouseButton::Middle => "middle",
        MouseButton::Right => "right",
    }
}

fn modifiers_to_cdp(modifiers: &[KeyModifier]) -> u8 {
    modifiers.iter().fold(0, |mask, modifier| {
        mask | match modifier {
            KeyModifier::Alt => 1,
            KeyModifier::Control => 2,
            KeyModifier::Meta => 4,
            KeyModifier::Shift => 8,
        }
    })
}

fn normalize_key(key: &str) -> Result<String, CdpCompileError> {
    let trimmed = key.trim();
    if trimmed.is_empty() {
        return Err(CdpCompileError::UnsupportedKey);
    }
    Ok(match trimmed.to_lowercase().as_str() {
        "enter" => "Enter".to_string(),
        "tab" => "Tab".to_string(),
        "escape" | "esc" => "Escape".to_string(),
        "backspace" => "Backspace".to_string(),
        "delete" => "Delete".to_string(),
        "arrowup" | "up" => "ArrowUp".to_string(),
        "arrowdown" | "down" => "ArrowDown".to_string(),
        "arrowleft" | "left" => "ArrowLeft".to_string(),
        "arrowright" | "right" => "ArrowRight".to_string(),
        _ if trimmed.chars().count() == 1 => trimmed.to_string(),
        _ => return Err(CdpCompileError::UnsupportedKey),
    })
}

fn compile_intercept(rule: &NetworkInterceptRule) -> Result<Vec<CdpCall>, CdpCompileError> {
    if rule.url_pattern.trim().is_empty() {
        return Err(CdpCompileError::InvalidIntercept);
    }

    let mut calls = vec![CdpCall {
        method: "Fetch.enable".to_string(),
        params: json!({
            "patterns": [{
                "urlPattern": rule.url_pattern,
                "resourceType": resource_types(&rule.resource_types),
                "requestStage": "Request"
            }]
        }),
    }];

    match &rule.action {
        InterceptAction::Block => calls.push(CdpCall {
            method: "Fetch.failRequest".to_string(),
            params: json!({
                "requestId": "$REQUEST_ID",
                "errorReason": "BlockedByClient"
            }),
        }),
        InterceptAction::Continue => calls.push(CdpCall {
            method: "Fetch.continueRequest".to_string(),
            params: json!({ "requestId": "$REQUEST_ID" }),
        }),
        InterceptAction::AddHeaders { headers } => calls.push(CdpCall {
            method: "Fetch.continueRequest".to_string(),
            params: json!({
                "requestId": "$REQUEST_ID",
                "headers": headers_to_cdp(headers)
            }),
        }),
        InterceptAction::MockResponse {
            status,
            content_type,
            body,
        } => calls.push(CdpCall {
            method: "Fetch.fulfillRequest".to_string(),
            params: json!({
                "requestId": "$REQUEST_ID",
                "responseCode": status,
                "responseHeaders": [{ "name": "content-type", "value": content_type }],
                "body": body
            }),
        }),
    }

    Ok(calls)
}

fn resource_types(types: &[ResourceType]) -> Value {
    if types.is_empty() {
        return Value::Null;
    }
    Value::Array(
        types
            .iter()
            .map(|kind| {
                Value::String(
                    match kind {
                        ResourceType::Document => "Document",
                        ResourceType::Script => "Script",
                        ResourceType::Stylesheet => "Stylesheet",
                        ResourceType::Image => "Image",
                        ResourceType::Media => "Media",
                        ResourceType::Font => "Font",
                        ResourceType::Xhr => "XHR",
                        ResourceType::Fetch => "Fetch",
                        ResourceType::WebSocket => "WebSocket",
                        ResourceType::Other => "Other",
                    }
                    .to_string(),
                )
            })
            .collect(),
    )
}

fn headers_to_cdp(headers: &[HeaderMutation]) -> Vec<Value> {
    headers
        .iter()
        .map(|header| json!({ "name": header.name, "value": header.value }))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use browser_automation::{AutomationCommand, InteractionTarget};

    #[test]
    fn compiles_navigation() {
        let result = compile_to_cdp(&AutomationCommand::OpenPage {
            tab_id: Some("tab".to_string()),
            url: "https://example.com".to_string(),
        })
        .unwrap();

        assert_eq!(result.calls[0].method, "Page.navigate");
        assert_eq!(result.calls[0].params["url"], "https://example.com");
    }

    #[test]
    fn coordinate_click_compiles_to_mouse_down_and_up() {
        let result = compile_to_cdp(&AutomationCommand::Click {
            tab_id: "tab".to_string(),
            target: InteractionTarget::Coordinates {
                x: 20,
                y: 30,
                frame_id: None,
                label: "Button".to_string(),
            },
            button: MouseButton::Left,
        })
        .unwrap();

        assert_eq!(result.calls.len(), 2);
        assert_eq!(result.calls[0].method, "Input.dispatchMouseEvent");
    }

    #[test]
    fn ax_click_requires_resolution() {
        let result = compile_to_cdp(&AutomationCommand::Click {
            tab_id: "tab".to_string(),
            target: InteractionTarget::AccessibilityNode {
                ax_node_id: "ax-1".to_string(),
                label: "Button".to_string(),
            },
            button: MouseButton::Left,
        });

        assert!(matches!(
            result,
            Err(CdpCompileError::NeedsAccessibilityResolution)
        ));
    }

    #[test]
    fn mock_executor_returns_responses() {
        let executor = CdpExecutor::mock();
        let report = executor
            .execute_dry_run(&AutomationCommand::OpenPage {
                tab_id: Some("tab".to_string()),
                url: "https://example.com".to_string(),
            })
            .unwrap();

        assert!(report.dry_run);
        assert_eq!(report.responses.len(), 1);
        assert_eq!(report.responses[0].method, "Page.navigate");
    }

    #[test]
    fn accepts_loopback_websocket_urls() {
        assert!(validate_loopback_websocket_url("ws://127.0.0.1:9222/devtools/page/1").is_ok());
        assert!(validate_loopback_websocket_url("ws://localhost:9222/devtools/page/1").is_ok());
        assert!(validate_loopback_websocket_url("ws://[::1]:9222/devtools/page/1").is_ok());
    }

    #[test]
    fn rejects_remote_websocket_urls() {
        assert!(matches!(
            validate_loopback_websocket_url("ws://example.com/devtools/page/1"),
            Err(CdpExecutionError::NonLoopbackUrl)
        ));
    }
}
