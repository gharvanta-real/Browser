import { BaseComponent } from './BaseComponent.js';

export class TabStrip extends BaseComponent {
    constructor() {
        super();
        this.layout = this.getAttribute('layout') || 'horizontal';
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            if (state.tabLayout === this.layout) {
                this.className = this.layout === 'horizontal' ? 'tab-strip-horizontal' : 'tab-strip-vertical';
                this.style.display = 'flex';
                
                // Filter tabs based on active workspace
                const currentWorkspace = state.activeWorkspace || 'Default';
                const filteredTabs = state.tabs.filter(t => (t.workspace || 'Default') === currentWorkspace);
                
                this.setState({
                    tabs: filteredTabs,
                    activeTabId: state.activeTabId,
                    activeWorkspace: currentWorkspace
                });
            } else {
                this.style.display = 'none';
            }
        });
        super.connectedCallback();
    }

    template() {
        const tabs = this.state.tabs || [];
        const activeTabId = this.state.activeTabId;

        const tabsHtml = tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            let tabIcon = `<i class="hgi-stroke hgi-global" style="font-size: 13px;"></i>`;

            if (tab.hibernated) {
                tabIcon = `<i class="hgi-stroke hgi-moon-01" style="font-size: 13px; opacity: 0.6;"></i>`;
            } else if (tab.url) {
                const urlStr = tab.url;
                if (urlStr.startsWith('aero://') || urlStr.startsWith('browser://')) {
                    const path = urlStr.replace('aero://', '').replace('browser://', '').split('/')[0];
                    if (path === 'ai-setup') {
                        tabIcon = `<i class="hgi-stroke hgi-chat-bot" style="font-size: 13px;"></i>`;
                    } else if (path === 'settings') {
                        tabIcon = `<i class="hgi-stroke hgi-settings-01" style="font-size: 13px;"></i>`;
                    } else if (path === 'history') {
                        tabIcon = `<i class="hgi-stroke hgi-clock-01" style="font-size: 13px;"></i>`;
                    } else if (path === 'downloads') {
                        tabIcon = `<i class="hgi-stroke hgi-download-01" style="font-size: 13px;"></i>`;
                    } else if (path === 'bookmarks') {
                        tabIcon = `<i class="hgi-stroke hgi-star" style="font-size: 13px;"></i>`;
                    } else if (path === 'reading-list') {
                        tabIcon = `<i class="hgi-stroke hgi-book-open-01" style="font-size: 13px;"></i>`;
                    } else if (path === 'search') {
                        tabIcon = `<i class="hgi-stroke hgi-search-01" style="font-size: 13px;"></i>`;
                    } else if (path === 'workspaces') {
                        tabIcon = `<i class="hgi-stroke hgi-grid-view" style="font-size: 13px;"></i>`;
                    }
                } else if (urlStr.includes('newtab.internal')) {
                    tabIcon = `<i class="hgi-stroke hgi-home-01" style="font-size: 13px;"></i>`;
                } else {
                    try {
                        const url = new URL(urlStr);
                        if (url.protocol === 'http:' || url.protocol === 'https:') {
                            const domain = url.hostname.replace('www.', '');
                            const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
                            tabIcon = `
                                <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px;">
                                    <img src="${faviconUrl}" 
                                         style="width: 14px; height: 14px; object-fit: contain; border-radius: 2px;" 
                                         onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';"
                                    />
                                    <i class="hgi-stroke hgi-global" style="font-size: 13px; display: none;"></i>
                                </span>
                            `;
                        }
                    } catch (e) {}
                }
            }

            return `
                <div class="tab-item ${isActive ? 'active' : ''} ${tab.hibernated ? 'suspended' : ''}" data-id="${tab.id}" title="${tab.url}">
                    <div class="tab-favicon">
                        ${tabIcon}
                    </div>
                    <span class="tab-title">${tab.title}</span>
                    <button class="tab-close-btn" data-id="${tab.id}" aria-label="Close Tab" style="display: flex; align-items: center; justify-content: center;">
                        <i class="hgi-stroke hgi-cancel-01" style="font-size: 8px; font-weight: bold;"></i>
                    </button>
                </div>
            `;
        }).join('');

        return `
            ${tabsHtml}
            <button class="tab-add-btn" aria-label="New Tab" style="margin-left: 8px; align-self: center;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        `;
    }

    afterRender() {
        this.querySelectorAll('.tab-item').forEach(tabEl => {
            tabEl.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-close-btn')) return;
                
                const tabId = tabEl.getAttribute('data-id');
                window.AppState.update(state => {
                    state.activeTabId = tabId;
                    const tab = state.tabs.find(t => t.id === tabId);
                    if (tab && tab.hibernated) {
                        tab.hibernated = false;
                    }
                });
            });
        });

        this.querySelectorAll('.tab-close-btn').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tabId = closeBtn.getAttribute('data-id');
                window.AppState.update(state => {
                    if (state.tabs.length <= 1) {
                        alert("Cannot close the last tab!");
                        return;
                    }

                    const index = state.tabs.findIndex(t => t.id === tabId);
                    state.tabs = state.tabs.filter(t => t.id !== tabId);

                    if (state.activeTabId === tabId) {
                        const newActiveIndex = Math.max(0, index - 1);
                        state.activeTabId = state.tabs[newActiveIndex].id;
                    }
                });
            });
        });

        const addBtn = this.querySelector('.tab-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                window.AppState.update(state => {
                    const newId = `tab-${Date.now()}`;
                    state.tabs.push({
                        id: newId,
                        title: 'New Tab',
                        url: 'https://newtab.internal',
                        hibernated: false,
                        active: false,
                        workspace: state.activeWorkspace || 'Default'
                    });
                    state.activeTabId = newId;
                });
            });
        }
    }
}
