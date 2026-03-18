'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/format'
import type { RecentTransaction } from '@/hooks/use-recent-transactions'
import { cn } from '@/lib/utils'
import { ArrowUpRight, Clock, CheckCircle, Activity } from 'lucide-react'

interface ActivityFeedProps {
  transactions: RecentTransaction[]
  isLoading: boolean
}

const typeBadgeColors: Record<string, string> = {
  EQT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CVL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SAFE: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  ADJ: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  DIST: 'bg-green-500/20 text-green-400 border-green-500/30',
  RECAP: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

function getIcon(type: string, isCashEvent: boolean) {
  if (type === 'DIST' || type === 'EXIT') return <CheckCircle size={14} className="text-green-400" />
  if (isCashEvent) return <ArrowUpRight size={14} className="text-blue-400" />
  return <Clock size={14} className="text-muted-foreground" />
}

export function ActivityFeed({ transactions, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-muted-foreground" />
          <h3 className="font-heading text-lg font-semibold">Recent Transactions</h3>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 text-center py-6">
            No recent transactions
          </p>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center gap-3 py-2.5">
                <div className="mt-0.5 shrink-0">
                  {getIcon(txn.type, txn.is_cash_event)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{txn.company_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className={cn('text-[9px] px-1 py-0', typeBadgeColors[txn.type] || '')}>
                      {txn.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{formatDate(txn.date)}</span>
                  </div>
                </div>
                <span className={cn(
                  'text-xs font-mono tabular-nums shrink-0',
                  txn.is_cash_event ? 'text-foreground' : 'text-muted-foreground/50'
                )}>
                  {formatCurrency(txn.amount_orig, txn.orig_currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
