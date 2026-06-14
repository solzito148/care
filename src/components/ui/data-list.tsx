import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type DataColumn<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type DataListProps<T> = {
  items: T[];
  columns: DataColumn<T>[];
  getRowKey: (item: T) => string;
  className?: string;
};

/**
 * Lista densa: tabla con columnas en desktop (lg+) y cards apiladas en movil.
 * Reduce el espacio vacio de los historiales/listados en pantallas grandes.
 */
export function DataList<T>({ items, columns, getRowKey, className }: DataListProps<T>) {
  return (
    <div className={className}>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn("px-4 py-3 font-semibold", column.headerClassName)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={getRowKey(item)} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 text-slate-700", column.className)}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {items.map((item) => (
          <article
            key={getRowKey(item)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <dl className="space-y-1.5">
              {columns.map((column) => (
                <div key={column.key} className="flex items-start justify-between gap-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {column.header}
                  </dt>
                  <dd className="text-right text-sm text-slate-800">{column.render(item)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
