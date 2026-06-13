// Import Web Components
import { TabStrip } from './components/TabStrip.js';
import { Omnibox } from './components/Omnibox.js';
import { AISidebar } from './components/AISidebar.js';
import { WebViewport } from './components/WebViewport.js';
import { SettingsPanel } from './components/SettingsPanel.js';

// Import System Page Components
import { SettingsPage } from './components/pages/SettingsPage.js';
import { HistoryPage } from './components/pages/HistoryPage.js';
import { DownloadsPage } from './components/pages/DownloadsPage.js';
import { BookmarksPage } from './components/pages/BookmarksPage.js';
import { ReadingListPage } from './components/pages/ReadingListPage.js';
import { SearchPage } from './components/pages/SearchPage.js';
import { WorkspacesPage } from './components/pages/WorkspacesPage.js';
import { PasswordsPage } from './components/pages/PasswordsPage.js';
import { PaymentsPage } from './components/pages/PaymentsPage.js';
import { AddressesPage } from './components/pages/AddressesPage.js';
import { ToolsPage } from './components/pages/ToolsPage.js';
import { AISetupPage } from './components/pages/AISetupPage.js';

// Custom Aero System Dialogs Engine
function createAeroDialog({ type, message, defaultValue = '', onClose }) {
    // Create overlay backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'aero-dialog-backdrop';
    Object.assign(backdrop.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(5px)',
        webkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '99999',
        animation: 'fadeIn 0.15s ease-out'
    });

    // Create dialog container
    const dialog = document.createElement('div');
    dialog.className = 'aero-dialog-container';
    
    // Check dark mode
    const isDark = document.documentElement.classList.contains('dark-theme');
    const bg = isDark ? '#282A2D' : '#FFFFFF';
    const textColor = isDark ? '#F1F3F4' : '#1F2937';
    const border = isDark ? '1px solid #333639' : '1px solid #E5E7EB';
    const inputBg = isDark ? '#1E2022' : '#F1F3F4';
    const inputColor = isDark ? '#F1F3F4' : '#1F2937';

    Object.assign(dialog.style, {
        background: bg,
        border: border,
        borderRadius: '12px',
        width: '420px',
        maxWidth: '90%',
        padding: '20px var(--spacing-lg)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
        animation: 'scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'center',
        fontFamily: 'var(--font-ui)',
        color: textColor
    });

    // Header (Context says)
    const header = document.createElement('div');
    header.style.fontWeight = 'var(--font-weight-semibold)';
    header.style.fontSize = 'var(--font-size-md)';
    header.style.color = isDark ? '#9AA0A6' : '#5F6368';
    
    let domain = 'Aero Browser';
    try {
        const activeTab = window.AppState.tabs.find(t => t.id === window.AppState.activeTabId);
        if (activeTab && activeTab.url) {
            if (activeTab.url.startsWith('aero://') || activeTab.url.startsWith('browser://')) {
                domain = activeTab.url.split('/')[0];
            } else {
                domain = new URL(activeTab.url).host;
            }
        }
    } catch {}
    header.innerText = `${domain} says`;

    // Message body (Supports text wrapping)
    const body = document.createElement('div');
    body.style.fontSize = 'var(--font-size-sm)';
    body.style.lineHeight = '1.5';
    body.style.whiteSpace = 'pre-wrap';
    body.style.wordBreak = 'break-word';
    body.style.color = textColor;
    body.innerText = message;

    // Input box (Only for prompt)
    let promptInput = null;
    if (type === 'prompt') {
        promptInput = document.createElement('input');
        promptInput.type = 'text';
        promptInput.value = defaultValue;
        Object.assign(promptInput.style, {
            width: '100%',
            background: inputBg,
            border: border,
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: 'var(--font-size-sm)',
            color: inputColor,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
        });
        promptInput.addEventListener('focus', () => {
            promptInput.style.borderColor = 'var(--color-input-focus-border)';
            promptInput.style.boxShadow = '0 0 0 3px rgba(77, 144, 254, 0.25)';
        });
        promptInput.addEventListener('blur', () => {
            promptInput.style.borderColor = isDark ? '#333639' : '#E5E7EB';
            promptInput.style.boxShadow = 'none';
        });
    }

    // Button Row
    const buttonRow = document.createElement('div');
    Object.assign(buttonRow.style, {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--spacing-md)',
        marginTop: '8px'
    });

    const createButton = (text, isPrimary) => {
        const btn = document.createElement('button');
        btn.innerText = text;
        Object.assign(btn.style, {
            border: isPrimary ? 'none' : border,
            background: isPrimary ? 'var(--color-input-focus-border)' : 'transparent',
            color: isPrimary ? '#FFFFFF' : textColor,
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer',
            minWidth: '72px',
            outline: 'none',
            transition: 'background 0.15s ease, opacity 0.1s ease, box-shadow 0.15s ease'
        });
        btn.addEventListener('mouseenter', () => {
            btn.style.opacity = '0.9';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.opacity = '1';
        });
        btn.addEventListener('focus', () => {
            btn.style.boxShadow = isPrimary 
                ? `0 0 0 2px ${bg}, 0 0 0 4px var(--color-input-focus-border)` 
                : `0 0 0 2px ${bg}, 0 0 0 4px ${isDark ? '#9AA0A6' : '#5F6368'}`;
        });
        btn.addEventListener('blur', () => {
            btn.style.boxShadow = 'none';
        });
        return btn;
    };

    const okBtn = createButton('OK', true);
    let keyHandler = null;
    
    // Close / Clean up logic
    const closeDialog = (val) => {
        if (keyHandler) {
            window.removeEventListener('keydown', keyHandler);
        }
        backdrop.style.animation = 'fadeOut 0.15s ease-out';
        dialog.style.animation = 'scaleDown 0.15s ease-in';
        setTimeout(() => {
            if (document.body.contains(backdrop)) {
                document.body.removeChild(backdrop);
            }
            onClose(val);
        }, 120);
    };

    okBtn.addEventListener('click', () => {
        if (type === 'prompt') {
            closeDialog(promptInput.value);
        } else if (type === 'confirm') {
            closeDialog(true);
        } else {
            closeDialog(undefined);
        }
    });

    if (type === 'confirm' || type === 'prompt') {
        const cancelBtn = createButton('Cancel', false);
        cancelBtn.addEventListener('click', () => {
            closeDialog(type === 'confirm' ? false : null);
        });
        buttonRow.appendChild(cancelBtn);
    }
    
    buttonRow.appendChild(okBtn);

    // Assembly
    dialog.appendChild(header);
    dialog.appendChild(body);
    if (promptInput) {
        dialog.appendChild(promptInput);
    }
    dialog.appendChild(buttonRow);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    // Focus / Key bindings
    if (promptInput) {
        promptInput.focus();
        promptInput.select();
        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                closeDialog(promptInput.value);
            } else if (e.key === 'Escape') {
                closeDialog(null);
            }
        });
    } else {
        okBtn.focus();
        keyHandler = (e) => {
            if (e.key === 'Escape') {
                closeDialog(type === 'confirm' ? false : undefined);
            } else if (e.key === 'Enter') {
                closeDialog(type === 'confirm' ? true : undefined);
            }
        };
        window.addEventListener('keydown', keyHandler);
    }
}

