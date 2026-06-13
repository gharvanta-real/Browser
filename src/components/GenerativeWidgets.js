import { BaseComponent } from './BaseComponent.js';

export class FlightComparisonWidget extends BaseComponent {
    constructor() {
        super();
        this.state = {
            flights: [],
            selectedIdx: 0
        };
    }

    connectedCallback() {
        const rawFlights = this.getAttribute('flights');
        if (rawFlights) {
            try {
                this.setState({ flights: JSON.parse(rawFlights) });
            } catch (e) {
                console.error('Failed to parse flights attribute:', e);
            }
        }
        super.connectedCallback();
    }

    render() {
        const flights = this.state.flights || [];
        if (flights.length === 0) {
            this.innerHTML = `<div style="padding: 12px; color: var(--color-text-inactive); font-size: 11px; text-align: center;">No flight data available</div>`;
            return;
        }

        this.innerHTML = `
            <div class="flight-widget-container" style="display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.18); border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md); padding: var(--spacing-sm); font-family: var(--font-ui); margin-top: 6px;">
                <div style="font-size: 11px; font-weight: 600; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--color-border-light); padding-bottom: 4px; margin-bottom: 2px;">
                    <span>Flight Deals Found</span>
                    <span style="color: var(--color-input-focus-border); font-size: 10px; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="hgi-stroke hgi-airplane-01" style="font-size: 11px;"></i> Sorted by price
                    </span>
                </div>
                
                <div class="flight-list" style="display: flex; flex-direction: column; gap: 6px;">
                    ${flights.map((flight, idx) => `
                        <div class="flight-item ${this.state.selectedIdx === idx ? 'active' : ''}" data-idx="${idx}" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: var(--border-radius-sm); border: 1px solid ${this.state.selectedIdx === idx ? 'var(--color-input-focus-border)' : 'rgba(0,0,0,0.1)'}; background: ${this.state.selectedIdx === idx ? 'rgba(77, 144, 254, 0.08)' : 'rgba(255,255,255,0.02)'}; cursor: pointer; transition: all var(--transition-fast);">
                            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${this.state.selectedIdx === idx ? 'var(--color-input-focus-border)' : 'var(--color-text-inactive)'}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; text-transform: uppercase;">
                                    ${flight.airline ? flight.airline.slice(0, 2) : 'FL'}
                                </div>
                                <div style="display: flex; flex-direction: column;">
                                    <span style="font-size: 11px; font-weight: 600; color: var(--color-text-active);">${flight.airline || 'Unknown Airline'}</span>
                                    <span style="font-size: 9px; color: var(--color-text-inactive);">${flight.code || 'Direct'} · ${flight.duration || 'N/A'}</span>
                                </div>
                            </div>
                            <div style="text-align: right; display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: 12px; font-weight: 700; color: ${this.state.selectedIdx === idx ? 'var(--color-input-focus-border)' : 'var(--color-text-active)'};">${flight.price || 'N/A'}</span>
                                <span style="font-size: 8px; color: var(--color-text-inactive); text-transform: uppercase; letter-spacing: 0.5px;">${flight.stops || 'Nonstop'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <button class="flight-book-btn" style="width: 100%; height: 28px; background: var(--color-input-focus-border); color: #FFFFFF; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: var(--spacing-xs); margin-top: 4px; transition: all var(--transition-fast);">
                    <i class="hgi-stroke hgi-checkmark-circle-02" style="font-size: 12px;"></i> Book Selected Flight
                </button>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const items = this.querySelectorAll('.flight-item');
        items.forEach(item => {
            if (item._clickBound) return;
            item._clickBound = true;
            item.addEventListener('click', () => {
                const idx = parseInt(item.getAttribute('data-idx'), 10);
                this.setState({ selectedIdx: idx });
            });
        });

        const btn = this.querySelector('.flight-book-btn');
        if (btn && !btn._clickBound) {
            btn._clickBound = true;
            btn.addEventListener('click', () => {
                const selected = this.state.flights[this.state.selectedIdx];
                if (selected) {
                    const event = new CustomEvent('trigger-flights-booking', {
                        detail: { flight: selected },
                        bubbles: true,
                        composed: true
                    });
                    this.dispatchEvent(event);
                }
            });
        }
    }
}

export class PriceTrendWidget extends BaseComponent {
    constructor() {
        super();
        this.state = {
            trend: 'stable',
            currentPrice: '',
            history: []
        };
    }

