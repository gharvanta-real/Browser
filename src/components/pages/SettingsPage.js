import { BaseComponent } from '../BaseComponent.js';

export class SettingsPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            searchQuery: '',
            activeSection: 'privacy',
            
            // Sync settings values from global AppState
            syncBookmarks: window.AppState?.syncBookmarks ?? true,
            syncHistory: window.AppState?.syncHistory ?? true,
            syncPasswords: window.AppState?.syncPasswords ?? false,
            syncSettings: window.AppState?.syncSettings ?? true,
            syncDestination: window.AppState?.syncDestination ?? 'cloud',
            
            startupPage: window.AppState?.startupPage ?? 'newtab',
            startupUrl: window.AppState?.startupUrl ?? 'https://aero.internal/dashboard',
            
            searchEngine: window.AppState?.searchEngine ?? 'Google',
            showSearchSuggestions: window.AppState?.showSearchSuggestions ?? true,
            showSearchHistory: window.AppState?.showSearchHistory ?? true,
            showSearchAutocomplete: window.AppState?.showSearchAutocomplete ?? true,
            
            downloadPath: window.AppState?.downloadPath ?? 'C:\\Users\\Rohan\\Downloads',
            askBeforeDownload: window.AppState?.askBeforeDownload ?? true,
            
            memorySaver: window.AppState?.memorySaver ?? true,
            energySaver: window.AppState?.energySaver ?? false,
            showBookmarksBar: window.AppState?.showBookmarksBar ?? true,
            showLeftSidebar: window.AppState?.showLeftSidebar ?? true,
            focusMode: window.AppState?.focusMode ?? false,
            safeBrowsing: window.AppState?.safeBrowsing ?? 'standard'
        };
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            this.setState({
                aiProvider: state.aiProvider,
                localVram: state.localVram,
                theme: state.theme || 'light',
                tabLayout: state.tabLayout || 'horizontal',
                accentColor: state.accentColor || '#4D90FE',
                showAiSidebar: state.showAiSidebar,
                showAiView: state.showAiView,
                
                syncBookmarks: state.syncBookmarks ?? true,
                syncHistory: state.syncHistory ?? true,
                syncPasswords: state.syncPasswords ?? false,
                syncSettings: state.syncSettings ?? true,
                syncDestination: state.syncDestination ?? 'cloud',
                
                startupPage: state.startupPage ?? 'newtab',
                startupUrl: state.startupUrl ?? 'https://aero.internal/dashboard',
                
                searchEngine: state.searchEngine ?? 'Google',
                showSearchSuggestions: state.showSearchSuggestions ?? true,
                showSearchHistory: state.showSearchHistory ?? true,
                showSearchAutocomplete: state.showSearchAutocomplete ?? true,
                
                downloadPath: state.downloadPath ?? 'C:\\Users\\Rohan\\Downloads',
                askBeforeDownload: state.askBeforeDownload ?? true,
                
                memorySaver: state.memorySaver ?? true,
                energySaver: state.energySaver ?? false,
                showBookmarksBar: state.showBookmarksBar ?? true,
                showLeftSidebar: state.showLeftSidebar ?? true,
                focusMode: state.focusMode ?? false,
                safeBrowsing: state.safeBrowsing ?? 'standard'
            });
        });
        super.connectedCallback();
    }

    template() {
        const activeSection = this.state.activeSection || 'privacy';
        const q = (this.state.searchQuery || '').toLowerCase().trim();
        
        const getRowStyle = (text) => {
            if (!q) return '';
            return text.toLowerCase().includes(q) ? '' : 'display: none !important;';
        };

        // Sidebar Navigation Helper
        const renderNavItem = (sectionId, iconClass, label) => {
            const isActive = activeSection === sectionId;
            return `
                <div class="settings-page-nav-item ${isActive ? 'active' : ''}" 
                     data-section="${sectionId}" 
                     style="display: flex; align-items: center; gap: var(--spacing-md); padding: 8px var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-sm); color: ${isActive ? 'var(--color-text-active)' : 'var(--color-text-inactive)'}; font-weight: ${isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'}; background: ${isActive ? 'var(--color-active-bg)' : 'transparent'}; cursor: pointer;">
                    <i class="${iconClass}" style="font-size: 16px;"></i> ${label}
                </div>
            `;
        };

        // Select Control Flat Style Helper
        const selectStyle = `
            background: var(--color-input-bg);
            border: none;
            outline: none;
            border-radius: var(--border-radius-sm);
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: var(--font-size-xs);
            color: var(--color-viewport-text);
            font-family: var(--font-ui);
            cursor: pointer;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            text-align-last: right;
            padding-right: 24px;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
            background-repeat: no-repeat;
            background-position: right 8px center;
            min-width: 120px;
        `;

        // Text Input Flat Style Helper
        const inputStyle = `
            background: var(--color-input-bg);
            border: none;
            outline: none;
            border-radius: var(--border-radius-sm);
            padding: var(--spacing-sm) var(--spacing-md);
            font-size: var(--font-size-xs);
            color: var(--color-viewport-text);
            font-family: var(--font-ui);
        `;

        // Switch Toggle Helper
        const renderToggle = (id, checked) => {
            return `
                <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0;">
                    <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                    <span class="slider-round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-border-hover); transition: .4s; border-radius: 34px;"></span>
                </label>
            `;
        };

        // Render Active Section Main Content
        let sectionContentHtml = '';

        switch (activeSection) {
            case 'profiles':
                sectionContentHtml = `
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
                                    <option value="cloud" ${this.state.syncDestination === 'cloud' ? 'selected' : ''}>Aero Cloud Sync</option>
                                    <option value="local" ${this.state.syncDestination === 'local' ? 'selected' : ''}>Local Network Drive</option>
                                </select>
                            </div>

                            <!-- Sync Bookmarks -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Sync Bookmarks')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Sync Bookmarks</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Automatically backup and sync your bookmarks.</span>
                                </div>
                                ${renderToggle('sync-bookmarks-toggle', this.state.syncBookmarks)}
                            </div>

                            <!-- Sync History -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Sync History & Tabs')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Sync History & Tabs</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Access history and current tabs across all devices.</span>
                                </div>
                                ${renderToggle('sync-history-toggle', this.state.syncHistory)}
                            </div>

                            <!-- Sync Passwords -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Sync Passwords')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Sync Passwords</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Sync login credentials encrypted with end-to-end security.</span>
                                </div>
                                ${renderToggle('sync-passwords-toggle', this.state.syncPasswords)}
                            </div>

                            <!-- Sync Settings -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Sync Settings')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Sync Preferences & Settings</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Sync custom layout config and theme settings.</span>
                                </div>
                                ${renderToggle('sync-settings-toggle', this.state.syncSettings)}
                            </div>

                        </div>
                    </div>
                `;
                break;

            case 'appearance':
                sectionContentHtml = `
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
                                    <option value="light" ${this.state.theme === 'light' ? 'selected' : ''}>Light</option>
                                    <option value="dark" ${this.state.theme === 'dark' ? 'selected' : ''}>Dark</option>
                                    <option value="system" ${this.state.theme === 'system' ? 'selected' : ''}>System</option>
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
                                    <option value="horizontal" ${this.state.tabLayout === 'horizontal' ? 'selected' : ''}>Horizontal</option>
                                    <option value="vertical" ${this.state.tabLayout === 'vertical' ? 'selected' : ''}>Vertical</option>
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
                                    <div class="accent-color-dot" data-color="#4D90FE" style="width: 20px; height: 20px; border-radius: 50%; background: #4D90FE; cursor: pointer; box-sizing: border-box; border: ${this.state.accentColor === '#4D90FE' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    <div class="accent-color-dot" data-color="#8F3DFF" style="width: 20px; height: 20px; border-radius: 50%; background: #8F3DFF; cursor: pointer; box-sizing: border-box; border: ${this.state.accentColor === '#8F3DFF' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    <div class="accent-color-dot" data-color="#188038" style="width: 20px; height: 20px; border-radius: 50%; background: #188038; cursor: pointer; box-sizing: border-box; border: ${this.state.accentColor === '#188038' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    <div class="accent-color-dot" data-color="#E81123" style="width: 20px; height: 20px; border-radius: 50%; background: #E81123; cursor: pointer; box-sizing: border-box; border: ${this.state.accentColor === '#E81123' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    <div class="accent-color-dot" data-color="#FFBA00" style="width: 20px; height: 20px; border-radius: 50%; background: #FFBA00; cursor: pointer; box-sizing: border-box; border: ${this.state.accentColor === '#FFBA00' ? '2px solid var(--color-viewport-text)' : '1px solid var(--color-viewport-border)'};"></div>
                                    
                                    <!-- Color input picker -->
                                    <div style="position: relative; width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--color-viewport-border); overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer; box-sizing: border-box;">
                                        <i class="hgi-stroke hgi-plus" style="font-size: 10px; position: absolute; pointer-events: none; z-index: 1; color: var(--color-viewport-text);"></i>
                                        <input type="color" id="accent-color-input" value="${this.state.accentColor}" style="border: none; outline: none; background: transparent; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; padding: 0; position: absolute; top: -10px; left: -10px;">
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
                                ${renderToggle('appearance-bookmarks-bar-toggle', this.state.showBookmarksBar)}
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
                                ${renderToggle('appearance-left-sidebar-toggle', this.state.showLeftSidebar)}
                            </div>

                        </div>
                    </div>
                `;
                break;

            case 'startup':
                sectionContentHtml = `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">On Startup</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Open New Tab page -->
                            <label class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Open the New Tab page')}">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Open the New Tab page</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Starts with the clean dashboard and quick access cards.</span>
                                </div>
                                <input type="radio" name="startup-option" value="newtab" ${this.state.startupPage === 'newtab' ? 'checked' : ''} style="accent-color: var(--color-input-focus-border); cursor: pointer; border: none; outline: none;">
                            </label>

                            <!-- Continue where you left off -->
                            <label class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Continue where you left off')}">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Continue where you left off</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Reopens tabs and sessions from the last active window.</span>
                                </div>
                                <input type="radio" name="startup-option" value="continue" ${this.state.startupPage === 'continue' ? 'checked' : ''} style="accent-color: var(--color-input-focus-border); cursor: pointer; border: none; outline: none;">
                            </label>

                            <!-- Open specific page -->
                            <label class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); cursor: pointer; ${getRowStyle('Open a specific page or set of pages')}">
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Open a specific page or set of pages</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Load custom homepages or workspace portals automatically.</span>
                                </div>
                                <input type="radio" name="startup-option" value="specific" ${this.state.startupPage === 'specific' ? 'checked' : ''} style="accent-color: var(--color-input-focus-border); cursor: pointer; border: none; outline: none;">
                            </label>

                            <!-- Custom URL Input (Conditional) -->
                            ${this.state.startupPage === 'specific' ? `
                                <div style="display: flex; gap: var(--spacing-sm); padding: var(--spacing-md) var(--spacing-lg); border-top: 1px solid var(--color-viewport-border); background: var(--color-input-bg); align-items: center;">
                                    <input type="text" id="startup-url-input" value="${this.state.startupUrl || ''}" placeholder="Enter specific page URL..." style="flex: 1; ${inputStyle}">
                                    <button id="btn-save-startup" style="background: var(--color-input-focus-border); color: #FFFFFF; border: none; outline: none; border-radius: var(--border-radius-sm); padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer;">Save</button>
                                </div>
                            ` : ''}

                        </div>
                    </div>
                `;
                break;

            case 'search':
                sectionContentHtml = `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Search</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: var(--spacing-xl);">
                            
                            <!-- Search Engine Select -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Default Search Engine Google Bing DuckDuckGo')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-search-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Search engine used in the address bar</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Choose your default provider for web searches.</span>
                                    </div>
                                </div>
                                <select id="search-engine-select" style="${selectStyle}">
                                    <option value="Google" ${this.state.searchEngine === 'Google' ? 'selected' : ''}>Google</option>
                                    <option value="Bing" ${this.state.searchEngine === 'Bing' ? 'selected' : ''}>Bing</option>
                                    <option value="DuckDuckGo" ${this.state.searchEngine === 'DuckDuckGo' ? 'selected' : ''}>DuckDuckGo</option>
                                </select>
                            </div>

                        </div>

                        <h4 style="margin: 0 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Search Suggestions</h4>
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Toggle suggestions as you type -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Show search and site suggestions as you type')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show search and site suggestions as you type</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Uses your search engine to show matching suggestions.</span>
                                </div>
                                ${renderToggle('search-suggestions-toggle', this.state.showSearchSuggestions)}
                            </div>

                            <!-- Toggle search history suggestions -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Show search history suggestions')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show search history suggestions</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Matches queries against your previous searches.</span>
                                </div>
                                ${renderToggle('search-history-toggle', this.state.showSearchHistory)}
                            </div>

                            <!-- Toggle autocomplete matching for internal pages -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Enable autocomplete matching for internal pages')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Enable autocomplete matching for internal pages</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Include bookmarks, history and local settings in address bar autocomplete.</span>
                                </div>
                                ${renderToggle('search-autocomplete-toggle', this.state.showSearchAutocomplete)}
                            </div>

                        </div>
                    </div>
                `;
                break;

            case 'privacy':
                const provider = this.state.aiProvider || 'claude';
                sectionContentHtml = `
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
                                <select style="${selectStyle}">
                                    <option>Balanced (recommended)</option>
                                    <option>Strict</option>
                                    <option>Basic</option>
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
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Cookie controls Choose how Aero handles cookies and site data')}">
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
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Site permissions Control what information sites can use')}">
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
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Password manager Manage saved passwords')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-lock" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Password manager</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Manage saved passwords, passkeys, and autofill.</span>
                                    </div>
                                </div>
                                <i class="hgi-stroke hgi-note-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
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
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); cursor: pointer; ${getRowStyle('Safety check Review important security and privacy settings')}">
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
                                ${renderToggle('settings-focus-mode-toggle', this.state.focusMode)}
                            </div>

                            <!-- Safe browsing -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Safe browsing Protect against dangerous sites, downloads, and extensions')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Safe browsing</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Protect against dangerous sites, downloads, and extensions.</span>
                                </div>
                                <select id="settings-safe-browsing-select" style="${selectStyle}">
                                    <option value="enhanced" ${this.state.safeBrowsing === 'enhanced' ? 'selected' : ''}>Enhanced protection</option>
                                    <option value="standard" ${this.state.safeBrowsing === 'standard' ? 'selected' : ''}>Standard protection</option>
                                    <option value="none" ${this.state.safeBrowsing === 'none' ? 'selected' : ''}>No protection</option>
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
                                ${renderToggle('dnt-toggle', true)}
                            </div>

                            <!-- Preload pages -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Preload pages for faster browsing and searching')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Preload pages for faster browsing and searching</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Prefetch information from pages, including those you have not yet visited</span>
                                </div>
                                ${renderToggle('preload-toggle', true)}
                            </div>

                            <!-- Help improve -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Help improve Aero send crash reports')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Help improve Aero</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Automatically send usage statistics and crash reports</span>
                                </div>
                                ${renderToggle('improve-toggle', false)}
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'downloads':
                sectionContentHtml = `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Downloads</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Download folder path -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Download folder path Location folder path input field')}">
                                <div style="display: flex; flex-direction: column; gap: var(--spacing-xs); width: 100%; min-width: 0; margin-right: var(--spacing-lg);">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Location</span>
                                    <input type="text" id="download-path-input" value="${this.state.downloadPath}" style="${inputStyle} width: 100%; font-family: var(--font-code);">
                                </div>
                                <button id="btn-browse-downloads" style="background: var(--color-active-bg); border: none; outline: none; border-radius: var(--border-radius-sm); padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-xs); color: var(--color-text-active); font-weight: var(--font-weight-semibold); cursor: pointer; flex-shrink: 0; margin-top: 18px;">Change</button>
                            </div>

                            <!-- Ask where to save toggle -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Ask where to save each file before downloading')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Ask where to save each file before downloading</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Prompts for folder location on every download trigger.</span>
                                </div>
                                ${renderToggle('downloads-ask-toggle', this.state.askBeforeDownload)}
                            </div>

                        </div>
                    </div>
                `;
                break;

            case 'tabs':
                sectionContentHtml = `
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
                                    <option value="horizontal" ${this.state.tabLayout === 'horizontal' ? 'selected' : ''}>Horizontal tabs</option>
                                    <option value="vertical" ${this.state.tabLayout === 'vertical' ? 'selected' : ''}>Vertical sidebar tabs</option>
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
                                ${renderToggle('tabs-ai-sidebar-toggle', this.state.showAiSidebar)}
                            </div>

                            <!-- Toggle accessibility inspector -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Show Accessibility Tree Inspector overlay')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show Accessibility Tree Inspector overlay</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Shows bounding boxes of elements for Accessibility Tree tracking.</span>
                                </div>
                                ${renderToggle('tabs-ai-view-toggle', this.state.showAiView)}
                            </div>

                            <!-- AI provider select -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Default AI Model Provider Claude GPT Gemini Llama')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Default AI Model Provider</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Primary intelligence engine routing your companion requests.</span>
                                </div>
                                <select id="tabs-ai-provider-select" style="${selectStyle}">
                                    <option value="claude" ${this.state.aiProvider === 'claude' ? 'selected' : ''}>Claude 3.5 Sonnet</option>
                                    <option value="openai" ${this.state.aiProvider === 'openai' ? 'selected' : ''}>GPT-4o (Cloud API)</option>
                                    <option value="gemini" ${this.state.aiProvider === 'gemini' ? 'selected' : ''}>Gemini 3.5 Flash</option>
                                    <option value="local" ${this.state.aiProvider === 'local' ? 'selected' : ''}>Llama 3 8B (Local)</option>
                                </select>
                            </div>

                            <!-- Local VRAM Slider -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Local inference VRAM limit allocation slider')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Local LLM VRAM Limit</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Allocated GPU memory for local offline model running.</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: var(--spacing-md); flex-shrink: 0;">
                                    <strong id="tabs-vram-display" style="color: var(--color-input-focus-border); font-size: var(--font-size-xs);">${this.state.localVram || 4} GB</strong>
                                    <input type="range" id="tabs-vram-slider" class="range-slider" min="1" max="16" step="0.5" value="${this.state.localVram || 4}" style="outline: none;">
                                </div>
                            </div>

                        </div>
                    </div>
                `;
                break;

            case 'performance':
                sectionContentHtml = `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Performance</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Memory Saver -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Memory Saver Free memory inactive tabs resource saver')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; padding-right: var(--spacing-md);">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Memory Saver</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Frees up memory from inactive tabs, keeping active tabs faster. Inactive tabs reload automatically when you focus them.</span>
                                </div>
                                ${renderToggle('performance-memory-toggle', this.state.memorySaver)}
                            </div>

                            <!-- Energy Saver -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Energy Saver Battery power saver limit background activity effects')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; padding-right: var(--spacing-md);">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Energy Saver</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Conserves battery power by limiting background activity, animations, and visual effects when unplugged or low battery.</span>
                                </div>
                                ${renderToggle('performance-energy-toggle', this.state.energySaver)}
                            </div>

                        </div>
                    </div>
                `;
                break;

            case 'about':
                sectionContentHtml = `
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
                break;
        }

        return `
            <div class="aero-settings-page" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-text-active); font-family: var(--font-ui); overflow: hidden;">
                <!-- Left Settings Sidebar Navigation -->
                <div class="settings-page-sidebar" style="width: 220px; border-right: 1px solid var(--color-viewport-border); background: var(--color-window-bg); padding: var(--spacing-md) var(--spacing-sm); display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; overflow-y: auto;">
                    <div id="settings-back-btn" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 8px var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-sm); color: var(--color-text-inactive); cursor: pointer; margin-bottom: var(--spacing-sm); transition: background var(--transition-fast);" onmouseover="this.style.background='var(--color-hover-bg)'" onmouseout="this.style.background='transparent'">
                        <i class="hgi-stroke hgi-arrow-left-01" style="font-size: 16px;"></i> Back to tabs
                    </div>
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm) var(--spacing-md); margin-bottom: var(--spacing-md);">
                        <span style="font-weight: var(--font-weight-bold); font-size: 15px; display: flex; align-items: center; gap: 6px;">
                            <span class="logo-icon" style="width: 14px; height: 14px; background: #000000; border-radius: 3px; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 9px; font-weight: 900; font-family: var(--font-ui);">A</span>
                            Settings
                        </span>
                    </div>

                    ${renderNavItem('profiles', 'hgi-stroke hgi-user', 'Profiles')}
                    ${renderNavItem('appearance', 'hgi-stroke hgi-brush', 'Appearance')}
                    ${renderNavItem('startup', 'hgi-stroke hgi-play', 'Startup')}
                    ${renderNavItem('search', 'hgi-stroke hgi-search-01', 'Search')}
                    ${renderNavItem('privacy', 'hgi-stroke hgi-shield-01', 'Privacy & Security')}
                    ${renderNavItem('downloads', 'hgi-stroke hgi-download-01', 'Downloads')}
                    ${renderNavItem('tabs', 'hgi-stroke hgi-grid-view', 'Tabs & Sidebar')}
                    ${renderNavItem('performance', 'hgi-stroke hgi-activity-01', 'Performance')}
                    ${renderNavItem('about', 'hgi-stroke hgi-chat-bot', 'About Aero')}
                </div>

                <!-- Center Settings Panel Content (Main Section) -->
                <div class="settings-page-content" style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto;">
                    <div style="max-width: 680px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-xl);">
                        
                        <!-- Search settings bar -->
                        <div class="search-settings-bar" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-lg); height: 40px; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; box-shadow: var(--shadow-sm);">
                            <span style="font-size: 16px; opacity: 0.6; display: flex; align-items: center;"><i class="hgi-stroke hgi-search-01" style="font-size: 16px;"></i></span>
                            <input type="text" id="settings-search" value="${this.state.searchQuery || ''}" placeholder="Search settings" style="flex: 1; border: none; font-size: var(--font-size-sm); color: var(--color-viewport-text); outline: none; background: transparent;">
                        </div>

                        <!-- Settings details list -->
                        ${sectionContentHtml}

                    </div>
                </div>


            </div>
        `;
    }

    afterRender() {
        // Back Button to Tabs
        const backBtn = this.querySelector('#settings-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.AppState.update(state => {
                    const tabId = state.activeTabId;
                    if (state.tabs.length <= 1) {
                        const activeTab = state.tabs.find(t => t.id === tabId);
                        if (activeTab) {
                            activeTab.url = 'https://newtab.internal';
                            activeTab.title = 'New Tab';
                        }
                        return;
                    }
                    const index = state.tabs.findIndex(t => t.id === tabId);
                    state.tabs = state.tabs.filter(t => t.id !== tabId);
                    const newActiveIndex = Math.max(0, index - 1);
                    state.activeTabId = state.tabs[newActiveIndex].id;
                });
            });
        }

        // Search inputs focus and change listener
        const searchInput = this.querySelector('#settings-search');
        if (searchInput) {
            searchInput.focus();
            const val = searchInput.value;
            searchInput.value = '';
            searchInput.value = val;

            searchInput.addEventListener('input', (e) => {
                this.setState({ searchQuery: e.target.value });
            });
        }

        // Navigation navigation items binding
        this.querySelectorAll('.settings-page-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                if (section) {
                    this.setState({ activeSection: section });
                }
            });
        });

        const activeSec = this.state.activeSection || 'privacy';

        // 1. Profiles Listeners
        if (activeSec === 'profiles') {
            const addProfileBtn = this.querySelector('#btn-add-profile');
            if (addProfileBtn) {
                addProfileBtn.addEventListener('click', async () => {
                    const name = await window.aeroPrompt("Enter profile name:", "Rohan Work");
                    if (name) {
                        alert(`Profile "${name}" successfully created! (Mock Action)`);
                    }
                });
            }

            const switchProfileBtn = this.querySelector('.settings-profile-switch-btn');
            if (switchProfileBtn) {
                switchProfileBtn.addEventListener('click', () => {
                    const profileName = switchProfileBtn.getAttribute('data-profile');
                    alert(`Switching browser workspace context to: Rohan ${profileName}`);
                });
            }

            const syncDestSelect = this.querySelector('#sync-destination-select');
            if (syncDestSelect) {
                syncDestSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.syncDestination = val;
                    });
                });
            }

            const syncBookmarks = this.querySelector('#sync-bookmarks-toggle');
            if (syncBookmarks) {
                syncBookmarks.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.syncBookmarks = checked;
                    });
                });
            }

            const syncHistory = this.querySelector('#sync-history-toggle');
            if (syncHistory) {
                syncHistory.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.syncHistory = checked;
                    });
                });
            }

            const syncPasswords = this.querySelector('#sync-passwords-toggle');
            if (syncPasswords) {
                syncPasswords.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.syncPasswords = checked;
                    });
                });
            }

            const syncSettings = this.querySelector('#sync-settings-toggle');
            if (syncSettings) {
                syncSettings.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.syncSettings = checked;
                    });
                });
            }
        }

        // 2. Appearance Listeners
        if (activeSec === 'appearance') {
            const themeSelect = this.querySelector('#appearance-theme-select');
            if (themeSelect) {
                themeSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.theme = val;
                    });
                });
            }

            const layoutSelect = this.querySelector('#appearance-layout-select');
            if (layoutSelect) {
                layoutSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.tabLayout = val;
                    });
                });
            }

            // Custom color dot pickers
            this.querySelectorAll('.accent-color-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    const color = dot.getAttribute('data-color');
                    window.AppState.update(state => {
                        state.accentColor = color;
                    });
                });
            });

            // Accent color custom input picker
            const colorInput = this.querySelector('#accent-color-input');
            if (colorInput) {
                colorInput.addEventListener('input', (e) => {
                    const color = e.target.value;
                    window.AppState.update(state => {
                        state.accentColor = color;
                    });
                });
            }

            const bookmarksBarToggle = this.querySelector('#appearance-bookmarks-bar-toggle');
            if (bookmarksBarToggle) {
                bookmarksBarToggle.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.showBookmarksBar = checked;
                    });
                });
            }

            const leftSidebarToggle = this.querySelector('#appearance-left-sidebar-toggle');
            if (leftSidebarToggle) {
                leftSidebarToggle.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.showLeftSidebar = checked;
                    });
                });
            }
        }

        // 3. Startup Listeners
        if (activeSec === 'startup') {
            this.querySelectorAll('input[name="startup-option"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.startupPage = val;
                    });
                });
            });

            const saveBtn = this.querySelector('#btn-save-startup');
            const urlInput = this.querySelector('#startup-url-input');
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

        // 4. Search Listeners
        if (activeSec === 'search') {
            const searchSelect = this.querySelector('#search-engine-select');
            if (searchSelect) {
                searchSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.searchEngine = val;
                    });
                });
            }

            const suggsToggle = this.querySelector('#search-suggestions-toggle');
            if (suggsToggle) {
                suggsToggle.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.showSearchSuggestions = checked;
                    });
                });
            }

            const histToggle = this.querySelector('#search-history-toggle');
            if (histToggle) {
                histToggle.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.showSearchHistory = checked;
                    });
                });
            }

            const autoToggle = this.querySelector('#search-autocomplete-toggle');
            if (autoToggle) {
                autoToggle.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.showSearchAutocomplete = checked;
                    });
                });
            }
        }

        // 5. Privacy & Security Listeners
        if (activeSec === 'privacy') {
            const providerSelect = this.querySelector('#settings-provider-select');
            if (providerSelect) {
                providerSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.aiProvider = val;
                    });
                });
            }

            const clearBtn = this.querySelector('#btn-clear-history-page');
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

            const focusToggle = this.querySelector('#settings-focus-mode-toggle');
            if (focusToggle) {
                focusToggle.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.focusMode = checked;
                    });
                });
            }

            const safeBrowsingSelect = this.querySelector('#settings-safe-browsing-select');
            if (safeBrowsingSelect) {
                safeBrowsingSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.safeBrowsing = val;
                    });
                });
            }
        }

        // 6. Downloads Listeners
        if (activeSec === 'downloads') {
            const pathInput = this.querySelector('#download-path-input');
            if (pathInput) {
                pathInput.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.downloadPath = val;
                    });
                });
            }

            const browseBtn = this.querySelector('#btn-browse-downloads');
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

            const askToggle = this.querySelector('#downloads-ask-toggle');
            if (askToggle) {
                askToggle.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.askBeforeDownload = checked;
                    });
                });
            }
        }

        // 7. Tabs & Sidebar Listeners
        if (activeSec === 'tabs') {
            const layoutSelect = this.querySelector('#tabs-layout-select');
            if (layoutSelect) {
                layoutSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.tabLayout = val;
                    });
                });
            }

            const aiSidebarToggle = this.querySelector('#tabs-ai-sidebar-toggle');
            if (aiSidebarToggle) {
                aiSidebarToggle.addEventListener('change', (e) => {
                    const val = e.target.checked;
                    window.AppState.update(state => {
                        state.showAiSidebar = val;
                    });
                });
            }

            const aiViewToggle = this.querySelector('#tabs-ai-view-toggle');
            if (aiViewToggle) {
                aiViewToggle.addEventListener('change', (e) => {
                    const val = e.target.checked;
                    window.AppState.update(state => {
                        state.showAiView = val;
                    });
                });
            }

            const aiProviderSelect = this.querySelector('#tabs-ai-provider-select');
            if (aiProviderSelect) {
                aiProviderSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(state => {
                        state.aiProvider = val;
                    });
                });
            }

            const vramSlider = this.querySelector('#tabs-vram-slider');
            const vramDisplay = this.querySelector('#tabs-vram-display');
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

        // 8. Performance Listeners
        if (activeSec === 'performance') {
            const memoryToggle = this.querySelector('#performance-memory-toggle');
            if (memoryToggle) {
                memoryToggle.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.memorySaver = checked;
                    });
                });
            }

            const energyToggle = this.querySelector('#performance-energy-toggle');
            if (energyToggle) {
                energyToggle.addEventListener('change', (e) => {
                    const checked = e.target.checked;
                    window.AppState.update(state => {
                        state.energySaver = checked;
                    });
                });
            }
        }

        // 9. About Aero Listeners
        if (activeSec === 'about') {
            const checkUpdatesBtn = this.querySelector('#btn-check-updates');
            if (checkUpdatesBtn) {
                checkUpdatesBtn.addEventListener('click', () => {
                    alert("Aero is already up to date!");
                });
            }
        }
    }
}
