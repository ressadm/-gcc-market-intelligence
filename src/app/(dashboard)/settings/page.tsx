'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSettings } from '@/hooks/use-app-settings'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Pencil, Check, X, User, Bell, Shield } from 'lucide-react'

const QUICK_BUDGETS = [500_000, 750_000, 1_000_000, 1_500_000, 2_000_000]

function formatQuickLabel(amount: number): string {
  if (amount >= 1_000_000) return `${amount / 1_000_000}M`
  return `${amount / 1_000}K`
}

export default function SettingsPage() {
  const { settings, isLoading, updateSetting } = useAppSettings()
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [saving, setSaving] = useState(false)

  function startEditing() {
    setBudgetInput(String(settings.investment_budget_chf))
    setEditingBudget(true)
  }

  function cancelEditing() {
    setEditingBudget(false)
    setBudgetInput('')
  }

  async function saveBudget(value?: number) {
    const amount = value ?? Number(budgetInput)
    if (!amount || amount <= 0) {
      toast.error('Budget must be a positive number')
      return
    }
    setSaving(true)
    const ok = await updateSetting('investment_budget_chf', amount)
    setSaving(false)
    if (ok) {
      toast.success(`Budget updated to ${formatCurrency(amount)}`)
      setEditingBudget(false)
    } else {
      toast.error('Failed to save budget. Check if app_settings table exists.')
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <h1 className="font-heading text-[28px] font-bold">Settings</h1>

      {/* Investment Budget */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                Investment Budget
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total capital allocated for angel investments. Feeds the Capital Deployment Bar on the Pipeline page.
              </p>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : editingBudget ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">CHF</span>
                <Input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-48 font-mono tabular-nums"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveBudget()
                    if (e.key === 'Escape') cancelEditing()
                  }}
                />
              </div>
              <Button size="sm" onClick={() => saveBudget()} disabled={saving}>
                <Check size={14} className="mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEditing}>
                <X size={14} className="mr-1" />
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={startEditing}
                className="group flex items-center gap-2 cursor-pointer"
              >
                <span className="font-mono text-2xl font-semibold tabular-nums">
                  {formatCurrency(settings.investment_budget_chf)}
                </span>
                <Pencil
                  size={14}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>
            </div>
          )}

          {/* Quick-set buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Quick set:</span>
            {QUICK_BUDGETS.map((amount) => (
              <button
                key={amount}
                onClick={() => saveBudget(amount)}
                disabled={saving}
                className={cn(
                  'px-3 py-1 text-xs font-mono rounded-md border transition-colors',
                  settings.investment_budget_chf === amount
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
                )}
              >
                {formatQuickLabel(amount)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PlaceholderCard
          icon={User}
          title="Profile"
          description="Manage your profile information and preferences."
        />
        <PlaceholderCard
          icon={Bell}
          title="Notifications"
          description="Configure alert preferences and agent notification rules."
        />
        <PlaceholderCard
          icon={Shield}
          title="Security"
          description="Authentication settings and session management."
        />
      </div>
    </div>
  )
}

function PlaceholderCard({ icon: Icon, title, description }: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>
  title: string
  description: string
}) {
  return (
    <Card className="opacity-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
            <Icon size={16} className="text-muted-foreground" />
          </div>
          <h3 className="font-heading text-sm font-semibold">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-3 uppercase tracking-wide">Coming soon</p>
      </CardContent>
    </Card>
  )
}
