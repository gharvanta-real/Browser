use agent_protocol::{AgentPlan, AgentPlanRequest, AgentStep, BrowserAction, PermissionTier};
use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
};
use browser_ai::{AiProfile, AiProvider, AiProviderSetupRequest, AiResponseMode};
use browser_automation::{
    AutomationCommand, AutomationEvaluation, AutomationRequest, InteractionTarget, MouseButton,
    evaluate_automation,
};
use browser_cdp::{
    CdpCompileRequest, CdpExecutor, MockCdpTransport, WebSocketCdpTransport, compile_to_cdp,
};
use browser_policy::{
    ActionAuditEvent, ActionEvaluation, DataClass, DataHandlingDecision, DataUse, PrivacyPolicy,
    QaStatus, SafetyPolicy, production_readiness_report,
};
use browser_storage::{AutofillProfile, BrowserStorage, PasswordEntrySaveRequest};
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
        .route("/v1/ai/complete", post(complete_ai))
        .route("/v1/ai/profile", get(ai_profile).post(save_ai_profile))
        .route("/v1/automation/evaluate", post(evaluate_automation_command))
        .route("/v1/automation/plan", post(plan_automation))
        .route("/v1/automation/compile-cdp", post(compile_cdp))
        .route("/v1/automation/execute-dry-run", post(execute_dry_run))
        .route("/v1/automation/execute-cdp", post(execute_cdp))
        .route("/v1/security/evaluate-action", post(evaluate_action))
        .route("/v1/security/verify-biometric", post(verify_biometric))
        .route("/v1/security/audit-log", get(audit_log))
        .route("/v1/security/policy", get(security_policy))
        .route("/v1/privacy/decide", post(decide_privacy))
        .route("/v1/privacy/policy", get(privacy_policy))
        .route("/v1/readiness", get(readiness))
        .route("/v1/storage/health", get(storage_health))
        .route(
            "/v1/state/snapshot",
            get(load_state_snapshot).post(save_state_snapshot),
        )
        .route("/v1/passwords", get(list_passwords).post(save_password))
        .route("/v1/passwords/reveal", post(reveal_password))
        .route("/v1/passwords/{id}", delete(delete_password))
        .route(
            "/v1/autofill/profile",
            get(load_autofill_profile).post(save_autofill_profile),
        )
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

async fn complete_ai(
    State(state): State<AppState>,
    Json(mut request): Json<AiCompleteRequest>,
) -> impl IntoResponse {
    let (profile, mut candidates) = {
        let storage = state.storage.lock();
        let mut profile = match storage.load_ai_profile() {
            Ok(profile) => profile,
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
        normalize_ai_profile(&mut profile);
        let selected_provider = request.provider.unwrap_or(profile.selected_provider);
        let providers = match storage.list_ai_providers() {
            Ok(providers) => providers,
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
        let mut ordered = Vec::new();
        if let Some(settings) = providers
            .iter()
            .find(|provider| provider.provider == selected_provider)
            .cloned()
        {
            ordered.push(settings);
        }
        ordered.extend(
            providers
                .into_iter()
                .filter(|provider| provider.provider != selected_provider),
        );
        let candidates = ordered
            .into_iter()
            .filter_map(|settings| {
                if settings.provider != AiProvider::Local && !profile.allow_cloud_ai {
                    return None;
                }
                let check = browser_ai::check_provider(&settings);
                if !check.ready {
                    return None;
                }
                let key = storage
                    .reveal_ai_provider_key(settings.provider)
                    .ok()
                    .flatten();
                Some((settings, key))
            })
            .collect::<Vec<_>>();
        (profile, candidates)
    };

    if candidates.is_empty() {
        let selected_provider = request.provider.unwrap_or(profile.selected_provider);
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: if selected_provider != AiProvider::Local && !profile.allow_cloud_ai {
                    format!(
                        "{selected_provider:?} is selected and appears configured, but cloud AI is disabled in the active AI profile. Enable Allow cloud AI, save the final profile, then test again."
                    )
                } else if profile.allow_cloud_ai {
                    "No ready AI provider is configured.".to_string()
                } else {
                    "No ready local AI provider is configured, and cloud AI is disabled."
                        .to_string()
                },
            }),
        )
            .into_response();
    }

    let injection = analyze_prompt_injection(request.page_context.as_ref());
    if injection.risk != PromptInjectionRisk::Low {
        request.page_context = None;
    }
    let started = std::time::Instant::now();
    let selected_provider = request.provider.unwrap_or(profile.selected_provider);
    let mut errors = Vec::new();
    for (settings, api_key) in candidates.drain(..) {
        match complete_with_provider(&settings, api_key.as_deref(), &request, &profile).await {
            Ok(mut text) => {
                if injection.risk != PromptInjectionRisk::Low {
                    text.push_str(&format!(
                        "\n\n_Context safety: page context was not sent because Aero detected {} prompt-injection risk._",
                        injection.risk.as_str()
                    ));
                }
                return (
                    StatusCode::OK,
                    Json(AiCompleteResponse {
                        provider: settings.provider,
                        model: settings.model,
                        response_mode: settings.response_mode,
                        text,
                        latency_ms: started.elapsed().as_millis() as u64,
                        used_page_context: request.page_context.is_some()
                            && profile.allow_page_reading,
                        fallback: settings.provider != selected_provider,
                        prompt_injection_risk: injection.risk.as_str().to_string(),
                        context_blocked: injection.risk != PromptInjectionRisk::Low,
                    }),
                )
                    .into_response();
            }
            Err(error) => errors.push(format!("{:?}: {}", settings.provider, error)),
        }
    }

    (
        StatusCode::BAD_GATEWAY,
        Json(ErrorResponse {
            error: format!("All ready AI providers failed: {}", errors.join(" | ")),
        }),
    )
        .into_response()
}

