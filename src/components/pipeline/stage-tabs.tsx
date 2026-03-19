'use client'

import { cn } from '@/lib/utils'
import type { DealPipelineSummary } from '@/lib/types'

type StageFilter = 'active' | 'closed' | 'passed' | 'all'

interface StageTabsProps {
  value: StageFilter
  onChange: (value: StageFilter) => void
  deals: DealPipelineSummary[]
  allDealCount: number
}

const ACTIVE_STAGES = ['discovered', 'screening', 'evaluating', 'decision', 'committed']

export function getStageFilter(deals: DealPipelineSummary[], filter: StageFilter): DealPipelineSummary[] {
  switch (filter) {
    case 'active':
      return deals.filter(d => ACTIVE_STAGES.includes(d.stage))
    case 'closed':
      return deals.filter(d => d.stage === 'closed')
    case 'passed':
      return deals.filter(d => ['passed', 'expired', 'withdrawn'].includes(d.stage))
    case 'all':
    default:
      return deals
  }
}

export function StageTabs({ value, onChange, deals, allDealCount }: StageTabsProps) {
  const activeCount = deals.filter(d => ACTIVE_STAGES.includes(d.stage)).length
  const closedCount = deals.filter(d => d.stage === 'closed').length
  const passedCount = deals.filter(d => ['passed', 'expired', 'withdrawn'].includes(d.stage)).length

  const tabs: { value: StageFilter; label: string; count: number }[] = [
    { value: 'active', label: 'Active', count: activeCount },
    { value: 'closed', label: 'Closed', count: closedCount },
    { value: 'passed', label: 'Passed', count: passedCount },
    { value: 'all', label: 'All', count: allDealCount },
  ]

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
            value === tab.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
          <span className={cn(
            'text-xs tabular-nums',
            value === tab.value ? 'text-primary-foreground/70' : 'text-muted-foreground/60'
          )}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}

export type { StageFilter }
