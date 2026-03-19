'use client'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SourceBreakdown } from '@/lib/types'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface SourceChartProps {
  data: SourceBreakdown[]
  isLoading?: boolean
}

const SOURCE_COLORS: Record<string, string> = {
  Verve: '#1D87C9',
  Direct: '#F59E0B',
  'LP Fund': '#22C55E',
  Unknown: '#64748B',
}

export function SourceChart({ data, isLoading }: SourceChartProps) {
  const prefersReducedMotion = useReducedMotion()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-5 w-28 mb-4" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-heading text-lg font-semibold mb-4">By Source</h3>
          <p className="text-muted-foreground text-sm text-center py-12">No data</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(d => ({
    name: d.source,
    value: d.count,
    invested: d.investedCHF,
  }))

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-heading text-lg font-semibold mb-4">By Source</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              nameKey="name"
              isAnimationActive={!prefersReducedMotion}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={SOURCE_COLORS[entry.name] || '#64748B'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#F8FAFC',
              }}
              formatter={(value) => [`${value} companies`, 'Count']}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
