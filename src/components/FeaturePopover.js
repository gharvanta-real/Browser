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

    return `
        <div class="features-dropdown-popover menu-popover-dropdown" style="position: absolute; top: calc(100% + 8px); right: 28px; width: 280px; background: var(--color-viewport-bg); border: 1px solid var(--color-border-light); border-radius: 12px; box-shadow: var(--shadow-lg); z-index: 1000; display: flex; flex-direction: column; overflow: hidden; font-family: var(--font-ui); color: var(--color-text-active); padding: var(--spacing-sm) var(--spacing-md); gap: var(--spacing-md); text-align: left;">
            
            <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); border-bottom: 1px solid var(--color-viewport-border); padding-bottom: var(--spacing-xs); margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                <i class="hgi-stroke hgi-sliders-horizontal" style="font-size: 14px; color: var(--color-input-focus-border);"></i>
                Quick Controls & Features
            </div>

            <!-- 1. Interface Customization -->
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                <!-- Bookmarks Bar Toggle -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-xs);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-sm); font-weight: var(--font-weight-medium);">
                        <i class="hgi-stroke hgi-star" style="font-size: 14px;"></i> Bookmarks Bar
                    </span>
                    <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0;">
                        <input type="checkbox" id="toggle-bookmarks-bar" ${showBookmarksBar ? 'checked' : ''}>
                        <span class="slider-round"></span>
                    </label>
                </div>

                <!-- Left Sidebar Toggle -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-xs);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-sm); font-weight: var(--font-weight-medium);">
                        <i class="hgi-stroke hgi-sidebar-left" style="font-size: 14px;"></i> Left Sidebar
                    </span>
                    <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0;">
                        <input type="checkbox" id="toggle-left-sidebar" ${showLeftSidebar ? 'checked' : ''}>
                        <span class="slider-round"></span>
                    </label>
                </div>

                <!-- Tab Layout Choice -->
                <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs); font-size: var(--font-size-xs);">
                    <span style="font-weight: var(--font-weight-medium); margin-bottom: 2px; display: flex; align-items: center; gap: var(--spacing-sm);">
                        <i class="hgi-stroke hgi-grid-view" style="font-size: 14px;"></i> Tabs Layout
                    </span>
                    <div style="display: flex; background: var(--color-input-bg); border-radius: 6px; padding: 2px; border: 1px solid var(--color-border-light);">
                        <button id="tab-layout-horiz" style="flex: 1; border: none; background: ${tabLayout === 'horizontal' ? 'var(--color-card-bg)' : 'transparent'}; color: var(--color-text-active); font-size: 10px; font-weight: ${tabLayout === 'horizontal' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'}; padding: 4px; border-radius: 4px; cursor: pointer; box-shadow: ${tabLayout === 'horizontal' ? 'var(--shadow-sm)' : 'none'};">Horizontal</button>
                        <button id="tab-layout-vert" style="flex: 1; border: none; background: ${tabLayout === 'vertical' ? 'var(--color-card-bg)' : 'transparent'}; color: var(--color-text-active); font-size: 10px; font-weight: ${tabLayout === 'vertical' ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'}; padding: 4px; border-radius: 4px; cursor: pointer; box-shadow: ${tabLayout === 'vertical' ? 'var(--shadow-sm)' : 'none'};">Vertical</button>
                    </div>
                </div>
            </div>

            <div style="border-top: 1px solid var(--color-viewport-border); margin: 2px 0;"></div>

            <!-- 2. AI & Accessibility Tools -->
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                <!-- AI Inspector Overlay -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-xs);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-sm); font-weight: var(--font-weight-medium);">
                        <i class="hgi-stroke hgi-view" style="font-size: 14px;"></i> Accessibility Inspector
                    </span>
                    <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0;">
                        <input type="checkbox" id="toggle-ai-view" ${showAiView ? 'checked' : ''}>
                        <span class="slider-round"></span>
                    </label>
                </div>

                <!-- LLM Provider -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-xs);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-sm); font-weight: var(--font-weight-medium);">
                        <i class="hgi-stroke hgi-cpu" style="font-size: 14px;"></i> Model Agent
                    </span>
                    <select id="select-ai-provider" style="background: var(--color-input-bg); border: none; outline: none; border-radius: 4px; padding: 2px 6px; font-size: 10px; color: var(--color-text-active); font-family: var(--font-ui); cursor: pointer;">
                        <option value="claude" ${aiProvider === 'claude' ? 'selected' : ''}>Claude Sonnet</option>
                        <option value="openai" ${aiProvider === 'openai' ? 'selected' : ''}>OpenAI GPT-4</option>
                        <option value="gemini" ${aiProvider === 'gemini' ? 'selected' : ''}>Gemini Pro</option>
                        <option value="local" ${aiProvider === 'local' ? 'selected' : ''}>Local llama3 (Ollama)</option>
                    </select>
                </div>

                <!-- Local LLM VRAM Allocation -->
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: var(--font-size-xs);">
                    <div style="display: flex; justify-content: space-between; font-weight: var(--font-weight-medium);">
                        <span>Local Model VRAM</span>
                        <span id="vram-val" style="color: var(--color-input-focus-border); font-weight: var(--font-weight-semibold);">${localVram} GB</span>
                    </div>
                    <input type="range" id="vram-slider" min="1" max="16" value="${localVram}" style="width: 100%; height: 4px; border-radius: 2px; cursor: pointer; accent-color: var(--color-input-focus-border); background: var(--color-border-hover); border: none; outline: none; padding: 0; margin: 4px 0;">
                </div>
            </div>

            <div style="border-top: 1px solid var(--color-viewport-border); margin: 2px 0;"></div>

            <!-- 3. System Controls -->
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                <!-- Memory Saver Toggle -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-xs);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-sm); font-weight: var(--font-weight-medium);">
                        <i class="hgi-stroke hgi-activity-01" style="font-size: 14px;"></i> Memory Saver
                    </span>
                    <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0;">
                        <input type="checkbox" id="toggle-mem-saver" ${memorySaver ? 'checked' : ''}>
                        <span class="slider-round"></span>
                    </label>
                </div>

                <!-- Energy Saver Toggle -->
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--font-size-xs);">
                    <span style="display: flex; align-items: center; gap: var(--spacing-sm); font-weight: var(--font-weight-medium);">
                        <i class="hgi-stroke hgi-battery-charging" style="font-size: 14px;"></i> Energy Saver
                    </span>
                    <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; flex-shrink: 0;">
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
}
}