// Override Native Global Dialogs
window.alert = function(message) {
    createAeroDialog({
        type: 'alert',
        message,
        onClose: () => {}
    });
};

window.aeroConfirm = function(message) {
    return new Promise(resolve => {
        createAeroDialog({
            type: 'confirm',
            message,
            onClose: (res) => resolve(res)
        });
    });
};

window.aeroPrompt = function(message, defaultValue = '') {
    return new Promise(resolve => {
        createAeroDialog({
            type: 'prompt',
            message,
            defaultValue,
            onClose: (res) => resolve(res)
        });
    });
};

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
    runtimeEngine: 'web',
    theme: 'light', // 'light' (default) | 'dark'
    isAiStreaming: false,
    chatHistory: [
        { sender: 'ai', text: 'Hello! I am your native Browser Assistant. I can see whatever you browse, help you research across tabs, or automate web actions safely. How can I help you today?' }
    ],
    taskLogs: [], // Step-by-step task logs for visual tracing
    activeTaskStep: null,
    
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
    
    downloads: [
        { id: 201, name: 'Aero_Design_System.fig', domain: 'figma.com', totalBytes: 1.2 * 1024 * 1024 * 1024, downloadedBytes: 728 * 1024 * 1024, speed: 28.4 * 1024 * 1024, status: 'downloading', fileIconClass: 'hgi-brush', color: '#F24E1E' },
        { id: 202, name: 'Project_Assets_Q2.zip', domain: 'drive.google.com', totalBytes: 3.4 * 1024 * 1024 * 1024, downloadedBytes: 1.6 * 1024 * 1024 * 1024, speed: 19.2 * 1024 * 1024, status: 'downloading', fileIconClass: 'hgi-folder', color: '#FFBA00' },
        { id: 301, name: 'Q2_Research_Report.pdf', domain: 'docs.google.com', size: '24.1 MB', sizeVal: 24.1 * 1024 * 1024, totalBytes: 24.1 * 1024 * 1024, downloadedBytes: 24.1 * 1024 * 1024, speed: 0, status: 'completed', dateStr: 'Today, 8:47 AM', fileIconClass: 'hgi-note-01', color: '#EA4335' },
        { id: 302, name: 'Design_System_Assets.zip', domain: 'drive.google.com', size: '1.2 GB', sizeVal: 1.2 * 1024 * 1024 * 1024, totalBytes: 1.2 * 1024 * 1024 * 1024, downloadedBytes: 1.2 * 1024 * 1024 * 1024, speed: 0, status: 'completed', dateStr: 'Yesterday, 4:21 PM', fileIconClass: 'hgi-folder', color: '#FFBA00' },
        { id: 303, name: 'Aero_Product_Roadmap.pptx', domain: 'aero.com', size: '18.7 MB', sizeVal: 18.7 * 1024 * 1024, totalBytes: 18.7 * 1024 * 1024, downloadedBytes: 18.7 * 1024 * 1024, speed: 0, status: 'completed', dateStr: 'Yesterday, 11:02 AM', fileIconClass: 'hgi-note-01', color: '#1A73E8' },
        { id: 304, name: 'Aero_Setup_1.4.2.dmg', domain: 'aero.com', size: '128 MB', sizeVal: 128 * 1024 * 1024, totalBytes: 128 * 1024 * 1024, downloadedBytes: 128 * 1024 * 1024, speed: 0, status: 'completed', dateStr: 'May 14, 2024', fileIconClass: 'hgi-settings-01', color: '#2A2C30' }
    ],
    
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
    persistedKeys: [
        'tabs', 'activeTabId', 'activeWorkspace', 'workspaces', 'tabLayout', 'theme',
        'bookmarks', 'bookmarksFolders', 'history', 'recentlyClosed', 'downloads',
        'readingList', 'readingListCategories', 'syncBookmarks', 'syncHistory',
        'syncPasswords', 'syncSettings', 'syncDestination', 'startupPage', 'startupUrl',
        'searchEngine', 'showSearchSuggestions', 'showSearchHistory', 'showSearchAutocomplete',
        'downloadPath', 'askBeforeDownload', 'memorySaver', 'energySaver',
        'showBookmarksBar', 'showLeftSidebar', 'aiProvider', 'aiProfile',
        'blockedTrackers', 'blockedTrackerLog'
    ],
    subscribe(callback) {
        this.listeners.push(callback);
        callback(this);
    },
    update(updater) {
        const beforeTabs = new Map(this.tabs.map(tab => [tab.id, { url: tab.url, title: tab.title }]));
        updater(this);
        this.recordNavigationChanges(beforeTabs);
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
        } catch {}
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

