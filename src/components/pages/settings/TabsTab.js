// TabsTab.js - Extracted from SettingsPage.js

export function renderTabsTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    return `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Tabs & Sidebar</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: var(--spacing-xl);">
                            
                            <!-- Tab Layout Selector -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Tab Layout Horizontal Vertical selector')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-grid-view" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Tab Strip Layout</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Choose where your active tabs list should be presented.</span>
                                    </div>
                                </div>
                                <select id="tabs-layout-select" style="${selectStyle}">
                                    <option value="horizontal" ${state.tabLayout === 'horizontal' ? 'selected' : ''}>Horizontal tabs</option>
                                    <option value="vertical" ${state.tabLayout === 'vertical' ? 'selected' : ''}>Vertical sidebar tabs</option>
                                </select>
                            </div>

                        </div>

                        <h4 style="margin: 0 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">AI Sidebar Settings</h4>
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Toggle show AI sidebar by default -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Show AI Assistant Sidebar by default')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show AI Assistant Sidebar by default</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Keeps the AI companion pane open on startup.</span>
                                </div>
                                ${renderToggle('tabs-ai-sidebar-toggle', state.showAiSidebar)}
                            </div>

                            <!-- Toggle accessibility inspector -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Show Accessibility Tree Inspector overlay')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show Accessibility Tree Inspector overlay</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Shows bounding boxes of elements for Accessibility Tree tracking.</span>
                                </div>
                                ${renderToggle('tabs-ai-view-toggle', state.showAiView)}
                            </div>

                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('AI webpage control enable disable browser automation page control')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">AI webpage control</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Allow assistant prompts to click, type, scroll, and navigate visible web pages.</span>
                                </div>
                                ${renderToggle('tabs-ai-control-toggle', state.aiControlEnabled !== false)}
                            </div>

                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Live AI cursor show mouse cursor moving typing animation')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show live AI cursor</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Display mouse movement, click pulses, and typing status while AI acts.</span>
                                </div>
                                ${renderToggle('tabs-ai-cursor-toggle', state.aiShowLiveCursor !== false)}
                            </div>

                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Human typing character by character speed')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Human-style typing</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Type character-by-character so form filling is visible and easier to interrupt.</span>
                                </div>
                                ${renderToggle('tabs-ai-human-typing-toggle', state.aiHumanTyping !== false)}
                            </div>

                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('AI action delay speed mouse typing delay')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">AI action speed</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Lower is faster; higher makes cursor and typing easier to watch.</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: var(--spacing-md); flex-shrink: 0;">
                                    <strong id="tabs-ai-speed-display" style="color: var(--color-input-focus-border); font-size: var(--font-size-xs);">${state.aiActionDelayMs ?? 160} ms</strong>
                                    <input type="range" id="tabs-ai-speed-slider" class="range-slider" min="0" max="500" step="20" value="${state.aiActionDelayMs ?? 160}" style="outline: none;">
                                </div>
                            </div>

                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Require confirmation for AI actions safety permission')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Confirm sensitive actions</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Keep native confirmation on for purchases, submissions, account changes, and sensitive typing.</span>
                                </div>
                                ${renderToggle('tabs-ai-confirm-toggle', state.aiRequireConfirmation !== false)}
                            </div>

                            <!-- AI provider select -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Default AI Model Provider Claude GPT Gemini Llama')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Default AI Model Provider</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Primary intelligence engine routing your companion requests.</span>
                                </div>
                                <select id="tabs-ai-provider-select" style="${selectStyle}">
                                    <option value="claude" ${state.aiProvider === 'claude' ? 'selected' : ''}>Claude 3.5 Sonnet</option>
                                    <option value="openai" ${state.aiProvider === 'openai' ? 'selected' : ''}>GPT-4o (Cloud API)</option>
                                    <option value="gemini" ${state.aiProvider === 'gemini' ? 'selected' : ''}>Gemini 3.5 Flash</option>
                                    <option value="local" ${state.aiProvider === 'local' ? 'selected' : ''}>Llama 3 8B (Local)</option>
                                </select>
                            </div>

                            <!-- Local VRAM Slider -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Local inference VRAM limit allocation slider')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Local LLM VRAM Limit</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Allocated GPU memory for local offline model running.</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: var(--spacing-md); flex-shrink: 0;">
                                    <strong id="tabs-vram-display" style="color: var(--color-input-focus-border); font-size: var(--font-size-xs);">${state.localVram || 4} GB</strong>
                                    <input type="range" id="tabs-vram-slider" class="range-slider" min="1" max="16" step="0.5" value="${state.localVram || 4}" style="outline: none;">
                                </div>
                            </div>

                        </div>
                    </div>
                
    `;
}

