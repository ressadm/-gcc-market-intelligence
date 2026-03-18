'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatMoic, moicColorClass, valueColorClass } from '@/lib/format'
import { convertFromCHF } from '@/lib/fx'
import type { PortfolioStats, DisplayCurrency } from '@/lib/types'
import { cn } from '@/lib/utils'

interface KpiStripProps {
  stats: PortfolioStats
  isLoading?: boolean
  displayCurrency?: DisplayCurrency
  fxRates?: Record<string, number>
}

export function KpiStrip({ stats, isLoading, displayCurrency = 'CHF', fxRates = {} }: KpiStripProps) {
  if (isLoading) return <KpiStripSkeleton />

  const ccy = displayCurrency
  const convert = (chf: number) =>
    ccy === 'CHF' ? chf : convertFromCHF(chf, ccy, fxRates)

  const invested = convert(stats.totalInvestedCHF)
  const nav = convert(stats.totalCurrentValueCHF)
  const pnl = convert(stats.unrealizedPnlCHF)

  const pnlSign = pnl >= 0 ? '+' : ''
  const fxSign = stats.fxImpactPct >= 0 ? '+' : ''

  const cards = [
    {
      label: 'Deployed Capital',
      value: formatCurrency(invested, ccy),
      className: 'text-foreground',
    },
    {
      label: 'Portfolio NAV',
      value: formatCurrency(nav, ccy),
      sub: `${pnlSign}${formatCurrency(pnl, ccy)} P&L`,
      subClassName: valueColorClass(pnl),
      className: 'text-foreground',
    },
    {
      label: 'Portfolio MOIC',
      value: formatMoic(stats.portfolioMoic),
      className: moicColorClass(stats.portfolioMoic),
    },
    {
      label: 'FX Impact',
      value: `${fxSign}${(stats.fxImpactPct * 100).toFixed(1)}%`,
      sub: stats.fxImpactPct < 0 ? 'CHF strength headwind' : stats.fxImpactPct > 0 ? 'CHF weakness tailwind' : 'No FX effect',
      className: stats.fxImpactPct < 0 ? 'text-red-400' : stats.fxImpactPct > 0 ? 'text-green-500' : 'text-muted-foreground',
    },
    {
      label: 'Stale Valuations',
      value: String(stats.staleCount),
      sub: `of ${stats.companyCount} companies`,
      className: stats.staleCount > 0 ? 'text-red-400' : 'text-green-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className={cn('text-2xl font-semibold mt-1 tabular-nums', card.className)}>
              {card.value}
            </p>
            {card.sub && (
              <p className={cn('text-xs mt-1', card.subClassName || 'text-muted-foreground')}>{card.sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function KpiStripSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
