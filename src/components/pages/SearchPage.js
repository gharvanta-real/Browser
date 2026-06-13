import { BaseComponent } from '../BaseComponent.js';
import { BackendClient } from '../../services/BackendClient.js';

export class SearchPage extends BaseComponent {
    constructor() {
        super();
        this.state = {
            query: '',
            activeFilter: 'All',
            backendHits: [],
            backendQuery: ''
        };

        this.searchIndex = [
            {
                title: 'Aero Browser Documentation',
                url: 'aero://docs',
                snippet: 'Read about the architecture, named pipes, access control, and developer guides for the Aero browser core.',
                category: 'History',
                badge: 'Local Specs',
                icon: 'hgi-note-01'
            },
            {
                title: 'GitHub - Core Repo',
                url: 'https://github.com/browser-project/core',
                snippet: 'Public repository for the Aero Browser engine. View issues, discussions, pull requests, and contribute to the browser shell.',
                category: 'Web',
                badge: 'Git Web',
                icon: 'hgi-global'
            },
            {
                title: 'Nifty Flights — Search & Book',
                url: 'https://flights.nifty.com',
                snippet: 'Compare global flight prices, search multi-city routes, and book domestic or international flights instantly.',
                category: 'Web',
                badge: 'Flight Search',
                icon: 'hgi-airplane-01'
            },
            {
                title: 'Designing Focus Into the Modern Web',
                url: 'https://foundation.aero/articles/designing-focus-into-the-modern-web',
                snippet: 'An article on intentional user interfaces, cognitive load optimization, and minimalist design standards for web browsers.',
                category: 'Bookmarks',
                badge: 'Article Bookmark',
                icon: 'hgi-star'
            },
            {
                title: 'The Design of Everyday Things – Don Norman',
                url: 'https://www.jnd.org/dn.mss/design_everyday_things.html',
                snippet: 'Masterpiece on cognitive design principles, mapping conceptual models, affordances, signifiers, and user error reduction.',
                category: 'Bookmarks',
                badge: 'UX Bookmark',
                icon: 'hgi-book-open-01'
            },
            {
                title: 'Interface Design Best Practices',
                url: 'https://www.interaction-design.org/literature/topics/interface-design',
                snippet: 'Learn standard heuristics, navigation structures, and visual hierarchies for software applications.',
                category: 'Bookmarks',
                badge: 'UI Bookmark',
                icon: 'hgi-star'
            },
            {
                title: 'Aero Browser Workspace Setup',
                url: 'aero://workspaces',
                snippet: 'Configure custom workspaces (e.g. Work, Personal, Development) to isolate tabs, sync bookmarks, and streamline your browser workflow.',
                category: 'History',
                badge: 'Local Settings',
                icon: 'hgi-grid-view'
            },
            {
                title: 'Wikipedia - Web Browsers',
                url: 'https://en.wikipedia.org/wiki/Web_browser',
                snippet: 'Historical reference, engines list, W3C standards compliance, and detailed history of the world wide web software architecture.',
                category: 'Web',
                badge: 'Wiki Web',
                icon: 'hgi-global'
            }
        ];
    }

    connectedCallback() {
        window.AppState.subscribe(state => {
            // Re-filter results reactively if global AppState collections update
            this.updateResults();
        });
        super.connectedCallback();
    }

