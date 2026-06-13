// FeaturePopover.js - Extracted from Omnibox.js

export function renderFeaturePopover(state) {
    const tabLayout = state.tabLayout || 'horizontal';
    const showBookmarksBar = state.showBookmarksBar !== false;
    const showLeftSidebar = state.showLeftSidebar !== false;
    const showAiView = state.showAiView === true;
    const memorySaver = state.memorySaver !== false;
    const energySaver = state.energySaver === true;
    const aiProvider = state.aiProvider || 'claude';
    const localVram = state.localVram || 4;
    const theme = state.theme || 'light';

    return `
        <div class="features-dropdown-popover menu-popover-dropdown" style="position: absolute; top: calc(100% + 8px); right: 28px; width: 300px; background: var(--color-viewport-bg); border: 1px solid var(--color-border-light); border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 1000; display: flex; flex-direction: column; overflow: hidden; font-family: var(--font-ui); color: var(--color-text-active); padding: 12px 14px; gap: 8px; text-align: left;">
            
            <div style="font-size: 13px; font-weight: var(--font-weight-semibold); border-bottom: 1px solid var(--color-border-light); padding-bottom: 6px; margin-bottom: 0; display: flex; align-items: center; gap: 10px; color: var(--color-text-active);">
                <i class="hgi-stroke hgi-sliders-horizontal" style="font-size: 15px; color: var(--color-input-focus-border);"></i>
                Quick controls & features
            </div>

            <!-- 1. Interface Customization -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- Bookmarks Bar Toggle -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-sm);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-star" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Bookmarks bar
                    </span>
                    <label class="switch-toggle">
                        <input type="checkbox" id="toggle-bookmarks-bar" ${showBookmarksBar ? 'checked' : ''}>
                        <span class="slider-round"></span>
                    </label>
                </div>

                <!-- Left Sidebar Toggle -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-sm);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-sidebar-left" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Left sidebar
                    </span>
                    <label class="switch-toggle">
                        <input type="checkbox" id="toggle-left-sidebar" ${showLeftSidebar ? 'checked' : ''}>
                        <span class="slider-round"></span>
                    </label>
                </div>

                <!-- Tab Layout Choice -->
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: var(--font-size-sm);">
                    <span style="margin-bottom: 0; display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-grid-view" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Tabs layout
                    </span>
                    <div style="display: flex; background: var(--color-input-bg); border-radius: 8px; padding: 3px; border: 1px solid var(--color-border-light);">
                        <button id="tab-layout-horiz" style="flex: 1; border: none; background: ${tabLayout === 'horizontal' ? 'var(--color-card-bg)' : 'transparent'}; color: var(--color-text-active); font-size: var(--font-size-sm); font-weight: ${tabLayout === 'horizontal' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'}; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; box-shadow: ${tabLayout === 'horizontal' ? 'var(--shadow-sm)' : 'none'};">Horizontal</button>
                        <button id="tab-layout-vert" style="flex: 1; border: none; background: ${tabLayout === 'vertical' ? 'var(--color-card-bg)' : 'transparent'}; color: var(--color-text-active); font-size: var(--font-size-sm); font-weight: ${tabLayout === 'vertical' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'}; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; box-shadow: ${tabLayout === 'vertical' ? 'var(--shadow-sm)' : 'none'};">Vertical</button>
                    </div>
                </div>

                <!-- Browser Theme Choice -->
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: var(--font-size-sm);">
                    <span style="margin-bottom: 0; display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-moon" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Browser theme
                    </span>
                    <div style="display: flex; background: var(--color-input-bg); border-radius: 8px; padding: 3px; border: 1px solid var(--color-border-light);">
                        <button id="theme-btn-light" style="flex: 1; border: none; background: ${theme === 'theme' ? 'var(--color-card-bg)' : 'transparent'}; color: var(--color-text-active); font-size: var(--font-size-sm); font-weight: ${theme === 'light' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'}; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; box-shadow: ${theme === 'light' ? 'var(--shadow-sm)' : 'none'};">Light</button>
                        <button id="theme-btn-dark" style="flex: 1; border: none; background: ${theme === 'dark' ? 'var(--color-card-bg)' : 'transparent'}; color: var(--color-text-active); font-size: var(--font-size-sm); font-weight: ${theme === 'dark' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'}; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; box-shadow: ${theme === 'dark' ? 'var(--shadow-sm)' : 'none'};">Dark</button>
                        <button id="theme-btn-system" style="flex: 1; border: none; background: ${theme === 'system' ? 'var(--color-card-bg)' : 'transparent'}; color: var(--color-text-active); font-size: var(--font-size-sm); font-weight: ${theme === 'system' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'}; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; box-shadow: ${theme === 'system' ? 'var(--shadow-sm)' : 'none'};">System</button>
                    </div>
                </div>

                <!-- Site Settings Action -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-sm);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-sliders-horizontal" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Site settings
                    </span>
                    <button id="quick-site-settings-btn" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); outline: none; border-radius: 6px; padding: 4px 10px; font-size: var(--font-size-sm); color: var(--color-text-active); font-family: var(--font-ui); cursor: pointer; transition: background 0.15s ease;">Manage</button>
                </div>
            </div>

            <div style="border-top: 1px solid var(--color-border-light); margin: 4px 0;"></div>

            <!-- 2. AI & Accessibility Tools -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- AI Inspector Overlay -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-sm);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-view" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Accessibility inspector
                    </span>
                    <label class="switch-toggle">
                        <input type="checkbox" id="toggle-ai-view" ${showAiView ? 'checked' : ''}>
                        <span class="slider-round"></span>
                    </label>
                </div>

                <!-- LLM Provider -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-sm);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-cpu" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Model agent
                    </span>
                    <select id="select-ai-provider" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); outline: none; border-radius: 6px; padding: 4px 8px; font-size: var(--font-size-sm); color: var(--color-text-active); font-family: var(--font-ui); cursor: pointer; transition: border-color 0.15s ease;">
                        <option value="claude" ${aiProvider === 'claude' ? 'selected' : ''}>Claude Sonnet</option>
                        <option value="openai" ${aiProvider === 'openai' ? 'selected' : ''}>OpenAI GPT-4</option>
                        <option value="gemini" ${aiProvider === 'gemini' ? 'selected' : ''}>Gemini Pro</option>
                        <option value="local" ${aiProvider === 'local' ? 'selected' : ''}>Local llama3 (Ollama)</option>
                    </select>
                </div>

                <!-- Local LLM VRAM Allocation -->
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: var(--font-size-sm); margin-top: 2px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 10px;">
                            <i class="hgi-stroke hgi-database" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Local model VRAM
                        </span>
                        <span id="vram-val" style="color: var(--color-input-focus-border); font-weight: var(--font-weight-semibold);">${localVram} GB</span>
                    </div>
                    <div style="padding: 0 4px;">
                        <input type="range" id="vram-slider" min="1" max="16" value="${localVram}" style="width: 100%; height: 4px; border-radius: var(--border-radius-pill); cursor: pointer; accent-color: var(--color-input-focus-border); background: var(--color-border-light); border: none; outline: none; padding: 0; margin: 4px 0; transition: background-color 0.15s ease;">
                    </div>
                </div>
            </div>

            <div style="border-top: 1px solid var(--color-border-light); margin: 4px 0;"></div>

            <!-- 3. System Controls -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- Memory Saver Toggle -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-sm);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-activity-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Memory saver
                    </span>
                    <label class="switch-toggle">
                        <input type="checkbox" id="toggle-mem-saver" ${memorySaver ? 'checked' : ''}>
                        <span class="slider-round"></span>
                    </label>
                </div>

                <!-- Energy Saver Toggle -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-sm);">
                    <span style="display: flex; align-items: center; gap: 10px;">
                        <i class="hgi-stroke hgi-battery-charging" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i> Energy saver
                    </span>
                    <label class="switch-toggle">
                        <input type="checkbox" id="toggle-energy-saver" ${energySaver ? 'checked' : ''}>
                        <span class="slider-round"></span>
                    </label>
                </div>
            </div>

        </div>
    `;
}