// Dynamic listener for OS theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (window.AppState.theme === 'system') {
        window.AppState.update(() => {});
    }
});

// Bookmark folder dropdown helper function
function showBookmarkFolderDropdown(anchorEl, folderTitle, bookmarks) {
    // Remove any existing dropdowns first
    document.querySelectorAll('.bookmark-folder-dropdown').forEach(el => el.remove());

    const folderItems = bookmarks.filter(b => b.folder === folderTitle);
    const dropdown = document.createElement('div');
    dropdown.className = 'bookmark-folder-dropdown';
    
    const isDark = document.documentElement.classList.contains('dark-theme');
    
    // Position the dropdown absolutely relative to the viewport/body
    const rect = anchorEl.getBoundingClientRect();
    Object.assign(dropdown.style, {
        position: 'fixed',
        top: `${rect.bottom + window.scrollY + 4}px`,
        left: `${rect.left + window.scrollX}px`,
        background: isDark ? '#282A2D' : '#FFFFFF',
        border: isDark ? '1px solid #333639' : '1px solid #E5E7EB',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '4px 0',
        zIndex: '99999',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '160px',
        animation: 'fadeIn 0.1s ease-out'
    });

    if (folderItems.length === 0) {
        dropdown.innerHTML = `
            <div style="padding: 6px 12px; font-size: var(--font-size-xs); font-family: var(--font-ui); color: var(--color-text-inactive); font-style: italic;">
                (Empty)
            </div>
        `;
    } else {
        dropdown.innerHTML = folderItems.map(b => {
            const faviconUrl = b.favicon || `https://www.google.com/s2/favicons?sz=32&domain=${new URL(b.url).hostname}`;
            return `
                <div class="folder-dropdown-item" data-url="${b.url}" style="padding: 6px 12px; font-size: var(--font-size-xs); font-family: var(--font-ui); display: flex; align-items: center; gap: 8px; cursor: pointer; color: ${isDark ? '#F1F3F4' : '#1F2937'}; transition: background 0.1s; border-radius: 4px; margin: 0 4px;">
                    <img src="${faviconUrl}" alt="" style="width: 14px; height: 14px; border-radius: 2px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" /><i class="hgi-stroke hgi-globe" style="font-size: 13px; display: none;"></i>
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${b.title}</span>
                </div>
            `;
        }).join('');
    }

    // Attach click events to navigate
    dropdown.querySelectorAll('.folder-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.getAttribute('data-url');
            window.AppState.update(s => {
                const activeTab = s.tabs.find(t => t.id === s.activeTabId);
                if (activeTab) {
                    activeTab.url = url;
                    try {
                        activeTab.title = new URL(url).hostname.replace('www.', '');
                    } catch {
                        activeTab.title = url;
                    }
                }
            });
            dropdown.remove();
        });
        
        item.addEventListener('mouseenter', () => {
            item.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
            item.style.color = isDark ? '#FFFFFF' : '#000000';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
            item.style.color = isDark ? '#F1F3F4' : '#1F2937';
        });
    });

    document.body.appendChild(dropdown);

    // Close when click outside
    const closeOnOutside = (e) => {
        if (!dropdown.contains(e.target) && !anchorEl.contains(e.target)) {
            dropdown.remove();
            document.removeEventListener('click', closeOnOutside);
        }
    };
    setTimeout(() => {
        document.addEventListener('click', closeOnOutside);
    }, 0);
}

