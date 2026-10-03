import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, Users, CreditCard,
  Layers, ScrollText, Settings, Shield, Zap,
} from 'lucide-react';
import { ADMIN_NAV_ITEMS, APP_NAME, ROUTES } from '../../constants';

const iconMap = {
  LayoutDashboard, Building2, Users, CreditCard,
  Layers, ScrollText, Settings, Shield, Zap,
};

const AdminNavItem = ({ item }) => {
  const Icon = iconMap[item.icon] || Shield;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-amber-500/15 text-amber-400'
          : 'text-[var(--text-muted)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-secondary)]'
        }
      `}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {item.label}
    </NavLink>
  );
};

/**
 * AdminLayout — Distinct platform-level admin area.
 * Visually matches Bizora but uses amber accents to distinguish it from business app.
 */
const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-primary)]">
      {/* Admin sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]">
        {/* Logo + admin badge */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-[var(--sidebar-border)] shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight block leading-none">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
              Admin
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Platform
          </p>
          {ADMIN_NAV_ITEMS.map((item) => (
            <AdminNavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Back to app */}
        <div className="px-2 py-3 border-t border-[var(--sidebar-border)]">
          <NavLink
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />
            Back to App
          </NavLink>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Admin topbar */}
        <header className="h-16 shrink-0 flex items-center px-6 gap-4 bg-[var(--topbar-bg)] backdrop-blur-md border-b border-[var(--topbar-border)]">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h1 className="text-base font-semibold text-[var(--text-primary)]">
              Super Admin
            </h1>
          </div>
          <div className="flex-1" />
          <span className="text-xs text-amber-500 font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Platform Control
          </span>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
