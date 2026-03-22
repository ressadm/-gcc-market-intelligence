'use client'

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
import { formatCurrency, formatDate, valueColorClass } from '@/lib/format'
import type { RealizedTransaction } from '@/hooks/use-realized-transactions'
import { cn } from '@/lib/utils'
import { matchesVehicleFilter } from './portfolio-filters'

interface RealizedInvestmentsTableProps {
  transactions: RealizedTransaction[]
  isLoading: boolean
  vehicleFilter?: string
}

export function RealizedInvestmentsTable({ transactions, isLoading, vehicleFilter = 'All' }: RealizedInvestmentsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  const filtered = vehicleFilter === 'All'
    ? transactions
    : transactions.filter(t => matchesVehicleFilter(t.vehicle, vehicleFilter))

  if (filtered.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Shares</TableHead>
            <TableHead className="text-right">Payout</TableHead>
            <TableHead className="text-right">CHF</TableHead>
            <TableHead className="hidden md:table-cell">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Section header */}
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableCell colSpan={7} className="py-2">
              <span className="font-heading font-semibold text-sm tracking-wide uppercase">
                Realized ({filtered.length})
              </span>
            </TableCell>
          </TableRow>

          {filtered.map((txn) => (
            <TableRow key={txn.id}>
              <TableCell className="font-medium">{txn.company_name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(
                  'text-[9px] px-1.5 py-0',
                  txn.type === 'EXIT'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                )}>
                  {txn.type === 'EXIT' ? 'Exit' : 'Distribution'}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums text-sm text-muted-foreground">
                {formatDate(txn.date)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums hidden sm:table-cell">
                {txn.shares ? txn.shares.toFixed(2) : '—'}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCurrency(txn.amount_orig, txn.orig_currency)}
              </TableCell>
              <TableCell className={cn('text-right font-mono tabular-nums', valueColorClass(txn.amount_chf))}>
                {formatCurrency(txn.amount_chf, 'CHF')}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[200px]">
                {txn.notes || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
