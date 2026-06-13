// StartupTab.js - Extracted from SettingsPage.js

export function renderStartupTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    return `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">On Startup</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Open New Tab page -->
                            <label class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Open the New Tab page')}">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Open the New Tab page</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Starts with the clean dashboard and quick access cards.</span>
                                </div>
                                <input type="radio" name="startup-option" value="newtab" ${state.startupPage === 'newtab' ? 'checked' : ''} style="accent-color: var(--color-input-focus-border); cursor: pointer; border: none; outline: none;">
                            </label>

                            <!-- Continue where you left off -->
                            <label class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Continue where you left off')}">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Continue where you left off</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Reopens tabs and sessions from the last active window.</span>
                                </div>
                                <input type="radio" name="startup-option" value="continue" ${state.startupPage === 'continue' ? 'checked' : ''} style="accent-color: var(--color-input-focus-border); cursor: pointer; border: none; outline: none;">
                            </label>

                            <!-- Open specific page -->
                            <label class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); cursor: pointer; ${getRowStyle('Open a specific page or set of pages')}">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Open a specific page or set of pages</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Load custom homepages or workspace portals automatically.</span>
                                </div>
                                <input type="radio" name="startup-option" value="specific" ${state.startupPage === 'specific' ? 'checked' : ''} style="accent-color: var(--color-input-focus-border); cursor: pointer; border: none; outline: none;">
                            </label>

                            <!-- Custom URL Input (Conditional) -->
                            ${state.startupPage === 'specific' ? `
                                <div style="display: flex; gap: var(--spacing-sm); padding: var(--spacing-md) var(--spacing-lg); border-top: 1px solid var(--color-viewport-border); background: var(--color-input-bg); align-items: center;">
                                    <input type="text" id="startup-url-input" value="${state.startupUrl || ''}" placeholder="Enter specific page URL..." style="flex: 1; ${inputStyle}">
                                    <button id="btn-save-startup" style="background: var(--color-input-focus-border); color: #FFFFFF; border: none; outline: none; border-radius: var(--border-radius-sm); padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer;">Save</button>
                                </div>
                            ` : ''}

                        </div>
                    </div>
                
    `;
}

export function bindStartupTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'startup') return;
    
    settingsPage.querySelectorAll('input[name="startup-option"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.startupPage = val;
            });
        });
    });

    const saveBtn = settingsPage.querySelector('#btn-save-startup');
    const urlInput = settingsPage.querySelector('#startup-url-input');
    if (saveBtn && urlInput) {
        saveBtn.addEventListener('click', () => {
            const val = urlInput.value.trim();
            window.AppState.update(state => {
                state.startupUrl = val;
            });
            alert(`Startup page successfully saved: ${val}`);
        });
    }
}
