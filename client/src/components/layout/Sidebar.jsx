import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCog, FolderKanban, CheckSquare,
  Briefcase, FileText, CreditCard, Receipt, Package, BarChart3,
  Bell, FolderOpen, Activity, Settings, Wallet, ChevronLeft,
  ChevronRight, Zap,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { NAV_ITEMS, NAV_SECONDARY, NAV_BOTTOM, APP_NAME } from '../../constants';
import Tooltip from '../ui/Tooltip';

const iconMap = {
  LayoutDashboard, Users, UserCog, FolderKanban, CheckSquare,
  Briefcase, FileText, CreditCard, Receipt, Package, BarChart3,
  Bell, FolderOpen, Activity, Settings, Wallet, Zap,
};

const NavItem = ({ item, collapsed }) => {
  const Icon = iconMap[item.icon] || LayoutDashboard;

  return (
    <Tooltip content={collapsed ? item.label : null} position="right">
      <NavLink
        to={item.path}
        className={({ isActive }) => `
          flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
          transition-all duration-200 group
          ${isActive
            ? 'bg-[var(--sidebar-item-active)] text-brand-400'
            : 'text-[var(--text-muted)] hover:bg-[var(--sidebar-item-hover)] hover:text-[var(--text-secondary)]'
          }
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="truncate overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </NavLink>
    </Tooltip>
  );
};

const NavSectionLabel = ({ label, collapsed }) => {
  if (collapsed) return <div className="mx-3 my-1 border-t border-[var(--sidebar-border)]" />;
  return (
    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
      {label}
    </p>
  );
};

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 68 : 240 }}
      transition={{ type: 'spring', damping: 25, stiffness: 260 }}
      className="
        hidden lg:flex flex-col h-full shrink-0
        bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
        overflow-hidden relative z-10
      "
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-[var(--sidebar-border)] shrink-0 px-4 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                {APP_NAME}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
        <NavSectionLabel label="Main" collapsed={sidebarCollapsed} />
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} collapsed={sidebarCollapsed} />
        ))}

        <NavSectionLabel label="Tools" collapsed={sidebarCollapsed} />
        {NAV_SECONDARY.map((item) => (
          <NavItem key={item.path} item={item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-3 border-t border-[var(--sidebar-border)] space-y-0.5">
        {NAV_BOTTOM.map((item) => (
          <NavItem key={item.path} item={item} collapsed={sidebarCollapsed} />
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="
          absolute -right-3 top-[72px] z-20
          w-6 h-6 rounded-full
          bg-[var(--surface-secondary)] border border-[var(--border-default)]
          flex items-center justify-center
          text-[var(--text-muted)] hover:text-[var(--text-primary)]
          hover:bg-[var(--glass-bg)] transition-colors shadow-sm
        "
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
