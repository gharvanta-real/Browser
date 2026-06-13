import { BaseComponent } from '../BaseComponent.js';

// Import Tabs
import { renderProfilesTab, bindProfilesTabEvents } from './settings/ProfilesTab.js';
import { renderAppearanceTab, bindAppearanceTabEvents } from './settings/AppearanceTab.js';
import { renderStartupTab, bindStartupTabEvents } from './settings/StartupTab.js';
import { renderSearchTab, bindSearchTabEvents } from './settings/SearchTab.js';
import { renderPrivacyTab, bindPrivacyTabEvents } from './settings/PrivacyTab.js';
import { renderDownloadsTab, bindDownloadsTabEvents } from './settings/DownloadsTab.js';
import { renderTabsTab, bindTabsTabEvents } from './settings/TabsTab.js';
import { renderPerformanceTab, bindPerformanceTabEvents } from './settings/PerformanceTab.js';
import { renderAboutTab, bindAboutTabEvents } from './settings/AboutTab.js';

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
            safeBrowsing: window.AppState?.safeBrowsing ?? 'standard',
            aiControlEnabled: window.AppState?.aiControlEnabled ?? true,
            aiShowLiveCursor: window.AppState?.aiShowLiveCursor ?? true,
            aiHumanTyping: window.AppState?.aiHumanTyping ?? true,
            aiTypingDelayMs: window.AppState?.aiTypingDelayMs ?? 24,
            aiActionDelayMs: window.AppState?.aiActionDelayMs ?? 160,
            aiRequireConfirmation: window.AppState?.aiRequireConfirmation ?? true,
            aiAllowPageReading: window.AppState?.aiAllowPageReading ?? true,
            aiAllowActionExecution: window.AppState?.aiAllowActionExecution ?? true,
            sitePermissions: window.AppState?.sitePermissions || { camera: 'ask', microphone: 'ask', location: 'ask', notifications: 'ask', aiBlocklist: [] },
            viewingPermissions: false
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
                safeBrowsing: state.safeBrowsing ?? 'standard',
                aiControlEnabled: state.aiControlEnabled ?? true,
                aiShowLiveCursor: state.aiShowLiveCursor ?? true,
                aiHumanTyping: state.aiHumanTyping ?? true,
                aiTypingDelayMs: state.aiTypingDelayMs ?? 24,
                aiActionDelayMs: state.aiActionDelayMs ?? 160,
                aiRequireConfirmation: state.aiRequireConfirmation ?? true,
                aiAllowPageReading: state.aiAllowPageReading ?? true,
                aiAllowActionExecution: state.aiAllowActionExecution ?? true,
                sitePermissions: state.sitePermissions
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
                sectionContentHtml = renderProfilesTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
            case 'appearance':
                sectionContentHtml = renderAppearanceTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
            case 'startup':
                sectionContentHtml = renderStartupTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
            case 'search':
                sectionContentHtml = renderSearchTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
            case 'privacy':
                sectionContentHtml = renderPrivacyTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
            case 'downloads':
                sectionContentHtml = renderDownloadsTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
            case 'tabs':
                sectionContentHtml = renderTabsTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
            case 'performance':
                sectionContentHtml = renderPerformanceTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
            case 'about':
                sectionContentHtml = renderAboutTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
            default:
                sectionContentHtml = renderPrivacyTab(this.state, getRowStyle, selectStyle, renderToggle, inputStyle);
                break;
        }

        return `
            <div class="aero-settings-page" style="display: flex; height: 100%; width: 100%; overflow: hidden; background: var(--color-viewport-bg); color: var(--color-viewport-text); font-family: var(--font-ui);">
                
                <!-- Left Sidebar Navigation inside Settings Page -->
                <div class="settings-page-sidebar" style="width: 240px; background: var(--color-window-bg); border-right: 1px solid var(--color-viewport-border); padding: 24px var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-sm); flex-shrink: 0;">
                    
                    <!-- Back Button and Title -->
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg); padding: 0 var(--spacing-xs);">
                        <button id="settings-back-btn" style="background: transparent; border: none; outline: none; font-size: 16px; cursor: pointer; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; transition: background var(--transition-fast);">
                            <i class="hgi-stroke hgi-arrow-left-01" style="font-size: 18px;"></i>
                        </button>
                        <span style="font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-text-active); font-family: 'Outfit', var(--font-ui);">
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
                this.navigateBack();
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

        // Delegate event bindings to sub-modules
        bindProfilesTabEvents(this, this.state);
        bindAppearanceTabEvents(this, this.state);
        bindStartupTabEvents(this, this.state);
        bindSearchTabEvents(this, this.state);
        bindPrivacyTabEvents(this, this.state);
        bindDownloadsTabEvents(this, this.state);
        bindTabsTabEvents(this, this.state);
        bindPerformanceTabEvents(this, this.state);
        bindAboutTabEvents(this, this.state);
    }
}
