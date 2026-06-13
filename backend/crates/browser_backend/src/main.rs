use agent_protocol::{AgentPlan, AgentPlanRequest, AgentStep, BrowserAction, PermissionTier};
use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use browser_ai::{AiProfile, AiProvider, AiProviderSetupRequest, AiResponseMode};
use browser_automation::{AutomationEvaluation, AutomationRequest, evaluate_automation};
use browser_cdp::{
    CdpCompileRequest, CdpExecutor, MockCdpTransport, WebSocketCdpTransport, compile_to_cdp,
};
use browser_policy::{
    ActionAuditEvent, ActionEvaluation, DataClass, DataHandlingDecision, DataUse, PrivacyPolicy,
    SafetyPolicy, production_readiness_report,
};
use browser_storage::BrowserStorage;
use chrono::Utc;
use parking_lot::{Mutex, RwLock};
use search_core::{IndexDocumentsRequest, SearchIndex, SearchQuery};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::EnvFilter;
use uuid::Uuid;

#[derive(Clone)]
struct AppState {
    search_index: SearchIndex,
    safety_policy: SafetyPolicy,
    privacy_policy: PrivacyPolicy,
    audit_log: Arc<RwLock<Vec<ActionAuditEvent>>>,
    rate_limiter: Arc<Mutex<ActionRateLimiter>>,
    cdp_executor: CdpExecutor<MockCdpTransport>,
    storage: Arc<Mutex<BrowserStorage>>,
    storage_path: PathBuf,
}

#[derive(Debug, Default)]
struct ActionRateLimiter {
    counts: HashMap<(String, i64), u16>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let storage_path = storage_path()?;
    if let Some(parent) = storage_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let storage = BrowserStorage::open(&storage_path)?;
    let search_index = SearchIndex::default();
    let restored_documents = storage.all_search_documents()?;
    let restored_count = restored_documents.len();
    if !restored_documents.is_empty() {
        search_index.upsert_many(restored_documents);
    }

    let state = AppState {
        search_index,
        safety_policy: SafetyPolicy::default(),
        privacy_policy: PrivacyPolicy::default(),
        audit_log: Arc::new(RwLock::new(Vec::new())),
        rate_limiter: Arc::new(Mutex::new(ActionRateLimiter::default())),
        cdp_executor: CdpExecutor::mock(),
        storage: Arc::new(Mutex::new(storage)),
        storage_path,
    };
    tracing::info!("restored {restored_count} search documents from storage");

    let app = Router::new()
        .route("/health", get(health))
        .route("/v1/search/index", post(index_documents))
        .route("/v1/search/query", post(search))
        .route("/v1/agent/plan", post(plan_agent_task))
        .route("/v1/ai/providers", get(ai_providers))
        .route("/v1/ai/providers/configure", post(configure_ai_provider))
        .route("/v1/ai/providers/check", get(ai_provider_checks))
        .route("/v1/ai/providers/test", post(test_ai_provider))
        .route("/v1/ai/profile", get(ai_profile).post(save_ai_profile))
        .route("/v1/automation/evaluate", post(evaluate_automation_command))
        .route("/v1/automation/compile-cdp", post(compile_cdp))
        .route("/v1/automation/execute-dry-run", post(execute_dry_run))
        .route("/v1/automation/execute-cdp", post(execute_cdp))
        .route("/v1/security/evaluate-action", post(evaluate_action))
        .route("/v1/security/audit-log", get(audit_log))
        .route("/v1/security/policy", get(security_policy))
        .route("/v1/privacy/decide", post(decide_privacy))
        .route("/v1/privacy/policy", get(privacy_policy))
        .route("/v1/readiness", get(readiness))
        .route("/v1/storage/health", get(storage_health))
        .route("/v1/state/snapshot", get(load_state_snapshot).post(save_state_snapshot))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 4978));
    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("browser backend listening on http://{addr}");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    let _ = tokio::signal::ctrl_c().await;
}

async fn health(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        indexed_documents: state.search_index.len(),
    })
}

async fn index_documents(
    State(state): State<AppState>,
    Json(payload): Json<IndexDocumentsRequest>,
) -> impl IntoResponse {
    {
        let storage = state.storage.lock();
        for document in &payload.documents {
            if let Err(error) = storage.upsert_search_document(document) {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: error.to_string(),
                    }),
                )
                    .into_response();
            }
        }
    }

    (
        StatusCode::OK,
        Json(state.search_index.upsert_many(payload.documents)),
    )
        .into_response()
}

