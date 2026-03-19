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
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface AddTransactionDialogProps {
  companyId: string
  companyName: string
  companyCurrency: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type TransactionType = 'EQT' | 'SAFE' | 'CVL' | 'RECAP' | 'ADJ' | 'DIST' | 'EXIT'

// CRITICAL: is_cash_event rules from Data Governance
const CASH_EVENT_TYPES: TransactionType[] = ['EQT', 'SAFE', 'CVL', 'RECAP']
const NON_CASH_TYPES: TransactionType[] = ['ADJ', 'DIST', 'EXIT']
const ALL_TYPES: TransactionType[] = [...CASH_EVENT_TYPES, ...NON_CASH_TYPES]

const TYPE_LABELS: Record<TransactionType, string> = {
  EQT: 'Equity Investment',
  SAFE: 'SAFE Note',
  CVL: 'Convertible Note',
  RECAP: 'Recapitalization',
  ADJ: 'Valuation Adjustment',
  DIST: 'Distribution',
  EXIT: 'Exit / Sale',
}

const TYPE_BADGE_COLORS: Record<TransactionType, string> = {
  EQT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SAFE: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  CVL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  RECAP: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ADJ: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  DIST: 'bg-green-500/20 text-green-400 border-green-500/30',
  EXIT: 'bg-green-700/20 text-green-600 border-green-700/30',
}

export function AddTransactionDialog({
  companyId,
  companyName,
  companyCurrency,
  open,
  onOpenChange,
  onSuccess,
}: AddTransactionDialogProps) {
  const [type, setType] = useState<TransactionType>('EQT')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [shares, setShares] = useState('')
  const [pricePerShare, setPricePerShare] = useState('')
  const [fxRate, setFxRate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const isCashEvent = CASH_EVENT_TYPES.includes(type)
  const showShares = ['EQT', 'CVL', 'EXIT'].includes(type)
  const showFxRate = companyCurrency !== 'CHF'

  function reset() {
    setType('EQT')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setShares('')
    setPricePerShare('')
    setFxRate('')
    setNotes('')
  }

  async function handleSubmit() {
    const amountNum = Number(amount)
    if (!amountNum || amountNum <= 0) {
      toast.error('Amount must be a positive number')
      return
    }
    if (!date) {
      toast.error('Date is required')
      return
    }

    setSaving(true)

    const record: Record<string, unknown> = {
      company_id: companyId,
      type,
      amount_orig: amountNum,
      orig_currency: companyCurrency,
      date,
      is_cash_event: isCashEvent,
      notes: notes || null,
    }

    if (shares) record.shares = Number(shares)
    if (pricePerShare) record.price_per_share_orig = Number(pricePerShare)
    if (fxRate && showFxRate) {
      record.fx_rate_orig_to_chf = Number(fxRate)
    }

    const { error } = await supabase.from('transactions').insert(record)

    setSaving(false)

    if (error) {
      toast.error(`Failed to add transaction: ${error.message}`)
      return
    }

    toast.success(`${TYPE_LABELS[type]} added for ${companyName}`)
    reset()
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Add Transaction</DialogTitle>
          <p className="text-sm text-muted-foreground">{companyName}</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Type
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer',
                    type === t
                      ? TYPE_BADGE_COLORS[t]
                      : 'text-muted-foreground/60 border-border hover:text-muted-foreground'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge
                variant="outline"
                className={cn('text-[10px]', isCashEvent
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                )}
              >
                {isCashEvent ? 'Cash Event' : 'Non-cash'}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {TYPE_LABELS[type]}
              </span>
            </div>
          </div>

          {/* Amount + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="txn-amount" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                Amount ({companyCurrency})
              </Label>
              <Input
                id="txn-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50,000"
                className="font-mono tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txn-date" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                Date
              </Label>
              <Input
                id="txn-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Shares + Price/Share (conditional) */}
          {showShares && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="txn-shares" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                  Shares
                </Label>
                <Input
                  id="txn-shares"
                  type="number"
                  step="0.001"
                  min="0"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="font-mono tabular-nums"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txn-price" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                  Price/Share ({companyCurrency})
                </Label>
                <Input
                  id="txn-price"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={pricePerShare}
                  onChange={(e) => setPricePerShare(e.target.value)}
                  className="font-mono tabular-nums"
                />
              </div>
            </div>
          )}

          {/* FX Rate (for non-CHF companies) */}
          {showFxRate && (
            <div className="space-y-1.5">
              <Label htmlFor="txn-fx" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                FX Rate ({companyCurrency} → CHF)
              </Label>
              <Input
                id="txn-fx"
                type="number"
                step="0.0001"
                min="0"
                value={fxRate}
                onChange={(e) => setFxRate(e.target.value)}
                placeholder="1.0750"
                className="font-mono tabular-nums w-32"
              />
              <p className="text-[10px] text-muted-foreground">
                Historical rate at transaction date. Locked after save.
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="txn-notes" className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Notes
            </Label>
            <Textarea
              id="txn-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Round name, co-investors, etc."
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
            Add Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