export function bindTabsTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'tabs') return;
    
    const layoutSelect = settingsPage.querySelector('#tabs-layout-select');
    if (layoutSelect) {
        layoutSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.tabLayout = val;
            });
        });
    }

    const aiSidebarToggle = settingsPage.querySelector('#tabs-ai-sidebar-toggle');
    if (aiSidebarToggle) {
        aiSidebarToggle.addEventListener('change', (e) => {
            const val = e.target.checked;
            window.AppState.update(state => {
                state.showAiSidebar = val;
            });
        });
    }

    const aiViewToggle = settingsPage.querySelector('#tabs-ai-view-toggle');
    if (aiViewToggle) {
        aiViewToggle.addEventListener('change', (e) => {
            const val = e.target.checked;
            window.AppState.update(state => {
                state.showAiView = val;
            });
        });
    }

    const aiControlToggle = settingsPage.querySelector('#tabs-ai-control-toggle');
    if (aiControlToggle) {
        aiControlToggle.addEventListener('change', (e) => {
            const val = e.target.checked;
            window.AppState.update(state => {
                state.aiControlEnabled = val;
                state.aiAllowActionExecution = val;
            });
        });
    }

    const aiCursorToggle = settingsPage.querySelector('#tabs-ai-cursor-toggle');
    if (aiCursorToggle) {
        aiCursorToggle.addEventListener('change', (e) => {
            window.AppState.update(state => {
                state.aiShowLiveCursor = e.target.checked;
            });
        });
    }

    const aiHumanTypingToggle = settingsPage.querySelector('#tabs-ai-human-typing-toggle');
    if (aiHumanTypingToggle) {
        aiHumanTypingToggle.addEventListener('change', (e) => {
            window.AppState.update(state => {
                state.aiHumanTyping = e.target.checked;
            });
        });
    }

    const aiConfirmToggle = settingsPage.querySelector('#tabs-ai-confirm-toggle');
    if (aiConfirmToggle) {
        aiConfirmToggle.addEventListener('change', (e) => {
            window.AppState.update(state => {
                state.aiRequireConfirmation = e.target.checked;
            });
        });
    }

    const aiSpeedSlider = settingsPage.querySelector('#tabs-ai-speed-slider');
    const aiSpeedDisplay = settingsPage.querySelector('#tabs-ai-speed-display');
    if (aiSpeedSlider && aiSpeedDisplay) {
        aiSpeedSlider.addEventListener('input', (e) => {
            aiSpeedDisplay.innerText = `${parseInt(e.target.value, 10)} ms`;
        });
        aiSpeedSlider.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            window.AppState.update(state => {
                state.aiActionDelayMs = val;
                state.aiTypingDelayMs = Math.max(0, Math.round(val / 6));
            });
        });
    }

    const aiProviderSelect = settingsPage.querySelector('#tabs-ai-provider-select');
    if (aiProviderSelect) {
        aiProviderSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.aiProvider = val;
            });
        });
    }

    const vramSlider = settingsPage.querySelector('#tabs-vram-slider');
    const vramDisplay = settingsPage.querySelector('#tabs-vram-display');
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
}
