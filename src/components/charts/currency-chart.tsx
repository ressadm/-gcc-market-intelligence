'use client'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import type { CurrencyBreakdown } from '@/lib/types'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS: Record<string, string> = {
  CHF: '#22C55E',
  EUR: '#3B82F6',
  USD: '#F59E0B',
  GBP: '#8B5CF6',
  MYR: '#EC4899',
}

interface CurrencyChartProps {
  data: CurrencyBreakdown[]
  isLoading?: boolean
}

export function CurrencyChart({ data, isLoading }: CurrencyChartProps) {
  const prefersReducedMotion = useReducedMotion()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-heading text-lg font-semibold mb-4">By Currency</h3>
          <p className="text-muted-foreground text-sm text-center py-12">No data</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(d => ({
    name: d.currency,
    value: d.investedCHF,
    count: d.count,
  }))

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-heading text-lg font-semibold mb-4">By Currency</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              isAnimationActive={!prefersReducedMotion}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] || '#6B7280'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#F8FAFC',
              }}
              formatter={(value, name) => {
                const v = Number(value)
                return [`${formatCurrency(v)} (${((v / total) * 100).toFixed(1)}%)`, String(name)]
              }}
            />
            <Legend
              formatter={(value: string) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
