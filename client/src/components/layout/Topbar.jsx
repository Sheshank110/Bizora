import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconMenu2,
  IconBell,
  IconSearch,
  IconSettings,
  IconLogout,
} from '@tabler/icons-react';
import { useUIStore } from '../../store/uiStore';
import { useThemeStore } from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import useAuth from '../../hooks/useAuth';
import { Avatar, Dropdown, Tooltip } from '../ui';
import { ROUTES } from '../../constants';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import CommandPalette from './CommandPalette';

const ThemeCycleButton = () => {
  const { theme, setTheme } = useThemeStore();

  const cycle = () => {
    const order = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const Icon = theme === 'light' ? IconSun : theme === 'dark' ? IconMoon : IconDeviceDesktop;
  const label = `Theme: ${theme}`;

  return (
    <Tooltip content={label} position="bottom">
      <button
        onClick={cycle}
        className="
          w-8 h-8 rounded-md flex items-center justify-center
          bg-[var(--surface-secondary)]
          text-[var(--text-secondary)] hover:text-[var(--text-primary)]
          transition-colors
        "
        aria-label={label}
      >
        <Icon className="w-4 h-4 stroke-[1.75]" />
      </button>
    </Tooltip>
  );
};

const Topbar = () => {
  const navigate = useNavigate();
  const { toggleMobileSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);

  // Global Ctrl/Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const userDisplayName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';

  return (
    <>
      <header
        className="
          h-14 shrink-0 flex items-center px-4 sm:px-6 gap-3
          bg-[var(--topbar-bg)]
          sticky top-0 z-30 select-none border-none
        "
      >
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          aria-label="Open navigation"
        >
          <IconMenu2 className="w-5 h-5 stroke-[1.75]" />
        </button>

        {/* Workspace Switcher */}
        <WorkspaceSwitcher />

        {/* Command Search Trigger (Ctrl/Cmd + K) */}
        <button
          onClick={() => setCommandOpen(true)}
          className="
            hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-md
            bg-[var(--surface-secondary)]
            text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]
            transition-colors w-60 lg:w-72
          "
        >
          <IconSearch className="w-4 h-4 text-[var(--text-muted)] stroke-[1.75]" />
          <span className="flex-1 text-left truncate">Search or jump to...</span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-[#EFEFEF] dark:bg-[#181818] rounded text-[var(--text-muted)]">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={() => setCommandOpen(true)}
          className="sm:hidden p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          aria-label="Search"
        >
          <IconSearch className="w-4 h-4 stroke-[1.75]" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Tooltip content="Notifications" position="bottom">
            <button
              onClick={() => navigate(ROUTES.NOTIFICATIONS)}
              className="
                relative w-8 h-8 rounded-md flex items-center justify-center
                bg-[var(--surface-secondary)]
                text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                transition-colors
              "
              aria-label="Notifications"
            >
              <IconBell className="w-4 h-4 stroke-[1.75]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            </button>
          </Tooltip>

          {/* Theme toggle */}
          <ThemeCycleButton />

          {/* Profile dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button
                className="flex items-center gap-2 p-0.5 rounded-md hover:opacity-80 transition-opacity"
                aria-label="User menu"
              >
                <Avatar name={userDisplayName} size="sm" src={user?.avatar} />
              </button>
            }
          >
            {({ close }) => (
              <>
                <div className="px-3 py-2 bg-[#F7F7F7] dark:bg-[#111111]">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                    {userDisplayName}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      close();
                      navigate('/app/settings');
                    }}
                    className="w-full flex items-center px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#F7F7F7] dark:hover:bg-[#1C1C1E] transition-colors text-left"
                  >
                    <span>Workspace Settings</span>
                  </button>
                  <div className="my-1 h-px bg-[#EFEFEF] dark:bg-[#1E1E1E]" />
                  <button
                    onClick={() => {
                      close();
                      logout();
                    }}
                    className="w-full flex items-center px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors text-left font-medium"
                  >
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </Dropdown>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
};

export default Topbar;
