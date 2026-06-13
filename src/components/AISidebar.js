import { BaseComponent } from './BaseComponent.js';
import { BackendClient } from '../services/BackendClient.js';

export class AISidebar extends BaseComponent {
    constructor() {
        super();
        this.isThinking = false;
        this.activeTaskIndex = -1;
        this.simulatedTasks = [];
        this.backgroundTasks = [];
        this.state = {
            ...this.state,
            isMoreMenuOpen: false,
            backgroundTasks: []
        };
        this.lastMoreMenuOpenState = false;
    }

    formatMessageText(text) {
        if (!text) return '';
        // Escape HTML to prevent injection
        let escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Inline formatting
        escaped = escaped
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');

        // Process lines for lists and paragraphs
        const lines = escaped.split('\n');
        let inList = false;
        let formattedLines = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            // Match unordered lists starting with '*' or '-'
            const listMatch = line.match(/^(\s*)[\*\-]\s+(.*)$/);
            if (listMatch) {
                if (!inList) {
                    formattedLines.push('<ul style="margin: 4px 0; padding-left: 20px;">');
                    inList = true;
                }
                formattedLines.push(`<li style="margin: 2px 0;">${listMatch[2]}</li>`);
            } else {
                if (inList) {
                    formattedLines.push('</ul>');
                    inList = false;
                }
                if (trimmed) {
                    formattedLines.push(`<p style="margin: 4px 0;">${trimmed}</p>`);
                } else {
                    formattedLines.push('<div style="height: 8px;"></div>');
                }
            }
        });

        if (inList) {
            formattedLines.push('</ul>');
        }

        return formattedLines.join('');
    }

    renderWidget(widget) {
        if (!widget) return '';
        if (widget.type === 'flights') {
            return `<flight-comparison-widget flights='${JSON.stringify(widget.data)}'></flight-comparison-widget>`;
        }
        if (widget.type === 'price_trend') {
            return `<price-trend-widget trend="${widget.data.trend}" current="${widget.data.currentPrice}" history='${JSON.stringify(widget.data.history)}'></price-trend-widget>`;
        }
        if (widget.type === 'security') {
            return `<security-details-widget domain="${widget.data.domain}" safety="${widget.data.safety}" trackers="${widget.data.trackers}"></security-details-widget>`;
        }
        return '';
    }

    renderBackgroundQueue() {
        const queue = this.state.backgroundTasks || [];
        if (queue.length === 0) return '';
        return `
            <div class="ai-background-queue" style="padding: 10px var(--spacing-md); background: rgba(77, 144, 254, 0.05); border-bottom: 1px solid var(--color-border-light); font-family: var(--font-ui); display: flex; flex-direction: column; gap: var(--spacing-xs);">
                <div style="font-size: 10px; font-weight: 600; color: var(--color-input-focus-border); display: flex; align-items: center; justify-content: space-between;">
                    <span style="display: inline-flex; align-items: center; gap: 4px;">
                        <i class="hgi-stroke hgi-processor spin-animation" style="font-size: 11px;"></i> Background Agents Active
                    </span>
                    <span style="font-size: 9px; background: rgba(77, 144, 254, 0.1); padding: 1px 6px; border-radius: 4px; color: var(--color-input-focus-border); font-weight: 600;">${queue.length} running</span>
                </div>
                ${queue.map(task => `
                    <div style="display: flex; flex-direction: column; gap: 2px; background: var(--color-viewport-bg); border: 1px solid var(--color-border-light); border-radius: var(--border-radius-sm); padding: 6px 8px; font-size: 10px; width: 100%; box-sizing: border-box;">
                        <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 500;">
                            <span style="color: var(--color-text-active);">${task.goal.length > 32 ? task.goal.slice(0, 32) + '...' : task.goal}</span>
                            <span style="color: var(--color-input-focus-border); font-weight: 600;">${task.progress}%</span>
                        </div>
                        <div style="width: 100%; height: 3px; background: var(--color-border-light); border-radius: 2px; overflow: hidden; margin: 2px 0; position: relative;">
                            <div style="width: ${task.progress}%; height: 100%; background: var(--color-input-focus-border); border-radius: 2px; transition: width 0.3s ease;"></div>
                        </div>
                        <span style="color: var(--color-text-inactive); font-size: 9px;">Step: ${task.currentStep || 'Initializing'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    runBackgroundFlightsDemo() {
        const taskId = `task-${Date.now()}`;
        const taskObj = {
            id: taskId,
            goal: 'Find Delhi to Tokyo flights (Background)',
            progress: 0,
            currentStep: 'Preparing headless target environment'
        };

        window.AppState.update(state => {
            state.isAiStreaming = false;
            state.taskLogs = [];
        });

        if (!this.state.backgroundTasks) this.state.backgroundTasks = [];
        const nextQueue = [...this.state.backgroundTasks, taskObj];
        this.setState({ backgroundTasks: nextQueue });

        const steps = [
            { progress: 15, step: 'Resolving flights.nifty.com domain IP' },
            { progress: 35, step: 'Injecting search parameters: DELHI -> TOKYO' },
            { progress: 60, step: 'Parsing travel deal DOM structures asynchronously' },
            { progress: 85, step: 'Compiling best fare structures' },
            { progress: 100, step: 'Finalizing context payload' }
        ];

        let idx = 0;
        const interval = setInterval(() => {
            if (idx < steps.length) {
                const current = steps[idx];
                const updatedQueue = (this.state.backgroundTasks || []).map(t => {
                    if (t.id === taskId) {
                        return { ...t, progress: current.progress, currentStep: current.step };
                    }
                    return t;
                });
                this.setState({ backgroundTasks: updatedQueue });
                idx++;
            } else {
                clearInterval(interval);
                const filteredQueue = (this.state.backgroundTasks || []).filter(t => t.id !== taskId);
                this.setState({ backgroundTasks: filteredQueue });

                window.AppState.update(state => {
                    state.chatHistory.push({
                        sender: 'ai',
                        text: `⚡ **Background Agent Task Complete:** I searched flights in a background tab context while you browsed. Here are the Tokyo deals:`,
                        widget: {
                            type: 'flights',
                            data: [
                                { airline: 'Japan Airlines', code: 'JL-740', duration: '7h 50m', price: '₹58,400', stops: 'Nonstop' },
                                { airline: 'Air Asia', code: 'D7-182', duration: '9h 15m', price: '₹32,100', stops: '1 stop' },
                                { airline: 'VietJet Air', code: 'VJ-972', duration: '11h 20m', price: '₹28,900', stops: '1 stop' }
                            ]
                        }
                    });
                });
            }
        }, 1200);
    }

    resolveTabMentions(text) {
        const matches = [...text.matchAll(/@(\w+[\-\w]*)/g)];
        if (!matches.length) return [];
        
        const tabs = this.state.tabs || [];
        const resolved = [];
        
        matches.forEach(match => {
            const ref = match[1].toLowerCase();
            let tab = tabs.find(t => t.id.toLowerCase() === ref);
            
            if (!tab && /^\d+$/.test(ref)) {
                const idx = parseInt(ref, 10) - 1;
                if (idx >= 0 && idx < tabs.length) {
                    tab = tabs[idx];
                }
            }
            
            if (!tab) {
                tab = tabs.find(t => 
                    (t.title && t.title.toLowerCase().includes(ref)) || 
                    (t.url && t.url.toLowerCase().includes(ref))
                );
            }
            
            if (tab) {
                resolved.push(tab);
            }
        });
        
        return resolved;
    }

    updateAttachedTabsIndicator() {
        const input = this.querySelector('#ai-chat-input');
        const domainContext = this.querySelector('.ai-context-domain');
        if (!input || !domainContext) return;
        
        const val = input.value;
        const resolved = this.resolveTabMentions(val);
        
        let attachedContainer = this.querySelector('.ai-attached-tabs');
        if (!attachedContainer) {
            attachedContainer = document.createElement('div');
            attachedContainer.className = 'ai-attached-tabs';
            attachedContainer.style = 'display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 8px 8px; font-size: 10px; color: var(--color-input-focus-border); font-family: var(--font-ui);';
            domainContext.parentNode.insertBefore(attachedContainer, domainContext.nextSibling);
        }
        
        if (resolved.length > 0) {
            attachedContainer.style.display = 'flex';
            attachedContainer.innerHTML = `
                <span style="color: var(--color-text-inactive); margin-right: 4px; display: inline-flex; align-items: center; gap: 2px;">
                    <i class="hgi-stroke hgi-attachment" style="font-size: 11px;"></i> Context tabs:
                </span>
                ${resolved.map(tab => `
                    <span style="background: rgba(77, 144, 254, 0.1); border: 1px solid rgba(77, 144, 254, 0.25); border-radius: 4px; padding: 1px 6px; font-weight: 500;">
                        @${tab.id.replace('tab-', '')} (${tab.title.length > 15 ? tab.title.slice(0, 15) + '...' : tab.title})
                    </span>
                `).join('')}
            `;
        } else {
            attachedContainer.style.display = 'none';
            attachedContainer.innerHTML = '';
        }
    }

    handleFlightsBookingTrigger(flight) {
        window.AppState.update(state => {
            state.chatHistory.push({
                sender: 'ai',
                text: `I have selected the flight **${flight.airline} (${flight.code})** for **${flight.price}**. Please authorize the payment booking using Windows Hello biometric gate:`,
                card: {
                    tier: 4,
                    actionDescription: `Autofill payment details and book ${flight.airline} flight for ${flight.price}.`,
                    details: [
                        { label: 'Passenger', val: 'Rohan Sharma' },
                        { label: 'Flight', val: `${flight.airline} ${flight.code}` },
                        { label: 'Amount Due', val: flight.price },
                        { label: 'Funding Source', val: 'HDFC Credit Card ending in 4082' }
                    ]
                }
            });
        });
    }

    renderActivityStream(logs = [], includeWrapper = true) {
        const body = `
            <div class="activity-stream-header">
                <span class="activity-kicker">Working</span>
                <span class="activity-summary">${this.escapeHtml(this.summarizeActivity(logs))}</span>
            </div>
            <div class="activity-timeline">
                ${logs.slice(-6).map(log => this.renderActivityItem(log)).join('')}
            </div>
        `;
        return includeWrapper ? `<div class="ai-activity-stream">${body}</div>` : body;
    }

    renderActivityItem(log = {}) {
        const status = log.status === 'success' ? 'success' : log.status === 'running' ? 'running' : 'warning';
        const icon = status === 'success'
            ? 'hgi-checkmark-circle-01'
            : status === 'running'
                ? 'hgi-clock-01 spin-animation'
                : 'hgi-alert-circle';
        return `
            <div class="activity-item ${status}">
                <span class="activity-node"><i class="hgi-stroke ${icon}"></i></span>
                <span class="activity-copy">${this.escapeHtml(this.humanizeActivityText(log.text || 'Working'))}</span>
            </div>
        `;
    }

    summarizeActivity(logs = []) {
        const last = logs[logs.length - 1];
        if (!last) return 'Preparing';
        if (logs.some(log => log.status === 'running')) return this.humanizeActivityText(last.text || 'Working');
        if (logs.every(log => log.status === 'success')) return 'Done';
        return this.humanizeActivityText(last.text || 'Needs attention');
    }

    humanizeActivityText(text) {
        return String(text || '')
            .replace(/^Validating\s+\d+\s+browser action(s)?/i, 'Safety check')
            .replace(/^Running open_page/i, 'Opening page')
            .replace(/^Running click/i, 'Clicking target')
            .replace(/^Running fill/i, 'Typing into field')
            .replace(/^Running key_press/i, 'Pressing key')
            .replace(/^Running scroll/i, 'Scrolling page')
            .replace(/^Running wait/i, 'Waiting')
            .replace(/^Running (\w+)/i, 'Running $1')
            .replace(/^Executed open_page through native browser input \(verified\)/i, 'Page changed')
            .replace(/^Executed open_page through native browser input \(uncertain\)/i, 'Opened, waiting to verify')
            .replace(/^Executed click through native browser input \(verified\)/i, 'Clicked target')
            .replace(/^Executed click through native browser input \(uncertain\)/i, 'Clicked, verifying page')
            .replace(/^Executed fill through native browser input \(verified\)/i, 'Field filled')
            .replace(/^Executed fill through native browser input \(uncertain\)/i, 'Text entered, verifying input')
            .replace(/^Executed key_press through native browser input \(verified\)/i, 'Key pressed')
            .replace(/^Executed key_press through native browser input \(uncertain\)/i, 'Key pressed, verifying')
            .replace(/^Executed scroll through native browser input \(verified\)/i, 'Page scrolled')
            .replace(/^Executed scroll through native browser input \(uncertain\)/i, 'Scrolling, verifying')
            .replace(/^Executed (\w+) through native browser input \(verified\)/i, '$1 completed successfully')
            .replace(/^Executed (\w+) through native browser input \(uncertain\)/i, '$1 action executed, verifying page')
            .replace(/^Resolved "([^"]*)" to \w+ "([^"]*)" at \d+,\d+/i, 'Located: "$2"')
            .replace(/^Resolved "([^"]*)" to \w+ "([^"]*)"/i, 'Located: "$2"')
            .replace(/^Denied (\w+): user cancelled native confirmation/i, 'Action cancelled: Confirmation declined')
            .replace(/^Blocked (\w+): (.+)$/i, 'Blocked action: $2')
            .replace(/^Command failed: (.+)$/i, 'Error: $1')
            .replace(/^Planned \d+ action for open\/navigate\./i, 'Planned navigation')
            .replace(/^Planned \d+ direct page action.*$/i, 'Resolved from visible page')
            .replace(/^Found visible target:\s*/i, 'Target: ')
            .replace(/^AI model planner created/i, 'Model planned')
            .replace(/^Local planner created/i, 'Local plan ready');
    }

    escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            // Toggle sidebar display dynamically (Chrome Side Panel logic)
            if (state.showAiSidebar) {
                this.style.display = 'flex';
            } else {
                this.style.display = 'none';
            }

            this.setState({
                chatHistory: state.chatHistory,
                taskLogs: state.taskLogs,
                isAiStreaming: state.isAiStreaming,
                aiProvider: state.aiProvider,
                activeTabId: state.activeTabId,
                tabs: state.tabs,
                aiActionHistory: state.aiActionHistory || []
            });
        });

        this._triggerFlightsDemoHandler = () => {
            this.runFlightsDemo();
        };
        // Listen for flights demo triggered from omnibox suggestion
        document.addEventListener('trigger-flights-demo', this._triggerFlightsDemoHandler);

        this._flightsBookingHandler = (e) => {
            const flight = e.detail?.flight;
            this.handleFlightsBookingTrigger(flight);
        };
        this.addEventListener('trigger-flights-booking', this._flightsBookingHandler);

        super.connectedCallback();
    }

    disconnectedCallback() {
        if (this._outsideMenuHandler) {
            document.removeEventListener('click', this._outsideMenuHandler);
        }
        if (this._outsideTooltipHandler) {
            document.removeEventListener('click', this._outsideTooltipHandler);
        }
        if (this._triggerFlightsDemoHandler) {
            document.removeEventListener('trigger-flights-demo', this._triggerFlightsDemoHandler);
        }
        if (this._flightsBookingHandler) {
            this.removeEventListener('trigger-flights-booking', this._flightsBookingHandler);
        }
        super.disconnectedCallback();
    }

    render() {
        // 1. If currently resizing, skip rendering to prevent lag and resetting resizer state.
        if (this.classList.contains('resizing')) {
            return;
        }

        const hasScroller = this.querySelector('#chat-scroller');
        const hasInput = this.querySelector('#ai-chat-input');
        
        // 2. If the menu state toggled, we must do a full render to show/hide the popover
        const moreMenuStateToggled = this.state.isMoreMenuOpen !== this.lastMoreMenuOpenState;
        this.lastMoreMenuOpenState = this.state.isMoreMenuOpen;

        // 3. If first render, or if the menu state changed, perform full template rendering
        if (!hasScroller || !hasInput || moreMenuStateToggled) {
            this.innerHTML = this.template();
            this._fullRenderDone = true;
            return;
        }

        this._fullRenderDone = false;

        // 4. Smooth partial rendering of logs, chat, and page context
        const history = this.state.chatHistory || [];
        const logs = this.state.taskLogs || [];
        const isStreaming = this.state.isAiStreaming;
        const isWelcomeState = history.length <= 1;

        // Get scroll state before updating DOM to implement smart scrolling
        const scroller = this.querySelector('#chat-scroller');
        if (scroller) {
            // Smart scroll: check if user is near bottom
            const isNearBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= 100;

            if (isWelcomeState) {
                // If it was not welcome state before, or if empty, rebuild welcome container
                if (!scroller.classList.contains('ai-welcome-container')) {
                    scroller.className = 'ai-welcome-container';
                    scroller.innerHTML = `
                        <div class="ai-welcome-logo-wrapper">
                            <div class="ai-welcome-logo">
                                <svg width="60" height="60" viewBox="0 0 100 100" class="ai-welcome-logo-svg" style="color: var(--color-text-inactive); opacity: 0.85;">
                                    <path d="M 42 80 C 20 60, 25 40, 75 40 C 60 45, 38 52, 42 80 Z" fill="currentColor" opacity="0.5"/>
                                    <path d="M 54 80 C 38 65, 42 52, 75 52 C 63 56, 50 62, 54 80 Z" fill="currentColor" opacity="0.75"/>
                                    <path d="M 66 80 C 56 70, 59 64, 75 64 C 66 67, 62 72, 66 80 Z" fill="currentColor" opacity="1"/>
                                </svg>
                            </div>
                        </div>
                        <h1 class="ai-welcome-title" style="margin-top: -8px; font-weight: var(--font-weight-normal); font-size: 20px;">Assistant</h1>
                    `;
                }
            } else {
                // Ensure class is correct
                if (!scroller.classList.contains('ai-chat-log')) {
                    scroller.className = 'ai-chat-log';
                    scroller.innerHTML = '';
                }

                // A. Update or append chat messages
                const existingWrappers = scroller.querySelectorAll('.chat-message-wrapper:not(.streaming-indicator-wrapper)');
                
                history.forEach((msg, idx) => {
                    const isAi = msg.sender === 'ai';
                    
                    if (idx < existingWrappers.length) {
                        const wrapper = existingWrappers[idx];
                        const chatMessageEl = wrapper.querySelector('.chat-message');
                        if (chatMessageEl) {
                            const formattedText = this.formatMessageText(msg.text);
                            const existingCard = chatMessageEl.querySelector('.confirmation-card');
                            
                            const textPartOnly = chatMessageEl.innerHTML.split(/<div class="confirmation-card"|<flight-comparison-widget|<price-trend-widget|<security-details-widget/i)[0].trim();
                            
                            if (textPartOnly !== formattedText) {
                                if (existingCard) {
                                    chatMessageEl.innerHTML = `${formattedText}${msg.widget ? this.renderWidget(msg.widget) : ''}`;
                                    chatMessageEl.appendChild(existingCard);
                                } else {
                                    chatMessageEl.innerHTML = `${formattedText}${msg.widget ? this.renderWidget(msg.widget) : ''}${msg.card ? this.renderConfirmationCard(msg.card) : ''}`;
                                    if (msg.card) {
                                        this.bindConfirmationCardListeners();
                                    }
                                }
                            }
                        }
                    } else {
                        // New message: create and append (triggers fade-in animation once)
                        const wrapper = document.createElement('div');
                        wrapper.className = `chat-message-wrapper ${isAi ? 'ai-msg' : 'user-msg'}`;
                        wrapper.innerHTML = `
                            <div class="chat-message">
                                ${this.formatMessageText(msg.text || '')}
                                ${msg.widget ? this.renderWidget(msg.widget) : ''}
                                ${msg.card ? this.renderConfirmationCard(msg.card) : ''}
                            </div>
                        `;
                        scroller.appendChild(wrapper);
                    }
                });

                // Clean up any extra message wrappers if history shrunk
                for (let i = history.length; i < existingWrappers.length; i++) {
                    existingWrappers[i].remove();
                }

                // B. Update or append task logs inside the compact activity stream
                let activityStream = scroller.querySelector('.ai-activity-stream');
                if (logs.length > 0) {
                    if (!activityStream) {
                        activityStream = document.createElement('div');
                        activityStream.className = 'ai-activity-stream';
                        scroller.appendChild(activityStream);
                    }
                    
                    const logsHtml = this.renderActivityStream(logs, false);
                    if (activityStream.innerHTML !== logsHtml) {
                        activityStream.innerHTML = logsHtml;
                    }
                } else if (activityStream) {
                    activityStream.remove();
                }

                // C. Update or append typing indicator
                let typingIndicator = scroller.querySelector('.streaming-indicator-wrapper');
                if (isStreaming && !logs.length) {
                    if (!typingIndicator) {
                        typingIndicator = document.createElement('div');
                        typingIndicator.className = 'chat-message-wrapper ai-msg streaming-indicator-wrapper';
                        typingIndicator.innerHTML = `
                            <div class="chat-message streaming">
                                <span class="typing-indicator"></span>
                            </div>
                        `;
                        scroller.appendChild(typingIndicator);
                    }
                } else if (typingIndicator) {
                    typingIndicator.remove();
                }
            }

            // Scroll down only if user was near the bottom (stops unwanted scrolling while user is reading previous messages)
            if (isNearBottom) {
                scroller.scrollTop = scroller.scrollHeight;
            }
        }

        // Update active context domain header
        const tabs = this.state.tabs || [];
        const activeTab = tabs.find(t => t.id === this.state.activeTabId);
        let hostname = 'localhost';
        let faviconUrl = '';
        let iconHtml = `<i class="hgi-stroke hgi-globe" style="font-size: 13px;"></i>`;

        if (activeTab && activeTab.url) {
            const urlStr = activeTab.url;
            if (urlStr.startsWith('aero://') || urlStr.startsWith('browser://')) {
                const path = urlStr.replace('aero://', '').replace('browser://', '').split('/')[0];
                if (path === 'ai-setup') {
                    hostname = 'AI Setup';
                    iconHtml = `<i class="hgi-stroke hgi-chat-bot" style="font-size: 13px;"></i>`;
                } else if (path === 'settings') {
                    hostname = 'Settings';
                    iconHtml = `<i class="hgi-stroke hgi-settings-01" style="font-size: 13px;"></i>`;
                } else if (path === 'history') {
                    hostname = 'History';
                    iconHtml = `<i class="hgi-stroke hgi-clock-01" style="font-size: 13px;"></i>`;
                } else if (path === 'downloads') {
                    hostname = 'Downloads';
                    iconHtml = `<i class="hgi-stroke hgi-download-01" style="font-size: 13px;"></i>`;
                } else if (path === 'bookmarks') {
                    hostname = 'Bookmarks';
                    iconHtml = `<i class="hgi-stroke hgi-star" style="font-size: 13px;"></i>`;
                } else if (path === 'reading-list') {
                    hostname = 'Reading List';
                    iconHtml = `<i class="hgi-stroke hgi-book-open-01" style="font-size: 13px;"></i>`;
                }
            } else {
                try {
                    const parsed = new URL(urlStr);
                    hostname = parsed.hostname.replace('www.', '');
                    faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
                    iconHtml = `
                        <img src="${faviconUrl}" 
                             style="width: 14px; height: 14px; object-fit: contain; border-radius: 2px;" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';"
                        />
                        <i class="hgi-stroke hgi-globe" style="font-size: 13px; display: none;"></i>
                    `;
                } catch (e) {
                    hostname = 'localhost';
                }
            }
        }

        const domainContext = this.querySelector('.ai-context-domain');
        if (domainContext) {
            domainContext.innerHTML = `
                ${iconHtml}
                <span>${hostname}</span>
            `;
        }

        // Update current page context name in the dropdown (if open)
        const sessionCurrent = this.querySelector('#ai-action-session-current span');
        if (sessionCurrent) {
            let sessionName = (hostname.split('.')[0] || 'session').toLowerCase();
            sessionCurrent.textContent = sessionName;
        }
    }

    bindConfirmationCardListeners() {
        this.querySelectorAll('.confirmation-card').forEach(cardEl => {
            if (cardEl._listenersBound) return;
            cardEl._listenersBound = true;

            const cancelBtn = cardEl.querySelector('.cancel-btn');
            const approveBtn = cardEl.querySelector('.approve-btn');
            const bioBox = cardEl.querySelector('.biometric-prompt-box');

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.cancelSimulatedTask();
                });
            }

            if (approveBtn || bioBox) {
                const triggerAction = () => {
                    this.approveSimulatedTask(approveBtn || bioBox);
                };
                if (approveBtn) approveBtn.addEventListener('click', triggerAction);
                if (bioBox) bioBox.addEventListener('click', triggerAction);
            }
        });
    }

    template() {
        const history = this.state.chatHistory || [];
        const logs = this.state.taskLogs || [];
        const isStreaming = this.state.isAiStreaming;
        const providerNames = {
            claude: 'Claude 3.5 Sonnet',
            open_ai: 'GPT-4.1 Mini',
            openai: 'GPT-4.1 Mini',
            gemini: 'Gemini 3.5 Flash',
            local: 'Llama 3 8B (Local)'
        };
        const currentModel = providerNames[this.state.aiProvider] || 'Cloud AI';

        // Check if history only has the initial system message or is empty
        const isWelcomeState = history.length <= 1;

        // Parse hostname and favicon dynamically from the active tab url
        const tabs = this.state.tabs || [];
        const activeTab = tabs.find(t => t.id === this.state.activeTabId);
        let hostname = 'localhost';
        let faviconUrl = '';
        let iconHtml = `<i class="hgi-stroke hgi-globe" style="font-size: 13px;"></i>`;

        if (activeTab && activeTab.url) {
            const urlStr = activeTab.url;
            if (urlStr.startsWith('aero://') || urlStr.startsWith('browser://')) {
                const path = urlStr.replace('aero://', '').replace('browser://', '').split('/')[0];
                if (path === 'ai-setup') {
                    hostname = 'AI Setup';
                    iconHtml = `<i class="hgi-stroke hgi-chat-bot" style="font-size: 13px;"></i>`;
                } else if (path === 'settings') {
                    hostname = 'Settings';
                    iconHtml = `<i class="hgi-stroke hgi-settings-01" style="font-size: 13px;"></i>`;
                } else if (path === 'history') {
                    hostname = 'History';
                    iconHtml = `<i class="hgi-stroke hgi-clock-01" style="font-size: 13px;"></i>`;
                } else if (path === 'downloads') {
                    hostname = 'Downloads';
                    iconHtml = `<i class="hgi-stroke hgi-download-01" style="font-size: 13px;"></i>`;
                } else if (path === 'bookmarks') {
                    hostname = 'Bookmarks';
                    iconHtml = `<i class="hgi-stroke hgi-star" style="font-size: 13px;"></i>`;
                } else if (path === 'reading-list') {
                    hostname = 'Reading List';
                    iconHtml = `<i class="hgi-stroke hgi-book-open-01" style="font-size: 13px;"></i>`;
                } else if (path === 'search') {
                    hostname = 'Search';
                    iconHtml = `<i class="hgi-stroke hgi-search-01" style="font-size: 13px;"></i>`;
                } else if (path === 'workspaces') {
                    hostname = 'Workspaces';
                    iconHtml = `<i class="hgi-stroke hgi-grid-view" style="font-size: 13px;"></i>`;
                } else {
                    hostname = path || 'aero';
                    iconHtml = `<i class="hgi-stroke hgi-globe" style="font-size: 13px;"></i>`;
                }
            } else if (urlStr.includes('newtab.internal')) {
                hostname = 'New Tab';
                iconHtml = `<i class="hgi-stroke hgi-home-01" style="font-size: 13px;"></i>`;
            } else {
                try {
                    const url = new URL(urlStr);
                    hostname = url.hostname || 'localhost';
                    if (hostname === '127.0.0.1') hostname = 'localhost';
                    
                    let displayHostname = hostname;
                    if (displayHostname.startsWith('www.')) {
                        displayHostname = displayHostname.substring(4);
                    }
                    hostname = displayHostname;

                    if (url.protocol === 'http:' || url.protocol === 'https:') {
                        faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain=${hostname}`;
                        iconHtml = `
                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px;">
                                <img src="${faviconUrl}" 
                                     style="width: 14px; height: 14px; object-fit: contain; border-radius: 2px;" 
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';"
                                />
                                <i class="hgi-stroke hgi-globe" style="font-size: 13px; display: none;"></i>
                            </span>
                        `;
                    }
                } catch (e) {
                    hostname = 'localhost';
                }
            }
        }

        let sessionName = (hostname.split('.')[0] || 'session').toLowerCase();

        let chatHtml = '';
        if (!isWelcomeState) {
            chatHtml = history.map((msg, idx) => {
                const isAi = msg.sender === 'ai';
                return `
                    <div class="chat-message-wrapper ${isAi ? 'ai-msg' : 'user-msg'}">
                        <div class="chat-message">
                            ${this.formatMessageText(msg.text)}
                            ${msg.widget ? this.renderWidget(msg.widget) : ''}
                            ${msg.card ? this.renderConfirmationCard(msg.card) : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        const logsHtml = logs.length > 0 ? this.renderActivityStream(logs, true) : '';

        return `
            <div class="sidebar-resizer"></div>
            <!-- Sidebar Header (Clean floating menu) -->
            <div class="ai-sidebar-header">
                <div style="position: relative;">
                    <button class="ai-header-more-btn" id="ai-more-btn" title="More options">
                        <i class="hgi-stroke hgi-more-vertical" style="font-size: 16px;"></i>
                    </button>
                    ${this.state.isMoreMenuOpen ? `
                        <div class="ai-dropdown-popover" id="ai-more-popover">
                            <div class="ai-dropdown-item" id="ai-action-new-tab">
                                <i class="hgi-stroke hgi-new-tab" style="font-size: 14px;"></i>
                                <span>Open in new tab</span>
                            </div>
                            <div class="ai-dropdown-item" id="ai-action-clear">
                                <i class="hgi-stroke hgi-delete-02" style="font-size: 14px;"></i>
                                <span>Delete session</span>
                            </div>
                            <div style="border-top: 1px solid var(--color-border-light); margin: var(--spacing-xxs) 0;"></div>
                            <div class="ai-dropdown-item" id="ai-action-session-current" style="color: var(--color-text-active); font-weight: var(--font-weight-medium); cursor: default; background: transparent;">
                                <span>${sessionName}</span>
                            </div>
                            <div class="ai-dropdown-item" id="ai-action-view-all" style="color: var(--color-text-inactive);">
                                <span>View all...</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Background Queue Panel -->
            ${this.renderBackgroundQueue()}

            <!-- Chat Messages Scroll Area / Welcome Screen -->
            ${isWelcomeState ? `
                <div class="ai-welcome-container" id="chat-scroller">
                    <div class="ai-welcome-logo-wrapper" style="margin-bottom: var(--spacing-sm);">
                        <img src="assets/ai_avatar_orb.png" alt="Aero Assistant" style="width: 56px; height: 56px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);" />
                    </div>
                    <h1 class="ai-welcome-title" style="margin-top: -8px; font-weight: var(--font-weight-normal); font-size: 20px;">Assistant</h1>
                </div>
            ` : `
                <div class="ai-chat-log" id="chat-scroller">
                    ${chatHtml}
                    ${logsHtml}
                    ${isStreaming && !logs.length ? `
                        <div class="chat-message-wrapper ai-msg">
                            <div class="chat-message streaming">
                                <span class="typing-indicator"></span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `}

            <!-- Chat Input area with popovers & tooltips -->
            <div class="ai-chat-input-bar" style="position: relative;">
                <!-- Command Autocomplete Popover -->
                <div class="ai-command-popover" id="ai-cmd-popover" style="position: absolute; bottom: 105px; left: 16px; right: 16px; background: var(--color-viewport-bg); border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md); box-shadow: var(--shadow-lg); z-index: 1000; padding: var(--spacing-xxs); display: none; flex-direction: column;">
                    <div class="ai-dropdown-item cmd-item" data-cmd="/summarize">
                        <i class="hgi-stroke hgi-book-open-01"></i>
                        <span>/summarize - Summarize this page</span>
                    </div>
                    <div class="ai-dropdown-item cmd-item" data-cmd="/flights">
                        <i class="hgi-stroke hgi-airplane-01"></i>
                        <span>/flights - Find Delhi to Tokyo flights</span>
                    </div>
                    <div class="ai-dropdown-item cmd-item" data-cmd="/security">
                        <i class="hgi-stroke hgi-shield-01"></i>
                        <span>/security - Scan active page security</span>
                    </div>
                    <div class="ai-dropdown-item cmd-item" data-cmd="/help">
                        <i class="hgi-stroke hgi-help-circle"></i>
                        <span>/help - Show help & shortcuts</span>
                    </div>
                </div>

                <!-- Prompt Helper Tooltip -->
                <div class="ai-prompt-tooltip" id="ai-plus-tooltip" style="position: absolute; bottom: 105px; left: 16px; background: var(--color-viewport-bg); border: 1px solid var(--color-border-light); border-radius: var(--border-radius-md); box-shadow: var(--shadow-lg); z-index: 1000; padding: var(--spacing-xxs); display: none; flex-direction: column; min-width: 180px;">
                    <div style="font-size: 10px; color: var(--color-text-inactive); padding: var(--spacing-xs) var(--spacing-md); font-weight: var(--font-weight-semibold); border-bottom: 1px solid var(--color-border-light);">Prompt Helpers</div>
                    <div class="ai-dropdown-item helper-item" data-prompt="Analyze security on this domain">
                        <i class="hgi-stroke hgi-shield-01"></i>
                        <span>Security Check</span>
                    </div>
                    <div class="ai-dropdown-item helper-item" data-prompt="Draft an email replying to this page">
                        <i class="hgi-stroke hgi-sent"></i>
                        <span>Draft Reply</span>
                    </div>
                    <div class="ai-dropdown-item helper-item" data-prompt="Explain this page to a 10 year old">
                        <i class="hgi-stroke hgi-chat-bot"></i>
                        <span>Simplify Page</span>
                    </div>
                </div>

                <!-- Domain Context Display -->
                <div class="ai-context-domain" style="display: flex; align-items: center; gap: 6px; padding: 0 8px 8px; font-size: 11px; color: var(--color-text-inactive); font-family: var(--font-ui); user-select: none;">
                    ${iconHtml}
                    <span>${hostname}</span>
                </div>

                <!-- Redesigned Two-row Input Pod -->
                <div class="ai-input-container">
                    <textarea class="ai-textarea" id="ai-chat-input" placeholder="Type / for search modes" rows="1"></textarea>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <!-- Left Action -->
                        <div style="display: flex; align-items: center;">
                            <button class="ai-input-btn" id="ai-plus-btn" title="Add context">
                                <i class="hgi-stroke hgi-plus" style="font-size: 16px;"></i>
                            </button>
                        </div>
                        
                        <!-- Right Actions -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button class="ai-input-btn" id="ai-web-search-btn" title="Search the web">
                                <i class="hgi-stroke hgi-globe" style="font-size: 16px;"></i>
                            </button>
                            <button class="ai-input-btn" id="ai-mic-btn" title="Voice input">
                                <i class="hgi-stroke hgi-mic-01" style="font-size: 16px;"></i>
                            </button>
                            <button class="ai-send-btn" id="${isStreaming ? 'ai-chat-stop' : 'ai-chat-send'}" aria-label="${isStreaming ? 'Stop AI Task' : 'Send Message'}" title="${isStreaming ? 'Stop AI task' : 'Send'}" style="display: flex; align-items: center; justify-content: center; background: ${isStreaming ? '#E81123' : 'var(--color-input-focus-border)'};">
                                <i class="hgi-stroke ${isStreaming ? 'hgi-square' : 'hgi-waveform'}" style="font-size: 14px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderConfirmationCard(card) {
        return `
            <div class="confirmation-card" style="margin-top: var(--spacing-md);">
                <div class="confirmation-card-header" style="display: flex; align-items: center; gap: var(--spacing-sm);">
                    <i class="hgi-stroke hgi-alert-circle" style="font-size: 16px; color: #E81123; display: flex; align-items: center; justify-content: center;"></i>
                    <h3 style="margin: 0; font-size: var(--font-size-sm); color: #E81123; font-weight: var(--font-weight-semibold);">Tier ${card.tier} Auth Required</h3>
                </div>
                <div class="confirmation-body">
                    <span class="permission-tier-badge">Transactional Gate</span>
                    <p class="permission-description">${card.actionDescription}</p>
                    
                    <div class="action-details" style="background: rgba(0,0,0,0.2); border-radius: var(--border-radius-md); padding: var(--spacing-md); font-family: monospace; font-size: 10px; display: flex; flex-direction: column; gap: var(--spacing-xs); border: 1px solid var(--color-border-light);">
                        ${card.details.map(detail => `<div><strong>${detail.label}:</strong> <span>${detail.val}</span></div>`).join('')}
                    </div>

                    <!-- Biometric fingerprint simulator box -->
                    <div class="biometric-prompt-box">
                        <i class="hgi-stroke hgi-fingerprint-scan" style="font-size: 24px; color: var(--color-text-inactive);"></i>
                        <span style="font-size: 10px; color: var(--color-text-inactive);">Verify Windows Hello Credentials</span>
                    </div>
                </div>
                <div class="confirmation-actions">
                    <button class="btn-confirm-deny btn-deny cancel-btn">Deny</button>
                    <button class="btn-confirm-deny btn-allow-sensitive approve-btn">Allow & Sign</button>
                </div>
            </div>
        `;
    }

    afterRender() {
        // If this was a partial/smooth render, do not rebind listeners to persistent elements
        if (!this._fullRenderDone) {
            this.bindConfirmationCardListeners();
            return;
        }

        const scroller = this.querySelector('#chat-scroller');
        if (scroller) {
            scroller.scrollTop = scroller.scrollHeight;
        }

        // Cleanup old document listeners
        if (this._outsideMenuHandler) {
            document.removeEventListener('click', this._outsideMenuHandler);
            this._outsideMenuHandler = null;
        }
        if (this._outsideTooltipHandler) {
            document.removeEventListener('click', this._outsideTooltipHandler);
            this._outsideTooltipHandler = null;
        }

        // Drag Resize logic
        const resizer = this.querySelector('.sidebar-resizer');
        if (resizer) {
            let startX = 0;
            let startWidth = 0;

            const onMouseMove = (e) => {
                const deltaX = startX - e.clientX;
                const newWidth = Math.max(300, Math.min(500, startWidth + deltaX));
                this.style.width = `${newWidth}px`;
                this.style.minWidth = `${newWidth}px`;
            };

            const onMouseUp = () => {
                this.classList.remove('resizing');
                document.body.classList.remove('sidebar-resizing');
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };

            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startX = e.clientX;
                startWidth = this.getBoundingClientRect().width;
                this.classList.add('resizing');
                document.body.classList.add('sidebar-resizing');
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
            });
        }

        const input = this.querySelector('#ai-chat-input');
        const sendBtn = this.querySelector('#ai-chat-send');
        const stopBtn = this.querySelector('#ai-chat-stop');
        const setupLink = this.querySelector('.ai-setup-link');

        if (setupLink) {
            setupLink.addEventListener('click', () => {
                window.AppState.update(state => {
                    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
                    const isSafeToOverride = !activeTab || 
                                             activeTab.url.includes('newtab.internal') || 
                                             activeTab.url === '';
                    if (isSafeToOverride && activeTab) {
                        activeTab.url = 'aero://ai-setup';
                        activeTab.title = 'AI Setup';
                    } else {
                        const newId = `tab-${Date.now()}`;
                        state.tabs.push({
                            id: newId,
                            title: 'AI Setup',
                            url: 'aero://ai-setup',
                            hibernated: false,
                            active: true,
                            workspace: 'Default'
                        });
                        state.activeTabId = newId;
                    }
                    state.activeWorkspace = 'Default';
                });
            });
        }

        // Three-dots menu button toggle
        const moreBtn = this.querySelector('#ai-more-btn');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setState({ isMoreMenuOpen: !this.state.isMoreMenuOpen });
            });
        }

        // Close dropdown on outside click
        if (this.state.isMoreMenuOpen) {
            this._outsideMenuHandler = (e) => {
                const button = this.querySelector('#ai-more-btn');
                const popover = this.querySelector('#ai-more-popover');
                if (!popover) {
                    document.removeEventListener('click', this._outsideMenuHandler);
                    this._outsideMenuHandler = null;
                    return;
                }
                if (button && !button.contains(e.target) && !popover.contains(e.target)) {
                    this.setState({ isMoreMenuOpen: false });
                    document.removeEventListener('click', this._outsideMenuHandler);
                    this._outsideMenuHandler = null;
                }
            };
            setTimeout(() => {
                if (this._outsideMenuHandler) {
                    document.addEventListener('click', this._outsideMenuHandler);
                }
            }, 0);
        }

        // Menu actions
        const clearBtn = this.querySelector('#ai-action-clear');
        const newTabBtn = this.querySelector('#ai-action-new-tab');
        const viewAllBtn = this.querySelector('#ai-action-view-all');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.setState({ isMoreMenuOpen: false });
                this.state.isWebSearchActive = false;
                window.AppState.update(state => {
                    state.chatHistory = [
                        { sender: 'ai', text: 'Hello! I am your native Browser Assistant. I can see whatever you browse, help you research across tabs, or automate web actions safely. How can I help you today?' }
                    ];
                    state.taskLogs = [];
                    state.isAiStreaming = false;
                });
            });
        }

        if (newTabBtn) {
            newTabBtn.addEventListener('click', () => {
                this.setState({ isMoreMenuOpen: false });
                window.AppState.update(state => {
                    const newId = `tab-${Date.now()}`;
                    state.tabs.push({
                        id: newId,
                        title: 'AI Setup',
                        url: 'aero://ai-setup',
                        hibernated: false,
                        active: true,
                        workspace: state.activeWorkspace || 'Default'
                    });
                    state.activeTabId = newId;
                });
            });
        }

        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.setState({ isMoreMenuOpen: false });
                window.AppState.update(state => {
                    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
                    const isSafeToOverride = !activeTab || 
                                             activeTab.url.includes('newtab.internal') || 
                                             activeTab.url === '';
                    if (isSafeToOverride && activeTab) {
                        activeTab.url = 'aero://history';
                        activeTab.title = 'History';
                    } else {
                        const newId = `tab-${Date.now()}`;
                        state.tabs.push({
                            id: newId,
                            title: 'History',
                            url: 'aero://history',
                            hibernated: false,
                            active: true,
                            workspace: 'Default'
                        });
                        state.activeTabId = newId;
                    }
                });
            });
        }

        // Suggestions pills
        const actionPills = this.querySelectorAll('.ai-action-pill');
        actionPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const action = pill.getAttribute('data-action');
                if (action === 'summarize') {
                    window.AppState.update(state => {
                        state.chatHistory.push({ sender: 'user', text: 'Summarize this page' });
                        state.isAiStreaming = true;
                        state.taskLogs = [];
                    });
                    setTimeout(() => {
                        this.runSummarizeDemo();
                    }, 800);
                } else if (action === 'flights') {
                    window.AppState.update(state => {
                        state.chatHistory.push({ sender: 'user', text: 'Find flights Delhi to Tokyo' });
                        state.isAiStreaming = true;
                        state.taskLogs = [];
                    });
                    setTimeout(() => {
                        this.runFlightsDemo();
                    }, 800);
                } else if (action === 'help') {
                    window.AppState.update(state => {
                        state.chatHistory.push({ sender: 'user', text: 'Show help & shortcuts' });
                        state.isAiStreaming = true;
                        state.taskLogs = [];
                    });
                    setTimeout(() => {
                        this.runHelpDemo();
                    }, 800);
                }
            });
        });

        // Command Autocomplete Popup logic
        const cmdPopover = this.querySelector('#ai-cmd-popover');
        if (input && cmdPopover) {
            input.addEventListener('input', () => {
                const val = input.value;
                if (val.startsWith('/')) {
                    cmdPopover.style.display = 'flex';
                } else {
                    cmdPopover.style.display = 'none';
                }
            });

            // Handle clicking command items
            const cmdItems = cmdPopover.querySelectorAll('.cmd-item');
            cmdItems.forEach(item => {
                item.addEventListener('click', () => {
                    const cmd = item.getAttribute('data-cmd');
                    input.value = cmd;
                    cmdPopover.style.display = 'none';
                    input.focus();
                });
            });
        }

        // Plus button tooltip logic
        const plusBtn = this.querySelector('#ai-plus-btn');
        const plusTooltip = this.querySelector('#ai-plus-tooltip');
        if (plusBtn && plusTooltip && input) {
            plusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = plusTooltip.style.display === 'flex';
                plusTooltip.style.display = isVisible ? 'none' : 'flex';
                if (cmdPopover) cmdPopover.style.display = 'none';
            });

            const helperItems = plusTooltip.querySelectorAll('.helper-item');
            helperItems.forEach(item => {
                item.addEventListener('click', () => {
                    const text = item.getAttribute('data-prompt');
                    input.value = text;
                    plusTooltip.style.display = 'none';
                    input.focus();
                });
            });

            this._outsideTooltipHandler = (e) => {
                if (!this.contains(plusTooltip)) {
                    document.removeEventListener('click', this._outsideTooltipHandler);
                    this._outsideTooltipHandler = null;
                    return;
                }
                if (!plusBtn.contains(e.target) && !plusTooltip.contains(e.target)) {
                    plusTooltip.style.display = 'none';
                }
            };
            document.addEventListener('click', this._outsideTooltipHandler);
        }

        // Mic button logic
        const micBtn = this.querySelector('#ai-mic-btn');
        if (micBtn && input) {
            micBtn.addEventListener('click', () => {
                const originalPlaceholder = input.placeholder;
                input.value = '';
                input.placeholder = '🎙️ Listening... Speak now';
                micBtn.style.color = 'var(--color-input-focus-border)';
                
                setTimeout(() => {
                    input.value = 'Find flights from Delhi to Tokyo';
                    input.placeholder = originalPlaceholder;
                    micBtn.style.color = 'var(--color-text-inactive)';
                    input.focus();
                }, 2000);
            });
        }

        // Web search button logic
        const webSearchBtn = this.querySelector('#ai-web-search-btn');
        if (webSearchBtn) {
            // Restore visual state if active
            if (this.state.isWebSearchActive) {
                webSearchBtn.style.color = 'var(--color-input-focus-border)';
            }
            webSearchBtn.addEventListener('click', () => {
                this.state.isWebSearchActive = !this.state.isWebSearchActive;
                if (this.state.isWebSearchActive) {
                    webSearchBtn.style.color = 'var(--color-input-focus-border)';
                    webSearchBtn.title = 'Web search enabled';
                } else {
                    webSearchBtn.style.color = 'var(--color-text-inactive)';
                    webSearchBtn.title = 'Search the web';
                }
            });
        }

        if (input) {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = (input.scrollHeight - 10) + 'px';
                this.updateAttachedTabsIndicator();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopCurrentTask('Stopped by user.'));
        }

        this.bindConfirmationCardListeners();
    }

    async getActivePageSnapshot() {
        if (typeof window.AeroCaptureActivePage === 'function') {
            try {
                return await window.AeroCaptureActivePage();
            } catch {}
        }
        return new Promise(resolve => {
            const requestId = `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const timeout = setTimeout(() => {
                document.removeEventListener('aero-active-page-snapshot', handler);
                resolve(null);
            }, 1200);
            const handler = (event) => {
                if (event.detail?.requestId !== requestId) return;
                clearTimeout(timeout);
                document.removeEventListener('aero-active-page-snapshot', handler);
                resolve(event.detail.snapshot || null);
            };
            document.addEventListener('aero-active-page-snapshot', handler);
            document.dispatchEvent(new CustomEvent('aero-capture-active-page', { detail: { requestId } }));
        });
    }

    sendMessage() {
        const input = this.querySelector('#ai-chat-input');
        if (!input) return;
        const val = input.value.trim();
        if (!val) return;
        if (/^\/?(stop|cancel|abort)$/i.test(val)) {
            input.value = '';
            this.stopCurrentTask('Stopped by command.');
            return;
        }

        const isWebSearch = this.state.isWebSearchActive;

        window.AppState.update(state => {
            state.chatHistory.push({ sender: 'user', text: val });
            state.isAiStreaming = true;
            state.aiCancelRequested = false;
            state.taskLogs = []; 
            state.recordAiAction?.({ type: 'prompt', status: 'running', reason: val, tab_id: state.activeTabId });
        });

        input.value = '';
        input.style.height = 'auto';

        const cmdPopover = this.querySelector('#ai-cmd-popover');
        if (cmdPopover) cmdPopover.style.display = 'none';

        const attachedContainer = this.querySelector('.ai-attached-tabs');
        if (attachedContainer) {
            attachedContainer.style.display = 'none';
            attachedContainer.innerHTML = '';
        }

        // Reset web search button color & state in the DOM & local state
        if (isWebSearch) {
            this.state.isWebSearchActive = false;
            const webSearchBtn = this.querySelector('#ai-web-search-btn');
            if (webSearchBtn) {
                webSearchBtn.style.color = 'var(--color-text-inactive)';
                webSearchBtn.title = 'Search the web';
            }
        }

        setTimeout(() => {
            const lowerVal = val.toLowerCase();
            if (isWebSearch) {
                this.runWebSearchDemo(val);
            } else if (lowerVal === '/summarize' || lowerVal.includes('summarize') || lowerVal.includes('summary') || lowerVal.includes('explain')) {
                this.runSummarizeDemo();
            } else if (lowerVal === '/flights' || lowerVal.includes('flight') || lowerVal.includes('tokyo') || lowerVal.includes('book')) {
                this.runFlightsDemo();
            } else if (lowerVal === '/security' || lowerVal.includes('security') || lowerVal.includes('safety') || lowerVal.includes('scan')) {
                this.runSecurityScanDemo();
            } else if (lowerVal === '/help' || lowerVal.includes('help') || lowerVal.includes('shortcuts')) {
                this.runHelpDemo();
            } else {
                this.tryRunBrowserCommand(val).then(handled => {
                    if (!handled) this.runQADemo(val);
                });
            }
        }, 800);
    }

    async tryRunBrowserCommand(text) {
        if (typeof window.AeroExecuteBrowserCommand !== 'function') {
            return false;
        }
        const command = this.parseBrowserCommand(text) || await this.planBrowserCommand(text);
        if (!command || (Array.isArray(command) && !command.length)) return false;
        const commands = Array.isArray(command) ? command : [command];

        window.AppState.update(state => {
            state.taskLogs.push({ text: `Safety check for ${commands.length} action${commands.length > 1 ? 's' : ''}`, status: 'running' });
            state.recordAiAction?.({
                type: 'browser_sequence',
                status: 'running',
                reason: text,
                command_count: commands.length,
                tab_id: state.activeTabId
            });
        });

        this.executeBrowserCommandSequence(commands, text).then(result => {
            window.AppState.update(state => {
                const lastLog = state.taskLogs[state.taskLogs.length - 1];
                if (lastLog?.status === 'running') {
                    lastLog.status = result.ok ? 'success' : 'warning';
                }
                state.isAiStreaming = false;
                state.chatHistory.push({
                    sender: 'ai',
                    text: result.ok
                        ? this.browserActionSuccessMessage(text, commands, result)
                        : `I could not execute that browser action: ${result.message || 'blocked by policy'}`
                });
                state.recordAiAction?.({
                    type: 'browser_sequence',
                    status: result.ok ? 'success' : 'warning',
                    reason: text,
                    command_count: commands.length,
                    tab_id: state.activeTabId,
                    message: result.message || ''
                });
            });
        });
        return true;
    }

    async planBrowserCommand(text) {
        if (!window.AppState?.aiControlEnabled || !window.AppState?.aiAllowActionExecution) {
            return null;
        }
        const snapshot = window.AppState?.aiAllowPageReading !== false
            ? await this.getActivePageSnapshot()
            : null;
        const tabId = window.AppState?.activeTabId || 'active';
        const profile = window.AppState?.autofillProfile || {};
        if (snapshot) {
            window.AppState.update(state => {
                state.taskLogs.push({ text: `Read current page: ${snapshot.title || 'active tab'}`, status: 'success' });
            });
        }
        const deterministic = this.planDeterministicPageAction(text, snapshot, tabId);
        if (deterministic?.length) {
            this.rememberAiDisclosure(text, {
                summary: `Planned ${deterministic.length} direct page action${deterministic.length === 1 ? '' : 's'} from visible page context.`,
                commands: deterministic,
                disclosure: this.localDisclosure(text, snapshot, deterministic)
            }, snapshot);
            window.AppState.update(state => {
                state.taskLogs.push({ text: `Found visible target: ${deterministic[0].description || deterministic[0].target?.label || deterministic[0].url || deterministic[0].type}`, status: 'success' });
            });
            return deterministic;
        }
        if (this.isReferentialPageAction(text)) {
            window.AppState.update(state => {
                state.taskLogs.push({ text: 'Could not find a matching visible page link', status: 'warning' });
            });
            return [];
        }

        try {
            const plan = await BackendClient.planAutomation({
                goal: text,
                tab_id: tabId,
                page_snapshot: this.redactSnapshotForPlanner(snapshot),
                autofill_profile: this.redactAutofillProfile(profile)
            });
            if (!Array.isArray(plan.commands) || !plan.commands.length) return null;
            this.rememberAiDisclosure(text, plan, snapshot);
            window.AppState.update(state => {
                state.taskLogs.push({ text: plan.summary || `Planned ${plan.commands.length} browser actions`, status: 'success' });
                state.recordAiAction?.({
                    type: 'automation_plan',
                    status: 'success',
                    reason: text,
                    command_count: plan.commands.length,
                    tab_id: tabId,
                    message: plan.summary || ''
                });
            });
            return plan.commands;
        } catch (error) {
            const aiPlan = await this.planWithAiModel(text, snapshot);
            if (aiPlan?.length) {
                this.rememberAiDisclosure(text, {
                    summary: `AI model planned ${aiPlan.length} action${aiPlan.length === 1 ? '' : 's'}.`,
                    commands: aiPlan,
                    disclosure: this.localDisclosure(text, snapshot, aiPlan)
                }, snapshot);
                window.AppState.update(state => {
                    state.taskLogs.push({ text: `AI model planner created ${aiPlan.length} action${aiPlan.length === 1 ? '' : 's'}`, status: 'success' });
                    state.recordAiAction?.({
                        type: 'model_automation_plan',
                        status: 'success',
                        reason: text,
                        command_count: aiPlan.length,
                        tab_id: tabId
                    });
                });
                return aiPlan;
            }
            const fallback = this.localPlanner(text, snapshot, profile);
            if (!fallback?.length) return null;
            this.rememberAiDisclosure(text, {
                summary: `Local fallback planned ${fallback.length} action${fallback.length === 1 ? '' : 's'}.`,
                commands: fallback,
                disclosure: this.localDisclosure(text, snapshot, fallback)
            }, snapshot);
            window.AppState.update(state => {
                state.taskLogs.push({ text: `Local planner created ${fallback.length} action${fallback.length === 1 ? '' : 's'}`, status: 'success' });
            });
            return fallback;
        }
    }

    async planWithAiModel(goal, snapshot) {
        try {
            const tabId = window.AppState?.activeTabId || 'active';
            const pageContext = this.redactSnapshotForPlanner(snapshot);
            const result = await BackendClient.completeAi({
                prompt: `Goal: ${goal}\n\nReturn a browser automation plan for the visible page.`,
                page_context: pageContext,
                system: [
                    'You are Aero Browser automation planner.',
                    'Return only JSON, no markdown.',
                    'Schema: {"commands":[...]}',
                    'Allowed commands:',
                    '{"type":"open_page","tab_id":"active","url":"https://example.com"}',
                    '{"type":"click","tab_id":"active","target":{"target_type":"accessibility_node","ax_node_id":"label","label":"label"},"button":"left","needs_resolution":true}',
                    '{"type":"fill","tab_id":"active","target":{"target_type":"accessibility_node","ax_node_id":"label","label":"label"},"text":"value","sensitive":false,"needs_resolution":true}',
                    '{"type":"key_press","tab_id":"active","key":"Enter","modifiers":[]}',
                    '{"type":"scroll","tab_id":"active","delta_x":0,"delta_y":600}',
                    'Use labels from the provided page controls. Mark passwords, OTPs, card numbers, CVV, and PINs as sensitive.'
                ].join('\n'),
                max_output_tokens: 900
            });
            const plan = this.extractJsonPlan(result.text);
            const commands = Array.isArray(plan?.commands) ? plan.commands : [];
            return commands
                .map(command => this.sanitizePlannedCommand(command, tabId))
                .filter(Boolean)
                .slice(0, 8);
        } catch {
            return null;
        }
    }

    planDeterministicPageAction(text, snapshot, tabId) {
        const input = String(text || '').toLowerCase();
        if (!snapshot) return null;

        const wantsFirstLink = /\b(open|click|tap|visit|go to)\b/.test(input)
            && /\b(first|top|1st)\b/.test(input)
            && /\b(links?|results?|sites?|websites?|urls?)\b/.test(input);
        if (wantsFirstLink) {
            const link = this.pickVisibleLink(snapshot, { ordinal: 1 });
            if (link?.href) {
                return [{
                    type: 'open_page',
                    tab_id: tabId,
                    url: link.href,
                    description: `Open ${link.text || link.href}`
                }];
            }
            if (link?.label) {
                return [this.clickByLabelCommand(tabId, link.label)];
            }
        }

        const ordinalMatch = input.match(/\b(open|click|tap|visit|go to)\b.*\b(second|third|fourth|2nd|3rd|4th)\b.*\b(links?|results?|sites?|websites?|urls?)\b/);
        if (ordinalMatch) {
            const ordinal = { second: 2, third: 3, fourth: 4, '2nd': 2, '3rd': 3, '4th': 4 }[ordinalMatch[2]] || 1;
            const link = this.pickVisibleLink(snapshot, { ordinal });
            if (link?.href) return [{ type: 'open_page', tab_id: tabId, url: link.href, description: `Open ${link.text || link.href}` }];
            if (link?.label) return [this.clickByLabelCommand(tabId, link.label)];
        }

        return null;
    }

    isReferentialPageAction(text) {
        const input = String(text || '').toLowerCase();
        return /\b(open|click|tap|visit|go to)\b/.test(input)
            && /\b(this|that|first|top|second|third|fourth|1st|2nd|3rd|4th)\b/.test(input)
            && /\b(links?|results?|sites?|websites?|urls?|page)\b/.test(input);
    }

    pickVisibleLink(snapshot, { ordinal = 1 } = {}) {
        const links = [
            ...(snapshot.links || []).map(link => ({
                text: link.text || '',
                label: link.text || '',
                href: link.href || '',
                source: 'dom_link'
            })),
            ...(snapshot.interactives || [])
                .filter(item => String(item.role || '').toLowerCase() === 'link' || item.href)
                .map(item => ({
                    text: item.label || item.href || '',
                    label: item.label || '',
                    href: item.href || '',
                    source: item.source || 'interactive'
                }))
        ];
        const filtered = links
            .map(link => ({ ...link, href: this.cleanSearchRedirect(link.href) }))
            .filter(link => this.isMeaningfulPageLink(link));
        return filtered[Math.max(0, ordinal - 1)] || null;
    }

    cleanSearchRedirect(href) {
        try {
            const url = new URL(href);
            if (url.hostname.includes('google.') && url.pathname === '/url') {
                return url.searchParams.get('q') || url.searchParams.get('url') || href;
            }
        } catch {}
        return href;
    }

    isMeaningfulPageLink(link) {
        const href = String(link.href || '');
        const text = String(link.text || link.label || '').trim();
        if (!/^https?:\/\//i.test(href)) return false;
        try {
            const url = new URL(href);
            const host = url.hostname.replace(/^www\./, '');
            if (host.includes('google.') && !url.pathname.startsWith('/url')) return false;
            if (/accounts\.google|support\.google|policies\.google|webcache|translate\.google/i.test(host)) return false;
            if (!text || /^(cached|similar|translate|more|tools|images|news|videos|shopping|forums|sign in)$/i.test(text)) return false;
            return true;
        } catch {
            return false;
        }
    }

    extractJsonPlan(text) {
        const raw = String(text || '').trim();
        const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
        const candidate = fenced || raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
        if (!candidate) return null;
        try {
            return JSON.parse(candidate);
        } catch {
            return null;
        }
    }

    sanitizePlannedCommand(command, tabId) {
        const type = command?.type;
        if (!['open_page', 'click', 'fill', 'key_press', 'scroll'].includes(type)) return null;
        if (type === 'open_page') {
            const url = String(command.url || '');
            if (!/^https?:\/\//i.test(url)) return null;
            return { type, tab_id: command.tab_id || tabId, url };
        }
        if (type === 'key_press') {
            const key = String(command.key || '');
            if (!/^(Enter|Tab|Escape|Backspace|Delete|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/i.test(key)) return null;
            return { type, tab_id: command.tab_id || tabId, key, modifiers: Array.isArray(command.modifiers) ? command.modifiers : [] };
        }
        if (type === 'scroll') {
            return {
                type,
                tab_id: command.tab_id || tabId,
                delta_x: Number(command.delta_x || 0),
                delta_y: Number(command.delta_y || 600)
            };
        }
        const label = String(command.target?.label || command.target?.ax_node_id || '').trim();
        if (!label) return null;
        const target = {
            target_type: 'accessibility_node',
            ax_node_id: label,
            label
        };
        if (type === 'click') {
            return { type, tab_id: command.tab_id || tabId, target, button: 'left', needs_resolution: true };
        }
        const text = String(command.text || '');
        if (!text) return null;
        return {
            type,
            tab_id: command.tab_id || tabId,
            target,
            text,
            sensitive: Boolean(command.sensitive) || /password|otp|card|cvv|pin/i.test(label),
            needs_resolution: true
        };
    }

    redactSnapshotForPlanner(snapshot) {
        if (!snapshot) return null;
        return {
            url: snapshot.url || '',
            title: snapshot.title || '',
            text: String(snapshot.text || '').slice(0, 6000),
            headings: (snapshot.headings || []).slice(0, 12),
            links: (snapshot.links || []).slice(0, 25).map(link => ({
                text: String(link.text || '').slice(0, 120),
                href: link.href || ''
            })),
            interactives: (snapshot.interactives || []).slice(0, 80).map(item => ({
                role: item.role || '',
                label: item.label || '',
                tag: item.tag || '',
                inputType: item.inputType || '',
                name: item.name || '',
                idAttr: item.idAttr || '',
                placeholder: item.placeholder || '',
                autocomplete: item.autocomplete || '',
                backendDOMNodeId: item.backendDOMNodeId || '',
                source: item.source || '',
                required: Boolean(item.required),
                disabled: Boolean(item.disabled)
            })),
            forms: (snapshot.forms || []).slice(0, 12),
            axTree: snapshot.axTree || null
        };
    }

    redactAutofillProfile(profile = {}) {
        const clean = {};
        ['fullName', 'email', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'zip', 'country'].forEach(key => {
            clean[key] = String(profile[key] || '').trim();
        });
        return clean;
    }

    rememberAiDisclosure(goal, plan, snapshot) {
        const disclosure = {
            timestamp: new Date().toISOString(),
            goal,
            summary: plan.summary || '',
            commandCount: plan.commands?.length || 0,
            commands: (plan.commands || []).map(command => ({
                type: command.type,
                target: command.target?.label || command.url || command.key || '',
                sensitive: Boolean(command.sensitive),
                textPreview: command.sensitive ? '[redacted]' : String(command.text || '').slice(0, 80)
            })),
            page: {
                url: snapshot?.url || plan.disclosure?.page?.url || '',
                title: snapshot?.title || plan.disclosure?.page?.title || '',
                textChars: snapshot?.text?.length || plan.disclosure?.page?.text_chars || 0,
                controls: snapshot?.interactives?.length || plan.disclosure?.page?.controls || 0,
                forms: snapshot?.forms?.length || plan.disclosure?.page?.forms || 0
            },
            disclosure: plan.disclosure || null
        };
        window.AppState.update(state => {
            state.lastAiContextDisclosure = disclosure;
        });
    }

    localDisclosure(goal, snapshot, commands) {
        return {
            goal,
            page: {
                url: snapshot?.url || '',
                title: snapshot?.title || '',
                text_chars: snapshot?.text?.length || 0,
                controls: snapshot?.interactives?.length || 0,
                forms: snapshot?.forms?.length || 0
            },
            plan: {
                command_count: commands.length,
                sensitive_field_count: commands.filter(command => command.sensitive).length
            }
        };
    }

    localPlanner(text, snapshot, profile) {
        const input = String(text || '').trim();
        const lower = input.toLowerCase();
        const tabId = window.AppState?.activeTabId || 'active';
        if (!/(autofill|fill my|fill form|my details|contact form|sign up|signup)/i.test(input)) {
            return null;
        }
        const commands = [];
        const pairs = [
            ['name', profile.fullName],
            ['email', profile.email],
            ['phone', profile.phone],
            ['address', profile.addressLine1],
            ['address line 2', profile.addressLine2],
            ['city', profile.city],
            ['state', profile.state],
            ['zip', profile.zip],
            ['country', profile.country]
        ];
        pairs.forEach(([label, value]) => {
            if (String(value || '').trim()) {
                commands.push(this.fillByLabelCommand(tabId, label, value, false));
            }
        });
        if (/submit|send|continue|next/i.test(lower)) {
            commands.push(this.clickByLabelCommand(tabId, lower.includes('send') ? 'send' : lower.includes('next') ? 'next' : lower.includes('continue') ? 'continue' : 'submit'));
        }
        return commands.length ? commands : null;
    }

    async executeBrowserCommandSequence(commands, reason) {
        const results = [];
        for (const command of commands) {
            if (window.AppState?.aiCancelRequested) {
                return { ok: false, message: 'AI task stopped by user.', results };
            }
            window.AppState.update(state => {
                state.taskLogs.push({ text: `Running ${command.type}`, status: 'running' });
                state.activeTaskStep = command.type;
                state.recordAiAction?.({
                    type: command.type,
                    status: 'running',
                    reason,
                    tab_id: state.activeTabId,
                    command
                });
            });
            let result = await window.AeroExecuteBrowserCommand(command, reason);
            if (!result.ok && command.needs_resolution) {
                await new Promise(resolve => setTimeout(resolve, 450));
                result = await window.AeroExecuteBrowserCommand(command, `${reason} (retry after page settled)`);
                result.retried = true;
            }
            results.push(result);
            window.AppState.update(state => {
                const lastLog = state.taskLogs[state.taskLogs.length - 1];
                if (lastLog?.status === 'running') {
                    lastLog.status = result.ok ? 'success' : 'warning';
                    if (result.retried) lastLog.text = `${lastLog.text} (retried)`;
                }
                state.recordAiAction?.({
                    type: command.type,
                    status: result.ok ? 'success' : 'warning',
                    reason,
                    tab_id: state.activeTabId,
                    message: `${result.retried ? 'Retried once. ' : ''}${result.message || result.verification?.detail || ''}`.trim(),
                    verification: result.verification || null
                });
            });
            if (!result.ok) return { ...result, results };
            await new Promise(resolve => setTimeout(resolve, 120));
        }
        return { ok: true, results };
    }

    stopCurrentTask(reason = 'Stopped by user.') {
        this.simulatedTasks = [];
        if (this.taskInterval) {
            clearInterval(this.taskInterval);
            this.taskInterval = null;
        }
        window.AppState.requestAiCancel?.(reason);
        window.AppState.update(state => {
            state.chatHistory.push({ sender: 'ai', text: `Stopped. ${reason}` });
            state.isAiStreaming = false;
            state.activeTaskStep = null;
        });
    }

    parseBrowserCommand(text) {
        const input = String(text || '').trim();
        const lower = input.toLowerCase();
        const activeTabId = window.AppState?.activeTabId || 'active';

        const sequenceParts = input
            .split(/\s+(?:and then|then|and)\s+/i)
            .map(part => part.trim())
            .filter(Boolean);
        if (sequenceParts.length > 1) {
            const commands = sequenceParts.map(part => this.parseBrowserCommand(part));
            if (commands.every(Boolean) && commands.every(command => !Array.isArray(command))) {
                return commands;
            }
        }

        const loginMatch = input.match(/^login\s+with\s+email\s+(.+?)\s+password\s+(.+)$/i)
            || input.match(/^sign\s+in\s+with\s+email\s+(.+?)\s+password\s+(.+)$/i);
        if (loginMatch) {
            return [
                this.fillByLabelCommand(activeTabId, 'email', loginMatch[1], false),
                this.fillByLabelCommand(activeTabId, 'password', loginMatch[2], true),
                this.clickByLabelCommand(activeTabId, 'login')
            ];
        }

        const searchMatch = input.match(/^(?:search|find)\s+(?:for\s+)?(.+)$/i);
        if (searchMatch && !/^search\s+(down|up)$/i.test(input)) {
            return [
                this.fillByLabelCommand(activeTabId, 'search', searchMatch[1], false),
                { type: 'key_press', tab_id: activeTabId, key: 'Enter', modifiers: [] }
            ];
        }

        if (lower === 'scroll down' || lower === 'scroll') {
            return { type: 'scroll', tab_id: activeTabId, delta_x: 0, delta_y: 620 };
        }
        if (lower === 'scroll up') {
            return { type: 'scroll', tab_id: activeTabId, delta_x: 0, delta_y: -620 };
        }

        const openMatch = input.match(/^(open|go to|navigate to)\s+(.+)$/i);
        if (openMatch) {
            const rawUrl = openMatch[2].trim();
            if (/\b(this|that|first|top|second|third|fourth|1st|2nd|3rd|4th|links?|results?|sites?|websites?|urls?)\b/i.test(rawUrl) && /\s/.test(rawUrl)) {
                return null;
            }
            const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
            return { type: 'open_page', tab_id: activeTabId, url };
        }

        const pressMatch = input.match(/^(?:press|hit)\s+(enter|tab|escape|esc|backspace|delete|arrowup|arrowdown|arrowleft|arrowright)$/i);
        if (pressMatch) {
            return {
                type: 'key_press',
                tab_id: activeTabId,
                key: pressMatch[1],
                modifiers: []
            };
        }

        const clickMatch = input.match(/^click\s+(\d{1,4})\s*,?\s+(\d{1,4})$/i);
        if (clickMatch) {
            return {
                type: 'click',
                tab_id: activeTabId,
                target: {
                    target_type: 'coordinates',
                    x: Number(clickMatch[1]),
                    y: Number(clickMatch[2]),
                    frame_id: null,
                    label: `coordinates ${clickMatch[1]}, ${clickMatch[2]}`
                },
                button: 'left'
            };
        }

        const fillMatch = input.match(/^fill\s+(\d{1,4})\s*,?\s+(\d{1,4})\s+(.+)$/i);
        if (fillMatch) {
            return {
                type: 'fill',
                tab_id: activeTabId,
                target: {
                    target_type: 'coordinates',
                    x: Number(fillMatch[1]),
                    y: Number(fillMatch[2]),
                    frame_id: null,
                    label: `coordinates ${fillMatch[1]}, ${fillMatch[2]}`
                },
                text: fillMatch[3],
                sensitive: false
            };
        }

        const fillLabelMatch = input.match(/^(?:fill|type|enter|put)\s+(.+?)\s+(?:with|as|=)\s+(.+)$/i)
            || input.match(/^type\s+(.+?)\s+in(?:to)?\s+(.+)$/i)
            || input.match(/^enter\s+(.+?)\s+in(?:to)?\s+(.+)$/i)
            || input.match(/^(.+?)\s+(?:with|=)\s+(.+)$/i);
        if (fillLabelMatch) {
            const isTypeIn = /^type\s+/i.test(input) && /\s+in\s+/i.test(input);
            const label = isTypeIn ? fillLabelMatch[2].trim() : fillLabelMatch[1].trim();
            const textValue = isTypeIn ? fillLabelMatch[1].trim() : fillLabelMatch[2].trim();
            return this.fillByLabelCommand(activeTabId, label, textValue, /password|otp|card|cvv|pin/i.test(label));
        }

        const clickLabelMatch = input.match(/^(?:click|tap|press)\s+(.+)$/i) || input.match(/^(submit|search|login|sign in|continue|next)$/i);
        if (clickLabelMatch) {
            const label = clickLabelMatch[1].trim();
            if (!/^\d{1,4}\s*,?\s+\d{1,4}$/.test(label)) {
                return this.clickByLabelCommand(activeTabId, label);
            }
        }

        return null;
    }

    fillByLabelCommand(tabId, label, text, sensitive = false) {
        return {
            type: 'fill',
            tab_id: tabId,
            target: {
                target_type: 'accessibility_node',
                ax_node_id: label,
                label
            },
            text,
            sensitive,
            needs_resolution: true
        };
    }

    clickByLabelCommand(tabId, label) {
        return {
            type: 'click',
            tab_id: tabId,
            target: {
                target_type: 'accessibility_node',
                ax_node_id: label,
                label
            },
            button: 'left',
            needs_resolution: true
        };
    }

    browserActionSuccessMessage(originalText, commands, result) {
        const first = commands[0] || {};
        if (first.type === 'open_page') {
            return `Done, I opened ${first.description ? first.description.replace(/^Open\s+/i, '') : first.url}.`;
        }
        if (first.type === 'click') {
            return `Done, I clicked ${first.target?.label || 'the requested control'}.`;
        }
        if (first.type === 'fill') {
            return `Done, I filled ${first.target?.label || 'the requested field'}.`;
        }
        return `Done, I completed ${commands.length} browser action${commands.length > 1 ? 's' : ''}.`;
    }

    runFlightsDemo() {
        this.simulatedTasks = [
            { text: 'Accessing Layer 1 (AXTree) structure for flights portal', status: 'success' },
            { text: 'Navigating active tab to flights.nifty.com/search', status: 'success', navUrl: 'https://flights.nifty.com/search?from=DEL&to=NRT' },
            { text: 'Typing departure "Delhi (DEL)" and destination "Tokyo (NRT)"', status: 'success' },
            { text: 'Evaluating search result DOM nodes via Layer 2 snapshot', status: 'success' },
            { text: 'Filtering best flights (Found: Air Asia Flight D7-182 at ₹32,100)', status: 'success' },
            { text: 'Entering details in checkout form (autofill template matching)', status: 'success' },
            { text: 'Gating for Tier 4 Transact confirmation...', status: 'running' }
        ];

        window.AppState.update(state => {
            state.isAiStreaming = true;
            state.taskLogs = [];
        });

        let currentIdx = 0;
        this.taskInterval = setInterval(() => {
            if (window.AppState?.aiCancelRequested) {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                return;
            }
            if (currentIdx < this.simulatedTasks.length) {
                const step = this.simulatedTasks[currentIdx];
                
                if (step.navUrl) {
                    window.AppState.update(state => {
                        const activeTab = state.tabs.find(t => t.id === state.activeTabId);
                        if (activeTab) {
                            activeTab.url = step.navUrl;
                            activeTab.title = 'Flights Search';
                        }
                    });
                }

                window.AppState.update(state => {
                    if (state.taskLogs.length > 0) {
                        state.taskLogs[state.taskLogs.length - 1].status = 'success';
                    }
                    state.taskLogs.push({ text: step.text, status: step.status });
                    state.activeTaskStep = step.text;
                });
                
                document.dispatchEvent(new CustomEvent('viewport-highlight-step', { detail: { stepIndex: currentIdx } }));
                currentIdx++;
            } else {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                window.AppState.update(state => {
                    state.isAiStreaming = false;
                    state.taskLogs = [];
                    
                    state.chatHistory.push({
                        sender: 'ai',
                        text: 'I found the following flight options for Delhi to Tokyo. Select a flight to book:',
                        widget: {
                            type: 'flights',
                            data: [
                                { airline: 'Air Asia', code: 'D7-182', duration: '9h 15m', price: '₹32,100', stops: '1 stop' },
                                { airline: 'Japan Airlines', code: 'JL-740', duration: '7h 50m', price: '₹58,400', stops: 'Nonstop' },
                                { airline: 'VietJet Air', code: 'VJ-972', duration: '11h 20m', price: '₹28,900', stops: '1 stop' }
                            ]
                        }
                    });
                });
            }
        }, 1500);
    }

    runSecurityScanDemo() {
        this.simulatedTasks = [
            { text: 'Analyzing SSL certificate handshake and TLS version', status: 'success' },
            { text: 'Checking domain records against threat intelligence lists', status: 'success' },
            { text: 'Scanning page content scripts for third-party trackers', status: 'success' }
        ];

        window.AppState.update(state => {
            state.isAiStreaming = true;
            state.taskLogs = [];
        });

        let currentIdx = 0;
        this.taskInterval = setInterval(() => {
            if (window.AppState?.aiCancelRequested) {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                return;
            }
            if (currentIdx < this.simulatedTasks.length) {
                const step = this.simulatedTasks[currentIdx];
                window.AppState.update(state => {
                    if (state.taskLogs.length > 0) {
                        state.taskLogs[state.taskLogs.length - 1].status = 'success';
                    }
                    state.taskLogs.push({ text: step.text, status: step.status });
                });
                currentIdx++;
            } else {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                
                const tabs = this.state.tabs || [];
                const activeTab = tabs.find(t => t.id === this.state.activeTabId);
                let domain = 'localhost';
                if (activeTab && activeTab.url) {
                    try {
                        domain = new URL(activeTab.url).hostname.replace('www.', '');
                    } catch {}
                }
                
                window.AppState.update(state => {
                    state.isAiStreaming = false;
                    state.taskLogs = [];
                    state.chatHistory.push({
                        sender: 'ai',
                        text: `Security scan complete for **${domain}**. Here is the security status summary:`,
                        widget: {
                            type: 'security',
                            data: {
                                domain: domain,
                                safety: domain.includes('google') || domain.includes('wikipedia') || domain.includes('github') ? 'safe' : 'warning',
                                trackers: domain.includes('google') ? 2 : domain.includes('wikipedia') ? 0 : 8
                            }
                        }
                    });
                });
            }
        }, 1000);
    }

    async runSummarizeDemo() {
        const snapshot = await this.getActivePageSnapshot();
        let responseText = '';
        const fallbackText = (() => {
            const activeTab = window.AppState?.tabs?.find(t => t.id === window.AppState.activeTabId);
            const pageTitle = snapshot?.title || activeTab?.title || 'Active page';
            const pageUrl = snapshot?.url || activeTab?.url || '';
            const headings = (snapshot?.headings || [])
                .slice(0, 5)
                .map(item => `* **${item.level?.toUpperCase?.() || 'Section'}:** ${item.text}`)
                .join('\n');
            const text = snapshot?.text || '';
            const excerpt = text.length > 420 ? `${text.slice(0, 420)}...` : text;
            return `I read the active Chromium page context for **"${pageTitle}"** (URL: \`${pageUrl}\`).\n\n**Quick summary:**\n${excerpt || 'The page loaded, but readable text was limited by site permissions or page structure.'}\n\n${headings ? `**Visible sections:**\n${headings}\n\n` : ''}I can use this same snapshot pipeline for AI answering, form understanding, and safe browser automation.`;
        })();
        try {
            const result = await this.callAiCompletion('Summarize this active browser page. Include key points and one safe next action.', snapshot);
            responseText = result.text || fallbackText;
        } catch {
            responseText = fallbackText;
        }

        this.streamAssistantText(responseText);
    }

    runHelpDemo() {
        let responseText = `Here are the available commands and shortcuts for Aether Co-pilot:\n\n* **Commands:**\n  * \`/summarize\` - Summarize the active page context.\n  * \`/flights\` - Search flights Delhi to Tokyo.\n  * \`/help\` - Show this help menu.\n* **Interactive shortcuts:**\n  * Click **+** (plus icon) in the input bar to see quick actions.\n  * Click the **microphone** icon to simulate voice input.\n  * Use the header three-dots menu to clear history or open AI settings.`;
        
        let tokenIndex = 0;
        let streamedText = '';
        const words = responseText.split(' ');
        
        this.taskInterval = setInterval(() => {
            if (window.AppState?.aiCancelRequested) {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                return;
            }
            if (tokenIndex < words.length) {
                streamedText += (tokenIndex === 0 ? '' : ' ') + words[tokenIndex];
                window.AppState.update(state => {
                    const lastMsg = state.chatHistory[state.chatHistory.length - 1];
                    if (lastMsg && lastMsg.sender === 'ai' && !lastMsg.card) {
                        lastMsg.text = streamedText;
                    } else {
                        state.chatHistory.push({ sender: 'ai', text: streamedText });
                    }
                });
                tokenIndex++;
            } else {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                window.AppState.update(state => {
                    state.isAiStreaming = false;
                });
            }
        }, 45);
    }

    async runQADemo(query) {
        const resolvedTabs = this.resolveTabMentions(query);
        let snapshot = null;
        let tabSnapshots = [];
        
        if (resolvedTabs.length > 0) {
            window.AppState.update(state => {
                state.taskLogs.push({ text: `Capturing context for ${resolvedTabs.length} referenced tabs`, status: 'running' });
            });
            const promises = resolvedTabs.map(async tab => {
                const snap = typeof window.AeroCaptureTabSnapshot === 'function'
                    ? await window.AeroCaptureTabSnapshot(tab.id)
                    : null;
                return { tab, snap };
            });
            tabSnapshots = await Promise.all(promises);
            window.AppState.update(state => {
                const lastLog = state.taskLogs[state.taskLogs.length - 1];
                if (lastLog) {
                    lastLog.text = `Context captured from: ${resolvedTabs.map(t => t.title.slice(0, 12)).join(', ')}`;
                    lastLog.status = 'success';
                }
            });
        } else {
            snapshot = await this.getActivePageSnapshot();
        }

        let pageLine = '';
        if (tabSnapshots.length > 0) {
            pageLine = `\n\nCross-tab context attached for: ${tabSnapshots.map(ts => `**${ts.tab.title}**`).join(', ')}.`;
        } else if (snapshot) {
            pageLine = `\n\nActive page context: **${snapshot.title || 'Untitled'}** at \`${snapshot.url || 'current tab'}\`. I captured ${snapshot.text?.length || 0} readable characters.`;
        }

        let augmentedPrompt = query;
        tabSnapshots.forEach(({ tab, snap }) => {
            if (snap) {
                augmentedPrompt += `\n\n--- Content of Tab: "${tab.title}" (${tab.url}) ---\n`;
                augmentedPrompt += `Text Content:\n${snap.text || 'Empty page'}\n`;
                if (snap.links && snap.links.length > 0) {
                    augmentedPrompt += `Links:\n${snap.links.slice(0, 10).map(l => `- [${l.text}](${l.href})`).join('\n')}\n`;
                }
            }
        });

        let responseText = `I processed your request: *"${query}"*.${pageLine}\n\nThe browser now runs external pages inside Electron Chromium webviews, while the Aether Agent Runtime can receive page snapshots for AI reasoning.`;
        try {
            const result = await this.callAiCompletion(augmentedPrompt, snapshot);
            responseText = result.text || responseText;
            if (result.provider) {
                responseText += `\n\n_Answered by ${result.provider} / ${result.model} in ${result.latency_ms}ms._`;
            }
        } catch (error) {
            responseText += `\n\n_AI provider route unavailable: ${error.message || 'setup incomplete'}_.`;
        }

        this.streamAssistantText(responseText);
    }

    async callAiCompletion(prompt, snapshot) {
        const profile = window.AppState?.aiProfile || await BackendClient.getProfile();
        const provider = profile?.selected_provider || window.AppState?.aiProvider || 'local';
        const effectiveProfile = {
            ...profile,
            allow_cloud_ai: provider !== 'local' ? true : profile?.allow_cloud_ai
        };
        if (effectiveProfile.allow_cloud_ai !== profile?.allow_cloud_ai) {
            await BackendClient.saveProfile(effectiveProfile);
        }
        const pageContext = window.AppState?.aiAllowPageReading === false ? null : this.redactSnapshotForPlanner(snapshot);
        const result = await BackendClient.completeAi({
            prompt,
            provider,
            page_context: pageContext,
            system: [
                'You are Aero, a native AI browser assistant inside the user browser.',
                'Speak naturally like a capable human teammate, not like a demo or status bot.',
                'Use the active page context when it is provided. Mention useful facts from the page, links, forms, and visible controls when relevant.',
                'If the user asks you to do something in the browser, be concise and action-oriented. Do not claim you clicked or typed unless the browser action tool actually executed.',
                'If the request is unclear, ask one short clarifying question. Keep normal answers short, practical, and friendly.'
            ].join('\n'),
            max_output_tokens: 800
        });
        window.AppState.update(state => {
            state.aiProvider = provider;
            state.aiProfile = effectiveProfile;
            state.recordAiAction?.({
                type: 'ai_completion',
                status: 'success',
                reason: prompt,
                provider: result.provider,
                model: result.model,
                latency_ms: result.latency_ms,
                fallback: Boolean(result.fallback),
                prompt_injection_risk: result.prompt_injection_risk || 'low',
                context_blocked: Boolean(result.context_blocked)
            });
        });
        return result;
    }

    streamAssistantText(responseText) {
        let tokenIndex = 0;
        let streamedText = '';
        const words = responseText.split(' ');

        this.taskInterval = setInterval(() => {
            if (window.AppState?.aiCancelRequested) {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                return;
            }
            if (tokenIndex < words.length) {
                streamedText += (tokenIndex === 0 ? '' : ' ') + words[tokenIndex];
                window.AppState.update(state => {
                    const lastMsg = state.chatHistory[state.chatHistory.length - 1];
                    if (lastMsg && lastMsg.sender === 'ai' && !lastMsg.card) {
                        lastMsg.text = streamedText;
                    } else {
                        state.chatHistory.push({ sender: 'ai', text: streamedText });
                    }
                });
                tokenIndex++;
            } else {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                window.AppState.update(state => {
                    state.isAiStreaming = false;
                });
            }
        }, 45);
    }

    cancelSimulatedTask() {
        window.AppState.update(state => {
            state.chatHistory.push({ sender: 'ai', text: '🛑 Task cancelled by user. I have cleared all transient memory and halted form submission.' });
            state.taskLogs = [];
        });
    }

    approveSimulatedTask(btnEl) {
        const textNode = btnEl.querySelector('.btn-text') || btnEl;
        btnEl.disabled = true;
        textNode.innerHTML = '⚡ Verifying Windows Hello...';

        setTimeout(() => {
            window.AppState.update(state => {
                const chat = state.chatHistory;
                const lastMsg = chat[chat.length - 1];
                if (lastMsg && lastMsg.card) {
                    delete lastMsg.card;
                    lastMsg.text = "✓ Flight Booked Successfully! Confirmation ID: **AX-908271**.";
                }
                
                if (state.taskLogs.length > 0) {
                    state.taskLogs[state.taskLogs.length - 1].status = 'success';
                    state.taskLogs.push({ text: 'Biometric authorization approved.', status: 'success' });
                    state.taskLogs.push({ text: 'Transaction finalized.', status: 'success' });
                }
            });
        }, 1800);
    }

    runWebSearchDemo(query) {
        this.simulatedTasks = [
            { text: `Initiating Google search query: "${query}"`, status: 'success' },
            { text: 'Parsing top 3 search result URLs and structural content', status: 'success' },
            { text: 'Synthesizing web search context with local session', status: 'success' }
        ];

        window.AppState.update(state => {
            state.isAiStreaming = true;
            state.taskLogs = [];
        });

        let currentIdx = 0;
        this.taskInterval = setInterval(() => {
            if (window.AppState?.aiCancelRequested) {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                return;
            }
            if (currentIdx < this.simulatedTasks.length) {
                const step = this.simulatedTasks[currentIdx];
                window.AppState.update(state => {
                    if (state.taskLogs.length > 0) {
                        state.taskLogs[state.taskLogs.length - 1].status = 'success';
                    }
                    state.taskLogs.push({ text: step.text, status: step.status });
                });
                currentIdx++;
            } else {
                clearInterval(this.taskInterval);
                this.taskInterval = null;
                window.AppState.update(state => {
                    state.isAiStreaming = false;
                    state.chatHistory.push({
                        sender: 'ai',
                        text: `🌐 **Web Search Results for "${query}":**\n\nI searched the web and found relevant context:\n\n1. **Aero Browser Core:** Development insights on named-pipe socket connections.\n2. **Chromium Rendering:** Details on AXTree Accessibility integration.\n\nLet me know if you would like me to compile these sources into a local script!`
                    });
                });
            }
        }, 1200);
    }
}
