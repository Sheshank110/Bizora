import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Geometric Bizora Emblem SVG Path
 * Exact vector geometry of the brand mark, rendered in pure monochrome.
 */
export const LogoIcon = ({ className = 'w-6 h-6' }) => {
  return (
    <div className="inline-flex items-center justify-center shrink-0">
      <svg
        viewBox="75 55 500 280"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Floating Dot */}
        <circle cx="133.5" cy="118.5" r="44" />
        {/* 3/4 Circle with Top-Left Cutout */}
        <path d="M 202 72 A 125 125 0 1 1 91.5 185 L 202 185 Z" />
        {/* Right Sail */}
        <path d="M 366 301 L 366 103 Q 366 74, 395 74 Q 405 74, 412 84 L 556 312 Q 562 321, 550 321 L 386 321 Q 366 321, 366 301 Z" />
      </svg>
    </div>
  );
};

const SIZES = {
  xs: {
    icon: 'w-4 h-4',
    text: 'text-xs tracking-[0.14em]',
    gap: 'gap-2',
  },
  sm: {
    icon: 'w-5 h-5',
    text: 'text-sm tracking-[0.16em]',
    gap: 'gap-2',
  },
  md: {
    icon: 'w-6 h-6',
    text: 'text-base tracking-[0.18em]',
    gap: 'gap-2.5',
  },
  lg: {
    icon: 'w-8 h-8',
    text: 'text-xl tracking-[0.2em]',
    gap: 'gap-3',
  },
  xl: {
    icon: 'w-10 h-10',
    text: 'text-2xl tracking-[0.22em]',
    gap: 'gap-3.5',
  },
};

const Logo = ({
  variant = 'horizontal',
  size = 'md',
  showText = true,
  to,
  className = '',
  iconClassName = '',
  textClassName = '',
}) => {
  const sizeConfig = SIZES[size] || SIZES.md;
  const isStacked = variant === 'stacked';
  const isIconOnly = variant === 'icon' || !showText;

  const content = (
    <div
      className={`inline-flex items-center ${
        isStacked ? 'flex-col justify-center text-center gap-2' : `flex-row ${sizeConfig.gap}`
      } ${className}`}
    >
      <LogoIcon
        className={`${iconClassName || sizeConfig.icon} text-[var(--text-primary)]`}
      />

      {!isIconOnly && (
        <span
          className={`font-bold uppercase tracking-wider text-[var(--text-primary)] select-none leading-none ${
            textClassName || sizeConfig.text
          }`}
        >
          BIZORA
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
