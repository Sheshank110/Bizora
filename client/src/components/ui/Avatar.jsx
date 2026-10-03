import { User } from 'lucide-react';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
  ...props
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`
          rounded-full object-cover ring-2 ring-[var(--glass-border)]
          ${sizes[size] || sizes.md}
          ${className}
        `}
        {...props}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`
          inline-flex items-center justify-center rounded-full
          bg-brand-600/20 text-brand-400 font-semibold
          ring-2 ring-[var(--glass-border)]
          ${sizes[size] || sizes.md}
          ${className}
        `}
        title={name}
        {...props}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full
        bg-[var(--glass-bg)] text-[var(--text-muted)]
        ring-2 ring-[var(--glass-border)]
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      <User className="w-1/2 h-1/2" />
    </div>
  );
};

export default Avatar;
