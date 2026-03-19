'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { STAGE_LABELS, STAGE_COLORS, SOURCE_LABELS, PIPELINE_STAGES } from '@/lib/pipeline-constants'
import type { DealStage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowLeft, Loader2 } from 'lucide-react'

const sourceOptions = Object.keys(SOURCE_LABELS)
const instrumentOptions = ['equity', 'safe', 'convertible_note', 'token_warrant']
const instrumentLabels: Record<string, string> = {
  equity: 'Equity',
  safe: 'SAFE',
  convertible_note: 'Convertible Note',
  token_warrant: 'Token Warrant',
}
const roundOptions = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C']

export default function NewDealPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    deal_name: '',
    stage: 'discovered' as DealStage,
    source_channel: '',
    company_sector: '',
    one_liner: '',
    round_type: '',
    round_size_usd: '',
    valuation_pre_usd: '',
    instrument: '',
    allocation_target: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.deal_name.trim()) {
      setError('Deal name is required')
      return
    }

    setSaving(true)
    setError(null)

    const payload: Record<string, unknown> = {
      deal_name: form.deal_name.trim(),
      stage: form.stage,
    }

    if (form.source_channel) payload.source_channel = form.source_channel
    if (form.company_sector) payload.company_sector = form.company_sector.trim()
    if (form.one_liner) payload.one_liner = form.one_liner.trim()
    if (form.round_type) payload.round_type = form.round_type
    if (form.round_size_usd) payload.round_size_usd = Number(form.round_size_usd)
    if (form.valuation_pre_usd) payload.valuation_pre_usd = Number(form.valuation_pre_usd)
    if (form.instrument) payload.instrument = form.instrument
    if (form.allocation_target) payload.allocation_target = Number(form.allocation_target)

    const { data, error: insertError } = await supabase
      .from('deals')
      .insert(payload)
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push(`/pipeline/${data.id}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/pipeline"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Pipeline
      </Link>

      <h1 className="font-heading text-2xl font-bold">New Deal</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Core fields */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Deal Name *</label>
              <Input
                value={form.deal_name}
                onChange={(e) => update('deal_name', e.target.value)}
                placeholder="Company or deal name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">One-liner</label>
              <Input
                value={form.one_liner}
                onChange={(e) => update('one_liner', e.target.value)}
                placeholder="Brief description of what they do"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sector</label>
                <Input
                  value={form.company_sector}
                  onChange={(e) => update('company_sector', e.target.value)}
                  placeholder="e.g. Healthcare, SaaS"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Stage</label>
                <div className="flex flex-wrap gap-1.5">
                  {PIPELINE_STAGES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('stage', s)}
                      className="focus:outline-none"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs cursor-pointer transition-opacity',
                          form.stage === s
                            ? STAGE_COLORS[s]
                            : 'opacity-40 hover:opacity-70'
                        )}
                      >
                        {STAGE_LABELS[s]}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Source</label>
              <div className="flex flex-wrap gap-1.5">
                {sourceOptions.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={form.source_channel === s ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => update('source_channel', form.source_channel === s ? '' : s)}
                    className={cn('text-xs', form.source_channel === s && 'font-medium')}
                  >
                    {SOURCE_LABELS[s]}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Round details */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider">Round Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Round Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {roundOptions.map((r) => (
                    <Button
                      key={r}
                      type="button"
                      variant={form.round_type === r ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => update('round_type', form.round_type === r ? '' : r)}
                      className={cn('text-xs', form.round_type === r && 'font-medium')}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Instrument</label>
                <div className="flex flex-wrap gap-1.5">
                  {instrumentOptions.map((i) => (
                    <Button
                      key={i}
                      type="button"
                      variant={form.instrument === i ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => update('instrument', form.instrument === i ? '' : i)}
                      className={cn('text-xs', form.instrument === i && 'font-medium')}
                    >
                      {instrumentLabels[i]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Round Size (USD)</label>
                <Input
                  type="number"
                  value={form.round_size_usd}
                  onChange={(e) => update('round_size_usd', e.target.value)}
                  placeholder="4,000,000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Pre-Money (USD)</label>
                <Input
                  type="number"
                  value={form.valuation_pre_usd}
                  onChange={(e) => update('valuation_pre_usd', e.target.value)}
                  placeholder="16,000,000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Allocation (USD)</label>
                <Input
                  type="number"
                  value={form.allocation_target}
                  onChange={(e) => update('allocation_target', e.target.value)}
                  placeholder="50,000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="flex items-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Creating...' : 'Create Deal'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push('/pipeline')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
