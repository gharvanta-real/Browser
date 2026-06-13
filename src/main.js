// Import Web Components
import { TabStrip } from './components/TabStrip.js';
import { Omnibox } from './components/Omnibox.js';
import { AISidebar } from './components/AISidebar.js';
import { WebViewport } from './components/WebViewport.js';
import { SettingsPanel } from './components/SettingsPanel.js';

// Import System Page Components
import { SettingsPage } from './components/pages/SettingsPage.js';
import { HistoryPage } from './components/pages/HistoryPage.js';
import { DownloadsPage } from './components/pages/DownloadsPage.js';
import { BookmarksPage } from './components/pages/BookmarksPage.js';
import { ReadingListPage } from './components/pages/ReadingListPage.js';
import { SearchPage } from './components/pages/SearchPage.js';
import { WorkspacesPage } from './components/pages/WorkspacesPage.js';
import { PasswordsPage } from './components/pages/PasswordsPage.js';
import { PaymentsPage } from './components/pages/PaymentsPage.js';
import { AddressesPage } from './components/pages/AddressesPage.js';
import { ToolsPage } from './components/pages/ToolsPage.js';
import { AISetupPage } from './components/pages/AISetupPage.js';

// Import Services & Engines
import './services/AppState.js';
import './services/DialogEngine.js';
import './services/BookmarksService.js';
import './services/ContextMenuService.js';
import './services/ClickCatcher.js';

// Global subscription for theme, custom accent colors, and dynamic workspaces list
window.AppState.subscribe(state => {
    const isDark = state.theme === 'dark' || (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark-theme', isDark);
    
    if (state.accentColor) {
        document.documentElement.style.setProperty('--color-input-focus-border', state.accentColor);
    }

    // Toggle brand title in titlebar when in vertical tab layout
    const verticalBrandTitle = document.getElementById('vertical-brand-title');
    if (verticalBrandTitle) {
        verticalBrandTitle.style.display = state.tabLayout === 'vertical' ? 'flex' : 'none';
    }

    // Toggle left sidebar display based on user visibility preference (keep accessible in vertical layout)
    const sidebarLeft = document.getElementById('aero-left-sidebar');
    const hoverZone = document.getElementById('aero-sidebar-hover-zone');
    if (sidebarLeft) {
        if (state.showLeftSidebar === false) {
            sidebarLeft.style.display = 'none';
            if (hoverZone) hoverZone.style.display = 'none';
        } else {
            sidebarLeft.style.display = 'flex';
            if (hoverZone) hoverZone.style.display = 'block';
        }
    }

    // Toggle bookmarks shelf visibility and handle navigation bar border-radius
    const bookmarksShelf = document.getElementById('bookmarks-shelf');
    const topNav = document.getElementById('browser-nav');
    if (bookmarksShelf) {
        if (state.showBookmarksBar === false) {
            bookmarksShelf.style.display = 'none';
            if (topNav) {
                // Fully rounded pill when no bookmarks bar below
                topNav.style.borderRadius = '12px';
                topNav.style.marginBottom = '0';
                topNav.style.boxShadow = 'none';
            }
        } else {
            bookmarksShelf.style.display = 'flex';
            if (topNav) {
                // Flat bottom — bookmarks bar attaches below
                topNav.style.borderRadius = '12px 12px 0 0';
                topNav.style.marginBottom = '';
                topNav.style.boxShadow = '';
            }
            
            // Dynamic Bookmarks shelf items rendering
            const bookmarksLeft = bookmarksShelf.querySelector('.bookmarks-left');
            if (bookmarksLeft) {
                const barBookmarks = state.bookmarks.filter(b => b.folder === 'Bookmarks bar');
                bookmarksLeft.innerHTML = barBookmarks.map(b => {
                    if (b.isFolder) {
                        return `
                            <div class="bookmark-item bookmark-folder-trigger" data-folder-title="${b.title}" style="cursor: pointer;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${b.color || '#4285F4'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.95;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                ${b.title}
                            </div>
                        `;
                    } else {
                        const faviconUrl = b.favicon || `https://www.google.com/s2/favicons?sz=32&domain=${new URL(b.url).hostname}`;
                        return `
                            <div class="bookmark-item bookmark-link-trigger" data-url="${b.url}" style="cursor: pointer;">
                                <img src="${faviconUrl}" alt="" style="width: 14px; height: 14px; border-radius: 2px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" /><i class="hgi-stroke hgi-globe" style="font-size: 13px; display: none;"></i>
                                ${b.title}
                            </div>
                        `;
                    }
                }).join('');

                // Re-bind click event handlers for link bookmarks
                bookmarksLeft.querySelectorAll('.bookmark-link-trigger').forEach(el => {
                    el.addEventListener('click', () => {
                        const url = el.getAttribute('data-url');
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
                    });
                });

                // Re-bind click event handlers for folder bookmarks
                bookmarksLeft.querySelectorAll('.bookmark-folder-trigger').forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const folderTitle = el.getAttribute('data-folder-title');
                        window.showBookmarkFolderDropdown(el, folderTitle, state.bookmarks);
                    });
                });
            }
        }
    }

    // Dynamically render sidebar workspaces list
    const workspacesContainer = document.getElementById('sidebar-workspaces-list');
    if (workspacesContainer) {
        const customWorkspaces = state.workspaces.filter(w => w.id !== 'Default');
        const activeWorkspace = state.activeWorkspace;

        workspacesContainer.innerHTML = customWorkspaces.map(w => {
            const isActive = activeWorkspace === w.id;
            return `
                <div class="sidebar-item ${isActive ? 'active' : ''}" data-workspace="${w.id}" style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                        <i class="hgi-stroke ${w.icon || 'hgi-briefcase-01'}" style="color: ${w.color || 'currentColor'};"></i>
                        ${w.name}
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 10px; color: var(--color-text-inactive);"></i>
                </div>
            `;
        }).join('');

        // Bind click events on these newly rendered items
        workspacesContainer.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const workspace = item.getAttribute('data-workspace');
                
                // Clear active class from all other sidebar items
                document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                
                window.AppState.update(state => {
                    state.activeWorkspace = workspace;
                    
                    // Find or create tabs for this workspace
                    const workspaceTabs = state.tabs.filter(t => (t.workspace || 'Default') === workspace);
                    if (workspaceTabs.length === 0) {
                        const newId = `tab-${Date.now()}`;
                        state.tabs.push({
                            id: newId,
                            title: 'New Tab',
                            url: 'https://newtab.internal',
                            hibernated: false,
                            active: true,
                            workspace: workspace
                        });
                        state.activeTabId = newId;
                    } else {
                        const lastActive = workspaceTabs.find(t => t.active) || workspaceTabs[0];
                        state.activeTabId = lastActive.id;
                    }
                });
            });
        });
    }

    // Also update highlight for active default items (Home/New Tab, etc. when activeWorkspace is Default or empty)
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    let activePage = '';
    if (activeTab) {
        const url = activeTab.url;
        if (url.includes('newtab.internal')) activePage = 'newtab';
        else if (url.startsWith('aero://history')) activePage = 'history';
        else if (url.startsWith('aero://bookmarks')) activePage = 'bookmarks';
        else if (url.startsWith('aero://downloads')) activePage = 'downloads';
        else if (url.startsWith('aero://settings')) activePage = 'settings';
        else if (url.startsWith('aero://reading-list')) activePage = 'readinglist';
        else if (url.startsWith('aero://search')) activePage = 'search';
        else if (url.startsWith('aero://workspaces')) activePage = 'workspaces';
        else if (url.startsWith('aero://ai-setup')) activePage = 'aisetup';
    }

    document.querySelectorAll('.sidebar-item[data-page]').forEach(el => {
        const page = el.getAttribute('data-page');
        const isSettings = el.classList.contains('settings-trigger');
        const matchPage = isSettings ? 'settings' : page;
        
        if (matchPage === activePage && (!state.activeWorkspace || state.activeWorkspace === 'Default')) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
});

