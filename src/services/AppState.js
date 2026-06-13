import { BackendClient } from './BackendClient.js';

// Initialize Global App State
window.AppState = {
    tabs: [
        { id: 'tab-new', title: 'New Tab', url: 'https://newtab.internal', hibernated: false, active: true, scrollY: 0, workspace: 'Default' },
        { id: 'tab-1', title: 'Browser Docs', url: 'https://browser.internal/docs', hibernated: false, active: false, scrollY: 0, workspace: 'Work' },
        { id: 'tab-2', title: 'GitHub - Core Repo', url: 'https://github.com/browser-project/core', hibernated: true, active: false, scrollY: 0, workspace: 'Personal' }
    ],
    activeTabId: 'tab-new',
    activeWorkspace: 'Default',
    workspaces: [
        { id: 'Default', name: 'Default', icon: 'hgi-home-01', color: '#4D90FE' },
        { id: 'Work', name: 'Work', icon: 'hgi-briefcase-01', color: '#1A73E8' },
        { id: 'Personal', name: 'Personal', icon: 'hgi-user', color: '#188038' }
    ],
    aiProvider: 'claude', // 'claude' | 'openai' | 'gemini' | 'local'
    aiProfile: null,
    localVram: 4, // GB allocated
    tabLayout: 'horizontal', // 'horizontal' | 'vertical'
    showAiView: false, // Toggles accessibility tree overlay
    showAiSidebar: false, // AI Sidebar starts closed by default
    aiControlEnabled: true,
    aiShowLiveCursor: true,
    aiHumanTyping: true,
    aiTypingDelayMs: 24,
    aiActionDelayMs: 160,
    aiRequireConfirmation: true,
    aiAllowPageReading: true,
    aiAllowActionExecution: true,
    lastAiContextDisclosure: null,
    autofillProfile: {
        fullName: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        country: 'India'
    },
    runtimeEngine: 'web',
    theme: 'light', // 'light' (default) | 'dark'
    isAiStreaming: false,
    chatHistory: [
        { sender: 'ai', text: 'Hello! I am your native Browser Assistant. I can see whatever you browse, help you research across tabs, or automate web actions safely. How can I help you today?' }
    ],
    taskLogs: [], // Step-by-step task logs for visual tracing
    activeTaskStep: null,
    aiActionHistory: [],
    aiCancelRequested: false,
    
    // User Settings
    syncBookmarks: true,
    syncHistory: true,
    syncPasswords: false,
    syncSettings: true,
    syncDestination: 'cloud',
    startupPage: 'newtab',
    startupUrl: 'https://aero.internal/dashboard',
    searchEngine: 'Google',
    showSearchSuggestions: true,
    showSearchHistory: true,
    showSearchAutocomplete: true,
    downloadPath: 'C:\\Users\\Rohan\\Downloads',
    askBeforeDownload: true,
    memorySaver: true,
    energySaver: false,
    showBookmarksBar: true,
    showLeftSidebar: true,
    blockedTrackers: 0,
    blockedTrackerLog: [],
    sitePermissions: [],
    sitePermissions: {
        camera: 'ask',
        microphone: 'ask',
        location: 'ask',
        notifications: 'ask',
        aiBlocklist: [
            { domain: 'facebook.com', status: 'blocked', dateAdded: '2026-06-01' },
            { domain: 'netflix.com', status: 'blocked', dateAdded: '2026-06-10' }
        ]
    },
    
    // Unified Mock Datasets
    bookmarks: [
        {
            id: 'b1',
            title: 'Product',
            isFolder: true,
            folder: 'Bookmarks bar',
            color: '#4285F4',
            tags: [],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-folder',
            bgGradient: '',
            description: 'Product team bookmarks folder.'
        },
        {
            id: 'b2',
            title: 'Marketing',
            isFolder: true,
            folder: 'Bookmarks bar',
            color: '#34A853',
            tags: [],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-folder',
            bgGradient: '',
            description: 'Marketing team bookmarks folder.'
        },
        {
            id: 'b3',
            title: 'Inspiration',
            isFolder: true,
            folder: 'Bookmarks bar',
            color: '#A259FF',
            tags: [],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-folder',
            bgGradient: '',
            description: 'Inspiration resources folder.'
        },
        {
            id: 'b4',
            title: 'Aero Dashboard',
            url: 'https://aero.internal/dashboard',
            displayUrl: 'aero.internal/dashboard',
            folder: 'Bookmarks bar',
            tags: ['system'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: true,
            faviconClass: 'hgi-grid-view',
            bgGradient: 'linear-gradient(135deg, #EA4335, #A259FF)',
            description: 'Aero Browser local system dashboard.'
        },
        {
            id: 'b5',
            title: 'Notion',
            url: 'https://notion.so',
            displayUrl: 'notion.so',
            folder: 'Bookmarks bar',
            tags: ['productivity'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: true,
            faviconClass: 'hgi-global',
            favicon: 'https://www.google.com/s2/favicons?sz=32&domain=notion.so',
            bgGradient: 'linear-gradient(135deg, #2A2C30, #5E6AD2)',
            description: 'Notion workspace.'
        },
        {
            id: 'b6',
            title: 'Figma',
            url: 'https://figma.com',
            displayUrl: 'figma.com',
            folder: 'Bookmarks bar',
            tags: ['design'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: true,
            faviconClass: 'hgi-global',
            favicon: 'https://www.google.com/s2/favicons?sz=32&domain=figma.com',
            bgGradient: 'linear-gradient(135deg, #FF7262, #0ACF83)',
            description: 'Figma design tool.'
        },
        {
            id: 'b7',
            title: 'Linear',
            url: 'https://linear.app',
            displayUrl: 'linear.app',
            folder: 'Bookmarks bar',
            tags: ['issue-tracking'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: true,
            faviconClass: 'hgi-global',
            favicon: 'https://www.google.com/s2/favicons?sz=32&domain=linear.app',
            bgGradient: 'linear-gradient(135deg, #5E6AD2, #FF7262)',
            description: 'Linear issues tracking.'
        },
        // Items in folders
        {
            id: 'bp1',
            title: 'Jira Dashboard',
            url: 'https://jira.com',
            displayUrl: 'jira.com',
            folder: 'Product',
            tags: ['work'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #0ACF83, #1ABC9C)',
            description: 'Atlassian Jira project tracker.'
        },
        {
            id: 'bp2',
            title: 'Confluence Wiki',
            url: 'https://confluence.com',
            displayUrl: 'confluence.com',
            folder: 'Product',
            tags: ['work'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #0ACF83, #1ABC9C)',
            description: 'Atlassian Confluence documentation.'
        },
        {
            id: 'bm1',
            title: 'Google Ads',
            url: 'https://ads.google.com',
            displayUrl: 'ads.google.com',
            folder: 'Marketing',
            tags: ['ads'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #FF7262, #FFBA00)',
            description: 'Google Adwords campaigns.'
        },
        {
            id: 'bm2',
            title: 'Hubspot CRM',
            url: 'https://hubspot.com',
            displayUrl: 'hubspot.com',
            folder: 'Marketing',
            tags: ['crm'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #FF7262, #FFBA00)',
            description: 'Hubspot customer relationship management.'
        },
        {
            id: 'bi1',
            title: 'Pinterest',
            url: 'https://pinterest.com',
            displayUrl: 'pinterest.com',
            folder: 'Inspiration',
            tags: ['moodboard'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #EA4335, #A259FF)',
            description: 'Visual bookmark board.'
        },
        {
            id: 'bi2',
            title: 'Awwwards',
            url: 'https://awwwards.com',
            displayUrl: 'awwwards.com',
            folder: 'Inspiration',
            tags: ['awards'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #EA4335, #A259FF)',
            description: 'Website awards and design showcases.'
        },
        // Default bookmarks under "Other bookmarks"
        {
            id: 1,
            title: 'Designing Focus Into the Modern Web',
            url: 'https://foundation.aero/articles/designing-focus-into-the-modern-web',
            displayUrl: 'foundation.aero/articles/designing-focus-into-the-modern-web',
            folder: 'Other bookmarks',
            tags: ['design'],
            lastEdited: 'May 16, 2024',
            lastEditedTime: 'May 16, 2024, 8:42 AM',
            dateAdded: 'May 10, 2024, 2:11 PM',
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #A259FF, #FF7262)',
            description: 'How intentional design, clarity, and restraint help people stay in flow—online and off.'
        },
        {
            id: 2,
            title: 'The Design of Everyday Things – Don Norman',
            url: 'https://www.jnd.org/dn.mss/design_everyday_things.html',
            displayUrl: 'www.jnd.org/dn.mss/design_everyday_things.html',
            folder: 'Other bookmarks',
            tags: ['design', 'ux'],
            lastEdited: 'May 14, 2024',
            lastEditedTime: 'May 14, 2024, 11:20 AM',
            dateAdded: 'May 5, 2024, 10:15 AM',
            starred: true,
            faviconClass: 'hgi-book-open-01',
            bgGradient: 'linear-gradient(135deg, #2A2C30, #5E6AD2)',
            description: 'A masterpiece on cognitive design principles, mapping conceptual models, affordances, and user errors.'
        },
        {
            id: 3,
            title: 'Interface Design Best Practices',
            url: 'https://www.interaction-design.org/literature/topics/interface-design',
            displayUrl: 'interaction-design.org/literature/topics/interface-design',
            folder: 'Other bookmarks',
            tags: ['ui'],
            lastEdited: 'May 12, 2024',
            lastEditedTime: 'May 12, 2024, 4:10 PM',
            dateAdded: 'May 4, 2024, 9:20 AM',
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #0ACF83, #1ABC9C)',
            description: 'A comprehensive handbook outlining alignment, sizing guidelines, negative space, and visual pacing rules.'
        },
        {
            id: 4,
            title: 'Material Design 3',
            url: 'https://m3.material.io',
            displayUrl: 'm3.material.io',
            folder: 'Other bookmarks',
            tags: ['design', 'system'],
            lastEdited: 'May 10, 2024',
            lastEditedTime: 'May 10, 2024, 3:30 PM',
            dateAdded: 'May 1, 2024, 1:12 PM',
            starred: true,
            faviconClass: 'hgi-grid-view',
            bgGradient: 'linear-gradient(135deg, #FF7262, #FFBA00)',
            description: 'Googles open-source design system guidelines, color matching libraries, accessibility utilities, and component specs.'
        },
        {
            id: 5,
            title: 'Figma – Interface Design Kit',
            url: 'https://figma.com/community/file/1035203961083837482',
            displayUrl: 'figma.com/community/file/1035203961083837482',
            folder: 'Other bookmarks',
            tags: ['figma', 'ui'],
            lastEdited: 'May 9, 2024',
            lastEditedTime: 'May 9, 2024, 11:05 AM',
            dateAdded: 'Apr 28, 2024, 5:40 PM',
            starred: false,
            faviconClass: 'hgi-brush',
            bgGradient: 'linear-gradient(135deg, #A259FF, #0ACF83)',
            description: 'Clean vector components, variant states, auto-layouts, and premium typography grids ready for screen design.'
        },
        {
            id: 6,
            title: 'A Practical Guide to Design Systems',
            url: 'https://designsystems.com/practical-guide',
            displayUrl: 'designsystems.com/practical-guide',
            folder: 'Other bookmarks',
            tags: ['design', 'system'],
            lastEdited: 'May 8, 2024',
            lastEditedTime: 'May 8, 2024, 9:22 AM',
            dateAdded: 'Apr 25, 2024, 10:02 AM',
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #2A2C30, #0ACF83)',
            description: 'In-depth case studies for engineering design systems at scale across React, CSS, and Figma architectures.'
        },
        {
            id: 7,
            title: 'Laws of UX',
            url: 'https://lawsofux.com',
            displayUrl: 'lawsofux.com',
            folder: 'Other bookmarks',
            tags: ['ux'],
            lastEdited: 'May 6, 2024',
            lastEditedTime: 'May 6, 2024, 5:44 PM',
            dateAdded: 'Apr 22, 2024, 2:10 PM',
            starred: true,
            faviconClass: 'hgi-book-open-01',
            bgGradient: 'linear-gradient(135deg, #5E6AD2, #FF7262)',
            description: 'A visual archive detailing key psychological design laws like Fitts Law, Hick Law, and Miller Law.'
        },
        {
            id: 8,
            title: 'The Future of Interface Design',
            url: 'https://youtube.com/watch?v=8QZ7tf1xVqk',
            displayUrl: 'youtube.com/watch?v=8QZ7tf1xVqk',
            folder: 'Other bookmarks',
            tags: ['video'],
            lastEdited: 'May 4, 2024',
            lastEditedTime: 'May 4, 2024, 3:15 PM',
            dateAdded: 'Apr 20, 2024, 11:30 AM',
            starred: false,
            faviconClass: 'hgi-play',
            bgGradient: 'linear-gradient(135deg, #EA4335, #A259FF)',
            description: 'An inspiring keynote explaining spatial interface cards, voice intent routers, and natural gestures.'
        }
    ],
    bookmarksFolders: ['Work', 'Personal', 'Reading List', 'Design', 'Research', 'Archive'],
    
    history: [
        { id: 1, date: 'Today - May 16, 2024', title: 'Designing Focus Into the Modern Web – Foundation', domain: 'foundation.aero', url: 'https://foundation.aero/articles/focus', time: '9:41 AM', faviconClass: 'hgi-global' },
        { id: 2, date: 'Today - May 16, 2024', title: 'Aero Design System – Components', domain: 'design.aero', url: 'https://design.aero/components', time: '9:17 AM', faviconClass: 'hgi-global' },
        { id: 3, date: 'Today - May 16, 2024', title: 'Project Brief – Q2 - Google Docs', domain: 'docs.google.com', url: 'https://docs.google.com/document/d/q2-brief', time: '8:52 AM', faviconClass: 'hgi-note-01' },
        { id: 4, date: 'Today - May 16, 2024', title: 'Inbox (12) – Mail', domain: 'mail.aero', url: 'https://mail.aero/inbox', time: '8:23 AM', faviconClass: 'hgi-sent' },
        { id: 5, date: 'Today - May 16, 2024', title: 'Linear – Team Roadmap', domain: 'linear.app', url: 'https://linear.app/team/roadmap', time: '7:58 AM', faviconClass: 'hgi-global' },
        
        { id: 6, date: 'Yesterday - May 15, 2024', title: 'Notion – Product Wiki', domain: 'notion.so', url: 'https://notion.so/wiki', time: '4:42 PM', faviconClass: 'hgi-note-01' },
        { id: 7, date: 'Yesterday - May 15, 2024', title: 'Figma – Dashboard', domain: 'figma.com', url: 'https://figma.com/files', time: '3:21 PM', faviconClass: 'hgi-brush' },
        { id: 8, date: 'Yesterday - May 15, 2024', title: 'Aero – Product Roadmap', domain: 'aero.com', url: 'https://aero.internal/roadmap', time: '2:15 PM', faviconClass: 'hgi-global' },
        { id: 9, date: 'Yesterday - May 15, 2024', title: 'Marketing Plan – 2024', domain: 'docs.google.com', url: 'https://docs.google.com/document/d/marketing-2024', time: '11:08 AM', faviconClass: 'hgi-note-01' },
        { id: 10, date: 'Yesterday - May 15, 2024', title: 'Dribbble – Discover the World\'s Top Designers', domain: 'dribbble.com', url: 'https://dribbble.com', time: '10:11 AM', faviconClass: 'hgi-brush' },
        
        { id: 11, date: 'Last week', title: 'Aero Blog – Performance in the Browser', domain: 'blog.aero', url: 'https://blog.aero/performance', time: 'May 12, 2024', faviconClass: 'hgi-global' },
        { id: 12, date: 'Last week', title: 'YouTube', domain: 'youtube.com', url: 'https://youtube.com', time: 'May 11, 2024', faviconClass: 'hgi-play' }
    ],
    recentlyClosed: [
        { id: 101, title: 'Pricing – Aero', domain: 'aero.com', time: '9:32 AM', faviconClass: 'hgi-global' },
        { id: 102, title: 'GitHub – aero/browser', domain: 'github.com', time: '8:47 AM', faviconClass: 'hgi-global' },
        { id: 103, title: 'Launch Plan – Slides', domain: 'docs.google.com', time: '8:12 AM', faviconClass: 'hgi-note-01' }
    ],
    
    downloads: [],
    
    readingList: [
        {
            id: 1,
            title: 'The Future of Interface Design',
            url: 'https://uxdesign.cc/the-future-of-interface-design',
            domain: 'uxdesign.cc',
            readTime: '5 min read',
            dateAdded: 'Today, 10:15 AM',
            unread: true,
            starred: false,
            faviconClass: 'hgi-book-open-01',
            bgGradient: 'linear-gradient(135deg, #A259FF, #FF7262)',
            description: 'An in-depth article exploring how spatial interface cards, voice intent routers, and natural gestures will shape our future interactions.',
            summary: 'Summarizes key trends in spatial computing, showing how screen boundaries are dissolving in favor of contextual cards and natural voice shortcuts.'
        },
        {
            id: 2,
            title: 'Building for Focus in a Distracted World',
            url: 'https://blog.linear.app/building-for-focus',
            domain: 'blog.linear.app',
            readTime: '6 min read',
            dateAdded: 'Yesterday, 4:21 PM',
            unread: true,
            starred: true,
            faviconClass: 'hgi-note-01',
            bgGradient: 'linear-gradient(135deg, #2A2C30, #5E6AD2)',
            description: 'How simple tool design, structural pacing, and cognitive limits help product development teams stay inside their creative flow.',
            summary: 'Focuses on building software that reduces friction, protects user context, and avoids heavy notifications to support uninterrupted engineering flow.'
        },
        {
            id: 3,
            title: 'A Practical Guide to Design Systems',
            url: 'https://designsystems.com/practical-guide',
            domain: 'designsystems.com',
            readTime: '8 min read',
            dateAdded: 'May 12, 2024',
            unread: false,
            starred: false,
            faviconClass: 'hgi-global',
            bgGradient: 'linear-gradient(135deg, #0ACF83, #1ABC9C)',
            description: 'A comprehensive handbook outlining alignment, sizing guidelines, negative space, and component tokens for engineers.',
            summary: 'Provides direct blueprints for creating unified UI components across Figma and React, emphasizing scalable CSS custom variables.'
        }
    ],
    readingListCategories: ['Saved Articles', 'Favorites', 'Read Later', 'Archived'],
    
    // State management subscriptions
    listeners: [],
    saveTimer: null,
    searchIndexTimer: null,
    persistedKeys: [
        'tabs', 'activeTabId', 'activeWorkspace', 'workspaces', 'tabLayout', 'theme',
        'bookmarks', 'bookmarksFolders', 'history', 'recentlyClosed', 'downloads',
        'readingList', 'readingListCategories', 'syncBookmarks', 'syncHistory',
        'syncPasswords', 'syncSettings', 'syncDestination', 'startupPage', 'startupUrl',
        'searchEngine', 'showSearchSuggestions', 'showSearchHistory', 'showSearchAutocomplete',
        'downloadPath', 'askBeforeDownload', 'memorySaver', 'energySaver',
        'showBookmarksBar', 'showLeftSidebar', 'aiProvider', 'aiProfile',
        'blockedTrackers', 'blockedTrackerLog', 'sitePermissions', 'aiControlEnabled', 'aiShowLiveCursor',
        'aiHumanTyping', 'aiTypingDelayMs', 'aiActionDelayMs', 'aiRequireConfirmation',
        'aiAllowPageReading', 'aiAllowActionExecution', 'aiActionHistory',
        'lastAiContextDisclosure'
    ],
    recordAiAction(entry) {
        const event = {
            id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toISOString(),
            ...entry
        };
        this.aiActionHistory = [event, ...(this.aiActionHistory || [])].slice(0, 300);
        return event;
    },
    requestAiCancel(reason = 'User stopped the AI task') {
        this.aiCancelRequested = true;
        this.isAiStreaming = false;
        this.activeTaskStep = null;
        this.taskLogs = [
            ...(this.taskLogs || []),
            { text: reason, status: 'warning' }
        ].slice(-20);
        this.recordAiAction({ type: 'cancel', status: 'warning', reason });
        this.persistSoon();
        this.listeners.forEach(cb => cb(this));
    },
    subscribe(callback) {
        this.listeners.push(callback);
        callback(this);
    },
    update(updater) {
        const beforeTabs = new Map(this.tabs.map(tab => [tab.id, { url: tab.url, title: tab.title }]));
        updater(this);
        
        // Track per-tab navigation history
        this.tabs.forEach(tab => {
            const before = beforeTabs.get(tab.id);
            if (before && before.url !== tab.url) {
                if (tab.isGoingBack) {
                    delete tab.isGoingBack;
                    return;
                }
                if (!tab.navigationHistory) {
                    tab.navigationHistory = [];
                }
                if (before.url && (tab.navigationHistory.length === 0 || tab.navigationHistory[tab.navigationHistory.length - 1] !== before.url)) {
                    tab.navigationHistory.push(before.url);
                }
            }
        });

        this.recordNavigationChanges(beforeTabs);
        this.indexSearchSoon();
        this.persistSoon();
        this.listeners.forEach(cb => cb(this));
    },
    restore() {
        try {
            const raw = localStorage.getItem('aero.browser.state.v1');
            if (!raw) return;
            const saved = JSON.parse(raw);
            this.persistedKeys.forEach(key => {
                if (saved[key] !== undefined) {
                    this[key] = saved[key];
                }
            });
            if (!this.tabs?.some(tab => tab.id === this.activeTabId)) {
                this.activeTabId = this.tabs?.[0]?.id || 'tab-new';
            }
        } catch {}
    },
    persistSoon() {
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.persistNow(), 250);
    },
    persistNow() {
        try {
            const payload = {};
            this.persistedKeys.forEach(key => {
                payload[key] = this[key];
            });
            payload.savedAt = new Date().toISOString();
            localStorage.setItem('aero.browser.state.v1', JSON.stringify(payload));
            if (this.backendSnapshotReady) {
                BackendClient.saveStateSnapshot(payload).catch(() => {});
            }
        } catch {}
    },
    indexSearchSoon() {
        clearTimeout(this.searchIndexTimer);
        this.searchIndexTimer = setTimeout(() => this.syncSearchIndex(), 900);
    },
    syncSearchIndex() {
        try {
            if (!this.backendSnapshotReady) return;
            const now = new Date().toISOString();
            const docs = [];
            (this.tabs || []).forEach(tab => {
                if (!this.isHistoryUrl(tab.url) && !String(tab.url || '').startsWith('aero://')) return;
                docs.push({
                    id: `tab:${tab.id}`,
                    kind: 'tab',
                    title: tab.title || tab.url || 'Untitled tab',
                    url: tab.url || null,
                    body: `${tab.title || ''} ${tab.url || ''}`,
                    tags: ['open-tab', tab.workspace || 'Default'],
                    source: 'tabs',
                    updated_at: now
                });
            });
            (this.bookmarks || []).filter(item => item.url).forEach(item => {
                docs.push({
                    id: `bookmark:${item.id}`,
                    kind: 'bookmark',
                    title: item.title || item.url,
                    url: item.url,
                    body: item.description || item.displayUrl || item.url,
                    tags: item.tags || [],
                    source: item.folder || 'bookmarks',
                    updated_at: now
                });
            });
            (this.history || []).filter(item => item.url).slice(0, 400).forEach(item => {
                docs.push({
                    id: `history:${item.id}`,
                    kind: 'history',
                    title: item.title || item.url,
                    url: item.url,
                    body: `${item.domain || ''} ${item.date || ''} ${item.time || ''}`,
                    tags: ['history'],
                    source: item.domain || 'history',
                    updated_at: now
                });
            });
            (this.readingList || []).filter(item => item.url).forEach(item => {
                docs.push({
                    id: `reading:${item.id}`,
                    kind: 'reading_list',
                    title: item.title || item.url,
                    url: item.url,
                    body: item.description || item.summary || item.domain || '',
                    tags: [item.category || 'reading-list'],
                    source: 'reading-list',
                    updated_at: now
                });
            });
            (this.downloads || []).filter(item => item.sourceUrl || item.name).slice(0, 250).forEach(item => {
                docs.push({
                    id: `download:${item.id}`,
                    kind: 'download',
                    title: item.name || item.sourceUrl,
                    url: item.sourceUrl || null,
                    body: `${item.domain || ''} ${item.savePath || ''} ${item.status || ''}`,
                    tags: ['download', item.status || ''],
                    source: 'downloads',
                    updated_at: now
                });
            });
            if (docs.length) BackendClient.indexSearchDocuments(docs).catch(() => {});
        } catch {}
    },
    async restoreFromBackend() {
        try {
            const result = await BackendClient.loadStateSnapshot();
            if (result.snapshot) {
                this.persistedKeys.forEach(key => {
                    if (result.snapshot[key] !== undefined) {
                        this[key] = result.snapshot[key];
                    }
                });
                if (!this.tabs?.some(tab => tab.id === this.activeTabId)) {
                    this.activeTabId = this.tabs?.[0]?.id || 'tab-new';
                }
                this.listeners.forEach(cb => cb(this));
            }
        } catch {}
        this.backendSnapshotReady = true;
        this.indexSearchSoon();
    },
    recordNavigationChanges(beforeTabs) {
        if (!this.syncHistory) return;
        this.tabs.forEach(tab => {
            const before = beforeTabs.get(tab.id);
            if (!before || before.url === tab.url || !this.isHistoryUrl(tab.url)) return;
            const now = new Date();
            let domain = '';
            try {
                domain = new URL(tab.url).hostname.replace('www.', '');
            } catch {
                return;
            }
            const duplicate = this.history?.[0]?.url === tab.url;
            if (duplicate) return;
            this.history = [
                {
                    id: Date.now(),
                    date: `Today - ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
                    title: tab.title || domain,
                    domain,
                    url: tab.url,
                    time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                    faviconClass: 'hgi-global'
                },
                ...(this.history || [])
            ].slice(0, 500);
        });
    },
    isHistoryUrl(url) {
        if (!/^https?:\/\//i.test(url || '')) return false;
        try {
            const host = new URL(url).hostname.toLowerCase();
            return host !== 'newtab.internal' && host !== 'browser.internal' && !host.endsWith('.internal');
        } catch {
            return false;
        }
    }
};

window.AppState.restore();
window.addEventListener('beforeunload', () => window.AppState.persistNow());
window.AppState.restoreFromBackend();

// Dynamic listener for OS theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (window.AppState.theme === 'system') {
        window.AppState.update(() => {});
    }
});

