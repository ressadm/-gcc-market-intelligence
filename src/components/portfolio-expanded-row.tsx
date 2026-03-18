'use client'

import { useCompanyDetail } from '@/hooks/use-company-detail'
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
import { formatCurrency, formatCurrencyPrecise, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface PortfolioExpandedRowProps {
  companyId: string
  colSpan: number
}

const typeBadgeColors: Record<string, string> = {
  EQT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CVL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SAFE: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  ADJ: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  DIST: 'bg-green-500/20 text-green-400 border-green-500/30',
  RECAP: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export function PortfolioExpandedRow({ companyId, colSpan }: PortfolioExpandedRowProps) {
  const { company, transactions, isLoading, error } = useCompanyDetail(companyId)

  if (isLoading) {
    return (
      <TableRow className="bg-secondary/30">
        <TableCell colSpan={colSpan} className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </TableCell>
      </TableRow>
    )
  }

  if (error) {
    return (
      <TableRow className="bg-secondary/30">
        <TableCell colSpan={colSpan} className="p-4 text-sm text-destructive">
          {error}
        </TableCell>
      </TableRow>
    )
  }

  if (!company || transactions.length === 0) {
    return (
      <TableRow className="bg-secondary/30">
        <TableCell colSpan={colSpan} className="p-4 text-sm text-muted-foreground/50">
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
    <TableRow className="bg-secondary/20 hover:bg-secondary/30">
      <TableCell colSpan={colSpan} className="p-4">
        <div className="overflow-x-auto">
          <Table className="text-[12px]">
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-[10px] uppercase tracking-wide py-1.5">Date</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide py-1.5">Type</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide py-1.5 text-right">Amount ({ccy})</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide py-1.5 text-right">Amount (CHF)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide py-1.5 text-right hidden sm:table-cell">Shares</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide py-1.5 text-right hidden sm:table-cell">Price/{ccy}</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide py-1.5 text-right hidden md:table-cell">FX Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow
                  key={txn.id}
                  className={cn('border-border/30', !txn.is_cash_event && 'opacity-40')}
                >
                  <TableCell className="tabular-nums py-1.5">{formatDate(txn.date)}</TableCell>
                  <TableCell className="py-1.5">
                    <Badge variant="outline" className={cn('text-[9px] px-1 py-0', typeBadgeColors[txn.type] || '')}>
                      {txn.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums py-1.5">
                    {formatCurrencyPrecise(txn.amount_orig, ccy)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums py-1.5">
                    {txn.fx_rate_orig_to_chf
                      ? formatCurrencyPrecise(txn.amount_orig * txn.fx_rate_orig_to_chf, 'CHF')
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums py-1.5 hidden sm:table-cell">
                    {txn.shares ? txn.shares.toFixed(2) : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums py-1.5 hidden sm:table-cell">
                    {txn.price_per_share_orig
                      ? formatCurrencyPrecise(txn.price_per_share_orig, ccy)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums py-1.5 hidden md:table-cell">
                    {txn.fx_rate_orig_to_chf
                      ? txn.fx_rate_orig_to_chf.toFixed(4)
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary line */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span>Total invested (cash only)</span>
            <span className="tabular-nums">{ccy}: {formatCurrency(sumOrigCash, ccy)}</span>
            {ccy !== 'CHF' && (
              <span className="tabular-nums">CHF: {formatCurrency(sumChfCash)}</span>
            )}
            {blendedFx && ccy !== 'CHF' && (
              <span className="tabular-nums">Blended FX: {blendedFx.toFixed(4)}</span>
            )}
            <span>Rounds: {roundCount}</span>
          </div>
          <Link
            href={`/portfolio/${companyId}`}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View full details
            <ArrowRight size={12} />
          </Link>
        </div>
      </TableCell>
    </TableRow>
  )
}
