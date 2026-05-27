'use client'

import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export interface Column<T = Record<string, unknown>> {
  key: string
  header: string
  render?: (value: unknown, row: T) => ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: Column<T>[]
  rows: T[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onRowClick,
  emptyMessage = 'No data available.',
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-border', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-border bg-bg-elevated">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-text-muted',
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-border/60 bg-bg-card transition-colors last:border-0',
                    onRowClick &&
                      'cursor-pointer hover:bg-bg-elevated'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3 text-text-primary', col.className)}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
