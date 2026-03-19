'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface CapitalBarProps {
  deployed: number
  committed: number
  budget: number
}

export function CapitalBar({ deployed, committed, budget }: CapitalBarProps) {
  const dryPowder = Math.max(0, budget - deployed - committed)
  const deployedPct = budget > 0 ? (deployed / budget) * 100 : 0
  const committedPct = budget > 0 ? (committed / budget) * 100 : 0

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Deployed</p>
              <p className="font-mono text-sm font-semibold tabular-nums text-green-400">
                {formatCurrency(deployed)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Committed</p>
              <p className="font-mono text-sm font-semibold tabular-nums text-amber-400">
                {formatCurrency(committed)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Dry Powder</p>
              <p className="font-mono text-sm font-semibold tabular-nums text-muted-foreground">
                {formatCurrency(dryPowder)}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Budget: <span className="font-mono tabular-nums">{formatCurrency(budget)}</span>
          </p>
        </div>

        <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
          <div
            className={cn('h-full bg-green-500 transition-all duration-500')}
            style={{ width: `${Math.min(deployedPct, 100)}%` }}
          />
          <div
            className={cn('h-full bg-amber-500 transition-all duration-500')}
            style={{ width: `${Math.min(committedPct, 100 - deployedPct)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
