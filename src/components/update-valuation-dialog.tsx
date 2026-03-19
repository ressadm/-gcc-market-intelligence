'use client'

import { useState, useMemo } from 'react'
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
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatCurrencyPrecise } from '@/lib/format'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface UpdateValuationDialogProps {
  companyId: string
  companyName: string
  companyCurrency: string
  currentSharePrice: number | null
  totalShares: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UpdateValuationDialog({
  companyId,
  companyName,
  companyCurrency,
  currentSharePrice,
  totalShares,
  open,
  onOpenChange,
  onSuccess,
}: UpdateValuationDialogProps) {
  const [newPrice, setNewPrice] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [fxRate, setFxRate] = useState('')
  const [saving, setSaving] = useState(false)

  const showFxRate = companyCurrency !== 'CHF'
  const priceNum = Number(newPrice)
  const computedValue = useMemo(
    () => (priceNum && totalShares ? priceNum * totalShares : null),
    [priceNum, totalShares]
  )

  async function handleSubmit() {
    if (!priceNum || priceNum <= 0) {
      toast.error('Share price must be a positive number')
      return
    }
    if (!date) {
      toast.error('Date is required')
      return
    }

    setSaving(true)

    // Create an ADJ transaction — is_cash_event = FALSE per Data Governance
    const record: Record<string, unknown> = {
      company_id: companyId,
      type: 'ADJ',
      amount_orig: computedValue || 0,
      orig_currency: companyCurrency,
      date,
      is_cash_event: false, // ADJ is NEVER a cash event
      price_per_share_orig: priceNum,
      shares: totalShares || 0,
      notes: `Valuation update: ${companyCurrency} ${priceNum}/share`,
    }

    if (fxRate && showFxRate) {
      record.fx_rate_orig_to_chf = Number(fxRate)
    }

    const { error } = await supabase.from('transactions').insert(record)

    setSaving(false)

    if (error) {
      toast.error(`Failed to update valuation: ${error.message}`)
      return
    }

    toast.success(`Valuation updated for ${companyName}`)
    setNewPrice('')
    setDate(new Date().toISOString().split('T')[0])
    setFxRate('')
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Update Valuation</DialogTitle>
          <p className="text-sm text-muted-foreground">{companyName}</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current state */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/10 border border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Current Price</p>
              <p className="font-mono text-sm tabular-nums mt-0.5">
                {currentSharePrice
                  ? formatCurrencyPrecise(currentSharePrice, companyCurrency)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Shares</p>
              <p className="font-mono text-sm tabular-nums mt-0.5">
                {totalShares
                  ? new Intl.NumberFormat('en-CH', { maximumFractionDigits: 3 }).format(totalShares)
                  : '—'}
              </p>
            </div>
          </div>

          {/* New price */}
          <div className="space-y-1.5">
            <Label htmlFor="val-price" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              New Share Price ({companyCurrency})
            </Label>
            <Input
              id="val-price"
              type="number"
              step="0.0001"
              min="0"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="font-mono tabular-nums"
              autoFocus
            />
          </div>

          {/* Computed value preview */}
          {computedValue !== null && computedValue > 0 && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Computed Value</p>
              <p className="font-mono text-lg font-semibold tabular-nums mt-0.5">
                {formatCurrency(computedValue, companyCurrency)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Intl.NumberFormat('en-CH', { maximumFractionDigits: 3 }).format(totalShares || 0)} shares × {formatCurrencyPrecise(priceNum, companyCurrency)}
              </p>
            </div>
          )}

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="val-date" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Valuation Date
            </Label>
            <Input
              id="val-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* FX Rate */}
          {showFxRate && (
            <div className="space-y-1.5">
              <Label htmlFor="val-fx" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                FX Rate ({companyCurrency} → CHF)
              </Label>
              <Input
                id="val-fx"
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
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
            Update Valuation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
