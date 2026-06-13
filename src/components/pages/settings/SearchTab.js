// SearchTab.js - Extracted from SettingsPage.js

export function renderSearchTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    return `
                    <div class="settings-section">
                        <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Search</h3>
                        
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: var(--spacing-xl);">
                            
                            <!-- Search Engine Select -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Default Search Engine Google Bing DuckDuckGo')}">
                                <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                                    <i class="hgi-stroke hgi-search-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Search engine used in the address bar</span>
                                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Choose your default provider for web searches.</span>
                                    </div>
                                </div>
                                <select id="search-engine-select" style="${selectStyle}">
                                    <option value="Google" ${state.searchEngine === 'Google' ? 'selected' : ''}>Google</option>
                                    <option value="Bing" ${state.searchEngine === 'Bing' ? 'selected' : ''}>Bing</option>
                                    <option value="DuckDuckGo" ${state.searchEngine === 'DuckDuckGo' ? 'selected' : ''}>DuckDuckGo</option>
                                </select>
                            </div>

                        </div>

                        <h4 style="margin: 0 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Search Suggestions</h4>
                        <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                            
                            <!-- Toggle suggestions as you type -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Show search and site suggestions as you type')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show search and site suggestions as you type</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Uses your search engine to show matching suggestions.</span>
                                </div>
                                ${renderToggle('search-suggestions-toggle', state.showSearchSuggestions)}
                            </div>

                            <!-- Toggle search history suggestions -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Show search history suggestions')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Show search history suggestions</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Matches queries against your previous searches.</span>
                                </div>
                                ${renderToggle('search-history-toggle', state.showSearchHistory)}
                            </div>

                            <!-- Toggle autocomplete matching for internal pages -->
                            <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Enable autocomplete matching for internal pages')}">
                                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Enable autocomplete matching for internal pages</span>
                                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Include bookmarks, history and local settings in address bar autocomplete.</span>
                                </div>
                                ${renderToggle('search-autocomplete-toggle', state.showSearchAutocomplete)}
                            </div>

                        </div>
                    </div>
                
    `;
}

export function bindSearchTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'search') return;
    
    const searchSelect = settingsPage.querySelector('#search-engine-select');
    if (searchSelect) {
        searchSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(state => {
                state.searchEngine = val;
            });
        });
    }

    const suggsToggle = settingsPage.querySelector('#search-suggestions-toggle');
    if (suggsToggle) {
        suggsToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.showSearchSuggestions = checked;
            });
        });
    }

    const histToggle = settingsPage.querySelector('#search-history-toggle');
    if (histToggle) {
        histToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.showSearchHistory = checked;
            });
        });
    }

    const autoToggle = settingsPage.querySelector('#search-autocomplete-toggle');
    if (autoToggle) {
        autoToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(state => {
                state.showSearchAutocomplete = checked;
            });
        });
    }
}
