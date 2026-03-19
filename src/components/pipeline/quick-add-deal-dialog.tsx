'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { STAGE_LABELS, STAGE_COLORS, SOURCE_LABELS, PIPELINE_STAGES } from '@/lib/pipeline-constants'
import type { DealStage } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface QuickAddDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const SOURCE_OPTIONS = Object.entries(SOURCE_LABELS)
const SECTOR_OPTIONS = [
  'FinTech', 'HealthTech', 'DeepTech', 'Climate', 'SaaS',
  'E-Commerce', 'EdTech', 'Cybersecurity', 'AI/ML', 'Other',
]

export function QuickAddDealDialog({ open, onOpenChange, onSuccess }: QuickAddDealDialogProps) {
  const [dealName, setDealName] = useState('')
  const [stage, setStage] = useState<DealStage>('discovered')
  const [source, setSource] = useState('')
  const [sector, setSector] = useState('')
  const [oneLiner, setOneLiner] = useState('')
  const [saving, setSaving] = useState(false)

  function reset() {
    setDealName('')
    setStage('discovered')
    setSource('')
    setSector('')
    setOneLiner('')
  }

  async function handleSubmit() {
    if (!dealName.trim()) {
      toast.error('Deal name is required')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('deals').insert({
      deal_name: dealName.trim(),
      stage,
      source_channel: source || null,
      company_sector: sector || null,
      one_liner: oneLiner || null,
    })

    setSaving(false)

    if (error) {
      toast.error(`Failed to create deal: ${error.message}`)
      return
    }

    toast.success(`Deal "${dealName}" added to pipeline`)
    reset()
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Quick Add Deal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Deal Name */}
          <div className="space-y-1.5">
            <Label htmlFor="deal-name" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Deal Name *
            </Label>
            <Input
              id="deal-name"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="Company or deal name"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            />
          </div>

          {/* Stage */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Stage
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer',
                    stage === s
                      ? STAGE_COLORS[s]
                      : 'text-muted-foreground/60 border-border hover:text-muted-foreground'
                  )}
                >
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Source + Sector row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                Source
              </Label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Select...</option>
                {SOURCE_OPTIONS.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                Sector
              </Label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Select...</option>
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* One-liner */}
          <div className="space-y-1.5">
            <Label htmlFor="deal-oneliner" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              One-liner
            </Label>
            <Textarea
              id="deal-oneliner"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              placeholder="Brief description of the company/deal"
              className="h-16 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            Add Deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
