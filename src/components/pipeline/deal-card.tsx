'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDaysAgo } from '@/lib/format'
import { SOURCE_LABELS } from '@/lib/pipeline-constants'
import type { DealPipelineSummary } from '@/lib/types'
import { Clock, AlertTriangle } from 'lucide-react'

interface DealCardProps {
  deal: DealPipelineSummary
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <Link href={`/pipeline/${deal.deal_id}`}>
      <Card className="hover:border-primary/30 transition-colors cursor-pointer">
        <CardContent className="p-4 space-y-2">
          <p className="font-medium text-sm text-foreground truncate">
            {deal.deal_name}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {deal.sector && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {deal.sector}
              </Badge>
            )}
            {deal.source && (
              <span className="text-[10px] text-muted-foreground">
                {SOURCE_LABELS[deal.source] || deal.source}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {formatDaysAgo(deal.days_in_stage)}
            </span>
            {deal.is_aging && (
              <span className="flex items-center gap-0.5 text-amber-400">
                <AlertTriangle size={10} />
                Aging
              </span>
            )}
          </div>

          {deal.ai_score !== null && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">AI</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                {deal.ai_score}/10
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
