import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const origins = {
    top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
    bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } },
  };

  if (!content) return children;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={origins[position]?.initial}
            animate={origins[position]?.animate}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 px-3 py-1.5 text-xs font-medium
              rounded-lg whitespace-nowrap pointer-events-none
              bg-[var(--text-primary)] text-[var(--text-inverse)]
              shadow-lg
              ${positions[position] || positions.top}
              ${className}
            `}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
