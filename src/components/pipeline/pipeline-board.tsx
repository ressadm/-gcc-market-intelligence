'use client'

import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { PIPELINE_STAGES } from '@/lib/pipeline-constants'
import type { DealPipelineSummary, DealStage } from '@/lib/types'
import { PipelineColumn } from './pipeline-column'

interface PipelineBoardProps {
  deals: DealPipelineSummary[]
  isLoading: boolean
}

export function PipelineBoard({ deals, isLoading }: PipelineBoardProps) {
  const grouped = useMemo(() => {
    const map: Record<DealStage, DealPipelineSummary[]> = {
      discovered: [],
      screening: [],
      evaluating: [],
      decision: [],
      committed: [],
      closed: [],
      passed: [],
      expired: [],
      withdrawn: [],
    }
    for (const deal of deals) {
      if (map[deal.stage]) {
        map[deal.stage].push(deal)
      }
    }
    return map
  }, [deals])

  if (isLoading) return <BoardSkeleton />

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => (
        <PipelineColumn
          key={stage}
          stage={stage}
          deals={grouped[stage]}
        />
      ))}
    </div>
  )
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="min-w-[200px] space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}
