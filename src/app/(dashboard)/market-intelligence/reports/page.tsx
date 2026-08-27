'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  useMarketIntelligenceStats, 
  useMarketNews, 
  useMarketTrends,
  useGCCCompanies,
  useIntelligenceReports 
} from '@/hooks/use-market-intelligence'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap
} from 'lucide-react'
import { 
  analyzeCategoryTrends,
  generateCountryInsights,
  calculateMarketMomentum,
  generateExecutiveSummary,
  generateNewsTimeSeries
} from '@/lib/services/analytics-service'
import { GCCCountry } from '@/lib/market-intelligence-types'

const COUNTRY_LABELS: Record<GCCCountry, string> = {
  saudi_arabia: 'Saudi Arabia',
  uae: 'UAE',
  qatar: 'Qatar',
  kuwait: 'Kuwait',
  bahrain: 'Bahrain',
  oman: 'Oman'
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  
  const { stats, isLoading: statsLoading } = useMarketIntelligenceStats()
  const { reports, isLoading: reportsLoading } = useIntelligenceReports({ published: true }, 10)
  
  // Fetch news for current and previous periods for trend analysis
  const periodDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - periodDays)
  
  const previousStartDate = new Date(startDate)
  previousStartDate.setDate(previousStartDate.getDate() - periodDays)

  const { news: currentNews } = useMarketNews({
    date_from: startDate.toISOString().split('T')[0]
  }, 1000)

  const { news: previousNews } = useMarketNews({
    date_from: previousStartDate.toISOString().split('T')[0],
    date_to: startDate.toISOString().split('T')[0]
  }, 1000)

  const { trends } = useMarketTrends({}, 100)
  const { companies } = useGCCCompanies({}, 500)

  // Analytics calculations
  const categoryTrends = useMemo(() => {
    if (currentNews.length === 0) return []
    return analyzeCategoryTrends(currentNews, previousNews)
  }, [currentNews, previousNews])

  const momentum = useMemo(() => {
    if (currentNews.length === 0 || previousNews.length === 0) {
      return { score: 50, direction: 'stable' as const, factors: [] }
    }
    return calculateMarketMomentum(currentNews, previousNews)
  }, [currentNews, previousNews])

  const executiveSummary = useMemo(() => {
    if (!stats || categoryTrends.length === 0) return null
    return generateExecutiveSummary(stats, categoryTrends, momentum)
  }, [stats, categoryTrends, momentum])

  const saudiInsights = useMemo(() => {
    if (currentNews.length === 0) return null
    return generateCountryInsights('saudi_arabia', currentNews, trends, companies)
  }, [currentNews, trends, companies])

  const timeSeriesData = useMemo(() => {
    if (currentNews.length === 0) return []
    return generateNewsTimeSeries(currentNews, periodDays)
  }, [currentNews, periodDays])

  const getMomentumIcon = (direction: string) => {
    switch (direction) {
      case 'accelerating': return <ArrowUp className="h-5 w-5 text-green-500" />
      case 'declining': return <ArrowDown className="h-5 w-5 text-red-500" />
      default: return <Minus className="h-5 w-5 text-gray-500" />
    }
  }

  const getMomentumColor = (score: number) => {
    if (score >= 60) return 'text-green-600'
    if (score <= 40) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Market intelligence analysis and insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={selectedPeriod === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={selectedPeriod === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      {executiveSummary && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{executiveSummary.headline}</CardTitle>
                <CardDescription className="mt-2">{executiveSummary.summary}</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Key Highlights</h4>
              <ul className="space-y-1">
                {executiveSummary.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Outlook
              </h4>
              <p className="text-sm text-muted-foreground">{executiveSummary.outlook}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Momentum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Market Momentum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getMomentumIcon(momentum.direction)}
              <div>
                <div className="text-sm text-muted-foreground">Direction</div>
                <div className="text-lg font-semibold capitalize">{momentum.direction}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Momentum Score</div>
              <div className={`text-3xl font-bold ${getMomentumColor(momentum.score)}`}>
                {momentum.score.toFixed(0)}
              </div>
            </div>
          </div>
          
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full ${momentum.score >= 60 ? 'bg-green-500' : momentum.score <= 40 ? 'bg-red-500' : 'bg-gray-500'}`}
              style={{ width: `${momentum.score}%` }}
            />
          </div>

          {momentum.factors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Contributing Factors</h4>
              <div className="space-y-1">
                {momentum.factors.map((factor, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Category Trends Analysis</CardTitle>
          <CardDescription>Performance by sector over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryTrends.slice(0, 8).map((trend) => (
              <div key={trend.category} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex-1">
                  <div className="font-medium capitalize">{trend.category.replace('_', ' ')}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {trend.top_companies.slice(0, 3).join(', ')}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold">{trend.total_count}</div>
                    <div className="text-xs text-muted-foreground">items</div>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <div className={`flex items-center gap-1 justify-end ${trend.week_over_week_change > 0 ? 'text-green-600' : trend.week_over_week_change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {trend.week_over_week_change > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : trend.week_over_week_change < 0 ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {Math.abs(trend.week_over_week_change).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">vs prev period</div>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <Badge variant={trend.sentiment_score > 0.2 ? 'default' : trend.sentiment_score < -0.2 ? 'destructive' : 'secondary'}>
                      {trend.sentiment_score > 0 ? '+' : ''}{trend.sentiment_score.toFixed(2)}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">sentiment</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Saudi Arabia Insights */}
      {saudiInsights && (
        <Card>
          <CardHeader>
            <CardTitle>Saudi Arabia Market Insights</CardTitle>
            <CardDescription>Focused analysis on the Saudi ITC market</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{saudiInsights.total_news}</div>
                <div className="text-sm text-muted-foreground">News Items</div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{saudiInsights.total_companies}</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold">{saudiInsights.active_trends}</div>
                <div className="text-sm text-muted-foreground">Active Trends</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Top Categories</h4>
              <div className="flex flex-wrap gap-2">
                {saudiInsights.top_categories.map((cat) => (
                  <Badge key={cat.category} variant="outline">
                    {cat.category.replace('_', ' ')}: {cat.count}
                  </Badge>
                ))}
              </div>
            </div>

            {saudiInsights.key_developments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Key Developments</h4>
                <ul className="space-y-1">
                  {saudiInsights.key_developments.map((dev, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{dev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Published Intelligence Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Published Intelligence Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No published reports yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{report.title}</h3>
                        <Badge>{report.report_type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.executive_summary}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                        {report.market_sentiment && (
                          <Badge variant="outline" className="text-xs">
                            {report.market_sentiment}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
