import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  IconSearch,
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
  IconSun,
  IconPlus,
  IconArrowRight,
} from '@tabler/icons-react';
import { ROUTES } from '../../constants';
import { useThemeStore } from '../../store/themeStore';

const COMMAND_ITEMS = [
  // Navigation
  { id: 'dashboard', title: 'Dashboard', category: 'Navigation', icon: IconDashboard, path: ROUTES.DASHBOARD },
  { id: 'customers', title: 'Customers', category: 'Navigation', icon: IconUsers, path: ROUTES.CUSTOMERS },
  { id: 'employees', title: 'Employees', category: 'Navigation', icon: IconUserCheck, path: ROUTES.EMPLOYEES },
  { id: 'projects', title: 'Projects', category: 'Navigation', icon: IconFolder, path: ROUTES.PROJECTS },
  { id: 'tasks', title: 'Tasks & Kanban', category: 'Navigation', icon: IconCheckbox, path: ROUTES.TASKS },
  { id: 'services', title: 'Services Catalog', category: 'Navigation', icon: IconBriefcase, path: ROUTES.SERVICES },
  { id: 'invoices', title: 'Invoices', category: 'Navigation', icon: IconFileText, path: ROUTES.INVOICES },
  { id: 'payments', title: 'Payments Ledger', category: 'Navigation', icon: IconCreditCard, path: ROUTES.PAYMENTS },
  { id: 'expenses', title: 'Expenses & Receipts', category: 'Navigation', icon: IconReceipt, path: ROUTES.EXPENSES },
  { id: 'inventory', title: 'Inventory SKUs', category: 'Navigation', icon: IconPackage, path: ROUTES.INVENTORY },
  { id: 'reports', title: 'Reports & Analytics', category: 'Navigation', icon: IconChartBar, path: ROUTES.REPORTS },
  { id: 'activity', title: 'Workspace Activity', category: 'Navigation', icon: IconActivity, path: ROUTES.ACTIVITY },
  { id: 'settings', title: 'System Settings', category: 'Navigation', icon: IconSettings, path: ROUTES.SETTINGS },

  // Quick Actions
  { id: 'action-invoice', title: 'Create New Invoice', category: 'Actions', icon: IconPlus, path: ROUTES.INVOICES, state: { openNew: true } },
  { id: 'action-project', title: 'Create New Project', category: 'Actions', icon: IconPlus, path: ROUTES.PROJECTS, state: { openNew: true } },
  { id: 'action-customer', title: 'Add Customer', category: 'Actions', icon: IconPlus, path: ROUTES.CUSTOMERS, state: { openNew: true } },
  { id: 'action-theme', title: 'Toggle Theme', category: 'Actions', icon: IconSun, action: 'toggleTheme' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { setTheme } = useThemeStore();

  const filteredItems = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item) => {
    if (!item) return;
    onClose();
    if (item.action === 'toggleTheme') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'light' : 'dark');
    } else if (item.path) {
      navigate(item.path, { state: item.state });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog: Solid surface, subtle shadow, NO container border */}
      <div
        className="
          relative w-full max-w-xl
          bg-[#FFFFFF] dark:bg-[#111111]
          rounded-xl shadow-2xl overflow-hidden border-none
        "
      >
        {/* Input Header */}
        <div className="flex items-center px-4 py-3 gap-3 bg-[#F7F7F7] dark:bg-[#181818]">
          <IconSearch className="w-4 h-4 text-[var(--text-muted)] shrink-0 stroke-[1.75]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, modules, or actions..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-none outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[#EFEFEF] dark:bg-[#1C1C1E] rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-0.5">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No matching results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors
                    ${isSelected
                      ? 'bg-[#E5E5E5] dark:bg-[#1C1C1E] text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-secondary)] hover:bg-[#F7F7F7] dark:hover:bg-[#181818]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      {item.category}
                    </span>
                    {isSelected && <IconArrowRight className="w-3.5 h-3.5 text-[var(--text-primary)] stroke-[2]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#F7F7F7] dark:bg-[#181818] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>Use <kbd className="font-mono bg-[#EFEFEF] dark:bg-[#1C1C1E] px-1 rounded">↑</kbd> <kbd className="font-mono bg-[#EFEFEF] dark:bg-[#1C1C1E] px-1 rounded">↓</kbd> to navigate</span>
          <span><kbd className="font-mono bg-[#EFEFEF] dark:bg-[#1C1C1E] px-1 rounded">↵</kbd> to select</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;
