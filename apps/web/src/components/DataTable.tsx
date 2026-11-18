import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyState,
  className = '',
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-border bg-surface ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-surface-elevated/50 text-foreground-muted font-mono uppercase tracking-wider text-[11px]">
            {columns.map((col) => {
              const alignClass =
                col.align === 'right'
                  ? 'text-right'
                  : col.align === 'center'
                  ? 'text-center'
                  : 'text-left';

              return (
                <th
                  key={col.key}
                  scope="col"
                  className={`py-2.5 px-3 font-semibold ${alignClass} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {data.map((item) => {
            const rowKey = keyExtractor(item);
            const clickable = Boolean(onRowClick);

            return (
              <tr
                key={rowKey}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors ${
                  clickable
                    ? 'cursor-pointer hover:bg-surface-hover/80 active:bg-surface-hover'
                    : 'hover:bg-surface-hover/40'
                }`}
              >
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                  return (
                    <td
                      key={`${rowKey}-${col.key}`}
                      className={`py-3 px-3 align-middle text-foreground ${alignClass} ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(item)
                        : (item as unknown as Record<string, React.ReactNode>)[col.key]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
