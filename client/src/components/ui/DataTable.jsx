import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  searchable = false,
  searchPlaceholder = 'Search...',
  onRowClick,
  emptyTitle = 'No data found',
  emptyDescription = 'No records match your criteria.',
  className = '',
}) => {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [search, setSearch] = useState('');

  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  // Filter
  let filtered = data;
  if (searchable && search) {
    const q = search.toLowerCase();
    filtered = data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : '';
        return String(val).toLowerCase().includes(q);
      })
    );
  }

  // Sort
  if (sortCol) {
    const col = columns.find((c) => c.accessor === sortCol);
    if (col) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[col.accessor] ?? '';
        const bVal = b[col.accessor] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
  }

  return (
    <div className={`glass rounded-xl overflow-hidden ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="px-4 py-3 border-b border-[var(--glass-border)]">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--glass-border)]">
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider
                    text-[var(--text-muted)]
                    ${col.sortable !== false ? 'cursor-pointer hover:text-[var(--text-secondary)] select-none' : ''}
                    ${col.className || ''}
                  `}
                  onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable !== false && sortCol === col.accessor && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)]">
            {filtered.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`
                  transition-colors
                  ${onRowClick ? 'cursor-pointer hover:bg-[var(--glass-bg)]' : ''}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.accessor || col.header}
                    className={`px-4 py-3 text-sm text-[var(--text-secondary)] ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  );
};

export default DataTable;
