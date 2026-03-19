'use client'

import { useState, useMemo } from 'react'
import { usePortfolioStats } from '@/hooks/use-portfolio-stats'
import { useInsights } from '@/hooks/use-insights'
import { KpiStrip } from '@/components/kpi-strip'
import { CurrencyChart } from '@/components/charts/currency-chart'
import { SectorChart } from '@/components/charts/sector-chart'
import { SourceChart } from '@/components/charts/source-chart'
import { StageChart } from '@/components/charts/stage-chart'
import { TopCompaniesTable } from '@/components/top-companies-table'
import { InsightsPanel } from '@/components/insights/insights-panel'
import { CompanyDrawer } from '@/components/company-drawer'
import { CurrencyToggle } from '@/components/currency-toggle'
import { SourceTabs, SOURCE_VEHICLE_MAP } from '@/components/source-tabs'
import { AttentionPanel } from '@/components/attention-panel'
import { ActivityFeed } from '@/components/activity-feed'
import { useRecentTransactions } from '@/hooks/use-recent-transactions'
import { aggregatePortfolioCHF } from '@/lib/fx'
import type { DisplayCurrency } from '@/lib/types'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [drawerCompanyId, setDrawerCompanyId] = useState<string | null>(null)
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('CHF')
  const [sourceTab, setSourceTab] = useState('all')

  const { stats, companies, fxRates, isLoading, error, refetch } = usePortfolioStats()
  const { insights, isLoading: insightsLoading, dismiss, markRead } = useInsights()
  const vehicleFilter = SOURCE_VEHICLE_MAP[sourceTab] || []
  const { transactions: recentTxns, isLoading: txnLoading } = useRecentTransactions(
    5,
    vehicleFilter.length > 0 ? vehicleFilter : undefined
  )

  // Source-filtered companies
  const filteredCompanies = useMemo(() => {
    if (vehicleFilter.length === 0) return companies
    return companies.filter(c => vehicleFilter.includes(c.vehicle || ''))
  }, [companies, vehicleFilter])

  // Recompute stats for filtered set
  const filteredStats = useMemo(() => {
    if (sourceTab === 'all') return stats
    return aggregatePortfolioCHF(filteredCompanies, fxRates)
  }, [filteredCompanies, fxRates, sourceTab, stats])

  // Source counts
  const sourceCounts = useMemo(() => ({
    all: companies.length,
    verve: companies.filter(c => c.vehicle === 'fiduciary').length,
    direct: companies.filter(c => c.vehicle === 'direct').length,
    funds: companies.filter(c => c.vehicle === 'fund').length,
  }), [companies])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg text-foreground">Failed to load portfolio data</p>
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
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <CurrencyToggle value={displayCurrency} onChange={setDisplayCurrency} />
          <button
            onClick={refetch}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
            aria-label="Refresh data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <SourceTabs value={sourceTab} onChange={setSourceTab} counts={sourceCounts} />

      <KpiStrip stats={filteredStats} isLoading={isLoading} displayCurrency={displayCurrency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <SectorChart data={filteredStats.sectorBreakdown} isLoading={isLoading} />
        <StageChart data={filteredStats.stageBreakdown} isLoading={isLoading} />
        <CurrencyChart data={filteredStats.currencyBreakdown} isLoading={isLoading} />
        <SourceChart data={filteredStats.sourceBreakdown} isLoading={isLoading} />
      </div>

      <AttentionPanel companies={filteredCompanies} onCompanyClick={setDrawerCompanyId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopCompaniesTable
            companies={filteredCompanies}
            fxRates={fxRates}
            isLoading={isLoading}
            onCompanyClick={setDrawerCompanyId}
          />
        </div>
        <div className="space-y-6">
          <InsightsPanel
            insights={insights}
            isLoading={insightsLoading}
            onDismiss={dismiss}
            onMarkRead={markRead}
          />
          <ActivityFeed transactions={recentTxns} isLoading={txnLoading} />
        </div>
      </div>

      {drawerCompanyId && (
        <CompanyDrawer
          companyId={drawerCompanyId}
          onClose={() => setDrawerCompanyId(null)}
        />
      )}
    </div>
  )
}
