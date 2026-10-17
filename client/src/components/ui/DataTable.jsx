import { useState } from 'react';
import { IconChevronUp, IconChevronDown, IconSearch } from '@tabler/icons-react';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  searchable = false,
  searchPlaceholder = 'Search records...',
  onRowClick,
  emptyTitle = 'No records found',
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
    <div className={`w-full overflow-hidden ${className}`}>
      {/* Search Bar: Clean filled input without container borders */}
      {searchable && (
        <div className="pb-3">
          <div className="relative max-w-xs">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none stroke-[1.75]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-[var(--surface-secondary)] border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[#2563EB] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Table: No container borders, clear typography */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] select-none">
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  className={`
                    py-2.5 px-3
                    ${col.sortable !== false ? 'cursor-pointer hover:text-[var(--text-primary)]' : ''}
                    ${col.className || ''}
                  `}
                  onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable !== false && sortCol === col.accessor && (
                      sortDir === 'asc' ? (
                        <IconChevronUp className="w-3.5 h-3.5 text-[#2563EB] stroke-[2]" />
                      ) : (
                        <IconChevronDown className="w-3.5 h-3.5 text-[#2563EB] stroke-[2]" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[var(--text-secondary)]">
            {filtered.map((row, rowIdx) => (
              <tr
                key={row.id || row._id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`
                  transition-colors duration-100
                  ${onRowClick ? 'cursor-pointer' : ''}
                  hover:bg-[var(--surface-secondary)]
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.accessor || col.header}
                    className={`py-3 px-3 text-sm font-normal ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  );
};

export default DataTable;
