// MenuPopover.js - Extracted from Omnibox.js

export function renderMenuPopover(state) {
    const zoom = state.zoomLevel || 100;
    const showBookmarksBar = window.AppState.showBookmarksBar !== false;
    return `
        <div class="menu-popover-dropdown" style="position: absolute; top: calc(100% + 8px); right: 0; width: 300px; background: var(--color-viewport-bg); border: 1px solid var(--color-border-light); border-radius: 12px; box-shadow: var(--shadow-lg); z-index: 1000; display: flex; flex-direction: column; overflow: hidden; font-family: var(--font-ui); color: var(--color-text-active); padding: var(--spacing-sm) 0;">
            
            <!-- Profile Header -->
            <div class="menu-profile-header" style="display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--color-viewport-border); text-align: left;">
                <div class="profile-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: var(--color-input-focus-border); color: #FFFFFF; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; user-select: none;">A</div>
                <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); line-height: 1.2; color: var(--color-text-active);">Alex Morgan</span>
                    <span style="font-size: 9px; color: var(--color-text-inactive); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">alex.morgan@aero.com</span>
                    <span style="font-size: 8px; color: #188038; display: flex; align-items: center; gap: 3px; font-weight: var(--font-weight-semibold); margin-top: 1px;">
                        <span style="width: 4px; height: 4px; border-radius: 50%; background: #188038;"></span> Synced to Cloud
                    </span>
                </div>
            </div>

            <!-- Shortcuts Grid (Passwords, Payments, Addresses, Tools) -->
            <div class="menu-shortcuts-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--color-viewport-border); text-align: center;">
                <div class="menu-shortcut-item" data-action="passwords" style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 6px 0; border-radius: 6px; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-lock" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                    <span style="font-size: 9px; color: var(--color-text-inactive);">Passwords</span>
                </div>
                <div class="menu-shortcut-item" data-action="payments" style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 6px 0; border-radius: 6px; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-credit-card" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                    <span style="font-size: 9px; color: var(--color-text-inactive);">Payments</span>
                </div>
                <div class="menu-shortcut-item" data-action="addresses" style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 6px 0; border-radius: 6px; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-location-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                    <span style="font-size: 9px; color: var(--color-text-inactive);">Addresses</span>
                </div>
                <div class="menu-shortcut-item" data-action="tools" style="display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 6px 0; border-radius: 6px; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-settings-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                    <span style="font-size: 9px; color: var(--color-text-inactive);">Tools</span>
                </div>
            </div>

            <!-- Action List (New Tab, New Window, History, Bookmarks, Downloads, Settings) -->
            <div class="menu-action-list" style="display: flex; flex-direction: column; gap: 2px; padding: var(--spacing-xs) var(--spacing-sm); border-bottom: 1px solid var(--color-viewport-border); text-align: left;">
                <div class="menu-action-row" data-url="https://newtab.internal" style="display: flex; align-items: center; justify-content: space-between; padding: 6px var(--spacing-md); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-md);"><i class="hgi-stroke hgi-home-01" style="font-size: 14px;"></i> New Tab</span>
                    <span style="font-size: 9px; color: var(--color-text-inactive); font-family: monospace;">Ctrl+T</span>
                </div>
                <div class="menu-action-row" data-action="new-window" style="display: flex; align-items: center; justify-content: space-between; padding: 6px var(--spacing-md); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-md);"><i class="hgi-stroke hgi-globe" style="font-size: 14px;"></i> New Window</span>
                    <span style="font-size: 9px; color: var(--color-text-inactive); font-family: monospace;">Ctrl+N</span>
                </div>
                <div style="border-top: 1px solid var(--color-viewport-border); margin: 4px var(--spacing-md);"></div>
                <div class="menu-action-row" data-url="aero://history" style="display: flex; align-items: center; justify-content: space-between; padding: 6px var(--spacing-md); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-md);"><i class="hgi-stroke hgi-clock-01" style="font-size: 14px;"></i> History</span>
                    <span style="font-size: 9px; color: var(--color-text-inactive); font-family: monospace;">Ctrl+H</span>
                </div>
                <div class="menu-action-row" data-url="aero://bookmarks" style="display: flex; align-items: center; justify-content: space-between; padding: 6px var(--spacing-md); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-md);"><i class="hgi-stroke hgi-star" style="font-size: 14px;"></i> Bookmarks</span>
                    <span style="font-size: 9px; color: var(--color-text-inactive); font-family: monospace;">Ctrl+Shift+O</span>
                </div>
                <div class="menu-toggle-row" style="display: flex; align-items: center; justify-content: space-between; padding: 6px var(--spacing-md); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-md);"><i class="hgi-stroke hgi-eye" style="font-size: 14px; color: var(--color-text-inactive);"></i> Show Bookmarks Bar</span>
                    <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0; cursor: pointer;">
                        <input type="checkbox" id="menu-toggle-bookmarks-bar" ${showBookmarksBar ? 'checked' : ''}>
                        <span class="slider-round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 34px; transition: .4s;"></span>
                    </label>
                </div>

                <div class="menu-action-row" data-url="aero://reading-list" style="display: flex; align-items: center; justify-content: space-between; padding: 6px var(--spacing-md); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-md);"><i class="hgi-stroke hgi-book-open-01" style="font-size: 14px;"></i> Reading List</span>
                    <span style="font-size: 9px; color: var(--color-text-inactive); font-family: monospace;">Ctrl+Shift+R</span>
                </div>
                <div class="menu-action-row" data-url="aero://downloads" style="display: flex; align-items: center; justify-content: space-between; padding: 6px var(--spacing-md); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-md);"><i class="hgi-stroke hgi-download-01" style="font-size: 14px;"></i> Downloads</span>
                    <span style="font-size: 9px; color: var(--color-text-inactive); font-family: monospace;">Ctrl+J</span>
                </div>
            </div>

            <!-- Zoom Controls -->
            <div class="menu-zoom-row" style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-sm) var(--spacing-md); border-bottom: 1px solid var(--color-viewport-border); font-size: var(--font-size-xs);">
                <span>Zoom</span>
                <div style="display: flex; align-items: center; gap: 8px; background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: 2px;">
                    <button class="zoom-btn zoom-out" style="background: transparent; border: none; font-size: 12px; cursor: pointer; color: var(--color-text-active); width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-weight: bold;">-</button>
                    <span class="zoom-level" style="font-size: 10px; font-weight: var(--font-weight-semibold); min-width: 32px; text-align: center;">${zoom}%</span>
                    <button class="zoom-btn zoom-in" style="background: transparent; border: none; font-size: 12px; cursor: pointer; color: var(--color-text-active); width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-weight: bold;">+</button>
                </div>
                <button class="fullscreen-btn" title="Fullscreen" style="background: transparent; border: 1px solid var(--color-border-light); border-radius: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-text-active);">
                    <i class="hgi-stroke hgi-globe" style="font-size: 12px;"></i>
                </button>
            </div>

            <!-- Bottom Footer (Settings, Help) -->
            <div class="menu-footer" style="display: flex; flex-direction: column; gap: 2px; padding: var(--spacing-xs) var(--spacing-sm); text-align: left;">
                <div class="menu-action-row" data-url="aero://settings" style="display: flex; align-items: center; gap: var(--spacing-md); padding: 6px var(--spacing-md); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); cursor: pointer; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-settings-01" style="font-size: 14px;"></i> Settings
                </div>
                <div class="menu-action-row" data-action="help" style="display: flex; align-items: center; gap: var(--spacing-md); padding: 6px var(--spacing-md); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); cursor: pointer; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-user" style="font-size: 14px;"></i> Help & Feedback
                </div>
            </div>

        </div>
    `;
}

