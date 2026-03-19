'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePortfolioStats } from '@/hooks/use-portfolio-stats'
import { useAppSettings } from '@/hooks/use-app-settings'
import { PortfolioTable } from '@/components/portfolio-table'
import { PortfolioFilters } from '@/components/portfolio-filters'
import { KpiStrip } from '@/components/kpi-strip'
import { CompanyDrawer } from '@/components/company-drawer'
import { RealizedInvestmentsTable } from '@/components/realized-investments-table'
import { useRealizedTransactions } from '@/hooks/use-realized-transactions'
import { exportToCSV } from '@/lib/export'
import { convertToDisplay } from '@/lib/fx'
import type { DisplayCurrency } from '@/lib/types'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function PortfolioPage() {
  const { stats, companies, fxRates, isLoading, error, refetch } = usePortfolioStats()
  const { settings, updateSetting } = useAppSettings()
  const [search, setSearch] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [drawerCompanyId, setDrawerCompanyId] = useState<string | null>(null)
  const [compactView, setCompactView] = useState(false)
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('CHF')
  const { transactions: realizedTxns, isLoading: realizedLoading } = useRealizedTransactions()

  // Sync compact view from persisted settings
  useEffect(() => {
    setCompactView(settings.portfolio_compact_view)
  }, [settings.portfolio_compact_view])

  const handleCompactChange = useCallback(async (compact: boolean) => {
    setCompactView(compact)
    await updateSetting('portfolio_compact_view', String(compact))
  }, [updateSetting])

  const handleExport = useCallback(() => {
    if (companies.length === 0) {
      toast.error('No data to export')
      return
    }

    const dCcy = displayCurrency
    const headers = ['Company', 'Status', 'Vehicle', 'Currency', `Invested (${dCcy})`, `Value (${dCcy})`, `Gain/Loss (${dCcy})`, 'MOIC']
    const rows = companies.map(c => {
      const origCcy = c.investment_currency || 'CHF'
      const investedD = convertToDisplay(c.total_invested, origCcy, fxRates, dCcy)
      const valueD = convertToDisplay(c.current_value, origCcy, fxRates, dCcy)
      const gainLossD = valueD - investedD
      return [
        c.name,
        c.status,
        c.vehicle || '',
        origCcy,
        Math.round(investedD),
        Math.round(valueD),
        Math.round(gainLossD),
        (c.moic ?? 0).toFixed(2),
      ]
    })

    const date = new Date().toISOString().split('T')[0]
    exportToCSV(headers, rows, `angelos-portfolio-${date}.csv`)
    toast.success('Portfolio exported to CSV')
  }, [companies, fxRates, displayCurrency])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg text-foreground">Failed to load portfolio</p>
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
      <h1 className="font-heading text-2xl font-bold print:text-xl">Portfolio</h1>

      {/* Fix 5: KPI strip responds to currency toggle */}
      <KpiStrip stats={stats} isLoading={isLoading} displayCurrency={displayCurrency} fxRates={fxRates} />

      <PortfolioFilters
        search={search}
        onSearchChange={setSearch}
        vehicleFilter={vehicleFilter}
        onVehicleChange={setVehicleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onRefresh={refetch}
        compactView={compactView}
        onCompactChange={handleCompactChange}
        onExport={handleExport}
        displayCurrency={displayCurrency}
        onCurrencyChange={setDisplayCurrency}
      />

      <PortfolioTable
        companies={companies}
        fxRates={fxRates}
        isLoading={isLoading}
        search={search}
        vehicleFilter={vehicleFilter}
        statusFilter={statusFilter}
        onCompanyClick={setDrawerCompanyId}
        compactView={compactView}
        displayCurrency={displayCurrency}
      />

      <RealizedInvestmentsTable transactions={realizedTxns} isLoading={realizedLoading} />

      {drawerCompanyId && (
        <CompanyDrawer
          companyId={drawerCompanyId}
          onClose={() => setDrawerCompanyId(null)}
        />
      )}
    </div>
  )
}
