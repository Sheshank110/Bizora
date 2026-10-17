import { useState, useRef, useEffect } from 'react';

const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 mt-1.5 min-w-[190px]
            bg-[#FFFFFF] dark:bg-[#181818]
            rounded-lg py-1 shadow-xl border-none
            ${alignClasses[align] || alignClasses.right}
            ${className}
          `}
        >
          {typeof children === 'function'
            ? children({ close: () => setIsOpen(false) })
            : children}
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({
  children,
  icon: Icon,
  onClick,
  danger = false,
  disabled = false,
  className = '',
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      ${danger
        ? 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] font-medium'
        : 'text-[var(--text-secondary)] hover:bg-[#F7F7F7] dark:hover:bg-[#222222] hover:text-[var(--text-primary)]'
      }
      ${className}
    `}
  >
    {!children && Icon && <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />}
    <span>{children}</span>
  </button>
);

const DropdownSeparator = () => (
  <div className="my-1 h-px bg-[#EFEFEF] dark:bg-[#222222]" />
);

const DropdownLabel = ({ children }) => (
  <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
    {children}
  </div>
);

Dropdown.Item = DropdownItem;
Dropdown.Separator = DropdownSeparator;
Dropdown.Label = DropdownLabel;

export default Dropdown;