// Global subscription for theme, custom accent colors, and dynamic workspaces list
window.AppState.subscribe(state => {
    const isDark = state.theme === 'dark' || (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark-theme', isDark);
    
    if (state.accentColor) {
        document.documentElement.style.setProperty('--color-input-focus-border', state.accentColor);
    }

    // Toggle brand title in titlebar when in vertical tab layout
    const verticalBrandTitle = document.getElementById('vertical-brand-title');
    if (verticalBrandTitle) {
        verticalBrandTitle.style.display = state.tabLayout === 'vertical' ? 'flex' : 'none';
    }

    // Toggle left sidebar display based on user visibility preference (keep accessible in vertical layout)
    const sidebarLeft = document.getElementById('aero-left-sidebar');
    const hoverZone = document.getElementById('aero-sidebar-hover-zone');
    if (sidebarLeft) {
        if (state.showLeftSidebar === false) {
            sidebarLeft.style.display = 'none';
            if (hoverZone) hoverZone.style.display = 'none';
        } else {
            sidebarLeft.style.display = 'flex';
            if (hoverZone) hoverZone.style.display = 'block';
        }
    }

    // Toggle bookmarks shelf visibility and handle navigation bar border-radius
    const bookmarksShelf = document.getElementById('bookmarks-shelf');
    const topNav = document.getElementById('browser-nav');
    if (bookmarksShelf) {
        if (state.showBookmarksBar === false) {
            bookmarksShelf.style.display = 'none';
            if (topNav) {
                // Fully rounded pill when no bookmarks bar below
                topNav.style.borderRadius = '12px';
                topNav.style.marginBottom = '0';
                topNav.style.boxShadow = 'none';
            }
        } else {
            bookmarksShelf.style.display = 'flex';
            if (topNav) {
                // Flat bottom — bookmarks bar attaches below
                topNav.style.borderRadius = '12px 12px 0 0';
                topNav.style.marginBottom = '';
                topNav.style.boxShadow = '';
            }
            
            // Dynamic Bookmarks shelf items rendering
            const bookmarksLeft = bookmarksShelf.querySelector('.bookmarks-left');
            if (bookmarksLeft) {
                const barBookmarks = state.bookmarks.filter(b => b.folder === 'Bookmarks bar');
                bookmarksLeft.innerHTML = barBookmarks.map(b => {
                    if (b.isFolder) {
                        return `
                            <div class="bookmark-item bookmark-folder-trigger" data-folder-title="${b.title}" style="cursor: pointer;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${b.color || '#4285F4'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.95;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                ${b.title}
                            </div>
                        `;
                    } else {
                        const faviconUrl = b.favicon || `https://www.google.com/s2/favicons?sz=32&domain=${new URL(b.url).hostname}`;
                        return `
                            <div class="bookmark-item bookmark-link-trigger" data-url="${b.url}" style="cursor: pointer;">
                                <img src="${faviconUrl}" alt="" style="width: 14px; height: 14px; border-radius: 2px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" /><i class="hgi-stroke hgi-globe" style="font-size: 13px; display: none;"></i>
                                ${b.title}
                            </div>
                        `;
                    }
                }).join('');

                // Re-bind click event handlers for link bookmarks
                bookmarksLeft.querySelectorAll('.bookmark-link-trigger').forEach(el => {
                    el.addEventListener('click', () => {
                        const url = el.getAttribute('data-url');
                        window.AppState.update(s => {
                            const activeTab = s.tabs.find(t => t.id === s.activeTabId);
                            if (activeTab) {
                                activeTab.url = url;
                                try {
                                    activeTab.title = new URL(url).hostname.replace('www.', '');
                                } catch {
                                    activeTab.title = url;
                                }
                            }
                        });
                    });
                });

                // Re-bind click event handlers for folder bookmarks
                bookmarksLeft.querySelectorAll('.bookmark-folder-trigger').forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const folderTitle = el.getAttribute('data-folder-title');
                        showBookmarkFolderDropdown(el, folderTitle, state.bookmarks);
                    });
                });
            }
        }
    }

    // Dynamically render sidebar workspaces list
    const workspacesContainer = document.getElementById('sidebar-workspaces-list');
    if (workspacesContainer) {
        const customWorkspaces = state.workspaces.filter(w => w.id !== 'Default');
        const activeWorkspace = state.activeWorkspace;

        workspacesContainer.innerHTML = customWorkspaces.map(w => {
            const isActive = activeWorkspace === w.id;
            return `
                <div class="sidebar-item ${isActive ? 'active' : ''}" data-workspace="${w.id}" style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                        <i class="hgi-stroke ${w.icon || 'hgi-briefcase-01'}" style="color: ${w.color || 'currentColor'};"></i>
                        ${w.name}
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 10px; color: var(--color-text-inactive);"></i>
                </div>
            `;
        }).join('');

        // Bind click events on these newly rendered items
        workspacesContainer.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const workspace = item.getAttribute('data-workspace');
                
                // Clear active class from all other sidebar items
                document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                
                window.AppState.update(state => {
                    state.activeWorkspace = workspace;
                    
                    // Find or create tabs for this workspace
                    const workspaceTabs = state.tabs.filter(t => (t.workspace || 'Default') === workspace);
                    if (workspaceTabs.length === 0) {
                        const newId = `tab-${Date.now()}`;
                        state.tabs.push({
                            id: newId,
                            title: 'New Tab',
                            url: 'https://newtab.internal',
                            hibernated: false,
                            active: true,
                            workspace: workspace
                        });
                        state.activeTabId = newId;
                    } else {
                        const lastActive = workspaceTabs.find(t => t.active) || workspaceTabs[0];
                        state.activeTabId = lastActive.id;
                    }
                });
            });
        });
    }

    // Also update highlight for active default items (Home/New Tab, etc. when activeWorkspace is Default or empty)
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    let activePage = '';
    if (activeTab) {
        const url = activeTab.url;
        if (url.includes('newtab.internal')) activePage = 'newtab';
        else if (url.startsWith('aero://history')) activePage = 'history';
        else if (url.startsWith('aero://bookmarks')) activePage = 'bookmarks';
        else if (url.startsWith('aero://downloads')) activePage = 'downloads';
        else if (url.startsWith('aero://settings')) activePage = 'settings';
        else if (url.startsWith('aero://reading-list')) activePage = 'readinglist';
        else if (url.startsWith('aero://search')) activePage = 'search';
        else if (url.startsWith('aero://workspaces')) activePage = 'workspaces';
        else if (url.startsWith('aero://ai-setup')) activePage = 'aisetup';
    }

    document.querySelectorAll('.sidebar-item[data-page]').forEach(el => {
        const page = el.getAttribute('data-page');
        const isSettings = el.classList.contains('settings-trigger');
        const matchPage = isSettings ? 'settings' : page;
        
        if (matchPage === activePage && (!state.activeWorkspace || state.activeWorkspace === 'Default')) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
});

