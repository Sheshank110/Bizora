import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`
              absolute z-50 mt-2 min-w-[200px]
              glass-heavy rounded-xl py-1.5
              ${alignClasses[align] || alignClasses.right}
              ${className}
            `}
          >
            {typeof children === 'function'
              ? children({ close: () => setIsOpen(false) })
              : children}
          </motion.div>
        )}
      </AnimatePresence>
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
      w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      ${danger
        ? 'text-rose-500 hover:bg-rose-500/10'
        : 'text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]'
      }
      ${className}
    `}
  >
    {Icon && <Icon className="w-4 h-4 shrink-0" />}
    {children}
  </button>
);

const DropdownSeparator = () => (
  <div className="my-1.5 border-t border-[var(--glass-border)]" />
);

const DropdownLabel = ({ children }) => (
  <div className="px-4 py-1.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
    {children}
  </div>
);

Dropdown.Item = DropdownItem;
Dropdown.Separator = DropdownSeparator;
Dropdown.Label = DropdownLabel;

export default Dropdown;
