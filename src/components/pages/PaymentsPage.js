import { BaseComponent } from '../BaseComponent.js';
import { showWindowsHello } from '../WindowsHelloModal.js';

export class PaymentsPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            cards: [
                { id: 1, type: 'Visa', number: '•••• •••• •••• 4321', holder: 'Alex Morgan', expiry: '08/29', brandColor: 'linear-gradient(135deg, #1e3c72, #2a5298)' },
                { id: 2, type: 'Mastercard', number: '•••• •••• •••• 9876', holder: 'Alex Morgan', expiry: '12/28', brandColor: 'linear-gradient(135deg, #f12711, #f5af19)' }
            ],
            showAddForm: false,
            newType: 'Visa',
            newNumber: '',
            newHolder: '',
            newExpiry: ''
        };
    }

    template() {
        const cardsHtml = this.state.cards.map(c => `
            <!-- Credit Card graphic visualizer -->
            <div style="width: 280px; height: 160px; border-radius: 12px; background: ${c.brandColor}; color: #FFFFFF; padding: var(--spacing-lg); display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-lg); position: relative; overflow: hidden; flex-shrink: 0; box-sizing: border-box;">
                <!-- Decorative glass orb -->
                <div style="position: absolute; right: -20px; top: -20px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.06); filter: blur(10px);"></div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; z-index: 2;">
                    <span style="font-weight: var(--font-weight-bold); font-size: var(--font-size-md); font-style: italic; letter-spacing: -0.5px;">${c.type}</span>
                    <!-- NFC contact-less pay indicator -->
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.85;"><path d="M5 8a7 7 0 0 1 14 0"></path><path d="M7 11a5 5 0 0 1 10 0"></path><path d="M9 14a3 3 0 0 1 6 0"></path><circle cx="12" cy="17" r="1"></circle></svg>
                </div>
                
                <div style="font-family: monospace; font-size: 16px; letter-spacing: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); z-index: 2; margin: 12px 0;">
                    ${c.number}
                </div>
                
                <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.9; text-transform: uppercase; z-index: 2;">
                    <div>
                        <div style="font-size: 7px; opacity: 0.6; margin-bottom: 2px;">Cardholder</div>
                        <div style="font-weight: var(--font-weight-semibold);">${c.holder}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 7px; opacity: 0.6; margin-bottom: 2px;">Expires</div>
                        <div style="font-weight: var(--font-weight-semibold);">${c.expiry}</div>
                    </div>
                </div>

                <!-- Delete card overlay icon -->
                <button class="delete-card-btn" data-id="${c.id}" style="position: absolute; right: 10px; bottom: 10px; background: rgba(0,0,0,0.3); border: none !important; width: 22px; height: 22px; border-radius: 50%; color: #FFFFFF; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s ease;" title="Delete Card">
                    <i class="hgi-stroke hgi-cancel-01" style="font-size: 11px; pointer-events: none;"></i>
                </button>
            </div>
        `).join('');

        return `
            <div class="aero-payments-page" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-text-active); font-family: var(--font-ui); overflow: hidden;">
                <div style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto; display: flex; flex-direction: column;">
                    <div style="max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: var(--spacing-md);">
                        
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                                <button id="payments-back-btn" class="page-back-btn" style="background: transparent; border: none; outline: none; cursor: pointer; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; transition: background var(--transition-fast);">
                                    <i class="hgi-stroke hgi-arrow-left-01" style="font-size: 18px;"></i>
                                </button>
                                <h2 style="margin: 0; font-size: 20px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Payment Methods</h2>
                            </div>
                            <button id="btn-add-card-trigger" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: var(--spacing-sm) var(--spacing-lg); border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: var(--spacing-xs);">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add card
                            </button>
                        </div>

                        <!-- Card Autofill Switch Row -->
                        <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-md); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-sm);">
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Autofill Payment Methods</span>
                                <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Saves credit cards and fills them in checkout forms.</span>
                            </div>
                            <label class="switch-toggle" style="position: relative; display: inline-block; width: 34px; height: 20px;">
                                <input type="checkbox" checked style="opacity: 0; width: 0; height: 0;">
                                <span class="slider-round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-border-dark); transition: .4s; border-radius: 34px;"></span>
                            </label>
                        </div>

                        <!-- Add Card Form panel -->
                        ${this.state.showAddForm ? `
                            <div class="add-card-panel" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); box-shadow: var(--shadow-md);">
                                <h4 style="margin: 0; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Register Payment Card</h4>
                                
                                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: var(--spacing-md);">
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Card Type</label>
                                        <select id="new-card-type" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                            <option value="Visa">Visa</option>
                                            <option value="Mastercard">Mastercard</option>
                                            <option value="Amex">American Express</option>
                                        </select>
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Card Number</label>
                                        <input type="text" id="new-card-number" value="${this.state.newNumber}" placeholder="xxxx xxxx xxxx xxxx" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                </div>

                                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-md);">
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Cardholder Name</label>
                                        <input type="text" id="new-card-holder" value="${this.state.newHolder}" placeholder="e.g. Alex Morgan" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xxs);">
                                        <label style="font-size: 10px; color: var(--color-text-inactive);">Expiration (MM/YY)</label>
                                        <input type="text" id="new-card-expiry" value="${this.state.newExpiry}" placeholder="MM/YY" style="background: var(--color-input-bg); border: 1px solid var(--color-border-light); border-radius: 6px; padding: var(--spacing-sm); font-size: var(--font-size-xs); color: var(--color-viewport-text); outline: none;">
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: flex-end; gap: var(--spacing-md); margin-top: 4px;">
                                    <button id="btn-add-card-cancel" style="background: transparent; border: 1px solid var(--color-border-light); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer; color: var(--color-text-inactive);">Cancel</button>
                                    <button id="btn-add-card-save" style="background: var(--color-input-focus-border); color: #FFFFFF; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); padding: 6px var(--spacing-lg); border-radius: 6px; cursor: pointer;">Save Card</button>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Cards visual container -->
                        <h4 style="margin: var(--spacing-xs) 0 0; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Saved Credit Cards</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-lg); padding-bottom: 20px;">
                            ${cardsHtml}
                            ${this.state.cards.length === 0 ? `
                                <div style="width: 100%; text-align: center; padding: 40px; color: var(--color-viewport-text-muted); background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px;">
                                    <i class="hgi-stroke hgi-credit-card" style="font-size: 32px; opacity: 0.5; margin-bottom: var(--spacing-sm);"></i>
                                    <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No credit cards registered</div>
                                </div>
                            ` : ''}
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    afterRender() {
        this.querySelector('#payments-back-btn')?.addEventListener('click', () => {
            this.navigateBack();
        });

        // Toggle Form
        const formTrigger = this.querySelector('#btn-add-card-trigger');
        if (formTrigger) {
            formTrigger.addEventListener('click', () => {
                this.setState({ showAddForm: !this.state.showAddForm });
            });
        }

        const formCancel = this.querySelector('#btn-add-card-cancel');
        if (formCancel) {
            formCancel.addEventListener('click', () => {
                this.setState({ showAddForm: false });
            });
        }

        // Save card event
        const formSave = this.querySelector('#btn-add-card-save');
        if (formSave) {
            formSave.addEventListener('click', async () => {
                const type = this.querySelector('#new-card-type').value;
                const num = this.querySelector('#new-card-number').value.trim();
                const holder = this.querySelector('#new-card-holder').value.trim();
                const expiry = this.querySelector('#new-card-expiry').value.trim();

                if (!num || !holder || !expiry) {
                    alert('Please complete all card details.');
                    return;
                }

                // Biometric security check
                const verified = await showWindowsHello("register this credit card");
                if (!verified) return;

                // Format number to hide details
                const formattedNum = '•••• •••• •••• ' + num.slice(-4);

                let brandColor = 'linear-gradient(135deg, #1e3c72, #2a5298)';
                if (type === 'Mastercard') {
                    brandColor = 'linear-gradient(135deg, #f12711, #f5af19)';
                } else if (type === 'Amex') {
                    brandColor = 'linear-gradient(135deg, #11998e, #38ef7d)';
                }

                this.setState({
                    cards: [
                        ...this.state.cards,
                        {
                            id: Date.now(),
                            type,
                            number: formattedNum,
                            holder,
                            expiry,
                            brandColor
                        }
                    ],
                    showAddForm: false
                });
            });
        }

        // Delete card event
        this.querySelectorAll('.delete-card-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                // Biometric security check
                const verified = await showWindowsHello("delete this credit card");
                if (!verified) return;

                const id = parseInt(btn.getAttribute('data-id'));
                const cards = this.state.cards.filter(c => c.id !== id);
                this.setState({ cards });
            });
        });
    }
}