async fn search(
    State(state): State<AppState>,
    Json(query): Json<SearchQuery>,
) -> impl IntoResponse {
    match state.search_index.search(query) {
        Ok(response) => (StatusCode::OK, Json(response)).into_response(),
        Err(error) => (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn plan_agent_task(Json(request): Json<AgentPlanRequest>) -> Json<AgentPlan> {
    let mut steps = vec![AgentStep {
        step_id: Uuid::new_v4(),
        action: BrowserAction::ReadPage {
            tab_id: request.tab_id.clone(),
        },
        rationale: "Read the active page accessibility tree before deciding actions.".to_string(),
        required_tier: PermissionTier::ReadOnly,
    }];

    let goal = request.user_goal.to_lowercase();
    if goal.contains("open") || goal.contains("search") || goal.contains("go to") {
        steps.push(AgentStep {
            step_id: Uuid::new_v4(),
            action: BrowserAction::Navigate {
                tab_id: request.tab_id.clone(),
                url: "https://www.google.com/search?q=".to_string(),
            },
            rationale:
                "Navigation is allowed only as a browser-level action, never DOM script injection."
                    .to_string(),
            required_tier: PermissionTier::Navigate,
        });
    }

    if goal.contains("book")
        || goal.contains("pay")
        || goal.contains("buy")
        || goal.contains("submit")
    {
        steps.push(AgentStep {
            step_id: Uuid::new_v4(),
            action: BrowserAction::ConfirmTransaction {
                description:
                    "User goal may create an external side effect; require explicit confirmation."
                        .to_string(),
                amount: None,
                payee: None,
            },
            rationale: "Consequential tasks must pass the non-bypassable permission gate."
                .to_string(),
            required_tier: PermissionTier::Transaction,
        });
    }

    if goal.contains("change account")
        || goal.contains("change email")
        || goal.contains("cancel subscription")
        || goal.contains("delete account")
    {
        steps.push(AgentStep {
            step_id: Uuid::new_v4(),
            action: BrowserAction::ChangeAccountSetting {
                tab_id: request.tab_id.clone(),
                setting_name: "account_setting".to_string(),
                new_value_summary:
                    "Potential account, profile, subscription, or irreversible setting change."
                        .to_string(),
                irreversible: goal.contains("delete") || goal.contains("cancel"),
            },
            rationale: "Account and settings changes require Tier 5 confirmation.".to_string(),
            required_tier: PermissionTier::ExternalSideEffect,
        });
    }

    let max_required_tier = steps
        .iter()
        .map(|step| step.required_tier)
        .max()
        .unwrap_or(PermissionTier::ReadOnly);

    Json(AgentPlan {
        plan_id: Uuid::new_v4(),
        created_at: Utc::now(),
        user_goal: request.user_goal,
        max_required_tier,
        needs_user_confirmation: max_required_tier > request.max_allowed_tier,
        steps,
    })
}

async fn ai_providers(State(state): State<AppState>) -> impl IntoResponse {
    match state.storage.lock().list_ai_providers() {
        Ok(providers) => (StatusCode::OK, Json(providers)).into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn configure_ai_provider(
    State(state): State<AppState>,
    Json(request): Json<AiProviderSetupRequest>,
) -> impl IntoResponse {
    match state.storage.lock().save_ai_provider(&request) {
        Ok(provider) => (StatusCode::OK, Json(provider)).into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn ai_provider_checks(State(state): State<AppState>) -> impl IntoResponse {
    match state.storage.lock().provider_checks() {
        Ok(checks) => (StatusCode::OK, Json(checks)).into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn test_ai_provider(
    State(state): State<AppState>,
    Json(request): Json<AiProviderTestRequest>,
) -> impl IntoResponse {
    let (settings, api_key) = {
        let storage = state.storage.lock();
        let settings = match storage.list_ai_providers() {
            Ok(providers) => providers
                .into_iter()
                .find(|provider| provider.provider == request.provider),
            Err(error) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: error.to_string(),
                    }),
                )
                    .into_response();
            }
        };
        let Some(settings) = settings else {
            return (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: "Unknown AI provider.".to_string(),
                }),
            )
                .into_response();
        };
        let api_key = match storage.reveal_ai_provider_key(request.provider) {
            Ok(key) => key,
            Err(error) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: error.to_string(),
                    }),
                )
                    .into_response();
            }
        };
        (settings, api_key)
    };

    let check = browser_ai::check_provider(&settings);
    if !check.ready {
        return (
            StatusCode::BAD_REQUEST,
            Json(AiProviderTestResponse {
                provider: request.provider,
                ok: false,
                model: settings.model,
                response_mode: settings.response_mode,
                message: format!("Setup incomplete: {}", check.missing.join(", ")),
            }),
        )
            .into_response();
    }

    match probe_provider(&settings, api_key.as_deref()).await {
        Ok(message) => (
            StatusCode::OK,
            Json(AiProviderTestResponse {
                provider: request.provider,
                ok: true,
                model: settings.model,
                response_mode: settings.response_mode,
                message,
            }),
        )
            .into_response(),
        Err(error) => (
            StatusCode::BAD_GATEWAY,
            Json(AiProviderTestResponse {
                provider: request.provider,
                ok: false,
                model: settings.model,
                response_mode: settings.response_mode,
                message: error,
            }),
        )
            .into_response(),
    }
}

