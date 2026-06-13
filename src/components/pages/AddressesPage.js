import { BaseComponent } from '../BaseComponent.js';

export class AddressesPage extends BaseComponent {
    constructor() {
        super();
        const profile = window.AppState?.autofillProfile || {};
        const savedAddress = profile.fullName || profile.addressLine1 ? [{
            id: 1,
            label: 'Primary',
            name: profile.fullName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            street: profile.addressLine1 || '',
            street2: profile.addressLine2 || '',
            city: profile.city || '',
            state: profile.state || '',
            pin: profile.zip || '',
            country: profile.country || 'India'
        }] : [];
        this.state = {
            searchQuery: '',
            addresses: savedAddress,
            showAddForm: false,
            newLabel: 'Home',
            newName: profile.fullName || '',
            newEmail: profile.email || '',
            newPhone: profile.phone || '',
            newStreet: profile.addressLine1 || '',
            newStreet2: profile.addressLine2 || '',
            newCity: profile.city || '',
            newState: profile.state || '',
            newPin: profile.zip || '',
            newCountry: profile.country || 'India'
        };
    }

    template() {
        const query = this.state.searchQuery.toLowerCase().trim();
        const filtered = this.state.addresses.filter(a => 
            a.label.toLowerCase().includes(query) || 
            a.street.toLowerCase().includes(query) || 
            a.city.toLowerCase().includes(query)
        );

        const listHtml = filtered.map(a => `
            <div class="settings-item-row" data-id="${a.id}" style="display: flex; justify-content: space-between; padding: var(--spacing-md); border-bottom: 1px solid var(--color-viewport-border); transition: background var(--transition-fast);">
                <div style="display: flex; gap: var(--spacing-md); min-width: 0; flex: 1;">
                    <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(24, 128, 56, 0.1); color: #188038; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: var(--font-size-md);">
                        <i class="hgi-stroke hgi-location-01" style="font-size: 14px;"></i>
                    </div>
                    <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                        <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">${a.label}</span>
                            <span style="font-size: 9px; font-weight: var(--font-weight-semibold); color: #188038; background: rgba(24,128,56,0.1); padding: 1px 6px; border-radius: 4px;">Autofill</span>
                        </div>
                        <span style="font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); color: var(--color-viewport-text); margin-top: 2px;">${a.name}</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); margin-top: 1px;">${a.email || 'No email'} - ${a.phone || 'No phone'}</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); margin-top: 1px;">${a.street}${a.street2 ? ', ' + a.street2 : ''}, ${a.city}, ${a.state} ${a.pin}, ${a.country}</span>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 4px;">
                    <!-- Delete button -->
                    <button class="action-btn delete-address-btn" data-id="${a.id}" style="background: transparent; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: var(--color-text-inactive);" title="Delete Address">
                        <i class="hgi-stroke hgi-cancel-01" style="font-size: 14px; pointer-events: none; color: #E81123;"></i>
                    </button>
                </div>
            </div>
        `).join('');

        const emptyState = filtered.length === 0 ? `
            <div style="text-align: center; padding: 48px var(--spacing-md); color: var(--color-viewport-text-muted);">
                <i class="hgi-stroke hgi-location-01" style="font-size: 32px; opacity: 0.5; margin-bottom: var(--spacing-sm);"></i>
                <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No addresses found</div>
            </div>
        ` : '';

        return `
            <div class="aero-addresses-page" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-text-active); font-family: var(--font-ui); overflow: hidden;">
                <div style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto; display: flex; flex-direction: column;">
                    <div style="max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-md);">
                        
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Addresses & Autofill</h2>
                            <button id="btn-add-address-trigger" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: var(--spacing-sm) var(--spacing-lg); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: var(--spacing-xs);">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add address
                            </button>
                        </div>

                        <!-- Address Autofill Switch Row -->
                        <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Autofill Addresses & Contact Info</span>
                                <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Saves addresses and automatically fills out web checkout shipping forms.</span>
                            </div>
                            <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px;">
                                <input type="checkbox" checked style="opacity: 0; width: 0; height: 0;">
                                <span class="slider-round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-border-dark); transition: .4s; border-radius: 34px;"></span>
                            </label>
                        </div>

                        <!-- Search Input bar -->
                        <div class="search-history-bar" style="display: flex; align-items: center; gap: var(--spacing-sm); padding: 0 var(--spacing-lg); height: 40px; background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; box-shadow: var(--shadow-sm);">
                            <i class="hgi-stroke hgi-search-01" style="font-size: 14px; color: var(--color-text-inactive);"></i>
                            <input type="text" id="address-search" value="${this.state.searchQuery}" placeholder="Search addresses by label, street, or city..." style="flex: 1; border: none; background: transparent; font-size: var(--font-size-sm); color: var(--color-viewport-text); outline: none;">
                        </div>

                        <!-- Add Address Form Dialog panel -->
                        ${this.state.showAddForm ? `
                            <div class="add-address-panel" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); box-shadow: var(--shadow-md);">
                                <h4 style="margin: 0; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Add Saved Address</h4>
                                
                                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: var(--spacing-md);">
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Address Label</label>
                                        <input type="text" id="new-addr-label" value="${this.state.newLabel}" placeholder="e.g. Home, Work" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Full Name</label>
                                        <input type="text" id="new-addr-name" value="${this.state.newName}" placeholder="Enter full name..." style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                </div>

