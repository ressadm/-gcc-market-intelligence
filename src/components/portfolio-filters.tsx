'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortfolioFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  vehicleFilter: string
  onVehicleChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  onRefresh: () => void
}

const vehicleOptions = ['All', 'fiduciary', 'direct', 'fund']
const vehicleLabels: Record<string, string> = {
  All: 'All',
  fiduciary: 'Verve',
  direct: 'Direct',
  fund: 'LP Fund',
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
}: PortfolioFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
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

      {/* Refresh */}
      <Button variant="ghost" size="sm" onClick={onRefresh} aria-label="Refresh">
        <RefreshCw size={14} />
      </Button>
    </div>
  )
}
