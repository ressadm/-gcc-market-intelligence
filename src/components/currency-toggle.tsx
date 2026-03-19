'use client'

import { cn } from '@/lib/utils'
import type { DisplayCurrency } from '@/lib/types'

interface CurrencyToggleProps {
  value: DisplayCurrency
  onChange: (currency: DisplayCurrency) => void
  className?: string
}

const options: { value: DisplayCurrency; label: string }[] = [
  { value: 'CHF', label: 'CHF' },
  { value: 'USD', label: 'USD' },
]

export function CurrencyToggle({ value, onChange, className }: CurrencyToggleProps) {
  return (
    <div className={cn('flex items-center gap-0.5 bg-muted/70 rounded-md p-0.5 border border-border', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1 rounded text-[13px] font-medium transition-colors duration-100 tabular-nums',
            value === opt.value
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
