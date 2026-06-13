import { BaseComponent } from '../BaseComponent.js';

export class HistoryPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            searchQuery: window.AppState?.historySearchQuery || '',
            filter: 'All', // 'All' | 'Tabs' | 'Recently closed' | 'Synced'
            historyItems: window.AppState?.history || [],
            recentlyClosed: window.AppState?.recentlyClosed || []
        };
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            this.setState({
                historyItems: state.history || [],
                recentlyClosed: state.recentlyClosed || [],
                searchQuery: state.historySearchQuery || ''
            });
        });
        super.connectedCallback();
    }

    template() {
        const query = this.state.searchQuery.toLowerCase().trim();
        const activeFilter = this.state.filter;
        
        // Filter history items
        let filteredItems = this.state.historyItems.filter(item => {
            return item.title.toLowerCase().includes(query) || item.domain.toLowerCase().includes(query);
        });

        // Group by Date
        const groups = {};
        filteredItems.forEach(item => {
            if (!groups[item.date]) {
                groups[item.date] = [];
            }
            groups[item.date].push(item);
        });

        const groupsHtml = Object.keys(groups).map(dateStr => {
            const items = groups[dateStr];
            const itemsHtml = items.map(item => `
                <div class="history-item-row" data-id="${item.id}" style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--color-viewport-border); transition: background var(--transition-fast);">
                    <div style="display: flex; align-items: center; gap: var(--spacing-md); min-width: 0; flex: 1;">
                        <i class="hgi-stroke ${item.faviconClass}" style="font-size: 14px; color: var(--color-text-inactive); flex-shrink: 0;"></i>
                        <span class="history-item-title" onclick="window.location.hash='${item.url}'" style="font-size: var(--font-size-sm); color: var(--color-viewport-text); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: var(--font-weight-medium); flex: 2;">${item.title}</span>
                        <span class="history-item-domain" style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.8;">${item.domain}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); font-family: monospace;">${item.time}</span>
                        <button class="delete-history-btn" data-id="${item.id}" style="background: transparent; border: none; color: var(--color-text-inactive); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px;" title="Remove from history">
                            <i class="hgi-stroke hgi-cancel-01" style="font-size: 12px; pointer-events: none;"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            return `
                <div class="history-date-group" style="display: flex; flex-direction: column; gap: 2px;">
                    <div class="history-date-header" style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted); padding: var(--spacing-md) 0 var(--spacing-xs);">${dateStr}</div>
                    <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden;">
                        ${itemsHtml}
                    </div>
                </div>
            `;
        }).join('');

        const emptyState = filteredItems.length === 0 ? `
            <div style="text-align: center; padding: 60px 20px; color: var(--color-viewport-text-muted);">
                <i class="hgi-stroke hgi-clock-01" style="font-size: 32px; opacity: 0.5; margin-bottom: var(--spacing-sm);"></i>
                <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No history items found</div>
                <div style="font-size: var(--font-size-xs); opacity: 0.7; margin-top: 4px;">Try searching for a different keyword</div>
            </div>
        ` : '';

        const closedTabsHtml = this.state.recentlyClosed.map(tab => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0;">
                <div style="display: flex; align-items: center; gap: var(--spacing-sm); min-width: 0;">
                    <i class="hgi-stroke ${tab.faviconClass}" style="font-size: 12px; color: var(--color-text-inactive); flex-shrink: 0;"></i>
                    <div style="display: flex; flex-direction: column; min-width: 0;">
                        <span style="font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-viewport-text);">${tab.title}</span>
                        <span style="font-size: 8px; color: var(--color-viewport-text-muted);">${tab.domain}</span>
                    </div>
                </div>
                <span style="font-size: 9px; color: var(--color-viewport-text-muted); font-family: monospace;">${tab.time}</span>
            </div>
        `).join('');

        return `
            <div class="aero-history-page" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-text-active); font-family: var(--font-ui); overflow: hidden;">
                <!-- Center Main Section -->
                <div class="history-main-content" style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto;">
                    <div style="max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-md);">
                        <h2 style="margin: 0; font-size: 20px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">History</h2>

                        <!-- Search Input bar -->
                        <div class="search-history-bar" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-lg); height: 40px; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; box-shadow: var(--shadow-sm); margin-bottom: 4px;">
                            <span style="font-size: 16px; opacity: 0.6; display: flex; align-items: center;"><i class="hgi-stroke hgi-search-01" style="font-size: 16px;"></i></span>
                            <input type="text" id="history-search-input" value="${this.state.searchQuery}" placeholder="Search history" style="flex: 1; border: none; font-size: var(--font-size-sm); color: var(--color-viewport-text); outline: none; background: transparent;">
                        </div>

                        <!-- Filter pills row -->
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; gap: 8px;">
                                <button class="filter-pill ${activeFilter === 'All' ? 'active' : ''}" data-filter="All" style="background: ${activeFilter === 'All' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'All' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'All' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">All</button>
                                <button class="filter-pill ${activeFilter === 'Tabs' ? 'active' : ''}" data-filter="Tabs" style="background: ${activeFilter === 'Tabs' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Tabs' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Tabs' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Tabs</button>
                                <button class="filter-pill ${activeFilter === 'Recently closed' ? 'active' : ''}" data-filter="Recently closed" style="background: ${activeFilter === 'Recently closed' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Recently closed' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Recently closed' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Recently closed</button>
                                <button class="filter-pill ${activeFilter === 'Synced' ? 'active' : ''}" data-filter="Synced" style="background: ${activeFilter === 'Synced' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Synced' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Synced' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Synced</button>
                            </div>
                            <button style="display: flex; align-items: center; gap: var(--spacing-xs); background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); cursor: pointer;">
                                <i class="hgi-stroke hgi-note-01" style="font-size: 12px;"></i> Filter by date
                            </button>
                        </div>

                        <!-- Date grouped list -->
                        ${emptyState}
                        ${groupsHtml}

                        <!-- Bottom widgets grid (replacing right sidebar) -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--spacing-md); margin-top: var(--spacing-lg); border-top: 1px solid var(--color-viewport-border); padding-top: var(--spacing-lg);">
                            
                            <!-- Recently closed tabs widget -->
                            <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                <h4 style="margin: 0; font-size: 11px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Recently closed tabs</h4>
                                <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                                    ${closedTabsHtml}
                                </div>
                                <button id="btn-view-recently-closed" style="background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); cursor: pointer; margin-top: auto;">View all recently closed tabs</button>
                            </div>

                            <!-- Clear browsing history -->
                            <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                <h4 style="margin: 0; font-size: 11px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Clear browsing history</h4>
                                <span style="font-size: 10px; line-height: 1.4; color: var(--color-viewport-text-muted);">Clear your history, cookies, cache, and more.</span>
                                <button id="btn-clear-history-direct" style="background: #E81123; border: 1px solid #E81123; border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: #FFFFFF; cursor: pointer; margin-top: auto;">Choose what to clear</button>
                            </div>

                            <!-- Sync Status -->
                            <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                <h4 style="margin: 0; font-size: 11px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Sync status</h4>
                                <div style="display: flex; gap: var(--spacing-sm); align-items: center; border-bottom: 1px solid var(--color-viewport-border); padding-bottom: var(--spacing-sm);">
                                    <i class="hgi-stroke hgi-checkmark-circle-01" style="font-size: 20px; color: #188038;"></i>
                                    <span style="font-size: 10px; line-height: 1.4; color: var(--color-viewport-text-muted);">Your history is being synced across devices.</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); border-bottom: 1px solid var(--color-viewport-border); padding: var(--spacing-xs) 0;">
                                    <span style="color: var(--color-viewport-text-muted);">Last synced</span>
                                    <strong>Just now</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); padding: var(--spacing-xs) 0; cursor: pointer;">
                                    <span style="color: var(--color-viewport-text-muted);">Devices</span>
                                    <strong>5 devices &gt;</strong>
                                </div>
                                <button style="background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); cursor: pointer; margin-top: auto;">Manage sync</button>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        const searchInput = this.querySelector('#history-search-input');
        if (searchInput) {
            searchInput.focus();
            // Put cursor at the end
            const val = searchInput.value;
            searchInput.value = '';
            searchInput.value = val;

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                window.AppState.update(state => {
                    state.historySearchQuery = query;
                });
            });
        }

        this.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                this.setState({ filter: pill.getAttribute('data-filter') });
            });
        });

        this.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                window.AppState.update(state => {
                    state.history = state.history.filter(item => item.id !== id);
                });
            });
        });

        const clearBtn = this.querySelector('#btn-clear-history-direct');
        if (clearBtn) {
            clearBtn.addEventListener('click', async () => {
                if (await window.aeroConfirm("Are you sure you want to clear your entire browsing history?")) {
                    window.AppState.update(state => {
                        state.history = [];
                        state.recentlyClosed = [];
                    });
                }
            });
        }
    }
}