if (window.aeroNative) {
    document.documentElement.classList.add('electron-runtime');
    window.aeroNative.runtime().then(runtime => {
        window.AppState.update(state => {
            state.runtimeEngine = runtime.engine;
            state.nativeShell = runtime.shell;
            state.backendUrl = runtime.backendUrl;
        });
    }).catch(() => {});

    if (window.aeroNative.onDownload) {
        window.aeroNative.onDownload(payload => {
            window.AppState.update(state => {
                const existing = state.downloads.find(download => download.id === payload.id);
                let domain = 'download';
                try {
                    domain = new URL(payload.url).hostname.replace('www.', '');
                } catch {}
                const status = payload.type === 'done'
                    ? (payload.state === 'completed' ? 'completed' : 'failed')
                    : 'downloading';
                const next = {
                    id: payload.id,
                    name: payload.name || 'Download',
                    domain,
                    totalBytes: payload.totalBytes || 0,
                    downloadedBytes: payload.downloadedBytes || 0,
                    speed: payload.speed || 0,
                    status,
                    savePath: payload.savePath,
                    sourceUrl: payload.url,
                    dateStr: 'Just now',
                    fileIconClass: 'hgi-download-01',
                    color: '#1A73E8'
                };
                if (existing) {
                    Object.assign(existing, next);
                } else {
                    state.downloads.unshift(next);
                }
            });
        });
    }

    if (window.aeroNative.onPermission) {
        window.aeroNative.onPermission(payload => {
            if (payload.allowed) return;
            window.AppState.update(state => {
                state.taskLogs.push({
                    text: `Blocked ${payload.permission} permission from ${payload.requestingUrl || 'active page'}`,
                    status: 'warning'
                });
            });
        });
    }

    if (window.aeroNative.onTrackerBlocked) {
        window.aeroNative.onTrackerBlocked(payload => {
            window.AppState.update(state => {
                state.blockedTrackers = (state.blockedTrackers || 0) + 1;
                state.blockedTrackerLog = [
                    payload,
                    ...(state.blockedTrackerLog || [])
                ].slice(0, 250);
            });
        });
    }
}

