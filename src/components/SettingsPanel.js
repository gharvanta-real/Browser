import { BaseComponent } from './BaseComponent.js';

export class SettingsPanel extends BaseComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.state.activeTab) {
            this.state.activeTab = 'router';
        }
        window.AppState.subscribe(state => {
            this.setState({
                aiProvider: state.aiProvider,
                localVram: state.localVram,
                showBookmarksBar: state.showBookmarksBar !== false,
                showLeftSidebar: state.showLeftSidebar !== false
            });
        });
        super.connectedCallback();
    }

    template() {
        const activeTab = this.state.activeTab || 'router';
        const provider = this.state.aiProvider || 'claude';
        const vram = this.state.localVram || 4;
        const showBookmarksBar = this.state.showBookmarksBar !== false;
        const showLeftSidebar = this.state.showLeftSidebar !== false;

        return `
            <div class="settings-dialog">
                <!-- Left Navigation Menu -->
                <div class="settings-sidebar" style="background: rgba(0,0,0,0.03); border-right: 1px solid var(--color-border-light); display: flex; flex-direction: column;">
                    <div class="settings-nav-item ${activeTab === 'router' ? 'active' : ''}" data-tab="router" style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer; padding: 10px 16px; font-size: var(--font-size-xs);">
                        <i class="hgi-stroke hgi-chat-bot" style="font-size: 14px;"></i>
                        AI Model Router
                    </div>
                    <div class="settings-nav-item ${activeTab === 'safety' ? 'active' : ''}" data-tab="safety" style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer; padding: 10px 16px; font-size: var(--font-size-xs);">
                        <i class="hgi-stroke hgi-shield-01" style="font-size: 14px;"></i>
                        Safety & Privacy
                    </div>
                    <div class="settings-nav-item ${activeTab === 'general' ? 'active' : ''}" data-tab="general" style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer; padding: 10px 16px; font-size: var(--font-size-xs);">
                        <i class="hgi-stroke hgi-settings-01" style="font-size: 14px;"></i>
                        General Core
                    </div>
                </div>
                
                <!-- Right Settings Content Panel -->
                <div class="settings-content" style="padding: var(--spacing-lg); overflow-y: auto; display: flex; flex-direction: column; gap: var(--spacing-md); background: var(--color-toolbar-bg); color: var(--color-text-active); flex: 1;">
                    <div class="settings-header-inner" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing-md); margin-bottom: 8px;">
                        <h4 style="margin: 0; color: var(--color-text-active); font-family: var(--font-ui); font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); display: flex; align-items: center; gap: var(--spacing-sm);">
                            <i class="hgi-stroke ${activeTab === 'router' ? 'hgi-chat-bot' : activeTab === 'safety' ? 'hgi-shield-01' : 'hgi-settings-01'}" style="font-size: 16px;"></i>
                            ${activeTab === 'router' ? 'AI Model Router' : activeTab === 'safety' ? 'Safety & Privacy' : 'General Core Settings'}
                        </h4>
                        <button class="settings-close-btn" style="background: transparent; color: var(--color-text-inactive); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px;">
                            <i class="hgi-stroke hgi-cancel-01" style="font-size: 16px;"></i>
                        </button>
                    </div>

                    ${activeTab === 'router' ? `
                        <!-- AI Provider Configuration -->
                        <div class="settings-form-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing-md);">
                            <div class="settings-row-info">
                                <span class="settings-label" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">AI Model Provider</span>
                                <span class="settings-desc" style="font-size: var(--font-size-xs); color: var(--color-text-inactive); display: block;">Choose the primary model router backend.</span>
                            </div>
                            <select id="setting-provider-select" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md); padding: var(--spacing-sm) var(--spacing-md); color: var(--color-text-active); outline: none;">
                                <option value="claude" ${provider === 'claude' ? 'selected' : ''}>Claude 3.5 Sonnet (Default)</option>
                                <option value="openai" ${provider === 'openai' ? 'selected' : ''}>GPT-4o (Cloud API)</option>
                                <option value="gemini" ${provider === 'gemini' ? 'selected' : ''}>Gemini 3.5 Flash</option>
                                <option value="local" ${provider === 'local' ? 'selected' : ''}>Llama 3 8B (Local Offline)</option>
                            </select>
                        </div>

                        <!-- Local Inference Settings -->
                        <div class="settings-form-row ${provider === 'local' ? 'highlight-active' : ''}" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing-md);">
                            <div class="settings-row-info">
                                <span class="settings-label" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Max VRAM Allocation</span>
                                <span class="settings-desc" style="font-size: var(--font-size-xs); color: var(--color-text-inactive); display: block;">Limit local llama.cpp memory usage.</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                                <strong id="vram-val-display" style="color: var(--color-input-focus-border); font-size: var(--font-size-xs);">${vram} GB</strong>
                                <input type="range" id="setting-vram-slider" class="range-slider" min="1" max="16" step="0.5" value="${vram}">
                            </div>
                        </div>

                        <!-- Cloud API Key Inputs -->
                        <div class="settings-form-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing-md);">
                            <div class="settings-row-info">
                                <span class="settings-label" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Anthropic API Key</span>
                                <span class="settings-desc" style="font-size: var(--font-size-xs); color: var(--color-text-inactive); display: block;">Stored locally, encrypted via DPAPI.</span>
                            </div>
                            <input type="password" value="sk-ant-••••••••••••••••••••••••" placeholder="Enter key..." class="settings-text-input" style="color: var(--color-text-active); background: var(--color-input-bg); border: 1px solid var(--color-border-light); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md);">
                        </div>

                        <div class="settings-form-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing-md);">
                            <div class="settings-row-info">
                                <span class="settings-label" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">OpenAI API Key</span>
                                <span class="settings-desc" style="font-size: var(--font-size-xs); color: var(--color-text-inactive); display: block;">Stored locally, encrypted via DPAPI.</span>
                            </div>
                            <input type="password" value="sk-proj-••••••••••••••••••••••••" placeholder="Enter key..." class="settings-text-input" style="color: var(--color-text-active); background: var(--color-input-bg); border: 1px solid var(--color-border-light); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md);">
                        </div>

                        <!-- Token cost stats -->
                        <div class="settings-form-row" style="background: rgba(255, 255, 255, 0.02); border-radius: var(--border-radius-md); padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-xs); align-items: stretch; border: 1px solid var(--color-border-light);">
                            <h5 style="margin: 0 0 var(--spacing-xs); font-size: var(--font-size-xs); color: var(--color-text-muted);">Session Costs (Cloud LLMs)</h5>
                            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs);">
                                <span>Tokens Sent:</span>
                                <strong>14,802</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs);">
                                <span>Tokens Received:</span>
                                <strong>3,950</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); border-top: 1px solid rgba(255,255,255,0.05); padding-top: var(--spacing-xs); margin-top: var(--spacing-xs);">
                                <span>Estimated cost:</span>
                                <strong style="color: #81C784; font-weight: bold;">$0.046</strong>
                            </div>
                        </div>
                    ` : activeTab === 'safety' ? `
                        <!-- Storage and Privacy -->
                        <div class="settings-form-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing-md);">
                            <div class="settings-row-info">
                                <span class="settings-label" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Clear Secure History Logs</span>
                                <span class="settings-desc" style="font-size: var(--font-size-xs); color: var(--color-text-inactive); display: block;">Permanently purges local action audit trails.</span>
                            </div>
                            <button class="settings-danger-btn" id="btn-clear-history" style="background: rgba(232, 17, 35, 0.1); border: 1px solid rgba(232, 17, 35, 0.2); color: #E81123; padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer; transition: var(--transition-fast);">Purge Cache</button>
                        </div>
                    ` : `
                        <!-- General / Appearance Core -->
                        <div class="settings-form-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing-md);">
                            <div class="settings-row-info">
                                <span class="settings-label" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show Bookmarks Bar</span>
                                <span class="settings-desc" style="font-size: var(--font-size-xs); color: var(--color-text-inactive); display: block;">Display the bookmarks bar shelf under the address bar toolbar.</span>
                            </div>
                            <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0;">
                                <input type="checkbox" id="settings-toggle-bookmarks-bar" ${showBookmarksBar ? 'checked' : ''}>
                                <span class="slider-round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 34px; transition: .4s;"></span>
                            </label>
                        </div>

                        <div class="settings-form-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--spacing-md);">
                            <div class="settings-row-info">
                                <span class="settings-label" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show Left Sidebar</span>
                                <span class="settings-desc" style="font-size: var(--font-size-xs); color: var(--color-text-inactive); display: block;">Display the main sidebar navigation pane.</span>
                            </div>
                            <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0;">
                                <input type="checkbox" id="settings-toggle-left-sidebar" ${showLeftSidebar ? 'checked' : ''}>
                                <span class="slider-round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 34px; transition: .4s;"></span>
                            </label>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    afterRender() {
        const closeBtn = this.querySelector('.settings-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.classList.remove('open');
            });
        }

        // Close on clicking the backdrop of the settings panel
        this.addEventListener('click', (e) => {
            if (e.target === this) {
                this.classList.remove('open');
            }
        });

        // Tab Switching Bindings
        this.querySelectorAll('.settings-nav-item').forEach(nav => {
            nav.addEventListener('click', () => {
                const tab = nav.getAttribute('data-tab');
                this.setState({ activeTab: tab });
            });
        });

        // Tab-specific bindings
        const activeTab = this.state.activeTab || 'router';

        if (activeTab === 'router') {
            const providerSelect = this.querySelector('#setting-provider-select');
            if (providerSelect) {
                providerSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.aiProvider = val;
                    });
                });
            }

            const vramSlider = this.querySelector('#setting-vram-slider');
            const vramDisplay = this.querySelector('#vram-val-display');
            if (vramSlider && vramDisplay) {
                vramSlider.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    vramDisplay.innerText = `${val} GB`;
                });

                vramSlider.addEventListener('change', (e) => {
                    const val = parseFloat(e.target.value);
                    window.AppState.update(state => {
                        state.localVram = val;
                    });
                });
            }
        } else if (activeTab === 'safety') {
            const clearBtn = this.querySelector('#btn-clear-history');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    window.AppState.update(state => {
                        state.chatHistory = [
                            { sender: 'ai', text: 'History and task logs cleared. How can I help you today?' }
                        ];
                        state.taskLogs = [];
                    });
                    alert("Browsing history and secure action logs successfully purged!");
                });
            }
        } else if (activeTab === 'general') {
            const toggleBookmarks = this.querySelector('#settings-toggle-bookmarks-bar');
            if (toggleBookmarks) {
                toggleBookmarks.addEventListener('change', () => {
                    window.AppState.update(state => {
                        state.showBookmarksBar = toggleBookmarks.checked;
                    });
                });
            }

            const toggleLeftSidebar = this.querySelector('#settings-toggle-left-sidebar');
            if (toggleLeftSidebar) {
                toggleLeftSidebar.addEventListener('change', () => {
                    window.AppState.update(state => {
                        state.showLeftSidebar = toggleLeftSidebar.checked;
                    });
                });
            }
        }
    }
}
