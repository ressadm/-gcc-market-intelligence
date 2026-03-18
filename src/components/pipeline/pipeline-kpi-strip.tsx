'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DealPipelineSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PipelineKpiStripProps {
  deals: DealPipelineSummary[]
  isLoading?: boolean
}

export function PipelineKpiStrip({ deals, isLoading }: PipelineKpiStripProps) {
  if (isLoading) return <KpiSkeleton />

  const totalDeals = deals.length
  const inEvaluation = deals.filter(d => d.stage === 'evaluating' || d.stage === 'decision').length
  const agingCount = deals.filter(d => d.is_aging).length
  const avgDays = totalDeals > 0
    ? Math.round(deals.reduce((sum, d) => sum + d.total_days, 0) / totalDeals)
    : 0

  const cards = [
    { label: 'Active Deals', value: String(totalDeals), className: 'text-foreground' },
    { label: 'In Evaluation', value: String(inEvaluation), className: 'text-foreground' },
    {
      label: 'Aging Deals',
      value: String(agingCount),
      className: agingCount > 0 ? 'text-amber-400' : 'text-green-500',
    },
    { label: 'Avg Days', value: String(avgDays), sub: 'in pipeline', className: 'text-foreground' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className={cn('text-2xl font-semibold mt-1 tabular-nums', card.className)}>
              {card.value}
            </p>
            {card.sub && (
              <p className="text-xs mt-1 text-muted-foreground">{card.sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
