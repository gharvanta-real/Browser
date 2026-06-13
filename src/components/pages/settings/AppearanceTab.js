// AppearanceTab.js - Extracted from SettingsPage.js

export function renderAppearanceTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    return `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Appearance</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Theme Selector -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Theme Selector Light Dark System')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-brush" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Theme</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Set the color scheme for Aero UI elements.</span>
                                    </div>
                                </div>
                                <select id="appearance-theme-select" style="${selectStyle}">
                                    <option value="light" ${state.theme === 'light' ? 'selected' : ''}>Light</option>
                                    <option value="dark" ${state.theme === 'dark' ? 'selected' : ''}>Dark</option>
                                    <option value="system" ${state.theme === 'system' ? 'selected' : ''}>System</option>
                                </select>
                            </div>

                            <!-- Tab Layout Selector -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Tab Strip Layout Horizontal Vertical tabLayout')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-grid-view" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Tab Strip Layout</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Choose between top horizontal tabs or vertical sidebar tabs.</span>
                                    </div>
                                </div>
                                <select id="appearance-layout-select" style="${selectStyle}">
                                    <option value="horizontal" ${state.tabLayout === 'horizontal' ? 'selected' : ''}>Horizontal</option>
                                    <option value="vertical" ${state.tabLayout === 'vertical' ? 'selected' : ''}>Vertical</option>
                                </select>
                            </div>

                            <!-- Custom Accent Color Picker -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Accent Color Customize color pickers Blue Purple Green Red Orange')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-paint-brush-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Custom Accent Color</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Personalize key UI highlights and active window accents.</span>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                                    <!-- Predefined colors -->
                                    <div class="accent-color-dot" data-color="#4D90FE" style="width: 20px; height: 20px; border-radius: 50%; background: #4D90FE; cursor: pointer; box-sizing: border-box; border: ${state.accentColor === '#4D90FE' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    <div class="accent-color-dot" data-color="#8F3DFF" style="width: 20px; height: 20px; border-radius: 50%; background: #8F3DFF; cursor: pointer; box-sizing: border-box; border: ${state.accentColor === '#8F3DFF' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    <div class="accent-color-dot" data-color="#188038" style="width: 20px; height: 20px; border-radius: 50%; background: #188038; cursor: pointer; box-sizing: border-box; border: ${state.accentColor === '#188038' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    <div class="accent-color-dot" data-color="#E81123" style="width: 20px; height: 20px; border-radius: 50%; background: #E81123; cursor: pointer; box-sizing: border-box; border: ${state.accentColor === '#E81123' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    <div class="accent-color-dot" data-color="#FFBA00" style="width: 20px; height: 20px; border-radius: 50%; background: #FFBA00; cursor: pointer; box-sizing: border-box; border: ${state.accentColor === '#FFBA00' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    
                                    <!-- Color input picker -->
                                    <div style="position: relative; width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--color-viewport-border); overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer; box-sizing: border-box;">
                                        <i class="hgi-stroke hgi-plus" style="font-size: 10px; position: absolute; pointer-events: none; z-index: 1; color: var(--color-viewport-text);"></i>
                                        <input type="color" id="accent-color-input" value="${state.accentColor}" style="border: none; outline: none; background: transparent; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; padding: 0; position: absolute; top: -10px; left: -10px;">
                                    </div>
                                </div>
                            </div>

                            <!-- Show Bookmarks Bar Toggle -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Show Bookmarks Bar shelf visibility toggle')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-star" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show Bookmarks Bar</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Display the bookmarks bar shelf under the address bar toolbar.</span>
                                    </div>
                                </div>
                                ${renderToggle('appearance-bookmarks-bar-toggle', state.showBookmarksBar)}
                            </div>

                            <!-- Show Left Sidebar Toggle -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Show Left Sidebar navigation pane visibility toggle')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-settings-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show Left Sidebar</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Display the main sidebar navigation pane on the left side of the window.</span>
                                    </div>
                                </div>
                                ${renderToggle('appearance-left-sidebar-toggle', state.showLeftSidebar)}
                            </div>

                        </div>
                    </div>
                
    `;
}

export function bindAppearanceTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'appearance') return;
    
    const themeSelect = settingsPage.querySelector('#appearance-theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.theme = val;
            });
        });
    }

    const layoutSelect = settingsPage.querySelector('#appearance-layout-select');
    if (layoutSelect) {
        layoutSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.tabLayout = val;
            });
        });
    }

    // Custom color dot pickers
    settingsPage.querySelectorAll('.accent-color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const color = dot.getAttribute('data-color');
            window.AppState.update(state => {
                state.accentColor = color;
            });
        });
    });

    // Accent color custom input picker
    const colorInput = settingsPage.querySelector('#accent-color-input');
    if (colorInput) {
        colorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            window.AppState.update(state => {
                state.accentColor = color;
            });
        });
    }

    const bookmarksBarToggle = settingsPage.querySelector('#appearance-bookmarks-bar-toggle');
    if (bookmarksBarToggle) {
        bookmarksBarToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.showBookmarksBar = checked;
            });
        });
    }

    const leftSidebarToggle = settingsPage.querySelector('#appearance-left-sidebar-toggle');
    if (leftSidebarToggle) {
        leftSidebarToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.showLeftSidebar = checked;
            });
        });
    }
}
