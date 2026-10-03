import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCog, FolderKanban, CheckSquare,
  Briefcase, FileText, CreditCard, Receipt, Package, BarChart3,
  Bell, FolderOpen, Activity, Settings, Wallet, Zap, X,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { NAV_ITEMS, NAV_SECONDARY, NAV_BOTTOM, APP_NAME } from '../../constants';

const iconMap = {
  LayoutDashboard, Users, UserCog, FolderKanban, CheckSquare,
  Briefcase, FileText, CreditCard, Receipt, Package, BarChart3,
  Bell, FolderOpen, Activity, Settings, Wallet, Zap,
};

const MobileNavLink = ({ item, onClose }) => {
  const Icon = iconMap[item.icon] || LayoutDashboard;

  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
        ${isActive
          ? 'text-brand-400 bg-[var(--sidebar-item-active)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)]'
        }
      `}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {item.label}
    </NavLink>
  );
};

const MobileSidebar = () => {
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();
  const close = () => setSidebarMobileOpen(false);

  return (
    <AnimatePresence>
      {sidebarMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={close}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="
              fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden
              bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]
              flex flex-col overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--sidebar-border)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                  {APP_NAME}
                </span>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--glass-bg)] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-2">
              <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Main
              </p>
              {NAV_ITEMS.map((item) => (
                <MobileNavLink key={item.path} item={item} onClose={close} />
              ))}
              <p className="px-4 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Tools
              </p>
              {NAV_SECONDARY.map((item) => (
                <MobileNavLink key={item.path} item={item} onClose={close} />
              ))}
            </nav>

            {/* Bottom */}
            <div className="border-t border-[var(--sidebar-border)] py-2">
              {NAV_BOTTOM.map((item) => (
                <MobileNavLink key={item.path} item={item} onClose={close} />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
