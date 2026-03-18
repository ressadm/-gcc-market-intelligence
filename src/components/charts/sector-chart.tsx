'use client'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SectorBreakdown } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface SectorChartProps {
  data: SectorBreakdown[]
  isLoading?: boolean
}

export function SectorChart({ data, isLoading }: SectorChartProps) {
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
          <h3 className="font-heading text-lg font-semibold mb-4">By Sector</h3>
          <p className="text-muted-foreground text-sm text-center py-12">No data</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.slice(0, 10).map(d => ({
    name: d.sector.length > 15 ? d.sector.slice(0, 15) + '...' : d.sector,
    fullName: d.sector,
    count: d.count,
  }))

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-heading text-lg font-semibold mb-4">By Sector</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
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
              fill="#22C55E"
              radius={[0, 4, 4, 0]}
              isAnimationActive={!prefersReducedMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
