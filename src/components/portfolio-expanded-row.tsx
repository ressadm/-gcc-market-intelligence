'use client'

import { useCompanyDetail } from '@/hooks/use-company-detail'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency, formatCurrencyPrecise, formatDate } from '@/lib/format'
import { convertToDisplay } from '@/lib/fx'
import type { DisplayCurrency } from '@/lib/types'
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

  // Blended FX: SUM(chf) / SUM(orig) for cash-only transactions
  const cashTxns = transactions.filter(t => t.is_cash_event)
  const sumOrigCash = cashTxns.reduce((s, t) => s + t.amount_orig, 0)
  const sumChfCash = cashTxns.reduce((s, t) => s + (t.amount_orig * (t.fx_rate_orig_to_chf || 1)), 0)
  const blendedFx = sumOrigCash > 0 ? sumChfCash / sumOrigCash : null
  const roundCount = cashTxns.length

  // Summary in display currency
  const sumDisplayCash = convertToDisplay(sumOrigCash, origCcy, fxRates, dCcy)

  // Columns: Chevron | Company | (Shares | Price if !compact) | Invested | Value | G/L | MOIC
  // = 8 full, 6 compact. Summary row splits: left portion + right portion
  const leftColSpan = compactView ? 1 : 3 // company + (shares + price if full)
  const rightColSpan = compactView ? 3 : 3 // value + g/l + moic

  return (
    <>
      {/* Transaction rows */}
      {transactions.map((txn) => {
        const txnAmountDisplay = convertToDisplay(txn.amount_orig, origCcy, fxRates, dCcy)

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

            {/* Company column: round name + type badge + date */}
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

            {/* Shares + Price — only in detailed (non-compact) mode */}
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

            {/* Invested — dual currency: display ccy line 1, original line 2 */}
            <TableCell className="text-right font-mono tabular-nums text-[12px]">
              <div>{formatCurrency(txnAmountDisplay, dCcy)}</div>
              {showShadow && (
                <div className="text-[10px] text-muted-foreground">{formatCurrency(txn.amount_orig, origCcy)}</div>
              )}
            </TableCell>

            {/* Value — transactions don't have current value */}
            <TableCell className="text-right font-mono tabular-nums text-[12px] text-muted-foreground/40">
              —
            </TableCell>

            {/* G/L — show FX rate as useful context */}
            <TableCell className="text-right font-mono tabular-nums text-[11px] text-muted-foreground">
              {txn.fx_rate_orig_to_chf && origCcy !== 'CHF'
                ? `FX ${txn.fx_rate_orig_to_chf.toFixed(4)}`
                : ''}
            </TableCell>

            {/* MOIC — empty for transactions */}
            <TableCell />
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
        <TableCell colSpan={rightColSpan} className="text-right">
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