    template() {
        return `
            <div class="search-page-layout" style="display: flex; height: 100%; width: 100%; background: var(--color-viewport-bg); color: var(--color-viewport-text); font-family: var(--font-ui); overflow: hidden;">
                <!-- Main Search Container -->
                <div style="flex: 1; padding: 40px var(--spacing-xl); overflow-y: auto; display: flex; flex-direction: column; gap: var(--spacing-lg);">
                    
                    <!-- Search Header -->
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                        <h2 style="margin: 0; font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); display: flex; align-items: center; gap: 8px;">
                            <i class="hgi-stroke hgi-search-01" style="color: var(--color-input-focus-border);"></i> Web & Local Search
                        </h2>
                        <p style="margin: 0; color: var(--color-viewport-text-muted); font-size: var(--font-size-sm);">Search tabs, history, bookmarks, and the web simultaneously</p>
                    </div>

                    <!-- Search Bar input -->
                    <div style="display: flex; gap: var(--spacing-sm); width: 100%; max-width: 680px; position: relative;">
                        <input type="text" id="search-input" placeholder="Type a search query, URL, or ask a question..." value="${this.state.query}" style="flex: 1; padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) 44px; font-size: var(--font-size-sm); border: none; border-radius: var(--border-radius-lg); background: var(--color-card-bg); color: var(--color-viewport-text); box-shadow: var(--shadow-md); transition: var(--transition-fast);">
                        <i class="hgi-stroke hgi-search-01" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 16px; color: var(--color-text-inactive);"></i>
                    </div>

                    <!-- Filter Pills Row -->
                    <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
                        ${['All', 'Web', 'Bookmarks', 'History'].map(filter => `
                            <button class="filter-pill ${this.state.activeFilter === filter ? 'active' : ''}" data-filter="${filter}" style="padding: 6px var(--spacing-md); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); border-radius: var(--border-radius-pill); border: none; cursor: pointer; background: ${this.state.activeFilter === filter ? 'var(--color-input-focus-border)' : 'var(--color-window-bg)'}; color: ${this.state.activeFilter === filter ? '#FFFFFF' : 'var(--color-text-active)'}; transition: var(--transition-normal);">
                                ${filter}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Search Results Grid Area -->
                    <div style="display: flex; gap: var(--spacing-xl); width: 100%; align-items: flex-start;">
                        <!-- Results List -->
                        <div id="search-results-list" style="flex: 1.5; display: flex; flex-direction: column; gap: var(--spacing-md);">
                            <!-- Populated dynamically -->
                        </div>

                        <!-- GSE Generative AI Card on the right -->
                        <div id="gse-panel" style="flex: 1; background: var(--color-card-bg); border-radius: var(--border-radius-lg); padding: var(--spacing-lg); box-shadow: var(--shadow-md); display: none; flex-direction: column; gap: var(--spacing-sm); border-left: 4px solid var(--color-input-focus-border);">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    afterRender() {
        const input = this.querySelector('#search-input');
        if (input) {
            input.focus();
            input.selectionStart = input.selectionEnd = input.value.length;

            input.addEventListener('input', (e) => {
                this.state.query = e.target.value;
                this.updateResults();
            });
        }

        this.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                this.state.activeFilter = pill.getAttribute('data-filter');
                this.state.backendQuery = '';
                this.state.backendHits = [];
                this.querySelectorAll('.filter-pill').forEach(p => {
                    const isCurrent = p.getAttribute('data-filter') === this.state.activeFilter;
                    p.style.background = isCurrent ? 'var(--color-input-focus-border)' : 'var(--color-window-bg)';
                    p.style.color = isCurrent ? '#FFFFFF' : 'var(--color-text-active)';
                });
                this.updateResults();
            });
        });

        this.updateResults();
    }

    async updateResults() {
        const resultsList = this.querySelector('#search-results-list');
        const gsePanel = this.querySelector('#gse-panel');
        if (!resultsList) return;

        const query = this.state.query.trim().toLowerCase();
        const activeFilter = this.state.activeFilter;
        const kindMap = {
            Bookmarks: ['bookmark'],
            History: ['history'],
            Web: ['tab', 'page_snapshot']
        };

        if (query.length >= 2 && this.state.backendQuery !== query) {
            this.state.backendQuery = query;
            BackendClient.search(query, {
                limit: 20,
                kinds: activeFilter === 'All' ? null : kindMap[activeFilter] || null
            }).then(result => {
                if (this.state.query.trim().toLowerCase() !== query) return;
                this.state.backendHits = (result.hits || []).map(hit => ({
                    title: hit.title,
                    url: hit.url || '',
                    snippet: hit.snippet || hit.source || '',
                    category: this.categoryFromKind(hit.kind),
                    badge: hit.source || hit.kind,
                    icon: this.iconFromKind(hit.kind),
                    score: hit.score
                }));
                this.updateResults();
            }).catch(() => {});
        }

        // Build dynamic search index from global state
        const dynamicIndex = [
            ...this.searchIndex,
            ...(window.AppState?.bookmarks || []).map(b => ({
                title: b.title,
                url: b.url,
                snippet: b.description || `Saved bookmark: ${b.url}`,
                category: 'Bookmarks',
                badge: (b.tags && b.tags.length > 0) ? b.tags.map(t => `#${t}`).join(' ') : 'Bookmark',
                icon: b.faviconClass || 'hgi-star'
            })),
            ...(window.AppState?.history || []).map(h => ({
                title: h.title,
                url: h.url,
                snippet: `Visited on ${h.date} at ${h.time}`,
                category: 'History',
                badge: 'History',
                icon: h.faviconClass || 'hgi-clock-01'
            }))
        ];

        // Filter search index
        const backendHits = query.length >= 2 ? (this.state.backendHits || []) : [];
        const filteredLocal = dynamicIndex.filter(item => {
            const matchesQuery = item.title.toLowerCase().includes(query) || 
                                 item.url.toLowerCase().includes(query) || 
                                 item.snippet.toLowerCase().includes(query);
            const matchesFilter = activeFilter === 'All' || item.category === activeFilter;
            return matchesQuery && matchesFilter;
        });
        const seen = new Set();
        const filtered = [...backendHits, ...filteredLocal].filter(item => {
            const key = `${item.category}:${item.url}:${item.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Render Results
        if (filtered.length === 0) {
            resultsList.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--color-viewport-text-muted);">
                    <i class="hgi-stroke hgi-search-list-02" style="font-size: 36px; opacity: 0.5; display: block; margin-bottom: var(--spacing-sm);"></i>
                    <div style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">No results match "${this.state.query}"</div>
                    <div style="font-size: var(--font-size-xs); opacity: 0.7; margin-top: 4px;">Try searching for "aero", "design", or "github"</div>
                </div>
            `;
        } else {
            resultsList.innerHTML = filtered.map(item => `
                <div class="search-result-card" style="background: var(--color-card-bg); padding: var(--spacing-md); border-radius: var(--border-radius-md); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 4px; transition: var(--transition-fast); cursor: pointer;" data-url="${item.url}">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span class="search-badge" style="font-size: 9px; padding: 1px 6px; border: 1px solid var(--color-viewport-border); border-radius: var(--border-radius-pill); color: var(--color-viewport-text-muted); background: var(--color-window-bg);">${item.badge}</span>
                        <span style="font-size: 11px; color: var(--color-viewport-text-muted); display: flex; align-items: center; gap: 4px;"><i class="hgi-stroke ${item.icon}" style="font-size: 12px;"></i> ${item.category}</span>
                    </div>
                    <h4 style="margin: var(--spacing-xxs) 0 0; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: #0066CC;">${item.title}</h4>
                    <span style="font-size: 11px; color: #188038; word-break: break-all;">${item.url}</span>
                    <p style="margin: 4px 0 0; font-size: var(--font-size-xs); color: var(--color-viewport-text-muted); line-height: 1.4;">${item.snippet}</p>
                </div>
            `).join('');

            // Bind click to open search results
            resultsList.querySelectorAll('.search-result-card').forEach(card => {
                card.addEventListener('click', () => {
                    const targetUrl = card.getAttribute('data-url');
                    window.AppState.update(state => {
                        const tab = state.tabs.find(t => t.id === state.activeTabId);
                        if (tab) {
                            tab.url = targetUrl;
                            tab.title = card.querySelector('h4').innerText;
                        }
                    });
                });
            });
        }

        // Generative Answer Experience Trigger
        const questionWords = ['what', 'why', 'how', 'who', 'where', 'describe', 'aero', '?'];
        const isQuestion = questionWords.some(w => query.includes(w)) && query.length >= 3;

        if (isQuestion && gsePanel) {
            let answer = '';
            let headline = 'Generative AI Overview';

            if (query.includes('aero')) {
                answer = `<strong>Aero Browser</strong> is a developer-centric, AI-native browser shell. Its key specifications include:
                <ul>
                    <li><strong>Separated Process Model:</strong> Built on a C++ Chromium container communicating with a Rust Aether agent runtime.</li>
                    <li><strong>Named Pipe CDP Dispatching:</strong> Dispatches synthetic clicks using the Accessibility Tree (AXTree) rather than standard script injections.</li>
                    <li><strong>Workspace Isolation:</strong> Logically separates open tabs into workspaces (Work, Personal) directly inside the viewport.</li>
                </ul>`;
            } else if (query.includes('github')) {
                answer = `The <strong>Aero core codebase</strong> is hosted in a public git repository at <code>github.com/browser-project/core</code>. Developer workflows include:
                <ul>
                    <li>Creating customized UI templates under ES modules.</li>
                    <li>Debugging CDP execution logs via the AI activity panel.</li>
                </ul>`;
            } else {
                answer = `Searching index and web for <em>"${this.state.query}"</em>... 
                <p style="margin-top: var(--spacing-sm);">I can see local files for documentation, bookmarks on Design, and history paths. Type a specific query like <strong>"what is aero browser"</strong> to get a full AI summary.</p>`;
            }

            gsePanel.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h4 style="margin: 0; font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); display: flex; align-items: center; gap: 6px; color: var(--color-input-focus-border);">
                        <i class="hgi-stroke hgi-chat-bot" style="font-size: 16px;"></i> ${headline}
                    </h4>
                    <span style="font-size: 9px; color: var(--color-viewport-text-muted); font-weight: var(--font-weight-semibold); background: color-mix(in srgb, var(--color-input-focus-border) 8%, transparent); padding: 1px 6px; border-radius: var(--border-radius-pill);">BETA</span>
                </div>
                <div style="font-size: var(--font-size-xs); color: var(--color-viewport-text); line-height: 1.5; margin-top: var(--spacing-sm);">
                    ${answer}
                </div>
                <div style="border-top: 1px solid var(--color-viewport-border); padding-top: var(--spacing-sm); margin-top: var(--spacing-sm); font-size: 10px; color: var(--color-viewport-text-muted); display: flex; gap: var(--spacing-md);">
                    <span>Source: <a href="aero://docs" style="color: #0066CC; text-decoration: none;">Aero Specs</a></span>
                    <span>Confidence: <strong>High</strong></span>
                </div>
            `;
            gsePanel.style.display = 'flex';
        } else if (gsePanel) {
            gsePanel.style.display = 'none';
        }
    }

    categoryFromKind(kind) {
        return {
            bookmark: 'Bookmarks',
            history: 'History',
            tab: 'Web',
            reading_list: 'Bookmarks',
            download: 'History',
            page_snapshot: 'Web'
        }[kind] || 'Web';
    }

    iconFromKind(kind) {
        return {
            bookmark: 'hgi-star',
            history: 'hgi-clock-01',
            tab: 'hgi-global',
            reading_list: 'hgi-book-open-01',
            download: 'hgi-download-01',
            page_snapshot: 'hgi-global'
        }[kind] || 'hgi-global';
    }
}
