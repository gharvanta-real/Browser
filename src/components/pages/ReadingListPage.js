import { BaseComponent } from '../BaseComponent.js';

export class ReadingListPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            searchQuery: window.AppState?.readingListSearchQuery || '',
            filter: 'All', // 'All' | 'Unread' | 'Read'
            activeCategory: 'Saved Articles',
            selectedItemId: 1, // default selected
            items: window.AppState?.readingList || [],
            categories: window.AppState?.readingListCategories || ['Saved Articles', 'Favorites', 'Read Later', 'Archived']
        };
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            this.setState({
                items: state.readingList || [],
                categories: state.readingListCategories || ['Saved Articles', 'Favorites', 'Read Later', 'Archived'],
                searchQuery: state.readingListSearchQuery || ''
            });
        });
        super.connectedCallback();
    }

    template() {
        const query = this.state.searchQuery.toLowerCase().trim();
        const activeFilter = this.state.filter;
        const activeCategory = this.state.activeCategory;

        // Filter items based on category, filter, and search query
        let filtered = this.state.items.filter(item => {
            const matchesQuery = item.title.toLowerCase().includes(query) || item.url.toLowerCase().includes(query) || item.domain.toLowerCase().includes(query);
            if (!matchesQuery) return false;

            if (activeCategory === 'Favorites' && !item.starred) return false;
            if (activeCategory === 'Read Later' && !item.unread) return false;
            if (activeCategory === 'Archived' && item.unread) return false; // mockup archive logic

            if (activeFilter === 'Unread' && !item.unread) return false;
            if (activeFilter === 'Read' && item.unread) return false;

            return true;
        });

        // List HTML
        const itemsHtml = filtered.map(item => {
            const isSelected = item.id === this.state.selectedItemId;
            return `
                <div class="reading-list-card ${isSelected ? 'selected-card' : ''}" data-id="${item.id}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: center; min-width: 0; flex: 1;">
                        <div class="reading-thumbnail-small" style="background: ${item.bgGradient}; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 10px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.15);">
                            <i class="hgi-stroke ${item.faviconClass}" style="font-size: 14px;"></i>
                        </div>
                        <div style="display: flex; flex-direction: column; min-width: 0; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${item.unread ? 'font-weight: var(--font-weight-bold);' : 'opacity: 0.8;'}">${item.title}</span>
                            <span style="font-size: 9px; color: var(--color-viewport-text-muted); opacity: 0.8;">${item.domain} • ${item.readTime}</span>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: var(--spacing-md); flex-shrink: 0;">
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); font-family: monospace;">${item.dateAdded}</span>
                        <div style="display: flex; gap: 4px; align-items: center;">
                            <button class="toggle-read-btn" data-id="${item.id}" title="${item.unread ? 'Mark as read' : 'Mark as unread'}" style="background: transparent; border: none; color: var(--color-text-inactive); cursor: pointer; padding: 4px; border-radius: 4px;">
                                <i class="hgi-stroke ${item.unread ? 'hgi-checkmark-circle-01' : 'hgi-checkmark-circle-02'}" style="font-size: 13px; color: ${item.unread ? 'var(--color-text-inactive)' : '#188038'};"></i>
                            </button>
                            <button class="star-toggle-btn" data-id="${item.id}" style="background: transparent; border: none; color: ${item.starred ? '#FFBA00' : 'var(--color-text-inactive)'}; cursor: pointer; padding: 4px; border-radius: 4px;">
                                <i class="hgi-stroke hgi-star" style="font-size: 13px; fill: ${item.starred ? '#FFBA00' : 'transparent'};"></i>
                            </button>
                            <button class="delete-btn" data-id="${item.id}" title="Remove entry" style="background: transparent; border: none; color: var(--color-text-inactive); cursor: pointer; padding: 4px; border-radius: 4px;">
                                <i class="hgi-stroke hgi-cancel-01" style="font-size: 13px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Selected item preview sidebar logic
        const selectedItem = this.state.items.find(x => x.id === this.state.selectedItemId) || this.state.items[0];
        let previewHtml = '';

        if (selectedItem) {
            previewHtml = `
                <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-sm); margin-top: var(--spacing-md); box-shadow: var(--shadow-sm);">
                    <h4 style="margin: 0; font-size: 11px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Article Preview</h4>
                    
                    <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
                        <!-- Left Column: Thumbnail & Actions -->
                        <div style="flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: var(--spacing-sm);">
                            <div style="width: 100%; height: 110px; border-radius: 8px; background: ${selectedItem.bgGradient}; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 18px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                Article Preview
                            </div>
                            <div style="display: flex; gap: var(--spacing-xs);">
                                <button class="open-article-btn" onclick="window.location.hash='${selectedItem.url}'" style="flex: 2; background: var(--color-input-focus-border); border: none; border-radius: var(--border-radius-sm); color: #FFFFFF; padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer;">Open Article</button>
                                <button class="preview-toggle-read-btn" style="flex: 1.2; background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); cursor: pointer;">
                                    ${selectedItem.unread ? 'Mark Read' : 'Mark Unread'}
                                </button>
                                <button class="preview-delete-btn" style="background: transparent; border: 1px solid #E81123; border-radius: var(--border-radius-sm); color: #E81123; width: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;"><i class="hgi-stroke hgi-cancel-01" style="font-size: 14px; pointer-events: none;"></i></button>
                            </div>
                        </div>
                        
                        <!-- Right Column: Info & AI Summary -->
                        <div style="flex: 2; min-width: 280px; display: flex; flex-direction: column; gap: var(--spacing-xs);">
                            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                                <i class="hgi-stroke ${selectedItem.faviconClass}" style="font-size: 16px; color: var(--color-text-inactive); flex-shrink: 0;"></i>
                                <h3 style="margin: 0; font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--color-viewport-text);">${selectedItem.title}</h3>
                            </div>
                            <a href="${selectedItem.url}" target="_blank" style="font-size: var(--font-size-xs); color: var(--color-input-focus-border); text-decoration: none; word-break: break-all;">${selectedItem.url}</a>
                            
                            <p style="margin: var(--spacing-xs) 0; font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); line-height: 1.4;">${selectedItem.description}</p>
                            
                            <div style="background: color-mix(in srgb, var(--color-input-focus-border) 5%, transparent); border: 1px solid color-mix(in srgb, var(--color-input-focus-border) 10%, transparent); border-radius: 8px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); line-height: 1.4; font-style: italic;">
                                <span style="font-weight: var(--font-weight-semibold); color: var(--color-input-focus-border); display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                                    <i class="hgi-stroke hgi-chat-bot" style="font-size: 12px;"></i> AI Summary
                                </span>
                                "${selectedItem.summary}"
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--color-viewport-text-muted); margin-top: auto; border-top: 1px solid var(--color-viewport-border); padding-top: var(--spacing-sm); flex-wrap: wrap; gap: var(--spacing-xs);">
                                <span>Added: <strong>${selectedItem.dateAdded}</strong></span>
                                <span>Read time: <strong>${selectedItem.readTime}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        const emptyState = filtered.length === 0 ? `
            <div style="text-align: center; padding: 60px 20px; color: var(--color-viewport-text-muted);">
                <i class="hgi-stroke hgi-book-open-01" style="font-size: 32px; opacity: 0.5; margin-bottom: var(--spacing-sm); display: block; margin-left: auto; margin-right: auto;"></i>
                <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No articles found</div>
                <div style="font-size: var(--font-size-xs); opacity: 0.7; margin-top: 4px;">Try searching for a different article title</div>
            </div>
        ` : '';

        const sidebarCategoriesHtml = this.state.categories.map(c => {
            const isActive = activeCategory === c;
            let iconClass = 'hgi-book-open-01';
            if (c === 'Favorites') iconClass = 'hgi-star';
            if (c === 'Read Later') iconClass = 'hgi-clock-01';
            if (c === 'Archived') iconClass = 'hgi-folder';

            return `
                <div class="bookmarks-nav-item ${isActive ? 'active' : ''}" data-category="${c}" style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-xs); color: ${isActive ? 'var(--color-text-active)' : 'var(--color-text-inactive)'}; font-weight: ${isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)'}; background: ${isActive ? 'var(--color-active-bg)' : 'transparent'}; cursor: pointer;">
                    <i class="hgi-stroke ${iconClass}" style="font-size: 13px; color: ${isActive ? 'var(--color-input-focus-border)' : 'var(--color-text-inactive)'};"></i> ${c}
                </div>
            `;
        }).join('');

        return `
            <div class="aero-reading-list-page">
                <!-- Left Sidebar -->
                <div class="reading-list-left-sidebar">
                    <div style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted); padding: var(--spacing-sm) var(--spacing-md);">Reading List</div>
                    ${sidebarCategoriesHtml}
                </div>

                <!-- Center Panel -->
                <div class="reading-list-main-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <h2 style="margin: 0 0 var(--spacing-xxs); font-size: 20px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Reading List</h2>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">${filtered.length} articles</span>
                        </div>
                        <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
                            <select style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                <option>Sort by: Date added</option>
                                <option>Sort by: Title</option>
                                <option>Sort by: Read time</option>
                            </select>
                            <button id="btn-add-article" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); cursor: pointer;">Add Article</button>
                        </div>
                    </div>

                    <!-- Search Input -->
                    <div class="search-downloads-bar" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-lg); height: 40px; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; box-shadow: var(--shadow-sm); margin-bottom: 4px;">
                        <span style="font-size: 16px; opacity: 0.6; display: flex; align-items: center;"><i class="hgi-stroke hgi-search-01" style="font-size: 16px;"></i></span>
                        <input type="text" id="reading-list-search-input" value="${this.state.searchQuery}" placeholder="Search articles" style="flex: 1; border: none; font-size: var(--font-size-sm); color: var(--color-viewport-text); outline: none; background: transparent;">
                    </div>

                    <!-- Filter pills -->
                    <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                        <button class="filter-pill ${activeFilter === 'All' ? 'active' : ''}" data-filter="All" style="background: ${activeFilter === 'All' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'All' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'All' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">All</button>
                        <button class="filter-pill ${activeFilter === 'Unread' ? 'active' : ''}" data-filter="Unread" style="background: ${activeFilter === 'Unread' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Unread' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Unread' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Unread</button>
                        <button class="filter-pill ${activeFilter === 'Read' ? 'active' : ''}" data-filter="Read" style="background: ${activeFilter === 'Read' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Read' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Read' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Read</button>
                    </div>

                    <!-- Items List -->
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                        ${emptyState}
                        ${itemsHtml}
                    </div>

                    ${previewHtml}
                </div>
            </div>
        `;
    }

    afterRender() {
        const searchInput = this.querySelector('#reading-list-search-input');
        if (searchInput) {
            searchInput.focus();
            const val = searchInput.value;
            searchInput.value = '';
            searchInput.value = val;

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                window.AppState.update(state => {
                    state.readingListSearchQuery = query;
                });
            });
        }

        // Category Switcher
        this.querySelectorAll('.bookmarks-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.getAttribute('data-category');
                if (category) {
                    this.setState({ activeCategory: category });
                }
            });
        });

        // Filter Pills
        this.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                this.setState({ filter: pill.getAttribute('data-filter') });
            });
        });

        // Card Selection
        this.querySelectorAll('.reading-list-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.toggle-read-btn') || e.target.closest('.star-toggle-btn') || e.target.closest('.delete-btn')) return;
                const id = parseInt(card.getAttribute('data-id'));
                this.setState({ selectedItemId: id });
            });
        });

        // Star Toggle
        this.querySelectorAll('.star-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                window.AppState.update(state => {
                    state.readingList = state.readingList.map(item => {
                        if (item.id === id) {
                            return { ...item, starred: !item.starred };
                        }
                        return item;
                    });
                });
            });
        });

        // Inline Toggle Read status
        this.querySelectorAll('.toggle-read-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                window.AppState.update(state => {
                    state.readingList = state.readingList.map(item => {
                        if (item.id === id) {
                            return { ...item, unread: !item.unread };
                        }
                        return item;
                    });
                });
            });
        });

        // Preview Pane Toggle Read status
        const previewToggleBtn = this.querySelector('.preview-toggle-read-btn');
        if (previewToggleBtn) {
            previewToggleBtn.addEventListener('click', () => {
                const selectedItem = this.state.items.find(x => x.id === this.state.selectedItemId);
                if (!selectedItem) return;
                window.AppState.update(state => {
                    state.readingList = state.readingList.map(item => {
                        if (item.id === selectedItem.id) {
                            return { ...item, unread: !item.unread };
                        }
                        return item;
                    });
                });
            });
        }

        // Inline Delete
        this.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                if (await window.aeroConfirm('Are you sure you want to remove this article from your Reading List?')) {
                    window.AppState.update(state => {
                        state.readingList = state.readingList.filter(x => x.id !== id);
                    });
                    const nextItems = window.AppState.readingList;
                    const nextSelected = nextItems.length > 0 ? nextItems[0].id : null;
                    this.setState({
                        selectedItemId: nextSelected
                    });
                }
            });
        });

        // Preview Delete
        const previewDeleteBtn = this.querySelector('.preview-delete-btn');
        if (previewDeleteBtn) {
            previewDeleteBtn.addEventListener('click', async () => {
                const selectedItem = this.state.items.find(x => x.id === this.state.selectedItemId);
                if (!selectedItem) return;
                if (await window.aeroConfirm('Are you sure you want to remove this article from your Reading List?')) {
                    window.AppState.update(state => {
                        state.readingList = state.readingList.filter(x => x.id !== selectedItem.id);
                    });
                    const nextItems = window.AppState.readingList;
                    const nextSelected = nextItems.length > 0 ? nextItems[0].id : null;
                    this.setState({
                        selectedItemId: nextSelected
                    });
                }
            });
        }

        // Mock Add Article
        const addArticleBtn = this.querySelector('#btn-add-article');
        if (addArticleBtn) {
            addArticleBtn.addEventListener('click', async () => {
                const title = await window.aeroPrompt('Enter article title:');
                if (!title || !title.trim()) return;
                const url = await window.aeroPrompt('Enter article URL:', 'https://');
                if (!url || !url.trim()) return;

                const domain = url.replace('https://', '').replace('http://', '').split('/')[0] || 'unknown.com';
                const id = Date.now();
                const newArticle = {
                    id,
                    title: title.trim(),
                    url: url.trim(),
                    domain,
                    readTime: `${Math.floor(Math.random() * 8) + 3} min read`,
                    dateAdded: 'Just now',
                    unread: true,
                    starred: false,
                    faviconClass: 'hgi-book-open-01',
                    bgGradient: `linear-gradient(135deg, ${this.getRandomColor()}, ${this.getRandomColor()})`,
                    description: `Manually saved article from ${domain}.`,
                    summary: 'AI summarization will process this article soon.'
                };

                window.AppState.update(state => {
                    state.readingList = [...state.readingList, newArticle];
                });
                this.setState({
                    selectedItemId: id
                });
            });
        }
    }

    getRandomColor() {
        const colors = ['#A259FF', '#FF7262', '#2A2C30', '#5E6AD2', '#0ACF83', '#1ABC9C', '#FFBA00', '#EA4335', '#1A73E8'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
