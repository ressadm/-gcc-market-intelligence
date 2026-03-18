'use client'

import { useState } from 'react'
import { usePortfolioStats } from '@/hooks/use-portfolio-stats'
import { useInsights } from '@/hooks/use-insights'
import { KpiStrip } from '@/components/kpi-strip'
import { CurrencyChart } from '@/components/charts/currency-chart'
import { SectorChart } from '@/components/charts/sector-chart'
import { TopCompaniesTable } from '@/components/top-companies-table'
import { InsightsPanel } from '@/components/insights/insights-panel'
import { CompanyDrawer } from '@/components/company-drawer'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const { stats, companies, fxRates, isLoading, error, refetch } = usePortfolioStats()
  const { insights, isLoading: insightsLoading, dismiss, markRead } = useInsights()
  const [drawerCompanyId, setDrawerCompanyId] = useState<string | null>(null)

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
        <button
          onClick={refetch}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
          aria-label="Refresh data"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <KpiStrip stats={stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrencyChart data={stats.currencyBreakdown} isLoading={isLoading} />
        <SectorChart data={stats.sectorBreakdown} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopCompaniesTable
            companies={companies}
            fxRates={fxRates}
            isLoading={isLoading}
            onCompanyClick={setDrawerCompanyId}
          />
        </div>
        <InsightsPanel
          insights={insights}
          isLoading={insightsLoading}
          onDismiss={dismiss}
          onMarkRead={markRead}
        />
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
