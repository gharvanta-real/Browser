// AboutTab.js - Extracted from SettingsPage.js

export function renderAboutTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    return `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">About Aero</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: var(--spacing-xl);">
                            
                            <!-- Version Info -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Aero version check for updates build')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <span class="logo-icon" style="width: 24px; height: 24px; background: #000000; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 14px; font-weight: 900; font-family: var(--font-ui); margin-top: 2px; flex-shrink: 0;">A</span>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Aero Browser</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Version 1.0.12 (Official Build) (arm64)</span>
                                    </div>
                                </div>
                                <button id="btn-check-updates" style="background: var(--color-active-bg); border: none; outline: none; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-text-active); font-weight: var(--font-weight-semibold); cursor: pointer;">Check for updates</button>
                            </div>

                            <!-- Credits -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Credits contributors Chromium Rust Aether Agent')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-user-group" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Credits</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Built with love by the Aero Open Source Project. Powered by Chromium project, Node.js, and Rust Aether agent runtime.</span>
                                    </div>
                                </div>
                            </div>

                            <!-- License -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('License MIT Software disclosures terms')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-note-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">License</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Aero is released under the MIT License. View source code and third-party software disclosures.</span>
                                    </div>
                                </div>
                                <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                            </div>

                        </div>
                    </div>
                
    `;
}

export function bindAboutTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'about') return;
    
    const checkUpdatesBtn = settingsPage.querySelector('#btn-check-updates');
    if (checkUpdatesBtn) {
        checkUpdatesBtn.addEventListener('click', () => {
            alert("Aero is already up to date!");
        });
    }
}
