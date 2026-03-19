'use client'

import { useCompanyDetail } from '@/hooks/use-company-detail'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency, formatCurrencyPrecise, formatDate, formatMoic, moicColorClass, valueColorClass } from '@/lib/format'
import { convertToDisplay } from '@/lib/fx'
import type { DisplayCurrency, Transaction } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface PortfolioExpandedRowProps {
  companyId: string
  colSpan: number
  onViewDetail?: (companyId: string) => void
  displayCurrency?: DisplayCurrency
  compactView?: boolean
}

const typeBadgeColors: Record<string, string> = {
  EQT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CVL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SAFE: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  ADJ: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  DIST: 'bg-green-500/20 text-green-400 border-green-500/30',
  RECAP: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

// Transaction types that have a computable tranche value (shares × price)
const EQUITY_TYPES = new Set(['EQT', 'CVL', 'SAFE'])
// Distribution types — value = the distribution amount itself
const DIST_TYPES = new Set(['DIST', 'EXIT'])

export function PortfolioExpandedRows({
  companyId,
  colSpan,
  onViewDetail,
  displayCurrency = 'CHF',
  compactView = false,
}: PortfolioExpandedRowProps) {
  const { company, transactions, fxRates, isLoading, error } = useCompanyDetail(companyId)

  if (isLoading) {
    return (
      <TableRow className="bg-muted/10">
        <TableCell colSpan={colSpan} className="py-3 pl-12">
          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </TableCell>
      </TableRow>
    )
  }

  if (error) {
    return (
      <TableRow className="bg-muted/10">
        <TableCell colSpan={colSpan} className="py-3 pl-12 text-sm text-destructive">
          {error}
        </TableCell>
      </TableRow>
    )
  }

  if (!company || transactions.length === 0) {
    return (
      <TableRow className="bg-muted/10">
        <TableCell colSpan={colSpan} className="py-3 pl-12 text-sm text-muted-foreground/50">
          No transactions recorded
        </TableCell>
      </TableRow>
    )
  }

  const origCcy = company.investment_currency || 'CHF'
  const dCcy = displayCurrency
  const showShadow = origCcy !== dCcy
  const latestPrice = company.latest_share_price // in original currency

  // Compute tranche value for a transaction (in original currency)
  function getTranchValueOrig(txn: Transaction): number | null {
    if (EQUITY_TYPES.has(txn.type) && txn.shares && latestPrice) {
      return txn.shares * latestPrice
    }
    if (DIST_TYPES.has(txn.type)) {
      return txn.amount_orig // distribution value = the amount itself
    }
    return null // ADJ, RECAP — no meaningful value
  }

  // Blended FX: SUM(chf) / SUM(orig) for cash-only transactions
  const cashTxns = transactions.filter(t => t.is_cash_event)
  const sumOrigCash = cashTxns.reduce((s, t) => s + t.amount_orig, 0)
  const sumChfCash = cashTxns.reduce((s, t) => s + (t.amount_orig * (t.fx_rate_orig_to_chf || 1)), 0)
  const blendedFx = sumOrigCash > 0 ? sumChfCash / sumOrigCash : null
  const roundCount = cashTxns.length

  // Summary in display currency
  const sumDisplayCash = convertToDisplay(sumOrigCash, origCcy, fxRates, dCcy)

  // Summary value + G/L for cash transactions
  const sumValueOrig = cashTxns.reduce((s, t) => {
    const v = getTranchValueOrig(t)
    return v !== null ? s + v : s
  }, 0)
  const sumValueDisplay = convertToDisplay(sumValueOrig, origCcy, fxRates, dCcy)
  const sumGainLossDisplay = sumValueDisplay - sumDisplayCash
  const sumMoic = sumOrigCash > 0 ? sumValueOrig / sumOrigCash : null

  const leftColSpan = compactView ? 1 : 3

  return (
    <>
      {transactions.map((txn) => {
        const txnAmountDisplay = convertToDisplay(txn.amount_orig, origCcy, fxRates, dCcy)
        const tranchValueOrig = getTranchValueOrig(txn)
        const hasValue = tranchValueOrig !== null
        const tranchValueDisplay = hasValue ? convertToDisplay(tranchValueOrig, origCcy, fxRates, dCcy) : null

        // G/L: value - invested (both in display currency)
        const canShowGL = hasValue && EQUITY_TYPES.has(txn.type)
        const glDisplay = canShowGL ? tranchValueDisplay! - txnAmountDisplay : null
        const glOrig = canShowGL ? tranchValueOrig! - txn.amount_orig : null

        // MOIC: value / invested
        const canShowMoic = canShowGL && txn.amount_orig > 0
        const txnMoic = canShowMoic ? tranchValueOrig! / txn.amount_orig : null

        return (
          <TableRow
            key={txn.id}
            className={cn(
              'bg-muted/10 border-border/20',
              !txn.is_cash_event && 'opacity-40'
            )}
          >
            {/* Chevron — empty */}
            <TableCell className="w-8" />

            {/* Company column: type badge + date + notes */}
            <TableCell className="pl-6 text-[12px]">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-[9px] px-1 py-0 shrink-0', typeBadgeColors[txn.type] || '')}>
                  {txn.type}
                </Badge>
                <span className="text-muted-foreground tabular-nums">{formatDate(txn.date)}</span>
                {txn.notes && (
                  <span className="text-muted-foreground/60 truncate text-[10px]">{txn.notes}</span>
                )}
              </div>
            </TableCell>

            {/* Shares + Price — only in detailed mode */}
            {!compactView && (
              <>
                <TableCell className="text-right font-mono tabular-nums text-[12px] hidden xl:table-cell">
                  {txn.shares ? txn.shares.toFixed(2) : '—'}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-[12px] hidden xl:table-cell">
                  {txn.price_per_share_orig
                    ? formatCurrencyPrecise(txn.price_per_share_orig, origCcy)
                    : '—'}
                </TableCell>
              </>
            )}

            {/* Invested — dual currency */}
            <TableCell className="text-right font-mono tabular-nums text-[12px]">
              <div>{formatCurrency(txnAmountDisplay, dCcy)}</div>
              {showShadow && (
                <div className="text-[10px] text-muted-foreground">{formatCurrency(txn.amount_orig, origCcy)}</div>
              )}
            </TableCell>

            {/* Value — shares × latest_share_price for equity, amount for DIST */}
            <TableCell className="text-right font-mono tabular-nums text-[12px]">
              {hasValue ? (
                <>
                  <div>{formatCurrency(tranchValueDisplay!, dCcy)}</div>
                  {showShadow && (
                    <div className="text-[10px] text-muted-foreground">{formatCurrency(tranchValueOrig!, origCcy)}</div>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground/40">—</span>
              )}
            </TableCell>

            {/* G/L — value - invested for equity types */}
            <TableCell className="text-right font-mono tabular-nums text-[12px]">
              {glDisplay !== null ? (
                <>
                  <div className={valueColorClass(glDisplay)}>
                    {glDisplay >= 0 ? '+' : ''}{formatCurrency(glDisplay, dCcy)}
                  </div>
                  {showShadow && glOrig !== null && (
                    <div className={cn('text-[10px]', valueColorClass(glOrig))}>
                      {glOrig >= 0 ? '+' : ''}{formatCurrency(glOrig, origCcy)}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground/40">—</span>
              )}
            </TableCell>

            {/* MOIC — value / invested for equity types */}
            <TableCell className="text-right font-mono tabular-nums text-[12px]">
              {txnMoic !== null ? (
                <div className={cn('font-medium', moicColorClass(txnMoic))}>
                  {formatMoic(txnMoic)}
                </div>
              ) : (
                <span className="text-muted-foreground/40">—</span>
              )}
            </TableCell>
          </TableRow>
        )
      })}

      {/* Summary row */}
      <TableRow className="bg-muted/15 border-border/20">
        <TableCell className="w-8" />
        <TableCell colSpan={leftColSpan} className="pl-6">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="font-medium">Total (cash only)</span>
            <span className="tabular-nums">{formatCurrency(sumDisplayCash, dCcy)}</span>
            {showShadow && (
              <span className="tabular-nums">{formatCurrency(sumOrigCash, origCcy)}</span>
            )}
            {blendedFx && origCcy !== 'CHF' && (
              <span className="tabular-nums">Blended FX: {blendedFx.toFixed(4)}</span>
            )}
            <span>{roundCount} round{roundCount !== 1 ? 's' : ''}</span>
          </div>
        </TableCell>
        {/* Invested total */}
        <TableCell className="text-right font-mono tabular-nums text-[11px] text-muted-foreground">
          {formatCurrency(sumDisplayCash, dCcy)}
        </TableCell>
        {/* Value total */}
        <TableCell className="text-right font-mono tabular-nums text-[11px] text-muted-foreground">
          {formatCurrency(sumValueDisplay, dCcy)}
        </TableCell>
        {/* G/L total */}
        <TableCell className={cn('text-right font-mono tabular-nums text-[11px]', valueColorClass(sumGainLossDisplay))}>
          {sumGainLossDisplay >= 0 ? '+' : ''}{formatCurrency(sumGainLossDisplay, dCcy)}
        </TableCell>
        {/* MOIC total */}
        <TableCell className={cn('text-right font-mono tabular-nums text-[11px]', moicColorClass(sumMoic))}>
          {formatMoic(sumMoic)}
        </TableCell>
      </TableRow>

      {/* View full details link */}
      <TableRow className="bg-muted/10 border-border/20">
        <TableCell className="w-8" />
        <TableCell colSpan={colSpan - 1} className="pl-6 py-2">
          <button
            onClick={() => onViewDetail?.(companyId)}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
          >
            View full details
            <ArrowRight size={10} />
          </button>
        </TableCell>
      </TableRow>
    </>
  )
}
