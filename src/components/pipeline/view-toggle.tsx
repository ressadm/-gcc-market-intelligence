'use client'

import { cn } from '@/lib/utils'
import { LayoutGrid, List } from 'lucide-react'

type PipelineView = 'list' | 'board'

interface ViewToggleProps {
  value: PipelineView
  onChange: (view: PipelineView) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 bg-muted/70 rounded-md p-0.5 border border-border">
      <button
        onClick={() => onChange('list')}
        className={cn(
          'p-1.5 rounded transition-colors',
          value === 'list'
            ? 'bg-card text-foreground shadow-sm border border-border'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="List view"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => onChange('board')}
        className={cn(
          'p-1.5 rounded transition-colors',
          value === 'board'
            ? 'bg-card text-foreground shadow-sm border border-border'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label="Board view"
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  )
}

export type { PipelineView }
