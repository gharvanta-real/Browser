// ProfilesTab.js - Extracted from SettingsPage.js

export function renderProfilesTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    return `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Profiles</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: var(--spacing-xl);">
                            
                            <!-- Profile Active -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Rohan (Active) rohan@aero.internal Default Profile')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: center; min-width: 0;">
                                    <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--color-input-focus-border); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); font-size: 15px; flex-shrink: 0;">R</div>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Rohan</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">rohan@aero.internal — Default Profile</span>
                                    </div>
                                </div>
                                <span style="font-size: var(--font-size-xs); color: var(--color-input-focus-border); font-weight: var(--font-weight-semibold);">Active</span>
                            </div>

                            <!-- Personal Profile Row -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Rohan Personal rohan.personal@email.com')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: center; min-width: 0;">
                                    <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--color-border-hover); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); font-size: 15px; flex-shrink: 0;">RP</div>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Rohan Personal</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">rohan.personal@email.com</span>
                                    </div>
                                </div>
                                <button class="settings-profile-switch-btn" data-profile="Personal" style="background: var(--color-active-bg); border: none; outline: none; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-text-active); cursor: pointer;">Switch</button>
                            </div>

                            <!-- Add Profile Button -->
                            <div style="display: flex; justify-content: flex-end; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Add Profile')}">
                                <button id="btn-add-profile" style="background: var(--color-input-focus-border); color: #FFFFFF; border: none; outline: none; border-radius: var(--border-radius-sm); padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer; display: flex; align-items: center; gap: var(--spacing-xs);">
                                    <i class="hgi-stroke hgi-plus" style="font-size: 14px;"></i> Add Profile
                                </button>
                            </div>
                        </div>

                        <!-- Profile Sync settings -->
                        <h4 style="margin: 0 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Profile Sync Settings</h4>
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Sync Destination -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Sync Destination Sync account bookmarks history passwords')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-globe" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Sync Destination</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Choose where profile sync data is saved.</span>
                                    </div>
                                </div>
                                <select id="sync-destination-select" style="${selectStyle}">
                                    <option value="cloud" ${state.syncDestination === 'cloud' ? 'selected' : ''}>Aero Cloud Sync</option>
                                    <option value="local" ${state.syncDestination === 'local' ? 'selected' : ''}>Local Network Drive</option>
                                </select>
                            </div>

                            <!-- Sync Bookmarks -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Sync Bookmarks')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Sync Bookmarks</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Automatically backup and sync your bookmarks.</span>
                                </div>
                                ${renderToggle('sync-bookmarks-toggle', state.syncBookmarks)}
                            </div>

                            <!-- Sync History -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Sync History & Tabs')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Sync History & Tabs</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Access history and current tabs across all devices.</span>
                                </div>
                                ${renderToggle('sync-history-toggle', state.syncHistory)}
                            </div>

                            <!-- Sync Passwords -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Sync Passwords')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Sync Passwords</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Sync login credentials encrypted with end-to-end security.</span>
                                </div>
                                ${renderToggle('sync-passwords-toggle', state.syncPasswords)}
                            </div>

                            <!-- Sync Settings -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Sync Settings')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Sync Preferences & Settings</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Sync custom layout config and theme settings.</span>
                                </div>
                                ${renderToggle('sync-settings-toggle', state.syncSettings)}
                            </div>

                        </div>
                    </div>
                
    `;
}

export function bindProfilesTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'profiles') return;
    
    const addProfileBtn = settingsPage.querySelector('#btn-add-profile');
    if (addProfileBtn) {
        addProfileBtn.addEventListener('click', async () => {
            const name = await window.aeroPrompt("Enter profile name:", "Rohan Work");
            if (name) {
                alert(`Profile "${name}" successfully created! (Mock Action)`);
            }
        });
    }

    const switchProfileBtn = settingsPage.querySelector('.settings-profile-switch-btn');
    if (switchProfileBtn) {
        switchProfileBtn.addEventListener('click', () => {
            const profileName = switchProfileBtn.getAttribute('data-profile');
            alert(`Switching browser workspace context to: Rohan ${profileName}`);
        });
    }

    const syncDestSelect = settingsPage.querySelector('#sync-destination-select');
    if (syncDestSelect) {
        syncDestSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.syncDestination = val;
            });
        });
    }

    const syncBookmarks = settingsPage.querySelector('#sync-bookmarks-toggle');
    if (syncBookmarks) {
        syncBookmarks.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.syncBookmarks = checked;
            });
        });
    }

    const syncHistory = settingsPage.querySelector('#sync-history-toggle');
    if (syncHistory) {
        syncHistory.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.syncHistory = checked;
            });
        });
    }

    const syncPasswords = settingsPage.querySelector('#sync-passwords-toggle');
    if (syncPasswords) {
        syncPasswords.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.syncPasswords = checked;
            });
        });
    }

    const syncSettings = settingsPage.querySelector('#sync-settings-toggle');
    if (syncSettings) {
        syncSettings.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.syncSettings = checked;
            });
        });
    }
}
