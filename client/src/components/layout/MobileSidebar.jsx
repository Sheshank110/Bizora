import { NavLink } from 'react-router-dom';
import {
  IconDashboard,
  IconUsers,
  IconUserCheck,
  IconFolder,
  IconCheckbox,
  IconBriefcase,
  IconFileText,
  IconCreditCard,
  IconReceipt,
  IconPackage,
  IconChartBar,
  IconActivity,
  IconSettings,
  IconX,
} from '@tabler/icons-react';
import { useUIStore } from '../../store/uiStore';
import { NAV_SECTIONS } from '../../constants';
import Logo from '../ui/Logo';

const iconMap = {
  LayoutDashboard: IconDashboard,
  Users: IconUsers,
  UserCog: IconUserCheck,
  FolderKanban: IconFolder,
  CheckSquare: IconCheckbox,
  Briefcase: IconBriefcase,
  FileText: IconFileText,
  CreditCard: IconCreditCard,
  Receipt: IconReceipt,
  Package: IconPackage,
  BarChart3: IconChartBar,
  Activity: IconActivity,
  Settings: IconSettings,
};

const MobileNavLink = ({ item, onClose }) => {
  const Icon = iconMap[item.icon] || IconDashboard;

  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors
        ${isActive
          ? 'bg-[#E5E5E5] dark:bg-[#1C1C1E] text-[var(--text-primary)] font-semibold'
          : 'text-[var(--text-secondary)] hover:bg-[#EAEAEA] dark:hover:bg-[#181818] hover:text-[var(--text-primary)]'
        }
      `}
    >
      <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
      {item.label}
    </NavLink>
  );
};

const MobileSidebar = () => {
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();
  const close = () => setSidebarMobileOpen(false);

  if (!sidebarMobileOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        onClick={close}
      />

      {/* Drawer */}
      <div
        className="
          fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden
          bg-[var(--sidebar-bg)]
          flex flex-col overflow-hidden shadow-2xl border-none
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 shrink-0">
          <Logo variant="horizontal" size="sm" />
          <button
            onClick={close}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] transition-colors"
            aria-label="Close menu"
          >
            <IconX className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title || idx} className="space-y-0.5">
              {section.title && (
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <MobileNavLink key={item.path} item={item} onClose={close} />
              ))}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default MobileSidebar;
