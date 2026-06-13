// Click catcher and focus tracker engine for guest webview click detection
(() => {
    let clickCatcher = null;

    function updateClickCatcher() {
        const ebpDropdown = document.querySelector('.ebp-folder-dropdown');
        const isEbpDropdownOpen = ebpDropdown && ebpDropdown.style.display === 'flex';

        // Find if any dropdown, context menu, suggestions overlay, or popup folder select is open
        const isMenuOpen = 
            document.querySelector('.bookmark-folder-dropdown') ||
            document.querySelector('.aero-context-menu') ||
            document.querySelector('.menu-popover-dropdown') ||
            document.querySelector('.profile-dropdown-popover') ||
            document.querySelector('.features-dropdown-popover') ||
            document.querySelector('.ai-dropdown-popover') ||
            isEbpDropdownOpen ||
            document.querySelector('.omnibox-dropdown.visible');

        const viewport = document.querySelector('.chromium-webview-stack');
        if (!viewport) return;

        if (isMenuOpen) {
            if (!clickCatcher) {
                clickCatcher = document.createElement('div');
                clickCatcher.className = 'aero-webview-click-catcher';
                
                const dismissHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Dispatch document level events to trigger existing click/mousedown outside handlers
                    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    
                    // Force clean up elements
                    document.querySelectorAll('.bookmark-folder-dropdown').forEach(el => el.remove());
                    document.querySelectorAll('.aero-context-menu').forEach(el => el.remove());
                    
                    const omnibox = document.getElementById('browser-nav');
                    if (omnibox && typeof omnibox.setState === 'function') {
                        omnibox.setState({ isMenuOpen: false, isFeatureDropdownOpen: false, isProfileOpen: false });
                        omnibox.isFocused = false;
                        const overlay = omnibox.querySelector('#suggestions-overlay');
                        if (overlay) overlay.classList.remove('visible');
                    }
                    
                    const aiSidebar = document.getElementById('ai-sidebar');
                    if (aiSidebar && typeof aiSidebar.setState === 'function') {
                        aiSidebar.setState({ isMoreMenuOpen: false });
                    }

                    const folderDropdown = document.querySelector('.ebp-folder-dropdown');
                    if (folderDropdown) {
                        folderDropdown.style.display = 'none';
                    }

                    if (clickCatcher && clickCatcher.parentNode) {
                        clickCatcher.parentNode.removeChild(clickCatcher);
                    }
                    clickCatcher = null;
                };

                clickCatcher.addEventListener('mousedown', dismissHandler);
                clickCatcher.addEventListener('click', dismissHandler);
                viewport.appendChild(clickCatcher);
            }
        } else {
            if (clickCatcher) {
                if (clickCatcher.parentNode) {
                    clickCatcher.parentNode.removeChild(clickCatcher);
                }
                clickCatcher = null;
            }
        }
    }

    // Monitor DOM mutations for dropdown/context-menu additions/removals
    const observer = new MutationObserver(() => {
        updateClickCatcher();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });

    // Capture focusin on webviews to dismiss menus instantly when clicked
    document.addEventListener('focusin', (e) => {
        if (e.target && e.target.tagName === 'WEBVIEW') {
            document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            
            if (clickCatcher && clickCatcher.parentNode) {
                clickCatcher.parentNode.removeChild(clickCatcher);
            }
            clickCatcher = null;
        }
    }, true);
})();