if (window.aeroNative) {
    document.documentElement.classList.add('electron-runtime');
    window.aeroNative.runtime().then(runtime => {
        window.AppState.update(state => {
            state.runtimeEngine = runtime.engine;
            state.nativeShell = runtime.shell;
            state.backendUrl = runtime.backendUrl;
        });
    }).catch(() => {});

    if (window.aeroNative.onDownload) {
        window.aeroNative.onDownload(payload => {
            window.AppState.update(state => {
                const existing = state.downloads.find(download => download.id === payload.id);
                let domain = 'download';
                try {
                    domain = new URL(payload.url).hostname.replace('www.', '');
                } catch {}
                const status = payload.type === 'done'
                    ? (payload.state === 'completed' ? 'completed' : 'failed')
                    : 'downloading';
                const next = {
                    id: payload.id,
                    name: payload.name || 'Download',
                    domain,
                    totalBytes: payload.totalBytes || 0,
                    downloadedBytes: payload.downloadedBytes || 0,
                    speed: payload.speed || 0,
                    status,
                    savePath: payload.savePath,
                    sourceUrl: payload.url,
                    dateStr: 'Just now',
                    fileIconClass: 'hgi-download-01',
                    color: '#1A73E8'
                };
                if (existing) {
                    Object.assign(existing, next);
                } else {
                    state.downloads.unshift(next);
                }
            });
        });
    }

    if (window.aeroNative.onPermission) {
        window.aeroNative.onPermission(payload => {
            if (payload.allowed) return;
            window.AppState.update(state => {
                state.taskLogs.push({
                    text: `Blocked ${payload.permission} permission from ${payload.requestingUrl || 'active page'}`,
                    status: 'warning'
                });
            });
        });
    }

    if (window.aeroNative.onTrackerBlocked) {
        window.aeroNative.onTrackerBlocked(payload => {
            window.AppState.update(state => {
                state.blockedTrackers = (state.blockedTrackers || 0) + 1;
                state.blockedTrackerLog = [
                    payload,
                    ...(state.blockedTrackerLog || [])
                ].slice(0, 250);
            });
        });
    }
}

// Register Custom Web Elements
customElements.define('browser-tabstrip', TabStrip);
customElements.define('browser-omnibox', Omnibox);
customElements.define('browser-sidebar', AISidebar);
customElements.define('browser-viewport', WebViewport);
customElements.define('browser-settings', SettingsPanel);

// Register System Page Elements
customElements.define('browser-settings-page', SettingsPage);
customElements.define('browser-history-page', HistoryPage);
customElements.define('browser-downloads-page', DownloadsPage);
customElements.define('browser-bookmarks-page', BookmarksPage);
customElements.define('browser-reading-list-page', ReadingListPage);
customElements.define('browser-search-page', SearchPage);
customElements.define('browser-workspaces-page', WorkspacesPage);
customElements.define('browser-passwords-page', PasswordsPage);
customElements.define('browser-payments-page', PaymentsPage);
customElements.define('browser-addresses-page', AddressesPage);
customElements.define('browser-tools-page', ToolsPage);
customElements.define('browser-ai-setup-page', AISetupPage);

// Global Window Actions (Minimize, Maximize, Close mocks)
document.querySelectorAll('.caption-btn, .win-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
        if (!window.aeroNative) return;
        event.preventDefault();
        event.stopPropagation();
        if (btn.classList.contains('btn-minimize') || btn.classList.contains('win-min')) {
            window.aeroNative.minimize();
        } else if (btn.classList.contains('btn-maximize') || btn.classList.contains('win-max')) {
            window.aeroNative.toggleMaximize();
        } else if (btn.classList.contains('btn-close') || btn.classList.contains('win-close')) {
            window.aeroNative.close();
        }
    });
});

