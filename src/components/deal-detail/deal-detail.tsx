'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { formatCurrency, formatDate } from '@/lib/format'
import { STAGE_LABELS, STAGE_COLORS, SOURCE_LABELS } from '@/lib/pipeline-constants'
import type { Deal, DealActivity } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { DealActivityTimeline } from './deal-activity-timeline'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DealDetailProps {
  deal: Deal
  activities: DealActivity[]
}

export function DealDetail({ deal, activities }: DealDetailProps) {
  const prefersReducedMotion = useReducedMotion()

  const metrics = [
    {
      label: 'Round Size',
      value: deal.round_size_usd ? formatCurrency(deal.round_size_usd, 'USD') : null,
    },
    {
      label: 'Pre-Money',
      value: deal.valuation_pre_usd ? formatCurrency(deal.valuation_pre_usd, 'USD') : null,
    },
    {
      label: 'Allocation',
      value: deal.allocation_target
        ? formatCurrency(deal.allocation_target, deal.allocation_currency || 'USD')
        : null,
    },
    {
      label: 'Instrument',
      value: deal.instrument,
    },
  ]

  const evalData = deal.evaluation_data
  const hasEval = evalData && (
    evalData.team_rating || evalData.market_rating ||
    evalData.product_rating || evalData.traction_rating
  )

  const evalChartData = hasEval
    ? [
        { name: 'Team', score: evalData!.team_rating || 0 },
        { name: 'Market', score: evalData!.market_rating || 0 },
        { name: 'Product', score: evalData!.product_rating || 0 },
        { name: 'Traction', score: evalData!.traction_rating || 0 },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/pipeline"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Pipeline
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-heading text-2xl font-bold">{deal.deal_name}</h1>
          <Badge variant="outline" className={cn('text-xs', STAGE_COLORS[deal.stage])}>
            {STAGE_LABELS[deal.stage]}
          </Badge>
        </div>
        {deal.one_liner && (
          <p className="text-sm text-muted-foreground">{deal.one_liner}</p>
        )}
        <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
          {deal.source_channel && (
            <span>{SOURCE_LABELS[deal.source_channel] || deal.source_channel}</span>
          )}
          {deal.company_sector && <span>{deal.company_sector}</span>}
          {deal.round_type && <span>{deal.round_type}</span>}
          <span>Added {formatDate(deal.created_at)}</span>
        </div>
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {deal.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-xl font-mono font-semibold mt-1 tabular-nums text-foreground">
                {m.value || '—'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decision info */}
      {deal.decision && deal.decision !== 'pending' && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <h3 className="font-heading text-lg font-semibold">Decision</h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  deal.decision === 'go'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                )}
              >
                {deal.decision.toUpperCase()}
              </Badge>
              {deal.decision_confidence && (
                <span className="text-xs text-muted-foreground">
                  {deal.decision_confidence}% confidence
                </span>
              )}
              {deal.decision_date && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(deal.decision_date)}
                </span>
              )}
            </div>
            {deal.decision_reason && (
              <p className="text-sm text-muted-foreground">{deal.decision_reason}</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evaluation */}
        {hasEval && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-heading text-lg font-semibold mb-4">Evaluation</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={evalChartData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis
                    type="number"
                    domain={[0, 10]}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    tickCount={6}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                    }}
                    formatter={(value) => [`${value}/10`, 'Score']}
                  />
                  <Bar
                    dataKey="score"
                    fill="#6366F1"
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={!prefersReducedMotion}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* AI Score */}
        {deal.agent_score_json?.overall_score && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-heading text-lg font-semibold mb-4">AI Assessment</h3>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-mono font-bold text-primary tabular-nums">
                  {deal.agent_score_json.overall_score}/10
                </span>
              </div>
              {deal.agent_score_json.recommendation && (
                <p className="text-sm text-muted-foreground mt-2">
                  {deal.agent_score_json.recommendation}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Activity</h3>
          <DealActivityTimeline activities={activities} />
        </CardContent>
      </Card>
    </div>
  )
}
