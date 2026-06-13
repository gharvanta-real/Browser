import { BaseComponent } from '../BaseComponent.js';

export class WorkspacesPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            showCreateModal: false,
            newWorkspaceName: '',
            newWorkspaceIcon: 'hgi-briefcase-01',
            newWorkspaceColor: '#1A73E8'
        };
        
        this.availableIcons = [
            { class: 'hgi-home-01', name: 'Home' },
            { class: 'hgi-briefcase-01', name: 'Work' },
            { class: 'hgi-user', name: 'Personal' },
            { class: 'hgi-code-circle', name: 'Dev' },
            { class: 'hgi-compass', name: 'Explore' },
            { class: 'hgi-game-controller-a', name: 'Gaming' },
            { class: 'hgi-heart', name: 'Health' }
        ];

        this.availableColors = [
            { hex: '#4D90FE', name: 'Aero Blue' },
            { hex: '#1A73E8', name: 'Deep Blue' },
            { hex: '#188038', name: 'Green' },
            { hex: '#A259FF', name: 'Purple' },
            { hex: '#E81123', name: 'Red' },
            { hex: '#F29900', name: 'Orange' },
            { hex: '#4C5054', name: 'Charcoal' }
        ];
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            this.setState({
                workspaces: state.workspaces,
                activeWorkspace: state.activeWorkspace,
                tabs: state.tabs
            });
        });
        super.connectedCallback();
    }

    template() {
        const workspaces = this.state.workspaces || [];
        const activeWorkspace = this.state.activeWorkspace || 'Default';
        const tabs = this.state.tabs || [];

        // Grid cards HTML
        const workspaceCardsHtml = workspaces.map(w => {
            const isActive = w.id === activeWorkspace;
            const wTabs = tabs.filter(t => (t.workspace || 'Default') === w.id);
            return `
                <div class="workspace-card" style="background: var(--color-card-bg); border-radius: var(--border-radius-lg); padding: var(--spacing-lg); box-shadow: var(--shadow-md); display: flex; flex-direction: column; gap: var(--spacing-sm); position: relative; border-left: 4px solid ${w.color || 'var(--color-input-focus-border)'};">
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                        <div style="width: 36px; height: 36px; border-radius: var(--border-radius-md); background: color-mix(in srgb, ${w.color || 'var(--color-input-focus-border)'} 8%, transparent); display: flex; align-items: center; justify-content: center; color: ${w.color || 'var(--color-input-focus-border)'};">
                            <i class="hgi-stroke ${w.icon || 'hgi-grid-view'}" style="font-size: 18px;"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0; font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">${w.name}</h4>
                            <span style="font-size: 11px; color: var(--color-viewport-text-muted);">${wTabs.length} active tab${wTabs.length === 1 ? '' : 's'}</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-sm);">
                        <button class="switch-w-btn" data-id="${w.id}" style="flex: 1; padding: 6px var(--spacing-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); border-radius: var(--border-radius-sm); border: none; cursor: pointer; background: ${isActive ? 'color-mix(in srgb, var(--color-input-focus-border) 10%, transparent)' : 'var(--color-window-bg)'}; color: ${isActive ? 'var(--color-input-focus-border)' : 'var(--color-text-active)'};">
                            ${isActive ? 'Active Workspace' : 'Switch'}
                        </button>
                        ${w.id !== 'Default' ? `
                            <button class="delete-w-btn" data-id="${w.id}" style="padding: 6px; font-size: var(--font-size-xs); border-radius: var(--border-radius-sm); border: none; cursor: pointer; background: var(--color-window-bg); color: #E81123;" title="Delete Workspace">
                                <i class="hgi-stroke hgi-trash" style="font-size: 13px;"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Tab manager sections HTML
        const tabManagerHtml = workspaces.map(w => {
            const wTabs = tabs.filter(t => (t.workspace || 'Default') === w.id);
            const otherWorkspaces = workspaces.filter(ow => ow.id !== w.id);
            
            const tabsListHtml = wTabs.length === 0 
                ? `<div style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); font-style: italic; padding: var(--spacing-sm) 0;">No active tabs in this workspace.</div>`
                : wTabs.map(tab => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--color-viewport-border);">
                        <div style="display: flex; align-items: center; gap: var(--spacing-sm); min-width: 0;">
                            <i class="hgi-stroke ${tab.hibernated ? 'hgi-moon-01' : 'hgi-global'}" style="font-size: 13px; color: var(--color-text-inactive); flex-shrink: 0;"></i>
                            <span style="font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-viewport-text);">${tab.title}</span>
                            <span style="font-size: 10px; color: var(--color-viewport-text-muted); opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">(${tab.url})</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                            <select class="move-tab-select" data-tab-id="${tab.id}" style="font-size: 10px; padding: 2px var(--spacing-sm); border-radius: var(--border-radius-sm); border: 1px solid var(--color-viewport-border); background: var(--color-window-bg); color: var(--color-viewport-text); outline: none;">
                                <option value="" disabled selected>Move to...</option>
                                ${otherWorkspaces.map(ow => `<option value="${ow.id}">${ow.name}</option>`).join('')}
                            </select>
                            <button class="close-tab-w-btn" data-tab-id="${tab.id}" style="border: none; background: transparent; cursor: pointer; color: var(--color-viewport-text-muted); padding: 4px;" title="Close Tab">
                                <i class="hgi-stroke hgi-cancel-01" style="font-size: 11px;"></i>
                            </button>
                        </div>
                    </div>
                `).join('');

            return `
                <div style="background: var(--color-card-bg); border-radius: var(--border-radius-lg); padding: var(--spacing-lg); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: var(--spacing-sm);">
                    <h5 style="margin: 0; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: ${w.color || 'var(--color-input-focus-border)'}; display: flex; align-items: center; gap: var(--spacing-xs);">
                        <i class="hgi-stroke ${w.icon || 'hgi-grid-view'}" style="font-size: 14px;"></i> ${w.name} Tabs
                    </h5>
                    <div style="display: flex; flex-direction: column; max-height: 250px; overflow-y: auto;">
                        ${tabsListHtml}
                    </div>
                </div>
            `;
        }).join('');

        // Modal overlay HTML
        const modalHtml = this.state.showCreateModal ? `
            <div id="workspace-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                <div style="width: 100%; max-width: 440px; background: var(--color-card-bg); border-radius: var(--border-radius-lg); padding: var(--spacing-xl); box-shadow: var(--shadow-lg); display: flex; flex-direction: column; gap: var(--spacing-lg); border: 1px solid var(--color-viewport-border);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Create New Workspace</h3>
                        <button id="modal-close" style="border: none; background: transparent; cursor: pointer; color: var(--color-viewport-text-muted); font-size: 16px;">&times;</button>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                        <label style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Workspace Name</label>
                        <input type="text" id="w-name-input" placeholder="e.g. Development, Entertainment" value="${this.state.newWorkspaceName}" style="padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-sm); border: 1px solid var(--color-viewport-border); background: var(--color-window-bg); color: var(--color-viewport-text); font-size: var(--font-size-sm); outline: none;">
                    </div>

                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                        <label style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Accent Icon</label>
                        <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
                            ${this.availableIcons.map(icon => `
                                <button class="icon-selector ${this.state.newWorkspaceIcon === icon.class ? 'selected' : ''}" data-icon="${icon.class}" style="width: 32px; height: 32px; border-radius: var(--border-radius-sm); border: 1px solid ${this.state.newWorkspaceIcon === icon.class ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}; background: ${this.state.newWorkspaceIcon === icon.class ? 'color-mix(in srgb, var(--color-input-focus-border) 8%, transparent)' : 'var(--color-window-bg)'}; color: ${this.state.newWorkspaceIcon === icon.class ? 'var(--color-input-focus-border)' : 'var(--color-viewport-text)'}; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                    <i class="hgi-stroke ${icon.class}" style="font-size: 16px;"></i>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                        <label style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Accent Color</label>
                        <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
                            ${this.availableColors.map(color => `
                                <button class="color-selector ${this.state.newWorkspaceColor === color.hex ? 'selected' : ''}" data-color="${color.hex}" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${this.state.newWorkspaceColor === color.hex ? 'var(--color-viewport-text)' : 'transparent'}; background: ${color.hex}; cursor: pointer;" title="${color.name}"></button>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-sm);">
                        <button id="modal-cancel" style="padding: 8px var(--spacing-lg); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); border-radius: var(--border-radius-sm); border: none; cursor: pointer; background: var(--color-window-bg); color: var(--color-text-active);">Cancel</button>
                        <button id="modal-save" style="padding: 8px var(--spacing-lg); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); border-radius: var(--border-radius-sm); border: none; cursor: pointer; background: var(--color-input-focus-border); color: #FFFFFF;">Create</button>
                    </div>
                </div>
            </div>
        ` : '';

        return `
            <div class="workspaces-page-layout" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-viewport-text); font-family: var(--font-ui); overflow: hidden;">
                <!-- Inner Container -->
                <div style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto; display: flex; flex-direction: column; gap: var(--spacing-xl);">
                    
                    <!-- Page Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                            <h2 style="margin: 0; font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); display: flex; align-items: center; gap: 8px;">
                                <i class="hgi-stroke hgi-grid-view" style="color: #1A73E8;"></i> Browser Workspaces
                            </h2>
                            <p style="margin: 0; color: var(--color-viewport-text-muted); font-size: var(--font-size-sm);">Group tabs into isolated, clean working environments</p>
                        </div>
                        <button id="open-create-modal-btn" style="background: #1A73E8; color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: var(--spacing-sm) var(--spacing-lg); border-radius: var(--border-radius-sm); cursor: pointer; border: none; display: flex; align-items: center; gap: var(--spacing-sm);">
                            <i class="hgi-stroke hgi-plus" style="font-size: 13px;"></i> Create Workspace
                        </button>
                    </div>

                    <!-- Workspaces Cards Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--spacing-lg);">
                        ${workspaceCardsHtml}
                        
                        <!-- Dotted Add Workspace card -->
                        <div id="grid-add-card" style="border: 2px dashed var(--color-viewport-border); border-radius: var(--border-radius-lg); padding: var(--spacing-lg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--spacing-sm); cursor: pointer; min-height: 120px; transition: var(--transition-fast);">
                            <i class="hgi-stroke hgi-plus-circle-loading" style="font-size: 24px; color: var(--color-viewport-text-muted);"></i>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); font-weight: var(--font-weight-medium);">New Workspace</span>
                        </div>
                    </div>

                    <!-- Workspace Tab Manager Section -->
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-md); margin-top: var(--spacing-sm);">
                        <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                            <h3 style="margin: 0; font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Workspace Tab Organizer</h3>
                            <p style="margin: 0; color: var(--color-viewport-text-muted); font-size: var(--font-size-xs);">Manage and move active tabs directly between workspaces</p>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-lg);">
                            ${tabManagerHtml}
                        </div>
                    </div>

                </div>
            </div>

            <!-- Modal injection -->
            ${modalHtml}
        `;
    }

    afterRender() {
        // Switch workspace buttons
        this.querySelectorAll('.switch-w-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const wId = btn.getAttribute('data-id');
                window.AppState.update(state => {
                    state.activeWorkspace = wId;
                    
                    // Filter or populate tabs
                    const workspaceTabs = state.tabs.filter(t => (t.workspace || 'Default') === wId);
                    if (workspaceTabs.length === 0) {
                        const newId = `tab-${Date.now()}`;
                        state.tabs.push({
                            id: newId,
                            title: 'New Tab',
                            url: 'https://newtab.internal',
                            hibernated: false,
                            active: true,
                            workspace: wId
                        });
                        state.activeTabId = newId;
                    } else {
                        const lastActive = workspaceTabs.find(t => t.active) || workspaceTabs[0];
                        state.activeTabId = lastActive.id;
                    }

                    // Update left sidebar active item highlight
                    document.querySelectorAll('.sidebar-item').forEach(el => {
                        el.classList.remove('active');
                        if (el.getAttribute('data-workspace') === wId) {
                            el.classList.add('active');
                        }
                    });
                });
            });
        });

        // Delete workspace buttons
        this.querySelectorAll('.delete-w-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const wId = btn.getAttribute('data-id');
                if (await window.aeroConfirm(`Are you sure you want to delete workspace "${wId}"? All of its tabs will be transferred to Default workspace.`)) {
                    window.AppState.update(state => {
                        state.workspaces = state.workspaces.filter(w => w.id !== wId);
                        
                        // Move tabs to default
                        state.tabs.forEach(t => {
                            if (t.workspace === wId) {
                                t.workspace = 'Default';
                            }
                        });

                        if (state.activeWorkspace === wId) {
                            state.activeWorkspace = 'Default';
                        }
                    });
                }
            });
        });

        // Close tab from manager
        this.querySelectorAll('.close-tab-w-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab-id');
                window.AppState.update(state => {
                    if (state.tabs.length <= 1) {
                        alert("Cannot close the last tab!");
                        return;
                    }
                    const index = state.tabs.findIndex(t => t.id === tabId);
                    state.tabs = state.tabs.filter(t => t.id !== tabId);
                    
                    if (state.activeTabId === tabId) {
                        const newActiveIndex = Math.max(0, index - 1);
                        state.activeTabId = state.tabs[newActiveIndex].id;
                    }
                });
            });
        });

        // Move tab between workspaces select
        this.querySelectorAll('.move-tab-select').forEach(select => {
            select.addEventListener('change', () => {
                const tabId = select.getAttribute('data-tab-id');
                const targetWId = select.value;
                if (!targetWId) return;

                window.AppState.update(state => {
                    const tab = state.tabs.find(t => t.id === tabId);
                    if (tab) {
                        tab.workspace = targetWId;
                        
                        // If we moved the active tab of current workspace, switch active tab to another tab in same workspace
                        if (state.activeTabId === tabId) {
                            const remaining = state.tabs.filter(t => (t.workspace || 'Default') === (state.activeWorkspace || 'Default'));
                            if (remaining.length > 0) {
                                state.activeTabId = remaining[0].id;
                            } else {
                                const newId = `tab-${Date.now()}`;
                                state.tabs.push({
                                    id: newId,
                                    title: 'New Tab',
                                    url: 'https://newtab.internal',
                                    hibernated: false,
                                    active: true,
                                    workspace: state.activeWorkspace || 'Default'
                                });
                                state.activeTabId = newId;
                            }
                        }
                    }
                });
            });
        });

        // Modal triggers
        const openModalBtn = this.querySelector('#open-create-modal-btn');
        const gridAddCard = this.querySelector('#grid-add-card');
        const closeModal = () => {
            this.setState({
                showCreateModal: false,
                newWorkspaceName: '',
                newWorkspaceIcon: 'hgi-briefcase-01',
                newWorkspaceColor: '#1A73E8'
            });
        };

        if (openModalBtn) openModalBtn.addEventListener('click', () => this.setState({ showCreateModal: true }));
        if (gridAddCard) gridAddCard.addEventListener('click', () => this.setState({ showCreateModal: true }));

        const modalOverlay = this.querySelector('#workspace-modal');
        if (modalOverlay) {
            this.querySelector('#modal-close').addEventListener('click', closeModal);
            this.querySelector('#modal-cancel').addEventListener('click', closeModal);
            
            // Icon click selection
            this.querySelectorAll('.icon-selector').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.state.newWorkspaceIcon = btn.getAttribute('data-icon');
                    this.querySelectorAll('.icon-selector').forEach(b => {
                        const isSel = b.getAttribute('data-icon') === this.state.newWorkspaceIcon;
                        b.style.border = `1px solid ${isSel ? 'var(--color-input-focus-border)' : 'var(--color-viewport-border)'}`;
                        b.style.background = isSel ? 'color-mix(in srgb, var(--color-input-focus-border) 8%, transparent)' : 'var(--color-window-bg)';
                        b.style.color = isSel ? 'var(--color-input-focus-border)' : 'var(--color-viewport-text)';
                    });
                });
            });

            // Color selection
            this.querySelectorAll('.color-selector').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.state.newWorkspaceColor = btn.getAttribute('data-color');
                    this.querySelectorAll('.color-selector').forEach(b => {
                        b.style.borderColor = b.getAttribute('data-color') === this.state.newWorkspaceColor ? 'var(--color-viewport-text)' : 'transparent';
                    });
                });
            });

            // Save new workspace
            this.querySelector('#modal-save').addEventListener('click', () => {
                const nameInput = this.querySelector('#w-name-input');
                const name = nameInput ? nameInput.value.trim() : '';
                if (!name) {
                    alert("Please enter a workspace name!");
                    return;
                }

                window.AppState.update(state => {
                    const exists = state.workspaces.some(w => w.name.toLowerCase() === name.toLowerCase());
                    if (exists) {
                        alert("A workspace with this name already exists!");
                        return;
                    }

                    const newId = name;
                    state.workspaces.push({
                        id: newId,
                        name: name,
                        icon: this.state.newWorkspaceIcon,
                        color: this.state.newWorkspaceColor
                    });

                    // Add new sidebar items dynamically in real life if needed, but since sidebar is static in HTML,
                    // we can switch to it immediately and the workspaces switcher grid updates.
                });
                closeModal();
            });
        }
    }
}
