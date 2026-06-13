// MenuPopover.js - Extracted from Omnibox.js

export function renderMenuPopover(state) {
    const zoom = state.zoomLevel || 100;
    return `
        <div class="menu-popover-dropdown" style="position: absolute; top: calc(100% + 8px); right: 0; width: 310px; background: var(--color-viewport-bg); border: 1px solid var(--color-border-light); border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 1000; display: flex; flex-direction: column; overflow: hidden; font-family: var(--font-ui); color: var(--color-text-active); padding: 12px 10px; gap: 4px; text-align: left;">
            
            <!-- Promo Item -->
            <div class="menu-action-row" data-action="default-browser" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast); color: var(--color-input-focus-border); font-weight: var(--font-weight-semibold);">
                <i class="hgi-stroke hgi-sparkles" style="font-size: 15px; color: var(--color-input-focus-border);"></i>
                Set Aero as default browser
            </div>

            <div style="border-top: 1px solid var(--color-border-light); margin: 4px 6px;"></div>

            <!-- Group 1: New Tabs & Windows -->
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <div class="menu-action-row" data-url="https://newtab.internal" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-home-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        New tab
                    </span>
                    <span style="font-size: 9px; color: var(--color-text-muted); font-family: var(--font-code);">Ctrl+T</span>
                </div>
                <div class="menu-action-row" data-action="new-window" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-globe" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        New window
                    </span>
                    <span style="font-size: 9px; color: var(--color-text-muted); font-family: var(--font-code);">Ctrl+N</span>
                </div>
                <div class="menu-action-row" data-action="new-incognito" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-view-off" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        New Incognito window
                    </span>
                    <span style="font-size: 9px; color: var(--color-text-muted); font-family: var(--font-code); white-space: nowrap;">Ctrl+Shift+N</span>
                </div>
            </div>

            <div style="border-top: 1px solid var(--color-border-light); margin: 4px 6px;"></div>

            <!-- Group 2: Browsing & History -->
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <div class="menu-action-row" data-url="aero://history" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-clock-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        History
                    </span>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 11px; color: var(--color-text-muted); opacity: 0.7;"></i>
                </div>
                <div class="menu-action-row" data-url="aero://downloads" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-download-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        Downloads
                    </span>
                    <span style="font-size: 9px; color: var(--color-text-muted); font-family: var(--font-code);">Ctrl+J</span>
                </div>
                <div class="menu-action-row" data-url="aero://bookmarks" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-star" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        Bookmarks
                    </span>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 11px; color: var(--color-text-muted); opacity: 0.7;"></i>
                </div>
                <div class="menu-action-row" data-action="tab-groups" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-grid-view" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        Tab groups
                    </span>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 11px; color: var(--color-text-muted); opacity: 0.7;"></i>
                </div>
                <div class="menu-action-row" data-url="aero://tools" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-cpu" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        Extensions
                    </span>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 11px; color: var(--color-text-muted); opacity: 0.7;"></i>
                </div>
                <div class="menu-action-row" data-action="delete-browsing-data" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-delete-02" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        Delete browsing data...
                    </span>
                    <span style="font-size: 9px; color: var(--color-text-muted); font-family: var(--font-code); white-space: nowrap;">Ctrl+Shift+Del</span>
                </div>
            </div>

            <div style="border-top: 1px solid var(--color-border-light); margin: 4px 6px;"></div>

            <!-- Group 3: Zoom Controls -->
            <div class="menu-zoom-row" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; font-size: var(--font-size-sm);">
                <span style="display: flex; align-items: center; gap: 10px; font-weight: var(--font-weight-medium);">
                    <i class="hgi-stroke hgi-search-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                    Zoom
                </span>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="display: flex; align-items: center; background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 8px; padding: 2px;">
                        <button class="zoom-btn zoom-out" style="background: transparent; border: none; font-size: 14px; cursor: pointer; color: var(--color-text-active); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: bold; transition: background 0.15s ease;">-</button>
                        <span class="zoom-level" style="font-size: 11px; font-weight: var(--font-weight-semibold); min-width: 38px; text-align: center; color: var(--color-text-active);">${zoom}%</span>
                        <button class="zoom-btn zoom-in" style="background: transparent; border: none; font-size: 14px; cursor: pointer; color: var(--color-text-active); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: bold; transition: background 0.15s ease;">+</button>
                    </div>
                    <button class="fullscreen-btn" title="Fullscreen" style="background: transparent; border: 1px solid var(--color-border-light); border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-text-active); transition: all 0.15s ease;">
                        <i class="hgi-stroke hgi-view" style="font-size: 14px; color: var(--color-text-inactive);"></i>
                    </button>
                </div>
            </div>

            <div style="border-top: 1px solid var(--color-border-light); margin: 4px 6px;"></div>

            <!-- Group 4: Utilities -->
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <div class="menu-action-row" data-action="print" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-document-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        Print...
                    </span>
                    <span style="font-size: 9px; color: var(--color-text-muted); font-family: var(--font-code);">Ctrl+P</span>
                </div>
                <div class="menu-action-row" data-action="find-edit" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-search-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        Find and edit
                    </span>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 11px; color: var(--color-text-muted); opacity: 0.7;"></i>
                </div>
                <div class="menu-action-row" data-action="cast-share" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-share-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        Cast, save, and share
                    </span>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 11px; color: var(--color-text-muted); opacity: 0.7;"></i>
                </div>
                <div class="menu-action-row" data-action="more-tools" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-settings-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                        More tools
                    </span>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 11px; color: var(--color-text-muted); opacity: 0.7;"></i>
                </div>
            </div>

            <div style="border-top: 1px solid var(--color-border-light); margin: 4px 6px;"></div>

            <!-- Group 5: Footer/Settings -->
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <div class="menu-action-row" data-action="about-aero" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-alert-circle" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                    About Aero
                </div>
                <div class="menu-action-row" data-action="customize-aero" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-pencil-edit" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                    Customize Aero
                </div>
                <div class="menu-action-row" data-url="aero://settings" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-settings-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                    Settings
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
                } else if (action === 'new-window') {
                    alert("New Browser Window opened (Mock Action)");
                } else if (action === 'new-incognito') {
                    alert("New Incognito Window opened (Mock Action)");
                } else if (action === 'delete-browsing-data') {
                    alert("Browsing Data Manager launched (Mock Action)");
                } else if (action === 'tab-groups') {
                    alert("Tab Groups manager opened (Mock Action)");
                } else if (action === 'print') {
                    alert("Print dialog opened (Mock Action)");
                } else if (action === 'find-edit') {
                    alert("Find in Page opened (Mock Action)");
                } else if (action === 'cast-share') {
                    alert("Cast, save, and share menu opened (Mock Action)");
                } else if (action === 'more-tools') {
                    alert("More Tools submenu opened (Mock Action)");
                } else if (action === 'customize-aero') {
                    alert("Aero Customizer loaded (Mock Action)");
                } else if (action === 'default-browser') {
                    alert("Aero is now set as your default browser!");
                } else if (action === 'about-aero') {
                    alert("Aero Browser v0.1.0 (Pre-production release)");
                }
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
    }
}
