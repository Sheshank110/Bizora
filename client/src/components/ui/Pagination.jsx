import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  const btnBase =
    'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200';

  return (
    <nav className={`flex items-center gap-1.5 ${className}`} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} text-[var(--text-muted)] hover:bg-[var(--glass-bg)] disabled:opacity-30 disabled:pointer-events-none`}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-[var(--text-muted)] text-sm">
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${btnBase} ${
              page === currentPage
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--glass-bg)]'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} text-[var(--text-muted)] hover:bg-[var(--glass-bg)] disabled:opacity-30 disabled:pointer-events-none`}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
