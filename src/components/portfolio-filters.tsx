'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CurrencyToggle } from '@/components/currency-toggle'
import { Search, RefreshCw, LayoutList, LayoutGrid, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DisplayCurrency } from '@/lib/types'

interface PortfolioFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  vehicleFilter: string
  onVehicleChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  onRefresh: () => void
  compactView?: boolean
  onCompactChange?: (compact: boolean) => void
  onExport?: () => void
  displayCurrency?: DisplayCurrency
  onCurrencyChange?: (currency: DisplayCurrency) => void
}

const vehicleOptions = ['All', 'fiduciary', 'direct', 'fund']
const vehicleLabels: Record<string, string> = {
  All: 'All',
  fiduciary: 'Verve',
  direct: 'Direct',
  fund: 'LP Fund',
}

// Map filter tab values to the DB vehicle values they include
const vehicleGroups: Record<string, string[]> = {
  fiduciary: ['fiduciary'],
  direct: ['spv', 'safe', 'direct'],
  fund: ['fund_lp', 'fund_etf'],
}

/** Check if a DB vehicle value matches a filter tab value */
export function matchesVehicleFilter(vehicle: string | null | undefined, filter: string): boolean {
  if (filter === 'All') return true
  const group = vehicleGroups[filter]
  if (!group) return vehicle === filter
  return vehicle != null && group.includes(vehicle)
}

const statusOptions = ['All', 'Active', 'In Liquidation', 'Written Off']

export function PortfolioFilters({
  search,
  onSearchChange,
  vehicleFilter,
  onVehicleChange,
  statusFilter,
  onStatusChange,
  onRefresh,
  compactView = false,
  onCompactChange,
  onExport,
  displayCurrency = 'CHF',
  onCurrencyChange,
}: PortfolioFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center print:hidden">
      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Vehicle filter */}
      <div className="flex gap-1">
        {vehicleOptions.map((opt) => (
          <Button
            key={opt}
            variant={vehicleFilter === opt ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onVehicleChange(opt)}
            className={cn(
              'text-xs',
              vehicleFilter === opt && 'font-medium'
            )}
          >
            {vehicleLabels[opt] || opt}
          </Button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-1">
        {statusOptions.map((opt) => (
          <Button
            key={opt}
            variant={statusFilter === opt ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onStatusChange(opt)}
            className={cn(
              'text-xs',
              statusFilter === opt && 'font-medium'
            )}
          >
            {opt}
          </Button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5 items-center ml-auto">
        {/* Currency toggle — Fix 1 */}
        {onCurrencyChange && (
          <CurrencyToggle value={displayCurrency} onChange={onCurrencyChange} />
        )}

        {/* Compact toggle */}
        {onCompactChange && (
          <Button
            variant={compactView ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onCompactChange(!compactView)}
            aria-label={compactView ? 'Detailed view' : 'Compact view'}
            title={compactView ? 'Switch to detailed view' : 'Switch to compact view'}
          >
            {compactView ? <LayoutList size={14} /> : <LayoutGrid size={14} />}
          </Button>
        )}

        {/* Export */}
        {onExport && (
          <Button variant="ghost" size="sm" onClick={onExport} aria-label="Export CSV" title="Export to CSV">
            <Download size={14} />
          </Button>
        )}

        {/* Refresh */}
        <Button variant="ghost" size="sm" onClick={onRefresh} aria-label="Refresh">
          <RefreshCw size={14} />
        </Button>
      </div>
    </div>
  )
}
