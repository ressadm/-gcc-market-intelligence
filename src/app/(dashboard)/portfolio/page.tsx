'use client'

import { useState } from 'react'
import { usePortfolioStats } from '@/hooks/use-portfolio-stats'
import { PortfolioTable } from '@/components/portfolio-table'
import { PortfolioFilters } from '@/components/portfolio-filters'
import { KpiStrip } from '@/components/kpi-strip'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function PortfolioPage() {
  const { stats, companies, fxRates, isLoading, error, refetch } = usePortfolioStats()
  const [search, setSearch] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

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
      <h1 className="font-heading text-2xl font-bold">Portfolio</h1>

      <KpiStrip stats={stats} isLoading={isLoading} />

      <PortfolioFilters
        search={search}
        onSearchChange={setSearch}
        vehicleFilter={vehicleFilter}
        onVehicleChange={setVehicleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onRefresh={refetch}
      />

      <PortfolioTable
        companies={companies}
        fxRates={fxRates}
        isLoading={isLoading}
        search={search}
        vehicleFilter={vehicleFilter}
        statusFilter={statusFilter}
      />
    </div>
  )
}
