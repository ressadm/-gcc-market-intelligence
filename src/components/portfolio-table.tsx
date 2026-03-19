'use client'

import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { PortfolioCompany } from '@/lib/types'
import { PortfolioSection } from './portfolio-section'

interface PortfolioTableProps {
  companies: PortfolioCompany[]
  fxRates: Record<string, number>
  isLoading?: boolean
  search: string
  vehicleFilter: string
  statusFilter: string
  onCompanyClick?: (companyId: string) => void
}

export function PortfolioTable({
  companies,
  fxRates,
  isLoading,
  search,
  vehicleFilter,
  statusFilter,
  onCompanyClick,
}: PortfolioTableProps) {
  const filtered = useMemo(() => {
    let result = companies
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q))
    }
    if (vehicleFilter !== 'All') {
      result = result.filter(c => c.vehicle === vehicleFilter)
    }
    if (statusFilter !== 'All') {
      result = result.filter(c => c.status === statusFilter)
    }
    return result
  }, [companies, search, vehicleFilter, statusFilter])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No companies match your filters</p>
      </div>
    )
  }

  const showSections = statusFilter === 'All'

  if (!showSections) {
    return (
      <PortfolioSection
        title={statusFilter}
        companies={filtered}
        fxRates={fxRates}
        onCompanyClick={onCompanyClick}
      />
    )
  }

  const groups = groupByStatus(filtered)

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <PortfolioSection
          key={group.status}
          title={group.status}
          companies={group.companies}
          fxRates={fxRates}
          isLiquidation={group.status === 'In Liquidation' || group.status === 'Written Off'}
          showFooter={group.status === 'Active'}
          onCompanyClick={onCompanyClick}
        />
      ))}
    </div>
  )
}

function groupByStatus(companies: PortfolioCompany[]) {
  const statusOrder = ['Active', 'In Liquidation', 'Written Off', 'Exited']
  const groups = new Map<string, PortfolioCompany[]>()

  for (const c of companies) {
    const s = c.status || 'Unknown'
    if (!groups.has(s)) groups.set(s, [])
    groups.get(s)!.push(c)
  }

  return statusOrder
    .filter(s => groups.has(s))
    .map(s => ({ status: s, companies: groups.get(s)! }))
    .concat(
      Array.from(groups.entries())
        .filter(([s]) => !statusOrder.includes(s))
        .map(([s, companies]) => ({ status: s, companies }))
    )
}
