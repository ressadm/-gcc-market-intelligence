'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import type { AgentInsight, InsightPriority, InsightType } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  TrendingDown,
  Clock,
  Zap,
  Newspaper,
  BarChart3,
  FileText,
  X,
  Bell,
} from 'lucide-react'
import Link from 'next/link'

interface InsightsPanelProps {
  insights: AgentInsight[]
  isLoading: boolean
  onDismiss: (id: string) => void
  onMarkRead: (id: string) => void
}

const priorityStyles: Record<InsightPriority, string> = {
  critical: 'border-l-red-500 bg-red-500/5',
  warning: 'border-l-amber-500 bg-amber-500/5',
  info: 'border-l-blue-500 bg-blue-500/5',
}

const priorityBadgeStyles: Record<InsightPriority, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const typeIcons: Record<InsightType, typeof AlertTriangle> = {
  stale_valuation: Clock,
  fx_impact: TrendingDown,
  deal_alert: Zap,
  portfolio_change: BarChart3,
  follow_on_signal: Zap,
  aging_alert: Clock,
  market_news: Newspaper,
  performance_alert: AlertTriangle,
  daily_summary: FileText,
  weekly_digest: FileText,
}

const typeLabels: Record<InsightType, string> = {
  stale_valuation: 'Stale Valuation',
  fx_impact: 'FX Impact',
  deal_alert: 'Deal Alert',
  portfolio_change: 'Portfolio',
  follow_on_signal: 'Follow-On',
  aging_alert: 'Aging',
  market_news: 'Market News',
  performance_alert: 'Performance',
  daily_summary: 'Daily Summary',
  weekly_digest: 'Weekly Digest',
}

export function InsightsPanel({ insights, isLoading, onDismiss, onMarkRead }: InsightsPanelProps) {
  if (isLoading) return <InsightsSkeleton />

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-muted-foreground" />
            <h3 className="font-heading text-lg font-semibold">Agent Insights</h3>
          </div>
          <p className="text-sm text-muted-foreground/50 text-center py-6">
            No insights yet. Agents will surface alerts here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const unread = insights.filter(i => !i.is_read)
  const read = insights.filter(i => i.is_read)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-muted-foreground" />
            <h3 className="font-heading text-lg font-semibold">Agent Insights</h3>
            {unread.length > 0 && (
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs">
                {unread.length} new
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {unread.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={onDismiss}
              onMarkRead={onMarkRead}
            />
          ))}
          {read.length > 0 && unread.length > 0 && (
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider pt-2 pb-1">
              Earlier
            </p>
          )}
          {read.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={onDismiss}
              onMarkRead={onMarkRead}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function InsightCard({
  insight,
  onDismiss,
  onMarkRead,
}: {
  insight: AgentInsight
  onDismiss: (id: string) => void
  onMarkRead: (id: string) => void
}) {
  const Icon = typeIcons[insight.insight_type] || AlertTriangle

  const content = (
    <div
      className={cn(
        'rounded-lg border-l-2 p-3 transition-colors',
        priorityStyles[insight.priority],
        !insight.is_read && 'ring-1 ring-border/50',
        insight.is_read && 'opacity-60'
      )}
      onClick={() => {
        if (!insight.is_read) onMarkRead(insight.id)
      }}
    >
      <div className="flex items-start gap-2">
        <Icon size={14} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Badge variant="outline" className={cn('text-[9px] px-1 py-0', priorityBadgeStyles[insight.priority])}>
              {typeLabels[insight.insight_type]}
            </Badge>
            <span className="text-[10px] text-muted-foreground/50">
              {formatDate(insight.created_at)}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground leading-tight">
            {insight.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {insight.body}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onDismiss(insight.id)
          }}
          className="p-0.5 text-muted-foreground/40 hover:text-foreground transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )

  if (insight.action_url) {
    return <Link href={insight.action_url}>{content}</Link>
  }

  return content
}

function InsightsSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  )
}