    connectedCallback() {
        this.setState({
            trend: this.getAttribute('trend') || 'stable',
            currentPrice: this.getAttribute('current') || '',
            history: JSON.parse(this.getAttribute('history') || '[]')
        });
        super.connectedCallback();
    }

    render() {
        const trend = this.state.trend;
        const trendColors = {
            low: '#188038',
            high: '#E81123',
            stable: 'var(--color-text-inactive)'
        };
        const trendLabel = {
            low: 'Lowest price matching target',
            high: 'Higher than usual',
            stable: 'Stable price trend'
        }[trend];
        const trendIcon = {
            low: 'hgi-arrow-down-01',
            high: 'hgi-arrow-up-01',
            stable: 'hgi-equal'
        }[trend];

        this.innerHTML = `
            <div class="price-widget-container" style="display: flex; flex-direction: column; gap: 6px; width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.18); border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md); padding: var(--spacing-sm); font-family: var(--font-ui); margin-top: 6px;">
                <div style="font-size: 11px; font-weight: 600; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: space-between;">
                    <span>Price Trend Analytics</span>
                    <span style="color: ${trendColors[trend]}; font-size: 10px; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                        <i class="hgi-stroke ${trendIcon}" style="font-size: 11px;"></i> ${trendLabel}
                    </span>
                </div>
                
                <div style="display: flex; align-items: baseline; gap: var(--spacing-xs); margin: 4px 0;">
                    <span style="font-size: 16px; font-weight: 700; color: var(--color-text-active);">${this.state.currentPrice}</span>
                    <span style="font-size: 8px; color: var(--color-text-inactive);">Current online price</span>
                </div>

                <div class="price-trend-graph" style="display: flex; align-items: flex-end; justify-content: space-between; height: 32px; padding: 4px 10px 0; background: rgba(0,0,0,0.15); border-radius: var(--border-radius-sm); border: 1px solid var(--color-border-light);">
                    ${this.state.history.map(val => `
                        <div class="price-bar" style="width: 14%; background: ${trendColors[trend]}; opacity: 0.6; height: ${val}%; border-top-left-radius: 2px; border-top-right-radius: 2px; transition: height 0.3s ease;" title="Price level: ${val}%"></div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

export class SecurityDetailsWidget extends BaseComponent {
    constructor() {
        super();
        this.state = {
            domain: '',
            safety: 'safe',
            trackers: 0
        };
    }

    connectedCallback() {
        this.setState({
            domain: this.getAttribute('domain') || '',
            safety: this.getAttribute('safety') || 'safe',
            trackers: parseInt(this.getAttribute('trackers') || '0', 10)
        });
        super.connectedCallback();
    }

    render() {
        const safety = this.state.safety;
        const color = safety === 'safe' ? '#188038' : safety === 'warning' ? '#FFBA00' : '#E81123';
        const label = safety.toUpperCase();

        this.innerHTML = `
            <div class="security-widget-container" style="display: flex; flex-direction: column; gap: var(--spacing-sm); width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.18); border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md); padding: var(--spacing-sm); font-family: var(--font-ui); margin-top: 6px;">
                <div style="font-size: 11px; font-weight: 600; color: var(--color-text-inactive); border-bottom: 1px solid var(--color-border-light); padding-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                    <span>Domain Security Summary</span>
                    <span style="background: ${color}20; color: ${color}; border: 1px solid ${color}40; border-radius: 4px; padding: 1px 6px; font-size: 9px; font-weight: 600;">
                        ${label}
                    </span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="color: var(--color-text-inactive);">Secure SSL Certificate:</span>
                        <span style="font-weight: 500; color: var(--color-text-active);"><i class="hgi-stroke hgi-lock" style="font-size: 10px; color: #188038; vertical-align: middle;"></i> Encrypted</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="color: var(--color-text-inactive);">Trackers Blocked:</span>
                        <span style="font-weight: 600; color: ${this.state.trackers > 0 ? 'var(--color-input-focus-border)' : 'var(--color-text-active)'};">${this.state.trackers} tracker${this.state.trackers !== 1 ? 's' : ''}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="color: var(--color-text-inactive);">Domain Hostname:</span>
                        <span style="font-weight: 500; color: var(--color-text-active); font-family: monospace;">${this.state.domain}</span>
                    </div>
                </div>
            </div>
        `;
    }
}
