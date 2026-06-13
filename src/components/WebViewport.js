import { BaseComponent } from './BaseComponent.js';
import { BackendClient } from '../services/BackendClient.js';
import { renderNewTabPage, bindNewTabPageEvents } from './NewTabPage.js';
import { renderAccessibilityTreeOverlay, handleAgentActionHighlight } from './AgentOverlay.js';

export class WebViewport extends BaseComponent {
    constructor() {
        super();
        this.highlightedElementId = null;
        this.lastRenderKey = '';
        this.webviewTargets = new Map();
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            const activeTab = state.tabs.find(t => t.id === state.activeTabId);
            const tabShape = state.tabs
                .map(tab => `${tab.id}:${this.shouldUseNativeWebview(tab.url) ? 'web' : 'internal'}`)
                .join(',');
            const renderKey = [
                tabShape,
                activeTab?.id || '',
                this.shouldUseNativeWebview(activeTab?.url) ? 'web' : (activeTab?.url || ''),
                state.showAiView ? 'ai-view' : '',
                state.zoomLevel || 100,
                state.runtimeEngine || 'web'
            ].join('|');

            if (renderKey === this.lastRenderKey) {
                this.syncRenderedWebviews(state);
                return;
            }

            this.lastRenderKey = renderKey;
            this.setState({
                activeTab,
                showAiView: state.showAiView,
                zoomLevel: state.zoomLevel || 100,
                runtimeEngine: state.runtimeEngine || 'web'
            });
            this.syncRenderedWebviews(state);
        });

        document.addEventListener('viewport-highlight-step', (e) => {
            const stepIndex = e.detail.stepIndex;
            this.handleAgentActionHighlight(stepIndex);
        });

        document.addEventListener('aero-webview-command', (e) => {
            this.runWebviewCommand(e.detail?.command);
        });

        this._executeBrowserCommandHandler = async (event) => {
            const result = await this.executeBrowserCommand(
                event.detail?.command,
                event.detail?.reason || 'User requested browser action'
            );
            document.dispatchEvent(new CustomEvent('aero-browser-command-result', {
                detail: {
                    requestId: event.detail?.requestId,
                    result
                }
            }));
        };
        document.addEventListener('aero-execute-browser-command', this._executeBrowserCommandHandler);
        window.AeroExecuteBrowserCommand = (command, reason) => this.executeBrowserCommand(command, reason);

        this._capturePageHandler = async (event) => {
            const snapshot = await this.captureActivePageSnapshot();
            document.dispatchEvent(new CustomEvent('aero-active-page-snapshot', {
                detail: {
                    requestId: event.detail?.requestId,
                    snapshot
                }
            }));
        };
        document.addEventListener('aero-capture-active-page', this._capturePageHandler);
        window.AeroCaptureActivePage = () => this.captureActivePageSnapshot();

        this._contextMenuHandler = (e) => {
            const isInsideWebview = e.target.closest('webview, .chromium-webview-stack');
            if (!isInsideWebview) {
                e.preventDefault();
                this.showViewportContextMenu(e.clientX, e.clientY, null);
            }
        };
        this.addEventListener('contextmenu', this._contextMenuHandler);

        super.connectedCallback();
    }

    disconnectedCallback() {
        if (this._capturePageHandler) {
            document.removeEventListener('aero-capture-active-page', this._capturePageHandler);
        }
        if (this._executeBrowserCommandHandler) {
            document.removeEventListener('aero-execute-browser-command', this._executeBrowserCommandHandler);
        }
        if (this._contextMenuHandler) {
            this.removeEventListener('contextmenu', this._contextMenuHandler);
        }
        if (window.AeroCaptureActivePage) {
            delete window.AeroCaptureActivePage;
        }
        if (window.AeroExecuteBrowserCommand) {
            delete window.AeroExecuteBrowserCommand;
        }
        super.disconnectedCallback();
    }

    template() {
        const tab = this.state.activeTab || { url: 'https://newtab.internal', title: 'New Tab' };
        const showAiView = this.state.showAiView;
        const isNewTab = tab.url.includes('newtab.internal') || tab.url === '' || tab.title === 'New Tab';
        const isInternalPage = tab.url.startsWith('aero://') || tab.url.startsWith('browser://');
        const isNativeWeb = this.shouldUseNativeWebview(tab.url);
        const loadError = tab.loadError;
        // Disabling duplicate URL webpage-header tray (redundant with the main Omnibox/address bar)
        const showHeader = false;
        const activeInternalHtml = isNativeWeb ? '' : (
            isNewTab
                ? this.renderNewTabPage()
                : isInternalPage
                    ? this.renderInternalPage(tab.url)
                    : this.renderPageContent(tab.url)
        );

        return `
            ${showHeader ? `
                <!-- webpage-header -->
                <div class="webpage-header" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm) var(--spacing-md); background: var(--color-window-bg); border-bottom: 1px solid var(--color-border-light); font-size: 11px; color: var(--color-text-inactive);">
                    <span class="webpage-status-dot" style="width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-inactive);"></span>
                    <span class="webpage-url-indicator" style="font-family: var(--font-ui); font-weight: var(--font-weight-medium);">${tab.url}</span>
                </div>
            ` : ''}

            <!-- webpage-content-area -->
            <div class="webpage-content-area" id="web-content-scroll" style="flex: 1; overflow-y: auto; background: ${isNewTab ? 'var(--color-toolbar-bg)' : 'var(--color-viewport-bg)'}; color: var(--color-viewport-text); position: relative; font-family: var(--font-ui); display: flex; flex-direction: column;">
                ${this.state.runtimeEngine === 'chromium' ? this.renderPersistentWebviews() : ''}
                ${activeInternalHtml}
                ${loadError && isNativeWeb ? this.renderLoadError(loadError, tab.url) : ''}
                
                <!-- Accessibility Tree Overlay (Layer 1 AXTree view) -->
                ${showAiView ? this.renderAccessibilityTreeOverlay(tab.url) : ''}
                
                <!-- Live AI control cursor -->
                <div id="agent-cursor" class="agent-cursor-sim" style="position: absolute; left: 0; top: 0; width: 16px; height: 16px; background: rgba(77, 144, 254, 0.78); border: 2px solid #FFFFFF; border-radius: 50%; display: none; pointer-events: none; z-index: 9999; box-shadow: 0 0 0 0 rgba(77,144,254,0.45), 0 0 12px rgba(77, 144, 254, 0.9); transform: translate3d(20px, 20px, 0); transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.12s ease, width 0.12s ease, height 0.12s ease;"></div>
                <div id="agent-typing-bubble" style="position: absolute; left: 0; top: 0; display: none; pointer-events: none; z-index: 9998; transform: translate3d(36px, 36px, 0); background: rgba(20, 28, 46, 0.88); color: #fff; border-radius: 6px; padding: 5px 8px; font-size: 11px; font-weight: 600; box-shadow: var(--shadow-md);">AI typing</div>
            </div>
        `;
    }

    renderLoadError(error, url) {
        const safeUrl = this.escapeHtml(url || error.url || '');
        const safeDescription = this.escapeHtml(error.description || 'This page could not be loaded.');
        const safeCode = this.escapeHtml(String(error.code || ''));
        return `
            <div class="webview-error-overlay" style="position: absolute; inset: 0; z-index: 40; background: var(--color-viewport-bg); color: var(--color-viewport-text); display: flex; align-items: center; justify-content: center; padding: 32px;">
                <div style="max-width: 560px; width: 100%; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; padding: 24px; box-shadow: var(--shadow-md);">
                    <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(217,48,37,0.1); color: #D93025; display: flex; align-items: center; justify-content: center; margin-bottom: 14px;">
                        <i class="hgi-stroke hgi-alert-circle" style="font-size: 22px;"></i>
                    </div>
                    <h2 style="margin: 0; font-size: 20px; font-weight: 700;">This site can't be reached</h2>
                    <p style="margin: 8px 0 0; font-size: 13px; color: var(--color-viewport-text-muted); line-height: 1.55; overflow-wrap: anywhere;">${safeUrl}</p>
                    <div style="margin-top: 16px; padding: 12px; border-radius: 8px; background: var(--color-viewport-bg); border: 1px solid var(--color-viewport-border); font-size: 12px; color: var(--color-viewport-text-muted);">
                        ${safeDescription}${safeCode ? ` <span style="opacity: .7;">(${safeCode})</span>` : ''}
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 18px;">
                        <button id="retry-load-btn" style="background: var(--color-input-focus-border); color: #fff; border: none; border-radius: 6px; padding: 9px 14px; font-size: 12px; font-weight: 650; cursor: pointer;">Retry</button>
                        <button id="open-search-fallback-btn" style="background: transparent; color: var(--color-viewport-text); border: 1px solid var(--color-viewport-border); border-radius: 6px; padding: 9px 14px; font-size: 12px; font-weight: 650; cursor: pointer;">Search this address</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderInternalPage(url) {
        const path = url.replace('aero://', '').replace('browser://', '').split('/')[0];
        
        if (path === 'settings') {
            return `<browser-settings-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-settings-page>`;
        }
        if (path === 'history') {
            return `<browser-history-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-history-page>`;
        }
        if (path === 'downloads') {
            return `<browser-downloads-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-downloads-page>`;
        }
        if (path === 'bookmarks') {
            return `<browser-bookmarks-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-bookmarks-page>`;
        }
        if (path === 'reading-list') {
            return `<browser-reading-list-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-reading-list-page>`;
        }
        if (path === 'search') {
            return `<browser-search-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-search-page>`;
        }
        if (path === 'workspaces') {
            return `<browser-workspaces-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-workspaces-page>`;
        }
        if (path === 'ai-setup') {
            return `<browser-ai-setup-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-ai-setup-page>`;
        }
        if (path === 'security') {
            return `<browser-security-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-security-page>`;
        }
        if (path === 'passwords') {
            return `<browser-passwords-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-passwords-page>`;
        }
        if (path === 'payments') {
            return `<browser-payments-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-payments-page>`;
        }
        if (path === 'addresses') {
            return `<browser-addresses-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-addresses-page>`;
        }
        if (path === 'tools') {
            return `<browser-tools-page style="flex: 1; height: 100%; width: 100%; display: block; overflow: hidden;"></browser-tools-page>`;
        }
        
        return `
            <div style="padding: var(--spacing-xxl); color: var(--color-viewport-text-muted); font-family: var(--font-ui);">
                <h3 style="margin: 0 0 var(--spacing-sm); font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold);">Internal Page</h3>
                <p style="margin: 0; font-size: var(--font-size-sm);">${url} is not yet implemented</p>
            </div>
        `;
    }

    renderNewTabPage() {
        return renderNewTabPage(window.AppState?.blockedTrackers || 0);
    }

    renderPageContent(url) {
        const lowerUrl = url.toLowerCase();
        if (this.shouldUseNativeWebview(url)) {
            return this.renderChromiumWebview(url);
        }

        const searchData = this.parseSearchUrl(url);
        if (searchData) {
            return this.renderSearchResultsPage(searchData);
        }

        if (lowerUrl.includes('google.com') && !lowerUrl.includes('/search')) {
            return this.renderDomainLanding({
                host: 'Google.com',
                title: 'Google',
                subtitle: 'Search the web from Aero.',
                accent: '#4285F4',
                queryPlaceholder: 'Search Google or type a URL'
            });
        }

        if (lowerUrl.includes('flights.nifty.com')) {
            return `
                <div class="flight-portal-mock" style="padding: var(--spacing-xl); background: var(--color-viewport-bg); color: var(--color-viewport-text);">
                    <div class="portal-hero" style="margin-bottom: var(--spacing-xl);">
                        <h2 style="margin: 0 0 var(--spacing-xs); font-family: var(--font-ui); font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: #1A73E8;">Nifty Flights — Search & Book</h2>
                        <p style="margin: 0; color: var(--color-viewport-text-muted); font-size: var(--font-size-sm);">Search, compare, and book international flights instantly</p>
                    </div>
                    
                    <!-- Search Form Group -->
                    <div class="search-form-group" style="background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-md); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
                        <div class="form-row" style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                            <div class="form-field" id="node-origin" style="flex: 1; display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                <label style="font-size: 10px; font-weight: var(--font-weight-medium); color: var(--color-text-inactive);">From</label>
                                <input type="text" value="Delhi (DEL)" readonly style="background: var(--color-viewport-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-sm); color: var(--color-viewport-text); width: 100%;" class="active-highlight-target">
                            </div>
                            <div class="form-field" id="node-destination" style="flex: 1; display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                <label style="font-size: 10px; font-weight: var(--font-weight-medium); color: var(--color-text-inactive);">To</label>
                                <input type="text" value="Tokyo (NRT)" readonly style="background: var(--color-viewport-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-sm); color: var(--color-viewport-text); width: 100%;" class="active-highlight-target">
                            </div>
                            <div class="form-field" id="node-dates" style="flex: 1; display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                <label style="font-size: 10px; font-weight: var(--font-weight-medium); color: var(--color-text-inactive);">Dates</label>
                                <input type="text" value="03 Jul - 10 Jul" readonly style="background: var(--color-viewport-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-sm); color: var(--color-viewport-text); width: 100%;">
                            </div>
                        </div>
                        <button class="portal-search-btn" id="node-search-btn" style="background: #1A73E8; color: #FFFFFF; padding: var(--spacing-sm) var(--spacing-xl); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); border-radius: var(--border-radius-sm); cursor: pointer; border: none;">Search Flights</button>
                    </div>

                    <!-- Airline Lists -->
                    <div class="flight-results-list">
                        <h3 style="margin: 0 0 var(--spacing-md); font-family: var(--font-ui); font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Available Flights (Delhi to Tokyo)</h3>
                        
                         <div class="flight-card cheapest active-card" id="node-cheapest-flight" style="background: var(--color-viewport-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-md); padding: var(--spacing-md); display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm); border-left: 4px solid #1A73E8;">
                            <div class="airline-info" style="display: flex; align-items: center; gap: var(--spacing-md);">
                                <span class="carrier-logo" style="font-size: 20px; display: flex; align-items: center; justify-content: center;"><i class="hgi-stroke hgi-airplane-01" style="font-size: 20px; color: var(--color-viewport-text);"></i></span>
                                <div>
                                    <h5 style="margin: 0 0 2px; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Air Asia D7-182</h5>
                                    <span class="meta-tag" style="font-size: 9px; font-weight: var(--font-weight-semibold); color: #188038; background: rgba(24, 128, 56, 0.1); padding: 1px var(--spacing-sm); border-radius: var(--border-radius-pill);">Cheapest Flight</span>
                                </div>
                            </div>
                            <div class="flight-timing" style="display: flex; flex-direction: column; align-items: center; font-size: var(--font-size-sm); color: var(--color-viewport-text-muted);">
                                <strong style="color: var(--color-viewport-text);">10h 40m</strong>
                                <span>1 Stop (KUL)</span>
                            </div>
                            <div class="flight-pricing" style="display: flex; align-items: center; gap: var(--spacing-lg);">
                                <span class="price" style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-viewport-text);">₹32,100</span>
                                <button class="select-btn active-highlight-target" id="node-book-btn" style="background: #1A73E8; color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-sm); border: none; cursor: pointer;">Book Flight</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (lowerUrl.includes('github.com')) {
            return `
                <div class="github-mock" style="padding: var(--spacing-xl); background: var(--color-viewport-bg); color: var(--color-viewport-text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
                    <div class="repo-header" style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-md); color: var(--color-viewport-text-muted);">
                        <span class="repo-owner" style="color: #0366d6; cursor: pointer;">browser-project</span> / <strong style="color: var(--color-viewport-text);">core</strong>
                        <span class="repo-badge" style="font-size: 10px; font-weight: var(--font-weight-medium); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-pill); padding: 1px var(--spacing-sm); vertical-align: middle; margin-left: var(--spacing-xs);">Public</span>
                    </div>
                    
                    <!-- File tree list -->
                    <div class="repo-file-tree" style="border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-md); overflow: hidden; margin-bottom: var(--spacing-lg);">
                        <div class="tree-item header" style="display: flex; justify-content: space-between; background: var(--color-window-bg); border-bottom: 1px solid var(--color-viewport-border); padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-xs); color: var(--color-text-inactive); font-weight: var(--font-weight-semibold);">
                            <span>Name</span>
                            <span>Last Commit</span>
                        </div>
                        <div class="tree-item" style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-viewport-border); padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-xs);">
                            <span style="color: #0366d6; cursor: pointer; display: flex; align-items: center; gap: var(--spacing-sm);"><i class="hgi-stroke hgi-folder" style="font-size: 14px; color: inherit;"></i>src/components</span>
                            <span style="color: var(--color-viewport-text-muted);">refactor tabstrip logic</span>
                        </div>
                    </div>
                </div>
            `;
        }

        if (!lowerUrl.includes('browser.internal/docs')) {
            return this.renderGenericWebPage(url);
        }

        // Default Specs Docs
        return `
            <div class="docs-viewport-mock" style="padding: var(--spacing-xxl); background: var(--color-viewport-bg); color: var(--color-viewport-text);">
                <h1 style="margin: 0 0 var(--spacing-xs); font-family: var(--font-ui); font-size: var(--font-size-xxl); font-weight: var(--font-weight-bold); color: var(--color-viewport-text);">Browser System Specification</h1>
                <p class="subtitle" style="margin: 0 0 var(--spacing-xl); font-size: var(--font-size-sm); color: var(--color-viewport-text-muted);">AI-Native, Ultra-Fast Windows Browser Core</p>
                
                <div class="alert-block" style="background: var(--color-window-bg); border-left: 4px solid #1A73E8; padding: var(--spacing-md); margin-bottom: var(--spacing-xl); font-size: var(--font-size-sm); color: var(--color-viewport-text);">
                    <strong>System Memory Rules Status:</strong> 
                    <span style="color: #188038; font-weight: var(--font-weight-semibold);">Active (.memory rules loaded successfully at root).</span>
                </div>

                <section class="docs-section" style="margin-bottom: var(--spacing-xl);">
                    <h3 style="font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); margin: 0 0 var(--spacing-sm); border-bottom: 1px solid var(--color-viewport-border); padding-bottom: var(--spacing-xs);">1. Executive Architecture Summary</h3>
                    <p style="font-size: var(--font-size-sm); line-height: var(--line-height-normal); color: var(--color-viewport-text-muted); margin: 0;">Browser splits operations between two isolated process environments: a tuned C++ Chromium shell and a Rust Aether Agent Runtime. Communication occurs via Windows Named Pipes carrying Protocol Buffers. Clicks and inputs utilize the Chrome DevTools Protocol (CDP) to dispatch native input event coordinates, eliminating script-injection vulnerabilities.</p>
                </section>
            </div>
        `;
    }

    shouldUseNativeWebview(url) {
        return this.state.runtimeEngine === 'chromium' && this.isExternalUrl(url) && !this.isInternalHttpUrl(url);
    }

    isExternalUrl(url) {
        return /^https?:\/\//i.test(url || '');
    }

    isInternalHttpUrl(url) {
        try {
            const host = new URL(url).hostname.toLowerCase();
            return host === 'newtab.internal' || host === 'browser.internal' || host.endsWith('.internal');
        } catch {
            return false;
        }
    }

    renderPersistentWebviews() {
        const tabs = window.AppState?.tabs || [];
        const activeId = this.state.activeTab?.id;
        return `
            <div class="chromium-webview-stack" style="position: ${this.shouldUseNativeWebview(this.state.activeTab?.url) ? 'relative' : 'absolute'}; inset: 0; flex: 1; min-height: 0; display: ${this.shouldUseNativeWebview(this.state.activeTab?.url) ? 'flex' : 'none'}; background: #fff;">
                ${tabs.filter(tab => this.shouldUseNativeWebview(tab.url)).map(tab => this.renderChromiumWebview(tab, tab.id === activeId)).join('')}
            </div>
        `;
    }

    renderChromiumWebview(tab, active) {
        const url = tab.url;
        const safeUrl = this.escapeHtml(url);
        const safeId = this.escapeHtml(tab.id);
        return `
            <webview
                data-tab-id="${safeId}"
                class="chromium-webview"
                src="${safeUrl}"
                partition="persist:aero-default"
                allowpopups
                style="display: ${active ? 'flex' : 'none'}; flex: 1; width: 100%; height: 100%; border: 0; background: #fff;"
            ></webview>
        `;
    }

    parseSearchUrl(url) {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace('www.', '');
            if (host === 'google.com' && parsed.pathname.startsWith('/search')) {
                return {
                    engine: 'Google',
                    query: parsed.searchParams.get('q') || '',
                    url
                };
            }
            if (host === 'bing.com' && parsed.pathname.startsWith('/search')) {
                return {
                    engine: 'Bing',
                    query: parsed.searchParams.get('q') || '',
                    url
                };
            }
            if (host === 'duckduckgo.com') {
                return {
                    engine: 'DuckDuckGo',
                    query: parsed.searchParams.get('q') || '',
                    url
                };
            }
        } catch {}
        return null;
    }

    renderSearchResultsPage({ engine, query, url }) {
        const safeQuery = this.escapeHtml(query || 'Search');
        const results = this.searchResultItems(query);
        const isGoogleQuery = String(query || '').trim().toLowerCase() === 'google';

        return `
            <div class="manual-search-page" style="background: #fff; color: #202124; min-height: 100%; padding: 0 0 48px; box-sizing: border-box; font-family: Arial, var(--font-ui), sans-serif;">
                <div style="display: flex; align-items: center; gap: 28px; padding: 28px 42px 18px 62px;">
                    <div style="font-size: 34px; font-weight: 700; letter-spacing: -1.5px; line-height: 1;">
                        <span style="color:#4285F4;">G</span><span style="color:#EA4335;">o</span><span style="color:#FBBC05;">o</span><span style="color:#4285F4;">g</span><span style="color:#34A853;">l</span><span style="color:#EA4335;">e</span>
                    </div>
                    <div style="width: min(720px, calc(100vw - 420px)); min-height: 46px; border-radius: 999px; background: #fff; box-shadow: 0 1px 6px rgba(32,33,36,.28); display: flex; align-items: center; padding: 0 16px 0 24px; gap: 14px;">
                        <span style="font-size: 16px; color: #202124; flex: 1;">${safeQuery}</span>
                        <i class="hgi-stroke hgi-cancel-01" style="font-size: 16px; color: #5f6368;"></i>
                        <span style="height: 28px; width: 1px; background: #dadce0;"></span>
                        <i class="hgi-stroke hgi-keyboard" style="font-size: 17px; color: #5f6368;"></i>
                        <i class="hgi-stroke hgi-mic-01" style="font-size: 17px; color: #5f6368;"></i>
                        <i class="hgi-stroke hgi-camera-01" style="font-size: 17px; color: #5f6368;"></i>
                        <i class="hgi-stroke hgi-search-01" style="font-size: 18px; color: #1a73e8;"></i>
                    </div>
                    <div style="margin-left: auto; display: flex; align-items: center; gap: 18px; color: #3c4043;">
                        <i class="hgi-stroke hgi-flask" style="font-size: 20px;"></i>
                        <i class="hgi-stroke hgi-grid-view" style="font-size: 20px;"></i>
                        <div style="width: 34px; height: 34px; border-radius: 50%; background: #e8f0fe; display: grid; place-items: center; color: #1a73e8; font-weight: 700;">A</div>
                    </div>
                </div>

                <div style="display: flex; gap: 28px; padding-left: 262px; border-bottom: 1px solid #dadce0; color: #5f6368; font-size: 14px;">
                    <span style="padding: 12px 0 13px;">AI Mode</span>
                    <span style="padding: 12px 0 11px; color: #202124; border-bottom: 3px solid #202124;">All</span>
                    <span style="padding: 12px 0 13px;">Videos</span>
                    <span style="padding: 12px 0 13px;">Images</span>
                    <span style="padding: 12px 0 13px;">News</span>
                    <span style="padding: 12px 0 13px;">Shopping</span>
                    <span style="padding: 12px 0 13px;">Short videos</span>
                    <span style="padding: 12px 0 13px;">More</span>
                    <span style="padding: 12px 0 13px;">Tools</span>
                </div>

                <div style="display: grid; grid-template-columns: minmax(560px, 810px) minmax(320px, 492px); gap: 40px; padding: 28px 60px 0 262px;">
                    <main>
                        <p style="margin: 0 0 22px; font-size: 14px; color: #70757a;">About ${(isGoogleQuery ? 8570000000 : Math.max(78000, safeQuery.length * 358000)).toLocaleString()} results</p>
                        <div style="display: flex; flex-direction: column; gap: 24px;">
                            ${results.map((item, index) => `
                                <article class="manual-search-result" data-url="${item.url}" style="padding: 0 0 ${index === 0 && item.sitelinks ? '10px' : '18px'};">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
                                        <span style="display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #f1f3f4; color: ${item.brandColor || '#1a73e8'};">
                                            ${item.logoText ? `<span style="font-weight: 700; font-size: 18px;">${item.logoText}</span>` : `<i class="hgi-stroke ${item.icon}" style="font-size: 15px;"></i>`}
                                        </span>
                                        <div style="display: flex; flex-direction: column;">
                                            <span style="font-size: 14px; color: #202124;">${item.source}</span>
                                            <span style="font-size: 12px; color: #4d5156;">${item.url}</span>
                                        </div>
                                        <i class="hgi-stroke hgi-more-vertical" style="font-size: 14px; color: #5f6368;"></i>
                                    </div>
                                    <h3 style="margin: 0 0 6px; font-size: 20px; line-height: 1.3; font-weight: 400; color: #1a0dab;">${item.title}</h3>
                                    <p style="margin: 0; color: #4d5156; font-size: 14px; line-height: 1.55;">${item.snippet}</p>
                                    ${item.sitelinks ? `
                                        <div style="margin: 22px 0 0 24px; border-top: 1px solid #dadce0;">
                                            ${item.sitelinks.map(link => `
                                                <div style="display: flex; justify-content: space-between; gap: 18px; padding: 13px 0; border-bottom: 1px solid #dadce0;">
                                                    <div>
                                                        <div style="font-size: 20px; color: #1a0dab; line-height: 1.25;">${link.title}</div>
                                                        <div style="font-size: 14px; color: #4d5156; margin-top: 3px;">${link.snippet}</div>
                                                    </div>
                                                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 18px; color: #5f6368; margin-top: 7px;"></i>
                                                </div>
                                            `).join('')}
                                            <div style="font-size: 14px; color: #1a0dab; padding-top: 14px;">More results from ${item.source.toLowerCase()} &raquo;</div>
                                        </div>
                                    ` : ''}
                                </article>
                            `).join('')}
                        </div>
                    </main>

                    <aside style="border-left: 1px solid #dadce0; padding-left: 28px; display: ${isGoogleQuery ? 'block' : 'none'};">
                        <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 14px;">
                            <div style="font-size: 56px; font-weight: 800; letter-spacing: -3px; color:#4285F4;">G</div>
                            <div>
                                <h2 style="margin: 0; font-size: 30px; font-weight: 400; color: #202124;">Google</h2>
                                <div style="font-size: 14px; color: #70757a;">Technology company</div>
                            </div>
                        </div>
                        <p style="margin: 18px 0 20px; font-size: 14px; line-height: 1.55; color: #202124;">Google LLC is an American multinational technology company focused on search, cloud computing, online advertising, software, and consumer products.</p>
                        <div style="display: grid; grid-template-columns: 1fr; border-radius: 10px; overflow: hidden; margin-top: 18px;">
                            ${[
                                ['Founders', 'Larry Page, Sergey Brin'],
                                ['CEO', 'Sundar Pichai'],
                                ['Founded', 'September 4, 1998, California'],
                                ['Parent', 'Alphabet Inc.'],
                                ['Headquarters', 'Mountain View, California']
                            ].map(row => `
                                <div style="display: grid; grid-template-columns: 132px 1fr; background: #f1f3f4; border-bottom: 2px solid #fff; font-size: 14px;">
                                    <div style="padding: 13px 14px; color: #5f6368;">${row[0]}</div>
                                    <div style="padding: 13px 14px; color: #202124;">${row[1]}</div>
                                </div>
                            `).join('')}
                        </div>
                    </aside>
                </div>
            </div>
        `;
    }

    searchResultItems(query) {
        const safe = this.escapeHtml(query || 'your search');
        const normalized = String(query || '').trim().toLowerCase();
        if (normalized === 'google') {
            return [
                {
                    title: 'Google',
                    source: 'Google',
                    url: 'https://www.google.com',
                    snippet: "Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for.",
                    icon: 'hgi-global',
                    logoText: 'G',
                    brandColor: '#4285F4',
                    sitelinks: [
                        { title: 'Account', snippet: 'Sign in to your Google Account and learn how to set up security.' },
                        { title: 'Account in Google', snippet: 'Use your Google Account. Email or phone. Forgot email?' },
                        { title: 'Cloud', snippet: 'Meet your business challenges head on with AI and cloud.' },
                        { title: 'Search', snippet: 'Learn what Google Search is, how it works, and the approach.' },
                        { title: 'Apps on Google Play', snippet: 'The Google app offers more ways to search about what matters.' }
                    ]
                },
                {
                    title: 'YouTube - Google',
                    source: 'YouTube',
                    url: 'https://www.youtube.com/google',
                    snippet: 'The official Google channel, featuring videos about products, company news, AI, and helpful tips.',
                    icon: 'hgi-youtube'
                },
                {
                    title: 'Google Drive',
                    source: 'Google Workspace',
                    url: 'https://drive.google.com',
                    snippet: 'Store, share, and collaborate on files and folders from your browser.',
                    icon: 'hgi-folder'
                }
            ];
        }

        return [
            {
                title: `${safe} - Google Search`,
                source: 'Search result',
                url: `https://www.google.com/search?q=${encodeURIComponent(query || '')}`,
                snippet: `Top web results for "${safe}", including pages, images, videos, and related information.`,
                icon: 'hgi-search-01'
            },
            {
                title: `${safe} official site`,
                source: 'Official result',
                url: `https://www.${this.slug(query)}.com`,
                snippet: `Open the most likely official destination for "${safe}" or refine the query from the address bar.`,
                icon: 'hgi-global'
            },
            {
                title: `Latest information about ${safe}`,
                source: 'News and web',
                url: `https://news.search.aero/${encodeURIComponent(query || 'search')}`,
                snippet: `Recent pages, articles, documentation, and references related to "${safe}".`,
                icon: 'hgi-news'
            },
            {
                title: `${safe} from your browser data`,
                source: 'Local browser data',
                url: 'aero://search',
                snippet: `Matches from bookmarks, history, downloads, settings, and saved reading list items.`,
                icon: 'hgi-folder'
            }
        ];
    }

    renderDomainLanding({ host, title, subtitle, accent, queryPlaceholder }) {
        return `
            <div class="domain-landing-page" style="min-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; box-sizing: border-box; background: var(--color-viewport-bg); color: var(--color-viewport-text);">
                <div style="font-family: 'Outfit', var(--font-ui); font-size: 64px; font-weight: 600; color: ${accent}; margin-bottom: 18px;">${title}</div>
                <div style="width: min(620px, 100%); border-radius: 999px; background: var(--color-card-bg); box-shadow: var(--shadow-md); padding: 13px 18px; display: flex; align-items: center; gap: 12px; color: var(--color-viewport-text-muted);">
                    <i class="hgi-stroke hgi-search-01" style="font-size: 16px;"></i>
                    <span style="font-size: 14px;">${queryPlaceholder}</span>
                </div>
                <p style="margin: 18px 0 0; color: var(--color-viewport-text-muted); font-size: 13px;">${subtitle}</p>
                <div style="margin-top: 24px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                    <span style="padding: 8px 12px; border-radius: 999px; background: var(--color-card-bg); box-shadow: var(--shadow-sm); font-size: 12px;">${host}</span>
                    <span style="padding: 8px 12px; border-radius: 999px; background: var(--color-card-bg); box-shadow: var(--shadow-sm); font-size: 12px;">Secure page preview</span>
                </div>
            </div>
        `;
    }

    renderGenericWebPage(url) {
        let parsed = null;
        try {
            parsed = new URL(url);
        } catch {}
        const host = parsed?.hostname?.replace('www.', '') || this.escapeHtml(url);
        const title = host.split('.').filter(Boolean)[0] || 'Website';
        const prettyTitle = title.charAt(0).toUpperCase() + title.slice(1);
        return `
            <div class="generic-web-page" style="min-height: 100%; background: var(--color-viewport-bg); color: var(--color-viewport-text); padding: 48px 30px; box-sizing: border-box;">
                <div style="max-width: 920px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 28px;">
                        <div style="width: 42px; height: 42px; border-radius: 10px; background: var(--color-input-focus-border); color: #fff; display: grid; place-items: center; font-weight: 800;">${prettyTitle.charAt(0)}</div>
                        <div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 650;">${prettyTitle}</h1>
                            <p style="margin: 4px 0 0; color: var(--color-viewport-text-muted); font-size: 13px;">${host}</p>
                        </div>
                    </div>
                    <section style="background: var(--color-card-bg); border-radius: 8px; box-shadow: var(--shadow-sm); padding: 22px; margin-bottom: 14px;">
                        <h2 style="margin: 0 0 8px; font-size: 18px;">Page loaded</h2>
                        <p style="margin: 0; color: var(--color-viewport-text-muted); font-size: 14px; line-height: 1.6;">Aero recognized this as a URL and opened a clean page preview instead of sending it to search. Type a phrase with spaces in the address bar to see search results.</p>
                    </section>
                    <section style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;">
                        ${['Overview', 'Security', 'Site info'].map(label => `
                            <div style="background: var(--color-card-bg); border-radius: 8px; box-shadow: var(--shadow-sm); padding: 16px;">
                                <strong style="display: block; font-size: 13px; margin-bottom: 6px;">${label}</strong>
                                <span style="color: var(--color-viewport-text-muted); font-size: 12px;">Ready</span>
                            </div>
                        `).join('')}
                    </section>
                </div>
            </div>
        `;
    }

    slug(query) {
        const clean = String(query || 'example')
            .toLowerCase()
            .replace(/https?:\/\//g, '')
            .replace(/[^a-z0-9]+/g, '')
            .slice(0, 28);
        return clean || 'example';
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    renderAccessibilityTreeOverlay(url) {
        return renderAccessibilityTreeOverlay(url);
    }

    afterRender() {
        const scrollArea = this.querySelector('#web-content-scroll');
        if (scrollArea) {
            scrollArea.scrollTop = 0;
            const zoom = this.state.zoomLevel || 100;
            scrollArea.style.zoom = `${zoom}%`;
        }

        this.bindChromiumWebviews();

        this.querySelectorAll('.manual-search-result').forEach(result => {
            result.addEventListener('click', () => {
                const url = result.getAttribute('data-url');
                if (url) {
                    this.navigateFromViewport(url);
                }
            });
        });

        bindNewTabPageEvents(this);

        const retryBtn = this.querySelector('#retry-load-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                const activeId = window.AppState?.activeTabId;
                const webview = this.querySelector(`.chromium-webview[data-tab-id="${activeId}"]`) || window.AeroActiveWebview;
                window.AppState.update(state => {
                    const tab = state.tabs.find(item => item.id === activeId);
                    if (tab) tab.loadError = null;
                });
                try {
                    if (webview) webview.reload();
                } catch {}
            });
        }

        const searchFallbackBtn = this.querySelector('#open-search-fallback-btn');
        if (searchFallbackBtn) {
            searchFallbackBtn.addEventListener('click', () => {
                const activeTab = window.AppState?.tabs?.find(tab => tab.id === window.AppState.activeTabId);
                const query = activeTab?.url || '';
                if (query) this.navigateFromViewport(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
            });
        }
    }

    bindChromiumWebviews() {
        this.querySelectorAll('.chromium-webview').forEach(webview => {
            const tabId = webview.dataset.tabId;
            if (!tabId || webview.dataset.bound === 'true') return;
            webview.dataset.bound = 'true';
            this.webviewTargets.set(tabId, webview.getAttribute('src') || '');

            webview.addEventListener('did-start-loading', () => {
                window.AppState.update(state => {
                    const targetTab = state.tabs.find(tab => tab.id === tabId);
                    if (targetTab) {
                        targetTab.loading = true;
                        targetTab.loadError = null;
                    }
                });
            });

            webview.addEventListener('did-stop-loading', () => {
                window.AppState.update(state => {
                    const targetTab = state.tabs.find(tab => tab.id === tabId);
                    if (targetTab) {
                        targetTab.loading = false;
                        targetTab.canGoBack = typeof webview.canGoBack === 'function' ? webview.canGoBack() : false;
                        targetTab.canGoForward = typeof webview.canGoForward === 'function' ? webview.canGoForward() : false;
                    }
                });
            });

            webview.addEventListener('did-fail-load', (event) => {
                if (event.errorCode === -3 || event.isMainFrame === false) return;
                window.AppState.update(state => {
                    const targetTab = state.tabs.find(tab => tab.id === tabId);
                    if (targetTab) {
                        targetTab.loading = false;
                        targetTab.loadError = {
                            code: event.errorCode,
                            description: event.errorDescription || 'Network error',
                            url: event.validatedURL || targetTab.url
                        };
                        targetTab.title = 'Page failed to load';
                    }
                });
            });

            webview.addEventListener('did-navigate', (event) => {
                this.syncWebviewLocation(tabId, event.url);
            });

            webview.addEventListener('did-navigate-in-page', (event) => {
                this.syncWebviewLocation(tabId, event.url);
            });

            webview.addEventListener('page-title-updated', (event) => {
                const title = event.title;
                if (!title) return;
                window.AppState.update(state => {
                    const targetTab = state.tabs.find(tab => tab.id === tabId);
                    if (targetTab) targetTab.title = title;
                });
            });

            webview.addEventListener('page-favicon-updated', (event) => {
                const favicon = (event.favicons || [])[0];
                if (!favicon) return;
                window.AppState.update(state => {
                    const targetTab = state.tabs.find(tab => tab.id === tabId);
                    if (targetTab) targetTab.favicon = favicon;
                });
            });

            webview.addEventListener('render-process-gone', (event) => {
                window.AppState.update(state => {
                    const targetTab = state.tabs.find(tab => tab.id === tabId);
                    if (targetTab) {
                        targetTab.loading = false;
                        targetTab.loadError = {
                            code: 'render-process-gone',
                            description: event.reason || 'The page renderer stopped unexpectedly.',
                            url: targetTab.url
                        };
                        targetTab.title = 'Page crashed';
                    }
                });
            });

            webview.addEventListener('new-window', (event) => {
                event.preventDefault?.();
                this.openPopupAsTab(event.url);
            });

            webview.addEventListener('did-create-window', (childWindow, details = {}) => {
                childWindow?.close?.();
                this.openPopupAsTab(details.url);
            });

            webview.addEventListener('context-menu', (e) => {
                e.preventDefault();
                const rect = webview.getBoundingClientRect();
                const params = e.params || {};
                const x = rect.left + (params.x !== undefined ? params.x : (e.clientX - rect.left));
                const y = rect.top + (params.y !== undefined ? params.y : (e.clientY - rect.top));
                this.showViewportContextMenu(x, y, webview);
            });
        });

        this.syncRenderedWebviews(window.AppState);
    }

    syncRenderedWebviews(state) {
        if (!state) return;
        const activeId = state.activeTabId;
        const activeTab = state.tabs.find(tab => tab.id === activeId);
        const stack = this.querySelector('.chromium-webview-stack');

        if (stack) {
            const showStack = this.shouldUseNativeWebview(activeTab?.url);
            stack.style.display = showStack ? 'flex' : 'none';
            stack.style.position = showStack ? 'relative' : 'absolute';
        }

        this.querySelectorAll('.chromium-webview').forEach(webview => {
            const tabId = webview.dataset.tabId;
            const tab = state.tabs.find(item => item.id === tabId);
            const isActive = tabId === activeId && this.shouldUseNativeWebview(tab?.url);
            webview.style.display = isActive ? 'flex' : 'none';
            if (isActive) window.AeroActiveWebview = webview;

            if (tab && this.shouldUseNativeWebview(tab.url) && this.webviewTargets.get(tabId) !== tab.url) {
                this.webviewTargets.set(tabId, tab.url);
                if (webview.getAttribute('src') !== tab.url) {
                    webview.setAttribute('src', tab.url);
                }
            }
        });
    }

    syncWebviewLocation(tabId, url) {
        if (!tabId || !url) return;
        this.webviewTargets.set(tabId, url);
        window.AppState.update(state => {
            const targetTab = state.tabs.find(tab => tab.id === tabId);
            if (targetTab && targetTab.url !== url) {
                targetTab.url = url;
                targetTab.isSearchResult = this.parseSearchUrl(url) !== null;
                targetTab.loadError = null;
            }
        });
    }

    runWebviewCommand(command) {
        const activeId = window.AppState?.activeTabId;
        const webview = this.querySelector(`.chromium-webview[data-tab-id="${activeId}"]`) || window.AeroActiveWebview;
        if (!webview) return;
        try {
            if (command === 'back' && webview.canGoBack()) {
                webview.goBack();
            } else if (command === 'forward' && webview.canGoForward()) {
                webview.goForward();
            } else if (command === 'stop') {
                webview.stop();
            } else if (command === 'reload') {
                webview.reload();
            }
        } catch {}
    }

    openPopupAsTab(url) {
        if (!this.isExternalUrl(url)) return;
        window.AppState.update(state => {
            const newId = `tab-${Date.now()}`;
            state.tabs.forEach(tab => { tab.active = false; });
            state.tabs.push({
                id: newId,
                title: 'New Tab',
                url,
                hibernated: false,
                active: true,
                scrollY: 0,
                workspace: state.activeWorkspace || 'Default',
                loading: false,
                loadError: null
            });
            state.activeTabId = newId;
        });
    }

    async captureActivePageSnapshot() {
        const activeId = window.AppState?.activeTabId;
        const activeTab = window.AppState?.tabs?.find(tab => tab.id === activeId);
        const webview = this.querySelector(`.chromium-webview[data-tab-id="${activeId}"]`) || window.AeroActiveWebview;
        if (window.AppState?.aiAllowPageReading === false) {
            return {
                url: activeTab?.url || '',
                title: activeTab?.title || 'Active page',
                text: '',
                headings: [],
                links: [],
                interactives: [],
                forms: [],
                restricted: true,
                error: 'AI page reading is disabled in Settings.'
            };
        }

        if (webview && this.shouldUseNativeWebview(activeTab?.url) && typeof webview.executeJavaScript === 'function') {
            try {
                return await webview.executeJavaScript(`(() => {
                    const text = (document.body?.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 8000);
                    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).slice(0, 20).map(node => ({
                        level: node.tagName.toLowerCase(),
                        text: (node.innerText || '').trim().slice(0, 180)
                    })).filter(item => item.text);
                    const links = Array.from(document.querySelectorAll('a[href]')).slice(0, 30).map(node => ({
                        text: (node.innerText || node.getAttribute('aria-label') || '').trim().slice(0, 160),
                        href: node.href
                    })).filter(item => item.text || item.href);
                    const selector = 'a[href],button,input,textarea,select,[role="button"],[role="link"],[role="textbox"],[role="combobox"],[contenteditable="true"],summary';
                    const roleFor = (node) => node.getAttribute('role') || ({
                        A: 'link',
                        BUTTON: 'button',
                        INPUT: node.type === 'submit' || node.type === 'button' ? 'button' : 'textbox',
                        TEXTAREA: 'textbox',
                        SELECT: 'combobox',
                        SUMMARY: 'button'
                    })[node.tagName] || 'control';
                    const labelFor = (node) => {
                        const id = node.getAttribute('id');
                        const escapeCss = window.CSS?.escape || ((value) => String(value).replace(/["\\\\]/g, '\\\\$&'));
                        const label = id ? document.querySelector('label[for="' + escapeCss(id) + '"]') : null;
                        const parentLabel = node.closest('label');
                        const describedBy = (node.getAttribute('aria-describedby') || '')
                            .split(/\\s+/)
                            .map(id => id ? document.getElementById(id)?.innerText : '')
                            .filter(Boolean)
                            .join(' ');
                        return [
                            node.getAttribute('aria-label'),
                            node.getAttribute('title'),
                            node.getAttribute('placeholder'),
                            node.getAttribute('value'),
                            label?.innerText,
                            parentLabel?.innerText,
                            describedBy,
                            node.innerText,
                            node.textContent,
                            node.getAttribute('autocomplete'),
                            node.name,
                            node.id
                        ].find(value => value && String(value).trim()) || roleFor(node);
                    };
                    const interactives = Array.from(document.querySelectorAll(selector))
                        .filter(node => {
                            const rect = node.getBoundingClientRect();
                            const style = getComputedStyle(node);
                            return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
                        })
                        .slice(0, 120)
                        .map((node, index) => {
                            const rect = node.getBoundingClientRect();
                            const label = String(labelFor(node)).replace(/\\s+/g, ' ').trim().slice(0, 180);
                            return {
                                id: 'ax-auto-' + index,
                                role: roleFor(node),
                                label,
                                tag: node.tagName.toLowerCase(),
                                href: node.href || null,
                                inputType: node.type || null,
                                name: node.name || null,
                                idAttr: node.id || null,
                                placeholder: node.getAttribute('placeholder') || null,
                                autocomplete: node.getAttribute('autocomplete') || null,
                                valuePreview: /password|otp|pin|cvv|card/i.test(node.type || node.name || node.id || label) ? '' : String(node.value || '').slice(0, 80),
                                disabled: Boolean(node.disabled || node.getAttribute('aria-disabled') === 'true'),
                                required: Boolean(node.required || node.getAttribute('aria-required') === 'true'),
                                x: Math.round(rect.left + rect.width / 2),
                                y: Math.round(rect.top + rect.height / 2),
                                width: Math.round(rect.width),
                                height: Math.round(rect.height)
                            };
                        });
                    const forms = Array.from(document.forms).slice(0, 20).map((form, index) => ({
                        id: form.id || form.name || 'form-' + index,
                        action: form.action || location.href,
                        method: (form.method || 'get').toLowerCase(),
                        fields: Array.from(form.elements).slice(0, 80).map(field => ({
                            tag: field.tagName?.toLowerCase?.() || '',
                            type: field.type || '',
                            name: field.name || '',
                            id: field.id || '',
                            placeholder: field.getAttribute?.('placeholder') || '',
                            autocomplete: field.getAttribute?.('autocomplete') || '',
                            required: Boolean(field.required)
                        }))
                    }));
                    return { url: location.href, title: document.title, text, headings, links, interactives, forms };
                })()`, true);
            } catch (error) {
                return {
                    url: activeTab?.url || '',
                    title: activeTab?.title || 'Active page',
                    text: '',
                    headings: [],
                    links: [],
                    error: String(error?.message || error)
                };
            }
        }

        const activeRoot = this.querySelector('#web-content-scroll');
        return {
            url: activeTab?.url || '',
            title: activeTab?.title || 'Active page',
            text: (activeRoot?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 8000),
            headings: Array.from(this.querySelectorAll('h1,h2,h3')).slice(0, 20).map(node => ({
                level: node.tagName.toLowerCase(),
                text: (node.innerText || '').trim().slice(0, 180)
            })),
            links: [],
            forms: [],
            interactives: Array.from(this.querySelectorAll('a[href],button,input,textarea,select,[role="button"],[role="link"],[contenteditable="true"]')).slice(0, 120).map((node, index) => {
                const rect = node.getBoundingClientRect();
                const label = (node.getAttribute('aria-label') || node.getAttribute('title') || node.getAttribute('placeholder') || node.innerText || node.value || node.id || node.tagName).trim();
                return {
                    id: `ax-local-${index}`,
                    role: node.getAttribute('role') || node.tagName.toLowerCase(),
                    label,
                    tag: node.tagName.toLowerCase(),
                    x: Math.round(rect.left + rect.width / 2),
                    y: Math.round(rect.top + rect.height / 2),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height)
                };
            })
        };
    }

    async executeBrowserCommand(command, reason = 'User requested browser action') {
        if (!command?.type) {
            return { ok: false, message: 'Missing browser command.' };
        }
        if (window.AppState?.aiControlEnabled === false || window.AppState?.aiAllowActionExecution === false) {
            return { ok: false, message: 'AI webpage control is disabled in Settings.' };
        }

        const activeId = window.AppState?.activeTabId;
        const activeTab = window.AppState?.tabs?.find(tab => tab.id === activeId);
        const origin = this.originFromUrl(activeTab?.url);

        try {
            command = await this.resolveCommandTarget(command);
            const evaluation = await BackendClient.evaluateAutomation(command, { origin, reason });
            const safety = evaluation.safety;
            if (safety?.decision === 'require_confirmation' && window.AppState?.aiRequireConfirmation !== false) {
                const allowed = await window.aeroNative?.confirmSensitiveAction?.({
                    title: `Allow Aero to ${command.type.replace(/_/g, ' ')}?`,
                    detail: `${safety.reason || 'This action requires confirmation.'}\n\nReason: ${reason}`
                });
                if (!allowed) {
                    this.logBrowserCommand(`Denied ${command.type}: user cancelled native confirmation`, 'warning');
                    return { ok: false, evaluation, message: 'User denied native confirmation.' };
                }
            } else if (safety && safety.decision && safety.decision !== 'allow') {
                this.logBrowserCommand(`Blocked ${command.type}: ${safety.reason || 'safety policy'}`, 'warning');
                return { ok: false, evaluation, message: safety.reason || 'Blocked by safety policy.' };
            }

            const compiled = await BackendClient.compileCdp(command);
            const webview = this.querySelector(`.chromium-webview[data-tab-id="${activeId}"]`) || window.AeroActiveWebview;
            const report = await this.executeCompiledCdp(compiled.calls || [], webview);
            this.hideLiveCursorSoon();
            this.logBrowserCommand(`Executed ${command.type} through native browser input`, 'success');
            return { ok: true, evaluation, compiled, report };
        } catch (error) {
            const message = error?.message || String(error);
            this.logBrowserCommand(`Command failed: ${message}`, 'warning');
            return { ok: false, message };
        }
    }

    async resolveCommandTarget(command) {
        const target = command?.target;
        if (!target || target.target_type !== 'accessibility_node') {
            return command;
        }

        const snapshot = await this.captureActivePageSnapshot();
        const wanted = this.normalizeTargetLabel(target.label || target.ax_node_id || '');
        const candidates = snapshot.interactives || [];
        const match = candidates
            .map(item => ({ item, score: this.targetMatchScore(wanted, item) }))
            .filter(entry => entry.score > 0)
            .sort((a, b) => b.score - a.score)[0]?.item;

        if (!match) {
            throw new Error(`Could not find a visible element matching "${target.label}".`);
        }

        this.logBrowserCommand(`Resolved "${target.label}" to ${match.role} "${match.label}" at ${match.x},${match.y}`, 'success');
        return {
            ...command,
            target: {
                target_type: 'coordinates',
                x: match.x,
                y: match.y,
                frame_id: null,
                label: match.label || target.label
            }
        };
    }

    normalizeTargetLabel(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    targetMatchScore(wanted, item) {
        const label = this.normalizeTargetLabel(item.label);
        const placeholder = this.normalizeTargetLabel(item.placeholder);
        const name = this.normalizeTargetLabel(item.name);
        const idAttr = this.normalizeTargetLabel(item.idAttr);
        const autocomplete = this.normalizeTargetLabel(item.autocomplete);
        const role = this.normalizeTargetLabel(item.role);
        const tag = this.normalizeTargetLabel(item.tag);
        const haystack = [label, placeholder, name, idAttr, autocomplete, role, tag].filter(Boolean).join(' ');
        if (!wanted || !haystack) return 0;
        if (label === wanted) return 100;
        if (placeholder === wanted || name === wanted || idAttr === wanted || autocomplete === wanted) return 95;
        if (label.includes(wanted)) return 80;
        if (haystack.includes(wanted)) return 75;
        if (wanted.includes(label) && label.length > 2) return 65;
        const words = wanted.split(/\s+/).filter(Boolean);
        const hits = words.filter(word => haystack.includes(word)).length;
        const fieldBoost = /email|password|search|name|phone|address|city|zip|otp|code/i.test(wanted)
            && /textbox|combobox|input|textarea/i.test(`${role} ${tag}`) ? 10 : 0;
        return hits ? hits * 12 + fieldBoost : 0;
    }

    async executeCompiledCdp(calls, webview) {
        const responses = [];
        for (const call of calls) {
            responses.push(await this.executeCdpCall(call, webview));
            await this.sleep(this.aiActionDelay());
        }
        return { dry_run: false, responses };
    }

    async executeCdpCall(call, webview) {
        const params = call.params || {};
        const webContentsId = webview && typeof webview.getWebContentsId === 'function'
            ? webview.getWebContentsId()
            : null;

        if (call.method === 'Page.navigate') {
            if (webContentsId && window.aeroNative?.loadGuestUrl) {
                await window.aeroNative.loadGuestUrl(webContentsId, params.url);
            } else {
                this.navigateFromViewport(params.url);
            }
            return { method: call.method, ok: true };
        }

        if (call.method === 'Input.insertText') {
            if (!webContentsId || !window.aeroNative?.insertGuestText) {
                throw new Error('Native text insertion is unavailable.');
            }
            await this.showTypingBubble(params.text || '', webview);
            if (window.AppState?.aiHumanTyping !== false) {
                for (const char of String(params.text || '')) {
                    await window.aeroNative.insertGuestText(webContentsId, char);
                    await this.sleep(this.aiTypingDelay());
                }
            } else {
                await window.aeroNative.insertGuestText(webContentsId, params.text || '');
            }
            await this.hideTypingBubble();
            return { method: call.method, ok: true };
        }

        if (call.method === 'Input.dispatchMouseEvent') {
            if (!webContentsId || !window.aeroNative?.dispatchGuestInput) {
                throw new Error('Native input dispatch is unavailable.');
            }
            await this.animateLiveCursor(params, webview);
            await window.aeroNative.dispatchGuestInput(webContentsId, this.toElectronInputEvent(params));
            if (params.type === 'mousePressed') {
                this.pulseLiveCursor();
            }
            return { method: call.method, ok: true };
        }

        if (call.method === 'Input.dispatchKeyEvent') {
            if (!webContentsId || !window.aeroNative?.dispatchGuestInput) {
                throw new Error('Native key dispatch is unavailable.');
            }
            await window.aeroNative.dispatchGuestInput(webContentsId, this.toElectronKeyEvent(params));
            return { method: call.method, ok: true };
        }

        if (call.method === 'Accessibility.getFullAXTree') {
            return { method: call.method, ok: true, result: await this.captureActivePageSnapshot() };
        }

        if (call.method === 'Page.captureScreenshot') {
            if (webview && typeof webview.capturePage === 'function') {
                const image = await webview.capturePage();
                return { method: call.method, ok: true, result: { dataUrl: image.toDataURL() } };
            }
            return { method: call.method, ok: false, result: { message: 'Capture unavailable.' } };
        }

        return { method: call.method, ok: false, result: { message: 'Unsupported renderer-side CDP call.' } };
    }

    toElectronInputEvent(params) {
        if (params.type === 'mouseWheel') {
            return {
                type: 'mouseWheel',
                x: params.x || 1,
                y: params.y || 1,
                deltaX: params.deltaX || 0,
                deltaY: params.deltaY || 0
            };
        }
        return {
            type: params.type === 'mousePressed' ? 'mouseDown' : 'mouseUp',
            x: params.x || 0,
            y: params.y || 0,
            button: params.button || 'left',
            clickCount: params.clickCount || 1
        };
    }

    toElectronKeyEvent(params) {
        const key = params.key || '';
        const modifiers = [];
        const mask = Number(params.modifiers || 0);
        if (mask & 1) modifiers.push('alt');
        if (mask & 2) modifiers.push('control');
        if (mask & 4) modifiers.push('meta');
        if (mask & 8) modifiers.push('shift');
        return {
            type: params.type === 'keyUp' ? 'keyUp' : 'keyDown',
            keyCode: key,
            modifiers
        };
    }

    aiActionDelay() {
        return Math.max(0, Number(window.AppState?.aiActionDelayMs ?? 160));
    }

    aiTypingDelay() {
        return Math.max(0, Number(window.AppState?.aiTypingDelayMs ?? 24));
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async animateLiveCursor(params, webview) {
        if (window.AppState?.aiShowLiveCursor === false) return;
        const cursor = this.querySelector('#agent-cursor');
        if (!cursor) return;
        const point = this.webviewPointToOverlay(params.x || 0, params.y || 0, webview);
        this.lastLiveCursorPoint = point;
        cursor.style.display = 'block';
        cursor.style.transform = `translate3d(${point.x - 8}px, ${point.y - 8}px, 0)`;
        await this.sleep(Math.min(220, Math.max(60, this.aiActionDelay())));
    }

    pulseLiveCursor() {
        const cursor = this.querySelector('#agent-cursor');
        if (!cursor || cursor.style.display === 'none') return;
        cursor.style.width = '22px';
        cursor.style.height = '22px';
        cursor.style.boxShadow = '0 0 0 8px rgba(77,144,254,0.20), 0 0 14px rgba(77,144,254,0.95)';
        setTimeout(() => {
            cursor.style.width = '16px';
            cursor.style.height = '16px';
            cursor.style.boxShadow = '0 0 0 0 rgba(77,144,254,0.45), 0 0 12px rgba(77,144,254,0.9)';
        }, 140);
    }

    hideLiveCursorSoon() {
        if (window.AppState?.aiShowLiveCursor === false) return;
        clearTimeout(this.hideCursorTimer);
        this.hideCursorTimer = setTimeout(() => {
            const cursor = this.querySelector('#agent-cursor');
            if (cursor) cursor.style.display = 'none';
        }, 900);
    }

    async showTypingBubble(text, webview) {
        if (window.AppState?.aiShowLiveCursor === false) return;
        const bubble = this.querySelector('#agent-typing-bubble');
        if (!bubble) return;
        const point = this.lastLiveCursorPoint || this.webviewPointToOverlay(24, 24, webview);
        bubble.textContent = `AI typing${text ? `: ${String(text).slice(0, 24)}${String(text).length > 24 ? '...' : ''}` : ''}`;
        bubble.style.display = 'block';
        bubble.style.transform = `translate3d(${point.x + 14}px, ${point.y + 12}px, 0)`;
        await this.sleep(60);
    }

    async hideTypingBubble() {
        const bubble = this.querySelector('#agent-typing-bubble');
        if (bubble) bubble.style.display = 'none';
    }

    webviewPointToOverlay(x, y, webview) {
        const area = this.querySelector('#web-content-scroll')?.getBoundingClientRect();
        const rect = webview?.getBoundingClientRect?.();
        if (!area || !rect) return { x, y };
        return {
            x: Math.round(rect.left - area.left + x),
            y: Math.round(rect.top - area.top + y)
        };
    }

    originFromUrl(url) {
        try {
            return new URL(url).origin;
        } catch {
            return null;
        }
    }

    logBrowserCommand(text, status) {
        window.AppState.update(state => {
            state.taskLogs.push({ text, status });
            if (state.taskLogs.length > 20) {
                state.taskLogs = state.taskLogs.slice(-20);
            }
        });
    }

    resolveInput(value) {
        const text = (value || '').trim();
        const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text);
        const hasSpaces = /\s/.test(text);
        const looksLikeDomain = /^([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(text);
        if (hasScheme) return { url: text };
        if (!hasSpaces && looksLikeDomain) return { url: `https://${text}` };
        return {
            url: `https://www.google.com/search?q=${encodeURIComponent(text)}`,
            isSearch: true,
            query: text,
            title: `Search: ${text}`
        };
    }

    navigateFromViewport(url, meta = {}) {
        window.AppState.update(state => {
            const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
            if (!activeTab) return;
            activeTab.url = url;
            activeTab.searchQuery = meta.query || null;
            activeTab.isSearchResult = Boolean(meta.isSearch);
            if (meta.title) {
                activeTab.title = meta.title;
                return;
            }
            try {
                if (url.startsWith('aero://')) {
                    activeTab.title = url.replace('aero://', '').split('/')[0] || 'Aero';
                } else {
                    activeTab.title = new URL(url).hostname.replace('www.', '');
                }
            } catch {
                activeTab.title = url;
            }
        });
    }

    handleAgentActionHighlight(stepIndex) {
        handleAgentActionHighlight(this, stepIndex);
    }

    showViewportContextMenu(x, y, webview) {
        // Dismiss any existing context menus
        document.querySelectorAll('.aero-context-menu').forEach(el => el.remove());

        const menu = document.createElement('div');
        menu.className = 'aero-context-menu animate-fade-in';

        const canGoBack = webview ? webview.canGoBack() : false;
        const canGoForward = webview ? webview.canGoForward() : false;
        
        const activeTab = this.state.activeTab || { url: '', title: '' };
        const currentUrl = activeTab.url || '';

        menu.innerHTML = `
            <div class="acm-item ${!canGoBack ? 'disabled' : ''}" id="acm-back">
                <i class="hgi-stroke hgi-arrow-left-01 acm-icon-left"></i>
                Back
                <span class="acm-shortcut">Alt+Left Arrow</span>
            </div>
            <div class="acm-item ${!canGoForward ? 'disabled' : ''}" id="acm-forward">
                <i class="hgi-stroke hgi-arrow-right-01 acm-icon-left"></i>
                Forward
                <span class="acm-shortcut">Alt+Right Arrow</span>
            </div>
            <div class="acm-item ${!webview ? 'disabled' : ''}" id="acm-reload">
                <i class="hgi-stroke hgi-refresh acm-icon-left"></i>
                Reload
                <span class="acm-shortcut">Ctrl+R</span>
            </div>
            
            <div class="acm-divider"></div>
            
            <div class="acm-item" id="acm-save">
                <i class="hgi-stroke hgi-download-01 acm-icon-left"></i>
                Save as...
                <span class="acm-shortcut">Ctrl+S</span>
            </div>
            <div class="acm-item" id="acm-print">
                <i class="hgi-stroke hgi-printer acm-icon-left"></i>
                Print...
                <span class="acm-shortcut">Ctrl+P</span>
            </div>
            <div class="acm-item" id="acm-cast">
                <i class="hgi-stroke hgi-screencast acm-icon-left"></i>
                Cast...
            </div>
            
            <div class="acm-divider"></div>
            
            <div class="acm-item" id="acm-qrcode">
                <i class="hgi-stroke hgi-qr-code acm-icon-left"></i>
                Create QR Code for this page
            </div>
            
            <div class="acm-divider"></div>
            
            <div class="acm-item ${!webview ? 'disabled' : ''}" id="acm-source">
                <i class="hgi-stroke hgi-code acm-icon-left"></i>
                View page source
                <span class="acm-shortcut">Ctrl+U</span>
            </div>
            <div class="acm-item ${!webview ? 'disabled' : ''}" id="acm-inspect">
                <i class="hgi-stroke hgi-search-01 acm-icon-left"></i>
                Inspect
            </div>
        `;

        Object.assign(menu.style, {
            top: `${y}px`,
            left: `${x}px`,
            position: 'fixed'
        });
        document.body.appendChild(menu);

        // Clamp positions if overflow
        const rect = menu.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 8}px`;
        }
        if (y + rect.height > window.innerHeight) {
            menu.style.top = `${window.innerHeight - rect.height - 8}px`;
        }

        const closeMenu = () => {
            menu.remove();
            document.removeEventListener('click', closeMenuHandler);
        };

        // Actions
        menu.querySelector('#acm-back')?.addEventListener('click', () => {
            if (webview && webview.canGoBack()) webview.goBack();
            closeMenu();
        });

        menu.querySelector('#acm-forward')?.addEventListener('click', () => {
            if (webview && webview.canGoForward()) webview.goForward();
            closeMenu();
        });

        menu.querySelector('#acm-reload')?.addEventListener('click', () => {
            if (webview) webview.reload();
            closeMenu();
        });

        menu.querySelector('#acm-save')?.addEventListener('click', () => {
            alert("Saving page triggered!");
            closeMenu();
        });

        menu.querySelector('#acm-print')?.addEventListener('click', () => {
            if (webview) {
                try {
                    webview.print();
                } catch {
                    alert("Print dialog triggered.");
                }
            } else {
                window.print();
            }
            closeMenu();
        });

        menu.querySelector('#acm-cast')?.addEventListener('click', () => {
            alert("Casting page...");
            closeMenu();
        });

        menu.querySelector('#acm-qrcode')?.addEventListener('click', () => {
            this.showQrCodeModal(currentUrl);
            closeMenu();
        });

        menu.querySelector('#acm-source')?.addEventListener('click', () => {
            if (webview) {
                const sourceUrl = `view-source:${currentUrl}`;
                window.AppState.update(s => {
                    const newId = `tab-${Date.now()}`;
                    s.tabs.push({
                        id: newId,
                        title: `Source: ${activeTab.title}`,
                        url: sourceUrl,
                        active: true,
                        hibernated: false,
                        workspace: 'Default'
                    });
                    s.activeTabId = newId;
                });
            }
            closeMenu();
        });

        menu.querySelector('#acm-inspect')?.addEventListener('click', () => {
            if (webview && typeof webview.openDevTools === 'function') {
                webview.openDevTools();
            }
            closeMenu();
        });

        const closeMenuHandler = (e) => {
            if (!menu.contains(e.target)) {
                closeMenu();
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeMenuHandler);
        }, 0);
    }

    showQrCodeModal(url) {
        document.querySelectorAll('.qr-modal-overlay, .qr-modal').forEach(el => el.remove());

        const overlay = document.createElement('div');
        overlay.className = 'qr-modal-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            zIndex: '1000000',
            animation: 'fadeIn 0.15s ease-out'
        });

        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url || 'https://newtab.internal')}`;

        modal.innerHTML = `
            <h3 class="qr-modal-title">QR Code for Page</h3>
            <img class="qr-modal-img" src="${qrUrl}" alt="QR Code" />
            <div style="font-size: 10px; color: var(--color-text-inactive); text-align: center; word-break: break-all; max-width: 100%; margin-top: 4px;">
                ${url || 'New Tab'}
            </div>
            <button class="qr-modal-close-btn">Close</button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const closeModal = () => {
            overlay.remove();
        };

        modal.querySelector('.qr-modal-close-btn').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }
}