export function bindMenuPopoverEvents(omniboxInstance) {
if (omniboxInstance.state.isMenuOpen) {
    // Stop any click inside the menu from bubbling to document (would close the menu)
    const menuPopover = omniboxInstance.querySelector('.menu-popover-dropdown');
    if (menuPopover) {
        menuPopover.addEventListener('click', (e) => e.stopPropagation());
    }
    omniboxInstance.querySelectorAll('.menu-action-row').forEach(row => {
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = row.getAttribute('data-url');
            const action = row.getAttribute('data-action');
            
            omniboxInstance.setState({ isMenuOpen: false });
            
            if (url) {
                omniboxInstance.navigateTabSafely(url);
            } else if (action === 'help') {
                alert("Help & Feedback successfully launched!");
            } else if (action === 'new-window') {
                alert("New Browser Window opened (Mock Action)");
            }
        });
    });

    omniboxInstance.querySelectorAll('.menu-shortcut-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.getAttribute('data-action');
            omniboxInstance.setState({ isMenuOpen: false });
            omniboxInstance.navigateTabSafely(`aero://${action}`);
        });
    });

    const zoomInBtn = omniboxInstance.querySelector('.zoom-in');
    const zoomOutBtn = omniboxInstance.querySelector('.zoom-out');
    const fullscreenBtn = omniboxInstance.querySelector('.fullscreen-btn');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.AppState.update(state => {
                state.zoomLevel = Math.min(200, (state.zoomLevel || 100) + 10);
            });
        });
    }
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.AppState.update(state => {
                state.zoomLevel = Math.max(50, (state.zoomLevel || 100) - 10);
            });
        });
    }
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            omniboxInstance.setState({ isMenuOpen: false });
            alert("Fullscreen Mode (Mock Action)");
        });
    }

    const toggleBookmarksMenu = omniboxInstance.querySelector('#menu-toggle-bookmarks-bar');
    if (toggleBookmarksMenu) {
        toggleBookmarksMenu.addEventListener('change', () => {
            window.AppState.update(state => {
                state.showBookmarksBar = toggleBookmarksMenu.checked;
            });
        });
    }

    const toggleRow = omniboxInstance.querySelector('.menu-toggle-row');
    if (toggleRow) {
        toggleRow.addEventListener('click', (e) => {
            e.stopPropagation(); // Always stop so menu stays open when toggling
            const label = toggleRow.querySelector('.switch-toggle');
            if (label && (e.target === label || label.contains(e.target))) {
                // Let the label's native behavior handle the input click and trigger change event
                return;
            }
            if (toggleBookmarksMenu) {
                toggleBookmarksMenu.checked = !toggleBookmarksMenu.checked;
                window.AppState.update(state => {
                    state.showBookmarksBar = toggleBookmarksMenu.checked;
                });
            }
        });
        toggleRow.addEventListener('mouseenter', () => {
            toggleRow.style.background = 'var(--color-hover-bg)';
        });
        toggleRow.addEventListener('mouseleave', () => {
            toggleRow.style.background = 'transparent';
        });
    }
}
}
