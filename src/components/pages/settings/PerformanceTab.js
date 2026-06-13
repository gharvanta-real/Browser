// PerformanceTab.js - Extracted from SettingsPage.js

export function renderPerformanceTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    return `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Performance</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Memory Saver -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Memory Saver Free memory inactive tabs resource saver')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; padding-right: var(--spacing-md);">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Memory Saver</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Frees up memory from inactive tabs, keeping active tabs faster. Inactive tabs reload automatically when you focus them.</span>
                                </div>
                                ${renderToggle('performance-memory-toggle', state.memorySaver)}
                            </div>

                            <!-- Energy Saver -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Energy Saver Battery power saver limit background activity effects')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; padding-right: var(--spacing-md);">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Energy Saver</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Conserves battery power by limiting background activity, animations, and visual effects when unplugged or low battery.</span>
                                </div>
                                ${renderToggle('performance-energy-toggle', state.energySaver)}
                            </div>

                        </div>
                    </div>
                
    `;
}

export function bindPerformanceTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'performance') return;
    
    const memoryToggle = settingsPage.querySelector('#performance-memory-toggle');
    if (memoryToggle) {
        memoryToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.memorySaver = checked;
            });
        });
    }

    const energyToggle = settingsPage.querySelector('#performance-energy-toggle');
    if (energyToggle) {
        energyToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.energySaver = checked;
            });
        });
    }
}
