import { BaseComponent } from '../BaseComponent.js';
import { BackendClient } from '../../services/BackendClient.js';

export class SecurityPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            auditEvents: [],
            readiness: null,
            loading: true,
            blockedTrackers: window.AppState?.blockedTrackers || 0,
            blockedTrackerLog: window.AppState?.blockedTrackerLog || [],
            taskLogs: window.AppState?.taskLogs || []
        };
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            this.setState({
                blockedTrackers: state.blockedTrackers || 0,
                blockedTrackerLog: state.blockedTrackerLog || [],
                taskLogs: state.taskLogs || []
            });
        });
        super.connectedCallback();
        this.load();
    }

    async load() {
        const [audit, readiness] = await Promise.all([
            BackendClient.getAuditLog(),
            BackendClient.request('/v1/readiness', { fallback: null })
        ]);
        this.setState({
            auditEvents: audit.events || [],
            readiness,
            loading: false
        });
    }

    template() {
        const partialAreas = (this.state.readiness?.items || []).filter(item => item.status === 'partial');
        const blocked = this.state.blockedTrackerLog.slice(0, 8);
        const logs = this.state.taskLogs.slice(-8).reverse();
        const audits = this.state.auditEvents.slice(0, 8);

        return `
            <div class="security-page" style="height: 100%; overflow-y: auto; background: var(--color-viewport-bg); color: var(--color-viewport-text); font-family: var(--font-ui); padding: 36px;">
                <div style="max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px;">
                    <div style="display: flex; justify-content: space-between; gap: 16px; align-items: flex-start;">
                        <div>
                            <h1 style="margin: 0; font-size: 26px; font-weight: 700;">Security & Privacy Center</h1>
                            <p style="margin: 6px 0 0; color: var(--color-viewport-text-muted); font-size: 13px;">Native browser controls, AI action gates, tracker blocking, and production readiness.</p>
                        </div>
                        <button id="refresh-security" style="border: 1px solid var(--color-viewport-border); background: var(--color-card-bg); color: var(--color-viewport-text); border-radius: 8px; padding: 9px 12px; cursor: pointer; font-size: 12px;">Refresh</button>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;">
                        ${this.metricCard('Trackers blocked', this.state.blockedTrackers, 'webRequest shield is active')}
                        ${this.metricCard('Audit events', this.state.auditEvents.length, 'backend action log')}
                        ${this.metricCard('Partial PRD areas', partialAreas.length, 'implemented but not production-complete')}
                        ${this.metricCard('Native gates', 'On', 'Electron confirmation for gated actions')}
                    </div>

                    <div style="display: grid; grid-template-columns: 1.1fr .9fr; gap: 14px;">
                        ${this.panel('Recent blocked trackers', blocked.length ? blocked.map(item => `
                            <div style="padding: 10px 0; border-bottom: 1px solid var(--color-viewport-border);">
                                <strong style="display: block; font-size: 12px;">${this.host(item.url)}</strong>
                                <span style="display: block; font-size: 11px; color: var(--color-viewport-text-muted); word-break: break-all;">${item.resourceType || 'resource'} - ${item.url}</span>
                            </div>
                        `).join('') : this.empty('No tracker blocks in this session yet.'))}

                        ${this.panel('Live permission/action log', logs.length ? logs.map(log => `
                            <div style="display: flex; gap: 9px; padding: 10px 0; border-bottom: 1px solid var(--color-viewport-border);">
                                <span style="width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; background: ${log.status === 'success' ? '#188038' : log.status === 'running' ? '#1A73E8' : '#D93025'};"></span>
                                <span style="font-size: 12px; line-height: 1.45;">${log.text}</span>
                            </div>
                        `).join('') : this.empty('No live action logs.'))}
                    </div>

                    <div style="display: grid; grid-template-columns: .9fr 1.1fr; gap: 14px;">
                        ${this.panel('Backend audit trail', audits.length ? audits.map(event => `
                            <div style="padding: 10px 0; border-bottom: 1px solid var(--color-viewport-border);">
                                <strong style="display: block; font-size: 12px;">${event.decision} - ${event.required_tier}</strong>
                                <span style="display: block; font-size: 11px; color: var(--color-viewport-text-muted);">${event.origin || 'local'} - ${event.target_description || 'browser action'}</span>
                            </div>
                        `).join('') : this.empty('No backend audit events yet.'))}

                        ${this.panel('Remaining production gaps', partialAreas.slice(0, 8).map(item => `
                            <div style="padding: 10px 0; border-bottom: 1px solid var(--color-viewport-border);">
                                <strong style="display: block; font-size: 12px;">${item.area.replace(/_/g, ' ')}</strong>
                                <span style="display: block; font-size: 11px; color: var(--color-viewport-text-muted);">${(item.missing_for_production || []).slice(0, 3).join(', ')}</span>
                            </div>
                        `).join(''))}
                    </div>
                </div>
            </div>
        `;
    }

    metricCard(label, value, desc) {
        return `
            <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; padding: 14px;">
                <div style="font-size: 22px; font-weight: 750;">${value}</div>
                <div style="font-size: 12px; font-weight: 650; margin-top: 3px;">${label}</div>
                <div style="font-size: 10px; color: var(--color-viewport-text-muted); margin-top: 4px;">${desc}</div>
            </div>
        `;
    }

    panel(title, body) {
        return `
            <section style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 8px; padding: 16px;">
                <h2 style="margin: 0 0 8px; font-size: 14px;">${title}</h2>
                ${body}
            </section>
        `;
    }

    empty(text) {
        return `<div style="padding: 22px 0; color: var(--color-viewport-text-muted); font-size: 12px;">${text}</div>`;
    }

    host(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return 'blocked resource';
        }
    }

    afterRender() {
        const refresh = this.querySelector('#refresh-security');
        if (refresh) refresh.addEventListener('click', () => this.load());
    }
}
