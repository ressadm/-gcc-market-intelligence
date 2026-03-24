'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { STAGE_LABELS, STAGE_COLORS, SOURCE_LABELS, PIPELINE_STAGES } from '@/lib/pipeline-constants'
import type { Deal, DealStage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface EditDealDialogProps {
  deal: Deal
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const sourceOptions = Object.keys(SOURCE_LABELS)
const instrumentOptions = ['equity', 'safe', 'convertible_note', 'token_warrant']
const instrumentLabels: Record<string, string> = {
  equity: 'Equity',
  safe: 'SAFE',
  convertible_note: 'Convertible Note',
  token_warrant: 'Token Warrant',
}
const roundOptions = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C']

export function EditDealDialog({ deal, open, onOpenChange, onSuccess }: EditDealDialogProps) {
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    deal_name: '',
    stage: 'discovered' as DealStage,
    source_channel: '',
    company_sector: '',
    one_liner: '',
    company_description: '',
    company_website: '',
    company_linkedin: '',
    company_location: '',
    company_founded: '',
    round_type: '',
    round_size_usd: '',
    valuation_pre_usd: '',
    instrument: '',
    allocation_target: '',
  })

  // Reset form when dialog opens with fresh deal data
  useEffect(() => {
    if (open && deal) {
      setForm({
        deal_name: deal.deal_name || '',
        stage: deal.stage,
        source_channel: deal.source_channel || '',
        company_sector: deal.company_sector || '',
        one_liner: deal.one_liner || '',
        company_description: deal.company_description || '',
        company_website: deal.company_website || '',
        company_linkedin: deal.company_linkedin || '',
        company_location: deal.company_location || '',
        company_founded: deal.company_founded || '',
        round_type: deal.round_type || '',
        round_size_usd: deal.round_size_usd?.toString() || '',
        valuation_pre_usd: deal.valuation_pre_usd?.toString() || '',
        instrument: deal.instrument || '',
        allocation_target: deal.allocation_target?.toString() || '',
      })
    }
  }, [open, deal])

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.deal_name.trim()) {
      toast.error('Deal name is required')
      return
    }

    setSaving(true)
    const payload: Record<string, unknown> = {
      deal_name: form.deal_name.trim(),
      stage: form.stage,
      source_channel: form.source_channel || null,
      company_sector: form.company_sector.trim() || null,
      one_liner: form.one_liner.trim() || null,
      company_description: form.company_description.trim() || null,
      company_website: form.company_website.trim() || null,
      company_linkedin: form.company_linkedin.trim() || null,
      company_location: form.company_location.trim() || null,
      company_founded: form.company_founded.trim() || null,
      round_type: form.round_type || null,
      round_size_usd: form.round_size_usd ? Number(form.round_size_usd) : null,
      valuation_pre_usd: form.valuation_pre_usd ? Number(form.valuation_pre_usd) : null,
      instrument: form.instrument || null,
      allocation_target: form.allocation_target ? Number(form.allocation_target) : null,
    }

    const { error } = await supabase
      .from('deals')
      .update(payload)
      .eq('id', deal.id)

    if (error) {
      toast.error(`Save failed: ${error.message}`)
      setSaving(false)
      return
    }

    // Log activity if stage changed
    if (form.stage !== deal.stage) {
      await supabase.from('deal_activities').insert({
        deal_id: deal.id,
        activity_type: 'stage_change',
        title: `Stage changed from ${STAGE_LABELS[deal.stage]} to ${STAGE_LABELS[form.stage]}`,
      })
    }

    toast.success('Deal updated')
    setSaving(false)
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
          <DialogDescription>Update deal information and company profile.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Core fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Core</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deal Name *</label>
              <Input value={form.deal_name} onChange={(e) => update('deal_name', e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">One-liner</label>
              <Input value={form.one_liner} onChange={(e) => update('one_liner', e.target.value)} placeholder="Brief description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sector</label>
                <Input value={form.company_sector} onChange={(e) => update('company_sector', e.target.value)} placeholder="e.g. Healthcare, SaaS" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <div className="flex flex-wrap gap-1.5">
                  {PIPELINE_STAGES.map((s) => (
                    <button key={s} type="button" onClick={() => update('stage', s)} className="focus:outline-none">
                      <Badge variant="outline" className={cn('text-xs cursor-pointer transition-opacity', form.stage === s ? STAGE_COLORS[s] : 'opacity-40 hover:opacity-70')}>
                        {STAGE_LABELS[s]}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <div className="flex flex-wrap gap-1.5">
                {sourceOptions.map((s) => (
                  <Button key={s} type="button" variant={form.source_channel === s ? 'secondary' : 'ghost'} size="sm"
                    onClick={() => update('source_channel', form.source_channel === s ? '' : s)}
                    className={cn('text-xs', form.source_channel === s && 'font-medium')}
                  >
                    {SOURCE_LABELS[s]}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Company Profile */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Company Profile</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.company_description} onChange={(e) => update('company_description', e.target.value)} placeholder="What does the company do?" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input value={form.company_website} onChange={(e) => update('company_website', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">LinkedIn</label>
                <Input value={form.company_linkedin} onChange={(e) => update('company_linkedin', e.target.value)} placeholder="https://linkedin.com/company/..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">HQ Location</label>
                <Input value={form.company_location} onChange={(e) => update('company_location', e.target.value)} placeholder="e.g. Zurich, Switzerland" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Founded</label>
                <Input value={form.company_founded} onChange={(e) => update('company_founded', e.target.value)} placeholder="e.g. 2021" />
              </div>
            </div>
          </div>

          {/* Round details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Round Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Round Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {roundOptions.map((r) => (
                    <Button key={r} type="button" variant={form.round_type === r ? 'secondary' : 'ghost'} size="sm"
                      onClick={() => update('round_type', form.round_type === r ? '' : r)}
                      className={cn('text-xs', form.round_type === r && 'font-medium')}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instrument</label>
                <div className="flex flex-wrap gap-1.5">
                  {instrumentOptions.map((i) => (
                    <Button key={i} type="button" variant={form.instrument === i ? 'secondary' : 'ghost'} size="sm"
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
                <label className="text-sm font-medium">Round Size (USD)</label>
                <Input type="number" value={form.round_size_usd} onChange={(e) => update('round_size_usd', e.target.value)} placeholder="4,000,000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pre-Money (USD)</label>
                <Input type="number" value={form.valuation_pre_usd} onChange={(e) => update('valuation_pre_usd', e.target.value)} placeholder="16,000,000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Allocation (USD)</label>
                <Input type="number" value={form.allocation_target} onChange={(e) => update('allocation_target', e.target.value)} placeholder="50,000" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
