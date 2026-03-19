'use client'

import { useState, useMemo, Fragment } from 'react'
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
import { convertToCHF, convertToDisplay } from '@/lib/fx'
import type { DisplayCurrency, PortfolioCompany } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronRight, ChevronDown } from 'lucide-react'
import { PortfolioExpandedRows } from './portfolio-expanded-row'

type SortColumn = 'name' | 'total_invested' | 'current_value' | 'moic' | 'gainLoss' | 'total_shares' | 'latest_share_price'
type SortDirection = 'asc' | 'desc'

const vehicleLabels: Record<string, string> = {
  fiduciary: 'Verve',
  direct: 'Direct',
  fund: 'LP Fund',
}

// Column counts: chevron + company + (shares + price if !compact && !liq) + invested + value + g/l + moic
const COL_COUNT_FULL = 8   // chevron, company, shares, price, invested, value, g/l, moic
const COL_COUNT_COMPACT = 6 // chevron, company, invested, value, g/l, moic
const COL_COUNT_LIQ = 3     // chevron, company, invested

function getInvestedCHF(c: PortfolioCompany): number {
  const ccy = c.investment_currency || 'CHF'
  return ccy === 'CHF' ? c.total_invested : c.total_invested * (c.original_fx_rate || 1)
}

interface PortfolioSectionProps {
  title: string
  companies: PortfolioCompany[]
  fxRates: Record<string, number>
  isLiquidation?: boolean
  showHeader?: boolean
  showFooter?: boolean
  onCompanyClick?: (companyId: string) => void
  compactView?: boolean
  displayCurrency?: DisplayCurrency
}

