'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatMoic, moicColorClass } from '@/lib/format'
import type { PortfolioCompany } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react'

interface AttentionPanelProps {
  companies: PortfolioCompany[]
}

interface AttentionItem {
  company: PortfolioCompany
  reason: 'written-down' | 'high-performer' | 'stale'
}

const reasonConfig = {
  'written-down': {
    icon: AlertTriangle,
    iconClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
    badge: 'Written Down',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  'high-performer': {
    icon: TrendingUp,
    iconClass: 'text-green-400',
    bgClass: 'bg-green-500/10',
    badge: 'Top Performer',
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  stale: {
    icon: Clock,
    iconClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    badge: 'Stale',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
}

function getAttentionItems(companies: PortfolioCompany[]): AttentionItem[] {
  const items: AttentionItem[] = []
  for (const c of companies) {
    if (c.moic !== null && c.moic < 0.25) {
      items.push({ company: c, reason: 'written-down' })
    } else if (c.moic !== null && c.moic > 3) {
      items.push({ company: c, reason: 'high-performer' })
    } else if (c.is_stale) {
      items.push({ company: c, reason: 'stale' })
    }
  }
  return items
}

export function AttentionPanel({ companies }: AttentionPanelProps) {
  const items = getAttentionItems(companies)

  if (items.length === 0) return null

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-amber-400" />
          <h3 className="font-heading text-lg font-semibold">Needs Attention</h3>
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
            {items.length}
          </Badge>
        </div>

        <div className="divide-y divide-border">
          {items.slice(0, 5).map((item) => {
            const config = reasonConfig[item.reason]
            const Icon = config.icon
            return (
              <div key={item.company.company_id} className="flex items-center gap-3 py-2.5">
                <div className={cn('p-1.5 rounded-md', config.bgClass)}>
                  <Icon size={14} className={config.iconClass} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.company.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.company.sector || 'Unknown'} · {item.company.vehicle || ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.company.moic !== null && (
                    <span className={cn('text-xs font-mono tabular-nums font-medium', moicColorClass(item.company.moic))}>
                      {formatMoic(item.company.moic)}
                    </span>
                  )}
                  <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', config.badgeClass)}>
                    {config.badge}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {items.length > 5 && (
          <p className="text-xs text-amber-400 mt-2 text-center">
            +{items.length - 5} more items
          </p>
        )}
      </CardContent>
    </Card>
  )
}
