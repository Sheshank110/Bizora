import { Outlet, NavLink } from 'react-router-dom';
import {
  IconDashboard,
  IconBuilding,
  IconUsers,
  IconCreditCard,
  IconLayersIntersect,
  IconFileText,
  IconSettings,
  IconShield,
} from '@tabler/icons-react';
import { ADMIN_NAV_ITEMS, ROUTES } from '../../constants';
import Logo from '../ui/Logo';

const iconMap = {
  LayoutDashboard: IconDashboard,
  Building2: IconBuilding,
  Users: IconUsers,
  CreditCard: IconCreditCard,
  Layers: IconLayersIntersect,
  ScrollText: IconFileText,
  Settings: IconSettings,
  Shield: IconShield,
};

const AdminNavItem = ({ item }) => {
  const Icon = iconMap[item.icon] || IconShield;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors
        ${isActive
          ? 'bg-[#EFEFEF] dark:bg-[#181818] text-[#2563EB] dark:text-[#3B82F6] font-semibold'
          : 'text-[var(--text-secondary)] hover:bg-[#EFEFEF] dark:hover:bg-[#181818] hover:text-[var(--text-primary)]'
        }
      `}
    >
      <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
      {item.label}
    </NavLink>
  );
};

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-primary)]">
      {/* Admin sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-[var(--sidebar-bg)] border-none">
        {/* Logo + admin badge */}
        <div className="h-14 flex items-center justify-between px-4 shrink-0">
          <Logo variant="horizontal" size="xs" />
          <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--surface-elevated)] px-1.5 py-0.5 rounded uppercase tracking-wider">
            Superadmin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Platform Management
          </p>
          {ADMIN_NAV_ITEMS.map((item) => (
            <AdminNavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Back to app */}
        <div className="px-2 py-3">
          <NavLink
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            <IconDashboard className="w-4 h-4 shrink-0 stroke-[1.75]" />
            Back to App
          </NavLink>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Admin topbar */}
        <header className="h-14 shrink-0 flex items-center px-6 gap-3 bg-[var(--topbar-bg)] border-none">
          <IconShield className="w-4 h-4 text-[#2563EB] stroke-[1.75]" />
          <h1 className="text-sm font-semibold text-[var(--text-primary)]">
            Platform Administration
          </h1>
          <div className="flex-1" />
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
