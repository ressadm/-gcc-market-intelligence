'use client'

import { useMemo, useState } from 'react'
import { usePipeline } from '@/hooks/use-pipeline'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import { PipelineKpiStrip } from '@/components/pipeline/pipeline-kpi-strip'
import { PipelineFilters } from '@/components/pipeline/pipeline-filters'
import { AlertCircle, RefreshCw, Inbox, Plus } from 'lucide-react'
import Link from 'next/link'

export default function PipelinePage() {
  const { deals, isLoading, error, refetch } = usePipeline()
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All')

  const availableSources = useMemo(() => {
    const sources = new Set<string>()
    for (const deal of deals) {
      if (deal.source) sources.add(deal.source)
    }
    return Array.from(sources).sort()
  }, [deals])

  const filtered = useMemo(() => {
    return deals.filter((deal) => {
      if (search && !deal.deal_name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (sourceFilter !== 'All' && deal.source !== sourceFilter) {
        return false
      }
      return true
    })
  }, [deals, search, sourceFilter])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg text-foreground">Failed to load pipeline</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Pipeline</h1>
        <Link
          href="/pipeline/new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Deal
        </Link>
      </div>

      <PipelineKpiStrip deals={filtered} isLoading={isLoading} />

      <PipelineFilters
        search={search}
        onSearchChange={setSearch}
        sourceFilter={sourceFilter}
        onSourceChange={setSourceFilter}
        availableSources={availableSources}
        onRefresh={refetch}
      />

      {!isLoading && filtered.length === 0 && deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <Inbox className="h-12 w-12" />
          <p className="text-lg">No active deals in the pipeline</p>
          <p className="text-sm">Deals will appear here as they are added.</p>
        </div>
      ) : (
        <PipelineBoard deals={filtered} isLoading={isLoading} />
      )}
    </div>
  )
}
