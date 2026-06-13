import { BaseComponent } from '../BaseComponent.js';

export class PasswordsPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            searchQuery: '',
            passwords: [
                { id: 1, site: 'Google', url: 'https://google.com', username: 'alex.morgan@gmail.com', password: 'SuperSecretPass123!', revealed: false },
                { id: 2, site: 'GitHub', url: 'https://github.com', username: 'alexmorgan-dev', password: 'gitHubSecur3$#', revealed: false },
                { id: 3, site: 'Netflix', url: 'https://netflix.com', username: 'alex.morgan@aero.com', password: 'ChillPassNetflix99', revealed: false },
                { id: 4, site: 'Notion', url: 'https://notion.so', username: 'alex.morgan@aero.com', password: 'WorkspaceNotionPass2026', revealed: false }
            ],
            showAddForm: false,
            newSite: '',
            newUrl: '',
            newUsername: '',
            newPassword: ''
        };
    }

    template() {
        const query = this.state.searchQuery.toLowerCase().trim();
        const filtered = this.state.passwords.filter(p => 
            p.site.toLowerCase().includes(query) || p.username.toLowerCase().includes(query)
        );

        const listHtml = filtered.map(p => `
            <div class="settings-item-row" data-id="${p.id}" style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-md); border-bottom: 1px solid var(--color-viewport-border); transition: background var(--transition-fast);">
                <div style="display: flex; align-items: center; gap: var(--spacing-md); min-width: 0; flex: 2;">
                    <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(77, 144, 254, 0.1); color: var(--color-input-focus-border); display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: var(--font-size-md);">
                        ${p.site.charAt(0)}
                    </div>
                    <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">${p.site}</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.username}</span>
                    </div>
                </div>
                
                <!-- Password Field Group -->
                <div style="display: flex; align-items: center; gap: var(--spacing-md); flex: 2; justify-content: flex-end;">
                    <div style="font-family: monospace; font-size: var(--font-size-sm); color: var(--color-viewport-text); background: var(--color-input-bg); padding: 4px 12px; border-radius: 4px; min-width: 120px; text-align: left;">
                        ${p.revealed ? p.password : '••••••••••••'}
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <!-- Eye toggle button -->
                        <button class="action-btn toggle-visibility-btn" data-id="${p.id}" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive);" title="${p.revealed ? 'Hide Password' : 'Show Password'}">
                            <i class="hgi-stroke ${p.revealed ? 'hgi-view-off-slash' : 'hgi-view'}" style="font-size: 14px; pointer-events: none;"></i>
                        </button>
                        <!-- Copy password button -->
                        <button class="action-btn copy-pass-btn" data-id="${p.id}" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive);" title="Copy Password">
                            <i class="hgi-stroke hgi-link-01" style="font-size: 14px; pointer-events: none;"></i>
                        </button>
                        <!-- Delete button -->
                        <button class="action-btn delete-pass-btn" data-id="${p.id}" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive);" title="Delete Credential">
                            <i class="hgi-stroke hgi-cancel-01" style="font-size: 14px; pointer-events: none; color: #E81123;"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        const emptyState = filtered.length === 0 ? `
            <div style="text-align: center; padding: 48px var(--spacing-md); color: var(--color-viewport-text-muted);">
                <i class="hgi-stroke hgi-lock" style="font-size: 32px; opacity: 0.5; margin-bottom: var(--spacing-sm);"></i>
                <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No passwords found</div>
            </div>
        ` : '';

        return `
            <div class="aero-passwords-page" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-text-active); font-family: var(--font-ui); overflow: hidden;">
                
                <div style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto; display: flex; flex-direction: column;">
                    <div style="max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-md);">
                        
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Passwords Manager</h2>
                            <button id="btn-add-pass-trigger" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: var(--spacing-sm) var(--spacing-lg); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: var(--spacing-xs);">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add password
                            </button>
                        </div>
                        
                        <!-- Search & Filter bar -->
                        <div class="search-history-bar" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-lg); height: 40px; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; box-shadow: var(--shadow-sm);">
                            <i class="hgi-stroke hgi-search-01" style="font-size: 14px; color: var(--color-text-inactive);"></i>
                            <input type="text" id="pass-search" value="${this.state.searchQuery}" placeholder="Search passwords by site or username..." style="flex: 1; border: none; background: transparent; font-size: var(--font-size-sm); color: var(--color-viewport-text); outline: none;">
                        </div>

                        <!-- Add Password Form Dialog Panel -->
                        ${this.state.showAddForm ? `
                            <div class="add-pass-panel" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); box-shadow: var(--shadow-md);">
                                <h4 style="margin: 0; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Add New Password</h4>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Website Name</label>
                                        <input type="text" id="new-pass-site" value="${this.state.newSite}" placeholder="e.g. Google" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">URL</label>
                                        <input type="text" id="new-pass-url" value="${this.state.newUrl}" placeholder="e.g. https://google.com" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Username or Email</label>
                                        <input type="text" id="new-pass-username" value="${this.state.newUsername}" placeholder="Enter username..." style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Password</label>
                                        <input type="password" id="new-pass-password" value="${this.state.newPassword}" placeholder="Enter password..." style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                </div>
                                
                                <div style="display: flex; justify-content: flex-end; gap: var(--spacing-md); margin-top: 4px;">
                                    <button id="btn-add-pass-cancel" style="background: transparent; border: 1px solid var(--color-border-light); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer; color: var(--color-text-inactive);">Cancel</button>
                                    <button id="btn-add-pass-save" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer;">Save Password</button>
                                </div>
                            </div>
                        ` : ''}

                        <!-- List Container -->
                        <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; box-shadow: var(--shadow-sm);">
                            ${listHtml}
                            ${emptyState}
                        </div>
                    </div>
                </div>

            </div>
        `;
    }

    afterRender() {
        // Search listener
        const searchInput = this.querySelector('#pass-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.setState({ searchQuery: searchInput.value });
                // Keep cursor focus at the end of text
                const len = this.state.searchQuery.length;
                this.querySelector('#pass-search').setSelectionRange(len, len);
                this.querySelector('#pass-search').focus();
            });
        }

        // Toggle form view
        const formTrigger = this.querySelector('#btn-add-pass-trigger');
        if (formTrigger) {
            formTrigger.addEventListener('click', () => {
                this.setState({ showAddForm: !this.state.showAddForm });
            });
        }

        const formCancel = this.querySelector('#btn-add-pass-cancel');
        if (formCancel) {
            formCancel.addEventListener('click', () => {
                this.setState({ showAddForm: false });
            });
        }

        // Add credentials event
        const formSave = this.querySelector('#btn-add-pass-save');
        if (formSave) {
            formSave.addEventListener('click', () => {
                const site = this.querySelector('#new-pass-site').value.trim();
                const url = this.querySelector('#new-pass-url').value.trim();
                const username = this.querySelector('#new-pass-username').value.trim();
                const password = this.querySelector('#new-pass-password').value.trim();

                if (!site || !username || !password) {
                    alert('Please fill out Website, Username and Password.');
                    return;
                }

                this.setState({
                    passwords: [
                        ...this.state.passwords,
                        {
                            id: Date.now(),
                            site,
                            url: url || 'https://' + site.toLowerCase() + '.com',
                            username,
                            password,
                            revealed: false
                        }
                    ],
                    showAddForm: false
                });
            });
        }

        // Toggle visibility
        this.querySelectorAll('.toggle-visibility-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const passwords = this.state.passwords.map(p => {
                    if (p.id === id) {
                        return { ...p, revealed: !p.revealed };
                    }
                    return p;
                });
                this.setState({ passwords });
            });
        });

        // Copy password to clipboard
        this.querySelectorAll('.copy-pass-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const p = this.state.passwords.find(p => p.id === id);
                if (p) {
                    navigator.clipboard.writeText(p.password);
                    alert('Password copied to clipboard!');
                }
            });
        });

        // Delete credential
        this.querySelectorAll('.delete-pass-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const passwords = this.state.passwords.filter(p => p.id !== id);
                this.setState({ passwords });
            });
        });
    }
}
