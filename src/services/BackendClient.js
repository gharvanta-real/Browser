const BACKEND_BASE_URL = 'http://127.0.0.1:4978';

const defaultProviders = [
    { provider: 'open_ai', display_name: 'OpenAI', enabled: false, model: 'gpt-5-mini', response_mode: 'fast', api_key_configured: false, endpoint: null, models: [], limit_note: 'Account-specific RPM/TPM and spend limits.' },
    { provider: 'claude', display_name: 'Claude', enabled: false, model: 'claude-sonnet-4-6', response_mode: 'fast', api_key_configured: false, endpoint: null, models: [], limit_note: 'Usage-tier RPM/TPM and spend limits.' },
    {
        provider: 'gemini',
        display_name: 'Gemini',
        enabled: false,
        model: 'gemini-3.5-flash',
        response_mode: 'fast',
        api_key_configured: false,
        endpoint: null,
        models: [
            { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', mode: 'fast', input_token_limit: 1048576, output_token_limit: 65536, recommended: true },
            { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview', mode: 'thinking', input_token_limit: 1048576, output_token_limit: 65536, recommended: false },
            { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', mode: 'fast', input_token_limit: 1048576, output_token_limit: 65536, recommended: false },
            { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', mode: 'thinking', input_token_limit: 1048576, output_token_limit: 65536, recommended: false },
            { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', mode: 'fast', input_token_limit: 1048576, output_token_limit: 65536, recommended: false }
        ],
        limit_note: 'Project/model RPM, TPM, and RPD limits in AI Studio; exact live quota depends on account tier.'
    },
    { provider: 'local', display_name: 'Local', enabled: true, model: 'llama-3.1-8b', response_mode: 'fast', api_key_configured: true, endpoint: 'http://127.0.0.1:11434', models: [], limit_note: 'Local runtime hardware and queue limits.' }
];

const defaultProfile = {
    selected_provider: 'open_ai',
    response_mode: 'fast',
    manual_mode: true,
    allow_cloud_ai: false,
    allow_page_reading: true,
    allow_action_execution: false,
    require_confirmation_for_actions: true
};

export class BackendClient {
    static async getHealth() {
        return this.request('/health');
    }

    static async getProviders() {
        return this.request('/v1/ai/providers', { fallback: defaultProviders });
    }

    static async configureProvider(payload) {
        const saved = await this.request('/v1/ai/providers/configure', {
            method: 'POST',
            body: payload,
            fallback: {
                ...payload,
                display_name: providerLabel(payload.provider),
                api_key_configured: Boolean(payload.api_key)
            }
        });
        return saved;
    }

    static async checkProviders() {
        return this.request('/v1/ai/providers/check', {
            fallback: defaultProviders.map(provider => ({
                provider: provider.provider,
                ready: provider.enabled && (provider.provider === 'local' || provider.api_key_configured),
                missing: provider.enabled && provider.provider !== 'local' && !provider.api_key_configured ? ['api_key'] : [],
                warnings: provider.enabled ? [] : ['Provider is disabled.']
            }))
        });
    }

    static async testProvider(provider) {
        return this.request('/v1/ai/providers/test', {
            method: 'POST',
            body: { provider },
            fallback: {
                provider,
                ok: false,
                model: '',
                response_mode: 'fast',
                message: 'Backend offline. Start the backend to run a real provider response check.'
            }
        });
    }

    static async getProfile() {
        return this.request('/v1/ai/profile', { fallback: this.localProfile() });
    }

    static async saveProfile(profile) {
        localStorage.setItem('aero.ai.profile', JSON.stringify(profile));
        return this.request('/v1/ai/profile', {
            method: 'POST',
            body: profile,
            fallback: profile
        });
    }

    static async evaluateAutomation(command, options = {}) {
        return this.request('/v1/automation/evaluate', {
            method: 'POST',
            body: {
                command,
                origin: options.origin || null,
                user_visible_reason: options.reason || 'User requested browser action'
            }
        });
    }

    static async compileCdp(command) {
        return this.request('/v1/automation/compile-cdp', {
            method: 'POST',
            body: { command }
        });
    }

    static async loadStateSnapshot() {
        return this.request('/v1/state/snapshot', {
            fallback: { snapshot: null }
        });
    }

    static async saveStateSnapshot(snapshot) {
        return this.request('/v1/state/snapshot', {
            method: 'POST',
            body: { snapshot },
            fallback: { snapshot }
        });
    }

    static async getAuditLog() {
        return this.request('/v1/security/audit-log', {
            fallback: { events: [] }
        });
    }

    static async request(path, options = {}) {
        const { fallback, method = 'GET', body } = options;
        try {
            const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
                method,
                headers: body ? { 'Content-Type': 'application/json' } : undefined,
                body: body ? JSON.stringify(body) : undefined
            });
            if (!response.ok) {
                throw new Error(`Backend ${response.status}`);
            }
            return response.json();
        } catch (error) {
            if (fallback !== undefined) {
                return fallback;
            }
            throw error;
        }
    }

    static localProfile() {
        try {
            return JSON.parse(localStorage.getItem('aero.ai.profile')) || defaultProfile;
        } catch {
            return defaultProfile;
        }
    }
}

function providerLabel(provider) {
    return {
        open_ai: 'OpenAI',
        claude: 'Claude',
        gemini: 'Gemini',
        local: 'Local'
    }[provider] || provider;
}

export { defaultProviders, defaultProfile, BACKEND_BASE_URL };
