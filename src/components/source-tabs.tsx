'use client'

import { cn } from '@/lib/utils'

interface SourceTabsProps {
  value: string
  onChange: (value: string) => void
  counts: Record<string, number>
  className?: string
}

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'verve', label: 'Verve' },
  { value: 'direct', label: 'Direct' },
  { value: 'funds', label: 'LP Funds' },
]

export const SOURCE_VEHICLE_MAP: Record<string, string[]> = {
  all: [],
  verve: ['fiduciary'],
  direct: ['direct'],
  funds: ['fund'],
}

export function SourceTabs({ value, onChange, counts, className }: SourceTabsProps) {
  return (
    <div className={cn('flex items-center gap-1.5 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const count = counts[tab.value] ?? 0
        return (
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
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
