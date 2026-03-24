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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/format'
import { STAGE_LABELS } from '@/lib/pipeline-constants'
import type { Deal } from '@/lib/types'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'

interface CloseDealDialogProps {
  deal: Deal
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const CURRENCY_OPTIONS = ['CHF', 'EUR', 'USD', 'GBP', 'MYR']

export function CloseDealDialog({ deal, open, onOpenChange, onSuccess }: CloseDealDialogProps) {
  const [investmentAmount, setInvestmentAmount] = useState(
    deal.allocation_target ? String(deal.allocation_target) : ''
  )
  const [currency, setCurrency] = useState(deal.allocation_currency || 'CHF')
  const [shares, setShares] = useState('')
  const [pricePerShare, setPricePerShare] = useState('')
  const [fxRate, setFxRate] = useState('')
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const showFxRate = currency !== 'CHF'

  async function handleClose() {
    const amount = Number(investmentAmount)
    if (!amount || amount <= 0) {
      toast.error('Investment amount is required')
      return
    }
    if (!txnDate) {
      toast.error('Transaction date is required')
      return
    }

    setSaving(true)

    try {
      // Step 1: Create company record (or find existing if deal already linked)
      let companyId = deal.company_id

      if (!companyId) {
        const { data: newCompany, error: companyErr } = await supabase
          .from('companies')
          .insert({
            name: deal.deal_name,
            status: 'Active',
            sector: deal.company_sector || null,
            vehicle: deal.source_channel === 'verve_coinvest' ? 'fiduciary' : 'spv',
          })
          .select('id')
          .single()

        if (companyErr) throw new Error(`Failed to create company: ${companyErr.message}`)
        companyId = newCompany.id
      }

      // Step 2: Create initial EQT transaction — is_cash_event = TRUE
      const txnRecord: Record<string, unknown> = {
        company_id: companyId,
        type: 'EQT',
        amount_orig: amount,
        orig_currency: currency,
        date: txnDate,
        is_cash_event: true, // EQT is ALWAYS a cash event
        notes: `Initial investment via deal: ${deal.deal_name}`,
      }
      if (shares) txnRecord.shares = Number(shares)
      if (pricePerShare) txnRecord.price_per_share_orig = Number(pricePerShare)
      if (fxRate && showFxRate) txnRecord.fx_rate_orig_to_chf = Number(fxRate)

      const { error: txnErr } = await supabase
        .from('transactions')
        .insert(txnRecord)
        .select('id')
        .single()

      if (txnErr) throw new Error(`Failed to create transaction: ${txnErr.message}`)

      // Step 3: Update deal — set stage to closed, link company and transaction
      const { error: dealErr } = await supabase
        .from('deals')
        .update({
          stage: 'closed',
          company_id: companyId,
          decision: 'go',
          decision_date: new Date().toISOString(),
        })
        .eq('id', deal.id)

      if (dealErr) throw new Error(`Failed to close deal: ${dealErr.message}`)

      // Step 4: Log activity
      await supabase.from('deal_activities').insert({
        deal_id: deal.id,
        activity_type: 'deal_closed',
        title: `Deal closed — ${formatCurrency(amount, currency)} invested`,
        content: `Company created and linked. Initial EQT transaction recorded.`,
      })

      toast.success(`Deal "${deal.deal_name}" closed — now in portfolio`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to close deal')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            Close Deal
            <ArrowRight size={16} className="text-muted-foreground" />
            <span className="text-green-400">Portfolio</span>
          </DialogTitle>
          <DialogDescription>
            This will create a company record and initial investment transaction, moving {deal.deal_name} from the pipeline to your portfolio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Deal summary */}
          <div className="p-3 rounded-lg bg-muted/10 border border-border">
            <p className="text-sm font-medium">{deal.deal_name}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {deal.round_type && <span>{deal.round_type}</span>}
              {deal.company_sector && <span>{deal.company_sector}</span>}
              <span>{STAGE_LABELS[deal.stage]} → Closed</span>
            </div>
          </div>

          {/* Investment Amount + Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="close-amount" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                Investment Amount
              </Label>
              <Input
                id="close-amount"
                type="number"
                step="0.01"
                min="0"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className="font-mono tabular-nums"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                Currency
              </Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="close-date" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Investment Date
            </Label>
            <Input
              id="close-date"
              type="date"
              value={txnDate}
              onChange={(e) => setTxnDate(e.target.value)}
            />
          </div>

          {/* Shares + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="close-shares" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                Shares
              </Label>
              <Input
                id="close-shares"
                type="number"
                step="0.001"
                min="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="font-mono tabular-nums"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="close-price" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                Price/Share
              </Label>
              <Input
                id="close-price"
                type="number"
                step="0.0001"
                min="0"
                value={pricePerShare}
                onChange={(e) => setPricePerShare(e.target.value)}
                className="font-mono tabular-nums"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* FX Rate */}
          {showFxRate && (
            <div className="space-y-1.5">
              <Label htmlFor="close-fx" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                FX Rate ({currency} → CHF)
              </Label>
              <Input
                id="close-fx"
                type="number"
                step="0.0001"
                min="0"
                value={fxRate}
                onChange={(e) => setFxRate(e.target.value)}
                placeholder="1.0750"
                className="font-mono tabular-nums w-32"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleClose} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            Close Deal & Add to Portfolio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
