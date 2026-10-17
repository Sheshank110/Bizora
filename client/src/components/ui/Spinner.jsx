const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
  xl: 'w-14 h-14 border-4',
};

const variants = {
  primary: 'border-brand-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  neutral: 'border-neutral-400 border-t-transparent',
};

export const Spinner = ({ size = 'md', variant = 'primary', className = '' }) => {
  const sizeClass = sizes[size] || sizes.md;
  const variantClass = variants[variant] || variants.primary;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full animate-spin ${sizeClass} ${variantClass} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
