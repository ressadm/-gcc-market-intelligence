'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatMoic, formatDate, moicColorClass } from '@/lib/format'
import { convertToCHF } from '@/lib/fx'
import type { PortfolioCompany } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

type SortColumn = 'name' | 'status' | 'sector' | 'vehicle' | 'investment_currency' | 'total_invested' | 'current_value' | 'moic' | 'latest_valuation_date' | 'is_stale'
type SortDirection = 'asc' | 'desc'

interface PortfolioTableProps {
  companies: PortfolioCompany[]
  fxRates: Record<string, number>
  isLoading?: boolean
  search: string
  vehicleFilter: string
  statusFilter: string
}

const vehicleLabels: Record<string, string> = {
  fiduciary: 'Verve',
  direct: 'Direct',
  fund: 'LP Fund',
}

export function PortfolioTable({
  companies,
  fxRates,
  isLoading,
  search,
  vehicleFilter,
  statusFilter,
}: PortfolioTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('moic')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filtered = useMemo(() => {
    let result = companies

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q))
    }

    if (vehicleFilter !== 'All') {
      result = result.filter(c => c.vehicle === vehicleFilter)
    }

    if (statusFilter !== 'All') {
      result = result.filter(c => c.status === statusFilter)
    }

    return result
  }, [companies, search, vehicleFilter, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number | boolean | null
      let bVal: string | number | boolean | null

      switch (sortColumn) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'current_value':
          aVal = convertToCHF(a.current_value, a.investment_currency, fxRates)
          bVal = convertToCHF(b.current_value, b.investment_currency, fxRates)
          break
        case 'total_invested':
          aVal = convertToCHF(a.total_invested, a.investment_currency, fxRates)
          bVal = convertToCHF(b.total_invested, b.investment_currency, fxRates)
          break
        default:
          aVal = a[sortColumn] ?? ''
          bVal = b[sortColumn] ?? ''
      }

      if (aVal === bVal) return 0
      if (aVal === null || aVal === '') return 1
      if (bVal === null || bVal === '') return -1

      const cmp = aVal < bVal ? -1 : 1
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortColumn, sortDirection, fxRates])

  function toggleSort(col: SortColumn) {
    if (sortColumn === col) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDirection('desc')
    }
  }

  function SortIcon({ col }: { col: SortColumn }) {
    if (sortColumn !== col) return <ArrowUpDown size={14} className="ml-1 text-muted-foreground/40" />
    return sortDirection === 'asc'
      ? <ArrowUp size={14} className="ml-1 text-primary" />
      : <ArrowDown size={14} className="ml-1 text-primary" />
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No companies match your filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
              <span className="flex items-center">Company <SortIcon col="name" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('status')}>
              <span className="flex items-center">Status <SortIcon col="status" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('sector')}>
              <span className="flex items-center">Sector <SortIcon col="sector" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('vehicle')}>
              <span className="flex items-center">Type <SortIcon col="vehicle" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('investment_currency')}>
              <span className="flex items-center">Ccy <SortIcon col="investment_currency" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('total_invested')}>
              <span className="flex items-center justify-end">Invested <SortIcon col="total_invested" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('current_value')}>
              <span className="flex items-center justify-end">Value <SortIcon col="current_value" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('moic')}>
              <span className="flex items-center justify-end">MOIC <SortIcon col="moic" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('latest_valuation_date')}>
              <span className="flex items-center">Last Valued <SortIcon col="latest_valuation_date" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none hidden lg:table-cell text-center" onClick={() => toggleSort('is_stale')}>
              <span className="flex items-center justify-center">Stale <SortIcon col="is_stale" /></span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((company) => {
            const isWrittenDown = (company.moic ?? 0) < 0.25 && company.moic !== null
            return (
              <TableRow
                key={company.company_id}
                className={cn(isWrittenDown && 'bg-red-500/5')}
              >
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>
                  <Badge variant={company.status === 'Active' ? 'default' : 'secondary'}>
                    {company.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  {company.sector || '—'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">
                    {vehicleLabels[company.vehicle || ''] || company.vehicle || '—'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {company.investment_currency}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(company.total_invested, company.investment_currency || 'CHF')}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(
                    convertToCHF(company.current_value, company.investment_currency, fxRates)
                  )}
                </TableCell>
                <TableCell className={cn('text-right tabular-nums font-medium', moicColorClass(company.moic))}>
                  {formatMoic(company.moic)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatDate(company.latest_valuation_date)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center">
                  {company.is_stale && (
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" title="Stale valuation" />
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
