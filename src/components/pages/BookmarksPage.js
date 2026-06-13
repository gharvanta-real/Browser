import { BaseComponent } from '../BaseComponent.js';

export class BookmarksPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            searchQuery: window.AppState?.bookmarkSearchQuery || '',
            filter: 'All', // 'All' | 'Recent' | 'Starred' | 'Duplicates'
            activeFolder: 'All Bookmarks',
            selectedBookmarkId: 1, // default selected
            bookmarks: window.AppState?.bookmarks || [],
            folders: window.AppState?.bookmarksFolders || []
        };
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            this.setState({
                bookmarks: state.bookmarks || [],
                folders: state.bookmarksFolders || [],
                searchQuery: state.bookmarkSearchQuery || ''
            });
        });
        super.connectedCallback();
    }

    template() {
        const query = this.state.searchQuery.toLowerCase().trim();
        const activeFilter = this.state.filter;
        const activeFolder = this.state.activeFolder;
        
        // Filter bookmarks
        let filtered = this.state.bookmarks.filter(item => {
            const matchesQuery = item.title.toLowerCase().includes(query) || item.url.toLowerCase().includes(query);
            if (!matchesQuery) return false;
            
            if (activeFilter === 'Starred') return item.starred;
            return true;
        });

        // Rows HTML
        const rowsHtml = filtered.map(item => {
            const isSelected = item.id === this.state.selectedBookmarkId;
            const tagsBadges = item.tags.map(t => `
                <span style="font-size: 9px; padding: 1px var(--spacing-sm); background: rgba(0,0,0,0.04); border: 1px solid var(--color-border-light); border-radius: var(--border-radius-pill); color: var(--color-text-inactive); font-weight: var(--font-weight-medium);">${t}</span>
            `).join('');

            return `
                <tr class="bookmark-row ${isSelected ? 'selected-row' : ''}" data-id="${item.id}" style="border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; background: ${isSelected ? 'rgba(77, 144, 254, 0.05)' : 'transparent'}; transition: background var(--transition-fast);">
                    <td style="padding: var(--spacing-sm) var(--spacing-md); width: 24px;">
                        <input type="checkbox" class="row-checkbox" style="cursor: pointer;">
                    </td>
                    <td style="padding: var(--spacing-sm) var(--spacing-md); display: flex; align-items: center; gap: var(--spacing-sm); min-width: 0;">
                        <i class="hgi-stroke ${item.faviconClass}" style="font-size: 14px; color: var(--color-text-inactive); flex-shrink: 0;"></i>
                        <div style="display: flex; flex-direction: column; min-width: 0; gap: 2px;">
                            <span class="bookmark-title-text" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-viewport-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</span>
                            <span style="font-size: 9px; color: var(--color-viewport-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.8;">${item.url}</span>
                        </div>
                    </td>
                    <td style="padding: var(--spacing-sm) var(--spacing-md);">
                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                            ${tagsBadges}
                        </div>
                    </td>
                    <td style="padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); font-family: monospace; white-space: nowrap;">
                        ${item.lastEdited}
                    </td>
                    <td style="padding: var(--spacing-sm) var(--spacing-md); text-align: right; width: 44px;">
                        <div style="display: flex; gap: 4px; justify-content: flex-end; align-items: center;">
                            <button class="star-toggle-btn" data-id="${item.id}" style="background: transparent; border: none; color: ${item.starred ? '#FFBA00' : 'var(--color-text-inactive)'}; cursor: pointer; padding: 4px; border-radius: 4px;">
                                <i class="hgi-stroke hgi-star" style="font-size: 13px; pointer-events: none; fill: ${item.starred ? '#FFBA00' : 'transparent'};"></i>
                            </button>
                            <button class="row-menu-btn" style="background: transparent; border: none; color: var(--color-text-inactive); cursor: pointer; padding: 4px; border-radius: 4px;">
                                <i class="hgi-stroke hgi-more-vertical" style="font-size: 13px;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Selected Preview Sidebar logic
        const selectedItem = this.state.bookmarks.find(x => x.id === this.state.selectedBookmarkId) || this.state.bookmarks[0];
        
        let previewPanelHtml = '';
        if (selectedItem) {
            const previewTags = selectedItem.tags.map(t => `
                <span style="font-size: 9px; padding: 2px var(--spacing-sm); background: rgba(0,0,0,0.04); border: 1px solid var(--color-border-light); border-radius: var(--border-radius-pill); color: var(--color-text-inactive);">${t}</span>
            `).join('');

            previewPanelHtml = `
                <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-sm); margin-top: var(--spacing-md); box-shadow: var(--shadow-sm);">
                    <h4 style="margin: 0; font-size: 11px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Bookmark Preview</h4>
                    
                    <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
                        <!-- Left: Gradient Thumbnail & action buttons -->
                        <div style="flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: var(--spacing-sm);">
                            <div class="bookmark-detail-thumbnail" style="width: 100%; height: 110px; border-radius: 8px; background: ${selectedItem.bgGradient}; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 20px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                Aero Preview
                            </div>
                            <div style="display: flex; gap: var(--spacing-xs);">
                                <button class="btn-preview-action open-bookmark-btn" onclick="window.location.hash='${selectedItem.url}'" style="flex: 1; background: var(--color-input-focus-border); border: none; border-radius: var(--border-radius-sm); color: #FFFFFF; padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer;">Open</button>
                                <button class="btn-preview-action edit-bookmark-btn" style="flex: 1; background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); cursor: pointer;">Edit</button>
                                <button class="btn-preview-action delete-bookmark-btn" data-id="${selectedItem.id}" style="background: transparent; border: 1px solid #E81123; border-radius: var(--border-radius-sm); color: #E81123; width: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;"><i class="hgi-stroke hgi-cancel-01" style="font-size: 14px; pointer-events: none;"></i></button>
                            </div>
                        </div>
                        
                        <!-- Right: Textual Info, Description, Tags, Timestamps -->
                        <div style="flex: 2; min-width: 280px; display: flex; flex-direction: column; gap: var(--spacing-xs);">
                            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                                <i class="hgi-stroke ${selectedItem.faviconClass}" style="font-size: 16px; color: var(--color-text-inactive); flex-shrink: 0;"></i>
                                <h3 style="margin: 0; font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--color-viewport-text);">${selectedItem.title}</h3>
                            </div>
                            
                            <a href="${selectedItem.url}" target="_blank" style="font-size: var(--font-size-xs); color: var(--color-input-focus-border); text-decoration: none; word-break: break-all;">${selectedItem.url}</a>
                            
                            <p style="margin: var(--spacing-xs) 0; font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); line-height: 1.4;">${selectedItem.description}</p>
                            
                            <div style="display: flex; gap: var(--spacing-md); align-items: center; margin-top: auto; border-top: 1px solid var(--color-viewport-border); padding-top: var(--spacing-sm); flex-wrap: wrap;">
                                <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
                                    <span style="font-size: 10px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Tags:</span>
                                    ${previewTags}
                                </div>
                                <div style="margin-left: auto; font-size: 9px; color: var(--color-viewport-text-muted);">
                                    Last edited: <strong>${selectedItem.lastEditedTime}</strong> | Added: <strong>${selectedItem.dateAdded}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        const emptyState = filtered.length === 0 ? `
            <tr>
                <td colspan="5" style="text-align: center; padding: 60px 20px; color: var(--color-viewport-text-muted);">
                    <i class="hgi-stroke hgi-star" style="font-size: 32px; opacity: 0.5; margin-bottom: var(--spacing-sm); display: block; margin-left: auto; margin-right: auto;"></i>
                    <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No bookmarks found</div>
                    <div style="font-size: var(--font-size-xs); opacity: 0.7; margin-top: 4px;">Try searching for a different bookmark name</div>
                </td>
            </tr>
        ` : '';

        const sidebarFoldersHtml = this.state.folders.map(f => {
            const isFolderActive = activeFolder === f;
            return `
                <div class="bookmarks-nav-item ${isFolderActive ? 'active' : ''}" data-folder="${f}" style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-xs); color: ${isFolderActive ? 'var(--color-text-active)' : 'var(--color-text-inactive)'}; font-weight: ${isFolderActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)'}; background: ${isFolderActive ? 'var(--color-active-bg)' : 'transparent'}; cursor: pointer;">
                    <i class="hgi-stroke hgi-folder" style="font-size: 13px; color: ${isFolderActive ? 'var(--color-input-focus-border)' : 'var(--color-text-inactive)'};"></i> ${f}
                </div>
            `;
        }).join('');

        return `
            <div class="aero-bookmarks-page">
                <!-- Left Sidebar folder lists -->
                <div class="bookmarks-page-left-sidebar">
                    <div style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted); padding: var(--spacing-sm) var(--spacing-md);">Bookmarks</div>
                    <div class="bookmarks-nav-item ${activeFolder === 'All Bookmarks' ? 'active' : ''}" data-folder="All Bookmarks" style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-xs); color: ${activeFolder === 'All Bookmarks' ? 'var(--color-text-active)' : 'var(--color-text-inactive)'}; font-weight: ${activeFolder === 'All Bookmarks' ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)'}; background: ${activeFolder === 'All Bookmarks' ? 'var(--color-active-bg)' : 'transparent'}; cursor: pointer;">
                        <i class="hgi-stroke hgi-folder" style="font-size: 13px;"></i> All Bookmarks
                    </div>
                    <div class="bookmarks-nav-item" style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-xs); color: var(--color-text-inactive); cursor: pointer;">
                        <i class="hgi-stroke hgi-star" style="font-size: 13px;"></i> Favorites
                    </div>
                    <div class="bookmarks-nav-item" style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-xs); color: var(--color-text-inactive); cursor: pointer;">
                        <i class="hgi-stroke hgi-clock-01" style="font-size: 13px;"></i> Recents
                    </div>
                    <div class="bookmarks-nav-item" style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-xs); color: var(--color-text-inactive); cursor: pointer;">
                        <i class="hgi-stroke hgi-star" style="font-size: 13px;"></i> Starred
                    </div>
                    <div class="bookmarks-nav-item" style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-xs); color: var(--color-text-inactive); cursor: pointer;">
                        <i class="hgi-stroke hgi-note-01" style="font-size: 13px;"></i> Duplicates
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted); padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xs);">
                        <span>Folders</span>
                        <button id="btn-add-folder" style="background: transparent; border: none; color: var(--color-text-inactive); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">+</button>
                    </div>
                    ${sidebarFoldersHtml}
                </div>

                <!-- Center Bookmarks Main List -->
                <div class="bookmarks-main-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <h2 style="margin: 0 0 var(--spacing-xxs); font-size: 20px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Bookmarks</h2>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">${filtered.length} bookmarks</span>
                        </div>
                        <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
                            <select style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                <option>Sort by: Last edited</option>
                                <option>Sort by: Name</option>
                                <option>Sort by: Date added</option>
                            </select>
                            <button id="btn-new-folder" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); cursor: pointer;">New folder</button>
                            <button id="btn-add-bookmark" style="background: var(--color-input-focus-border); border: none; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: #FFFFFF; cursor: pointer;">Add bookmark</button>
                            <button style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-viewport-text);">
                                <i class="hgi-stroke hgi-more-vertical" style="font-size: 14px;"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Search Input bar -->
                    <div class="search-bookmarks-bar" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-lg); height: 40px; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; box-shadow: var(--shadow-sm); margin-bottom: 4px;">
                        <span style="font-size: 16px; opacity: 0.6; display: flex; align-items: center;"><i class="hgi-stroke hgi-search-01" style="font-size: 16px;"></i></span>
                        <input type="text" id="bookmarks-search-input" value="${this.state.searchQuery}" placeholder="Search bookmarks" style="flex: 1; border: none; font-size: var(--font-size-sm); color: var(--color-viewport-text); outline: none; background: transparent;">
                    </div>

                    <!-- Filter pills row -->
                    <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                        <button class="filter-pill ${activeFilter === 'All' ? 'active' : ''}" data-filter="All" style="background: ${activeFilter === 'All' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'All' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'All' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">All</button>
                        <button class="filter-pill ${activeFilter === 'Recent' ? 'active' : ''}" data-filter="Recent" style="background: ${activeFilter === 'Recent' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Recent' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Recent' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Recent</button>
                        <button class="filter-pill ${activeFilter === 'Starred' ? 'active' : ''}" data-filter="Starred" style="background: ${activeFilter === 'Starred' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Starred' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Starred' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Starred</button>
                        <button class="filter-pill ${activeFilter === 'Duplicates' ? 'active' : ''}" data-filter="Duplicates" style="background: ${activeFilter === 'Duplicates' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Duplicates' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Duplicates' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Duplicates</button>
                    </div>

                    <!-- Bookmarks table -->
                    <div style="border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; background: var(--color-card-bg);">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--color-viewport-border); background: rgba(0,0,0,0.01); font-size: var(--font-size-xs); color: var(--color-text-inactive); font-weight: var(--font-weight-semibold);">
                                    <th style="padding: var(--spacing-sm) var(--spacing-md); width: 24px;">
                                        <input type="checkbox" style="cursor: pointer;">
                                    </th>
                                    <th style="padding: var(--spacing-sm) var(--spacing-md);">Name</th>
                                    <th style="padding: var(--spacing-sm) var(--spacing-md);">Tags</th>
                                    <th style="padding: var(--spacing-sm) var(--spacing-md);">Last edited</th>
                                    <th style="padding: var(--spacing-sm) var(--spacing-md); text-align: right; width: 44px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${emptyState}
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>

                    ${previewPanelHtml}
                </div>
            </div>
        `;
    }

    afterRender() {
        const searchInput = this.querySelector('#bookmarks-search-input');
        if (searchInput) {
            searchInput.focus();
            const val = searchInput.value;
            searchInput.value = '';
            searchInput.value = val;
 
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                window.AppState.update(state => {
                    state.bookmarkSearchQuery = query;
                });
            });
        }
 
        this.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                this.setState({ filter: pill.getAttribute('data-filter') });
            });
        });
 
        // Folder navigation
        this.querySelectorAll('.bookmarks-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const folder = item.getAttribute('data-folder');
                if (folder) {
                    this.setState({ activeFolder: folder });
                }
            });
        });
 
        // Row selection
        this.querySelectorAll('.bookmark-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.star-toggle-btn') || e.target.closest('.row-checkbox') || e.target.closest('.row-menu-btn')) return;
                const id = parseInt(row.getAttribute('data-id'));
                this.setState({ selectedBookmarkId: id });
            });
        });
 
        // Star toggle
        this.querySelectorAll('.star-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                window.AppState.update(state => {
                    state.bookmarks = state.bookmarks.map(b => {
                        if (b.id === id) {
                            return { ...b, starred: !b.starred };
                        }
                        return b;
                    });
                });
            });
        });
 
        // Bookmark Delete trigger
        const deleteBtn = this.querySelector('.delete-bookmark-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const id = parseInt(deleteBtn.getAttribute('data-id'));
                if (await window.aeroConfirm("Are you sure you want to delete this bookmark?")) {
                    window.AppState.update(state => {
                        state.bookmarks = state.bookmarks.filter(x => x.id !== id);
                    });
                    const nextBookmarks = window.AppState.bookmarks;
                    const nextSelected = nextBookmarks.length > 0 ? nextBookmarks[0].id : null;
                    this.setState({
                        selectedBookmarkId: nextSelected
                    });
                }
            });
        }
 
        // Add Folder triggers
        const addFolderBtn = this.querySelector('#btn-add-folder');
        const newFolderBtn = this.querySelector('#btn-new-folder');
        const triggerAddFolder = async () => {
            const name = await window.aeroPrompt("Enter new folder name:");
            if (name && name.trim()) {
                window.AppState.update(state => {
                    state.bookmarksFolders = [...(state.bookmarksFolders || []), name.trim()];
                });
            }
        };
 
        if (addFolderBtn) addFolderBtn.addEventListener('click', triggerAddFolder);
        if (newFolderBtn) newFolderBtn.addEventListener('click', triggerAddFolder);

        // Add Bookmark trigger
        const addBookmarkBtn = this.querySelector('#btn-add-bookmark');
        if (addBookmarkBtn) {
            addBookmarkBtn.addEventListener('click', async () => {
                const title = await window.aeroPrompt('Enter bookmark title:');
                if (!title || !title.trim()) return;
                const url = await window.aeroPrompt('Enter bookmark URL:', 'https://');
                if (!url || !url.trim()) return;
                
                const id = Date.now();
                const newBookmark = {
                    id,
                    title: title.trim(),
                    url: url.trim(),
                    displayUrl: url.replace('https://', '').replace('http://', ''),
                    tags: ['general'],
                    lastEdited: 'Just now',
                    lastEditedTime: new Date().toLocaleString(),
                    dateAdded: new Date().toLocaleString(),
                    starred: false,
                    faviconClass: 'hgi-global',
                    bgGradient: 'linear-gradient(135deg, var(--color-input-focus-border), #0ACF83)',
                    description: 'Manually added bookmark.'
                };
                
                window.AppState.update(state => {
                    state.bookmarks = [...state.bookmarks, newBookmark];
                });
                this.setState({ selectedBookmarkId: id });
            });
        }
    }
}
