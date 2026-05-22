import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItem } from '@/animations/variants'

interface Column<T> {
  key: keyof T | string
  header: string
  width?: string
  render?: (row: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  className?: string
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  rowKey?: keyof T
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  className,
  loading,
  emptyMessage = 'No data available',
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  const alignMap = { left: 'text-left', center: 'text-center', right: 'text-right' }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-2xl',
        'border border-[rgba(200,169,91,0.15)]',
        'bg-[rgba(15,23,42,0.6)] backdrop-blur-xl',
        className
      )}
    >
      {/* Table wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-[rgba(200,169,91,0.1)]">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-6 py-4 text-xs font-semibold uppercase tracking-widest',
                    'text-[#94A3B8]',
                    col.width && `w-[${col.width}]`,
                    alignMap[col.align ?? 'left']
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[rgba(200,169,91,0.05)]">
                  {columns.map((_, ci) => (
                    <td key={ci} className="px-6 py-4">
                      <div className="h-4 rounded bg-gradient-to-r from-[rgba(15,23,42,0.8)] via-[rgba(27,60,115,0.3)] to-[rgba(15,23,42,0.8)] animate-shimmer bg-[length:200%_100%]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-[#94A3B8] text-sm"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl opacity-30">◈</span>
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <motion.tr
                  key={rowKey ? String(row[rowKey]) : rowIndex}
                  variants={staggerItem}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-[rgba(200,169,91,0.05)]',
                    'transition-colors duration-200',
                    'hover:bg-[rgba(200,169,91,0.04)]',
                    onRowClick && 'cursor-pointer',
                    rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-[rgba(15,23,42,0.2)]'
                  )}
                >
                  {columns.map((col, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        'px-6 py-4 text-sm text-[#F8FAFC]',
                        alignMap[col.align ?? 'left']
                      )}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : String(row[col.key as keyof T] ?? '—')}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  )
}
