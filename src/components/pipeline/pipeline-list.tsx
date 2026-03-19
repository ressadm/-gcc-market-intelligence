'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDaysAgo } from '@/lib/format'
import { STAGE_LABELS, STAGE_COLORS, SOURCE_LABELS } from '@/lib/pipeline-constants'
import type { DealPipelineSummary } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronRight, AlertTriangle } from 'lucide-react'

type SortCol = 'deal_name' | 'stage' | 'source' | 'sector' | 'total_days' | 'ai_score'
type SortDir = 'asc' | 'desc'

interface PipelineListProps {
  deals: DealPipelineSummary[]
  isLoading: boolean
  onDealClick: (dealId: string) => void
}

export function PipelineList({ deals, isLoading, onDealClick }: PipelineListProps) {
  const [sortCol, setSortCol] = useState<SortCol>('total_days')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    return [...deals].sort((a, b) => {
      let aVal: string | number | null
      let bVal: string | number | null

      switch (sortCol) {
        case 'deal_name':
          aVal = a.deal_name.toLowerCase()
          bVal = b.deal_name.toLowerCase()
          break
        case 'ai_score':
          aVal = a.ai_score ?? -1
          bVal = b.ai_score ?? -1
          break
        default:
          aVal = a[sortCol] ?? ''
          bVal = b[sortCol] ?? ''
      }

      if (aVal === bVal) return 0
      if (aVal === null || aVal === '') return 1
      if (bVal === null || bVal === '') return -1
      const cmp = aVal < bVal ? -1 : 1
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [deals, sortCol, sortDir])

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <ArrowUpDown size={14} className="ml-1 text-muted-foreground/40" />
    return sortDir === 'asc'
      ? <ArrowUp size={14} className="ml-1 text-primary" />
      : <ArrowDown size={14} className="ml-1 text-primary" />
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No deals match your filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('deal_name')}>
              <span className="flex items-center">Company <SortIcon col="deal_name" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('stage')}>
              <span className="flex items-center">Stage <SortIcon col="stage" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('source')}>
              <span className="flex items-center">Source <SortIcon col="source" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('sector')}>
              <span className="flex items-center">Sector <SortIcon col="sector" /></span>
            </TableHead>
            <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('total_days')}>
              <span className="flex items-center justify-end">Age <SortIcon col="total_days" /></span>
            </TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((deal) => (
            <TableRow
              key={deal.deal_id}
              className="cursor-pointer hover:bg-secondary/50"
              onClick={() => onDealClick(deal.deal_id)}
            >
              <TableCell className="font-medium">
                <div>{deal.deal_name}</div>
                {deal.sector && (
                  <span className="text-[10px] text-muted-foreground/60">{deal.sector}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-xs', STAGE_COLORS[deal.stage])}>
                  {STAGE_LABELS[deal.stage]}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {deal.source ? (SOURCE_LABELS[deal.source] || deal.source) : '—'}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {deal.sector || '—'}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-sm">
                <div className="flex items-center justify-end gap-1.5">
                  {deal.is_aging && <AlertTriangle size={12} className="text-amber-400" />}
                  <span className={deal.is_aging ? 'text-amber-400' : 'text-muted-foreground'}>
                    {formatDaysAgo(deal.total_days)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="w-8">
                <ChevronRight size={14} className="text-muted-foreground/40" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