export function PortfolioSection({
  title,
  companies,
  fxRates,
  isLiquidation = false,
  showHeader = true,
  showFooter = true,
  onCompanyClick,
  compactView = false,
  displayCurrency = 'CHF',
}: PortfolioSectionProps) {
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

  const allIds = companies.map(c => c.company_id)
  function expandAll() { setExpandedIds(new Set(allIds)) }
  function collapseAll() { setExpandedIds(new Set()) }

  const sorted = useMemo(() => {
    return [...companies].sort((a, b) => {
      let aVal: string | number | null
      let bVal: string | number | null

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
          aVal = getInvestedCHF(a)
          bVal = getInvestedCHF(b)
          break
        case 'gainLoss':
          aVal = convertToCHF(a.current_value, a.investment_currency, fxRates) - getInvestedCHF(a)
          bVal = convertToCHF(b.current_value, b.investment_currency, fxRates) - getInvestedCHF(b)
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
  }, [companies, sortColumn, sortDirection, fxRates])

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

  const dCcy = displayCurrency
  const colCount = isLiquidation ? COL_COUNT_LIQ : compactView ? COL_COUNT_COMPACT : COL_COUNT_FULL

  // Section totals
  const totalInvestedCHF = sorted.reduce((sum, c) => sum + getInvestedCHF(c), 0)
  const totalValueCHF = sorted.reduce((sum, c) => sum + convertToCHF(c.current_value, c.investment_currency, fxRates), 0)
  const totalMoic = totalInvestedCHF > 0 ? totalValueCHF / totalInvestedCHF : 0
  const totalInvestedD = dCcy === 'CHF' ? totalInvestedCHF : totalInvestedCHF / (fxRates[dCcy] || 1)
  const totalValueD = dCcy === 'CHF' ? totalValueCHF : totalValueCHF / (fxRates[dCcy] || 1)
  const totalGainLossD = totalValueD - totalInvestedD

  if (companies.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <span className="flex items-center">Company <SortIcon col="name" /></span>
              </TableHead>
              {!isLiquidation && !compactView && (
                <>
                  <TableHead className="cursor-pointer select-none hidden xl:table-cell text-right" onClick={() => toggleSort('total_shares')}>
                    <span className="flex items-center justify-end">Shares <SortIcon col="total_shares" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hidden xl:table-cell text-right" onClick={() => toggleSort('latest_share_price')}>
                    <span className="flex items-center justify-end">Price <SortIcon col="latest_share_price" /></span>
                  </TableHead>
                </>
              )}
              <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('total_invested')}>
                <span className="flex items-center justify-end">Invested ({dCcy}) <SortIcon col="total_invested" /></span>
              </TableHead>
              {!isLiquidation && (
                <>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('current_value')}>
                    <span className="flex items-center justify-end">Value ({dCcy}) <SortIcon col="current_value" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('gainLoss')}>
                    <span className="flex items-center justify-end">G/L ({dCcy}) <SortIcon col="gainLoss" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('moic')}>
                    <span className="flex items-center justify-end">MOIC <SortIcon col="moic" /></span>
                  </TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {/* Section header */}
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableCell colSpan={colCount} className="py-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-sm tracking-wide uppercase">
                  {title} ({companies.length})
                </span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <button onClick={expandAll} className="hover:text-foreground transition-colors">
                    Expand All
                  </button>
                  <span>·</span>
                  <button onClick={collapseAll} className="hover:text-foreground transition-colors">
                    Collapse All
                  </button>
                </div>
              </div>
            </TableCell>
          </TableRow>

          {sorted.map((company) => {
            const origCcy = company.investment_currency || 'CHF'
            const showShadow = origCcy !== dCcy

            const investedDisplay = convertToDisplay(company.total_invested, origCcy, fxRates, dCcy)
            const valueDisplay = convertToDisplay(company.current_value, origCcy, fxRates, dCcy)
            const gainLossDisplay = valueDisplay - investedDisplay
            const gainLossOrig = company.current_value - company.total_invested

            const isExpanded = expandedIds.has(company.company_id)
            const isWrittenDown = (company.moic ?? 0) < 0.25 && company.moic !== null

            return (
              <Fragment key={company.company_id}>
                <TableRow className={cn(isWrittenDown && 'bg-red-500/5')}>
                  <TableCell className="w-8 pr-0">
                    <button
                      onClick={() => toggleExpand(company.company_id)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </TableCell>

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

                  {!isLiquidation && !compactView && (
                    <>
                      <TableCell className="text-right font-mono tabular-nums hidden xl:table-cell">
                        {company.total_shares ? company.total_shares.toFixed(2) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums hidden xl:table-cell">
                        {company.latest_share_price ? formatCurrency(company.latest_share_price, origCcy) : '—'}
                      </TableCell>
                    </>
                  )}

                  {/* Invested */}
                  <TableCell className="text-right font-mono tabular-nums">
                    <div>{formatCurrency(investedDisplay, dCcy)}</div>
                    {showShadow && (
                      <div className="text-[10px] text-muted-foreground">{formatCurrency(company.total_invested, origCcy)}</div>
                    )}
                  </TableCell>

                  {!isLiquidation && (
                    <>
                      {/* Value */}
                      <TableCell className="text-right font-mono tabular-nums">
                        <div>{formatCurrency(valueDisplay, dCcy)}</div>
                        {showShadow && (
                          <div className="text-[10px] text-muted-foreground">{formatCurrency(company.current_value, origCcy)}</div>
                        )}
                      </TableCell>

                      {/* G/L */}
                      <TableCell className="text-right font-mono tabular-nums">
                        <div className={valueColorClass(gainLossDisplay)}>
                          {gainLossDisplay >= 0 ? '+' : ''}{formatCurrency(gainLossDisplay, dCcy)}
                        </div>
                        {showShadow && (
                          <div className={cn('text-[10px]', valueColorClass(gainLossOrig))}>
                            {gainLossOrig >= 0 ? '+' : ''}{formatCurrency(gainLossOrig, origCcy)}
                          </div>
                        )}
                      </TableCell>

                      {/* MOIC — single line */}
                      <TableCell className="text-right font-mono tabular-nums">
                        <div className={cn('font-medium', moicColorClass(company.moic))}>
                          {formatMoic(company.moic)}
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>

                {isExpanded && (
                  <PortfolioExpandedRows
                    companyId={company.company_id}
                    colSpan={colCount}
                    onViewDetail={onCompanyClick}
                  />
                )}
              </Fragment>
            )
          })}
        </TableBody>
        {showFooter && !isLiquidation && (
          <TableFooter className="border-t-2 border-border">
            <TableRow className="font-semibold">
              <TableCell />
              <TableCell>Total</TableCell>
              {!compactView && <TableCell className="hidden xl:table-cell" />}
              {!compactView && <TableCell className="hidden xl:table-cell" />}
              <TableCell className="text-right font-mono tabular-nums">{formatCurrency(totalInvestedD, dCcy)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{formatCurrency(totalValueD, dCcy)}</TableCell>
              <TableCell className={cn('text-right font-mono tabular-nums', valueColorClass(totalGainLossD))}>
                {totalGainLossD >= 0 ? '+' : ''}{formatCurrency(totalGainLossD, dCcy)}
              </TableCell>
              <TableCell className={cn('text-right font-mono tabular-nums', moicColorClass(totalMoic))}>
                {formatMoic(totalMoic)}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  )
}
