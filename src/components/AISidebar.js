import { BaseComponent } from './BaseComponent.js';

export class AISidebar extends BaseComponent {
    constructor() {
        super();
        this.isThinking = false;
        this.activeTaskIndex = -1;
        this.simulatedTasks = [];
        this.state = {
            ...this.state,
            isMoreMenuOpen: false
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
                tabs: state.tabs
            });
        });

        this._triggerFlightsDemoHandler = () => {
            this.runFlightsDemo();
        };
        // Listen for flights demo triggered from omnibox suggestion
        document.addEventListener('trigger-flights-demo', this._triggerFlightsDemoHandler);

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
                            
                            // Re-evaluate innerHTML but ignore cards
                            const textPartOnly = chatMessageEl.innerHTML.split('<div class="confirmation-card"')[0].trim();
                            
                            // We compare formattedText (which has p/ul tags) with textPartOnly
                            if (textPartOnly !== formattedText) {
                                if (existingCard) {
                                    chatMessageEl.innerHTML = formattedText;
                                    chatMessageEl.appendChild(existingCard);
                                } else {
                                    chatMessageEl.innerHTML = `${formattedText}${msg.card ? this.renderConfirmationCard(msg.card) : ''}`;
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

                // B. Update or append task logs inside activity stream
                let activityStream = scroller.querySelector('.ai-activity-stream');
                if (logs.length > 0) {
                    if (!activityStream) {
                        activityStream = document.createElement('div');
                        activityStream.className = 'ai-activity-stream';
                        scroller.appendChild(activityStream);
                    }
                    
                    const logsHtml = `
                        <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-xs); font-size: 10px; color: var(--color-text-inactive);">Agent Orchestrator Logs</div>
                        ${logs.map(log => {
                            let iconHtml = '';
                            if (log.status === 'success') {
                                iconHtml = `<i class="hgi-stroke hgi-checkmark-circle-01" style="font-size: 11px; display: inline-flex; align-items: center; justify-content: center;"></i>`;
                            } else if (log.status === 'running') {
                                iconHtml = `<i class="hgi-stroke hgi-clock-01 spin-animation" style="font-size: 11px; display: inline-flex; align-items: center; justify-content: center;"></i>`;
                            } else {
                                iconHtml = `<i class="hgi-stroke hgi-alert-circle" style="font-size: 11px; display: inline-flex; align-items: center; justify-content: center;"></i>`;
                            }
                            return `
                                <div class="activity-item ${log.status === 'success' ? 'success' : log.status === 'running' ? 'info' : 'warning'}">
                                    ${iconHtml}
                                    <span>${log.text}</span>
                                </div>
                            `;
                        }).join('')}
                    `;
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
                            ${msg.card ? this.renderConfirmationCard(msg.card) : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        const logsHtml = logs.length > 0 ? `
            <div class="ai-activity-stream">
                <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-xs); font-size: 10px; color: var(--color-text-inactive);">Agent Orchestrator Logs</div>
                ${logs.map(log => {
                    let iconHtml = '';
                    if (log.status === 'success') {
                        iconHtml = `<i class="hgi-stroke hgi-checkmark-circle-01" style="font-size: 11px; display: inline-flex; align-items: center; justify-content: center;"></i>`;
                    } else if (log.status === 'running') {
                        iconHtml = `<i class="hgi-stroke hgi-clock-01 spin-animation" style="font-size: 11px; display: inline-flex; align-items: center; justify-content: center;"></i>`;
                    } else {
                        iconHtml = `<i class="hgi-stroke hgi-alert-circle" style="font-size: 11px; display: inline-flex; align-items: center; justify-content: center;"></i>`;
                    }
                    return `
                        <div class="activity-item ${log.status === 'success' ? 'success' : log.status === 'running' ? 'info' : 'warning'}">
                            ${iconHtml}
                            <span>${log.text}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : '';

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

            <!-- Chat Messages Scroll Area / Welcome Screen -->
            ${isWelcomeState ? `
                <div class="ai-welcome-container" id="chat-scroller">
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
                            <button class="ai-send-btn" id="ai-chat-send" aria-label="Send Message" style="display: flex; align-items: center; justify-content: center;">
                                <i class="hgi-stroke hgi-waveform" style="font-size: 14px;"></i>
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
                const newWidth = Math.max(260, Math.min(window.innerWidth * 0.7, startWidth + deltaX));
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

        const isWebSearch = this.state.isWebSearchActive;

        window.AppState.update(state => {
            state.chatHistory.push({ sender: 'user', text: val });
            state.isAiStreaming = true;
            state.taskLogs = []; 
        });

        input.value = '';
        input.style.height = 'auto';

        const cmdPopover = this.querySelector('#ai-cmd-popover');
        if (cmdPopover) cmdPopover.style.display = 'none';

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
            } else if (lowerVal === '/help' || lowerVal.includes('help') || lowerVal.includes('shortcuts')) {
                this.runHelpDemo();
            } else if (this.tryRunBrowserCommand(val)) {
                return;
            } else {
                this.runQADemo(val);
            }
        }, 800);
    }

    tryRunBrowserCommand(text) {
        const command = this.parseBrowserCommand(text);
        if (!command || typeof window.AeroExecuteBrowserCommand !== 'function') {
            return false;
        }

        window.AppState.update(state => {
            state.taskLogs.push({ text: `Validating browser command: ${command.type}`, status: 'running' });
        });

        window.AeroExecuteBrowserCommand(command, text).then(result => {
            window.AppState.update(state => {
                const lastLog = state.taskLogs[state.taskLogs.length - 1];
                if (lastLog?.status === 'running') {
                    lastLog.status = result.ok ? 'success' : 'warning';
                }
                state.isAiStreaming = false;
                state.chatHistory.push({
                    sender: 'ai',
                    text: result.ok
                        ? `Done. I executed \`${command.type}\` through the native Chromium input path after backend policy validation.`
                        : `I could not execute that browser action: ${result.message || 'blocked by policy'}`
                });
            });
        });
        return true;
    }

    parseBrowserCommand(text) {
        const input = String(text || '').trim();
        const lower = input.toLowerCase();
        const activeTabId = window.AppState?.activeTabId || 'active';

        if (lower === 'scroll down' || lower === 'scroll') {
            return { type: 'scroll', tab_id: activeTabId, delta_x: 0, delta_y: 620 };
        }
        if (lower === 'scroll up') {
            return { type: 'scroll', tab_id: activeTabId, delta_x: 0, delta_y: -620 };
        }

        const openMatch = input.match(/^(open|go to|navigate to)\s+(.+)$/i);
        if (openMatch) {
            const rawUrl = openMatch[2].trim();
            const url = /^[a-z][a-z0-9+.-]*:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
            return { type: 'open_page', tab_id: activeTabId, url };
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

        const fillLabelMatch = input.match(/^(?:fill|type)\s+(.+?)\s+(?:with|as)\s+(.+)$/i)
            || input.match(/^type\s+(.+?)\s+in\s+(.+)$/i);
        if (fillLabelMatch) {
            const isTypeIn = /^type\s+/i.test(input) && /\s+in\s+/i.test(input);
            const label = isTypeIn ? fillLabelMatch[2].trim() : fillLabelMatch[1].trim();
            const textValue = isTypeIn ? fillLabelMatch[1].trim() : fillLabelMatch[2].trim();
            return {
                type: 'fill',
                tab_id: activeTabId,
                target: {
                    target_type: 'accessibility_node',
                    ax_node_id: label,
                    label
                },
                text: textValue,
                sensitive: /password|otp|card|cvv|pin/i.test(label),
                needs_resolution: true
            };
        }

        const clickLabelMatch = input.match(/^click\s+(.+)$/i);
        if (clickLabelMatch) {
            const label = clickLabelMatch[1].trim();
            if (!/^\d{1,4}\s*,?\s+\d{1,4}$/.test(label)) {
                return {
                    type: 'click',
                    tab_id: activeTabId,
                    target: {
                        target_type: 'accessibility_node',
                        ax_node_id: label,
                        label
                    },
                    button: 'left',
                    needs_resolution: true
                };
            }
        }

        return null;
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
        const interval = setInterval(() => {
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
                clearInterval(interval);
                window.AppState.update(state => {
                    state.isAiStreaming = false;
                    state.taskLogs[state.taskLogs.length - 1].status = 'warning';
                    
                    state.chatHistory.push({
                        sender: 'ai',
                        text: 'I have compiled the details and navigated to the checkout page. To proceed with the booking, please approve the payment autofill:',
                        card: {
                            tier: 4,
                            actionDescription: 'Autofill saved payment card details and submit the booking request for ₹32,100.',
                            details: [
                                { label: 'Passenger', val: 'Rohan Sharma' },
                                { label: 'Flight', val: 'Air Asia D7-182 (DEL -> NRT)' },
                                { label: 'Amount Due', val: '₹32,100' },
                                { label: 'Funding Source', val: 'HDFC Credit Card ending in 4082' }
                            ]
                        }
                    });
                });
            }
        }, 1500);
    }

    async runSummarizeDemo() {
        const snapshot = await this.getActivePageSnapshot();
        let responseText = '';
        window.AppState.update(state => {
            const activeTab = state.tabs.find(t => t.id === state.activeTabId);
            const pageTitle = snapshot?.title || activeTab?.title || 'Active page';
            const pageUrl = snapshot?.url || activeTab?.url || '';
            const headings = (snapshot?.headings || [])
                .slice(0, 5)
                .map(item => `* **${item.level?.toUpperCase?.() || 'Section'}:** ${item.text}`)
                .join('\n');
            const text = snapshot?.text || '';
            const excerpt = text.length > 420 ? `${text.slice(0, 420)}...` : text;
            responseText = `I read the active Chromium page context for **"${pageTitle}"** (URL: \`${pageUrl}\`).\n\n**Quick summary:**\n${excerpt || 'The page loaded, but readable text was limited by site permissions or page structure.'}\n\n${headings ? `**Visible sections:**\n${headings}\n\n` : ''}I can use this same snapshot pipeline for AI answering, form understanding, and safe browser automation.`;
        });

        let tokenIndex = 0;
        let streamedText = '';
        const words = responseText.split(' ');
        
        const interval = setInterval(() => {
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
                clearInterval(interval);
                window.AppState.update(state => {
                    state.isAiStreaming = false;
                });
            }
        }, 45);
    }

    runHelpDemo() {
        let responseText = `Here are the available commands and shortcuts for Aether Co-pilot:\n\n* **Commands:**\n  * \`/summarize\` - Summarize the active page context.\n  * \`/flights\` - Search flights Delhi to Tokyo.\n  * \`/help\` - Show this help menu.\n* **Interactive shortcuts:**\n  * Click **+** (plus icon) in the input bar to see quick actions.\n  * Click the **microphone** icon to simulate voice input.\n  * Use the header three-dots menu to clear history or open AI settings.`;
        
        let tokenIndex = 0;
        let streamedText = '';
        const words = responseText.split(' ');
        
        const interval = setInterval(() => {
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
                clearInterval(interval);
                window.AppState.update(state => {
                    state.isAiStreaming = false;
                });
            }
        }, 45);
    }

    async runQADemo(query) {
        const snapshot = await this.getActivePageSnapshot();
        const pageLine = snapshot
            ? `\n\nActive page context: **${snapshot.title || 'Untitled'}** at \`${snapshot.url || 'current tab'}\`. I captured ${snapshot.text?.length || 0} readable characters and ${(snapshot.links || []).length} links.`
            : '';
        const responseText = `I processed your request: *"${query}"*.${pageLine}\n\nThe browser now runs external pages inside Electron Chromium webviews, while the Aether Agent Runtime can receive page snapshots for AI reasoning, click planning, and safer automation gates.`;
        
        let tokenIndex = 0;
        let streamedText = '';
        const words = responseText.split(' ');

        const interval = setInterval(() => {
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
                clearInterval(interval);
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
        const interval = setInterval(() => {
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
                clearInterval(interval);
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
