'use client'

import { Badge } from '@/components/ui/badge'
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/pipeline-constants'
import type { DealPipelineSummary, DealStage } from '@/lib/types'
import { DealCard } from './deal-card'
import { cn } from '@/lib/utils'

interface PipelineColumnProps {
  stage: DealStage
  deals: DealPipelineSummary[]
  onDealClick?: (dealId: string) => void
}

export function PipelineColumn({ stage, deals, onDealClick }: PipelineColumnProps) {
  return (
    <div className="flex flex-col min-w-[200px] max-h-[calc(100vh-280px)]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Badge variant="outline" className={cn('text-xs', STAGE_COLORS[stage])}>
          {STAGE_LABELS[stage]}
        </Badge>
        <span className="text-xs text-muted-foreground tabular-nums">{deals.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {deals.length === 0 ? (
          <p className="text-xs text-muted-foreground/50 text-center py-8">
            No deals
          </p>
        ) : (
          deals.map((deal) => (
            <DealCard key={deal.deal_id} deal={deal} onClick={onDealClick} />
          ))
        )}
      </div>
    </div>
  )
}
