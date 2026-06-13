import { BaseComponent } from '../BaseComponent.js';

export class ToolsPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            searchQuery: '',
            extensions: [
                { id: 1, name: 'Aero AdBlocker Pro', version: '2.4.1', author: 'Aero Labs', description: 'Blocks intrusive ads, popups, and tracker scripts across the web for distraction-free browsing.', enabled: true, iconBg: '#EA4335', iconText: 'AD' },
                { id: 2, name: 'Dark Reader', version: '4.9.62', author: 'Dark Reader Inc.', description: 'Generates clean dark mode themes for every website dynamically to protect your eyes.', enabled: true, iconBg: '#A259FF', iconText: 'DR' },
                { id: 3, name: 'MetaMask Wallet', version: '10.35.0', author: 'ConsenSys', description: 'Interact with Ethereum-based decentralized applications (DApps) and manage web3 assets.', enabled: false, iconBg: '#FF7262', iconText: 'MM' },
                { id: 4, name: 'JSON Formatter & Validator', version: '1.2.0', author: 'DevTools Suite', description: 'Beautifies raw JSON responses directly in browser viewport with syntax highlighting.', enabled: true, iconBg: '#0ACF83', iconText: 'JS' }
            ],
            devMode: true,
            terminalLogs: [
                { type: 'info', text: 'Aero V8 Core initialized successfully.' },
                { type: 'info', text: 'Sandboxed V8 Execution Environment running.' },
                { type: 'warning', text: 'Slow SW registration detected for background sync.' },
                { type: 'error', text: 'Service Worker failed to load from cache. Falling back to network...' }
            ],
            cmdInput: '',
            showAddExtensionForm: false,
            newExtName: '',
            newExtDesc: ''
        };
    }

    template() {
        const query = this.state.searchQuery.toLowerCase().trim();
        const filteredExtensions = this.state.extensions.filter(ext =>
            ext.name.toLowerCase().includes(query) || ext.description.toLowerCase().includes(query)
        );

        // Extensions listing HTML
        const extHtml = filteredExtensions.map(ext => `
            <div class="settings-item-row" style="display: flex; align-items: flex-start; justify-content: space-between; padding: var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); gap: var(--spacing-md); transition: background var(--transition-fast);">
                <div style="display: flex; gap: var(--spacing-md); flex: 1; min-width: 0;">
                    <!-- Extension Icon -->
                    <div style="width: 40px; height: 40px; border-radius: 8px; background: ${ext.iconBg}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: var(--font-size-md); box-shadow: var(--shadow-sm);">
                        ${ext.iconText}
                    </div>
                    <!-- Details -->
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs); min-width: 0;">
                        <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex-wrap: wrap;">
                            <span style="font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">${ext.name}</span>
                            <span style="font-size: 10px; color: var(--color-viewport-text-muted); background: var(--color-hover-bg); padding: 2px 6px; border-radius: 4px;">v${ext.version}</span>
                            <span style="font-size: 10px; color: var(--color-viewport-text-muted);">by ${ext.author}</span>
                        </div>
                        <p style="margin: 0; font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); line-height: var(--line-height-normal);">${ext.description}</p>
                    </div>
                </div>

                <!-- Toggles & Actions -->
                <div style="display: flex; align-items: center; gap: var(--spacing-md); flex-shrink: 0;">
                    <!-- Enable switch -->
                    <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px; cursor: pointer;">
                        <input type="checkbox" class="toggle-ext-btn" data-id="${ext.id}" ${ext.enabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                        <span class="slider-round" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${ext.enabled ? 'var(--color-input-focus-border)' : 'var(--color-border-dark)'}; transition: .3s; border-radius: 34px; display: flex; align-items: center;">
                            <span style="display: block; width: 14px; height: 14px; background: #FFFFFF; border-radius: 50%; transition: .3s; transform: ${ext.enabled ? 'translateX(16px)' : 'translateX(4px)'};"></span>
                        </span>
                    </label>

                    <!-- Remove -->
                    <button class="action-btn delete-ext-btn" data-id="${ext.id}" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive);" title="Uninstall Extension">
                        <i class="hgi-stroke hgi-cancel-01" style="font-size: 14px; pointer-events: none; color: #E81123;"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const emptyExtensions = filteredExtensions.length === 0 ? `
            <div style="text-align: center; padding: 48px var(--spacing-md); color: var(--color-viewport-text-muted);">
                <i class="hgi-stroke hgi-puzzle" style="font-size: 32px; opacity: 0.5; margin-bottom: var(--spacing-sm);"></i>
                <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No extensions matched your query</div>
            </div>
        ` : '';

        // Terminal logs HTML
        const terminalHtml = this.state.terminalLogs.map(log => {
            let color = '#C5C8C6'; // Default terminal light gray
            let icon = '▶';
            if (log.type === 'error') {
                color = '#CC6666';
                icon = '✗';
            } else if (log.type === 'warning') {
                color = '#F0C674';
                icon = '⚠';
            } else if (log.type === 'success') {
                color = '#B5BD68';
                icon = '✓';
            }
            return `<div style="color: ${color}; font-family: var(--font-code); font-size: var(--font-size-xs); line-height: 1.6; word-break: break-all; margin-bottom: 2px;">
                <span style="opacity: 0.5; margin-right: var(--spacing-xs);">${icon}</span>${log.text}
            </div>`;
        }).join('');

        return `
            <div class="aero-tools-page" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-text-active); font-family: var(--font-ui); overflow: hidden;">
                <!-- Main scrolling panel -->
                <div style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto; display: flex; flex-direction: column;">
                    <div style="max-width: 1000px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-xl);">
                        
                        <!-- Top Header -->
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                                <button id="tools-back-btn" class="page-back-btn" style="background: transparent; border: none; outline: none; cursor: pointer; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; transition: background var(--transition-fast);">
                                    <i class="hgi-stroke hgi-arrow-left-01" style="font-size: 18px;"></i>
                                </button>
                                <div>
                                    <h2 style="margin: 0; font-size: 20px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Developer Tools & Extensions</h2>
                                    <p style="margin: 4px 0 0; font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Manage installed utilities and view browser console output logs.</p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                                <label style="display: flex; align-items: center; gap: var(--spacing-sm); font-size: var(--font-size-xs); cursor: pointer; color: var(--color-viewport-text-muted);">
                                    <span>Developer Mode</span>
                                    <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px;">
                                        <input type="checkbox" id="dev-mode-toggle" ${this.state.devMode ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                                        <span class="slider-round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.state.devMode ? 'var(--color-input-focus-border)' : 'var(--color-border-dark)'}; transition: .3s; border-radius: 34px; display: flex; align-items: center;">
                                            <span style="display: block; width: 14px; height: 14px; background: #FFFFFF; border-radius: 50%; transition: .3s; transform: ${this.state.devMode ? 'translateX(16px)' : 'translateX(4px)'};"></span>
                                        </span>
                                    </label>
                                </label>

                                ${this.state.devMode ? `
                                    <button id="btn-add-ext-trigger" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: var(--spacing-sm) var(--spacing-lg); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: var(--spacing-xs);">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        Load Unpacked
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- 2 Column Layout (Extensions | Terminal Console) -->
                        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: var(--spacing-xl); align-items: flex-start; min-height: 480px;">
                            
                            <!-- Column 1: Extensions Manager -->
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <h3 style="margin: 0; font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Extensions Manager</h3>
                                    <div class="search-history-bar" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-md); height: 32px; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 6px; width: 200px;">
                                        <i class="hgi-stroke hgi-search-01" style="font-size: 12px; color: var(--color-text-inactive);"></i>
                                        <input type="text" id="ext-search" value="${this.state.searchQuery}" placeholder="Search extensions..." style="flex: 1; border: none; background: transparent; font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                </div>

                                <!-- Add custom mock extension form -->
                                ${this.state.showAddExtensionForm ? `
                                    <div class="add-ext-panel" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); box-shadow: var(--shadow-md);">
                                        <h4 style="margin: 0; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Load Custom Mock Extension</h4>
                                        <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                            <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                                <label style="font-size: 10px; color: var(--color-text-inactive);">Extension Name</label>
                                                <input type="text" id="new-ext-name" value="${this.state.newExtName}" placeholder="e.g. Aero DevTools Helper" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                            </div>
                                            <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                                <label style="font-size: 10px; color: var(--color-text-inactive);">Description</label>
                                                <textarea id="new-ext-desc" placeholder="Brief description of the tools capabilities..." style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none; height: 60px; font-family: var(--font-ui); resize: none;">${this.state.newExtDesc}</textarea>
                                            </div>
                                        </div>
                                        <div style="display: flex; justify-content: flex-end; gap: var(--spacing-md); margin-top: 4px;">
                                            <button id="btn-add-ext-cancel" style="background: transparent; border: 1px solid var(--color-border-light); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer; color: var(--color-text-inactive);">Cancel</button>
                                            <button id="btn-add-ext-save" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer;">Load Extension</button>
                                        </div>
                                    </div>
                                ` : ''}

                                <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; box-shadow: var(--shadow-sm);">
                                    ${extHtml}
                                    ${emptyExtensions}
                                </div>
                            </div>
                            
                            <!-- Column 2: Developer Engine Console Log -->
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-md); height: 100%;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <h3 style="margin: 0; font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Aero Engine Console</h3>
                                    <div style="display: flex; gap: var(--spacing-xs);">
                                        <button class="action-btn" id="btn-log-clear" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); font-size: var(--font-size-xxs); font-weight: var(--font-weight-medium); padding: 4px 10px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Clear Console Log">
                                            Clear
                                        </button>
                                        <button class="action-btn" id="btn-log-simulate-err" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); font-size: var(--font-size-xxs); font-weight: var(--font-weight-medium); padding: 4px 10px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                            Simulate Error
                                        </button>
                                    </div>
                                </div>

                                <!-- Terminal Shell Container -->
                                <div style="background: #1D1F21; border-radius: 10px; border: 1px solid var(--color-viewport-border); overflow: hidden; display: flex; flex-direction: column; flex: 1; min-height: 400px; box-shadow: var(--shadow-md);">
                                    <!-- Terminal title tab -->
                                    <div style="background: #282A2E; padding: var(--spacing-sm) var(--spacing-md); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #303030;">
                                        <span style="font-family: var(--font-code); font-size: 11px; color: #969896; display: flex; align-items: center; gap: var(--spacing-xs);">
                                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #CC6666;"></span>
                                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #F0C674;"></span>
                                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #B5BD68;"></span>
                                            aero-v8-shell
                                        </span>
                                        <span style="font-family: var(--font-code); font-size: 10px; color: #5F6160;">v8.9.4a</span>
                                    </div>

                                    <!-- Log view scroll container -->
                                    <div id="terminal-log-scroller" style="flex: 1; padding: var(--spacing-md); overflow-y: auto; display: flex; flex-direction: column;">
                                        ${terminalHtml}
                                    </div>

                                    <!-- Quick Tool Buttons -->
                                    <div style="background: #25282C; display: flex; gap: var(--spacing-sm); padding: var(--spacing-sm); border-top: 1px solid #303030; flex-wrap: wrap;">
                                        <button class="console-action-btn" id="btn-run-bench" style="background: #373B41; border: none; color: #C5C8C6; font-family: var(--font-code); font-size: 10px; padding: 4px 8px; border-radius: 4px; cursor: pointer; transition: background .15s;">Run Benchmarks</button>
                                        <button class="console-action-btn" id="btn-gc" style="background: #373B41; border: none; color: #C5C8C6; font-family: var(--font-code); font-size: 10px; padding: 4px 8px; border-radius: 4px; cursor: pointer; transition: background .15s;">Force GC</button>
                                        <button class="console-action-btn" id="btn-fps" style="background: #373B41; border: none; color: #C5C8C6; font-family: var(--font-code); font-size: 10px; padding: 4px 8px; border-radius: 4px; cursor: pointer; transition: background .15s;">Measure FPS</button>
                                    </div>

                                    <!-- Input line -->
                                    <div style="background: #151515; display: flex; align-items: center; padding: var(--spacing-sm) var(--spacing-md); border-top: 1px solid #303030; gap: var(--spacing-sm);">
                                        <span style="font-family: var(--font-code); font-size: var(--font-size-xs); color: #B5BD68;">aero://tools &gt;</span>
                                        <input type="text" id="terminal-input" value="${this.state.cmdInput}" placeholder="Type 'help' and press Enter..." style="flex: 1; background: transparent; border: none; outline: none; font-family: var(--font-code); font-size: var(--font-size-xs); color: #E0E0E0;">
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.querySelector('#tools-back-btn')?.addEventListener('click', () => {
            this.navigateBack();
        });

        // Toggle Dev Mode
        const devToggle = this.querySelector('#dev-mode-toggle');
        if (devToggle) {
            devToggle.addEventListener('change', () => {
                this.setState({ devMode: devToggle.checked });
            });
        }

        // Search Extension
        const searchInput = this.querySelector('#ext-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.setState({ searchQuery: searchInput.value });
                const len = this.state.searchQuery.length;
                const activeSearch = this.querySelector('#ext-search');
                if (activeSearch) {
                    activeSearch.setSelectionRange(len, len);
                    activeSearch.focus();
                }
            });
        }

        // Toggle form unpacked extension
        const formTrigger = this.querySelector('#btn-add-ext-trigger');
        if (formTrigger) {
            formTrigger.addEventListener('click', () => {
                this.setState({ showAddExtensionForm: !this.state.showAddExtensionForm });
            });
        }

        const formCancel = this.querySelector('#btn-add-ext-cancel');
        if (formCancel) {
            formCancel.addEventListener('click', () => {
                this.setState({ showAddExtensionForm: false });
            });
        }

        // Save Custom Mock Extension
        const formSave = this.querySelector('#btn-add-ext-save');
        if (formSave) {
            formSave.addEventListener('click', () => {
                const name = this.querySelector('#new-ext-name').value.trim();
                const desc = this.querySelector('#new-ext-desc').value.trim();

                if (!name || !desc) {
                    alert('Please complete all form details.');
                    return;
                }

                const initial = name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);

                const newExt = {
                    id: Date.now(),
                    name,
                    version: '1.0.0-unpacked',
                    author: 'Local Developer',
                    description: desc,
                    enabled: true,
                    iconBg: '#' + Math.floor(Math.random()*16777215).toString(16),
                    iconText: initial || 'EX'
                };

                const logs = [
                    ...this.state.terminalLogs,
                    { type: 'success', text: `Loaded unpacked extension: ${name} (v1.0.0)` },
                    { type: 'info', text: `Registered background script listener for: ${name}` }
                ];

                this.setState({
                    extensions: [...this.state.extensions, newExt],
                    terminalLogs: logs,
                    showAddExtensionForm: false,
                    newExtName: '',
                    newExtDesc: ''
                });

                this.scrollToConsoleBottom();
            });
        }

        // Toggle extension status
        this.querySelectorAll('.toggle-ext-btn').forEach(chk => {
            chk.addEventListener('change', () => {
                const id = parseInt(chk.getAttribute('data-id'));
                const ext = this.state.extensions.find(e => e.id === id);
                if (!ext) return;

                const enabled = chk.checked;
                const extensions = this.state.extensions.map(e => {
                    if (e.id === id) {
                        return { ...e, enabled };
                    }
                    return e;
                });

                const logText = enabled 
                    ? `Extension "${ext.name}" enabled.` 
                    : `Extension "${ext.name}" disabled. Suspending context...`;
                
                const logs = [
                    ...this.state.terminalLogs,
                    { type: enabled ? 'success' : 'warning', text: logText }
                ];

                this.setState({ extensions, terminalLogs: logs });
                this.scrollToConsoleBottom();
            });
        });

        // Uninstall extension
        this.querySelectorAll('.delete-ext-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const ext = this.state.extensions.find(e => e.id === id);
                if (!ext) return;

                const extensions = this.state.extensions.filter(e => e.id !== id);
                const logs = [
                    ...this.state.terminalLogs,
                    { type: 'error', text: `Extension "${ext.name}" has been uninstalled.` }
                ];

                this.setState({ extensions, terminalLogs: logs });
                this.scrollToConsoleBottom();
            });
        });

        // Console Buttons: Clear logs
        const btnClear = this.querySelector('#btn-log-clear');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                this.setState({ terminalLogs: [] });
            });
        }

        // Console Buttons: Simulate Error
        const btnSimError = this.querySelector('#btn-log-simulate-err');
        if (btnSimError) {
            btnSimError.addEventListener('click', () => {
                const errors = [
                    'Network error: connection refused on port 4978',
                    'AeroEngineException: out of memory allocating array buffer',
                    'Extension sandbox violation: tried to access chrome.tabs API in unapproved scope',
                    'V8 runtime exception: null pointer reference in navigation stack'
                ];
                const selectedErr = errors[Math.floor(Math.random() * errors.length)];
                
                this.setState({
                    terminalLogs: [
                        ...this.state.terminalLogs,
                        { type: 'error', text: selectedErr }
                    ]
                });
                this.scrollToConsoleBottom();
            });
        }

        // Console Buttons: Run benchmarks
        const btnRunBench = this.querySelector('#btn-run-bench');
        if (btnRunBench) {
            btnRunBench.addEventListener('click', () => {
                const logs = [
                    ...this.state.terminalLogs,
                    { type: 'info', text: 'Starting V8 Engine Benchmarks...' },
                    { type: 'info', text: '-> Running Octane suite...' },
                    { type: 'success', text: 'Octane score: 48,920 Ops/sec' },
                    { type: 'info', text: '-> Running Speedometer 3.0...' },
                    { type: 'success', text: 'Speedometer score: 382.4 Runs/min' }
                ];
                this.setState({ terminalLogs: logs });
                this.scrollToConsoleBottom();
            });
        }

        // Console Buttons: Force GC
        const btnGC = this.querySelector('#btn-gc');
        if (btnGC) {
            btnGC.addEventListener('click', () => {
                const preAlloc = (Math.random() * 80 + 30).toFixed(1);
                const postAlloc = (Math.random() * 20 + 5).toFixed(1);
                const logs = [
                    ...this.state.terminalLogs,
                    { type: 'info', text: `Garbage Collection requested. Current Heap: ${preAlloc} MB` },
                    { type: 'success', text: `GC Complete. Freed memory: ${(preAlloc - postAlloc).toFixed(1)} MB. New Heap: ${postAlloc} MB` }
                ];
                this.setState({ terminalLogs: logs });
                this.scrollToConsoleBottom();
            });
        }

        // Console Buttons: Measure FPS
        const btnFPS = this.querySelector('#btn-fps');
        if (btnFPS) {
            btnFPS.addEventListener('click', () => {
                const fps = Math.floor(Math.random() * 5 + 57);
                const logs = [
                    ...this.state.terminalLogs,
                    { type: 'info', text: `Measuring browser viewport FPS...` },
                    { type: 'success', text: `Current frame rate: ${fps} FPS (Stable v-sync)` }
                ];
                this.setState({ terminalLogs: logs });
                this.scrollToConsoleBottom();
            });
        }

        // Terminal input logic
        const termInput = this.querySelector('#terminal-input');
        if (termInput) {
            termInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const val = termInput.value.trim();
                    if (!val) return;

                    const commandLower = val.toLowerCase();
                    let responseText = '';
                    let responseType = 'info';

                    if (commandLower === 'help') {
                        responseText = 'Available commands: help, clear, version, status, list, load-mock, gc';
                    } else if (commandLower === 'clear') {
                        this.setState({ terminalLogs: [], cmdInput: '' });
                        return;
                    } else if (commandLower === 'version') {
                        responseText = 'Aero Engine Shell v1.4.2-V8 (Build 9.4.26)';
                    } else if (commandLower === 'status') {
                        responseText = 'System healthy. Port 3000 (Frontend) active. Port 4978 (Rust Aether runtime) connected.';
                        responseType = 'success';
                    } else if (commandLower === 'list') {
                        const activeExts = this.state.extensions.filter(ext => ext.enabled).map(e => e.name).join(', ');
                        responseText = `Active Extensions: [${activeExts || 'None'}]`;
                    } else if (commandLower === 'gc') {
                        responseText = 'Forced Garbage Collection trigger. Memory reclaimed.';
                        responseType = 'success';
                    } else if (commandLower === 'load-mock') {
                        responseText = 'Usage: Type Load Unpacked in Developer Mode to load unpacked extensions.';
                        responseType = 'warning';
                    } else {
                        responseText = `Command not recognized: "${val}". Type 'help' for supported commands.`;
                        responseType = 'error';
                    }

                    const logs = [
                        ...this.state.terminalLogs,
                        { type: 'info', text: `aero://tools > ${val}` },
                        { type: responseType, text: responseText }
                    ];

                    this.setState({ terminalLogs: logs, cmdInput: '' });
                    this.scrollToConsoleBottom();
                    
                    // Maintain focus on the terminal input
                    const activeTermInput = this.querySelector('#terminal-input');
                    if (activeTermInput) {
                        activeTermInput.focus();
                    }
                }
            });

            // Prevent loss of focus on re-render if typing
            termInput.addEventListener('input', () => {
                this.state.cmdInput = termInput.value;
            });
        }

        // Scroll to the bottom of the console logs
        this.scrollToConsoleBottom();
    }

    scrollToConsoleBottom() {
        const scroller = this.querySelector('#terminal-log-scroller');
        if (scroller) {
            scroller.scrollTop = scroller.scrollHeight;
        }
    }
}
