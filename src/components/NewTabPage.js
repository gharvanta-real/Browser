// NewTabPage.js - Extracted sub-renderer for WebViewport
export function renderNewTabPage(blockedTrackers) {
    return `
        <div class="aero-new-tab" style="padding: 24px var(--spacing-xxl); flex: 1; display: flex; flex-direction: column; justify-content: space-between; max-width: 960px; width: 100%; margin: 0 auto; box-sizing: border-box; color: var(--color-viewport-text);">
            
            <!-- Comet Top Navigation Row (Badge + Categories) -->
            <div class="new-tab-top-row">
                <!-- Left: Tracker Shield Badge -->
                <div class="tracker-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 11 2 2 4-4"></path></svg>
                    ${blockedTrackers} ads and trackers blocked
                </div>
                <!-- Right: Search Categories -->
                <div class="search-categories">
                    <span class="category-item active">Discover</span>
                    <span class="category-item">Finance</span>
                    <span class="category-item">Health</span>
                    <span class="category-item">Academic</span>
                    <span class="category-item">Patents</span>
                </div>
            </div>

            <!-- Centered Search Card Area -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0;">
                <!-- Giant elegant 'aero' logo text -->
                <div style="font-family: 'Outfit', var(--font-ui); font-size: 44px; font-weight: 500; letter-spacing: -1.5px; color: var(--color-viewport-text); margin-bottom: 24px; user-select: none;">aero</div>
                
                <div class="comet-search-card" style="margin: 0; width: 100%;">
                    <textarea class="comet-search-textarea" placeholder="Type / for search modes"></textarea>
                    
                    <div class="comet-search-toolbar">
                        <div class="comet-toolbar-left">
                            <button class="comet-icon-btn" title="Add context">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <button class="comet-search-pill">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                Search
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <button class="comet-search-pill">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                Computer
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                        </div>
                        <div class="comet-toolbar-right">
                            <button class="comet-model-pill">
                                Model
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            <button class="comet-icon-btn" title="Voice search">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                            </button>
                            <button class="comet-submit-btn">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Customizations Button -->
            <div class="new-tab-bottom-row" style="display: flex; justify-content: flex-end; padding-top: var(--spacing-md); border-top: 1px solid var(--color-border-light);">
                <button class="comet-customize-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                    Customize
                </button>
            </div>
        </div>
    `;
}

export function bindNewTabPageEvents(viewportInstance) {
    const newTabSearch = viewportInstance.querySelector('.comet-search-textarea');
    const newTabSubmit = viewportInstance.querySelector('.comet-submit-btn');
    const runNewTabSearch = () => {
        const value = newTabSearch?.value?.trim();
        if (!value) return;
        viewportInstance.navigateFromViewport(
            viewportInstance.resolveInput(value).url, 
            viewportInstance.resolveInput(value)
        );
    };
    if (newTabSearch) {
        newTabSearch.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                runNewTabSearch();
            }
        });
    }
    if (newTabSubmit) {
        newTabSubmit.addEventListener('click', runNewTabSearch);
    }
}
