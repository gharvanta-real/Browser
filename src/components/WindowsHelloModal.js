/**
 * WindowsHelloModal.js
 * High-fidelity Windows Hello Biometric & PIN simulation overlay.
 */

export function showWindowsHello(actionName = "access secure credentials") {
    return new Promise((resolve) => {
        // Remove existing modal if any
        document.getElementById('aero-windows-hello-modal')?.remove();

        const modal = document.createElement('div');
        modal.id = 'aero-windows-hello-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.55);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI Variable Display', 'Segoe UI', -apple-system, sans-serif;
            color: #FFFFFF;
            opacity: 0;
            transition: opacity 0.25s ease;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            width: 440px;
            background: #1F1F1F;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            padding: 30px 36px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            transform: scale(0.92);
            transition: transform 0.25s cubic-bezier(0.1, 0.9, 0.2, 1);
        `;

        container.innerHTML = `
            <!-- Top Logo & Security Info -->
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px; opacity: 0.85;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" fill="#0078D4"/>
                    <path d="M10 10l-2 2 4 4 6-6-1.5-1.5L12 13.5 10 10z" fill="#FFFFFF"/>
                </svg>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Windows Security</span>
            </div>

            <!-- Title & Instruction -->
            <h2 style="margin: 0; font-size: 20px; font-weight: 350; line-height: 1.25;">Making sure it's you</h2>
            <p style="margin: 8px 0 28px; font-size: 13px; color: #CCCCCC; line-height: 1.45;">
                Aero Browser is trying to <strong style="color: #FFFFFF; font-weight: 600;">${actionName}</strong>.
            </p>

            <!-- Interactive Biometrics Area -->
            <div id="hello-interactive-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 24px;">
                
                <!-- Pulsing Scan Ring -->
                <div id="hello-biometric-ring" style="position: relative; width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0, 120, 212, 0.1); border: 2px solid rgba(0, 120, 212, 0.35); cursor: pointer; transition: all 0.2s ease;">
                    <i class="hgi-stroke hgi-fingerprint-scan" style="font-size: 32px; color: #0078D4; transition: transform 0.25s ease;"></i>
                    <div id="hello-scan-wave" style="position: absolute; border: 2px solid #0078D4; border-radius: 50%; width: 100%; height: 100%; top: -2px; left: -2px; opacity: 0; box-sizing: content-box;"></div>
                </div>

                <div id="hello-status-msg" style="margin-top: 14px; font-size: 13px; color: #CCCCCC; height: 18px; text-align: center;">
                    Touch the fingerprint sensor
                </div>
            </div>

            <!-- PIN Input (Hidden by default, can be toggled) -->
            <div id="hello-pin-container" style="display: none; flex-direction: column; gap: 6px; margin-bottom: 24px;">
                <label style="font-size: 12px; color: #CCCCCC;">PIN</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="password" id="hello-pin-input" maxlength="8" placeholder="Enter security PIN" style="flex: 1; padding: 6px 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: #FFF; outline: none; font-size: 14px; font-family: monospace;">
                </div>
            </div>

            <!-- Footer Buttons -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px;">
                <button id="btn-hello-toggle-mode" style="background: transparent; border: none; color: #0078D4; font-size: 13px; font-weight: 500; cursor: pointer; outline: none; padding: 0;">
                    Use PIN
                </button>
                <button id="btn-hello-cancel" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #FFFFFF; font-size: 13px; font-weight: 400; padding: 6px 24px; cursor: pointer; outline: none; transition: background 0.15s ease;">
                    Cancel
                </button>
            </div>
        `;

        modal.appendChild(container);
        document.body.appendChild(modal);

        // Fade in animations
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            container.style.transform = 'scale(1)';
        });

        const statusMsg = modal.querySelector('#hello-status-msg');
        const biometricRing = modal.querySelector('#hello-biometric-ring');
        const scanWave = modal.querySelector('#hello-scan-wave');
        const toggleModeBtn = modal.querySelector('#btn-hello-toggle-mode');
        const cancelBtn = modal.querySelector('#btn-hello-cancel');
        const pinContainer = modal.querySelector('#hello-pin-container');
        const interactiveContainer = modal.querySelector('#hello-interactive-container');
        const pinInput = modal.querySelector('#hello-pin-input');

        let isVerifying = false;
        let activeMode = 'biometric'; // 'biometric' | 'pin'

        // Animation intervals
        let waveInterval = setInterval(() => {
            if (isVerifying || activeMode !== 'biometric') return;
            scanWave.style.transform = 'scale(1.35)';
            scanWave.style.opacity = '0.7';
            scanWave.style.transition = 'all 0.8s ease-out';
            
            setTimeout(() => {
                scanWave.style.transition = 'none';
                scanWave.style.transform = 'scale(1)';
                scanWave.style.opacity = '0';
            }, 800);
        }, 1800);

        const cleanUp = () => {
            clearInterval(waveInterval);
            modal.style.opacity = '0';
            container.style.transform = 'scale(0.92)';
            setTimeout(() => modal.remove(), 250);
        };

        const executeSuccessAnimation = () => {
            isVerifying = true;
            biometricRing.style.border = '2px solid #107C41';
            biometricRing.style.background = 'rgba(16, 124, 65, 0.15)';
            biometricRing.innerHTML = `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#107C41" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            statusMsg.innerHTML = `<span style="color: #107C41; font-weight: 500;">✓ Verified</span>`;
            
            setTimeout(() => {
                cleanUp();
                resolve(true);
            }, 1000);
        };

        // Biometric scanning click trigger
        biometricRing.addEventListener('click', () => {
            if (isVerifying) return;
            isVerifying = true;
            statusMsg.innerHTML = 'Scanning fingerprint...';
            biometricRing.style.borderColor = '#0078D4';
            biometricRing.style.boxShadow = '0 0 12px rgba(0, 120, 212, 0.4)';
            biometricRing.querySelector('i').style.transform = 'scale(1.15)';

            setTimeout(() => {
                executeSuccessAnimation();
            }, 1400);
        });

        // Mode Toggler
        toggleModeBtn.addEventListener('click', () => {
            if (isVerifying) return;
            if (activeMode === 'biometric') {
                activeMode = 'pin';
                interactiveContainer.style.display = 'none';
                pinContainer.style.display = 'flex';
                toggleModeBtn.innerText = 'Use Fingerprint';
                pinInput.focus();
            } else {
                activeMode = 'biometric';
                interactiveContainer.style.display = 'flex';
                pinContainer.style.display = 'none';
                toggleModeBtn.innerText = 'Use PIN';
            }
        });

        // PIN Keydown/Input listener
        pinInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = pinInput.value.trim();
                if (val.length >= 4) {
                    executeSuccessAnimation();
                } else {
                    statusMsg.innerHTML = '<span style="color: #E81123;">PIN must be at least 4 digits</span>';
                    pinContainer.appendChild(statusMsg);
                }
            }
        });

        // Cancel Listener
        cancelBtn.addEventListener('click', () => {
            cleanUp();
            resolve(false);
        });
    });
}
