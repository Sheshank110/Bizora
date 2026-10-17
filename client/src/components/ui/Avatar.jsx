import { IconUser } from '@tabler/icons-react';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
  xl: 'w-14 h-14 text-base',
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
          rounded-full object-cover
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
          bg-[var(--surface-secondary)] text-[var(--text-primary)] font-medium
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
        bg-[var(--surface-secondary)] text-[var(--text-muted)]
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      <IconUser size={16} stroke={1.75} />
    </div>
  );
};

export default Avatar;
