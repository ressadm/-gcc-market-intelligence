'use client'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { StageBreakdown } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface StageChartProps {
  data: StageBreakdown[]
  isLoading?: boolean
}

export function StageChart({ data, isLoading }: StageChartProps) {
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
          <h3 className="font-heading text-lg font-semibold mb-4">By Status</h3>
          <p className="text-muted-foreground text-sm text-center py-12">No data</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(d => ({
    name: d.stage.length > 12 ? d.stage.slice(0, 12) + '…' : d.stage,
    fullName: d.stage,
    count: d.count,
  }))

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-heading text-lg font-semibold mb-4">By Status</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#F8FAFC',
              }}
              formatter={(value) => [`${value} companies`, 'Count']}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.name === label)
                return item?.fullName || label
              }}
            />
            <Bar
              dataKey="count"
              fill="#6366F1"
              radius={[0, 4, 4, 0]}
              isAnimationActive={!prefersReducedMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
