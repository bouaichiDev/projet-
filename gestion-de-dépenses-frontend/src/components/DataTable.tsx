import React from "react";

interface Column<T> {
  header: string;
  accessor?: keyof T | string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  hoverable?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyState,
  onRowClick,
  hoverable = true
}: DataTableProps<T>) {
  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              // Loader Rows
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-5">
                      <div className="h-4 bg-slate-100 rounded-sm w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 px-6">
                  {emptyState || (
                    <div className="text-sm text-slate-400 font-medium">
                      Aucune donnée disponible
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, rIdx) => (
                <tr
                  key={rIdx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors duration-150
                    ${onRowClick ? "cursor-pointer" : ""}
                    ${hoverable ? "hover:bg-slate-50/70" : ""}
                  `}
                >
                  {columns.map((column, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-6 py-4.5 text-sm text-[#1E293B] ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(item, rIdx)
                        : column.accessor
                        ? String(item[column.accessor as keyof T] || "")
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default DataTable;
