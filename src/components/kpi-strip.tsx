'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatMoic, moicColorClass } from '@/lib/format'
import type { PortfolioStats } from '@/lib/types'
import { cn } from '@/lib/utils'

interface KpiStripProps {
  stats: PortfolioStats
  isLoading?: boolean
}

export function KpiStrip({ stats, isLoading }: KpiStripProps) {
  if (isLoading) return <KpiStripSkeleton />

  const cards = [
    {
      label: 'Deployed Capital',
      value: formatCurrency(stats.totalInvestedCHF),
      className: 'text-foreground',
    },
    {
      label: 'Portfolio NAV',
      value: formatCurrency(stats.totalCurrentValueCHF),
      className: 'text-foreground',
    },
    {
      label: 'Portfolio MOIC',
      value: formatMoic(stats.portfolioMoic),
      className: moicColorClass(stats.portfolioMoic),
    },
    {
      label: 'Companies',
      value: String(stats.companyCount),
      sub: `across ${stats.currencyBreakdown.length} currencies`,
      className: 'text-foreground',
    },
    {
      label: 'Stale Valuations',
      value: String(stats.staleCount),
      sub: `of ${stats.companyCount} total`,
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
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
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