                                <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                    <label style="font-size: 10px; color: var(--color-text-inactive);">Street Address</label>
                                    <input type="text" id="new-addr-street" value="${this.state.newStreet}" placeholder="Apt, Suite, Street name..." style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Email</label>
                                        <input type="email" id="new-addr-email" value="${this.state.newEmail}" placeholder="you@example.com" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Phone</label>
                                        <input type="tel" id="new-addr-phone" value="${this.state.newPhone}" placeholder="+91..." style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                </div>

                                <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                    <label style="font-size: 10px; color: var(--color-text-inactive);">Address Line 2</label>
                                    <input type="text" id="new-addr-street2" value="${this.state.newStreet2}" placeholder="Apartment, floor, landmark..." style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                </div>

                                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: var(--spacing-md);">
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">City</label>
                                        <input type="text" id="new-addr-city" value="${this.state.newCity}" placeholder="Seattle" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">State</label>
                                        <input type="text" id="new-addr-state" value="${this.state.newState}" placeholder="WA" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">ZIP / PIN Code</label>
                                        <input type="text" id="new-addr-pin" value="${this.state.newPin}" placeholder="98101" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                </div>

                                <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                    <label style="font-size: 10px; color: var(--color-text-inactive);">Country</label>
                                    <input type="text" id="new-addr-country" value="${this.state.newCountry}" placeholder="United States" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                </div>

                                <div style="display: flex; justify-content: flex-end; gap: var(--spacing-md); margin-top: 4px;">
                                    <button id="btn-add-addr-cancel" style="background: transparent; border: 1px solid var(--color-border-light); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer; color: var(--color-text-inactive);">Cancel</button>
                                    <button id="btn-add-addr-save" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer;">Save Address</button>
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
        const searchInput = this.querySelector('#address-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.setState({ searchQuery: searchInput.value });
                const len = this.state.searchQuery.length;
                this.querySelector('#address-search').setSelectionRange(len, len);
                this.querySelector('#address-search').focus();
            });
        }

        // Toggle form view
        const formTrigger = this.querySelector('#btn-add-address-trigger');
        if (formTrigger) {
            formTrigger.addEventListener('click', () => {
                this.setState({ showAddForm: !this.state.showAddForm });
            });
        }

        const formCancel = this.querySelector('#btn-add-addr-cancel');
        if (formCancel) {
            formCancel.addEventListener('click', () => {
                this.setState({ showAddForm: false });
            });
        }

        // Save address event
        const formSave = this.querySelector('#btn-add-addr-save');
        if (formSave) {
            formSave.addEventListener('click', () => {
                const label = this.querySelector('#new-addr-label').value.trim() || 'Home';
                const name = this.querySelector('#new-addr-name').value.trim();
                const email = this.querySelector('#new-addr-email').value.trim();
                const phone = this.querySelector('#new-addr-phone').value.trim();
                const street = this.querySelector('#new-addr-street').value.trim();
                const street2 = this.querySelector('#new-addr-street2').value.trim();
                const city = this.querySelector('#new-addr-city').value.trim();
                const state = this.querySelector('#new-addr-state').value.trim();
                const pin = this.querySelector('#new-addr-pin').value.trim();
                const country = this.querySelector('#new-addr-country').value.trim() || 'India';

                if (!name || !street || !city || !state || !pin) {
                    alert('Please complete Name, Street, City, State and ZIP code.');
                    return;
                }

                this.setState({
                    addresses: [{
                        id: Date.now(),
                        label,
                        name,
                        email,
                        phone,
                        street,
                        street2,
                        city,
                        state,
                        pin,
                        country
                    }],
                    showAddForm: false
                });
                window.AppState.update(appState => {
                    appState.autofillProfile = {
                        fullName: name,
                        email,
                        phone,
                        addressLine1: street,
                        addressLine2: street2,
                        city,
                        state,
                        zip: pin,
                        country
                    };
                });
            });
        }

        // Delete address event
        this.querySelectorAll('.delete-address-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const addresses = this.state.addresses.filter(a => a.id !== id);
                this.setState({ addresses });
            });
        });
    }
}
