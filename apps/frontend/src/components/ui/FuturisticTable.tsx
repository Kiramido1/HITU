import React, { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  flexRender,
} from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, Filter, ArrowUpDown, MoreVertical } from 'lucide-react'
import { GlassCard } from './GlassCard'

interface FuturisticTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  paginated?: boolean
  pageSize?: number
  className?: string
}

export function FuturisticTable<TData, TValue>({
  data,
  columns,
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  pageSize = 10,
  className = '',
}: FuturisticTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    getFilteredRowModel: filterable ? getFilteredRowModel() : undefined,
    getPaginationRowModel: paginated ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  })

  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      {/* Header with search */}
      {searchable && (
        <div className="p-4 border-b border-[rgba(200,169,91,0.1)]">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] rounded-lg text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[rgba(200,169,91,0.3)] transition-colors"
              />
            </div>
            {filterable && (
              <button className="p-2 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-[#94A3B8] hover:text-[#C8A95B] hover:border-[rgba(200,169,91,0.3)] transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider border-b border-[rgba(200,169,91,0.1)]"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort() ? 'cursor-pointer hover:text-[#C8A95B] transition-colors' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && header.column.getCanSort() && (
                          <span className="flex flex-col">
                            <ChevronUp className={`w-3 h-3 ${header.column.getIsSorted() === 'asc' ? 'text-[#C8A95B]' : 'text-[#94A3B8]/30'}`} />
                            <ChevronDown className={`w-3 h-3 -mt-1 ${header.column.getIsSorted() === 'desc' ? 'text-[#C8A95B]' : 'text-[#94A3B8]/30'}`} />
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[#94A3B8]">
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-[rgba(200,169,91,0.03)] transition-colors border-b border-[rgba(200,169,91,0.05)] last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-[#F8FAFC]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && (
        <div className="p-4 border-t border-[rgba(200,169,91,0.1)] flex items-center justify-between">
          <div className="text-xs text-[#94A3B8]">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-xs text-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed hover:text-[#C8A95B] hover:border-[rgba(200,169,91,0.3)] transition-colors"
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-xs text-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed hover:text-[#C8A95B] hover:border-[rgba(200,169,91,0.3)] transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-[rgba(200,169,91,0.1)] border border-[rgba(200,169,91,0.2)] text-xs text-[#C8A95B]">
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-xs text-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed hover:text-[#C8A95B] hover:border-[rgba(200,169,91,0.3)] transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-xs text-[#94A3B8] disabled:opacity-50 disabled:cursor-not-allowed hover:text-[#C8A95B] hover:border-[rgba(200,169,91,0.3)] transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