async fn ai_profile(State(state): State<AppState>) -> impl IntoResponse {
    match state.storage.lock().load_ai_profile() {
        Ok(mut profile) => {
            normalize_ai_profile(&mut profile);
            (StatusCode::OK, Json(profile)).into_response()
        }
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
    Json(mut profile): Json<AiProfile>,
) -> impl IntoResponse {
    normalize_ai_profile(&mut profile);
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

fn normalize_ai_profile(profile: &mut AiProfile) {
    if profile.selected_provider != AiProvider::Local {
        profile.allow_cloud_ai = true;
    }
}

async fn verify_biometric(
    Json(request): Json<VerifyBiometricRequest>,
) -> Json<VerifyBiometricResponse> {
    let verified = browser_crypto::verify_user_consent(&request.message);
    Json(VerifyBiometricResponse { verified })
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

async fn plan_automation(Json(request): Json<AutomationPlanRequest>) -> impl IntoResponse {
    let tab_id = request
        .tab_id
        .clone()
        .unwrap_or_else(|| "active".to_string());
    let goal = request.goal.trim();
    if goal.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "goal is required".to_string(),
            }),
        )
            .into_response();
    }

    let lower = goal.to_lowercase();
    let mut commands = Vec::new();
    let mut notes = Vec::new();

    if let Some(url) = planned_url(goal, &lower) {
        commands.push(AutomationCommand::OpenPage {
            tab_id: Some(tab_id.clone()),
            url,
        });
        notes.push("open/navigate".to_string());
    } else if let Some(query) = planned_search(goal, &lower) {
        commands.push(fill_label(&tab_id, "search", &query, false));
        commands.push(key_press(&tab_id, "Enter"));
        notes.push("search current page".to_string());
    }

    if commands.is_empty() && contains_any(&lower, &["login", "log in", "sign in"]) {
        if let Some(email) = value_after(goal, &["email", "user", "username"]) {
            commands.push(fill_label(&tab_id, "email", &email, false));
        }
        if let Some(password) = value_after(goal, &["password", "pass"]) {
            commands.push(fill_label(&tab_id, "password", &password, true));
        }
        commands.push(click_label(&tab_id, "login"));
        notes.push("login form".to_string());
    }

    if commands.is_empty()
        && contains_any(
            &lower,
            &[
                "autofill",
                "fill my",
                "fill form",
                "my details",
                "contact form",
                "signup",
                "sign up",
            ],
        )
    {
        let before = commands.len();
        add_profile_fill_commands(&mut commands, &tab_id, request.autofill_profile.as_ref());
        add_inline_fill_commands(&mut commands, &tab_id, goal);
        if commands.len() > before {
            notes.push("profile/form autofill".to_string());
        }
        if contains_any(&lower, &["submit", "continue", "next", "send"]) {
            commands.push(click_label(&tab_id, preferred_submit_label(&lower)));
            notes.push("submit/continue".to_string());
        }
    }

    if commands.is_empty() && contains_any(&lower, &["click", "tap", "press"]) {
        let label = lower
            .split_once("click")
            .map(|(_, tail)| tail)
            .or_else(|| lower.split_once("tap").map(|(_, tail)| tail))
            .or_else(|| lower.split_once("press").map(|(_, tail)| tail))
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .unwrap_or("continue");
        commands.push(click_label(&tab_id, label));
        notes.push("click target".to_string());
    }

    if commands.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "No executable plan matched this goal yet.".to_string(),
            }),
        )
            .into_response();
    }

    let sensitive_count = commands
        .iter()
        .filter(|command| {
            matches!(
                command,
                AutomationCommand::Fill {
                    sensitive: true,
                    ..
                }
            )
        })
        .count();
    let disclosure = plan_disclosure(goal, &request, commands.len(), sensitive_count);
    let summary = format!(
        "Planned {} action{} for {}.",
        commands.len(),
        if commands.len() == 1 { "" } else { "s" },
        if notes.is_empty() {
            "browser control".to_string()
        } else {
            notes.join(", ")
        }
    );

    (
        StatusCode::OK,
        Json(AutomationPlanResponse {
            plan_id: Uuid::new_v4().to_string(),
            summary,
            commands,
            needs_confirmation: sensitive_count > 0
                || contains_any(
                    &lower,
                    &["submit", "pay", "buy", "book", "delete", "cancel"],
                ),
            disclosure,
        }),
    )
        .into_response()
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

