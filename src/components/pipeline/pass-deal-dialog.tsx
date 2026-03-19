'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface PassDealDialogProps {
  dealId: string
  dealName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const QUICK_REASONS = [
  'Valuation too high',
  'Not in thesis scope',
  'Weak unit economics',
  'Timing not right',
  'Insufficient traction',
]

export function PassDealDialog({ dealId, dealName, open, onOpenChange, onSuccess }: PassDealDialogProps) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  async function handlePass() {
    setSaving(true)

    const { error: dealErr } = await supabase.from('deals').update({
      stage: 'passed',
      decision: 'pass',
      decision_reason: reason || null,
      decision_date: new Date().toISOString(),
    }).eq('id', dealId)

    if (dealErr) {
      toast.error(`Failed to pass deal: ${dealErr.message}`)
      setSaving(false)
      return
    }

    await supabase.from('deal_activities').insert({
      deal_id: dealId,
      activity_type: 'decision',
      title: 'Passed',
      content: reason || null,
    })

    setSaving(false)
    toast.success(`Deal "${dealName}" passed`)
    setReason('')
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-red-400">Pass on Deal</DialogTitle>
          <DialogDescription>
            Mark {dealName} as passed. This moves it out of the active pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick reason chips */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Quick Reason
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                    reason === r
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'text-muted-foreground/60 border-border hover:text-muted-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom reason */}
          <div className="space-y-1.5">
            <Label htmlFor="pass-reason" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Reason (optional)
            </Label>
            <Textarea
              id="pass-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you passing on this deal?"
              className="h-20 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handlePass}
            disabled={saving}
          >
            {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            Confirm Pass
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
