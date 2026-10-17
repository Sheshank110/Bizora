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
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { useUIStore } from '../../store/uiStore';
import { NAV_SECTIONS } from '../../constants';
import Tooltip from '../ui/Tooltip';
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

const NavItem = ({ item, collapsed }) => {
  const Icon = iconMap[item.icon] || IconDashboard;

  return (
    <Tooltip content={collapsed ? item.label : null} position="right">
      <NavLink
        to={item.path}
        className={({ isActive }) => `
          flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium
          transition-colors duration-100 group select-none
          ${isActive
            ? 'bg-[#E5E5E5] dark:bg-[#1C1C1E] text-[var(--text-primary)] font-semibold'
            : 'text-[var(--text-secondary)] hover:bg-[#EAEAEA] dark:hover:bg-[#181818] hover:text-[var(--text-primary)]'
          }
          ${collapsed ? 'justify-center px-0' : ''}
        `}
      >
        <Icon className="w-[18px] h-[18px] shrink-0 stroke-[1.75]" />
        {!collapsed && (
          <span className="truncate overflow-hidden whitespace-nowrap text-xs">
            {item.label}
          </span>
        )}
      </NavLink>
    </Tooltip>
  );
};

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={`
        hidden lg:flex flex-col h-full shrink-0
        bg-[var(--sidebar-bg)]
        overflow-hidden select-none border-none
        transition-all duration-200 ease-in-out
        ${sidebarCollapsed ? 'w-[64px]' : 'w-[230px]'}
      `}
    >
      {/* Brand Header */}
      <div className={`flex items-center h-14 shrink-0 px-4 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!sidebarCollapsed ? (
          <Logo variant="horizontal" size="sm" />
        ) : (
          <Logo variant="icon" size="sm" />
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3 scrollbar-hide">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.title || idx} className="space-y-0.5">
            {section.title && !sidebarCollapsed && (
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {section.title}
              </p>
            )}
            {section.title && sidebarCollapsed && (
              <div className="mx-3 my-1.5 h-px bg-[#EFEFEF] dark:bg-[#181818]" />
            )}
            {section.items.map((item) => (
              <NavItem key={item.path} item={item} collapsed={sidebarCollapsed} />
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 flex items-center justify-between">
        {!sidebarCollapsed && (
          <span className="text-[11px] text-[var(--text-muted)]">Collapse</span>
        )}
        <button
          onClick={toggleSidebar}
          className="
            p-1.5 rounded-md
            bg-[var(--surface-elevated)]
            flex items-center justify-center
            text-[var(--text-muted)] hover:text-[var(--text-primary)]
            transition-colors
          "
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <IconChevronRight className="w-3.5 h-3.5 stroke-[1.75]" />
          ) : (
            <IconChevronLeft className="w-3.5 h-3.5 stroke-[1.75]" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