// Register Custom Web Elements
customElements.define('browser-tabstrip', TabStrip);
customElements.define('browser-omnibox', Omnibox);
customElements.define('browser-sidebar', AISidebar);
customElements.define('browser-viewport', WebViewport);
customElements.define('browser-settings', SettingsPanel);

// Register System Page Elements
customElements.define('browser-settings-page', SettingsPage);
customElements.define('browser-history-page', HistoryPage);
customElements.define('browser-downloads-page', DownloadsPage);
customElements.define('browser-bookmarks-page', BookmarksPage);
customElements.define('browser-reading-list-page', ReadingListPage);
customElements.define('browser-search-page', SearchPage);
customElements.define('browser-workspaces-page', WorkspacesPage);
customElements.define('browser-passwords-page', PasswordsPage);
customElements.define('browser-payments-page', PaymentsPage);
customElements.define('browser-addresses-page', AddressesPage);
customElements.define('browser-tools-page', ToolsPage);
customElements.define('browser-ai-setup-page', AISetupPage);

// Global Window Actions (Minimize, Maximize, Close controls)
document.querySelectorAll('.caption-btn, .win-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const isMin = btn.classList.contains('btn-minimize') || btn.classList.contains('win-min');
        const isMax = btn.classList.contains('btn-maximize') || btn.classList.contains('win-max');
        const isClose = btn.classList.contains('btn-close') || btn.classList.contains('win-close');
        
        if (window.aeroNative) {
            if (isMin) {
                window.aeroNative.minimize();
            } else if (isMax) {
                window.aeroNative.toggleMaximize();
            } else if (isClose) {
                window.aeroNative.close();
            }
        } else {
            // Fallback mock actions when running in a standard web browser
            if (isMin) {
                alert('Minimize Window (Mock Action)');
            } else if (isMax) {
                alert('Maximize Window (Mock Action)');
            } else if (isClose) {
                alert('Close Window (Mock Action)');
            }
        }
    });
});

// Bind Left Sidebar click listeners for static page navigation items
document.querySelectorAll('.sidebar-item[data-page], .sidebar-item.settings-trigger').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page') || (item.classList.contains('settings-trigger') ? 'settings' : null);
        if (!page) return;

        // Update active highlight
        document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        window.AppState.update(state => {
            // Clicking static items resets custom workspace filter so user sees global settings/pages
            state.activeWorkspace = 'Default';

            let url = '';
            let title = '';

            if (page === 'newtab') {
                url = 'https://newtab.internal';
                title = 'New Tab';
            } else if (page === 'history') {
                url = 'aero://history';
                title = 'History';
            } else if (page === 'bookmarks') {
                url = 'aero://bookmarks';
                title = 'Bookmarks';
            } else if (page === 'downloads') {
                url = 'aero://downloads';
                title = 'Downloads';
            } else if (page === 'settings') {
                url = 'aero://settings';
                title = 'Settings';
            } else if (page === 'readinglist') {
                url = 'aero://reading-list';
                title = 'Reading List';
            } else if (page === 'search') {
                url = 'aero://search';
                title = 'Search';
            } else if (page === 'workspaces') {
                url = 'aero://workspaces';
                title = 'Workspaces';
            } else if (page === 'aisetup') {
                url = 'aero://ai-setup';
                title = 'AI Setup';
            }

            if (url) {
                const activeTab = state.tabs.find(t => t.id === state.activeTabId);
                const isSafeToOverride = !activeTab || 
                                         activeTab.url.includes('newtab.internal') || 
                                         activeTab.url === '';
                
                if (isSafeToOverride && activeTab) {
                    activeTab.url = url;
                    activeTab.title = title;
                } else {
                    const newId = `tab-${Date.now()}`;
                    state.tabs.push({
                        id: newId,
                        title: title,
                        url: url,
                        hibernated: false,
                        active: true,
                        workspace: 'Default'
                    });
                    state.activeTabId = newId;
                }
            }
        });
    });
});

// Global hashchange event listener to intercept internal page navigation links
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
        const url = decodeURIComponent(hash.slice(1));
        // Clear the hash without triggering hashchange again
        history.replaceState(null, null, ' ');
        
        if (url) {
            window.AppState.update(state => {
                const activeTab = state.tabs.find(t => t.id === state.activeTabId);
                const isSafeToOverride = !activeTab || 
                                         activeTab.url.includes('newtab.internal') || 
                                         activeTab.url === '';
                
                let title = '';
                if (url.startsWith('aero://') || url.startsWith('browser://')) {
                    const pageName = url.replace('aero://', '').replace('browser://', '').split('/')[0];
                    title = pageName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                } else {
                    try {
                        title = new URL(url).hostname.replace('www.', '');
                    } catch {
                        title = url;
                    }
                }

                if (isSafeToOverride && activeTab) {
                    activeTab.url = url;
                    activeTab.title = title;
                } else {
                    const newId = `tab-${Date.now()}`;
                    state.tabs.push({
                        id: newId,
                        title: title,
                        url: url,
                        hibernated: false,
                        active: true,
                        workspace: 'Default'
                    });
                    state.activeTabId = newId;
                }
            });
        }
    }
});

console.log('Aero Browser Shell Initialized.');
