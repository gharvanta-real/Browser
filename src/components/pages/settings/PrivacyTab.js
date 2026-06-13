// PrivacyTab.js - Extracted from SettingsPage.js

export function renderPrivacyTab(state, getRowStyle, selectStyle, renderToggle, inputStyle) {
    const provider = state.aiProvider || 'claude';
    const secureDns = state.secureDns || 'automatic';

    if (state.viewingPermissions) {
        return `
            <div class="settings-section">
                <div style="display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                    <button id="btn-permissions-back" style="background: transparent; border: none; outline: none; font-size: 16px; cursor: pointer; color: var(--color-text-inactive); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; transition: background var(--transition-fast);">
                        <i class="hgi-stroke hgi-arrow-left-01" style="font-size: 18px;"></i>
                    </button>
                    <h3 style="margin: 0; font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Site Permissions & Exceptions</h3>
                </div>

                <!-- Generic Permissions Card -->
                <h4 style="margin: 0 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Default Permissions</h4>
                <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: var(--spacing-xl);">
                    <!-- Camera Permission Row -->
                    <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border);">
                        <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                            <i class="hgi-stroke hgi-camera-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Camera</span>
                                <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Sites can ask to use your camera.</span>
                            </div>
                        </div>
                        <select id="perm-camera" style="${selectStyle}">
                            <option value="allow" ${state.sitePermissions?.camera === 'allow' ? 'selected' : ''}>Allow</option>
                            <option value="block" ${state.sitePermissions?.camera === 'block' ? 'selected' : ''}>Block</option>
                            <option value="ask" ${state.sitePermissions?.camera === 'ask' ? 'selected' : ''}>Ask (default)</option>
                        </select>
                    </div>
                    <!-- Microphone Permission Row -->
                    <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border);">
                        <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                            <i class="hgi-stroke hgi-microphone-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Microphone</span>
                                <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Sites can ask to use your microphone.</span>
                            </div>
                        </div>
                        <select id="perm-microphone" style="${selectStyle}">
                            <option value="allow" ${state.sitePermissions?.microphone === 'allow' ? 'selected' : ''}>Allow</option>
                            <option value="block" ${state.sitePermissions?.microphone === 'block' ? 'selected' : ''}>Block</option>
                            <option value="ask" ${state.sitePermissions?.microphone === 'ask' ? 'selected' : ''}>Ask (default)</option>
                        </select>
                    </div>
                    <!-- Location Permission Row -->
                    <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border);">
                        <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                            <i class="hgi-stroke hgi-location-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Location</span>
                                <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Sites can ask for your location.</span>
                            </div>
                        </div>
                        <select id="perm-location" style="${selectStyle}">
                            <option value="allow" ${state.sitePermissions?.location === 'allow' ? 'selected' : ''}>Allow</option>
                            <option value="block" ${state.sitePermissions?.location === 'block' ? 'selected' : ''}>Block</option>
                            <option value="ask" ${state.sitePermissions?.location === 'ask' ? 'selected' : ''}>Ask (default)</option>
                        </select>
                    </div>
                    <!-- Notifications Permission Row -->
                    <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg);">
                        <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                            <i class="hgi-stroke hgi-notification-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Notifications</span>
                                <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Sites can ask to send notifications.</span>
                            </div>
                        </div>
                        <select id="perm-notifications" style="${selectStyle}">
                            <option value="allow" ${state.sitePermissions?.notifications === 'allow' ? 'selected' : ''}>Allow</option>
                            <option value="block" ${state.sitePermissions?.notifications === 'block' ? 'selected' : ''}>Block</option>
                            <option value="ask" ${state.sitePermissions?.notifications === 'ask' ? 'selected' : ''}>Ask (default)</option>
                        </select>
                    </div>
                </div>

                <!-- AI Exceptions -->
                <h4 style="margin: 0 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">AI Agent Reading Blocklist</h4>
                <div style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md);">
                    <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Specify domains where page reading and execution control by the AI Agent should be strictly blocked.</span>
                    
                    <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
                        <input type="text" id="ai-blocklist-domain" placeholder="example.com" style="${inputStyle}; flex: 1; border: 1px solid var(--color-viewport-border);">
                        <button id="btn-add-blocklist" style="background: var(--color-input-focus-border); color: #fff; border: none; border-radius: 6px; padding: 8px 16px; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer;">Block Domain</button>
                    </div>

                    <div style="border: 1px solid var(--color-viewport-border); border-radius: 8px; overflow: hidden; margin-top: var(--spacing-sm);">
                        <table style="width: 100%; border-collapse: collapse; font-size: var(--font-size-xs); text-align: left;">
                            <thead>
                                <tr style="background: rgba(0,0,0,0.02); border-bottom: 1px solid var(--color-viewport-border);">
                                    <th style="padding: 10px 12px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Domain</th>
                                    <th style="padding: 10px 12px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Status</th>
                                    <th style="padding: 10px 12px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Date Added</th>
                                    <th style="padding: 10px 12px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text); text-align: right;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(state.sitePermissions?.aiBlocklist || []).length === 0 ? `
                                    <tr>
                                        <td colspan="4" style="padding: 24px; text-align: center; color: var(--color-viewport-text-muted);">No domains blocked from AI page reading.</td>
                                    </tr>
                                ` : state.sitePermissions.aiBlocklist.map(site => `
                                    <tr style="border-bottom: 1px solid var(--color-viewport-border);">
                                        <td style="padding: 10px 12px; font-weight: var(--font-weight-medium); color: var(--color-viewport-text);">${site.domain}</td>
                                        <td style="padding: 10px 12px;"><span style="background: #E81123; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 10px;">Blocked</span></td>
                                        <td style="padding: 10px 12px; color: var(--color-viewport-text-muted);">${site.dateAdded}</td>
                                        <td style="padding: 10px 12px; text-align: right;">
                                            <button class="btn-remove-blocklist" data-domain="${site.domain}" style="background: transparent; border: none; color: #E81123; cursor: pointer; padding: 4px var(--spacing-sm); border-radius: 4px; font-size: 12px;">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="settings-section">
            <h3 style="margin: 0 0 var(--spacing-lg); font-size: 16px; font-weight: var(--font-weight-semibold); color: var(--color-viewport-text);">Privacy & Security</h3>
            
            <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                
                <!-- Tracking Protection Row -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Tracking protection Block trackers and limit ad personalization')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-shield-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Tracking protection</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Block trackers and limit ad personalization. This setting applies to all profiles.</span>
                        </div>
                    </div>
                    <select id="settings-tracking-protection" style="${selectStyle}">
                        <option value="balanced" ${state.trackingProtection === 'balanced' ? 'selected' : ''}>Balanced (recommended)</option>
                        <option value="strict" ${state.trackingProtection === 'strict' ? 'selected' : ''}>Strict</option>
                        <option value="basic" ${state.trackingProtection === 'basic' ? 'selected' : ''}>Basic</option>
                    </select>
                </div>

                <!-- Secure DNS Row -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Secure DNS Use a secure connection to look up website addresses')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-globe" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Secure DNS</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Use a secure connection to look up website addresses.</span>
                        </div>
                    </div>
                    <select id="settings-secure-dns" style="${selectStyle}">
                        <option value="automatic" ${secureDns === 'automatic' ? 'selected' : ''}>Automatic (Default)</option>
                        <option value="cloudflare" ${secureDns === 'cloudflare' ? 'selected' : ''}>Cloudflare (1.1.1.1)</option>
                        <option value="google" ${secureDns === 'google' ? 'selected' : ''}>Google Public DNS</option>
                        <option value="cleanbrowsing" ${secureDns === 'cleanbrowsing' ? 'selected' : ''}>CleanBrowsing</option>
                        <option value="off" ${secureDns === 'off' ? 'selected' : ''}>Off</option>
                    </select>
                </div>

                <!-- Default AI Provider Row -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Default AI Provider Choose LLM for automation agent')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-chat-bot" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Default AI Provider</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Choose the primary LLM model that powers the browsing automation agent.</span>
                        </div>
                    </div>
                    <select id="settings-provider-select" style="${selectStyle}">
                        <option value="claude" ${provider === 'claude' ? 'selected' : ''}>Claude 3.5 Sonnet (Default)</option>
                        <option value="openai" ${provider === 'openai' ? 'selected' : ''}>GPT-4o (Cloud API)</option>
                        <option value="gemini" ${provider === 'gemini' ? 'selected' : ''}>Gemini 3.5 Flash</option>
                        <option value="local" ${provider === 'local' ? 'selected' : ''}>Llama 3 8B (Local)</option>
                    </select>
                </div>

                <!-- Cookie controls -->
                <div class="settings-item-row" id="btn-cookie-controls" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Cookie controls Choose how Aero handles cookies and site data')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-note-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Cookie controls</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Choose how Aero handles cookies and site data.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

                <!-- Site permissions -->
                <div class="settings-item-row" id="btn-site-permissions" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Site permissions Control what information sites can use')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-settings-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Site permissions</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Control what information sites can use and what content they can show you.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

                <!-- Password manager -->
                <div class="settings-item-row" id="btn-password-manager" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Password manager Manage saved passwords')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-lock" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Password manager</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Manage saved passwords, passkeys, and autofill.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

                <!-- Clear browsing data -->
                <div class="settings-item-row" id="btn-clear-history-page" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); cursor: pointer; ${getRowStyle('Clear browsing data Clear history, cookies, cache')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-clock-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Clear browsing data</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Clear history, cookies, cache, and more.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

                <!-- Safety check -->
                <div class="settings-item-row" id="btn-safety-check" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); cursor: pointer; ${getRowStyle('Safety check Review important security and privacy settings')}">
                    <div style="display: flex; gap: var(--spacing-md); align-items: flex-start; min-width: 0;">
                        <i class="hgi-stroke hgi-checkmark-circle-01" style="font-size: 18px; color: var(--color-text-inactive); margin-top: 2px;"></i>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Safety check</span>
                            <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Review important security and privacy settings.</span>
                        </div>
                    </div>
                    <i class="hgi-stroke hgi-arrow-right-01" style="font-size: 16px; color: var(--color-text-inactive);"></i>
                </div>

            </div>

            <!-- Focus & browsing protection -->
            <h4 style="margin: var(--spacing-xl) 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Focus & browsing protection</h4>
            <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                <!-- Focus mode -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Focus mode Block distracting sites, harmful content, and intrusive ads')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Focus mode</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Block distracting sites, harmful content, and intrusive ads.</span>
                    </div>
                    ${renderToggle('settings-focus-mode-toggle', state.focusMode)}
                </div>

                <!-- Safe browsing -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Safe browsing Protect against dangerous sites, downloads, and extensions')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Safe browsing</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Protect against dangerous sites, downloads, and extensions.</span>
                    </div>
                    <select id="settings-safe-browsing-select" style="${selectStyle}">
                        <option value="enhanced" ${state.safeBrowsing === 'enhanced' ? 'selected' : ''}>Enhanced protection</option>
                        <option value="standard" ${state.safeBrowsing === 'standard' ? 'selected' : ''}>Standard protection</option>
                        <option value="none" ${state.safeBrowsing === 'none' ? 'selected' : ''}>No protection</option>
                    </select>
                </div>
            </div>

            <!-- Privacy quick settings -->
            <h4 style="margin: var(--spacing-xl) 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">Privacy quick settings</h4>
            <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column;">
                <!-- DNT Toggle -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Send a Do Not Track request')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Send a "Do Not Track" request</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Ask sites not to track you</span>
                    </div>
                    ${renderToggle('dnt-toggle', state.dntEnabled !== false)}
                </div>

                <!-- Preload pages -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); border-bottom: 1px solid var(--color-viewport-border); ${getRowStyle('Preload pages for faster browsing and searching')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Preload pages for faster browsing and searching</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Prefetch information from pages, including those you have not yet visited</span>
                    </div>
                    ${renderToggle('preload-toggle', state.preloadPages !== false)}
                </div>

                <!-- Help improve -->
                <div class="settings-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) var(--spacing-lg); ${getRowStyle('Help improve Aero send crash reports')}">
                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);">Help improve Aero</span>
                        <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Automatically send usage statistics and crash reports</span>
                    </div>
                    ${renderToggle('improve-toggle', state.helpImprove === true)}
                </div>
            </div>

            <!-- GDPR & Data Compliance -->
            <h4 style="margin: var(--spacing-xl) 0 var(--spacing-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-viewport-text-muted);">GDPR & Data Compliance</h4>
            <div class="settings-rows-card" style="background: var(--color-card-bg); border: 1px solid var(--color-viewport-border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; padding: var(--spacing-lg); gap: var(--spacing-md);">
                <span style="font-size: var(--font-size-xs); color: var(--color-viewport-text-muted);">Manage your local AI logs, audit events, and data compliance settings under GDPR.</span>
                <div style="display: flex; gap: var(--spacing-md);">
                    <button id="btn-gdpr-export" style="background: var(--color-input-focus-border); color: #fff; border: none; border-radius: 6px; padding: 10px 16px; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        Export AI Interaction Logs
                    </button>
                    <button id="btn-gdpr-purge" style="background: transparent; border: 1px solid #E81123; color: #E81123; border-radius: 6px; padding: 10px 16px; font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        Purge Encrypted Local AI Data
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function bindPrivacyTabEvents(settingsPage, state) {
    const activeSec = settingsPage.state.activeSection || 'privacy';
    if (activeSec !== 'privacy') return;

    if (settingsPage.state.viewingPermissions) {
        // Back to privacy home
        settingsPage.querySelector('#btn-permissions-back')?.addEventListener('click', () => {
            settingsPage.setState({ viewingPermissions: false });
        });

        // Bind permission dropdowns
        ['camera', 'microphone', 'location', 'notifications'].forEach(perm => {
            const select = settingsPage.querySelector(`#perm-${perm}`);
            if (select) {
                select.addEventListener('change', (e) => {
                    const val = e.target.value;
                    window.AppState.update(s => {
                        s.sitePermissions = s.sitePermissions || {};
                        s.sitePermissions[perm] = val;
                    });
                });
            }
        });

        // Add domain to blocklist
        settingsPage.querySelector('#btn-add-blocklist')?.addEventListener('click', () => {
            const input = settingsPage.querySelector('#ai-blocklist-domain');
            const domain = input?.value.trim().toLowerCase();
            if (!domain) return;
            
            window.AppState.update(s => {
                s.sitePermissions = s.sitePermissions || { camera: 'ask', microphone: 'ask', location: 'ask', notifications: 'ask', aiBlocklist: [] };
                s.sitePermissions.aiBlocklist = s.sitePermissions.aiBlocklist || [];
                if (!s.sitePermissions.aiBlocklist.some(d => d.domain === domain)) {
                    s.sitePermissions.aiBlocklist.push({
                        domain,
                        status: 'blocked',
                        dateAdded: new Date().toISOString().split('T')[0]
                    });
                }
            });
            input.value = '';
            // Force re-render SettingsPage
            settingsPage.setState({ sitePermissions: window.AppState.sitePermissions });
        });

        // Delete domain from blocklist
        settingsPage.querySelectorAll('.btn-remove-blocklist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const domain = btn.getAttribute('data-domain');
                window.AppState.update(s => {
                    if (s.sitePermissions && s.sitePermissions.aiBlocklist) {
                        s.sitePermissions.aiBlocklist = s.sitePermissions.aiBlocklist.filter(d => d.domain !== domain);
                    }
                });
                // Force re-render SettingsPage
                settingsPage.setState({ sitePermissions: window.AppState.sitePermissions });
            });
        });

        return;
    }

    // AI Provider Select Event
    const providerSelect = settingsPage.querySelector('#settings-provider-select');
    if (providerSelect) {
        providerSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(s => {
                s.aiProvider = val;
            });
        });
    }

    // Secure DNS Select Event
    const secureDnsSelect = settingsPage.querySelector('#settings-secure-dns');
    if (secureDnsSelect) {
        secureDnsSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(s => {
                s.secureDns = val;
            });
        });
    }

    // Tracking Select Event
    const trackingSelect = settingsPage.querySelector('#settings-tracking-protection');
    if (trackingSelect) {
        trackingSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(s => {
                s.trackingProtection = val;
            });
        });
    }

    // GDPR Export Events
    const gdprExportBtn = settingsPage.querySelector('#btn-gdpr-export');
    if (gdprExportBtn) {
        gdprExportBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                chatHistory: window.AppState.chatHistory || [],
                taskLogs: window.AppState.taskLogs || [],
                aiActionHistory: window.AppState.aiActionHistory || [],
                blockedTrackers: window.AppState.blockedTrackers || 0,
                sitePermissions: window.AppState.sitePermissions || {}
            }, null, 4));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "aero_ai_compliance_export.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    // GDPR Purge Events
    const gdprPurgeBtn = settingsPage.querySelector('#btn-gdpr-purge');
    if (gdprPurgeBtn) {
        gdprPurgeBtn.addEventListener('click', () => {
            window.AppState.update(s => {
                s.chatHistory = [
                    { sender: 'ai', text: 'History and task logs cleared. How can I help you today?' }
                ];
                s.taskLogs = [];
                s.aiActionHistory = [];
            });
            alert("All encrypted local AI data and compliance logs have been permanently purged.");
        });
    }

    const clearBtn = settingsPage.querySelector('#btn-clear-history-page');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            window.AppState.update(s => {
                s.history = [];
            });
            alert("Browsing history and local page cache successfully cleared!");
        });
    }

    const focusToggle = settingsPage.querySelector('#settings-focus-mode-toggle');
    if (focusToggle) {
        focusToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(s => {
                s.focusMode = checked;
            });
        });
    }

    const safeBrowsingSelect = settingsPage.querySelector('#settings-safe-browsing-select');
    if (safeBrowsingSelect) {
        safeBrowsingSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            window.AppState.update(s => {
                s.safeBrowsing = val;
            });
        });
    }

    const dntToggle = settingsPage.querySelector('#dnt-toggle');
    if (dntToggle) {
        dntToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(s => {
                s.dntEnabled = checked;
            });
        });
    }

    const preloadToggle = settingsPage.querySelector('#preload-toggle');
    if (preloadToggle) {
        preloadToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(s => {
                s.preloadPages = checked;
            });
        });
    }

    const improveToggle = settingsPage.querySelector('#improve-toggle');
    if (improveToggle) {
        improveToggle.addEventListener('change', (e) => {
            const checked = e.target.checked;
            window.AppState.update(s => {
                s.helpImprove = checked;
            });
        });
    }

    // Interactive mock alerts for cookie controls
    const cookieBtn = settingsPage.querySelector('#btn-cookie-controls');
    if (cookieBtn) {
        cookieBtn.addEventListener('click', () => {
            alert("Cookie Management & Exceptions Panel: Block third-party cookies enabled.");
        });
    }

    // Site Permissions Sub-panel switch
    const permissionsBtn = settingsPage.querySelector('#btn-site-permissions');
    if (permissionsBtn) {
        permissionsBtn.addEventListener('click', () => {
            settingsPage.setState({ viewingPermissions: true });
        });
    }

    const passwordsBtn = settingsPage.querySelector('#btn-password-manager');
    if (passwordsBtn) {
        passwordsBtn.addEventListener('click', () => {
            settingsPage.navigateTabSafely('aero://passwords');
        });
    }

    const safetyCheckBtn = settingsPage.querySelector('#btn-safety-check');
    if (safetyCheckBtn) {
        safetyCheckBtn.addEventListener('click', () => {
            alert("Safety check started... No compromised passwords or malicious extensions found. Aero is secure!");
        });
    }
}