// Bind Left Sidebar click listeners for static page navigation items
document.querySelectorAll('.sidebar-item[data-page], .sidebar-item.settings-trigger').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page') || (item.classList.contains('settings-trigger') ? 'settings' : null);
        if (!page) return;

        // Update active highlight
        document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        window.AppState.update(state => {
            // Clicking static items resets custom workspace filter so user sees global settings/pages
            state.activeWorkspace = 'Default';

            let url = '';
            let title = '';

            if (page === 'newtab') {
                url = 'https://newtab.internal';
                title = 'New Tab';
            } else if (page === 'history') {
                url = 'aero://history';
                title = 'History';
            } else if (page === 'bookmarks') {
                url = 'aero://bookmarks';
                title = 'Bookmarks';
            } else if (page === 'downloads') {
                url = 'aero://downloads';
                title = 'Downloads';
            } else if (page === 'settings') {
                url = 'aero://settings';
                title = 'Settings';
            } else if (page === 'readinglist') {
                url = 'aero://reading-list';
                title = 'Reading List';
            } else if (page === 'search') {
                url = 'aero://search';
                title = 'Search';
            } else if (page === 'workspaces') {
                url = 'aero://workspaces';
                title = 'Workspaces';
            } else if (page === 'aisetup') {
                url = 'aero://ai-setup';
                title = 'AI Setup';
            }

            if (url) {
                const activeTab = state.tabs.find(t => t.id === state.activeTabId);
                const isSafeToOverride = !activeTab || 
                                         activeTab.url.includes('newtab.internal') || 
                                         activeTab.url === '';
                
                if (isSafeToOverride && activeTab) {
                    activeTab.url = url;
                    activeTab.title = title;
                } else {
                    const newId = `tab-${Date.now()}`;
                    state.tabs.push({
                        id: newId,
                        title: title,
                        url: url,
                        hibernated: false,
                        active: true,
                        workspace: 'Default'
                    });
                    state.activeTabId = newId;
                }
            }
        });
    });
});

// Global hashchange event listener to intercept internal page navigation links
window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
        const url = decodeURIComponent(hash.slice(1));
        // Clear the hash without triggering hashchange again
        history.replaceState(null, null, ' ');
        
        if (url) {
            window.AppState.update(state => {
                const activeTab = state.tabs.find(t => t.id === state.activeTabId);
                const isSafeToOverride = !activeTab || 
                                         activeTab.url.includes('newtab.internal') || 
                                         activeTab.url === '';
                
                let title = '';
                if (url.startsWith('aero://') || url.startsWith('browser://')) {
                    const pageName = url.replace('aero://', '').replace('browser://', '').split('/')[0];
                    title = pageName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                } else {
                    try {
                        title = new URL(url).hostname.replace('www.', '');
                    } catch {
                        title = url;
                    }
                }

                if (isSafeToOverride && activeTab) {
                    activeTab.url = url;
                    activeTab.title = title;
                } else {
                    const newId = `tab-${Date.now()}`;
                    state.tabs.push({
                        id: newId,
                        title: title,
                        url: url,
                        hibernated: false,
                        active: true,
                        workspace: 'Default'
                    });
                    state.activeTabId = newId;
                }
            });
        }
    }
});

console.log('Aero Browser Shell Initialized.');

// Global context menu engine for Bookmarks
window.addEventListener('contextmenu', (e) => {
    const bookmarksShelf = document.getElementById('bookmarks-shelf');
    if (bookmarksShelf && bookmarksShelf.contains(e.target)) {
        e.preventDefault();
        
        // Find if a bookmark item was clicked
        const itemEl = e.target.closest('.bookmark-item, .bookmark-link-trigger, .bookmark-folder-trigger');
        let bookmarkData = null;
        if (itemEl) {
            const url = itemEl.getAttribute('data-url');
            const folderTitle = itemEl.getAttribute('data-folder-title');
            
            if (url) {
                bookmarkData = window.AppState.bookmarks.find(b => b.url === url);
            } else if (folderTitle) {
                bookmarkData = window.AppState.bookmarks.find(b => b.title === folderTitle && b.isFolder);
            }
        }
        
        showBookmarksContextMenu(e.clientX, e.clientY, bookmarkData);
    }
});

