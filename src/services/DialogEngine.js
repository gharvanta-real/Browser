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