async fn ai_profile(State(state): State<AppState>) -> impl IntoResponse {
    match state.storage.lock().load_ai_profile() {
        Ok(profile) => (StatusCode::OK, Json(profile)).into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn save_ai_profile(
    State(state): State<AppState>,
    Json(profile): Json<AiProfile>,
) -> impl IntoResponse {
    match state.storage.lock().save_ai_profile(&profile) {
        Ok(profile) => (StatusCode::OK, Json(profile)).into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn evaluate_action(
    State(state): State<AppState>,
    Json(request): Json<EvaluateActionRequest>,
) -> Json<EvaluateActionResponse> {
    let mut evaluation = state
        .safety_policy
        .evaluate(&request.action, request.origin.as_deref());

    if let Some(origin) = request.origin.as_deref() {
        let mut limiter = state.rate_limiter.lock();
        if !limiter.allow(origin, state.safety_policy.actions_per_minute_per_origin) {
            evaluation = ActionEvaluation {
                action_id: Uuid::new_v4(),
                required_tier: request.action.required_tier(),
                decision: browser_policy::PolicyDecision::Block,
                confirmation_required: false,
                biometric_required: false,
                reason: "Per-origin agent action rate limit exceeded.".to_string(),
            };
        }
    }

    let audit_event = state.safety_policy.audit_event(
        request.action,
        &evaluation,
        request.origin,
        request.target_description,
    );
    state.audit_log.write().push(audit_event.clone());
    let _ = state.storage.lock().append_audit_event(&audit_event);

    Json(EvaluateActionResponse {
        evaluation,
        audit_event,
    })
}

async fn evaluate_automation_command(
    State(state): State<AppState>,
    Json(request): Json<AutomationRequest>,
) -> impl IntoResponse {
    let origin = request.origin.clone();
    let target_description = request.user_visible_reason.clone();
    match evaluate_automation(request) {
        Ok(automation) => {
            let safety = automation
                .mapped_action
                .as_ref()
                .map(|action| state.safety_policy.evaluate(action, origin.as_deref()));

            if let (Some(action), Some(evaluation)) =
                (automation.mapped_action.clone(), safety.as_ref())
            {
                let audit_event =
                    state
                        .safety_policy
                        .audit_event(action, evaluation, origin, target_description);
                state.audit_log.write().push(audit_event.clone());
                let _ = state.storage.lock().append_audit_event(&audit_event);
            }

            (
                StatusCode::OK,
                Json(AutomationEvaluateResponse { automation, safety }),
            )
                .into_response()
        }
        Err(error) => (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn compile_cdp(Json(request): Json<CdpCompileRequest>) -> impl IntoResponse {
    match compile_to_cdp(&request.command) {
        Ok(response) => (StatusCode::OK, Json(response)).into_response(),
        Err(error) => (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn execute_dry_run(
    State(state): State<AppState>,
    Json(request): Json<CdpCompileRequest>,
) -> impl IntoResponse {
    match state.cdp_executor.execute_dry_run(&request.command) {
        Ok(response) => (StatusCode::OK, Json(response)).into_response(),
        Err(error) => (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn execute_cdp(
    State(state): State<AppState>,
    Json(request): Json<ExecuteCdpRequest>,
) -> impl IntoResponse {
    let automation_request = AutomationRequest {
        command: request.command.clone(),
        origin: request.origin.clone(),
        user_visible_reason: request.user_visible_reason.clone(),
    };

    let automation = match evaluate_automation(automation_request) {
        Ok(automation) => automation,
        Err(error) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: error.to_string(),
                }),
            )
                .into_response();
        }
    };

    if let Some(action) = automation.mapped_action.as_ref() {
        let evaluation = state
            .safety_policy
            .evaluate(action, request.origin.as_deref());
        if evaluation.decision != browser_policy::PolicyDecision::Allow {
            return (
                StatusCode::FORBIDDEN,
                Json(ErrorResponse {
                    error: format!(
                        "action is not executable without confirmation: {}",
                        evaluation.reason
                    ),
                }),
            )
                .into_response();
        }
    }

    let transport = match WebSocketCdpTransport::connect_loopback(&request.websocket_url) {
        Ok(transport) => transport,
        Err(error) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: error.to_string(),
                }),
            )
                .into_response();
        }
    };
    let executor = CdpExecutor::new(transport);
    match executor.execute_command(&request.command) {
        Ok(report) => (StatusCode::OK, Json(report)).into_response(),
        Err(error) => (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn audit_log(State(state): State<AppState>) -> Json<AuditLogResponse> {
    let events = state
        .storage
        .lock()
        .latest_audit_events(250)
        .unwrap_or_else(|_| {
            let mut events = state.audit_log.read().clone();
            events.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
            events.truncate(250);
            events
        });
    Json(AuditLogResponse { events })
}

async fn security_policy(State(state): State<AppState>) -> Json<SafetyPolicy> {
    Json(state.safety_policy)
}

async fn decide_privacy(
    State(state): State<AppState>,
    Json(request): Json<PrivacyDecisionRequest>,
) -> Json<DataHandlingDecision> {
    Json(
        state
            .privacy_policy
            .decide(request.data_class, request.data_use),
    )
}

async fn readiness() -> Json<browser_policy::FeatureReadinessReport> {
    Json(production_readiness_report())
}

async fn privacy_policy(State(state): State<AppState>) -> Json<PrivacyPolicy> {
    Json(state.privacy_policy)
}

async fn storage_health(State(state): State<AppState>) -> impl IntoResponse {
    match state.storage.lock().stats() {
        Ok(stats) => (
            StatusCode::OK,
            Json(StorageHealthResponse {
                path: state.storage_path.display().to_string(),
                schema_version: stats.schema_version,
                audit_events: stats.audit_events,
                search_documents: stats.search_documents,
            }),
        )
            .into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn load_state_snapshot(State(state): State<AppState>) -> impl IntoResponse {
    match state.storage.lock().load_app_state_snapshot() {
        Ok(snapshot) => (StatusCode::OK, Json(StateSnapshotResponse { snapshot })).into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn save_state_snapshot(
    State(state): State<AppState>,
    Json(request): Json<StateSnapshotRequest>,
) -> impl IntoResponse {
    match state.storage.lock().save_app_state_snapshot(&request.snapshot) {
        Ok(()) => (
            StatusCode::OK,
            Json(StateSnapshotResponse {
                snapshot: Some(request.snapshot),
            }),
        )
            .into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    indexed_documents: usize,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[derive(Deserialize)]
struct EvaluateActionRequest {
    action: BrowserAction,
    origin: Option<String>,
    target_description: String,
}

#[derive(Serialize)]
struct EvaluateActionResponse {
    evaluation: ActionEvaluation,
    audit_event: ActionAuditEvent,
}

#[derive(Serialize)]
struct AuditLogResponse {
    events: Vec<ActionAuditEvent>,
}

#[derive(Serialize)]
struct StorageHealthResponse {
    path: String,
    schema_version: u32,
    audit_events: u64,
    search_documents: u64,
}

#[derive(Deserialize)]
struct StateSnapshotRequest {
    snapshot: serde_json::Value,
}

#[derive(Serialize)]
struct StateSnapshotResponse {
    snapshot: Option<serde_json::Value>,
}

#[derive(Serialize)]
struct AutomationEvaluateResponse {
    automation: AutomationEvaluation,
    safety: Option<ActionEvaluation>,
}

#[derive(Deserialize)]
struct ExecuteCdpRequest {
    command: browser_automation::AutomationCommand,
    websocket_url: String,
    origin: Option<String>,
    user_visible_reason: String,
}

#[derive(Deserialize)]
struct PrivacyDecisionRequest {
    data_class: DataClass,
    data_use: DataUse,
}

#[derive(Deserialize)]
struct AiProviderTestRequest {
    provider: AiProvider,
}

#[derive(Serialize)]
struct AiProviderTestResponse {
    provider: AiProvider,
    ok: bool,
    model: String,
    response_mode: AiResponseMode,
    message: String,
}

impl ActionRateLimiter {
    fn allow(&mut self, origin: &str, limit_per_minute: u16) -> bool {
        let minute = Utc::now().timestamp() / 60;
        self.counts
            .retain(|(_, seen_minute), _| *seen_minute >= minute - 2);
        let key = (origin.to_string(), minute);
        let count = self.counts.entry(key).or_insert(0);
        if *count >= limit_per_minute {
            return false;
        }
        *count += 1;
        true
    }
}

async fn probe_provider(
    settings: &browser_ai::AiProviderSettings,
    api_key: Option<&str>,
) -> Result<String, String> {
    match settings.provider {
        AiProvider::OpenAi => probe_openai(settings, api_key.ok_or("Missing API key.")?).await,
        AiProvider::Claude => probe_claude(settings, api_key.ok_or("Missing API key.")?).await,
        AiProvider::Gemini => probe_gemini(settings, api_key.ok_or("Missing API key.")?).await,
        AiProvider::Local => probe_local(settings).await,
    }
}

async fn probe_openai(
    settings: &browser_ai::AiProviderSettings,
    api_key: &str,
) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .build()
        .map_err(|error| error.to_string())?;
    let mut body = json!({
        "model": settings.model,
        "input": "Reply with exactly AERO_PROVIDER_OK.",
        "max_output_tokens": 32
    });
    if settings.response_mode == AiResponseMode::Thinking {
        body["reasoning"] = json!({ "effort": "medium" });
    }
    let response = client
        .post("https://api.openai.com/v1/responses")
        .bearer_auth(api_key)
        .json(&body)
        .send()
        .await
        .map_err(|error| error.to_string())?;
    provider_status(response).await
}

async fn probe_claude(
    settings: &browser_ai::AiProviderSettings,
    api_key: &str,
) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .build()
        .map_err(|error| error.to_string())?;
    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .json(&json!({
            "model": settings.model,
            "max_tokens": 32,
            "messages": [{ "role": "user", "content": "Reply with exactly AERO_PROVIDER_OK." }]
        }))
        .send()
        .await
        .map_err(|error| error.to_string())?;
    provider_status(response).await
}

async fn probe_gemini(
    settings: &browser_ai::AiProviderSettings,
    api_key: &str,
) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .build()
        .map_err(|error| error.to_string())?;
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        settings.model, api_key
    );
    let response = client
        .post(url)
        .json(&json!({
            "contents": [{ "parts": [{ "text": "Reply with exactly AERO_PROVIDER_OK." }] }],
            "generationConfig": { "maxOutputTokens": 32 }
        }))
        .send()
        .await
        .map_err(|error| error.to_string())?;
    provider_status(response).await
}

async fn probe_local(settings: &browser_ai::AiProviderSettings) -> Result<String, String> {
    let endpoint = settings
        .endpoint
        .as_deref()
        .ok_or("Missing local endpoint.")?
        .trim_end_matches('/');
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .build()
        .map_err(|error| error.to_string())?;
    let response = client
        .post(format!("{endpoint}/api/generate"))
        .json(&json!({
            "model": settings.model,
            "prompt": "Reply with exactly AERO_PROVIDER_OK.",
            "stream": false
        }))
        .send()
        .await
        .map_err(|error| error.to_string())?;
    provider_status(response).await
}

async fn provider_status(response: reqwest::Response) -> Result<String, String> {
    let status = response.status();
    let text = response.text().await.unwrap_or_default();
    if status.is_success() {
        Ok("Provider responded successfully.".to_string())
    } else {
        let clipped = text.chars().take(300).collect::<String>();
        Err(format!("Provider returned {status}: {clipped}"))
    }
}

fn storage_path() -> anyhow::Result<PathBuf> {
    if let Ok(path) = std::env::var("AERO_BACKEND_DB") {
        return Ok(PathBuf::from(path));
    }
    Ok(std::env::current_dir()?
        .join("data")
        .join("aero_backend.sqlite3"))
}