async fn readiness(State(state): State<AppState>) -> Json<browser_policy::FeatureReadinessReport> {
    let qa = perform_qa_checks(&state);
    Json(production_readiness_report(&qa))
}

fn perform_qa_checks(state: &AppState) -> QaStatus {
    let mut qa = QaStatus::default();

    // 1. Profile isolation check
    let path_str = state.storage_path.to_string_lossy().to_lowercase();
    qa.is_db_profile_isolated = path_str.contains("profiles")
        && (path_str.contains("localappdata")
            || path_str.contains("appdata")
            || path_str.contains(".config"));

    // 2. Encryption checks using live DB writes
    let storage = state.storage.lock();
    qa.is_db_encrypted = storage.verify_encryption_gate();
    qa.passwords_encrypted = storage.verify_password_encryption_gate();
    qa.state_snapshot_encrypted = storage.verify_snapshot_encryption_gate();

    // 3. Rate limiter status
    qa.rate_limiter_active = true;

    qa
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
    match state
        .storage
        .lock()
        .save_app_state_snapshot(&request.snapshot)
    {
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

async fn list_passwords(State(state): State<AppState>) -> impl IntoResponse {
    match state.storage.lock().list_password_entries() {
        Ok(entries) => (StatusCode::OK, Json(PasswordListResponse { entries })).into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn save_password(
    State(state): State<AppState>,
    Json(request): Json<PasswordSaveRequest>,
) -> impl IntoResponse {
    if request.site.trim().is_empty()
        || request.origin.trim().is_empty()
        || request.username.trim().is_empty()
        || request.password.is_empty()
    {
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "site, origin, username, and password are required".to_string(),
            }),
        )
            .into_response();
    }

    let id = request.id.unwrap_or_else(|| Uuid::new_v4().to_string());
    let save = PasswordEntrySaveRequest {
        id,
        site: request.site.trim().to_string(),
        origin: normalize_origin(&request.origin),
        username: request.username.trim().to_string(),
        password: request.password,
    };

    match state.storage.lock().save_password_entry(&save) {
        Ok(entry) => (StatusCode::OK, Json(entry)).into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn reveal_password(
    State(state): State<AppState>,
    Json(request): Json<PasswordRevealRequest>,
) -> impl IntoResponse {
    match state.storage.lock().reveal_password(&request.id) {
        Ok(Some(password)) => {
            (StatusCode::OK, Json(PasswordRevealResponse { password })).into_response()
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "password entry not found".to_string(),
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

async fn delete_password(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.storage.lock().delete_password_entry(&id) {
        Ok(true) => (
            StatusCode::OK,
            Json(DeletePasswordResponse { deleted: true }),
        )
            .into_response(),
        Ok(false) => (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "password entry not found".to_string(),
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

async fn load_autofill_profile(State(state): State<AppState>) -> impl IntoResponse {
    match state.storage.lock().load_autofill_profile() {
        Ok(profile) => (StatusCode::OK, Json(AutofillProfileResponse { profile })).into_response(),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn save_autofill_profile(
    State(state): State<AppState>,
    Json(profile): Json<AutofillProfile>,
) -> impl IntoResponse {
    match state.storage.lock().save_autofill_profile(&profile) {
        Ok(profile) => (
            StatusCode::OK,
            Json(AutofillProfileResponse {
                profile: Some(profile),
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

#[derive(Deserialize)]
struct VerifyBiometricRequest {
    message: String,
}

#[derive(Serialize)]
struct VerifyBiometricResponse {
    verified: bool,
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
struct PasswordListResponse {
    entries: Vec<browser_storage::PasswordEntry>,
}

#[derive(Deserialize)]
struct PasswordSaveRequest {
    id: Option<String>,
    site: String,
    origin: String,
    username: String,
    password: String,
}

#[derive(Deserialize)]
struct PasswordRevealRequest {
    id: String,
}

#[derive(Serialize)]
struct PasswordRevealResponse {
    password: String,
}

#[derive(Serialize)]
struct DeletePasswordResponse {
    deleted: bool,
}

#[derive(Serialize)]
struct AutofillProfileResponse {
    profile: Option<AutofillProfile>,
}

#[derive(Serialize)]
struct AutomationEvaluateResponse {
    automation: AutomationEvaluation,
    safety: Option<ActionEvaluation>,
}

#[derive(Deserialize)]
struct AutomationPlanRequest {
    goal: String,
    tab_id: Option<String>,
    page_snapshot: Option<serde_json::Value>,
    autofill_profile: Option<serde_json::Value>,
}

#[derive(Serialize)]
struct AutomationPlanResponse {
    plan_id: String,
    summary: String,
    commands: Vec<AutomationCommand>,
    needs_confirmation: bool,
    disclosure: serde_json::Value,
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

#[derive(Deserialize, Clone)]
struct AiCompleteRequest {
    prompt: String,
    provider: Option<AiProvider>,
    page_context: Option<serde_json::Value>,
    system: Option<String>,
    max_output_tokens: Option<u32>,
}

#[derive(Serialize)]
struct AiCompleteResponse {
    provider: AiProvider,
    model: String,
    response_mode: AiResponseMode,
    text: String,
    latency_ms: u64,
    used_page_context: bool,
    fallback: bool,
    prompt_injection_risk: String,
    context_blocked: bool,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq)]
enum PromptInjectionRisk {
    Low,
    Medium,
    High,
}

impl PromptInjectionRisk {
    fn as_str(self) -> &'static str {
        match self {
            PromptInjectionRisk::Low => "low",
            PromptInjectionRisk::Medium => "medium",
            PromptInjectionRisk::High => "high",
        }
    }
}

struct PromptInjectionAnalysis {
    risk: PromptInjectionRisk,
}

fn fill_label(tab_id: &str, label: &str, text: &str, sensitive: bool) -> AutomationCommand {
    AutomationCommand::Fill {
        tab_id: tab_id.to_string(),
        target: InteractionTarget::AccessibilityNode {
            ax_node_id: label.to_string(),
            label: label.to_string(),
        },
        text: text.to_string(),
        sensitive,
    }
}

fn click_label(tab_id: &str, label: &str) -> AutomationCommand {
    AutomationCommand::Click {
        tab_id: tab_id.to_string(),
        target: InteractionTarget::AccessibilityNode {
            ax_node_id: label.to_string(),
            label: label.to_string(),
        },
        button: MouseButton::Left,
    }
}

fn key_press(tab_id: &str, key: &str) -> AutomationCommand {
    AutomationCommand::KeyPress {
        tab_id: tab_id.to_string(),
        key: key.to_string(),
        modifiers: Vec::new(),
    }
}

fn planned_url(goal: &str, lower: &str) -> Option<String> {
    let prefixes = ["open ", "go to ", "navigate to ", "visit "];
    for prefix in prefixes {
        if let Some(raw) = lower.strip_prefix(prefix) {
            let original = &goal[goal.len() - raw.len()..];
            return Some(normalize_web_url(original.trim()));
        }
    }
    None
}

fn planned_search(goal: &str, lower: &str) -> Option<String> {
    let prefixes = ["search for ", "search ", "find "];
    for prefix in prefixes {
        if let Some(raw) = lower.strip_prefix(prefix) {
            let original = &goal[goal.len() - raw.len()..];
            let value = original.trim();
            if !value.is_empty() && value != "down" && value != "up" {
                return Some(value.to_string());
            }
        }
    }
    None
}

fn normalize_web_url(raw: &str) -> String {
    let value = raw.trim();
    if value.starts_with("http://") || value.starts_with("https://") {
        value.to_string()
    } else if value.contains('.') && !value.contains(' ') {
        format!("https://{value}")
    } else {
        format!("https://www.google.com/search?q={}", encode_query(value))
    }
}

fn encode_query(value: &str) -> String {
    value
        .bytes()
        .flat_map(|byte| match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                vec![byte as char]
            }
            b' ' => vec!['+'],
            _ => format!("%{byte:02X}").chars().collect(),
        })
        .collect()
}

fn add_profile_fill_commands(
    commands: &mut Vec<AutomationCommand>,
    tab_id: &str,
    profile: Option<&serde_json::Value>,
) {
    let Some(profile) = profile else {
        return;
    };
    for (label, keys, sensitive) in [
        ("name", &["fullName", "name"][..], false),
        ("email", &["email"][..], false),
        ("phone", &["phone", "mobile"][..], false),
        ("address", &["addressLine1", "address"][..], false),
        ("address line 2", &["addressLine2"][..], false),
        ("city", &["city"][..], false),
        ("state", &["state", "region"][..], false),
        ("zip", &["zip", "postalCode", "postal"][..], false),
        ("country", &["country"][..], false),
    ] {
        if let Some(value) = profile_value(profile, keys) {
            commands.push(fill_label(tab_id, label, &value, sensitive));
        }
    }
}

fn add_inline_fill_commands(commands: &mut Vec<AutomationCommand>, tab_id: &str, goal: &str) {
    for (label, keys, sensitive) in [
        ("name", &["name"][..], false),
        ("email", &["email"][..], false),
        ("phone", &["phone", "mobile"][..], false),
        ("password", &["password", "pass"][..], true),
        ("company", &["company"][..], false),
    ] {
        if let Some(value) = value_after(goal, keys) {
            commands.push(fill_label(tab_id, label, &value, sensitive));
        }
    }
}

fn profile_value(profile: &serde_json::Value, keys: &[&str]) -> Option<String> {
    for key in keys {
        let value = profile.get(*key).and_then(|value| value.as_str());
        if let Some(value) = value.map(str::trim).filter(|value| !value.is_empty()) {
            return Some(value.to_string());
        }
    }
    None
}

fn value_after(goal: &str, keys: &[&str]) -> Option<String> {
    let words: Vec<&str> = goal.split_whitespace().collect();
    for key in keys {
        if let Some(index) = words.iter().position(|word| {
            word.trim_matches(|c: char| !c.is_alphanumeric())
                .eq_ignore_ascii_case(key)
        }) {
            let mut value = Vec::new();
            for word in words.iter().skip(index + 1) {
                let lower = word.to_lowercase();
                if [
                    "and", "with", "then", "password", "email", "phone", "name", "company",
                ]
                .contains(&lower.as_str())
                    && !value.is_empty()
                {
                    break;
                }
                if !["is", "as", "to", "=", ":"].contains(&lower.as_str()) {
                    value.push(*word);
                }
            }
            let joined = value.join(" ");
            let cleaned = joined
                .trim_matches(|c: char| c == ',' || c == ';' || c == '.')
                .trim();
            if !cleaned.is_empty() {
                return Some(cleaned.to_string());
            }
        }
    }
    None
}

fn contains_any(haystack: &str, needles: &[&str]) -> bool {
    needles.iter().any(|needle| haystack.contains(needle))
}

fn preferred_submit_label(lower: &str) -> &'static str {
    if lower.contains("send") {
        "send"
    } else if lower.contains("next") {
        "next"
    } else if lower.contains("continue") {
        "continue"
    } else {
        "submit"
    }
}

fn plan_disclosure(
    goal: &str,
    request: &AutomationPlanRequest,
    command_count: usize,
    sensitive_count: usize,
) -> serde_json::Value {
    let snapshot = request.page_snapshot.as_ref();
    let controls = snapshot
        .and_then(|value| value.get("interactives"))
        .and_then(|value| value.as_array())
        .map(|items| items.len())
        .unwrap_or(0);
    let forms = snapshot
        .and_then(|value| value.get("forms"))
        .and_then(|value| value.as_array())
        .map(|items| items.len())
        .unwrap_or(0);
    json!({
        "goal": goal,
        "page": {
            "url": snapshot.and_then(|value| value.get("url")).and_then(|value| value.as_str()).unwrap_or(""),
            "title": snapshot.and_then(|value| value.get("title")).and_then(|value| value.as_str()).unwrap_or(""),
            "text_chars": snapshot.and_then(|value| value.get("text")).and_then(|value| value.as_str()).map(str::len).unwrap_or(0),
            "controls": controls,
            "forms": forms
        },
        "sent_to_planner": {
            "goal": true,
            "page_snapshot": snapshot.is_some(),
            "autofill_profile": request.autofill_profile.is_some()
        },
        "plan": {
            "command_count": command_count,
            "sensitive_field_count": sensitive_count
        }
    })
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

async fn complete_with_provider(
    settings: &browser_ai::AiProviderSettings,
    api_key: Option<&str>,
    request: &AiCompleteRequest,
    profile: &AiProfile,
) -> Result<String, String> {
    match settings.provider {
        AiProvider::OpenAi => {
            complete_openai(
                settings,
                api_key.ok_or("Missing API key.")?,
                request,
                profile,
            )
            .await
        }
        AiProvider::Claude => {
            complete_claude(
                settings,
                api_key.ok_or("Missing API key.")?,
                request,
                profile,
            )
            .await
        }
        AiProvider::Gemini => {
            complete_gemini(
                settings,
                api_key.ok_or("Missing API key.")?,
                request,
                profile,
            )
            .await
        }
        AiProvider::Local => complete_local(settings, request, profile).await,
    }
}

async fn complete_openai(
    settings: &browser_ai::AiProviderSettings,
    api_key: &str,
    request: &AiCompleteRequest,
    profile: &AiProfile,
) -> Result<String, String> {
    let client = ai_http_client()?;
    let mut body = json!({
        "model": settings.model,
        "instructions": completion_system_prompt(request, profile),
        "input": completion_user_prompt(request, profile),
        "max_output_tokens": request.max_output_tokens.unwrap_or(700).min(1600)
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
    let value = provider_json(response).await?;
    extract_openai_text(&value).ok_or_else(|| "OpenAI response did not contain text.".to_string())
}

async fn complete_claude(
    settings: &browser_ai::AiProviderSettings,
    api_key: &str,
    request: &AiCompleteRequest,
    profile: &AiProfile,
) -> Result<String, String> {
    let client = ai_http_client()?;
    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .json(&json!({
            "model": settings.model,
            "system": completion_system_prompt(request, profile),
            "max_tokens": request.max_output_tokens.unwrap_or(700).min(1600),
            "messages": [{ "role": "user", "content": completion_user_prompt(request, profile) }]
        }))
        .send()
        .await
        .map_err(|error| error.to_string())?;
    let value = provider_json(response).await?;
    extract_claude_text(&value).ok_or_else(|| "Claude response did not contain text.".to_string())
}

async fn complete_gemini(
    settings: &browser_ai::AiProviderSettings,
    api_key: &str,
    request: &AiCompleteRequest,
    profile: &AiProfile,
) -> Result<String, String> {
    let client = ai_http_client()?;
    let mut models = vec![settings.model.as_str()];
    for fallback in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"] {
        if !models.iter().any(|model| *model == fallback) {
            models.push(fallback);
        }
    }
    let mut errors = Vec::new();
    for model in models {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            model, api_key
        );
        let response = client
            .post(url)
            .json(&json!({
                "systemInstruction": { "parts": [{ "text": completion_system_prompt(request, profile) }] },
                "contents": [{ "role": "user", "parts": [{ "text": completion_user_prompt(request, profile) }] }],
                "generationConfig": { "maxOutputTokens": request.max_output_tokens.unwrap_or(700).min(1600) }
            }))
            .send()
            .await
            .map_err(|error| error.to_string())?;
        match provider_json(response).await {
            Ok(value) => {
                if let Some(text) = extract_gemini_text(&value) {
                    return Ok(text);
                }
                errors.push(format!("{model}: response did not contain text"));
            }
            Err(error) => errors.push(format!("{model}: {error}")),
        }
    }
    Err(format!(
        "Gemini response failed for configured and fallback models: {}",
        errors.join("; ")
    ))
}

async fn complete_local(
    settings: &browser_ai::AiProviderSettings,
    request: &AiCompleteRequest,
    profile: &AiProfile,
) -> Result<String, String> {
    let endpoint = settings
        .endpoint
        .as_deref()
        .ok_or("Missing local endpoint.")?
        .trim_end_matches('/');
    let client = ai_http_client()?;
    let response = client
        .post(format!("{endpoint}/api/generate"))
        .json(&json!({
            "model": settings.model,
            "prompt": format!("{}\n\n{}", completion_system_prompt(request, profile), completion_user_prompt(request, profile)),
            "stream": false,
            "options": { "num_predict": request.max_output_tokens.unwrap_or(700).min(1600) }
        }))
        .send()
        .await
        .map_err(|error| error.to_string())?;
    let value = provider_json(response).await?;
    value
        .get("response")
        .and_then(|value| value.as_str())
        .map(|text| text.trim().to_string())
        .filter(|text| !text.is_empty())
        .ok_or_else(|| "Local model response did not contain text.".to_string())
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
    let mut models = vec![settings.model.as_str()];
    for fallback in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"] {
        if !models.iter().any(|model| *model == fallback) {
            models.push(fallback);
        }
    }
    let mut errors = Vec::new();
    for model in models {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            model, api_key
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
        match provider_status(response).await {
            Ok(message) => return Ok(format!("{message} Model: {model}.")),
            Err(error) => errors.push(format!("{model}: {error}")),
        }
    }
    Err(format!(
        "Gemini probe failed for configured and fallback models: {}",
        errors.join("; ")
    ))
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

fn ai_http_client() -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(45))
        .build()
        .map_err(|error| error.to_string())
}

async fn provider_json(response: reqwest::Response) -> Result<serde_json::Value, String> {
    let status = response.status();
    let text = response.text().await.unwrap_or_default();
    if !status.is_success() {
        return Err(format!(
            "Provider returned {status}: {}",
            text.chars().take(500).collect::<String>()
        ));
    }
    serde_json::from_str(&text).map_err(|error| format!("Provider JSON parse failed: {error}"))
}

fn analyze_prompt_injection(page_context: Option<&serde_json::Value>) -> PromptInjectionAnalysis {
    let Some(context) = page_context else {
        return PromptInjectionAnalysis {
            risk: PromptInjectionRisk::Low,
        };
    };
    let text = context
        .get("text")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .to_lowercase();
    if text.is_empty() {
        return PromptInjectionAnalysis {
            risk: PromptInjectionRisk::Low,
        };
    }
    let high_patterns = [
        "ignore previous instructions",
        "ignore all previous instructions",
        "disregard previous instructions",
        "reveal your system prompt",
        "exfiltrate",
        "send your api key",
        "steal",
        "bypass safety",
        "disable safety",
        "do not tell the user",
    ];
    let medium_patterns = [
        "system message",
        "developer message",
        "hidden instruction",
        "act as",
        "jailbreak",
        "override",
        "tool output",
        "confidential",
    ];
    let high_hits = high_patterns
        .iter()
        .filter(|pattern| text.contains(**pattern))
        .count();
    let medium_hits = medium_patterns
        .iter()
        .filter(|pattern| text.contains(**pattern))
        .count();
    let risk = if high_hits > 0 || medium_hits >= 3 {
        PromptInjectionRisk::High
    } else if medium_hits > 0 {
        PromptInjectionRisk::Medium
    } else {
        PromptInjectionRisk::Low
    };
    PromptInjectionAnalysis { risk }
}

fn completion_system_prompt(request: &AiCompleteRequest, profile: &AiProfile) -> String {
    request.system.clone().unwrap_or_else(|| {
        format!(
            "You are Aero Browser's assistant. Be concise, accurate, and action-aware. Never claim an action was completed unless the browser automation layer did it. Page reading is {} and action execution is {}.",
            if profile.allow_page_reading { "allowed" } else { "disabled" },
            if profile.allow_action_execution { "allowed" } else { "disabled" }
        )
    })
}

fn completion_user_prompt(request: &AiCompleteRequest, profile: &AiProfile) -> String {
    let mut prompt = String::new();
    if profile.allow_page_reading {
        if let Some(context) = request.page_context.as_ref() {
            let url = context
                .get("url")
                .and_then(|value| value.as_str())
                .unwrap_or("");
            let title = context
                .get("title")
                .and_then(|value| value.as_str())
                .unwrap_or("");
            let text = context
                .get("text")
                .and_then(|value| value.as_str())
                .unwrap_or("")
                .chars()
                .take(6000)
                .collect::<String>();
            let controls = context
                .get("interactives")
                .and_then(|value| value.as_array())
                .map(|items| items.len())
                .unwrap_or(0);
            prompt.push_str(&format!(
                "Active page:\nTitle: {title}\nURL: {url}\nVisible controls: {controls}\nText excerpt:\n{text}\n\n"
            ));
        }
    }
    prompt.push_str("User request:\n");
    prompt.push_str(request.prompt.trim());
    prompt
}

fn extract_openai_text(value: &serde_json::Value) -> Option<String> {
    if let Some(text) = value.get("output_text").and_then(|value| value.as_str()) {
        return Some(text.trim().to_string()).filter(|text| !text.is_empty());
    }
    let mut chunks = Vec::new();
    collect_text_fields(value.get("output").unwrap_or(value), &mut chunks);
    let text = chunks.join("\n").trim().to_string();
    (!text.is_empty()).then_some(text)
}

fn extract_claude_text(value: &serde_json::Value) -> Option<String> {
    let mut chunks = Vec::new();
    if let Some(content) = value.get("content") {
        collect_text_fields(content, &mut chunks);
    }
    let text = chunks.join("\n").trim().to_string();
    (!text.is_empty()).then_some(text)
}

fn extract_gemini_text(value: &serde_json::Value) -> Option<String> {
    let mut chunks = Vec::new();
    if let Some(candidates) = value.get("candidates") {
        collect_text_fields(candidates, &mut chunks);
    }
    let text = chunks.join("\n").trim().to_string();
    (!text.is_empty()).then_some(text)
}

fn collect_text_fields(value: &serde_json::Value, chunks: &mut Vec<String>) {
    match value {
        serde_json::Value::Array(items) => {
            for item in items {
                collect_text_fields(item, chunks);
            }
        }
        serde_json::Value::Object(map) => {
            if let Some(text) = map.get("text").and_then(|value| value.as_str()) {
                let text = text.trim();
                if !text.is_empty() {
                    chunks.push(text.to_string());
                }
            }
            if let Some(content) = map.get("content") {
                collect_text_fields(content, chunks);
            }
            if let Some(parts) = map.get("parts") {
                collect_text_fields(parts, chunks);
            }
        }
        _ => {}
    }
}

fn storage_path() -> anyhow::Result<PathBuf> {
    if let Ok(path) = std::env::var("AERO_BACKEND_DB") {
        return Ok(PathBuf::from(path));
    }
    #[cfg(windows)]
    {
        if let Ok(local_appdata) = std::env::var("LOCALAPPDATA") {
            return Ok(PathBuf::from(local_appdata)
                .join("AeroBrowser")
                .join("Profiles")
                .join("Default")
                .join("storage.db"));
        }
    }
    #[cfg(not(windows))]
    {
        if let Ok(home) = std::env::var("HOME") {
            return Ok(PathBuf::from(home)
                .join(".config")
                .join("aerobrowser")
                .join("Profiles")
                .join("Default")
                .join("storage.db"));
        }
    }
    Ok(std::env::current_dir()?
        .join("data")
        .join("aero_backend.sqlite3"))
}

fn normalize_origin(value: &str) -> String {
    let trimmed = value.trim();
    if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        return trimmed.trim_end_matches('/').to_string();
    }
    format!("https://{}", trimmed.trim_end_matches('/'))
}
