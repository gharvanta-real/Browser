// PrivacyTab.js - Extracted from SettingsPage.js

export function renderPrivacyTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    const provider = state.aiProvider || 'claude';
    return `
        <div class="settings-section">
            <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Privacy & Security</h3>
            
            <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                
                <!-- Tracking Protection Row -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Tracking protection Block trackers and limit ad personalization')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-shield-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Tracking protection</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Block trackers and limit ad personalization. This setting applies to all profiles.</span>
                        </div>
                    </div>
                    <select id="settings-tracking-protection" style="${selectStyle}">
                        <option value="balanced" ${state.trackingProtection === 'balanced' ? 'selected' : ''}>Balanced (recommended)</option>
                        <option value="strict" ${state.trackingProtection === 'strict' ? 'selected' : ''}>Strict</option>
                        <option value="basic" ${state.trackingProtection === 'basic' ? 'selected' : ''}>Basic</option>
                    </select>
                </div>

                <!-- Secure DNS Row -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Secure DNS Use a secure connection to look up website addresses')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-globe" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Secure DNS</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Use a secure connection to look up website addresses.</span>
                        </div>
                    </div>
                    <select id="settings-provider-select" style="${selectStyle}">
                        <option value="claude" ${provider === 'claude' ? 'selected' : ''}>Claude 3.5 Sonnet (Default)</option>
                        <option value="openai" ${provider === 'openai' ? 'selected' : ''}>GPT-4o (Cloud API)</option>
                        <option value="gemini" ${provider === 'gemini' ? 'selected' : ''}>Gemini 3.5 Flash</option>
                        <option value="local" ${provider === 'local' ? 'selected' : ''}>Llama 3 8B (Local)</option>
                    </select>
                </div>

                <!-- Cookie controls -->
                <div class="settings-item-row" id="btn-cookie-controls" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Cookie controls Choose how Aero handles cookies and site data')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-note-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Cookie controls</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Choose how Aero handles cookies and site data.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

                <!-- Site permissions -->
                <div class="settings-item-row" id="btn-site-permissions" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Site permissions Control what information sites can use')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-settings-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Site permissions</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Control what information sites can use and what content they can show you.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

                <!-- Password manager -->
                <div class="settings-item-row" id="btn-password-manager" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Password manager Manage saved passwords')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-lock" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Password manager</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Manage saved passwords, passkeys, and autofill.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

                <!-- Clear browsing data -->
                <div class="settings-item-row" id="btn-clear-history-page" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Clear browsing data Clear history, cookies, cache')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-clock-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Clear browsing data</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Clear history, cookies, cache, and more.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

                <!-- Safety check -->
                <div class="settings-item-row" id="btn-safety-check" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); cursor: pointer; ${getRowStyle('Safety check Review important security and privacy settings')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-checkmark-circle-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Safety check</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Review important security and privacy settings.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

            </div>

            <!-- Focus & browsing protection -->
            <h4 style="margin: var(--spacing-xl) 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Focus & browsing protection</h4>
            <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                <!-- Focus mode -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Focus mode Block distracting sites, harmful content, and intrusive ads')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Focus mode</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Block distracting sites, harmful content, and intrusive ads.</span>
                    </div>
                    ${renderToggle('settings-focus-mode-toggle', state.focusMode)}
                </div>

                <!-- Safe browsing -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Safe browsing Protect against dangerous sites, downloads, and extensions')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Safe browsing</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Protect against dangerous sites, downloads, and extensions.</span>
                    </div>
                    <select id="settings-safe-browsing-select" style="${selectStyle}">
                        <option value="enhanced" ${state.safeBrowsing === 'enhanced' ? 'selected' : ''}>Enhanced protection</option>
                        <option value="standard" ${state.safeBrowsing === 'standard' ? 'selected' : ''}>Standard protection</option>
                        <option value="none" ${state.safeBrowsing === 'none' ? 'selected' : ''}>No protection</option>
                    </select>
                </div>
            </div>

            <!-- Privacy quick settings -->
            <h4 style="margin: var(--spacing-xl) 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Privacy quick settings</h4>
            <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                <!-- DNT Toggle -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Send a Do Not Track request')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Send a "Do Not Track" request</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Ask sites not to track you</span>
                    </div>
                    ${renderToggle('dnt-toggle', state.dntEnabled !== false)}
                </div>

                <!-- Preload pages -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Preload pages for faster browsing and searching')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Preload pages for faster browsing and searching</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Prefetch information from pages, including those you have not yet visited</span>
                    </div>
                    ${renderToggle('preload-toggle', state.preloadPages !== false)}
                </div>

                <!-- Help improve -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Help improve Aero send crash reports')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Help improve Aero</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Automatically send usage statistics and crash reports</span>
                    </div>
                    ${renderToggle('improve-toggle', state.helpImprove === true)}
                </div>
            </div>
        </div>
    `;
}

export function bindPrivacyTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'privacy') return;
    
    const providerSelect = settingsPage.querySelector('#settings-provider-select');
    if (providerSelect) {
        providerSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.aiProvider = val;
            });
        });
    }

    const trackingSelect = settingsPage.querySelector('#settings-tracking-protection');
    if (trackingSelect) {
        trackingSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.trackingProtection = val;
            });
        });
    }

    const clearBtn = settingsPage.querySelector('#btn-clear-history-page');
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

    const focusToggle = settingsPage.querySelector('#settings-focus-mode-toggle');
    if (focusToggle) {
        focusToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.focusMode = checked;
            });
        });
    }

    const safeBrowsingSelect = settingsPage.querySelector('#settings-safe-browsing-select');
    if (safeBrowsingSelect) {
        safeBrowsingSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.safeBrowsing = val;
            });
        });
    }

    const dntToggle = settingsPage.querySelector('#dnt-toggle');
    if (dntToggle) {
        dntToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.dntEnabled = checked;
            });
        });
    }

    const preloadToggle = settingsPage.querySelector('#preload-toggle');
    if (preloadToggle) {
        preloadToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.preloadPages = checked;
            });
        });
    }

    const improveToggle = settingsPage.querySelector('#improve-toggle');
    if (improveToggle) {
        improveToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.helpImprove = checked;
            });
        });
    }

    // Interactive mock alerts for site permissions / cookie controls
    const cookieBtn = settingsPage.querySelector('#btn-cookie-controls');
    if (cookieBtn) {
        cookieBtn.addEventListener('click', () => {
            alert("Cookie Management & Exceptions Panel: Block third-party cookies enabled.");
        });
    }

    const permissionsBtn = settingsPage.querySelector('#btn-site-permissions');
    if (permissionsBtn) {
        permissionsBtn.addEventListener('click', () => {
            alert("Site Permissions Manager: Access to Camera, Microphone, and Location successfully controlled.");
        });
    }

    const passwordsBtn = settingsPage.querySelector('#btn-password-manager');
    if (passwordsBtn) {
        passwordsBtn.addEventListener('click', () => {
            settingsPage.navigateTabSafely('aero://passwords');
        });
    }

    const safetyCheckBtn = settingsPage.querySelector('#btn-safety-check');
    if (safetyCheckBtn) {
        safetyCheckBtn.addEventListener('click', () => {
            alert("Safety check started... No compromised passwords or malicious extensions found. Aero is secure!");
        });
    }
}
