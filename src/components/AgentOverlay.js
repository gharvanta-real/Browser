// AgentOverlay.js - Extracted sub-renderer/handler for WebViewport
export function renderAccessibilityTreeOverlay(url) {
    let nodes = [];
    
    if (url.includes('flights.nifty.com')) {
        nodes = [
            { id: 'ax-1', role: 'heading', name: 'Nifty Flights Hero', x: '5%', y: '10%' },
            { id: 'ax-2', role: 'textbox', name: 'From (Origin)', x: '5%', y: '45%' },
            { id: 'ax-3', role: 'textbox', name: 'To (Destination)', x: '35%', y: '45%' },
            { id: 'ax-4', role: 'button', name: 'Search Flights', x: '82%', y: '45%' },
            { id: 'ax-5', role: 'card', name: 'Air Asia Cheapest ₹32,100', x: '5%', y: '73%' },
            { id: 'ax-6', role: 'button', name: 'Book Flight', x: '82%', y: '78%' }
        ];
    } else {
        nodes = [
            { id: 'ax-1', role: 'heading', name: 'Browser Specs Heading', x: '5%', y: '5%' },
            { id: 'ax-2', role: 'alert', name: 'Memory Status Indicator', x: '5%', y: '16%' }
        ];
    }

    return `
        <div class="ax-tree-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: var(--color-viewport-bg); opacity: 0.95; z-index: 10; pointer-events: none; font-family: var(--font-ui);">
            <div class="ax-overlay-title" style="padding: var(--spacing-sm) var(--spacing-md); background: var(--color-window-bg); color: var(--color-input-focus-border); font-size: 10px; font-weight: var(--font-weight-semibold); border-bottom: 1px solid var(--color-viewport-border);">Layer 1 Accessibility Inspector (AXTree View)</div>
            ${nodes.map(node => `
                <div class="ax-node-box" style="position: absolute; top: ${node.y}; left: ${node.x}; border: 1.5px dashed var(--color-input-focus-border); background: rgba(77, 144, 254, 0.05); border-radius: var(--border-radius-xs); padding: var(--spacing-xxs) var(--spacing-sm); display: flex; flex-direction: column; font-size: 9px; line-height: 1.25; color: var(--color-input-focus-border);">
                    <span class="ax-node-role" style="font-weight: var(--font-weight-semibold); font-size: 8px;">${node.role.charAt(0).toUpperCase() + node.role.slice(1)}</span>
                    <span class="ax-node-name" style="font-weight: var(--font-weight-medium); color: var(--color-viewport-text);">"${node.name}"</span>
                    <span class="ax-node-id" style="color: var(--color-viewport-text-muted); opacity: 0.8;">id: ${node.id}</span>
                </div>
            `).join('')}
        </div>
    `;
}

export function handleAgentActionHighlight(viewportInstance, stepIndex) {
    const cursor = viewportInstance.querySelector('#agent-cursor');
    if (!cursor) return;

    let targetId = null;
    let x = 0;
    let y = 0;

    if (stepIndex === 1) { 
        x = 100; y = 100;
    } else if (stepIndex === 2) { 
        targetId = '#node-origin';
        x = 150; y = 240;
    } else if (stepIndex === 4) { 
        targetId = '#node-cheapest-flight';
        x = 400; y = 430;
    } else if (stepIndex === 6) { 
        targetId = '#node-book-btn';
        x = 840; y = 430;
    }

    if (targetId) {
        const targetEl = viewportInstance.querySelector(targetId);
        if (targetEl) {
            targetEl.style.borderColor = '#1A73E8';
            targetEl.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.2)';
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    cursor.style.display = 'block';
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    
    cursor.style.background = 'rgba(26, 115, 232, 0.9)';
    setTimeout(() => {
        cursor.style.background = 'rgba(77, 144, 254, 0.6)';
    }, 300);
}