function showBookmarksContextMenu(x, y, bookmark) {
    // Dismiss any existing context menus
    document.querySelectorAll('.aero-context-menu').forEach(el => el.remove());

    const menu = document.createElement('div');
    menu.className = 'aero-context-menu animate-fade-in';
    
    const isDark = document.documentElement.classList.contains('dark-theme');
    const hasBookmark = !!bookmark;
    const isFolder = bookmark && bookmark.isFolder;

    // Build items HTML
    menu.innerHTML = `
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-open-tab">
            <i class="hgi-stroke hgi-plus-sign acm-icon-left"></i>
            Open in new tab
        </div>
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-open-window">
            <i class="hgi-stroke hgi-browser-video acm-icon-left"></i>
            Open in new window
        </div>
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-open-split">
            <i class="hgi-stroke hgi-grid-view acm-icon-left"></i>
            Open in split view
        </div>
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-open-incognito">
            <i class="hgi-stroke hgi-incognito acm-icon-left"></i>
            Open in Incognito window
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item ${!hasBookmark ? 'disabled' : ''}" id="acm-edit">
            <i class="hgi-stroke hgi-edit-02 acm-icon-left"></i>
            Edit...
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-cut">
            <i class="hgi-stroke hgi-scissors acm-icon-left"></i>
            Cut
        </div>
        <div class="acm-item ${(!hasBookmark || isFolder) ? 'disabled' : ''}" id="acm-copy">
            <i class="hgi-stroke hgi-copy-link acm-icon-left"></i>
            Copy
        </div>
        <div class="acm-item disabled" id="acm-paste">
            <i class="hgi-stroke hgi-clipboard acm-icon-left"></i>
            Paste
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item ${!hasBookmark ? 'disabled' : ''}" id="acm-delete">
            <i class="hgi-stroke hgi-delete-02 acm-icon-left"></i>
            Delete
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item" id="acm-add-page">
            <i class="hgi-stroke hgi-star-add acm-icon-left"></i>
            Add page...
        </div>
        <div class="acm-item" id="acm-add-folder">
            <i class="hgi-stroke hgi-folder-add acm-icon-left"></i>
            Add folder...
        </div>
        
        <div class="acm-divider"></div>
        
        <div class="acm-item" id="acm-manager">
            <i class="hgi-stroke hgi-settings-01 acm-icon-left"></i>
            Open Bookmarks Manager
        </div>
        <div class="acm-item" id="acm-toggle-bar">
            <i class="hgi-stroke hgi-tick-01 acm-icon-left" style="visibility: ${window.AppState.showBookmarksBar ? 'visible' : 'hidden'}; color: #1b828f;"></i>
            Show bookmarks bar
        </div>
        <div class="acm-item" id="acm-toggle-newtab-bar">
            <i class="hgi-stroke hgi-tick-01 acm-icon-left" style="visibility: visible; color: #1b828f;"></i>
            Show bookmarks bar on new tab page
        </div>
    `;

    // Position context menu
    Object.assign(menu.style, {
        top: `${y}px`,
        left: `${x}px`,
        position: 'fixed'
    });
    document.body.appendChild(menu);

    // Clamp coordinates if overflow
    const rect = menu.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
        menu.style.left = `${window.innerWidth - rect.width - 8}px`;
    }
    if (y + rect.height > window.innerHeight) {
        menu.style.top = `${window.innerHeight - rect.height - 8}px`;
    }

    // Attach Action Handlers
    const closeMenu = () => {
        menu.remove();
        document.removeEventListener('click', closeMenuHandler);
    };

    const navigateTab = (url) => {
        window.AppState.update(s => {
            const activeTab = s.tabs.find(t => t.id === s.activeTabId);
            if (activeTab) {
                activeTab.url = url;
                try {
                    activeTab.title = new URL(url).hostname.replace('www.', '');
                } catch {
                    activeTab.title = url;
                }
            }
        });
    };

    const navigateNewTab = (url, title) => {
        window.AppState.update(s => {
            const newId = `tab-${Date.now()}`;
            s.tabs.push({
                id: newId,
                title: title || 'New Tab',
                url: url,
                active: true,
                hibernated: false,
                workspace: 'Default'
            });
            s.activeTabId = newId;
        });
    };

    // Open in new tab
    menu.querySelector('#acm-open-tab')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) navigateNewTab(bookmark.url, bookmark.title);
        closeMenu();
    });

    // Open in new window
    menu.querySelector('#acm-open-window')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            alert(`Opening in new window: ${bookmark.url}`);
        }
        closeMenu();
    });

    // Open in split view
    menu.querySelector('#acm-open-split')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            alert(`Opening in split view: ${bookmark.url}`);
        }
        closeMenu();
    });

    // Open in Incognito window
    menu.querySelector('#acm-open-incognito')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            alert(`Opening in Incognito window: ${bookmark.url}`);
        }
        closeMenu();
    });

    // Edit...
    menu.querySelector('#acm-edit')?.addEventListener('click', () => {
        if (bookmark) {
            const starBtn = document.querySelector('.url-bookmark-btn');
            if (starBtn) {
                const omniboxEl = document.querySelector('browser-omnibox');
                if (omniboxEl && typeof omniboxEl.showEditBookmarkPopup === 'function') {
                    omniboxEl.showEditBookmarkPopup(starBtn, bookmark);
                }
            }
        }
        closeMenu();
    });

    // Cut / Copy
    menu.querySelector('#acm-cut')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            navigator.clipboard.writeText(bookmark.url);
            window.AppState.update(s => {
                s.bookmarks = s.bookmarks.filter(b => b.id !== bookmark.id);
            });
        }
        closeMenu();
    });

    menu.querySelector('#acm-copy')?.addEventListener('click', () => {
        if (bookmark && bookmark.url) {
            navigator.clipboard.writeText(bookmark.url);
        }
        closeMenu();
    });

    // Delete
    menu.querySelector('#acm-delete')?.addEventListener('click', () => {
        if (bookmark) {
            window.AppState.update(s => {
                s.bookmarks = s.bookmarks.filter(b => b.id !== bookmark.id);
            });
        }
        closeMenu();
    });

    // Add page...
    menu.querySelector('#acm-add-page')?.addEventListener('click', () => {
        const title = prompt("Enter bookmark name:");
        if (title) {
            const url = prompt("Enter bookmark URL:", "https://");
            if (url) {
                window.AppState.update(s => {
                    s.bookmarks.push({
                        id: Date.now(),
                        title: title,
                        url: url,
                        displayUrl: url.replace('https://', '').replace('http://', ''),
                        folder: 'Bookmarks bar',
                        starred: true,
                        tags: ['quick'],
                        dateAdded: new Date().toLocaleDateString(),
                        faviconClass: 'hgi-global'
                    });
                });
            }
        }
        closeMenu();
    });

    // Add folder...
    menu.querySelector('#acm-add-folder')?.addEventListener('click', () => {
        const title = prompt("Enter folder name:");
        if (title) {
            window.AppState.update(s => {
                s.bookmarks.push({
                    id: 'b-' + Date.now(),
                    title: title,
                    isFolder: true,
                    folder: 'Bookmarks bar',
                    color: '#4285F4',
                    starred: false,
                    tags: [],
                    dateAdded: new Date().toLocaleDateString(),
                    faviconClass: 'hgi-folder'
                });
            });
        }
        closeMenu();
    });

    // Open Bookmarks Manager
    menu.querySelector('#acm-manager')?.addEventListener('click', () => {
        navigateTab('aero://bookmarks');
        closeMenu();
    });

    // Toggle Bookmarks Bar
    menu.querySelector('#acm-toggle-bar')?.addEventListener('click', () => {
        window.AppState.update(s => {
            s.showBookmarksBar = !s.showBookmarksBar;
        });
        closeMenu();
    });

    // Toggle bookmarks bar on newtab
    menu.querySelector('#acm-toggle-newtab-bar')?.addEventListener('click', () => {
        alert("Bookmarks bar is set to show on New Tab page.");
        closeMenu();
    });

    // Close handler
    const closeMenuHandler = (e) => {
        if (!menu.contains(e.target)) {
            closeMenu();
        }
    };
    setTimeout(() => {
        document.addEventListener('click', closeMenuHandler);
    }, 0);
}

