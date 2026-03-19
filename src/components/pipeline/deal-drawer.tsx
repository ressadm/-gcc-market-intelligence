'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDealDetail } from '@/hooks/use-deal-detail'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import { STAGE_LABELS, STAGE_COLORS, SOURCE_LABELS, PIPELINE_STAGES } from '@/lib/pipeline-constants'
import type { DealStage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { X, ArrowRight, ThumbsUp, Minus, ThumbsDown, Loader2 } from 'lucide-react'
import { DealActivityTimeline } from '@/components/deal-detail/deal-activity-timeline'
import { CloseDealDialog } from '@/components/pipeline/close-deal-dialog'
import { PassDealDialog } from '@/components/pipeline/pass-deal-dialog'

interface DealDrawerProps {
  dealId: string
  onClose: () => void
  onUpdate?: () => void
}

const NEXT_STAGE: Partial<Record<DealStage, DealStage>> = {
  discovered: 'screening',
  screening: 'evaluating',
  evaluating: 'decision',
  decision: 'committed',
  committed: 'closed',
}

type ThumbValue = 1 | 0 | -1

export function DealDrawer({ dealId, onClose, onUpdate }: DealDrawerProps) {
  const { deal, activities, isLoading, error } = useDealDetail(dealId)
  const [advancing, setAdvancing] = useState(false)
  const [showPassDialog, setShowPassDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const advanceStage = useCallback(async () => {
    if (!deal) return
    const next = NEXT_STAGE[deal.stage]
    if (!next) return

    // If advancing from committed → closed, show the Close Deal dialog
    if (deal.stage === 'committed') {
      setShowCloseDialog(true)
      return
    }

    setAdvancing(true)
    await supabase.from('deals').update({ stage: next }).eq('id', dealId)
    await supabase.from('deal_activities').insert({
      deal_id: dealId,
      activity_type: 'stage_change',
      title: `Advanced from ${STAGE_LABELS[deal.stage]} to ${STAGE_LABELS[next]}`,
    })
    setAdvancing(false)
    onUpdate?.()
    onClose()
  }, [deal, dealId, onClose, onUpdate])

  const updateEvaluation = useCallback(async (field: string, value: ThumbValue) => {
    if (!deal) return
    const current = deal.evaluation_data || {}
    const updated = { ...current, [field]: value }
    await supabase.from('deals').update({ evaluation_data: updated }).eq('id', dealId)
  }, [deal, dealId])

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 h-full w-full sm:w-[480px] bg-background border-l border-border flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-background px-6 py-4 border-b border-border flex items-start justify-between gap-3 z-10">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : deal ? (
            <div>
              <h2 className="font-heading text-lg font-bold">{deal.deal_name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={cn('text-xs', STAGE_COLORS[deal.stage])}>
                  {STAGE_LABELS[deal.stage]}
                </Badge>
                {deal.source_channel && (
                  <span className="text-xs text-muted-foreground">
                    {SOURCE_LABELS[deal.source_channel] || deal.source_channel}
                  </span>
                )}
                {deal.company_sector && (
                  <span className="text-xs text-muted-foreground">{deal.company_sector}</span>
                )}
              </div>
              {deal.one_liner && (
                <p className="text-sm text-muted-foreground mt-2">{deal.one_liner}</p>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Deal not found</span>
          )}
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {isLoading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            </div>
          )}

          {deal && !isLoading && (
            <>
              {/* Deal metrics */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Round', value: deal.round_type || '—' },
                  { label: 'Instrument', value: deal.instrument || '—' },
                  { label: 'Round Size', value: deal.round_size_usd ? formatCurrency(deal.round_size_usd, 'USD') : '—' },
                  { label: 'Pre-Money', value: deal.valuation_pre_usd ? formatCurrency(deal.valuation_pre_usd, 'USD') : '—' },
                ].map(m => (
                  <Card key={m.label}>
                    <CardContent className="p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.label}</p>
                      <p className="font-mono text-[14px] font-semibold tabular-nums mt-1 text-foreground">{m.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Allocation */}
              {deal.allocation_target && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-2">Allocation</p>
                  <p className="font-mono text-sm tabular-nums">
                    {formatCurrency(deal.allocation_target, deal.allocation_currency || 'USD')}
                  </p>
                </div>
              )}

              {/* Evaluation thumbs */}
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-3">Evaluation</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { field: 'team_rating', label: 'Team' },
                    { field: 'market_rating', label: 'Market' },
                    { field: 'product_rating', label: 'Product' },
                    { field: 'traction_rating', label: 'Traction' },
                  ].map(({ field, label }) => {
                    const val = (deal.evaluation_data as Record<string, number> | null)?.[field] as ThumbValue | undefined
                    return (
                      <div key={field} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <div className="flex items-center gap-1">
                          <ThumbButton
                            active={val === 1}
                            onClick={() => updateEvaluation(field, val === 1 ? 0 : 1)}
                            variant="up"
                          />
                          <ThumbButton
                            active={val === 0 || val === undefined}
                            onClick={() => updateEvaluation(field, 0)}
                            variant="neutral"
                          />
                          <ThumbButton
                            active={val === -1}
                            onClick={() => updateEvaluation(field, val === -1 ? 0 : -1)}
                            variant="down"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Decision info */}
              {deal.decision && deal.decision !== 'pending' && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-2">Decision</p>
                  <Badge variant="outline" className={cn('text-xs',
                    deal.decision === 'go' ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  )}>
                    {deal.decision.toUpperCase()}
                  </Badge>
                  {deal.decision_reason && (
                    <p className="text-sm text-muted-foreground mt-1">{deal.decision_reason}</p>
                  )}
                </div>
              )}

              {/* Activity */}
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-3">Activity</p>
                <DealActivityTimeline activities={activities} />
              </div>

              {/* Tags */}
              {deal.tags && deal.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {deal.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action footer */}
        {deal && !isLoading && PIPELINE_STAGES.includes(deal.stage) && (
          <div className="sticky bottom-0 bg-background border-t border-border px-6 py-3 flex items-center gap-2">
            {NEXT_STAGE[deal.stage] && (
              <Button
                onClick={advanceStage}
                disabled={advancing}
                className="flex items-center gap-1.5"
              >
                {advancing && <Loader2 size={14} className="animate-spin" />}
                <ArrowRight size={14} />
                Advance to {STAGE_LABELS[NEXT_STAGE[deal.stage]!]}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowPassDialog(true)}
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              Pass
            </Button>
          </div>
        )}
      </div>

      {deal && (
        <>
          <CloseDealDialog
            deal={deal}
            open={showCloseDialog}
            onOpenChange={setShowCloseDialog}
            onSuccess={() => {
              onUpdate?.()
              onClose()
            }}
          />
          <PassDealDialog
            dealId={dealId}
            dealName={deal.deal_name}
            open={showPassDialog}
            onOpenChange={setShowPassDialog}
            onSuccess={() => {
              onUpdate?.()
              onClose()
            }}
          />
        </>
      )}
    </>
  )
}

function ThumbButton({ active, onClick, variant }: {
  active: boolean
  onClick: () => void
  variant: 'up' | 'neutral' | 'down'
}) {
  const icons = {
    up: ThumbsUp,
    neutral: Minus,
    down: ThumbsDown,
  }
  const activeColors = {
    up: 'text-green-400 bg-green-500/20',
    neutral: 'text-muted-foreground bg-muted',
    down: 'text-red-400 bg-red-500/20',
  }
  const Icon = icons[variant]

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? activeColors[variant] : 'text-muted-foreground/30 hover:text-muted-foreground'
      )}
    >
      <Icon size={14} />
    </button>
  )
}
