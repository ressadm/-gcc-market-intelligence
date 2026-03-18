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
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronRight, ChevronDown } from 'lucide-react'
import { PortfolioExpandedRows } from './portfolio-expanded-row'

type SortColumn = 'name' | 'status' | 'sector' | 'vehicle' | 'investment_currency' | 'total_invested' | 'current_value' | 'moic' | 'gainLoss' | 'latest_valuation_date' | 'is_stale' | 'total_shares' | 'latest_share_price'
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

function getGainLossOrig(c: PortfolioCompany): number {
  return c.current_value - c.total_invested
}

function getCHFMoic(c: PortfolioCompany, fxRates: Record<string, number>): number | null {
  const ccy = c.investment_currency || 'CHF'
  const investedCHF = ccy === 'CHF' ? c.total_invested : c.total_invested * (c.original_fx_rate || 1)
  if (investedCHF <= 0) return null
  const valueCHF = convertToCHF(c.current_value, ccy, fxRates)
  return valueCHF / investedCHF
}

const ACTIVE_COL_COUNT = 11

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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function expandAll(ids: string[]) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
  }

  function collapseAll(ids: string[]) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.delete(id))
      return next
    })
  }

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
        case 'total_shares':
          aVal = a.total_shares ?? -1
          bVal = b.total_shares ?? -1
          break
        case 'latest_share_price':
          aVal = a.latest_share_price ?? -1
          bVal = b.latest_share_price ?? -1
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

  const showSections = statusFilter === 'All'
  const groups = showSections ? groupByStatus(sorted) : [{ status: '', companies: sorted }]

  // Totals
  const activeCompanies = sorted.filter(c => c.status === 'Active' || !showSections)
  const totalInvestedCHF = activeCompanies.reduce((sum, c) => {
    const ccy = c.investment_currency || 'CHF'
    return sum + (ccy === 'CHF' ? c.total_invested : c.total_invested * (c.original_fx_rate || 1))
  }, 0)
  const totalValueCHF = activeCompanies.reduce((sum, c) => sum + convertToCHF(c.current_value, c.investment_currency, fxRates), 0)
  const totalGainLossCHF = totalValueCHF - totalInvestedCHF
  const totalMoic = totalInvestedCHF > 0 ? totalValueCHF / totalInvestedCHF : 0

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" /> {/* Chevron */}
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
            <TableHead className="cursor-pointer select-none hidden xl:table-cell text-right" onClick={() => toggleSort('total_shares')}>
              <span className="flex items-center justify-end">Shares <SortIcon col="total_shares" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none hidden xl:table-cell text-right" onClick={() => toggleSort('latest_share_price')}>
              <span className="flex items-center justify-end">Price <SortIcon col="latest_share_price" /></span>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => {
            const groupIds = group.companies.map(c => c.company_id)
            const isLiquidation = group.status === 'In Liquidation' || group.status === 'Written Off'

            return (
              <>
                {showSections && (
                  <TableRow key={`section-${group.status}`} className="bg-secondary/50 hover:bg-secondary/50">
                    <TableCell colSpan={ACTIVE_COL_COUNT} className="py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-semibold text-sm tracking-wide uppercase">
                          {group.status} ({group.companies.length})
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <button onClick={() => expandAll(groupIds)} className="hover:text-foreground transition-colors">
                            Expand All
                          </button>
                          <span>·</span>
                          <button onClick={() => collapseAll(groupIds)} className="hover:text-foreground transition-colors">
                            Collapse All
                          </button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {group.companies.map((company) => {
                  const ccy = company.investment_currency || 'CHF'
                  const investedCHF = ccy === 'CHF'
                    ? company.total_invested
                    : company.total_invested * (company.original_fx_rate || 1)
                  const valueCHF = convertToCHF(company.current_value, ccy, fxRates)
                  const gainLossCHF = valueCHF - investedCHF
                  const gainLossOrig = getGainLossOrig(company)
                  const chfMoic = getCHFMoic(company, fxRates)
                  const isExpanded = expandedIds.has(company.company_id)
                  const isWrittenDown = (company.moic ?? 0) < 0.25 && company.moic !== null

                  return (
                    <>
                      <TableRow
                        key={company.company_id}
                        className={cn(isWrittenDown && 'bg-red-500/5')}
                      >
                        {/* Chevron */}
                        <TableCell className="w-8 pr-0">
                          <button
                            onClick={() => toggleExpand(company.company_id)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </TableCell>

                        {/* Company name + round info */}
                        <TableCell className="font-medium">
                          <button
                            onClick={() => onCompanyClick?.(company.company_id)}
                            className="hover:text-primary transition-colors hover:underline text-left"
                          >
                            {company.name}
                          </button>
                          <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {company.sector || ''}{company.sector && company.vehicle ? ' · ' : ''}{vehicleLabels[company.vehicle || ''] || ''}
                          </div>
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
                        <TableCell className="hidden md:table-cell text-sm">{ccy}</TableCell>

                        {/* Shares + Price (hidden on non-liquidation sections when liquidating) */}
                        {!isLiquidation ? (
                          <>
                            <TableCell className="text-right tabular-nums hidden xl:table-cell">
                              {company.total_shares ? company.total_shares.toFixed(2) : '—'}
                            </TableCell>
                            <TableCell className="text-right tabular-nums hidden xl:table-cell">
                              {company.latest_share_price
                                ? formatCurrency(company.latest_share_price, ccy)
                                : '—'}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="hidden xl:table-cell" />
                            <TableCell className="hidden xl:table-cell" />
                          </>
                        )}

                        {/* Invested */}
                        <TableCell className="text-right tabular-nums">
                          <div>{formatCurrency(company.total_invested, ccy)}</div>
                          {ccy !== 'CHF' && (
                            <div className="text-[10px] text-muted-foreground">{formatCurrency(investedCHF)}</div>
                          )}
                        </TableCell>

                        {/* Value + G/L + MOIC — hide for liquidation */}
                        {!isLiquidation ? (
                          <>
                            <TableCell className="text-right tabular-nums">
                              <div>{formatCurrency(valueCHF)}</div>
                              {ccy !== 'CHF' && (
                                <div className="text-[10px] text-muted-foreground">{formatCurrency(company.current_value, ccy)}</div>
                              )}
                            </TableCell>

                            {/* Dual G/L: CHF primary, orig secondary */}
                            <TableCell className="text-right tabular-nums">
                              <div className={valueColorClass(gainLossCHF)}>
                                {gainLossCHF >= 0 ? '+' : ''}{formatCurrency(gainLossCHF)}
                              </div>
                              {ccy !== 'CHF' && (
                                <div className={cn('text-[10px]', valueColorClass(gainLossOrig))}>
                                  {gainLossOrig >= 0 ? '+' : ''}{formatCurrency(gainLossOrig, ccy)}
                                </div>
                              )}
                            </TableCell>

                            {/* Dual MOIC: CHF primary, orig secondary */}
                            <TableCell className="text-right tabular-nums">
                              <div className={cn('font-medium', moicColorClass(chfMoic))}>
                                {formatMoic(chfMoic)}
                              </div>
                              {ccy !== 'CHF' && company.moic !== null && chfMoic !== company.moic && (
                                <div className={cn('text-[10px]', moicColorClass(company.moic))}>
                                  {formatMoic(company.moic)}
                                </div>
                              )}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                          </>
                        )}
                      </TableRow>

                      {/* Expanded transaction rows — rendered as sub-rows in same table */}
                      {isExpanded && (
                        <PortfolioExpandedRows
                          key={`expanded-${company.company_id}`}
                          companyId={company.company_id}
                          colSpan={ACTIVE_COL_COUNT}
                        />
                      )}
                    </>
                  )
                })}
              </>
            )
          })}
        </TableBody>
        <TableFooter className="border-t-2 border-border">
          <TableRow className="font-semibold">
            <TableCell /> {/* Chevron */}
            <TableCell>Total</TableCell>
            <TableCell />
            <TableCell className="hidden lg:table-cell" />
            <TableCell className="hidden md:table-cell" />
            <TableCell className="hidden xl:table-cell" />
            <TableCell className="hidden xl:table-cell" />
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
