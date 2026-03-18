'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SOURCE_LABELS } from '@/lib/pipeline-constants'

interface PipelineFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  sourceFilter: string
  onSourceChange: (value: string) => void
  availableSources: string[]
  onRefresh: () => void
}

export function PipelineFilters({
  search,
  onSearchChange,
  sourceFilter,
  onSourceChange,
  availableSources,
  onRefresh,
}: PipelineFiltersProps) {
  const sourceOptions = ['All', ...availableSources]

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search deals..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-1 flex-wrap">
        {sourceOptions.map((opt) => (
          <Button
            key={opt}
            variant={sourceFilter === opt ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onSourceChange(opt)}
            className={cn(
              'text-xs',
              sourceFilter === opt && 'font-medium'
            )}
          >
            {opt === 'All' ? 'All' : SOURCE_LABELS[opt] || opt}
          </Button>
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={onRefresh} aria-label="Refresh">
        <RefreshCw size={14} />
      </Button>
    </div>
  )
}
