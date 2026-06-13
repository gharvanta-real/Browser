// ProfilePopover.js - Separated Profile card dropdown

export function renderProfilePopover(state) {
    return `
        <div class="profile-dropdown-popover menu-popover-dropdown" style="position: absolute; top: calc(100% + 8px); right: 28px; width: 280px; background: var(--color-viewport-bg); border: 1px solid var(--color-border-light); border-radius: 8px; box-shadow: var(--shadow-lg); z-index: 1000; display: flex; flex-direction: column; overflow: hidden; font-family: var(--font-ui); color: var(--color-text-active); padding: 12px 14px; gap: 10px; text-align: left;">
            
            <!-- Profile Card -->
            <div style="background: var(--color-input-bg); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px;">
                <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--color-input-focus-border); color: #FFFFFF; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); user-select: none;">A</div>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-text-active);">Alex Morgan</span>
                    <span style="font-size: var(--font-size-xs); color: var(--color-text-inactive);">alex.morgan@aero.com</span>
                </div>
                <span style="font-size: 10px; color: #188038; background: rgba(24, 128, 56, 0.1); padding: 3px 8px; border-radius: 12px; display: flex; align-items: center; gap: 5px; font-weight: var(--font-weight-semibold); margin-top: 4px;">
                    <span style="width: 5px; height: 5px; border-radius: 50%; background: #188038;"></span> Synced to Cloud
                </span>
            </div>

            <!-- Customize Profile Action -->
            <div class="profile-action-row" data-url="aero://settings" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: var(--border-radius-md, 6px); font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                <i class="hgi-stroke hgi-pencil-edit" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                Customize profile
            </div>

            <div style="border-top: 1px solid var(--color-border-light); margin: 2px 0;"></div>

            <!-- Profile management list -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div class="profile-action-row" data-action="add-profile" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: var(--border-radius-md, 6px); font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-plus" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                    Add Aero profile
                </div>
                <div class="profile-action-row" data-action="guest-profile" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: var(--border-radius-md, 6px); font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-user" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                    Open Guest profile
                </div>
                <div class="profile-action-row" data-action="manage-profiles" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: var(--border-radius-md, 6px); font-size: var(--font-size-sm); cursor: pointer; transition: background var(--transition-fast);">
                    <i class="hgi-stroke hgi-settings-01" style="font-size: 15px; color: var(--color-text-inactive); opacity: 0.85;"></i>
                    Manage Aero profiles
                </div>
            </div>

        </div>
    `;
}

export function bindProfilePopoverEvents(omniboxInstance) {
    if (omniboxInstance.state.isProfileOpen) {
        const profilePopover = omniboxInstance.querySelector('.profile-dropdown-popover');
        if (profilePopover) {
            profilePopover.addEventListener('click', (e) => e.stopPropagation());
        }

        omniboxInstance.querySelectorAll('.profile-action-row').forEach(row => {
            row.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = row.getAttribute('data-url');
                const action = row.getAttribute('data-action');
                
                omniboxInstance.setState({ isProfileOpen: false });
                
                if (url) {
                    omniboxInstance.navigateTabSafely(url);
                } else if (action === 'add-profile') {
                    alert("Add Profile action successfully launched!");
                } else if (action === 'guest-profile') {
                    alert("Guest Profile session opened!");
                } else if (action === 'manage-profiles') {
                    alert("Profile Manager successfully launched!");
                }
            });
        });
    }
}
