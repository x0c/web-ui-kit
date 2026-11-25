import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type Table as TanStackTable,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '../lib/utils'
import { Button } from '../primitives/button'
import { Input } from '../primitives/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../primitives/select'
import { Skeleton } from '../primitives/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../primitives/table'
import { EmptyRow } from './admin-shell'

export type { ColumnDef, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'

export interface DataTableToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  left?: ReactNode
  right?: ReactNode
  className?: string
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  left,
  right,
  className,
}: DataTableToolbarProps) {
  const showSearch = typeof onSearchChange === 'function'
  if (!showSearch && !left && !right) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2.5 border-b border-border px-4 py-3 sm:px-5',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {showSearch && (
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pr-7 pl-8 text-xs"
            />
            {searchValue && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange('')}
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}
        {left}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  )
}

export interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>
  totalRows: number
  pageSizeOptions?: number[]
}

export function DataTablePagination<TData>({
  table,
  totalRows,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = Math.max(1, table.getPageCount())
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(totalRows, (pageIndex + 1) * pageSize)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
      <div className="tabular">
        {totalRows === 0 ? '0 results' : `Showing ${start}–${end} of ${totalRows}`}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              const nextSize = Number(v)
              table.setPageSize(nextSize)
              table.setPageIndex(0)
            }}
          >
            <SelectTrigger size="sm" className="h-7 w-[68px] text-xs tabular">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="tabular">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <ChevronsLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  getRowId?: (row: TData, index: number) => string
  loading?: boolean
  emptyLabel?: string
  emptyIcon?: ReactNode
  // Client or server pagination
  manualPagination?: boolean
  rowCount?: number
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  initialPageSize?: number
  pageSizeOptions?: number[]
  // Search
  searchable?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  // Sorting
  manualSorting?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  // Slots & behavior
  toolbarLeft?: ReactNode
  toolbarRight?: ReactNode
  onRowClick?: (row: TData) => void
  className?: string
}

/**
 * Reusable Flat Monochrome DataTable backed by @tanstack/react-table.
 * Supports uncontrolled client search/sort/pagination as well as controlled server-side pagination.
 */
export function DataTable<TData>({
  columns,
  data,
  getRowId,
  loading = false,
  emptyLabel = 'No matching records.',
  emptyIcon,
  manualPagination = false,
  rowCount,
  pagination: controlledPagination,
  onPaginationChange,
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  searchable = true,
  searchValue: controlledSearch,
  onSearchChange,
  searchPlaceholder = 'Search…',
  manualSorting = false,
  sorting: controlledSorting,
  onSortingChange,
  toolbarLeft,
  toolbarRight,
  onRowClick,
  className,
}: DataTableProps<TData>) {
  'use no memo'
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })
  const [internalSearch, setInternalSearch] = useState('')
  const [internalSorting, setInternalSorting] = useState<SortingState>([])

  const pagination = controlledPagination ?? internalPagination
  const setPagination = onPaginationChange ?? setInternalPagination
  const search = controlledSearch ?? internalSearch
  const setSearch = onSearchChange ?? ((next: string) => {
    setInternalSearch(next)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  })
  const sorting = controlledSorting ?? internalSorting
  const setSorting = onSortingChange ?? setInternalSorting

  const totalServer = rowCount ?? data.length
  const pageCount = manualPagination
    ? Math.max(1, Math.ceil(totalServer / Math.max(1, pagination.pageSize)))
    : undefined

  // TanStack Table v8's instance API is intentionally non-memoizable; DataTable keeps it internal with 'use no memo'.
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      pagination,
      sorting,
      ...(manualPagination ? {} : { globalFilter: search }),
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    ...(manualPagination ? {} : { onGlobalFilterChange: setSearch }),
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination ? { manualPagination: true, pageCount, rowCount: totalServer } : { getPaginationRowModel: getPaginationRowModel(), getFilteredRowModel: getFilteredRowModel() }),
    ...(manualSorting ? { manualSorting: true } : { getSortedRowModel: getSortedRowModel() }),
  })

  const resolvedTotal = manualPagination ? totalServer : table.getFilteredRowModel().rows.length
  const rows = table.getRowModel().rows

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}>
      <DataTableToolbar
        searchValue={searchable ? search : undefined}
        onSearchChange={searchable ? setSearch : undefined}
        searchPlaceholder={searchPlaceholder}
        left={toolbarLeft}
        right={toolbarRight}
      />

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading && rows.length === 0 ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <TableRow key={`sk-${idx}`}>
                <TableCell colSpan={columns.length}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                <EmptyRow icon={emptyIcon}>{emptyLabel}</EmptyRow>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination table={table} totalRows={resolvedTotal} pageSizeOptions={pageSizeOptions} />
    </div>
  )
}