export function bindFeaturePopoverEvents(omniboxInstance) {
if (omniboxInstance.state.isFeatureDropdownOpen) {
    // Stop any click inside the features dropdown from bubbling to document
    const featurePopover = omniboxInstance.querySelector('.features-dropdown-popover');
    if (featurePopover) {
        featurePopover.addEventListener('click', (e) => e.stopPropagation());
    }
    const toggleBookmarks = omniboxInstance.querySelector('#toggle-bookmarks-bar');
    if (toggleBookmarks) {
        toggleBookmarks.addEventListener('change', () => {
            window.AppState.update(state => {
                state.showBookmarksBar = toggleBookmarks.checked;
            });
        });
    }

    const toggleLeftSidebar = omniboxInstance.querySelector('#toggle-left-sidebar');
    if (toggleLeftSidebar) {
        toggleLeftSidebar.addEventListener('change', () => {
            window.AppState.update(state => {
                state.showLeftSidebar = toggleLeftSidebar.checked;
            });
        });
    }

    const horizBtn = omniboxInstance.querySelector('#tab-layout-horiz');
    const vertBtn = omniboxInstance.querySelector('#tab-layout-vert');
    if (horizBtn) {
        horizBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.AppState.update(state => {
                state.tabLayout = 'horizontal';
            });
        });
    }
    if (vertBtn) {
        vertBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.AppState.update(state => {
                state.tabLayout = 'vertical';
            });
        });
    }

    const toggleAiView = omniboxInstance.querySelector('#toggle-ai-view');
    if (toggleAiView) {
        toggleAiView.addEventListener('change', () => {
            window.AppState.update(state => {
                state.showAiView = toggleAiView.checked;
            });
        });
    }

    const selectAiProvider = omniboxInstance.querySelector('#select-ai-provider');
    if (selectAiProvider) {
        selectAiProvider.addEventListener('change', () => {
            window.AppState.update(state => {
                state.aiProvider = selectAiProvider.value;
            });
        });
    }

    const vramSlider = omniboxInstance.querySelector('#vram-slider');
    if (vramSlider) {
        vramSlider.addEventListener('input', () => {
            const valEl = omniboxInstance.querySelector('#vram-val');
            if (valEl) {
                valEl.innerText = `${vramSlider.value} GB`;
            }
        });
        vramSlider.addEventListener('change', () => {
            window.AppState.update(state => {
                state.localVram = parseInt(vramSlider.value);
            });
        });
    }

    const toggleMemSaver = omniboxInstance.querySelector('#toggle-mem-saver');
    if (toggleMemSaver) {
        toggleMemSaver.addEventListener('change', () => {
            window.AppState.update(state => {
                state.memorySaver = toggleMemSaver.checked;
            });
        });
    }

    const toggleEnergySaver = omniboxInstance.querySelector('#toggle-energy-saver');
    if (toggleEnergySaver) {
        toggleEnergySaver.addEventListener('change', () => {
            window.AppState.update(state => {
                state.energySaver = toggleEnergySaver.checked;
            });
        });
    }

    const themeLight = omniboxInstance.querySelector('#theme-btn-light');
    const themeDark = omniboxInstance.querySelector('#theme-btn-dark');
    const themeSystem = omniboxInstance.querySelector('#theme-btn-system');

    if (themeLight) {
        themeLight.addEventListener('click', (e) => {
            e.stopPropagation();
            window.AppState.update(state => {
                state.theme = 'light';
            });
        });
    }
    if (themeDark) {
        themeDark.addEventListener('click', (e) => {
            e.stopPropagation();
            window.AppState.update(state => {
                state.theme = 'dark';
            });
        });
    }
    if (themeSystem) {
        themeSystem.addEventListener('click', (e) => {
            e.stopPropagation();
            window.AppState.update(state => {
                state.theme = 'system';
            });
        });
    }

    const quickSiteSettings = omniboxInstance.querySelector('#quick-site-settings-btn');
    if (quickSiteSettings) {
        quickSiteSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            omniboxInstance.setState({ isFeatureDropdownOpen: false });
            omniboxInstance.navigateTabSafely('aero://settings');
        });
    }
}
}
