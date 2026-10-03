import { useLocation } from 'react-router-dom';
import { Sun, Moon, Monitor, Menu, Bell, Search } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useThemeStore } from '../../store/themeStore';
import { Avatar, Dropdown, Tooltip } from '../ui';
import { NAV_ITEMS, NAV_SECONDARY, NAV_BOTTOM, ROUTES } from '../../constants';

const ALL_NAV = [...NAV_ITEMS, ...NAV_SECONDARY, ...NAV_BOTTOM];

const ThemeCycleButton = () => {
  const { theme, setTheme } = useThemeStore();

  const cycle = () => {
    const order = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const label = `Theme: ${theme}`;

  return (
    <Tooltip content={label} position="bottom">
      <button
        onClick={cycle}
        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors"
        aria-label={label}
      >
        <Icon className="w-4.5 h-4.5" />
      </button>
    </Tooltip>
  );
};

const PageTitle = ({ pathname }) => {
  const found = ALL_NAV.find((n) => pathname.startsWith(n.path));
  return (
    <h1 className="text-base font-semibold text-[var(--text-primary)] hidden sm:block">
      {found?.label || 'Bizora'}
    </h1>
  );
};

const Topbar = () => {
  const { toggleMobileSidebar } = useUIStore();
  const { pathname } = useLocation();

  return (
    <header
      className="
        h-16 shrink-0 flex items-center px-4 gap-4
        bg-[var(--topbar-bg)] backdrop-blur-md
        border-b border-[var(--topbar-border)]
        sticky top-0 z-30
      "
    >
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <PageTitle pathname={pathname} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search placeholder — Phase 2 will implement */}
        <Tooltip content="Search (coming soon)" position="bottom">
          <button
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors"
            aria-label="Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
        </Tooltip>

        {/* Theme toggle */}
        <ThemeCycleButton />

        {/* Notifications placeholder */}
        <Tooltip content="Notifications (coming soon)" position="bottom">
          <button
            className="relative p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
          </button>
        </Tooltip>

        {/* Profile dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              className="flex items-center gap-2 ml-1 p-1.5 rounded-xl hover:bg-[var(--glass-bg)] transition-colors"
              aria-label="User menu"
            >
              <Avatar name="Demo User" size="sm" />
            </button>
          }
        >
          {({ close }) => (
            <>
              <div className="px-4 py-2.5 border-b border-[var(--glass-border)]">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Demo User</p>
                <p className="text-xs text-[var(--text-muted)]">demo@bizora.app</p>
              </div>
              <div className="py-1">
                <Dropdown.Item icon={null} disabled>
                  Profile (Phase 2)
                </Dropdown.Item>
                <Dropdown.Item icon={null} disabled>
                  Settings (Phase 2)
                </Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Item icon={null} disabled danger>
                  Sign out (Phase 2)
                </Dropdown.Item>
              </div>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
};

export default Topbar;
