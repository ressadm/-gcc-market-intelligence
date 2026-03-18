export function formatCurrency(amount: number, currency: string = 'CHF'): string {
  return `${currency} ${new Intl.NumberFormat('en-CH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount))}`
}

export function formatCurrencyPrecise(amount: number, currency: string = 'CHF'): string {
  return `${currency} ${new Intl.NumberFormat('en-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

export function formatMoic(moic: number | null): string {
  if (moic === null || moic === undefined) return '—'
  return `${moic.toFixed(2)}x`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function moicColorClass(moic: number | null): string {
  if (moic === null) return 'text-muted-foreground'
  if (moic >= 2) return 'text-green-400'
  if (moic >= 1) return 'text-green-500'
  if (moic >= 0.25) return 'text-red-400'
  return 'text-red-500'
}

export function valueColorClass(value: number): string {
  if (value > 0) return 'text-green-500'
  if (value < 0) return 'text-red-500'
  return 'text-muted-foreground'
}

export function formatDaysAgo(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return '1 day'
  return `${days} days`
}
