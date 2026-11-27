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

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  onClear?: () => void
  placeholder?: string
  clearLabel?: string
  className?: string
}

/** Compact toolbar search input (h-8, leading icon, clear button, Enter submit). */
export function SearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search…',
  clearLabel = 'Clear search',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full sm:w-64', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) {
            e.preventDefault()
            onSubmit()
          }
        }}
        placeholder={placeholder}
        className="h-8 pr-8 pl-8 text-xs"
      />
      {value && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => {
            onChange('')
            onClear?.()
          }}
          className="absolute top-1/2 right-1 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-sm text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export interface FilterSelectOption {
  value: string
  label: ReactNode
}

export interface FilterSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: FilterSelectOption[]
  placeholder?: string
  ariaLabel?: string
  className?: string
}

/** Toolbar-aligned select filter (h-8, content-fitting on desktop, full width on mobile). */
export function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className={cn('h-8 w-full text-xs sm:w-auto sm:min-w-[124px] sm:max-w-[240px]', className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export interface FilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  onSearchClear?: () => void
  searchPlaceholder?: string
  searchClearLabel?: string
  searchInputClassName?: string
  left?: ReactNode
  right?: ReactNode
  className?: string
}

/** Unified two-zone list filter toolbar keeping every inline input, select, and button at h-8 with gap-2. */
export function FilterBar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  searchPlaceholder = 'Search…',
  searchClearLabel = 'Clear search',
  searchInputClassName,
  left,
  right,
  className,
}: FilterBarProps) {
  const showSearch = typeof onSearchChange === 'function'
  if (!showSearch && !left && !right) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2.5 [&_[data-slot=button]]:h-8 [&_[data-slot=input]]:h-8 [&_[data-slot=input]]:text-xs [&_[data-slot=select-trigger]]:h-8 [&_[data-slot=select-trigger]]:text-xs',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {showSearch && (
          <SearchInput
            value={searchValue ?? ''}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            onClear={onSearchClear}
            placeholder={searchPlaceholder}
            clearLabel={searchClearLabel}
            className={searchInputClassName}
          />
        )}
        {left}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  )
}

export type DataTableToolbarProps = FilterBarProps

export function DataTableToolbar({ className, ...props }: DataTableToolbarProps) {
  return <FilterBar {...props} className={cn('border-b border-border px-4 py-3 sm:px-5', className)} />
}

export interface DataTablePaginationLabels {
  emptyResults?: string
  showing?: (start: number, end: number, total: number) => string
  rowsPerPage?: string
  pageOf?: (page: number, pageCount: number) => string
  firstPage?: string
  previousPage?: string
  nextPage?: string
  lastPage?: string
}

export interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>
  totalRows: number
  loading?: boolean
  pageSizeOptions?: number[]
  labels?: DataTablePaginationLabels
}

export function DataTablePagination<TData>({
  table,
  totalRows,
  loading = false,
  pageSizeOptions = [10, 20, 50, 100],
  labels,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = Math.max(1, table.getPageCount())
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(totalRows, (pageIndex + 1) * pageSize)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
      <div className="whitespace-nowrap tabular">
        {loading ? (
          <Skeleton className="h-3.5 w-24" />
        ) : totalRows === 0 ? (
          (labels?.emptyResults ?? '0 results')
        ) : labels?.showing ? (
          labels.showing(start, end, totalRows)
        ) : (
          `Showing ${start}–${end} of ${totalRows}`
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">{labels?.rowsPerPage ?? 'Rows'}</span>
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
        <span className="whitespace-nowrap tabular">
          {labels?.pageOf ? labels.pageOf(pageIndex + 1, pageCount) : `Page ${pageIndex + 1} of ${pageCount}`}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label={labels?.firstPage ?? 'First page'}
          >
            <ChevronsLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label={labels?.previousPage ?? 'Previous page'}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label={labels?.nextPage ?? 'Next page'}
          >
            <ChevronRight />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label={labels?.lastPage ?? 'Last page'}
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
  manualFiltering?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  onSearchClear?: () => void
  searchPlaceholder?: string
  searchClearLabel?: string
  searchInputClassName?: string
  // Sorting
  manualSorting?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  // Slots & behavior
  paginationLabels?: DataTablePaginationLabels
  skeletonRows?: number
  toolbarLeft?: ReactNode
  toolbarRight?: ReactNode
  onRowClick?: (row: TData) => void
  className?: string
}

const CELL_SKELETON_WIDTHS = ['w-24', 'w-32', 'w-20', 'w-16', 'w-28', 'w-14'] as const

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
  manualFiltering = false,
  searchValue: controlledSearch,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  searchPlaceholder = 'Search…',
  searchClearLabel = 'Clear search',
  searchInputClassName,
  manualSorting = false,
  sorting: controlledSorting,
  onSortingChange,
  paginationLabels,
  skeletonRows = 5,
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
  const skipClientFilter = manualPagination || manualFiltering
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
      ...(skipClientFilter ? {} : { globalFilter: search }),
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    ...(skipClientFilter ? {} : { onGlobalFilterChange: setSearch }),
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination
      ? { manualPagination: true, pageCount, rowCount: totalServer }
      : skipClientFilter
        ? { getPaginationRowModel: getPaginationRowModel() }
        : { getPaginationRowModel: getPaginationRowModel(), getFilteredRowModel: getFilteredRowModel() }),
    ...(manualSorting ? { manualSorting: true } : { getSortedRowModel: getSortedRowModel() }),
  })

  const resolvedTotal = manualPagination ? totalServer : table.getFilteredRowModel().rows.length
  const rows = table.getRowModel().rows

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}>
      <DataTableToolbar
        searchValue={searchable ? search : undefined}
        onSearchChange={searchable ? setSearch : undefined}
        onSearchSubmit={onSearchSubmit}
        onSearchClear={onSearchClear}
        searchPlaceholder={searchPlaceholder}
        searchClearLabel={searchClearLabel}
        searchInputClassName={searchInputClassName}
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
        <TableBody
          aria-busy={loading || undefined}
          className={cn(loading && rows.length > 0 && 'opacity-60 transition-opacity duration-150')}
        >
          {loading && rows.length === 0 ? (
            Array.from({ length: skeletonRows }).map((_, idx) => (
              <TableRow key={`sk-${idx}`} aria-hidden="true" className="hover:bg-transparent">
                {table.getVisibleLeafColumns().map((col, colIdx) => (
                  <TableCell key={col.id}>
                    <Skeleton
                      className={cn(
                        'h-4',
                        CELL_SKELETON_WIDTHS[(idx + colIdx) % CELL_SKELETON_WIDTHS.length],
                      )}
                    />
                  </TableCell>
                ))}
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
              <TableCell colSpan={Math.max(1, table.getVisibleLeafColumns().length)} className="p-0">
                <EmptyRow icon={emptyIcon}>{emptyLabel}</EmptyRow>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination
        table={table}
        totalRows={resolvedTotal}
        loading={loading && rows.length === 0}
        pageSizeOptions={pageSizeOptions}
        labels={paginationLabels}
      />
    </div>
  )
}
