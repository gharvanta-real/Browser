// PrivacyTab.js - Extracted from SettingsPage.js

export function renderPrivacyTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    return `

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
}
