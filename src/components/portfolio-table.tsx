'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatMoic, moicColorClass, valueColorClass } from '@/lib/format'
import { convertToCHF } from '@/lib/fx'
import type { PortfolioCompany } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

type SortColumn = 'name' | 'status' | 'sector' | 'vehicle' | 'investment_currency' | 'total_invested' | 'current_value' | 'moic' | 'gainLoss' | 'latest_valuation_date' | 'is_stale'
type SortDirection = 'asc' | 'desc'

interface PortfolioTableProps {
  companies: PortfolioCompany[]
  fxRates: Record<string, number>
  isLoading?: boolean
  search: string
  vehicleFilter: string
  statusFilter: string
  onCompanyClick?: (companyId: string) => void
}

const vehicleLabels: Record<string, string> = {
  fiduciary: 'Verve',
  direct: 'Direct',
  fund: 'LP Fund',
}

function getGainLossCHF(c: PortfolioCompany, fxRates: Record<string, number>): number {
  const ccy = c.investment_currency || 'CHF'
  const investedCHF = ccy === 'CHF' ? c.total_invested : c.total_invested * (c.original_fx_rate || 1)
  const valueCHF = convertToCHF(c.current_value, ccy, fxRates)
  return valueCHF - investedCHF
}

export function PortfolioTable({
  companies,
  fxRates,
  isLoading,
  search,
  vehicleFilter,
  statusFilter,
  onCompanyClick,
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
        case 'total_invested': {
          const aCcy = a.investment_currency || 'CHF'
          const bCcy = b.investment_currency || 'CHF'
          aVal = aCcy === 'CHF' ? a.total_invested : a.total_invested * (a.original_fx_rate || 1)
          bVal = bCcy === 'CHF' ? b.total_invested : b.total_invested * (b.original_fx_rate || 1)
          break
        }
        case 'gainLoss':
          aVal = getGainLossCHF(a, fxRates)
          bVal = getGainLossCHF(b, fxRates)
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

  // Group by status for section headers (only when no status filter)
  const showSections = statusFilter === 'All'
  const groups = showSections
    ? groupByStatus(sorted)
    : [{ status: '', companies: sorted }]

  // Totals — invested uses historical FX, value uses live FX
  const totalInvestedCHF = sorted.reduce((sum, c) => {
    const ccy = c.investment_currency || 'CHF'
    return sum + (ccy === 'CHF' ? c.total_invested : c.total_invested * (c.original_fx_rate || 1))
  }, 0)
  const totalValueCHF = sorted.reduce((sum, c) => sum + convertToCHF(c.current_value, c.investment_currency, fxRates), 0)
  const totalGainLossCHF = totalValueCHF - totalInvestedCHF
  const totalMoic = totalInvestedCHF > 0 ? totalValueCHF / totalInvestedCHF : 0

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
            <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('gainLoss')}>
              <span className="flex items-center justify-end">G/L <SortIcon col="gainLoss" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('moic')}>
              <span className="flex items-center justify-end">MOIC <SortIcon col="moic" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('latest_valuation_date')}>
              <span className="flex items-center">Last Valued <SortIcon col="latest_valuation_date" /></span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <>
              {showSections && (
                <TableRow key={`section-${group.status}`} className="bg-secondary/50 hover:bg-secondary/50">
                  <TableCell colSpan={9} className="font-heading font-semibold text-sm tracking-wide uppercase py-2">
                    {group.status} ({group.companies.length})
                  </TableCell>
                </TableRow>
              )}
              {group.companies.map((company) => {
                const ccy = company.investment_currency || 'CHF'
                // Invested CHF: use historical FX rate (locked at investment date)
                const investedCHF = ccy === 'CHF'
                  ? company.total_invested
                  : company.total_invested * (company.original_fx_rate || 1)
                // Current value CHF: use live FX rate (recomputed daily)
                const valueCHF = convertToCHF(company.current_value, ccy, fxRates)
                const gainLoss = valueCHF - investedCHF
                const isWrittenDown = (company.moic ?? 0) < 0.25 && company.moic !== null

                return (
                  <TableRow
                    key={company.company_id}
                    className={cn(isWrittenDown && 'bg-red-500/5')}
                  >
                    <TableCell className="font-medium">
                      <button
                        onClick={() => onCompanyClick?.(company.company_id)}
                        className="hover:text-primary transition-colors hover:underline text-left"
                      >
                        {company.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.status === 'Active' ? 'default' : 'secondary'}>
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">
                        {vehicleLabels[company.vehicle || ''] || company.vehicle || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {ccy}
                    </TableCell>
                    {/* Invested: original currency primary, CHF secondary */}
                    <TableCell className="text-right tabular-nums">
                      <div>{formatCurrency(company.total_invested, ccy)}</div>
                      {ccy !== 'CHF' && (
                        <div className="text-xs text-muted-foreground">{formatCurrency(investedCHF)}</div>
                      )}
                    </TableCell>
                    {/* Value: CHF primary, original currency secondary */}
                    <TableCell className="text-right tabular-nums">
                      <div>{formatCurrency(valueCHF)}</div>
                      {ccy !== 'CHF' && (
                        <div className="text-xs text-muted-foreground">{formatCurrency(company.current_value, ccy)}</div>
                      )}
                    </TableCell>
                    {/* Gain/Loss in CHF */}
                    <TableCell className={cn('text-right tabular-nums', valueColorClass(gainLoss))}>
                      {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                    </TableCell>
                    <TableCell className={cn('text-right tabular-nums font-medium', moicColorClass(company.moic))}>
                      {formatMoic(company.moic)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {company.latest_valuation_date
                        ? new Date(company.latest_valuation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                      {company.is_stale && (
                        <span className="inline-block ml-2 h-2 w-2 rounded-full bg-red-500" title="Stale valuation" />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </>
          ))}
        </TableBody>
        <TableFooter className="border-t-2 border-border">
          <TableRow className="font-semibold">
            <TableCell>Total</TableCell>
            <TableCell />
            <TableCell className="hidden lg:table-cell" />
            <TableCell className="hidden md:table-cell" />
            <TableCell className="text-right tabular-nums">
              {formatCurrency(totalInvestedCHF)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCurrency(totalValueCHF)}
            </TableCell>
            <TableCell className={cn('text-right tabular-nums', valueColorClass(totalGainLossCHF))}>
              {totalGainLossCHF >= 0 ? '+' : ''}{formatCurrency(totalGainLossCHF)}
            </TableCell>
            <TableCell className={cn('text-right tabular-nums', moicColorClass(totalMoic))}>
              {formatMoic(totalMoic)}
            </TableCell>
            <TableCell className="hidden lg:table-cell" />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

function groupByStatus(companies: PortfolioCompany[]) {
  const statusOrder = ['Active', 'In Liquidation', 'Written Off', 'Exited']
  const groups = new Map<string, PortfolioCompany[]>()

  for (const c of companies) {
    const s = c.status || 'Unknown'
    if (!groups.has(s)) groups.set(s, [])
    groups.get(s)!.push(c)
  }

  return statusOrder
    .filter(s => groups.has(s))
    .map(s => ({ status: s, companies: groups.get(s)! }))
    .concat(
      Array.from(groups.entries())
        .filter(([s]) => !statusOrder.includes(s))
        .map(([s, companies]) => ({ status: s, companies }))
    )
}