// Click catcher and focus tracker engine for guest webview click detection
(() => {
    let clickCatcher = null;

    function updateClickCatcher() {
        const ebpDropdown = document.querySelector('.ebp-folder-dropdown');
        const isEbpDropdownOpen = ebpDropdown && ebpDropdown.style.display === 'flex';

        // Find if any dropdown, context menu, suggestions overlay, or popup folder select is open
        const isMenuOpen = 
            document.querySelector('.bookmark-folder-dropdown') ||
            document.querySelector('.aero-context-menu') ||
            document.querySelector('.menu-popover-dropdown') ||
            document.querySelector('.features-dropdown-popover') ||
            document.querySelector('.ai-dropdown-popover') ||
            isEbpDropdownOpen ||
            document.querySelector('.omnibox-dropdown.visible');

        const viewport = document.querySelector('.chromium-webview-stack');
        if (!viewport) return;

        if (isMenuOpen) {
            if (!clickCatcher) {
                clickCatcher = document.createElement('div');
                clickCatcher.className = 'aero-webview-click-catcher';
                
                const dismissHandler = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Dispatch document level events to trigger existing click/mousedown outside handlers
                    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    
                    // Force clean up elements
                    document.querySelectorAll('.bookmark-folder-dropdown').forEach(el => el.remove());
                    document.querySelectorAll('.aero-context-menu').forEach(el => el.remove());
                    
                    const omnibox = document.getElementById('browser-nav');
                    if (omnibox && typeof omnibox.setState === 'function') {
                        omnibox.setState({ isMenuOpen: false, isFeatureDropdownOpen: false });
                        omnibox.isFocused = false;
                        const overlay = omnibox.querySelector('#suggestions-overlay');
                        if (overlay) overlay.classList.remove('visible');
                    }
                    
                    const aiSidebar = document.getElementById('ai-sidebar');
                    if (aiSidebar && typeof aiSidebar.setState === 'function') {
                        aiSidebar.setState({ isMoreMenuOpen: false });
                    }

                    const folderDropdown = document.querySelector('.ebp-folder-dropdown');
                    if (folderDropdown) {
                        folderDropdown.style.display = 'none';
                    }

                    if (clickCatcher && clickCatcher.parentNode) {
                        clickCatcher.parentNode.removeChild(clickCatcher);
                    }
                    clickCatcher = null;
                };

                clickCatcher.addEventListener('mousedown', dismissHandler);
                clickCatcher.addEventListener('click', dismissHandler);
                viewport.appendChild(clickCatcher);
            }
        } else {
            if (clickCatcher) {
                if (clickCatcher.parentNode) {
                    clickCatcher.parentNode.removeChild(clickCatcher);
                }
                clickCatcher = null;
            }
        }
    }

    // Monitor DOM mutations for dropdown/context-menu additions/removals
    const observer = new MutationObserver(() => {
        updateClickCatcher();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });

    // Capture focusin on webviews to dismiss menus instantly when clicked
    document.addEventListener('focusin', (e) => {
        if (e.target && e.target.tagName === 'WEBVIEW') {
            document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            
            if (clickCatcher && clickCatcher.parentNode) {
                clickCatcher.parentNode.removeChild(clickCatcher);
            }
            clickCatcher = null;
        }
    }, true);
})();

