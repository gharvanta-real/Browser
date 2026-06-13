import { BaseComponent } from './BaseComponent.js';
import { renderMenuPopover, bindMenuPopoverEvents } from './MenuPopover.js';
import { renderFeaturePopover, bindFeaturePopoverEvents } from './FeaturePopover.js';

export class Omnibox extends BaseComponent {
    constructor() {
        super();
        this.isFocused = false;
        this._outsideClickHandler = null;
        this.state = {
            isMenuOpen: false,
            isFeatureDropdownOpen: false,
            zoomLevel: 100
        };
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            const activeTab = state.tabs.find(t => t.id === state.activeTabId);
            this.setState({
                activeTab,
                tabLayout: state.tabLayout,
                aiProvider: state.aiProvider,
                showAiSidebar: state.showAiSidebar,
                theme: state.theme || 'light',
                zoomLevel: state.zoomLevel || 100,
                showBookmarksBar: state.showBookmarksBar,
                showLeftSidebar: state.showLeftSidebar,
                showAiView: state.showAiView,
                memorySaver: state.memorySaver,
                energySaver: state.energySaver,
                localVram: state.localVram,
                bookmarks: state.bookmarks || [],
                blockedTrackers: state.blockedTrackers || 0,
                blockedTrackerLog: state.blockedTrackerLog || [],
                taskLogs: state.taskLogs || []
            });
        });
        super.connectedCallback();
    }

    template() {
        const tab = this.state.activeTab || { url: '', title: '' };
        const displayValue = this.displayOmniboxValue(tab);
        const isSecure = tab.url.startsWith('https://');
        const isInternal = tab.url.endsWith('.internal') || tab.url.startsWith('browser:');
        
        let securityClass = 'unsecure';
        let securityLabel = 'Not Secure';
        let securityIconClass = 'hgi-alert-circle';

        if (isSecure) {
            securityClass = 'secure';
            securityLabel = 'Secure Connection';
            securityIconClass = 'hgi-lock';
        } else if (isInternal) {
            securityClass = 'system';
            securityLabel = 'System Settings';
            securityIconClass = 'hgi-settings-01';
        }

        const isVertical = this.state.tabLayout === 'vertical';
        const showAiSidebar = this.state.showAiSidebar;
        const theme = this.state.theme;
        const bookmarks = this.state.bookmarks || [];
        const isBookmarked = bookmarks.some(b => b.url === tab.url);
        const canGoBack = Boolean(tab.canGoBack);
        const canGoForward = Boolean(tab.canGoForward);

        return `
            <!-- Navigation History Buttons -->
            <div class="nav-buttons-group" style="display: flex; align-items: center; gap: 8px;">
                <button class="nav-btn back" aria-label="Go Back" ${canGoBack ? '' : 'disabled'} style="background: transparent; border: none; padding: 4px; border-radius: 4px; cursor: ${canGoBack ? 'pointer' : 'default'}; color: var(--color-text-inactive); opacity: ${canGoBack ? '1' : '.38'}; display: flex; align-items: center; justify-content: center;">
                    <i class="hgi-stroke hgi-arrow-left-01" style="font-size: 16px;"></i>
                </button>
                <button class="nav-btn forward" aria-label="Go Forward" ${canGoForward ? '' : 'disabled'} style="background: transparent; border: none; padding: 4px; border-radius: 4px; cursor: ${canGoForward ? 'pointer' : 'default'}; color: var(--color-text-inactive); opacity: ${canGoForward ? '1' : '.38'}; display: flex; align-items: center; justify-content: center;">
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px;"></i>
                </button>
                <button class="nav-btn reload" aria-label="${tab.loading ? 'Stop Loading' : 'Reload Page'}" style="background: transparent; border: none; padding: 4px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center;">
                    <i class="hgi-stroke ${tab.loading ? 'hgi-cancel-01' : 'hgi-refresh'}" style="font-size: 16px;"></i>
                </button>
                <!-- Voice search / mic icon button -->
                <button class="nav-btn voice-search" aria-label="Voice Search" style="background: transparent; border: none; padding: 4px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center;">
                    <i class="hgi-stroke hgi-mic-01" style="font-size: 16px;"></i>
                </button>
            </div>

            <!-- Omnibox Input Shell (Aero style pill) -->
            <div class="omnibox-wrapper">
                <div class="omnibox-input-group" style="position: relative; overflow: hidden;">
                    <!-- Colored Google Logo on left side inside URL bar -->
                    <div style="display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 2px;">
                        <svg width="12" height="12" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                    </div>
                    <input type="text" id="url-input" class="omnibox-input" value="${displayValue}" data-current-url="${tab.url || ''}" autocomplete="off" spellcheck="false" placeholder="Search Aero or type a URL..." style="flex: 1; border: none; background: transparent; font-size: 12px; font-family: var(--font-ui); color: var(--color-text-active); outline: none;">
                    
                    <!-- High fidelity icons inside URL bar on right side -->
                    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; color: var(--color-text-inactive);">
                        <!-- Key (passwords) -->
                        <i class="hgi-stroke hgi-key-01 url-passwords-btn" style="font-size: 13px; cursor: pointer; opacity: 0.75;" title="Passwords"></i>
                        <!-- Sliders/Tune (site settings) -->
                        <i class="hgi-stroke hgi-sliders-horizontal url-settings-btn" style="font-size: 13px; cursor: pointer; opacity: 0.75;" title="Site Settings"></i>
                        <!-- Shield (tracking blockers) -->
                        <i class="hgi-stroke hgi-shield-01 url-shield-btn" style="font-size: 13px; cursor: pointer; opacity: 0.75;" title="Tracking Protection"></i>
                        <!-- Star bookmark trigger -->
                        <div class="bookmark-trigger url-bookmark-btn" title="Bookmark this page" style="display: flex; align-items: center; justify-content: center; cursor: pointer;">
                            <i class="hgi-stroke hgi-star" style="font-size: 13px; opacity: 0.75; fill: ${isBookmarked ? '#FFBA00' : 'transparent'}; color: ${isBookmarked ? '#FFBA00' : 'inherit'};"></i>
                        </div>
                        <!-- Link (Copy link) -->
                        <i class="hgi-stroke hgi-link-01 url-copy-link-btn" style="font-size: 13px; cursor: pointer; opacity: 0.75;" title="Copy Link"></i>
                    </div>
                    ${tab.loading ? `<div class="omnibox-loading-slider"></div>` : ''}
                </div>
                
                <!-- Suggestions overlay -->
                <div id="suggestions-overlay" class="omnibox-dropdown ${this.isFocused ? 'visible' : ''}">
                    <div class="suggestion-section-title">Suggested Workflows</div>
                    
                    <div class="suggestion-item suggestion-ai" data-val="weather">
                        <span class="omnibox-icon" style="display: flex; align-items: center; justify-content: center;"><i class="hgi-stroke hgi-search-01" style="font-size: 14px;"></i></span>
                        <div class="suggestion-content">
                            <span class="suggestion-title">weather</span>
                            <span class="suggestion-url">AI Intent Suggestion</span>
                        </div>
                        <span class="search-badge search-badge-local">Query</span>
                    </div>
                    
                    <div class="suggestion-item suggestion-ai" data-val="flights to tokyo next month">
                        <span class="omnibox-icon" style="display: flex; align-items: center; justify-content: center;"><i class="hgi-stroke hgi-chat-bot" style="font-size: 14px;"></i></span>
                        <div class="suggestion-content">
                            <span class="suggestion-title">flights to tokyo next month</span>
                            <span class="suggestion-url">Run Agentic Automation</span>
                        </div>
                        <span class="search-badge search-badge-ai">Agent</span>
                    </div>

                    <div class="suggestion-section-title">Bookmarks & History</div>
                    <div class="suggestion-item" data-val="https://github.com/browser-project/core">
                        <span class="omnibox-icon" style="display: flex; align-items: center; justify-content: center;"><i class="hgi-stroke hgi-globe" style="font-size: 14px;"></i></span>
                        <div class="suggestion-content">
                            <span class="suggestion-title">GitHub - Core Repo</span>
                            <span class="suggestion-url">github.com/browser-project/core</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Vertical Divider 1: Separates Address bar and Action Buttons -->
            <div style="width: 1px; height: 18px; background-color: var(--color-border-light); margin: 0 4px; flex-shrink: 0;"></div>

            <!-- Toolbar controls (Menu, Soundwaves, Assistant, Dropdown, Avatar) -->
            <div class="action-buttons-group" style="display: flex; align-items: center; gap: 6px; position: relative;">
                
                <!-- 3-Dots Menu button -->
                <button class="action-btn menu-btn" title="More Actions" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center;">
                    <i class="hgi-stroke hgi-more-vertical" style="font-size: 16px;"></i>
                </button>

                <!-- Theme switcher -->
                <button class="action-btn theme-toggle" title="Toggle Theme (Light / Dark Charcoal)" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center;">
                    <i class="hgi-stroke ${theme === 'dark' ? 'hgi-sun-02' : 'hgi-moon'}" style="font-size: 16px;"></i>
                </button>

                <!-- Floating Assistant Rounded Capsule Button -->
                <button class="action-btn sidebar-trigger ${showAiSidebar ? 'ai-active-btn' : ''}" title="Toggle AI Co-pilot Side Panel" style="background: transparent; border: 1px solid var(--color-border-light); border-radius: 12px; padding: 4px 10px; display: flex; align-items: center; gap: 4px; cursor: pointer; color: var(--color-text-inactive); font-family: var(--font-ui); font-size: 11px; font-weight: 500; transition: all var(--transition-fast);">
                    <i class="hgi-stroke hgi-sparkles" style="font-size: 13px; ${showAiSidebar ? 'color: var(--color-input-focus-border);' : ''}"></i>
                    Assistant
                </button>

                <!-- Dropdown Arrow -->
                <button class="action-btn dropdown-btn" title="Dropdown Options" style="background: transparent; border: none; padding: 4px; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <i class="hgi-stroke hgi-arrow-down-01" style="font-size: 12px;"></i>
                </button>

                <!-- Vertical Divider 2: Separates Action Buttons and Avatar -->
                <div style="width: 1px; height: 18px; background-color: var(--color-border-light); margin: 0 4px; flex-shrink: 0;"></div>

                <!-- User Profile Initials Circle -->
                <div class="user-avatar" title="Alex's Account" style="width: 22px; height: 22px; border-radius: 50%; background: var(--color-input-focus-border); color: #FFFFFF; font-size: 10px; font-weight: 700; font-family: var(--font-ui); display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none;">A</div>
                
                ${this.state.isMenuOpen ? this.renderMenuPopover() : ''}
                ${this.state.isFeatureDropdownOpen ? this.renderFeaturePopover() : ''}
            </div>
        `;
    }

    renderMenuPopover() {
        return renderMenuPopover(this.state);
    }

    renderFeaturePopover() {
        return renderFeaturePopover(this.state);
    }

    afterRender() {
        const input = this.querySelector('#url-input');
        const overlay = this.querySelector('#suggestions-overlay');

        if (!input) return;

        const backBtn = this.querySelector('.nav-btn.back');
        const forwardBtn = this.querySelector('.nav-btn.forward');
        const reloadBtn = this.querySelector('.nav-btn.reload');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('aero-webview-command', { detail: { command: 'back' } }));
            });
        }
        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('aero-webview-command', { detail: { command: 'forward' } }));
            });
        }
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('aero-webview-command', { detail: { command: this.state.activeTab?.loading ? 'stop' : 'reload' } }));
            });
        }

        input.addEventListener('focus', () => {
            this.isFocused = true;
            if (this.isInternalNewTab(this.state.activeTab?.url || '')) {
                input.value = '';
            } else {
                input.select();
            }
            if (overlay) overlay.classList.add('visible');
        });

        // Remove old outside-click handler before adding a new one (prevents duplicate listeners)
        if (this._outsideClickHandler) {
            document.removeEventListener('click', this._outsideClickHandler);
            this._outsideClickHandler = null;
        }

        this._outsideClickHandler = (e) => {
            if (!this.contains(e.target)) {
                this.isFocused = false;
                const overlayEl = this.querySelector('#suggestions-overlay');
                if (overlayEl) overlayEl.classList.remove('visible');
                
                if (this.state.isMenuOpen || this.state.isFeatureDropdownOpen) {
                    // Use direct state mutation + re-render without triggering setState which re-adds listener
                    this.state.isMenuOpen = false;
                    this.state.isFeatureDropdownOpen = false;
                    this.render();
                    this.afterRender();
                }
            }
        };
        // Defer so the click that triggered open doesn't immediately close the menu
        setTimeout(() => {
            document.addEventListener('click', this._outsideClickHandler);
        }, 0);

        // 3-dots Menu toggle
        const menuBtn = this.querySelector('.menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setState({ 
                    isMenuOpen: !this.state.isMenuOpen,
                    isFeatureDropdownOpen: false
                });
            });
        }

        // Dropdown options toggle
        const dropdownBtn = this.querySelector('.dropdown-btn');
        if (dropdownBtn) {
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setState({ 
                    isFeatureDropdownOpen: !this.state.isFeatureDropdownOpen,
                    isMenuOpen: false
                });
            });
        }

        // Avatar Profile toggle
        const avatarBtn = this.querySelector('.user-avatar');
        if (avatarBtn) {
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setState({ 
                    isMenuOpen: !this.state.isMenuOpen,
                    isFeatureDropdownOpen: false
                });
            });
        }

        // Toolbar Downloads button
        const downloadsBtn = this.querySelector('.downloads-btn');
        if (downloadsBtn) {
            downloadsBtn.addEventListener('click', () => {
                this.navigateTabSafely('aero://downloads');
            });
        }

        // Popover Actions (Only if menu is open)
        bindMenuPopoverEvents(this);
        bindFeaturePopoverEvents(this);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const destination = this.resolveOmniboxInput(input.value);
                if (destination) {
                    this.navigateTab(destination.url, destination);
                }
                input.blur();
                this.isFocused = false;
                if (overlay) overlay.classList.remove('visible');
            }
        });

        this.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const val = item.getAttribute('data-val');
                if (val.startsWith('http://') || val.startsWith('https://')) {
                    this.navigateTab(val);
                } else {
                    this.navigateTab(this.buildSearchUrl(val), {
                        isSearch: true,
                        query: val,
                        title: `Search: ${val}`
                    });
                    if (val.includes('tokyo')) {
                        setTimeout(() => {
                            window.AppState.update(state => {
                                state.showAiSidebar = true;
                                state.chatHistory.push({ sender: 'user', text: `Find the cheapest flight to Tokyo` });
                            });
                            document.dispatchEvent(new CustomEvent('trigger-flights-demo'));
                        }, 500);
                    }
                }
                this.isFocused = false;
                if (overlay) overlay.classList.remove('visible');
            });
        });

        const layoutBtn = this.querySelector('.toggle-layout');
        if (layoutBtn) {
            layoutBtn.addEventListener('click', () => {
                window.AppState.update(state => {
                    const newLayout = state.tabLayout === 'horizontal' ? 'vertical' : 'horizontal';
                    state.tabLayout = newLayout;
                    
                    const sideContainer = document.getElementById('vertical-tabs-container');
                    const topContainer = document.getElementById('horizontal-tabs-container');
                    
                    if (newLayout === 'vertical') {
                        if (sideContainer) sideContainer.style.display = 'block';
                        if (topContainer) topContainer.style.display = 'none';
                    } else {
                        if (sideContainer) sideContainer.style.display = 'none';
                        if (topContainer) topContainer.style.display = 'flex';
                    }
                });
            });
        }

        const settingsBtn = this.querySelector('.settings-trigger');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.navigateTabSafely('aero://settings');
            });
        }

        const aiViewBtn = this.querySelector('.ai-toggle');
        if (aiViewBtn) {
            if (window.AppState.showAiView) {
                aiViewBtn.classList.add('ai-active-btn');
            } else {
                aiViewBtn.classList.remove('ai-active-btn');
            }

            aiViewBtn.addEventListener('click', () => {
                window.AppState.update(state => {
                    state.showAiView = !state.showAiView;
                });
            });
        }

        const sidebarBtn = this.querySelector('.sidebar-trigger');
        if (sidebarBtn) {
            sidebarBtn.addEventListener('click', () => {
                window.AppState.update(state => {
                    state.showAiSidebar = !state.showAiSidebar;
                });
            });
        }

        // Theme Toggle Event Listener
        const themeBtn = this.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                window.AppState.update(state => {
                    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
                    state.theme = newTheme;
                    
                    if (newTheme === 'dark') {
                        document.body.classList.add('dark-theme');
                    } else {
                        document.body.classList.remove('dark-theme');
                    }
                });
            });
        }

        // URL Bar Right Icons Event Listeners
        const urlPasswordsBtn = this.querySelector('.url-passwords-btn');
        if (urlPasswordsBtn) {
            urlPasswordsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateTabSafely('aero://passwords');
            });
        }

        const urlSettingsBtn = this.querySelector('.url-settings-btn');
        if (urlSettingsBtn) {
            urlSettingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateTabSafely('aero://settings');
            });
        }

        const urlShieldBtn = this.querySelector('.url-shield-btn');
        if (urlShieldBtn) {
            urlShieldBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateTab('aero://security');
            });
        }

        const urlBookmarkBtn = this.querySelector('.url-bookmark-btn');
        if (urlBookmarkBtn) {
            urlBookmarkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tab = this.state.activeTab || { url: '', title: '' };
                if (!tab.url) return;

                // 1. Ensure bookmark exists
                let bookmarkItem = this.state.bookmarks.find(b => b.url === tab.url);
                if (!bookmarkItem) {
                    window.AppState.update(state => {
                        bookmarkItem = {
                            id: Date.now(),
                            title: tab.title || 'Bookmarked Page',
                            url: tab.url,
                            displayUrl: tab.url.replace('https://', '').replace('http://', ''),
                            folder: 'Bookmarks bar', // Default to bookmarks bar
                            tags: ['quick'],
                            dateAdded: new Date().toLocaleDateString(),
                            starred: true,
                            faviconClass: 'hgi-global',
                            bgGradient: 'linear-gradient(135deg, var(--color-input-focus-border), #1A73E8)',
                            description: 'Saved from URL bar shortcut.'
                        };
                        state.bookmarks.push(bookmarkItem);
                    });
                }

                // 2. Open edit popup
                this.showEditBookmarkPopup(urlBookmarkBtn, bookmarkItem);
            });
        }

        const urlCopyLinkBtn = this.querySelector('.url-copy-link-btn');
        if (urlCopyLinkBtn) {
            urlCopyLinkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tab = this.state.activeTab || { url: '', title: '' };
                if (tab.url) {
                    navigator.clipboard.writeText(tab.url);
                    alert("URL copied to clipboard!");
                }
            });
        }
    }

    siteSecuritySummary() {
        const tab = this.state.activeTab || { url: '' };
        let host = 'Internal page';
        let secureLine = 'System page rendered locally.';
        try {
            const parsed = new URL(tab.url);
            host = parsed.hostname;
            secureLine = parsed.protocol === 'https:'
                ? 'Secure HTTPS connection.'
                : 'Not secure: page is not using HTTPS.';
        } catch {}

        const trackerLog = this.state.blockedTrackerLog || [];
        const hostBlocks = trackerLog.filter(item => {
            try {
                return new URL(item.url).hostname.includes(host) || item.url.includes(host);
            } catch {
                return false;
            }
        }).length;
        const permissionBlocks = (this.state.taskLogs || [])
            .filter(log => String(log.text || '').startsWith('Blocked '))
            .slice(-3)
            .map(log => `- ${log.text}`)
            .join('\n');

        return [
            `Aero Shield: ${host}`,
            secureLine,
            `Trackers blocked this session: ${this.state.blockedTrackers || 0}`,
            `Related blocks for this site: ${hostBlocks}`,
            permissionBlocks ? `Recent permission blocks:\n${permissionBlocks}` : 'Recent permission blocks: none'
        ].join('\n');
    }

    resolveOmniboxInput(rawValue) {
        const value = (rawValue || '').trim();
        if (!value) return null;

        if (value.startsWith('aero://') || value.startsWith('browser://')) {
            return { url: value };
        }

        const lower = value.toLowerCase();
        const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
        const looksLikeLocalhost = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?)(:\d+)?(\/.*)?$/i.test(value);
        const looksLikeIp = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?$/.test(value);
        const looksLikeDomain = /^([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(value);
        const hasSpaces = /\s/.test(value);

        if (hasScheme) {
            return { url: value };
        }

        if (!hasSpaces && (looksLikeLocalhost || looksLikeIp || looksLikeDomain)) {
            return { url: `https://${value}` };
        }

        if (!hasSpaces && lower.includes('.') && !lower.includes('..')) {
            return { url: `https://${value}` };
        }

        return {
            url: this.buildSearchUrl(value),
            isSearch: true,
            query: value,
            title: `Search: ${value}`
        };
    }

    displayOmniboxValue(tab) {
        const url = tab?.url || '';
        if (this.isInternalNewTab(url)) {
            return '';
        }
        return url;
    }

    isInternalNewTab(url) {
        return !url || url.includes('newtab.internal');
    }

    buildSearchUrl(query) {
        const engine = window.AppState?.searchEngine || 'Google';
        const encoded = encodeURIComponent(query);
        if (engine === 'Bing') {
            return `https://www.bing.com/search?q=${encoded}`;
        }
        if (engine === 'DuckDuckGo') {
            return `https://duckduckgo.com/?q=${encoded}`;
        }
        return `https://www.google.com/search?q=${encoded}`;
    }

    navigateTab(url, meta = {}) {
        window.AppState.update(state => {
            const activeTab = state.tabs.find(t => t.id === state.activeTabId);
            if (activeTab) {
                activeTab.url = url;
                activeTab.searchQuery = meta.query || null;
                activeTab.isSearchResult = Boolean(meta.isSearch);
                activeTab.loadError = null;
                activeTab.loading = false;
                try {
                    if (meta.title) {
                        activeTab.title = meta.title;
                    } else if (url.startsWith('aero://') || url.startsWith('browser://')) {
                        const pageName = url.replace('aero://', '').replace('browser://', '').split('/')[0];
                        activeTab.title = pageName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    } else {
                        const parsed = new URL(url);
                        activeTab.title = parsed.hostname.replace('www.', '');
                    }
                } catch {
                    activeTab.title = url;
                }

                state.history = state.history || [];
                const domain = this.displayDomain(url);
                state.history.unshift({
                    id: Date.now(),
                    date: 'Today',
                    title: activeTab.title,
                    domain,
                    url,
                    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                    faviconClass: meta.isSearch ? 'hgi-search-01' : 'hgi-global'
                });
            }
        });
    }

    navigateTabSafely(url, meta = {}) {
        window.AppState.update(state => {
            const activeTab = state.tabs.find(t => t.id === state.activeTabId);
            const isSafeToOverride = !activeTab || 
                                     activeTab.url.includes('newtab.internal') || 
                                     activeTab.url === '';
            
            let title = meta.title || '';
            if (!title) {
                if (url.startsWith('aero://') || url.startsWith('browser://')) {
                    const pageName = url.replace('aero://', '').replace('browser://', '').split('/')[0];
                    title = pageName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                } else {
                    try {
                        const parsed = new URL(url);
                        title = parsed.hostname.replace('www.', '');
                    } catch {
                        title = url;
                    }
                }
            }

            if (isSafeToOverride && activeTab) {
                activeTab.url = url;
                activeTab.title = title;
                activeTab.searchQuery = meta.query || null;
                activeTab.isSearchResult = Boolean(meta.isSearch);
                activeTab.loadError = null;
                activeTab.loading = false;
            } else {
                const newId = `tab-${Date.now()}`;
                state.tabs.push({
                    id: newId,
                    title: title,
                    url: url,
                    hibernated: false,
                    active: true,
                    workspace: state.activeWorkspace || 'Default',
                    loadError: null,
                    loading: false
                });
                state.activeTabId = newId;
            }

            state.history = state.history || [];
            const domain = this.displayDomain(url);
            state.history.unshift({
                id: Date.now(),
                date: 'Today',
                title: title,
                domain,
                url,
                time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                faviconClass: meta.isSearch ? 'hgi-search-01' : 'hgi-global'
            });
        });
    }

    displayDomain(url) {
        try {
            if (url.startsWith('aero://') || url.startsWith('browser://')) {
                return url.split('/')[0];
            }
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    }

    showEditBookmarkPopup(anchorBtn, bookmark) {
        // Remove existing popup if any
        document.querySelectorAll('.edit-bookmark-popup').forEach(el => el.remove());

        const popup = document.createElement('div');
        popup.className = 'edit-bookmark-popup animate-fade-in';
        
        let domain = '';
        try {
            domain = new URL(bookmark.url).hostname;
        } catch {}
        const faviconUrl = domain ? `https://www.google.com/s2/favicons?sz=32&domain=${domain}` : '';

        // Create initial content layout
        popup.innerHTML = `
            <div class="ebp-left">
                <div class="ebp-thumbnail">
                    ${faviconUrl ? `<img src="${faviconUrl}" alt="" style="width: 24px; height: 24px; border-radius: 4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />` : ''}
                    <i class="hgi-stroke hgi-globe" style="font-size: 24px; color: var(--color-text-inactive); display: ${faviconUrl ? 'none' : 'block'};"></i>
                </div>
            </div>
            <div class="ebp-right">
                <div class="ebp-header">
                    <span>Edit bookmark</span>
                    <button class="ebp-close-btn" aria-label="Close popup">&times;</button>
                </div>
                <div class="ebp-form-group">
                    <label class="ebp-label">Name</label>
                    <input type="text" class="ebp-name-input" value="${bookmark.title}" />
                </div>
                <div class="ebp-form-group">
                    <label class="ebp-label">Folder</label>
                    <div class="ebp-folder-select-wrapper">
                        <div class="ebp-folder-select-trigger">
                            <span class="ebp-selected-folder-text">${bookmark.folder || 'Bookmarks bar'}</span>
                            <i class="hgi-stroke hgi-arrow-down-01" style="font-size: 11px;"></i>
                        </div>
                        <div class="ebp-folder-dropdown">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>
                <div class="ebp-footer">
                    <button class="ebp-done-btn">Done</button>
                    <button class="ebp-remove-btn">Remove</button>
                </div>
            </div>
        `;

        // Position popup absolutely relative to the star button
        let targetBtn = anchorBtn;
        if (targetBtn && !document.contains(targetBtn)) {
            const reFound = document.querySelector('.url-bookmark-btn');
            if (reFound) targetBtn = reFound;
        }

        const rect = targetBtn.getBoundingClientRect();
        Object.assign(popup.style, {
            position: 'fixed',
            top: `${rect.bottom + 8}px`,
            left: `${Math.max(12, rect.right - 360)}px`,
            width: '360px',
            zIndex: '100000',
            boxSizing: 'border-box'
        });

        document.body.appendChild(popup);

        // Name input logic
        const nameInput = popup.querySelector('.ebp-name-input');
        nameInput.select(); // auto focus and highlight the text as shown in screenshot

        // Dropdown toggle logic
        const folderTrigger = popup.querySelector('.ebp-folder-select-trigger');
        const folderDropdown = popup.querySelector('.ebp-folder-dropdown');
        
        const renderFolderOptions = () => {
            // Folders list includes "Bookmarks bar", "Other bookmarks", and any folders in AppState.bookmarksFolders
            const appFolders = window.AppState.bookmarksFolders || [];
            const standardFolders = ['Bookmarks bar', 'Other bookmarks'];
            const allFolders = Array.from(new Set([...standardFolders, ...appFolders]));
            
            const currentFolder = bookmark.folder || 'Bookmarks bar';

            let optionsHtml = allFolders.map(f => {
                const isSelected = f === currentFolder;
                return `
                    <div class="ebp-folder-option" data-folder="${f}">
                        <i class="hgi-stroke hgi-tick-01 checkmark" style="font-size: 12px; visibility: ${isSelected ? 'visible' : 'hidden'}; color: #1b828f;"></i>
                        <span>${f}</span>
                    </div>
                `;
            }).join('');

            optionsHtml += `
                <div class="ebp-divider"></div>
                <div class="ebp-folder-option ebp-choose-another" style="color: #1b828f;">
                    <i class="hgi-stroke hgi-folder-add" style="font-size: 12px; color: #1b828f; margin-right: 4px;"></i>
                    <span>Choose another folder...</span>
                </div>
            `;
            
            folderDropdown.innerHTML = optionsHtml;

            // Bind click handlers for options
            folderDropdown.querySelectorAll('.ebp-folder-option').forEach(opt => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (opt.classList.contains('ebp-choose-another')) {
                        // Choose another folder
                        const newFolderName = prompt("Enter new folder name:");
                        if (newFolderName && newFolderName.trim()) {
                            const trimmed = newFolderName.trim();
                            window.AppState.update(state => {
                                if (!state.bookmarksFolders.includes(trimmed)) {
                                    state.bookmarksFolders.push(trimmed);
                                }
                            });
                            bookmark.folder = trimmed;
                            popup.querySelector('.ebp-selected-folder-text').innerText = trimmed;
                            renderFolderOptions();
                        }
                    } else {
                        const folderName = opt.getAttribute('data-folder');
                        bookmark.folder = folderName;
                        popup.querySelector('.ebp-selected-folder-text').innerText = folderName;
                        renderFolderOptions();
                    }
                    folderDropdown.style.display = 'none';
                });
            });
        };

        renderFolderOptions();

        folderTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = folderDropdown.style.display === 'flex';
            folderDropdown.style.display = isOpen ? 'none' : 'flex';
        });

        // Close folder dropdown when clicking outside the dropdown trigger
        const closeFolderDropdown = (e) => {
            if (!folderTrigger.contains(e.target) && !folderDropdown.contains(e.target)) {
                folderDropdown.style.display = 'none';
            }
        };
        document.addEventListener('click', closeFolderDropdown);

        // Close on close click
        const closeBtn = popup.querySelector('.ebp-close-btn');
        const closePopup = () => {
            // Save state updates (Name/Folder edits) when closed
            const currentName = nameInput.value.trim() || bookmark.title;
            window.AppState.update(state => {
                const item = state.bookmarks.find(b => b.id === bookmark.id || b.url === bookmark.url);
                if (item) {
                    item.title = currentName;
                    item.folder = bookmark.folder || 'Bookmarks bar';
                }
            });
            popup.remove();
            document.removeEventListener('click', clickOutsideHandler);
            document.removeEventListener('click', closeFolderDropdown);
        };

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopup();
        });

        // Done button logic
        const doneBtn = popup.querySelector('.ebp-done-btn');
        doneBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopup();
        });

        // Remove button logic
        const removeBtn = popup.querySelector('.ebp-remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.AppState.update(state => {
                state.bookmarks = state.bookmarks.filter(b => b.url !== bookmark.url);
            });
            popup.remove();
            document.removeEventListener('click', clickOutsideHandler);
            document.removeEventListener('click', closeFolderDropdown);
        });

        // Click outside to dismiss and save
        const clickOutsideHandler = (e) => {
            if (!popup.contains(e.target) && !anchorBtn.contains(e.target)) {
                closePopup();
            }
        };

        setTimeout(() => {
            document.addEventListener('click', clickOutsideHandler);
        }, 0);
    }
}
