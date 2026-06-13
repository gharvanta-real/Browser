import { BaseComponent } from '../BaseComponent.js';
import { BackendClient } from '../../services/BackendClient.js';
import { showWindowsHello } from '../WindowsHelloModal.js';

export class PasswordsPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            searchQuery: '',
            passwords: [],
            revealed: {},
            loading: true,
            error: '',
            status: '',
            showAddForm: false,
            newSite: '',
            newUrl: '',
            newUsername: '',
            newPassword: ''
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadPasswords();
    }

    async loadPasswords() {
        try {
            const response = await BackendClient.listPasswords();
            this.setState({
                passwords: (response.entries || []).map(entry => ({
                    id: entry.id,
                    site: entry.site,
                    url: entry.origin,
                    username: entry.username,
                    created_at: entry.created_at,
                    updated_at: entry.updated_at,
                    last_used_at: entry.last_used_at
                })),
                loading: false,
                error: ''
            });
        } catch (error) {
            this.setState({
                loading: false,
                error: `Password vault unavailable: ${error.message}`
            });
        }
    }

    template() {
        const query = this.state.searchQuery.toLowerCase().trim();
        const filtered = this.state.passwords.filter(p =>
            p.site.toLowerCase().includes(query) ||
            p.username.toLowerCase().includes(query) ||
            p.url.toLowerCase().includes(query)
        );

        const listHtml = filtered.map(p => {
            const revealedValue = this.state.revealed[p.id];
            return `
                <div class="settings-item-row" data-id="${escapeHtml(p.id)}" style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-md); border-bottom: 1px solid var(--color-viewport-border); transition: background var(--transition-fast);">
                    <div style="display: flex; align-items: center; gap: var(--spacing-md); min-width: 0; flex: 2;">
                        <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(77, 144, 254, 0.1); color: var(--color-input-focus-border); display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: var(--font-size-md);">
                            ${escapeHtml((p.site || '?').charAt(0).toUpperCase())}
                        </div>
                        <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">${escapeHtml(p.site)}</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.username)}</span>
                            <span style="font-size: 10px; color: var(--color-viewport-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.url)}</span>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: var(--spacing-md); flex: 2; justify-content: flex-end;">
                        <div style="font-family: monospace; font-size: var(--font-size-sm); color: var(--color-viewport-text); background: var(--color-input-bg); padding: 4px 12px; border-radius: 4px; min-width: 150px; text-align: left;">
                            ${revealedValue ? escapeHtml(revealedValue) : '************'}
                        </div>

                        <div style="display: flex; align-items: center; gap: 4px;">
                            <button class="action-btn toggle-visibility-btn" data-id="${escapeHtml(p.id)}" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive);" title="${revealedValue ? 'Hide Password' : 'Show Password'}">
                                <i class="hgi-stroke ${revealedValue ? 'hgi-view-off-slash' : 'hgi-view'}" style="font-size: 14px; pointer-events: none;"></i>
                            </button>
                            <button class="action-btn copy-pass-btn" data-id="${escapeHtml(p.id)}" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive);" title="Copy Password">
                                <i class="hgi-stroke hgi-link-01" style="font-size: 14px; pointer-events: none;"></i>
                            </button>
                            <button class="action-btn delete-pass-btn" data-id="${escapeHtml(p.id)}" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive);" title="Delete Credential">
                                <i class="hgi-stroke hgi-cancel-01" style="font-size: 14px; pointer-events: none; color: #E81123;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const emptyState = !this.state.loading && filtered.length === 0 ? `
            <div style="text-align: center; padding: 48px var(--spacing-md); color: var(--color-viewport-text-muted);">
                <i class="hgi-stroke hgi-lock" style="font-size: 32px; opacity: 0.5; margin-bottom: var(--spacing-sm);"></i>
                <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No saved passwords</div>
                <div style="font-size: var(--font-size-xs); margin-top: 4px;">Add a credential to store it in the encrypted local vault.</div>
            </div>
        ` : '';

        return `
            <div class="aero-passwords-page" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-text-active); font-family: var(--font-ui); overflow: hidden;">
                <div style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto; display: flex; flex-direction: column;">
                    <div style="max-width: 760px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-md);">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                                <button id="passwords-back-btn" class="page-back-btn" style="background: transparent; border: none; outline: none; cursor: pointer; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; transition: background var(--transition-fast);">
                                    <i class="hgi-stroke hgi-arrow-left-01" style="font-size: 18px;"></i>
                                </button>
                                <div>
                                    <h2 style="margin: 0; font-size: 20px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Password Manager</h2>
                                    <div style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); margin-top: 4px;">Local encrypted vault. Secrets reveal only on demand.</div>
                                </div>
                            </div>
                            <button id="btn-add-pass-trigger" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: var(--spacing-sm) var(--spacing-lg); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: var(--spacing-xs);">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add password
                            </button>
                        </div>

                        ${this.state.error ? `<div style="font-size: var(--font-size-xs); color: #E81123; background: rgba(232,17,35,0.08); border: 1px solid rgba(232,17,35,0.18); padding: var(--spacing-sm) var(--spacing-md); border-radius: 8px;">${escapeHtml(this.state.error)}</div>` : ''}
                        ${this.state.status ? `<div style="font-size: var(--font-size-xs); color: #107C10; background: rgba(16,124,16,0.08); border: 1px solid rgba(16,124,16,0.18); padding: var(--spacing-sm) var(--spacing-md); border-radius: 8px;">${escapeHtml(this.state.status)}</div>` : ''}

                        <div class="search-history-bar" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-lg); height: 40px; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; box-shadow: var(--shadow-sm);">
                            <i class="hgi-stroke hgi-search-01" style="font-size: 14px; color: var(--color-text-inactive);"></i>
                            <input type="text" id="pass-search" value="${escapeHtml(this.state.searchQuery)}" placeholder="Search passwords by site, URL, or username..." style="flex: 1; border: none; background: transparent; font-size: var(--font-size-sm); color: var(--color-viewport-text); outline: none;">
                        </div>

                        ${this.state.showAddForm ? this.renderAddForm() : ''}

                        <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; box-shadow: var(--shadow-sm);">
                            ${this.state.loading ? `<div style="padding: 40px; text-align: center; color: var(--color-viewport-text-muted); font-size: var(--font-size-sm);">Loading encrypted vault...</div>` : listHtml}
                            ${emptyState}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAddForm() {
        return `
            <div class="add-pass-panel" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); box-shadow: var(--shadow-md);">
                <h4 style="margin: 0; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Add New Password</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <label style="display: flex; flex-direction: column; gap: var(--spacing-xxs); font-size: 10px; color: var(--color-text-inactive);">Website Name
                        <input type="text" id="new-pass-site" value="${escapeHtml(this.state.newSite)}" placeholder="e.g. GitHub" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                    </label>
                    <label style="display: flex; flex-direction: column; gap: var(--spacing-xxs); font-size: 10px; color: var(--color-text-inactive);">URL
                        <input type="text" id="new-pass-url" value="${escapeHtml(this.state.newUrl)}" placeholder="e.g. https://github.com" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                    </label>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                    <label style="display: flex; flex-direction: column; gap: var(--spacing-xxs); font-size: 10px; color: var(--color-text-inactive);">Username or Email
                        <input type="text" id="new-pass-username" value="${escapeHtml(this.state.newUsername)}" placeholder="Enter username..." style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                    </label>
                    <label style="display: flex; flex-direction: column; gap: var(--spacing-xxs); font-size: 10px; color: var(--color-text-inactive);">Password
                        <input type="password" id="new-pass-password" value="${escapeHtml(this.state.newPassword)}" placeholder="Enter password..." style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                    </label>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: var(--spacing-md); margin-top: 4px;">
                    <button id="btn-add-pass-cancel" style="background: transparent; border: 1px solid var(--color-border-light); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer; color: var(--color-text-inactive);">Cancel</button>
                    <button id="btn-add-pass-save" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer;">Save Password</button>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.querySelector('#passwords-back-btn')?.addEventListener('click', () => {
            this.navigateBack();
        });

        this.querySelector('#pass-search')?.addEventListener('input', event => {
            this.setState({ searchQuery: event.target.value });
            const searchInput = this.querySelector('#pass-search');
            searchInput?.focus();
            searchInput?.setSelectionRange(this.state.searchQuery.length, this.state.searchQuery.length);
        });

        this.querySelector('#btn-add-pass-trigger')?.addEventListener('click', () => {
            this.setState({ showAddForm: !this.state.showAddForm, status: '', error: '' });
        });

        this.querySelector('#btn-add-pass-cancel')?.addEventListener('click', () => {
            this.setState({ showAddForm: false, newPassword: '' });
        });

        this.querySelector('#btn-add-pass-save')?.addEventListener('click', () => this.saveNewPassword());

        this.querySelectorAll('.toggle-visibility-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleReveal(btn.getAttribute('data-id')));
        });

        this.querySelectorAll('.copy-pass-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copyPassword(btn.getAttribute('data-id')));
        });

        this.querySelectorAll('.delete-pass-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deletePassword(btn.getAttribute('data-id')));
        });
    }

    async saveNewPassword() {
        const site = this.querySelector('#new-pass-site')?.value.trim();
        const url = this.querySelector('#new-pass-url')?.value.trim();
        const username = this.querySelector('#new-pass-username')?.value.trim();
        const password = this.querySelector('#new-pass-password')?.value || '';

        if (!site || !username || !password) {
            this.setState({ error: 'Website, username, and password are required.', status: '' });
            return;
        }

        try {
            const entry = await BackendClient.savePassword({
                site,
                origin: url || `https://${site.toLowerCase().replace(/\s+/g, '')}.com`,
                username,
                password
            });
            this.setState({
                passwords: [{ id: entry.id, site: entry.site, url: entry.origin, username: entry.username }, ...this.state.passwords],
                showAddForm: false,
                newSite: '',
                newUrl: '',
                newUsername: '',
                newPassword: '',
                status: 'Password saved to encrypted local vault.',
                error: ''
            });
        } catch (error) {
            this.setState({ error: `Save failed: ${error.message}`, status: '' });
        }
    }

    async toggleReveal(id) {
        if (!id) return;
        if (this.state.revealed[id]) {
            const revealed = { ...this.state.revealed };
            delete revealed[id];
            this.setState({ revealed });
            return;
        }

        // Biometric security gate
        const verified = await showWindowsHello("reveal this password");
        if (!verified) {
            this.setState({ error: 'Verification failed: Biometric check rejected.', status: '' });
            return;
        }

        try {
            const response = await BackendClient.revealPassword(id);
            this.setState({
                revealed: { ...this.state.revealed, [id]: response.password },
                status: 'Password revealed locally.',
                error: ''
            });
        } catch (error) {
            this.setState({ error: `Reveal failed: ${error.message}`, status: '' });
        }
    }

    async copyPassword(id) {
        if (!id) return;

        // Biometric security gate
        const verified = await showWindowsHello("copy this password to clipboard");
        if (!verified) {
            this.setState({ error: 'Verification failed: Biometric check rejected.', status: '' });
            return;
        }

        try {
            const response = this.state.revealed[id]
                ? { password: this.state.revealed[id] }
                : await BackendClient.revealPassword(id);
            await navigator.clipboard.writeText(response.password);
            this.setState({ status: 'Password copied to clipboard.', error: '' });
        } catch (error) {
            this.setState({ error: `Copy failed: ${error.message}`, status: '' });
        }
    }

    async deletePassword(id) {
        if (!id) return;

        // Biometric security gate
        const verified = await showWindowsHello("delete this saved credential");
        if (!verified) {
            this.setState({ error: 'Verification failed: Biometric check rejected.', status: '' });
            return;
        }

        try {
            await BackendClient.deletePassword(id);
            const revealed = { ...this.state.revealed };
            delete revealed[id];
            this.setState({
                passwords: this.state.passwords.filter(p => p.id !== id),
                revealed,
                status: 'Password deleted.',
                error: ''
            });
        } catch (error) {
            this.setState({ error: `Delete failed: ${error.message}`, status: '' });
        }
    }
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
