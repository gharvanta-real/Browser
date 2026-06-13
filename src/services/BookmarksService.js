// Bookmark folder dropdown helper function
function showBookmarkFolderDropdown(anchorEl, folderTitle, bookmarks) {
    // Remove any existing dropdowns first
    document.querySelectorAll('.bookmark-folder-dropdown').forEach(el => el.remove());

    const folderItems = bookmarks.filter(b => b.folder === folderTitle);
    const dropdown = document.createElement('div');
    dropdown.className = 'bookmark-folder-dropdown';
    
    const isDark = document.documentElement.classList.contains('dark-theme');
    
    // Position the dropdown absolutely relative to the viewport/body
    const rect = anchorEl.getBoundingClientRect();
    Object.assign(dropdown.style, {
        position: 'fixed',
        top: `${rect.bottom + window.scrollY + 4}px`,
        left: `${rect.left + window.scrollX}px`,
        background: isDark ? '#282A2D' : '#FFFFFF',
        border: isDark ? '1px solid #333639' : '1px solid #E5E7EB',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '4px 0',
        zIndex: '99999',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '160px',
        animation: 'fadeIn 0.1s ease-out'
    });

    if (folderItems.length === 0) {
        dropdown.innerHTML = `
            <div style="padding: 6px 12px; font-size: var(--font-size-xs); font-family: var(--font-ui); color: var(--color-text-inactive); font-style: italic;">
                (Empty)
            </div>
        `;
    } else {
        dropdown.innerHTML = folderItems.map(b => {
            const faviconUrl = b.favicon || `https://www.google.com/s2/favicons?sz=32&domain=${new URL(b.url).hostname}`;
            return `
                <div class="folder-dropdown-item" data-url="${b.url}" style="padding: 6px 12px; font-size: var(--font-size-xs); font-family: var(--font-ui); display: flex; align-items: center; gap: 8px; cursor: pointer; color: ${isDark ? '#F1F3F4' : '#1F2937'}; transition: background 0.1s; border-radius: 4px; margin: 0 4px;">
                    <img src="${faviconUrl}" alt="" style="width: 14px; height: 14px; border-radius: 2px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" /><i class="hgi-stroke hgi-globe" style="font-size: 13px; display: none;"></i>
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${b.title}</span>
                </div>
            `;
        }).join('');
    }

    // Attach click events to navigate
    dropdown.querySelectorAll('.folder-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.getAttribute('data-url');
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
            dropdown.remove();
        });
        
        item.addEventListener('mouseenter', () => {
            item.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
            item.style.color = isDark ? '#FFFFFF' : '#000000';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
            item.style.color = isDark ? '#F1F3F4' : '#1F2937';
        });
    });

    document.body.appendChild(dropdown);

    // Close when click outside
    const closeOnOutside = (e) => {
        if (!dropdown.contains(e.target) && !anchorEl.contains(e.target)) {
            dropdown.remove();
            document.removeEventListener('click', closeOnOutside);
        }
    };
    setTimeout(() => {
        document.addEventListener('click', closeOnOutside);
    }, 0);
}

window.showBookmarkFolderDropdown = showBookmarkFolderDropdown;


