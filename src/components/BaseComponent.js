export class BaseComponent extends HTMLElement {
    constructor() {
        super();
        this.state = {};
    }

    connectedCallback() {
        this.render();
        this.afterRender();
    }

    /**
     * Updates the component state and triggers a re-render
     * @param {Object} newState 
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
        this.afterRender();
    }

    /**
     * Render the component's HTML template inside the element's innerHTML
     */
    render() {
        this.innerHTML = this.template();
    }

    /**
     * Component HTML Template (must be overridden by subclasses)
     * @returns {string} HTML string
     */
    template() {
        return '';
    }

    /**
     * Lifecycle hook executed after render. Useful for binding events.
     * Override in subclasses.
     */
    afterRender() {}

    /**
     * Navigates back in history, or falls back to an appropriate default page.
     */
    navigateBack() {
        window.AppState.update(state => {
            const activeTab = state.tabs.find(t => t.id === state.activeTabId);
            if (!activeTab) return;
            
            // Check navigationHistory first
            if (activeTab.navigationHistory && activeTab.navigationHistory.length > 0) {
                const prevUrl = activeTab.navigationHistory.pop();
                activeTab.isGoingBack = true;
                activeTab.url = prevUrl;
                
                // Update title
                if (prevUrl.startsWith('aero://') || prevUrl.startsWith('browser://')) {
                    const pageName = prevUrl.replace('aero://', '').replace('browser://', '').split('/')[0];
                    activeTab.title = pageName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                } else {
                    try {
                        activeTab.title = new URL(prevUrl).hostname.replace('www.', '');
                    } catch {
                        activeTab.title = prevUrl;
                    }
                }
                return;
            }
            
            // Fallback for settings-related pages
            const currentPath = activeTab.url.replace('aero://', '').replace('browser://', '').split('/')[0];
            const settingsPages = ['passwords', 'payments', 'addresses', 'security'];
            if (settingsPages.includes(currentPath)) {
                activeTab.url = 'aero://settings';
                activeTab.title = 'Settings';
                return;
            }
            
            // General fallback: go to New Tab or close if multiple tabs
            if (state.tabs.length <= 1) {
                activeTab.url = 'https://newtab.internal';
                activeTab.title = 'New Tab';
            } else {
                const index = state.tabs.findIndex(t => t.id === activeTab.id);
                state.tabs = state.tabs.filter(t => t.id !== activeTab.id);
                const newActiveIndex = Math.max(0, index - 1);
                state.activeTabId = state.tabs[newActiveIndex].id;
            }
        });
    }

    /**
     * Navigates the current tab to a target URL safely, storing history
     */
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

            // Track history for back button!
            if (activeTab && activeTab.url && activeTab.url !== url) {
                if (!activeTab.navigationHistory) {
                    activeTab.navigationHistory = [];
                }
                // Avoid duplicating the current page in history
                if (activeTab.navigationHistory.length === 0 || activeTab.navigationHistory[activeTab.navigationHistory.length - 1] !== activeTab.url) {
                    activeTab.navigationHistory.push(activeTab.url);
                }
            }

            if (isSafeToOverride && activeTab) {
                activeTab.url = url;
                activeTab.title = title;
                activeTab.searchQuery = meta.query || null;
                activeTab.isSearchResult = Boolean(meta.isSearch);
                activeTab.loadError = null;
                activeTab.loading = false;
            } else if (activeTab) {
                // Change current tab URL
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
            let displayDom = url;
            try {
                if (url.startsWith('aero://') || url.startsWith('browser://')) {
                    displayDom = url.split('/')[0];
                } else {
                    displayDom = new URL(url).hostname.replace('www.', '');
                }
            } catch {}
            
            state.history.unshift({
                id: Date.now(),
                date: 'Today',
                title: title,
                domain: displayDom,
                url,
                time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                faviconClass: meta.isSearch ? 'hgi-search-01' : 'hgi-global'
            });
        });
    }

    /**
     * Emits custom DOM events to propagate state upwards
     * @param {string} eventName 
     * @param {Object} detail 
     */
    emit(eventName, detail = {}) {
        this.dispatchEvent(new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true
        }));
    }
}
