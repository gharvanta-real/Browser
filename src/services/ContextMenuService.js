// Global context menu engine for Bookmarks
window.addEventListener('contextmenu', (e) => {
    const bookmarksShelf = document.getElementById('bookmarks-shelf');
    if (bookmarksShelf && bookmarksShelf.contains(e.target)) {
        e.preventDefault();
        
        // Find if a bookmark item was clicked
        const itemEl = e.target.closest('.bookmark-item, .bookmark-link-trigger, .bookmark-folder-trigger');
        let bookmarkData = null;
        if (itemEl) {
            const url = itemEl.getAttribute('data-url');
            const folderTitle = itemEl.getAttribute('data-folder-title');
            
            if (url) {
                bookmarkData = window.AppState.bookmarks.find(b => b.url === url);
            } else if (folderTitle) {
                bookmarkData = window.AppState.bookmarks.find(b => b.title === folderTitle && b.isFolder);
            }
        }
        
        showBookmarksContextMenu(e.clientX, e.clientY, bookmarkData);
    }
});

function showBookmarksContextMenu(x, y, bookmark) {
    // Dismiss any existing context menus
    document.querySelectorAll('.aero-context-menu').forEach(el => el.remove());

    const menu = document.createElement('div');
    menu.className = 'aero-context-menu animate-fade-in';
    
    const isDark = document.documentElement.classList.contains('dark-theme');
    const hasBookmark = !!bookmark;
    const isFolder = bookmark && bookmark.isFolder;

    // Build items HTML
    menu.innerHTML = `
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-open-tab">
            <i class="hgi-stroke hgi-plus-sign acm-icon-left"></i>
            Open in new tab
        </div>
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-open-window">
            <i class="hgi-stroke hgi-browser-video acm-icon-left"></i>
            Open in new window
        </div>
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-open-split">
            <i class="hgi-stroke hgi-grid-view acm-icon-left"></i>
            Open in split view
        </div>
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-open-incognito">
            <i class="hgi-stroke hgi-incognito acm-icon-left"></i>
            Open in Incognito window
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item ${!hasBookmark ? 'disabled' : ''}" id="acm-edit">
            <i class="hgi-stroke hgi-edit-02 acm-icon-left"></i>
            Edit...
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-cut">
            <i class="hgi-stroke hgi-scissors acm-icon-left"></i>
            Cut
        </div>
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-copy">
            <i class="hgi-stroke hgi-copy-link acm-icon-left"></i>
            Copy
        </div>
        <div class="acm-item disabled" id="acm-paste">
            <i class="hgi-stroke hgi-clipboard acm-icon-left"></i>
            Paste
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item ${!hasBookmark ? 'disabled' : ''}" id="acm-delete">
            <i class="hgi-stroke hgi-delete-02 acm-icon-left"></i>
            Delete
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item" id="acm-add-page">
            <i class="hgi-stroke hgi-star-add acm-icon-left"></i>
            Add page...
        </div>
        <div class="acm-item" id="acm-add-folder">
            <i class="hgi-stroke hgi-folder-add acm-icon-left"></i>
            Add folder...
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item" id="acm-manager">
            <i class="hgi-stroke hgi-settings-01 acm-icon-left"></i>
            Open Bookmarks Manager
        </div>
        <div class="acm-item" id="acm-toggle-bar">
            <i class="hgi-stroke hgi-tick-01 acm-icon-left" style="visibility: ${window.AppState.showBookmarksBar ? 'visible' : 'hidden'}; color: #1b828f;"></i>
            Show bookmarks bar
        </div>
        <div class="acm-item" id="acm-toggle-newtab-bar">
            <i class="hgi-stroke hgi-tick-01 acm-icon-left" style="visibility: visible; color: #1b828f;"></i>
            Show bookmarks bar on new tab page
        </div>
    `;

    // Position context menu
    Object.assign(menu.style, {
        top: `${y}px`,
        left: `${x}px`,
        position: 'fixed'
    });
    document.body.appendChild(menu);

    // Clamp coordinates if overflow
    const rect = menu.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
        menu.style.left = `${window.innerWidth - rect.width - 8}px`;
    }
    if (y + rect.height > window.innerHeight) {
        menu.style.top = `${window.innerHeight - rect.height - 8}px`;
    }

    // Attach Action Handlers
    const closeMenu = () => {
        menu.remove();
        document.removeEventListener('click', closeMenuHandler);
    };

    const navigateTab = (url) => {
        window.AppState.update(s => {
            const activeTab = s.tabs.find(t => t.id === s.activeTabId);
            if (activeTab) {
                activeTab.url = url;
                try {
                    activeTab.title = new URL(url).hostname.replace('www.', '');
                } catch {
                    activeTab.title = url;
                }
            }
        });
    };

    const navigateNewTab = (url, title) => {
        window.AppState.update(s => {
            const newId = `tab-${Date.now()}`;
            s.tabs.push({
                id: newId,
                title: title || 'New Tab',
                url: url,
                active: true,
                hibernated: false,
                workspace: 'Default'
            });
            s.activeTabId = newId;
        });
    };

    // Open in new tab
    menu.querySelector('#acm-open-tab')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) navigateNewTab(bookmark.url, bookmark.title);
        closeMenu();
    });

    // Open in new window
    menu.querySelector('#acm-open-window')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            alert(`Opening in new window: ${bookmark.url}`);
        }
        closeMenu();
    });

    // Open in split view
    menu.querySelector('#acm-open-split')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            alert(`Opening in split view: ${bookmark.url}`);
        }
        closeMenu();
    });

    // Open in Incognito window
    menu.querySelector('#acm-open-incognito')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            alert(`Opening in Incognito window: ${bookmark.url}`);
        }
        closeMenu();
    });

    // Edit...
    menu.querySelector('#acm-edit')?.addEventListener('click', () => {
        if (bookmark) {
            const starBtn = document.querySelector('.url-bookmark-btn');
            if (starBtn) {
                const omniboxEl = document.querySelector('browser-omnibox');
                if (omniboxEl && typeof omniboxEl.showEditBookmarkPopup === 'function') {
                    omniboxEl.showEditBookmarkPopup(starBtn, bookmark);
                }
            }
        }
        closeMenu();
    });

    // Cut / Copy
    menu.querySelector('#acm-cut')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            navigator.clipboard.writeText(bookmark.url);
            window.AppState.update(s => {
                s.bookmarks = s.bookmarks.filter(b => b.id !== bookmark.id);
            });
        }
        closeMenu();
    });

    menu.querySelector('#acm-copy')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            navigator.clipboard.writeText(bookmark.url);
        }
        closeMenu();
    });

    // Delete
    menu.querySelector('#acm-delete')?.addEventListener('click', () => {
        if (bookmark) {
            window.AppState.update(s => {
                s.bookmarks = s.bookmarks.filter(b => b.id !== bookmark.id);
            });
        }
        closeMenu();
    });

    // Add page...
    menu.querySelector('#acm-add-page')?.addEventListener('click', () => {
        const title = prompt("Enter bookmark name:");
        if (title) {
            const url = prompt("Enter bookmark URL:", "https://");
            if (url) {
                window.AppState.update(s => {
                    s.bookmarks.push({
                        id: Date.now(),
                        title: title,
                        url: url,
                        displayUrl: url.replace('https://', '').replace('http://', ''),
                        folder: 'Bookmarks bar',
                        starred: true,
                        tags: ['quick'],
                        dateAdded: new Date().toLocaleDateString(),
                        faviconClass: 'hgi-global'
                    });
                });
            }
        }
        closeMenu();
    });

    // Add folder...
    menu.querySelector('#acm-add-folder')?.addEventListener('click', () => {
        const title = prompt("Enter folder name:");
        if (title) {
            window.AppState.update(s => {
                s.bookmarks.push({
                    id: 'b-' + Date.now(),
                    title: title,
                    isFolder: true,
                    folder: 'Bookmarks bar',
                    color: '#4285F4',
                    starred: false,
                    tags: [],
                    dateAdded: new Date().toLocaleDateString(),
                    faviconClass: 'hgi-folder'
                });
            });
        }
        closeMenu();
    });

    // Open Bookmarks Manager
    menu.querySelector('#acm-manager')?.addEventListener('click', () => {
        navigateTab('aero://bookmarks');
        closeMenu();
    });

    // Toggle Bookmarks Bar
    menu.querySelector('#acm-toggle-bar')?.addEventListener('click', () => {
        window.AppState.update(s => {
            s.showBookmarksBar = !s.showBookmarksBar;
        });
        closeMenu();
    });

    // Toggle bookmarks bar on newtab
    menu.querySelector('#acm-toggle-newtab-bar')?.addEventListener('click', () => {
        alert("Bookmarks bar is set to show on New Tab page.");
        closeMenu();
    });

    // Close handler
    const closeMenuHandler = (e) => {
        if (!menu.contains(e.target)) {
            closeMenu();
        }
    };
    setTimeout(() => {
        document.addEventListener('click', closeMenuHandler);
    }, 0);
}

window.showBookmarksContextMenu = showBookmarksContextMenu;


