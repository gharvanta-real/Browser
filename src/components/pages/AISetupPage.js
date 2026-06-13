import { BaseComponent } from '../BaseComponent.js';
import { BackendClient, defaultProfile, defaultProviders } from '../../services/BackendClient.js';

export class AISetupPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            step: 1,
            loading: true,
            backendOnline: false,
            providers: defaultProviders,
            checks: [],
            profile: defaultProfile,
            selectedProvider: 'open_ai',
            draftKeys: {},
            providerTests: {},
            saveState: '',
            previewPrompt: 'Summarize this page and suggest the next safe action.',
            previewResponse: ''
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this.load();
    }

    async load() {
        let backendOnline = false;
        try {
            await BackendClient.getHealth();
            backendOnline = true;
        } catch {
            backendOnline = false;
        }

        const [providers, checks, profile] = await Promise.all([
            BackendClient.getProviders(),
            BackendClient.checkProviders(),
            BackendClient.getProfile()
        ]);

        this.setState({
            loading: false,
            backendOnline,
            providers,
            checks,
            profile,
            selectedProvider: profile.selected_provider || providers[0]?.provider || 'open_ai'
        });
    }

    template() {
        const { step, providers, checks, profile, selectedProvider, backendOnline, loading } = this.state;
        const selected = providers.find(provider => provider.provider === selectedProvider) || providers[0];
        const selectedCheck = checks.find(check => check.provider === selectedProvider);
        const readyCount = checks.filter(check => check.ready).length;

        if (loading) {
            return `
                <div class="ai-setup-page">
                    <div class="ai-setup-loading">Loading AI setup...</div>
                </div>
            `;
        }

        return `
            <div class="ai-setup-page">
                <div class="ai-setup-main">
                    <div class="ai-setup-header">
                        <div>
                            <h2>AI setup</h2>
                            <p>Choose manual or assistant-led browsing, connect providers, and lock down where AI can read or act.</p>
                        </div>
                        <div class="ai-backend-pill ${backendOnline ? 'online' : 'offline'}">
                            <span></span>${backendOnline ? 'Backend connected' : 'Local fallback'}
                        </div>
                    </div>

                    <div class="ai-stepper">
                        ${this.renderStepPill(1, 'Mode')}
                        ${this.renderStepPill(2, 'Providers')}
                        ${this.renderStepPill(3, 'Profile')}
                    </div>

                    <div class="ai-setup-grid">
                        <section class="ai-setup-panel">
                            ${step === 1 ? this.renderModeStep(profile) : ''}
                            ${step === 2 ? this.renderProviderStep(providers, selected, selectedCheck) : ''}
                            ${step === 3 ? this.renderProfileStep(profile, selected, readyCount) : ''}
                        </section>

                        <aside class="ai-setup-side">
                            ${this.renderUseMap(profile, selected, selectedCheck)}
                            ${this.renderPreview(selected, selectedCheck)}
                        </aside>
                    </div>
                </div>
            </div>
        `;
    }

    renderStepPill(index, label) {
        const active = this.state.step === index;
        return `<button class="ai-step-pill ${active ? 'active' : ''}" data-step="${index}"><span>${index}</span>${label}</button>`;
    }

    renderModeStep(profile) {
        return `
            <div class="ai-step-content">
                <h3>1. Control mode</h3>
                <p class="ai-muted">Start manual, then let AI assist only where you allow it.</p>
                <div class="ai-mode-toggle">
                    <button class="${profile.manual_mode ? 'active' : ''}" data-profile-field="manual_mode" data-profile-value="true">
                        Manual first
                        <small>You approve actions before AI moves.</small>
                    </button>
                    <button class="${!profile.manual_mode ? 'active' : ''}" data-profile-field="manual_mode" data-profile-value="false">
                        AI assisted
                        <small>AI can plan and queue safe actions.</small>
                    </button>
                </div>

                <div class="ai-setting-list">
                    ${this.renderSwitch('allow_page_reading', 'Allow page reading', 'AI can summarize pages using the accessibility tree.', profile.allow_page_reading)}
                    ${this.renderSwitch('allow_action_execution', 'Allow browser actions', 'Open, click, fill, scroll after safety checks.', profile.allow_action_execution)}
                    ${this.renderSwitch('require_confirmation_for_actions', 'Confirm sensitive actions', 'Always pause for payment, login, delete, submit, account changes.', profile.require_confirmation_for_actions)}
                </div>

                <div class="ai-step-actions">
                    <button class="ai-primary-btn" data-next-step="2">Continue to providers</button>
                </div>
            </div>
        `;
    }

    renderProviderStep(providers, selected, selectedCheck) {
        const modelOptions = selected.models?.length
            ? selected.models
            : [{ id: selected.model, label: selected.model, mode: selected.response_mode || 'fast' }];
        const selectedTest = this.state.providerTests[selected.provider];
        const canContinue = selectedTest?.ok;

        return `
            <div class="ai-step-content">
                <h3>2. Providers</h3>
                <p class="ai-muted">Connect one or more providers. Keys are stored by the backend using protected secret storage.</p>
                <div class="ai-provider-list">
                    ${providers.map(provider => this.renderProviderCard(provider)).join('')}
                </div>

                <div class="ai-provider-editor">
                    <div class="ai-provider-editor-head">
                        <strong>${selected.display_name}</strong>
                        <span class="${selectedCheck?.ready ? 'ready' : 'needs-setup'}">${selectedCheck?.ready ? 'Ready' : 'Setup needed'}</span>
                    </div>
                    <label>
                        Model
                        <select id="ai-model-select">
                            ${modelOptions.map(model => `
                                <option value="${model.id}" data-mode="${model.mode}" ${model.id === selected.model ? 'selected' : ''}>
                                    ${model.label}${model.recommended ? ' - recommended' : ''}
                                </option>
                            `).join('')}
                        </select>
                    </label>
                    <div class="ai-mode-segment">
                        <button class="${selected.response_mode !== 'thinking' ? 'active' : ''}" data-provider-mode="fast">Fast</button>
                        <button class="${selected.response_mode === 'thinking' ? 'active' : ''}" data-provider-mode="thinking">Thinking</button>
                    </div>
                    <p class="ai-limit-note">${this.renderModelLimit(selected, modelOptions)} ${selected.limit_note || ''}</p>
                    ${selected.provider === 'local' ? `
                        <label>
                            Local endpoint
                            <input id="ai-endpoint-input" value="${selected.endpoint || ''}" placeholder="http://127.0.0.1:11434">
                        </label>
                    ` : `
                        <label>
                            API key
                            <input id="ai-key-input" type="password" placeholder="${selected.api_key_configured ? 'Key saved. Leave blank to keep it.' : 'Paste API key'}">
                        </label>
                    `}
                    ${selectedCheck && selectedCheck.missing.length ? `<p class="ai-warning">Missing: ${selectedCheck.missing.join(', ')}</p>` : ''}
                    ${selectedTest ? `<p class="${selectedTest.ok ? 'ai-success' : 'ai-warning'}">${selectedTest.message}</p>` : ''}
                    <div class="ai-step-actions">
                        <button class="ai-secondary-btn" data-check-providers>Check setup</button>
                        <button class="ai-primary-btn" data-save-provider>Save provider</button>
                        <button class="ai-secondary-btn" data-test-provider>Test response</button>
                        <button class="ai-secondary-btn" data-next-step="3" ${canContinue ? '' : 'disabled'}>Continue</button>
                    </div>
                    <p class="ai-save-state">${this.state.saveState}</p>
                </div>
            </div>
        `;
    }

    renderProviderCard(provider) {
        const active = this.state.selectedProvider === provider.provider;
        const check = this.state.checks.find(item => item.provider === provider.provider);
        return `
            <button class="ai-provider-card ${active ? 'active' : ''}" data-provider="${provider.provider}">
                <span class="provider-mark">${provider.display_name.slice(0, 2)}</span>
                <span>
                    <strong>${provider.display_name}</strong>
                    <small>${provider.model}</small>
                </span>
                <em class="${check?.ready ? 'ready' : 'needs-setup'}">${check?.ready ? 'Ready' : 'Setup'}</em>
            </button>
        `;
    }

    renderProfileStep(profile, selected, readyCount) {
        return `
            <div class="ai-step-content">
                <h3>3. Final profile</h3>
                <p class="ai-muted">This is the active AI behavior profile Aero will use across search, side panel, and browser automation.</p>
                <div class="ai-final-profile">
                    <div><span>Provider</span><strong>${selected.display_name}</strong><button data-next-step="2">Edit</button></div>
                    <div><span>Response</span><strong>${profile.response_mode === 'thinking' ? 'Thinking' : 'Fast'}</strong><button data-next-step="2">Edit</button></div>
                    <div><span>Mode</span><strong>${profile.manual_mode ? 'Manual first' : 'AI assisted'}</strong><button data-next-step="1">Edit</button></div>
                    <div><span>Cloud AI</span><strong>${profile.allow_cloud_ai ? 'Allowed' : 'Off by default'}</strong></div>
                    <div><span>Ready providers</span><strong>${readyCount}</strong></div>
                </div>
                <div class="ai-setting-list compact">
                    ${this.renderSwitch('allow_cloud_ai', 'Allow cloud AI', 'Only page content allowed by privacy policy is sent.', profile.allow_cloud_ai)}
                    ${this.renderSwitch('allow_page_reading', 'Page summaries', 'Use AXTree/page content for answers.', profile.allow_page_reading)}
                    ${this.renderSwitch('allow_action_execution', 'Action execution', 'Queue browser actions after safety policy.', profile.allow_action_execution)}
                </div>
                <div class="ai-step-actions">
                    <button class="ai-primary-btn" data-save-profile>Save final profile</button>
                </div>
                <p class="ai-save-state">${this.state.saveState}</p>
            </div>
        `;
    }

    renderSwitch(field, title, desc, checked) {
        return `
            <label class="ai-switch-row">
                <span><strong>${title}</strong><small>${desc}</small></span>
                <input type="checkbox" data-profile-toggle="${field}" ${checked ? 'checked' : ''}>
                <i></i>
            </label>
        `;
    }

    renderUseMap(profile, selected, check) {
        return `
            <div class="ai-side-card">
                <h4>Where AI is used</h4>
                <div class="ai-use-row"><span>Search suggestions</span><strong>${selected.display_name}</strong></div>
                <div class="ai-use-row"><span>Response mode</span><strong>${selected.response_mode === 'thinking' ? 'Thinking' : 'Fast'}</strong></div>
                <div class="ai-use-row"><span>Page Q&A</span><strong>${profile.allow_page_reading ? 'On' : 'Off'}</strong></div>
                <div class="ai-use-row"><span>Action execution</span><strong>${profile.allow_action_execution ? 'Safety gated' : 'Disabled'}</strong></div>
                <div class="ai-use-row"><span>Provider status</span><strong>${check?.ready ? 'Ready' : 'Needs setup'}</strong></div>
            </div>
        `;
    }

    renderPreview(selected, check) {
        return `
            <div class="ai-side-card">
                <h4>Response check</h4>
                <textarea id="ai-preview-prompt">${this.state.previewPrompt}</textarea>
                <button class="ai-secondary-btn full" data-run-preview>Run preview</button>
                <div class="ai-preview-output">
                    ${this.state.previewResponse || `Aero will respond using ${selected.display_name}. ${check?.ready ? 'Setup is ready.' : 'Finish setup first.'}`}
                </div>
            </div>
        `;
    }

    afterRender() {
        this.querySelectorAll('[data-step], [data-next-step]').forEach(btn => {
            btn.addEventListener('click', () => {
                const step = parseInt(btn.getAttribute('data-step') || btn.getAttribute('data-next-step'), 10);
                this.setState({ step });
            });
        });

        this.querySelectorAll('[data-provider]').forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.getAttribute('data-provider');
                const selected = this.state.providers.find(item => item.provider === provider);
                this.updateProfile({ selected_provider: provider, response_mode: selected?.response_mode || 'fast' });
                this.setState({ selectedProvider: provider });
            });
        });

        this.querySelectorAll('[data-profile-toggle]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateProfile({ [input.getAttribute('data-profile-toggle')]: input.checked });
            });
        });

        this.querySelectorAll('[data-profile-field]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.updateProfile({ [btn.getAttribute('data-profile-field')]: btn.getAttribute('data-profile-value') === 'true' });
            });
        });

        const saveProvider = this.querySelector('[data-save-provider]');
        if (saveProvider) saveProvider.addEventListener('click', () => this.saveProvider());

        this.querySelectorAll('[data-provider-mode]').forEach(btn => {
            btn.addEventListener('click', () => this.updateProviderMode(btn.getAttribute('data-provider-mode')));
        });

        const modelSelect = this.querySelector('#ai-model-select');
        if (modelSelect) {
            modelSelect.addEventListener('change', () => {
                const selectedOption = modelSelect.selectedOptions?.[0];
                this.updateProviderModel(modelSelect.value, selectedOption?.dataset?.mode || 'fast');
            });
        }

        const checkProviders = this.querySelector('[data-check-providers]');
        if (checkProviders) checkProviders.addEventListener('click', () => this.refreshChecks());

        const testProvider = this.querySelector('[data-test-provider]');
        if (testProvider) testProvider.addEventListener('click', () => this.testProvider());

        const saveProfile = this.querySelector('[data-save-profile]');
        if (saveProfile) saveProfile.addEventListener('click', () => this.saveProfile());

        const runPreview = this.querySelector('[data-run-preview]');
        if (runPreview) runPreview.addEventListener('click', () => this.runPreview());
    }

    updateProfile(patch) {
        this.setState({ profile: { ...this.state.profile, ...patch }, saveState: '' });
    }

    async saveProvider() {
        const selected = this.state.providers.find(provider => provider.provider === this.state.selectedProvider);
        const modelSelect = this.querySelector('#ai-model-select');
        const model = modelSelect?.value || selected.model;
        const selectedOption = modelSelect?.selectedOptions?.[0];
        const responseMode = selected.response_mode || selectedOption?.dataset?.mode || 'fast';
        const key = this.querySelector('#ai-key-input')?.value || null;
        const endpoint = this.querySelector('#ai-endpoint-input')?.value || selected.endpoint;
        this.setState({ saveState: 'Saving provider...' });
        const saved = await BackendClient.configureProvider({
            provider: selected.provider,
            enabled: true,
            model,
            response_mode: responseMode,
            api_key: key,
            endpoint
        });
        const providers = this.state.providers.map(provider => provider.provider === saved.provider ? { ...provider, ...saved } : provider);
        const checks = await BackendClient.checkProviders();
        this.updateProfile({ selected_provider: saved.provider, response_mode: saved.response_mode });
        this.setState({ providers, checks, saveState: 'Provider saved. Run response test before continuing.' });
    }

    async refreshChecks() {
        this.setState({ checks: await BackendClient.checkProviders(), saveState: 'Setup checked.' });
    }

    updateProviderMode(responseMode) {
        const providers = this.state.providers.map(provider => provider.provider === this.state.selectedProvider
            ? { ...provider, response_mode: responseMode }
            : provider);
        this.setState({ providers, saveState: '' });
        this.updateProfile({ response_mode: responseMode });
    }

    updateProviderModel(model, responseMode) {
        const providers = this.state.providers.map(provider => provider.provider === this.state.selectedProvider
            ? { ...provider, model, response_mode: responseMode }
            : provider);
        this.setState({ providers, saveState: '' });
        this.updateProfile({ response_mode: responseMode });
    }

    async testProvider() {
        const selected = this.state.providers.find(provider => provider.provider === this.state.selectedProvider);
        this.setState({ saveState: 'Testing provider response...' });
        const result = await BackendClient.testProvider(selected.provider);
        const providerTests = { ...this.state.providerTests, [selected.provider]: result };
        this.setState({
            providerTests,
            saveState: result.ok ? 'Provider response verified.' : 'Provider test failed.'
        });
    }

    async saveProfile() {
        const profile = await BackendClient.saveProfile(this.state.profile);
        window.AppState.update(state => {
            state.aiProvider = profile.selected_provider;
            state.aiProfile = profile;
        });
        this.setState({ profile, saveState: 'AI profile saved and applied.' });
    }

    runPreview() {
        const prompt = this.querySelector('#ai-preview-prompt')?.value || this.state.previewPrompt;
        const provider = this.state.providers.find(item => item.provider === this.state.profile.selected_provider);
        const check = this.state.checks.find(item => item.provider === provider.provider);
        const response = check?.ready
            ? `Using ${provider.display_name} (${provider.model}): I can answer from the current page, then queue only safety-approved browser actions. Prompt received: "${prompt}"`
            : `${provider.display_name} is not ready yet. Save the required setup, then run this check again.`;
        this.setState({ previewPrompt: prompt, previewResponse: response });
    }

    renderModelLimit(selected, modelOptions) {
        const model = modelOptions.find(item => item.id === selected.model);
        if (!model?.input_token_limit && !model?.output_token_limit) {
            return 'Live limits depend on your provider account.';
        }
        return `Model tokens: ${model.input_token_limit?.toLocaleString() || 'unknown'} input / ${model.output_token_limit?.toLocaleString() || 'unknown'} output.`;
    }
}
