'use client'

import { useCompanyDetail } from '@/hooks/use-company-detail'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency, formatCurrencyPrecise, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface PortfolioExpandedRowProps {
  companyId: string
  colSpan: number
  onViewDetail?: (companyId: string) => void
}

const typeBadgeColors: Record<string, string> = {
  EQT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CVL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SAFE: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  ADJ: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  DIST: 'bg-green-500/20 text-green-400 border-green-500/30',
  RECAP: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export function PortfolioExpandedRows({ companyId, colSpan, onViewDetail }: PortfolioExpandedRowProps) {
  const { company, transactions, isLoading, error } = useCompanyDetail(companyId)

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

  const ccy = company.investment_currency || 'CHF'

  // Blended FX: SUM(chf) / SUM(orig) for cash-only transactions
  const cashTxns = transactions.filter(t => t.is_cash_event)
  const sumOrigCash = cashTxns.reduce((s, t) => s + t.amount_orig, 0)
  const sumChfCash = cashTxns.reduce((s, t) => s + (t.amount_orig * (t.fx_rate_orig_to_chf || 1)), 0)
  const blendedFx = sumOrigCash > 0 ? sumChfCash / sumOrigCash : null
  const roundCount = cashTxns.length

  return (
    <>
      {/* Transaction rows — rendered as sub-rows in the same parent table */}
      {transactions.map((txn) => (
        <TableRow
          key={txn.id}
          className={cn(
            'bg-muted/10 border-border/20',
            !txn.is_cash_event && 'opacity-40'
          )}
        >
          {/* Empty chevron cell */}
          <TableCell className="w-8" />

          {/* Round name + type badge (under Company column) */}
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

          {/* Empty Status */}
          <TableCell />
          {/* Empty Type */}
          <TableCell className="hidden lg:table-cell" />
          {/* Empty Ccy */}
          <TableCell className="hidden md:table-cell" />

          {/* Shares (under parent Shares column) */}
          <TableCell className="text-right font-mono tabular-nums text-[12px] hidden xl:table-cell">
            {txn.shares ? txn.shares.toFixed(2) : '—'}
          </TableCell>
          {/* Price per share (under parent Price column) */}
          <TableCell className="text-right font-mono tabular-nums text-[12px] hidden xl:table-cell">
            {txn.price_per_share_orig
              ? formatCurrencyPrecise(txn.price_per_share_orig, ccy)
              : '—'}
          </TableCell>

          {/* Amount orig (under parent Invested column) */}
          <TableCell className="text-right font-mono tabular-nums text-[12px]">
            {formatCurrency(txn.amount_orig, ccy)}
          </TableCell>

          {/* Amount CHF (under parent Value column) */}
          <TableCell className="text-right font-mono tabular-nums text-[12px]">
            {txn.fx_rate_orig_to_chf
              ? formatCurrency(txn.amount_orig * txn.fx_rate_orig_to_chf, 'CHF')
              : '—'}
          </TableCell>

          {/* FX rate (under parent G/L column) */}
          <TableCell className="text-right font-mono tabular-nums text-[11px] text-muted-foreground">
            {txn.fx_rate_orig_to_chf && ccy !== 'CHF'
              ? `FX ${txn.fx_rate_orig_to_chf.toFixed(4)}`
              : ''}
          </TableCell>

          {/* Empty MOIC */}
          <TableCell />
        </TableRow>
      ))}

      {/* Summary row */}
      <TableRow className="bg-muted/15 border-border/20">
        <TableCell className="w-8" />
        <TableCell colSpan={6} className="pl-6">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="font-medium">Total (cash only)</span>
            <span className="tabular-nums">{formatCurrency(sumOrigCash, ccy)}</span>
            {ccy !== 'CHF' && (
              <span className="tabular-nums">{formatCurrency(sumChfCash, 'CHF')}</span>
            )}
            {blendedFx && ccy !== 'CHF' && (
              <span className="tabular-nums">Blended FX: {blendedFx.toFixed(4)}</span>
            )}
            <span>{roundCount} round{roundCount !== 1 ? 's' : ''}</span>
          </div>
        </TableCell>
        <TableCell colSpan={4} className="text-right">
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
