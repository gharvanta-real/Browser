use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum AiProvider {
    OpenAi,
    Claude,
    Gemini,
    Local,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, PartialEq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum AiResponseMode {
    Fast,
    Thinking,
}

impl Default for AiResponseMode {
    fn default() -> Self {
        Self::Fast
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiModelOption {
    pub id: String,
    pub label: String,
    pub mode: AiResponseMode,
    pub input_token_limit: Option<u32>,
    pub output_token_limit: Option<u32>,
    pub limit_note: String,
    pub recommended: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiProviderSettings {
    pub provider: AiProvider,
    pub enabled: bool,
    pub display_name: String,
    pub model: String,
    #[serde(default)]
    pub response_mode: AiResponseMode,
    pub api_key_configured: bool,
    pub endpoint: Option<String>,
    #[serde(default)]
    pub models: Vec<AiModelOption>,
    pub limit_note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiProviderSetupRequest {
    pub provider: AiProvider,
    pub enabled: bool,
    pub model: String,
    #[serde(default)]
    pub response_mode: AiResponseMode,
    pub api_key: Option<String>,
    pub endpoint: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiProviderCheck {
    pub provider: AiProvider,
    pub ready: bool,
    pub missing: Vec<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiProfile {
    pub selected_provider: AiProvider,
    #[serde(default)]
    pub response_mode: AiResponseMode,
    pub manual_mode: bool,
    pub allow_cloud_ai: bool,
    pub allow_page_reading: bool,
    pub allow_action_execution: bool,
    pub require_confirmation_for_actions: bool,
}

impl Default for AiProfile {
    fn default() -> Self {
        Self {
            selected_provider: AiProvider::OpenAi,
            response_mode: AiResponseMode::Fast,
            manual_mode: true,
            allow_cloud_ai: false,
            allow_page_reading: true,
            allow_action_execution: false,
            require_confirmation_for_actions: true,
        }
    }
}

pub fn default_provider_settings() -> Vec<AiProviderSettings> {
    vec![
        AiProviderSettings {
            provider: AiProvider::OpenAi,
            enabled: false,
            display_name: "OpenAI".to_string(),
            model: "gpt-5-mini".to_string(),
            response_mode: AiResponseMode::Fast,
            api_key_configured: false,
            endpoint: None,
            models: model_options(AiProvider::OpenAi),
            limit_note: provider_limit_note(AiProvider::OpenAi).to_string(),
        },
        AiProviderSettings {
            provider: AiProvider::Claude,
            enabled: false,
            display_name: "Claude".to_string(),
            model: "claude-sonnet-4-6".to_string(),
            response_mode: AiResponseMode::Fast,
            api_key_configured: false,
            endpoint: None,
            models: model_options(AiProvider::Claude),
            limit_note: provider_limit_note(AiProvider::Claude).to_string(),
        },
        AiProviderSettings {
            provider: AiProvider::Gemini,
            enabled: false,
            display_name: "Gemini".to_string(),
            model: "gemini-3.5-flash".to_string(),
            response_mode: AiResponseMode::Fast,
            api_key_configured: false,
            endpoint: None,
            models: model_options(AiProvider::Gemini),
            limit_note: provider_limit_note(AiProvider::Gemini).to_string(),
        },
        AiProviderSettings {
            provider: AiProvider::Local,
            enabled: true,
            display_name: "Local".to_string(),
            model: "llama-3.1-8b".to_string(),
            response_mode: AiResponseMode::Fast,
            api_key_configured: true,
            endpoint: Some("http://127.0.0.1:11434".to_string()),
            models: model_options(AiProvider::Local),
            limit_note: provider_limit_note(AiProvider::Local).to_string(),
        },
    ]
}

pub fn check_provider(settings: &AiProviderSettings) -> AiProviderCheck {
    let mut missing = Vec::new();
    let mut warnings = Vec::new();

    if !settings.enabled {
        warnings.push("Provider is disabled.".to_string());
    }
    if settings.model.trim().is_empty() {
        missing.push("model".to_string());
    }
    if settings.provider != AiProvider::Local && !settings.api_key_configured {
        missing.push("api_key".to_string());
    }
    if settings.provider == AiProvider::Local
        && settings.endpoint.as_deref().unwrap_or("").is_empty()
    {
        missing.push("local_endpoint".to_string());
    }

    AiProviderCheck {
        provider: settings.provider,
        ready: missing.is_empty() && settings.enabled,
        missing,
        warnings,
    }
}

pub fn model_options(provider: AiProvider) -> Vec<AiModelOption> {
    match provider {
        AiProvider::OpenAi => vec![
            model(
                "gpt-5-mini",
                "GPT-5 Mini",
                AiResponseMode::Fast,
                None,
                None,
                true,
                provider_limit_note(provider),
            ),
            model(
                "gpt-5",
                "GPT-5",
                AiResponseMode::Thinking,
                None,
                None,
                false,
                provider_limit_note(provider),
            ),
            model(
                "gpt-4.1-mini",
                "GPT-4.1 Mini",
                AiResponseMode::Fast,
                None,
                None,
                false,
                provider_limit_note(provider),
            ),
            model(
                "gpt-4.1",
                "GPT-4.1",
                AiResponseMode::Thinking,
                None,
                None,
                false,
                provider_limit_note(provider),
            ),
        ],
        AiProvider::Claude => vec![
            model(
                "claude-sonnet-4-6",
                "Claude Sonnet 4.6",
                AiResponseMode::Fast,
                None,
                None,
                true,
                provider_limit_note(provider),
            ),
            model(
                "claude-opus-4-8",
                "Claude Opus 4.8",
                AiResponseMode::Thinking,
                None,
                None,
                false,
                provider_limit_note(provider),
            ),
            model(
                "claude-haiku-4-5",
                "Claude Haiku 4.5",
                AiResponseMode::Fast,
                None,
                None,
                false,
                provider_limit_note(provider),
            ),
        ],
        AiProvider::Gemini => vec![
            model(
                "gemini-3.5-flash",
                "Gemini 3.5 Flash",
                AiResponseMode::Fast,
                Some(1_048_576),
                Some(65_536),
                true,
                provider_limit_note(provider),
            ),
            model(
                "gemini-3.1-pro-preview",
                "Gemini 3.1 Pro Preview",
                AiResponseMode::Thinking,
                Some(1_048_576),
                Some(65_536),
                false,
                provider_limit_note(provider),
            ),
            model(
                "gemini-3.1-flash-lite",
                "Gemini 3.1 Flash-Lite",
                AiResponseMode::Fast,
                Some(1_048_576),
                Some(65_536),
                false,
                provider_limit_note(provider),
            ),
            model(
                "gemini-2.5-pro",
                "Gemini 2.5 Pro",
                AiResponseMode::Thinking,
                Some(1_048_576),
                Some(65_536),
                false,
                provider_limit_note(provider),
            ),
            model(
                "gemini-2.5-flash",
                "Gemini 2.5 Flash",
                AiResponseMode::Fast,
                Some(1_048_576),
                Some(65_536),
                false,
                provider_limit_note(provider),
            ),
        ],
        AiProvider::Local => vec![
            model(
                "llama-3.1-8b",
                "Llama 3.1 8B",
                AiResponseMode::Fast,
                None,
                None,
                true,
                provider_limit_note(provider),
            ),
            model(
                "qwen2.5-7b",
                "Qwen 2.5 7B",
                AiResponseMode::Fast,
                None,
                None,
                false,
                provider_limit_note(provider),
            ),
            model(
                "qwen2.5-14b",
                "Qwen 2.5 14B",
                AiResponseMode::Thinking,
                None,
                None,
                false,
                provider_limit_note(provider),
            ),
            model(
                "mistral-7b",
                "Mistral 7B",
                AiResponseMode::Fast,
                None,
                None,
                false,
                provider_limit_note(provider),
            ),
        ],
    }
}

pub fn provider_limit_note(provider: AiProvider) -> &'static str {
    match provider {
        AiProvider::OpenAi => {
            "Rate limits are account/project specific and enforced across RPM, TPM, RPD/TPD, and spend limits; read live limits from the provider dashboard."
        }
        AiProvider::Claude => {
            "Limits are organization/workspace usage-tier based with spend limits, RPM, and TPM; current limits are visible in the Claude Console."
        }
        AiProvider::Gemini => {
            "Gemini limits are per project and model across RPM, input TPM, and RPD; active quotas depend on billing tier and are shown live in Google AI Studio/Cloud."
        }
        AiProvider::Local => {
            "Local limits depend on the installed runtime, model size, RAM/VRAM, and configured server queue."
        }
    }
}

fn model(
    id: &str,
    label: &str,
    mode: AiResponseMode,
    input_token_limit: Option<u32>,
    output_token_limit: Option<u32>,
    recommended: bool,
    limit_note: &str,
) -> AiModelOption {
    AiModelOption {
        id: id.to_string(),
        label: label.to_string(),
        mode,
        input_token_limit,
        output_token_limit,
        limit_note: limit_note.to_string(),
        recommended,
    }
}
