'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatMoic, moicColorClass, valueColorClass } from '@/lib/format'
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

  // Use pre-computed per-currency stats (historical for invested, live for value)
  const invested = ccy === 'CHF' ? stats.totalInvestedCHF : stats.totalInvestedUSD
  const nav = ccy === 'CHF' ? stats.totalCurrentValueCHF : stats.totalCurrentValueUSD
  const pnl = ccy === 'CHF' ? stats.unrealizedPnlCHF : stats.unrealizedPnlUSD

  const pnlSign = pnl >= 0 ? '+' : ''
  const fxSign = stats.fxImpactPct >= 0 ? '+' : ''

  const cards: KpiCard[] = [
    {
      label: 'Deployed Capital',
      value: formatCurrency(invested, ccy),
      valueClassName: 'text-foreground',
    },
    {
      label: 'Portfolio NAV',
      value: formatCurrency(nav, ccy),
      sub: `${pnlSign}${formatCurrency(pnl, ccy)} P&L`,
      subClassName: valueColorClass(pnl),
      valueClassName: 'text-foreground',
      accent: true,
    },
    {
      label: 'Portfolio MOIC',
      value: formatMoic(ccy === 'CHF' ? stats.portfolioMoicCHF : stats.portfolioMoicUSD),
      valueClassName: moicColorClass(ccy === 'CHF' ? stats.portfolioMoicCHF : stats.portfolioMoicUSD),
    },
    {
      label: 'FX Impact',
      value: `${fxSign}${(stats.fxImpactPct * 100).toFixed(1)}%`,
      sub: stats.fxImpactPct < 0 ? 'CHF strength headwind' : stats.fxImpactPct > 0 ? 'CHF weakness tailwind' : 'No FX effect',
      valueClassName: stats.fxImpactPct < 0 ? 'text-red-400' : stats.fxImpactPct > 0 ? 'text-green-500' : 'text-muted-foreground',
    },
    {
      label: 'Stale Valuations',
      value: String(stats.staleCount),
      sub: `of ${stats.companyCount} companies`,
      valueClassName: stats.staleCount > 0 ? 'text-red-400' : 'text-green-500',
    },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card
            key={card.label}
            className={cn(
              card.accent && 'border-green-500/30 bg-green-500/[0.03]'
            )}
          >
            <CardContent className="pt-5 pb-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <p className={cn(
                'font-mono text-2xl font-semibold leading-none tabular-nums tracking-tight mt-2',
                card.valueClassName
              )}>
                {card.value}
              </p>
              {card.sub && (
                <p className={cn('text-xs mt-1.5', card.subClassName || 'text-muted-foreground')}>
                  {card.sub}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary stats row */}
      <p className="text-[12px] text-muted-foreground tabular-nums">
        {stats.companyCount} companies
        {stats.staleCount > 0 && <span> · <span className="text-amber-400">{stats.staleCount} stale</span></span>}
      </p>
    </div>
  )
}

interface KpiCard {
  label: string
  value: string
  valueClassName: string
  sub?: string
  subClassName?: string
  accent?: boolean
}

function KpiStripSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-5 pb-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-4 w-48" />
    </div>
  )
}
