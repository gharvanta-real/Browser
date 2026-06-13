import { BaseComponent } from '../BaseComponent.js';

export class DownloadsPage extends BaseComponent {
    constructor() {
        super();
        this.progressTimer = null;
        this.state = {
            searchQuery: window.AppState?.downloadsSearchQuery || '',
            filter: 'All', // 'All' | 'In progress' | 'Completed' | 'Large files'
            downloads: window.AppState?.downloads || []
        };
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            this.setState({
                downloads: state.downloads || [],
                searchQuery: state.downloadsSearchQuery || ''
            });
        });
        this.startSimulatingProgress();
        super.connectedCallback();
    }

    disconnectedCallback() {
        this.stopSimulatingProgress();
        super.disconnectedCallback();
    }

    startSimulatingProgress() {
        this.progressTimer = setInterval(() => {
            const currentDownloads = window.AppState?.downloads || [];
            
            // Check if there are any downloads needing speed/progress updates
            const hasActiveOrPaused = currentDownloads.some(item => item.status === 'downloading' || (item.status === 'paused' && item.speed > 0));
            if (!hasActiveOrPaused) return;

            window.AppState.update(state => {
                state.downloads = state.downloads.map(item => {
                    if (item.status === 'paused') {
                        if (item.speed > 0) {
                            return { ...item, speed: 0 };
                        }
                        return item;
                    }
                    if (item.status !== 'downloading') return item;
                    if (item.sourceUrl || item.savePath) return item;
                    
                    // Simulating minor speed fluctuation
                    const baseSpeed = item.baseSpeed || 20 * 1024 * 1024; // default 20MB/s
                    const randomFactor = 0.85 + Math.random() * 0.3; // +/- 15%
                    const speed = Math.floor(baseSpeed * randomFactor);
                    
                    const addBytes = speed * 0.5; // half second tick
                    const nextBytes = Math.min(item.totalBytes, item.downloadedBytes + addBytes);
                    
                    if (nextBytes === item.totalBytes) {
                        return {
                            ...item,
                            downloadedBytes: nextBytes,
                            speed: 0,
                            status: 'completed',
                            dateStr: 'Just now',
                            size: this.formatBytes(item.totalBytes),
                            sizeVal: item.totalBytes
                        };
                    }
                    return { ...item, downloadedBytes: nextBytes, speed, baseSpeed };
                });
            });
        }, 500);
    }

    stopSimulatingProgress() {
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 1;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    template() {
        const query = this.state.searchQuery.toLowerCase().trim();
        const activeFilter = this.state.filter;

        // Filter items
        const filterFn = item => item.name.toLowerCase().includes(query) || item.domain.toLowerCase().includes(query);
        
        let allInProgress = (this.state.downloads || []).filter(item => item.status === 'downloading' || item.status === 'paused');
        let allCompleted = (this.state.downloads || []).filter(item => item.status === 'completed');

        let filteredInProgress = allInProgress.filter(filterFn);
        let filteredCompleted = allCompleted.filter(filterFn);

        if (activeFilter === 'In progress') {
            filteredCompleted = [];
        } else if (activeFilter === 'Completed') {
            filteredInProgress = [];
        } else if (activeFilter === 'Large files') {
            // filter files > 100MB
            filteredInProgress = filteredInProgress.filter(item => item.totalBytes > 100 * 1024 * 1024);
            filteredCompleted = filteredCompleted.filter(item => item.sizeVal > 100 * 1024 * 1024);
        }

        // Render In progress list
        const inProgressHtml = filteredInProgress.map(item => {
            const pct = item.totalBytes ? Math.floor((item.downloadedBytes / item.totalBytes) * 100) : 0;
            const downloadedStr = this.formatBytes(item.downloadedBytes);
            const totalStr = this.formatBytes(item.totalBytes);
            const speedStr = this.formatBytes(item.speed) + '/s';
            
            // Calculate time left
            const remainingBytes = item.totalBytes - item.downloadedBytes;
            const secondsLeft = item.speed > 0 ? Math.ceil(remainingBytes / item.speed) : 0;
            const timeLeftStr = (item.status === 'paused') 
                ? 'Paused' 
                : item.speed <= 0
                    ? 'Starting'
                : secondsLeft > 60 
                    ? `${Math.floor(secondsLeft/60)}m ${secondsLeft%60}s left`
                    : `${secondsLeft} seconds left`;

            return `
                <div class="download-item-card in-progress" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--spacing-md);">
                        <div style="display: flex; gap: var(--spacing-md); align-items: center; min-width: 0;">
                            <i class="hgi-stroke ${item.fileIconClass}" style="font-size: 24px; color: ${item.color}; flex-shrink: 0;"></i>
                            <div style="display: flex; flex-direction: column; min-width: 0; gap: 2px;">
                                <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
                                <span style="font-size: 9px; color: var(--color-viewport-text-muted);">${item.domain} • ${totalStr}</span>
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div style="display: flex; gap: 8px; flex-shrink: 0;">
                            <button class="pause-download-btn btn-action" data-id="${item.id}" style="background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: 4px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-viewport-text);">
                                <i class="hgi-stroke ${item.status === 'paused' ? 'hgi-play' : 'hgi-pause'}" style="font-size: 14px; pointer-events: none;"></i>
                            </button>
                            <button class="cancel-download-btn btn-action" data-id="${item.id}" style="background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: 4px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-viewport-text);">
                                <i class="hgi-stroke hgi-cancel-01" style="font-size: 14px; pointer-events: none;"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Progress bar -->
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="width: 100%; height: 4px; background: var(--color-border-hover); border-radius: 2px; overflow: hidden; position: relative;">
                            <div class="download-bar-fill" style="width: ${pct}%; height: 100%; background: var(--color-input-focus-border); transition: width 0.5s ease-out;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--color-viewport-text-muted);">
                            <span>${downloadedStr} of ${totalStr} • ${speedStr}</span>
                            <span>${timeLeftStr}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Render Completed list
        const completedHtml = filteredCompleted.map(item => `
            <div class="download-item-card completed" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; padding: var(--spacing-md); display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-md);">
                <div style="display: flex; gap: var(--spacing-md); align-items: center; min-width: 0; flex: 1;">
                    <i class="hgi-stroke ${item.fileIconClass}" style="font-size: 24px; color: ${item.color}; flex-shrink: 0;"></i>
                    <div style="display: flex; flex-direction: column; min-width: 0; gap: 2px;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
                        <span style="font-size: 9px; color: var(--color-viewport-text-muted);">${item.domain} • ${item.size}</span>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: var(--spacing-md); flex-shrink: 0;">
                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); font-family: monospace;">${item.dateStr}</span>
                    
                    <!-- File controls -->
                    <div style="display: flex; gap: 6px;">
                        <button class="open-folder-btn" data-path="${item.savePath || ''}" title="Show in folder" style="background: transparent; border: none; color: var(--color-text-inactive); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                            <i class="hgi-stroke hgi-folder" style="font-size: 14px;"></i>
                        </button>
                        <button class="open-file-btn" data-path="${item.savePath || ''}" title="Open file" style="background: transparent; border: none; color: var(--color-text-inactive); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                            <i class="hgi-stroke hgi-globe" style="font-size: 14px;"></i>
                        </button>
                        <button class="delete-completed-btn" data-id="${item.id}" title="Remove entry" style="background: transparent; border: none; color: var(--color-text-inactive); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                            <i class="hgi-stroke hgi-cancel-01" style="font-size: 14px; pointer-events: none;"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        const emptyState = (filteredInProgress.length === 0 && filteredCompleted.length === 0) ? `
            <div style="text-align: center; padding: 60px 20px; color: var(--color-viewport-text-muted);">
                <i class="hgi-stroke hgi-download-01" style="font-size: 32px; opacity: 0.5; margin-bottom: var(--spacing-sm);"></i>
                <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No downloads found</div>
                <div style="font-size: var(--font-size-xs); opacity: 0.7; margin-top: 4px;">Try searching for a different file name</div>
            </div>
        ` : '';

        return `
            <div class="aero-downloads-page" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-text-active); font-family: var(--font-ui); overflow: hidden;">
                <!-- Center Main Section -->
                <div class="downloads-main-content" style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto;">
                    <div style="max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-md);">
                        <h2 style="margin: 0; font-size: 20px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Downloads</h2>

                        <!-- Search Input bar -->
                        <div class="search-downloads-bar" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-lg); height: 40px; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; box-shadow: var(--shadow-sm); margin-bottom: 4px;">
                            <span style="font-size: 16px; opacity: 0.6; display: flex; align-items: center;"><i class="hgi-stroke hgi-search-01" style="font-size: 16px;"></i></span>
                            <input type="text" id="downloads-search-input" value="${this.state.searchQuery}" placeholder="Search downloads" style="flex: 1; border: none; font-size: var(--font-size-sm); color: var(--color-viewport-text); outline: none; background: transparent;">
                        </div>

                        <!-- Filter pills row -->
                        <div style="display: flex; gap: 8px;">
                            <button class="filter-pill ${activeFilter === 'All' ? 'active' : ''}" data-filter="All" style="background: ${activeFilter === 'All' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'All' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'All' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">All</button>
                            <button class="filter-pill ${activeFilter === 'In progress' ? 'active' : ''}" data-filter="In progress" style="background: ${activeFilter === 'In progress' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'In progress' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'In progress' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">In progress</button>
                            <button class="filter-pill ${activeFilter === 'Completed' ? 'active' : ''}" data-filter="Completed" style="background: ${activeFilter === 'Completed' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Completed' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Completed' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Completed</button>
                            <button class="filter-pill ${activeFilter === 'Large files' ? 'active' : ''}" data-filter="Large files" style="background: ${activeFilter === 'Large files' ? 'var(--color-input-focus-border)' : 'var(--color-card-bg)'}; color: ${activeFilter === 'Large files' ? '#FFFFFF' : 'var(--color-viewport-text)'}; border: 1px solid ${activeFilter === 'Large files' ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; border-radius: var(--border-radius-sm); padding: var(--spacing-xs) var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); cursor: pointer;">Large files</button>
                        </div>

                        <!-- Lists -->
                        ${emptyState}

                        ${filteredInProgress.length > 0 ? `
                            <div style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted); padding: var(--spacing-md) 0 var(--spacing-xs);">In progress (${filteredInProgress.length})</div>
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                ${inProgressHtml}
                            </div>
                        ` : ''}

                        ${filteredCompleted.length > 0 ? `
                            <div style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted); padding: var(--spacing-md) 0 var(--spacing-xs);">Completed (${filteredCompleted.length})</div>
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                ${completedHtml}
                            </div>
                            <div style="text-align: center; margin-top: var(--spacing-md);">
                                <span style="font-size: var(--font-size-xs); color: var(--color-input-focus-border); cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                                    Show all completed downloads <i class="hgi-stroke hgi-arrow-down-01" style="font-size: 10px;"></i>
                                </span>
                            </div>
                        ` : ''}


                        <!-- Bottom widgets grid (replacing right sidebar) -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--spacing-md); margin-top: var(--spacing-lg); border-top: 1px solid var(--color-viewport-border); padding-top: var(--spacing-lg);">
                            
                            <!-- Storage widget -->
                            <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                <h4 style="margin: 0; font-size: 11px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Storage</h4>
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs);">
                                        <strong>12.4 GB used</strong>
                                        <span style="color: var(--color-viewport-text-muted);">of 250 GB</span>
                                    </div>
                                    <div style="width: 100%; height: 6px; background: var(--color-border-hover); border-radius: 3px; overflow: hidden;">
                                        <div style="width: 5%; height: 100%; background: var(--color-input-focus-border); border-radius: 3px;"></div>
                                    </div>
                                </div>
                                <button class="open-folder-trigger" style="background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); cursor: pointer; margin-top: auto;">Open downloads folder</button>
                                <button id="btn-clear-completed" style="background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); cursor: pointer; margin-top: var(--spacing-xs);">Clear completed</button>
                            </div>

                            <!-- Safe downloads widget -->
                            <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                <h4 style="margin: 0; font-size: 11px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Safe downloads</h4>
                                <div style="background: rgba(24, 128, 56, 0.05); border: 1px solid rgba(24, 128, 56, 0.1); border-radius: 8px; padding: var(--spacing-sm) var(--spacing-md); font-size: 10px; line-height: 1.4; color: var(--color-viewport-text-muted); margin-bottom: var(--spacing-xs);">
                                    Aero helps keep your downloads safe.
                                </div>
                                <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); font-size: var(--font-size-xs);">
                                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); color: #188038;">
                                        <i class="hgi-stroke hgi-checkmark-circle-01" style="font-size: 16px;"></i> Scanned 128 files this week
                                    </div>
                                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); color: #188038;">
                                        <i class="hgi-stroke hgi-checkmark-circle-01" style="font-size: 16px;"></i> No threats detected
                                    </div>
                                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); color: #188038;">
                                        <i class="hgi-stroke hgi-checkmark-circle-01" style="font-size: 16px;"></i> Safe browsing is on
                                    </div>
                                </div>
                                <button style="background: var(--color-window-bg); border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-sm); padding: var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); cursor: pointer; margin-top: auto;">Security settings</button>
                            </div>

                            <!-- Tip widget -->
                            <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; flex-direction: column; gap: var(--spacing-xs);">
                                <div style="display: flex; align-items: center; gap: var(--spacing-sm); font-size: 11px; font-weight: var(--font-weight-bold); color: var(--color-input-focus-border);">
                                    <i class="hgi-stroke hgi-note-01" style="font-size: 14px;"></i> Tip
                                </div>
                                <span style="font-size: 10px; line-height: 1.4; color: var(--color-viewport-text-muted);">You can change where files are saved in <span style="color: var(--color-input-focus-border); cursor: pointer; text-decoration: underline;" onclick="window.location.hash='aero://settings'">Settings > Downloads</span>.</span>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        const searchInput = this.querySelector('#downloads-search-input');
        if (searchInput) {
            searchInput.focus();
            const val = searchInput.value;
            searchInput.value = '';
            searchInput.value = val;

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                window.AppState.update(state => {
                    state.downloadsSearchQuery = query;
                });
            });
        }

        this.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                this.setState({ filter: pill.getAttribute('data-filter') });
            });
        });

        // Pause/Resume Download triggers
        this.querySelectorAll('.pause-download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = window.AppState.downloads.find(download => String(download.id) === String(id));
                if (item?.sourceUrl && window.aeroNative) {
                    const nativeAction = item.status === 'paused'
                        ? window.aeroNative.resumeDownload?.(id)
                        : window.aeroNative.pauseDownload?.(id);
                    nativeAction?.catch?.(() => {});
                }
                window.AppState.update(state => {
                    state.downloads = state.downloads.map(item => {
                        if (String(item.id) === String(id)) {
                            return { ...item, status: item.status === 'paused' ? 'downloading' : 'paused' };
                        }
                        return item;
                    });
                });
            });
        });

        // Cancel Download triggers
        this.querySelectorAll('.cancel-download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.aeroNative?.cancelDownload?.(id)?.catch?.(() => {});
                window.AppState.update(state => {
                    state.downloads = state.downloads.filter(item => String(item.id) !== String(id));
                });
            });
        });

        // Delete Completed triggers
        this.querySelectorAll('.delete-completed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                window.AppState.update(state => {
                    state.downloads = state.downloads.filter(item => String(item.id) !== String(id));
                });
            });
        });

        // Clear completed trigger
        const clearCompletedBtn = this.querySelector('#btn-clear-completed');
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => {
                window.AppState.update(state => {
                    state.downloads = state.downloads.filter(item => item.status !== 'completed');
                });
            });
        }

        this.querySelectorAll('.open-file-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filePath = btn.getAttribute('data-path');
                if (filePath && window.aeroNative?.openDownload) {
                    window.aeroNative.openDownload(filePath);
                }
            });
        });

        this.querySelectorAll('.open-folder-btn, .open-folder-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                const filePath = btn.getAttribute('data-path');
                if (filePath && window.aeroNative?.showDownload) {
                    window.aeroNative.showDownload(filePath);
                } else if (window.AppState?.downloadPath && window.aeroNative?.showDownload) {
                    window.aeroNative.showDownload(window.AppState.downloadPath);
                }
            });
        });
    }
}
