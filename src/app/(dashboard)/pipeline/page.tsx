'use client'

import { useMemo, useState } from 'react'
import { usePipeline } from '@/hooks/use-pipeline'
import { usePortfolioStats } from '@/hooks/use-portfolio-stats'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import { PipelineList } from '@/components/pipeline/pipeline-list'
import { PipelineKpiStrip } from '@/components/pipeline/pipeline-kpi-strip'
import { PipelineFilters } from '@/components/pipeline/pipeline-filters'
import { CapitalBar } from '@/components/pipeline/capital-bar'
import { ViewToggle, type PipelineView } from '@/components/pipeline/view-toggle'
import { StageTabs, getStageFilter, type StageFilter } from '@/components/pipeline/stage-tabs'
import { DealDrawer } from '@/components/pipeline/deal-drawer'
import { AlertCircle, RefreshCw, Inbox, Plus } from 'lucide-react'
import Link from 'next/link'

const BUDGET_CHF = 1_000_000 // from app_settings — hardcoded for now

export default function PipelinePage() {
  const { deals, isLoading, error, refetch } = usePipeline()
  const { stats } = usePortfolioStats()
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [view, setView] = useState<PipelineView>('list')
  const [stageFilter, setStageFilter] = useState<StageFilter>('active')
  const [drawerDealId, setDrawerDealId] = useState<string | null>(null)

  const availableSources = useMemo(() => {
    const sources = new Set<string>()
    for (const deal of deals) {
      if (deal.source) sources.add(deal.source)
    }
    return Array.from(sources).sort()
  }, [deals])

  // Stage filter first (for tabs), then search + source
  const stageFiltered = useMemo(() => getStageFilter(deals, stageFilter), [deals, stageFilter])

  const filtered = useMemo(() => {
    return stageFiltered.filter((deal) => {
      if (search && !deal.deal_name.toLowerCase().includes(search.toLowerCase())) return false
      if (sourceFilter !== 'All' && deal.source !== sourceFilter) return false
      return true
    })
  }, [stageFiltered, search, sourceFilter])

  // Committed pipeline capital = sum of allocation_target for committed deals
  // We need to query deals table for this — for now approximate from pipeline summary
  const committedCapital = 0 // placeholder — committed deals filtered by stage

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
        <div className="flex items-center gap-3">
          <ViewToggle value={view} onChange={setView} />
          <Link
            href="/pipeline/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            New Deal
          </Link>
        </div>
      </div>

      <CapitalBar
        deployed={stats.totalInvestedCHF}
        committed={committedCapital}
        budget={BUDGET_CHF}
      />

      <PipelineKpiStrip deals={filtered} isLoading={isLoading} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <StageTabs
          value={stageFilter}
          onChange={setStageFilter}
          deals={deals}
          allDealCount={deals.length}
        />
        <PipelineFilters
          search={search}
          onSearchChange={setSearch}
          sourceFilter={sourceFilter}
          onSourceChange={setSourceFilter}
          availableSources={availableSources}
          onRefresh={refetch}
        />
      </div>

      {!isLoading && filtered.length === 0 && deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <Inbox className="h-12 w-12" />
          <p className="text-lg">No active deals in the pipeline</p>
          <p className="text-sm">Deals will appear here as they are added.</p>
        </div>
      ) : view === 'list' ? (
        <PipelineList
          deals={filtered}
          isLoading={isLoading}
          onDealClick={setDrawerDealId}
        />
      ) : (
        <PipelineBoard deals={filtered} isLoading={isLoading} onDealClick={setDrawerDealId} />
      )}

      {drawerDealId && (
        <DealDrawer
          dealId={drawerDealId}
          onClose={() => setDrawerDealId(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  )
}
