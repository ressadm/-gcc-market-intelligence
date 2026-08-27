'use client'

import { useState } from 'react'
import { useMarketIntelligenceStats, useMarketNews, useMarketTrends } from '@/hooks/use-market-intelligence'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  TrendingUp,
  Building2,
  Newspaper,
  Calendar,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Globe,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { GCCCountry, ITCCategory } from '@/lib/market-intelligence-types'

const COUNTRY_LABELS: Record<GCCCountry, string> = {
  saudi_arabia: 'Saudi Arabia',
  uae: 'UAE',
  qatar: 'Qatar',
  kuwait: 'Kuwait',
  bahrain: 'Bahrain',
  oman: 'Oman'
}

const CATEGORY_LABELS: Record<ITCCategory, string> = {
  telecom: 'Telecom',
  fintech: 'Fintech',
  ai: 'AI',
  cloud: 'Cloud',
  cybersecurity: 'Cybersecurity',
  e_commerce: 'E-Commerce',
  healthtech: 'Healthtech',
  edutech: 'Edutech',
  gov_tech: 'Gov Tech',
  smart_city: 'Smart City',
  iot: 'IoT',
  blockchain: 'Blockchain',
  digital_services: 'Digital Services',
  transportation: 'Transportation',
  payment: 'Payment',
  banking: 'Banking',
  other: 'Other'
}

export default function MarketIntelligencePage() {
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useMarketIntelligenceStats()
  const [selectedCountry, setSelectedCountry] = useState<GCCCountry>('saudi_arabia')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { news, isLoading: newsLoading } = useMarketNews({
    countries: [selectedCountry],
    search_query: searchQuery || undefined
  }, 20)
  
  const { trends, isLoading: trendsLoading } = useMarketTrends({
    countries: [selectedCountry]
  }, 10)

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg text-foreground">Failed to load market intelligence data</p>
        <p className="text-sm text-muted-foreground">{statsError}</p>
        <Button onClick={refetchStats} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'transformative': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'high': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Market Intelligence</h1>
          <p className="text-muted-foreground">GCC ITC Market Tracking & Analysis</p>
        </div>
        <Button onClick={refetchStats} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total News Items</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.total_news_items?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.news_last_24h} in last 24h
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracked Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.tracked_companies}</div>
                <p className="text-xs text-muted-foreground">Across GCC region</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.active_trends}</div>
                <p className="text-xs text-muted-foreground">Being monitored</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.upcoming_events}</div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Market Sentiment (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Positive
                  </Badge>
                  <span className="font-semibold">{stats.sentiment_breakdown.positive}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ 
                      width: `${(stats.sentiment_breakdown.positive / (stats.sentiment_breakdown.positive + stats.sentiment_breakdown.negative + stats.sentiment_breakdown.neutral) * 100)}%` 
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                    Neutral
                  </Badge>
                  <span className="font-semibold">{stats.sentiment_breakdown.neutral}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-500"
                    style={{ 
                      width: `${(stats.sentiment_breakdown.neutral / (stats.sentiment_breakdown.positive + stats.sentiment_breakdown.negative + stats.sentiment_breakdown.neutral) * 100)}%` 
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    Negative
                  </Badge>
                  <span className="font-semibold">{stats.sentiment_breakdown.negative}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ 
                      width: `${(stats.sentiment_breakdown.negative / (stats.sentiment_breakdown.positive + stats.sentiment_breakdown.negative + stats.sentiment_breakdown.neutral) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Country Selector & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
            <Button
              key={code}
              variant={selectedCountry === code ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCountry(code as GCCCountry)}
            >
              <Globe className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Latest News - {COUNTRY_LABELS[selectedCountry]}</CardTitle>
              <CardDescription>Recent ITC developments and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {newsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2 pb-4 border-b last:border-0">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : news.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No news items found</p>
                </div>
              ) : (
                news.map((item) => (
                  <div key={item.id} className="pb-4 border-b last:border-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold hover:text-primary cursor-pointer">
                        {item.title}
                      </h3>
                      {item.impact_level && (
                        <Badge className={getImpactColor(item.impact_level)}>
                          {item.impact_level}
                        </Badge>
                      )}
                    </div>
                    {item.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{new Date(item.published_date).toLocaleDateString()}</span>
                      {item.sentiment && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className={getSentimentColor(item.sentiment)}>
                            {item.sentiment}
                          </Badge>
                        </>
                      )}
                      {item.category && (
                        <>
                          <span>•</span>
                          <Badge variant="outline">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Categories */}
          {stats && stats.category_breakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.category_breakdown.slice(0, 6).map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <span className="text-sm">{CATEGORY_LABELS[cat.category] || cat.category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{cat.count}</Badge>
                        {cat.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-500" />}
                        {cat.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Trends</CardTitle>
              <CardDescription>{COUNTRY_LABELS[selectedCountry]}</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : trends.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active trends</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trends.slice(0, 5).map((trend) => (
                    <div key={trend.id} className="p-3 rounded-lg bg-secondary/50 space-y-1">
                      <div className="font-medium text-sm">{trend.trend_name}</div>
                      <div className="flex items-center gap-2 text-xs">
                        {trend.impact_level && (
                          <Badge variant="outline" className={getImpactColor(trend.impact_level)}>
                            {trend.impact_level}
                          </Badge>
                        )}
                        {trend.maturity_stage && (
                          <Badge variant="outline">
                            {trend.maturity_stage}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Sources */}
          {stats && stats.top_sources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.top_sources.slice(0, 5).map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="truncate">{source.source}</span>
                      <Badge variant="secondary">{source.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
