// DownloadsTab.js - Extracted from SettingsPage.js

export function renderDownloadsTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    return `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Downloads</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Download folder path -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Download folder path Location folder path input field')}">
                                <div style="display: flex; flex-direction: column; gap: var(--spacing-xs); width: 100%; min-width: 0; margin-right: var(--spacing-lg);">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Location</span>
                                    <input type="text" id="download-path-input" value="${state.downloadPath}" style="${inputStyle} width: 100%; font-family: var(--font-code);">
                                </div>
                                <button id="btn-browse-downloads" style="background: var(--color-active-bg); border: none; outline: none; border-radius: var(--border-radius-sm); padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-xs); color: var(--color-text-active); font-weight: var(--font-weight-semibold); cursor: pointer; flex-shrink: 0; margin-top: 18px;">Change</button>
                            </div>

                            <!-- Ask where to save toggle -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Ask where to save each file before downloading')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Ask where to save each file before downloading</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Prompts for folder location on every download trigger.</span>
                                </div>
                                ${renderToggle('downloads-ask-toggle', state.askBeforeDownload)}
                            </div>

                        </div>
                    </div>
                
    `;
}

export function bindDownloadsTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'downloads') return;
    
    const pathInput = settingsPage.querySelector('#download-path-input');
    if (pathInput) {
        pathInput.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.downloadPath = val;
            });
        });
    }

    const browseBtn = settingsPage.querySelector('#btn-browse-downloads');
    if (browseBtn && pathInput) {
        browseBtn.addEventListener('click', async () => {
            const newPath = await window.aeroPrompt("Enter download directory path:", pathInput.value);
            if (newPath) {
                window.AppState.update(state => {
                    state.downloadPath = newPath;
                });
            }
        });
    }

    const askToggle = settingsPage.querySelector('#downloads-ask-toggle');
    if (askToggle) {
        askToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.askBeforeDownload = checked;
            });
        });
    }
}
