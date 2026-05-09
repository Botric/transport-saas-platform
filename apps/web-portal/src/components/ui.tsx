import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  columns, data, isLoading, emptyMessage = 'No records found',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">{emptyMessage}</td></tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.header} className={`px-4 py-3 text-gray-700 ${col.className ?? ''}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface StatusBadgeProps { status: string }
export function StatusBadge({ status }: StatusBadgeProps) {
  const colour = status === 'active' ? 'bg-green-100 text-green-700'
    : status === 'inactive' || status === 'disabled' ? 'bg-gray-100 text-gray-500'
    : status === 'expired' ? 'bg-red-100 text-red-600'
    : 'bg-yellow-100 text-yellow-700';
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colour}`}>{status}</span>;
}
