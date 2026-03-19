'use client'

import { useEffect, useState, useCallback } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
import { useCompanyDetail } from '@/hooks/use-company-detail'
import { formatCurrency, formatCurrencyPrecise, formatMoic, formatDate, moicColorClass, valueColorClass } from '@/lib/format'
import { convertToCHF } from '@/lib/fx'
import { cn } from '@/lib/utils'
import { X, ArrowRight } from 'lucide-react'

interface CompanyDrawerProps {
  companyId: string
  onClose: () => void
}

const typeBadgeColors: Record<string, string> = {
  EQT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CVL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SAFE: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  ADJ: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  DIST: 'bg-green-500/20 text-green-400 border-green-500/30',
  RECAP: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export function CompanyDrawer({ companyId, onClose }: CompanyDrawerProps) {
  const { company, transactions, fxRates, isLoading, error } = useCompanyDetail(companyId)
  const prefersReducedMotion = useReducedMotion()
  const [closing, setClosing] = useState(false)

  const handleClose = useCallback(() => {
    if (prefersReducedMotion) { onClose(); return }
    setClosing(true)
    setTimeout(onClose, 150)
  }, [onClose, prefersReducedMotion])

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn("fixed inset-0 z-40 bg-black/50", !prefersReducedMotion && "animate-overlay-in")}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed right-0 top-0 z-50 h-full w-full sm:w-[480px] bg-background border-l border-border flex flex-col",
        !prefersReducedMotion && (closing ? "animate-slide-out-right" : "animate-slide-in-right")
      )}>
        {/* Header */}
        <div className="sticky top-0 bg-background px-6 py-4 border-b border-border flex items-start justify-between gap-3 z-10">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : company ? (
            <div>
              <h2 className="font-heading text-lg font-bold">{company.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px]">
                  {company.status}
                </Badge>
                {company.sector && (
                  <span className="text-xs text-muted-foreground">{company.sector}</span>
                )}
                {company.investment_currency && (
                  <span className="text-xs text-muted-foreground">{company.investment_currency}</span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Company not found</span>
          )}
          <button
            onClick={handleClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {isLoading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-32 rounded-lg" />
            </div>
          )}

          {company && !isLoading && (
            <>
              {/* KPI tiles */}
              <KpiTiles company={company} fxRates={fxRates} />

              {/* Transaction history */}
              <div>
                <h3 className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-3">
                  Transaction History
                </h3>
                {transactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50">No transactions</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="text-[12px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px] uppercase tracking-wide">Type</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wide">Date</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wide text-right">Amount</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wide text-right">CHF</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((txn) => (
                          <TableRow
                            key={txn.id}
                            className={cn(!txn.is_cash_event && 'opacity-40')}
                          >
                            <TableCell>
                              <Badge variant="outline" className={cn('text-[9px] px-1 py-0', typeBadgeColors[txn.type] || '')}>
                                {txn.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="tabular-nums">{formatDate(txn.date)}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums">
                              {formatCurrencyPrecise(txn.amount_orig, txn.orig_currency)}
                            </TableCell>
                            <TableCell className="text-right font-mono tabular-nums">
                              {txn.fx_rate_orig_to_chf
                                ? formatCurrencyPrecise(txn.amount_orig * txn.fx_rate_orig_to_chf, 'CHF')
                                : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* View full detail link */}
              <Link
                href={`/portfolio/${companyId}`}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                onClick={handleClose}
              >
                View full detail
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function KpiTiles({ company, fxRates }: { company: NonNullable<ReturnType<typeof useCompanyDetail>['company']>; fxRates: Record<string, number> }) {
  const ccy = company.investment_currency || 'CHF'
  const investedCHF = ccy === 'CHF'
    ? company.total_invested
    : company.original_fx_rate
      ? company.total_invested * company.original_fx_rate
      : convertToCHF(company.total_invested, ccy, fxRates)
  const currentValueCHF = convertToCHF(company.current_value, ccy, fxRates)
  const gainLoss = currentValueCHF - investedCHF

  const tiles = [
    {
      label: 'Invested',
      value: formatCurrency(company.total_invested, ccy),
      sub: ccy !== 'CHF' ? formatCurrency(investedCHF, 'CHF') : undefined,
    },
    {
      label: 'Value',
      value: formatCurrency(company.current_value, ccy),
      sub: ccy !== 'CHF' ? formatCurrency(currentValueCHF, 'CHF') : undefined,
    },
    {
      label: 'MOIC',
      value: formatMoic(company.moic),
      className: moicColorClass(company.moic),
    },
    {
      label: 'Gain/Loss',
      value: formatCurrency(gainLoss, 'CHF'),
      className: valueColorClass(gainLoss),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {tiles.map((tile) => (
        <Card key={tile.label}>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{tile.label}</p>
            <p className={cn('font-mono text-[14px] font-semibold tabular-nums mt-1', tile.className || 'text-foreground')}>
              {tile.value}
            </p>
            {tile.sub && (
              <p className="text-[10px] text-muted-foreground tabular-nums">{tile.sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
