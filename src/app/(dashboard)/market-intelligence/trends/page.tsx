'use client'

import { useState } from 'react'
import { useMarketTrends } from '@/hooks/use-market-intelligence'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  Globe,
  BarChart3,
  Calendar,
  Target,
  Activity
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

export default function TrendsPage() {
  const [selectedCountry, setSelectedCountry] = useState<GCCCountry | 'all'>('saudi_arabia')
  
  const { trends, total, isLoading, error } = useMarketTrends({
    countries: selectedCountry !== 'all' ? [selectedCountry] : undefined
  })

  const getImpactColor = (level: string | null) => {
    switch (level) {
      case 'transformative': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'high': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getMaturityColor = (stage: string | null) => {
    switch (stage) {
      case 'emerging': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'growing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'mature': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'declining': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">Market Trends</h1>
        <p className="text-muted-foreground">Key trends shaping the GCC ITC market</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCountry === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCountry('all')}
        >
          All Countries
        </Button>
        {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
          <Button
            key={code}
            variant={selectedCountry === code ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCountry(code as GCCCountry)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>{total} active trends</span>
        </div>
      </div>

      {/* Trends List */}
      {error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          ) : trends.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No trends found</p>
              </CardContent>
            </Card>
          ) : (
            trends.map((trend) => (
              <Card key={trend.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{trend.trend_name}</CardTitle>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge>{trend.trend_type}</Badge>
                        {trend.impact_level && (
                          <Badge className={getImpactColor(trend.impact_level)}>
                            {trend.impact_level} impact
                          </Badge>
                        )}
                        {trend.maturity_stage && (
                          <Badge className={getMaturityColor(trend.maturity_stage)}>
                            {trend.maturity_stage}
                          </Badge>
                        )}
                        {trend.confidence_level && (
                          <Badge variant="outline">
                            {trend.confidence_level} confidence
                          </Badge>
                        )}
                      </div>
                    </div>
                    {trend.opportunity_score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {(trend.opportunity_score * 100).toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Opportunity Score
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-muted-foreground">{trend.description}</p>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Globe className="h-4 w-4" />
                        <span>Countries</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {trend.countries.map((country) => (
                          <Badge key={country} variant="secondary" className="text-xs">
                            {COUNTRY_LABELS[country]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Target className="h-4 w-4" />
                        <span>Sectors</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {trend.sectors.slice(0, 3).map((sector) => (
                          <Badge key={sector} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                        {trend.sectors.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{trend.sectors.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>Identified</span>
                      </div>
                      <p className="font-medium">
                        {new Date(trend.identified_date).toLocaleDateString()}
                      </p>
                    </div>

                    {trend.momentum_score && (
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Activity className="h-4 w-4" />
                          <span>Momentum</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${trend.momentum_score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {(trend.momentum_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Market Size & Growth */}
                  {(trend.market_size_estimate_usd || trend.growth_rate_pct) && (
                    <div className="flex gap-6 p-3 bg-secondary/50 rounded-lg text-sm">
                      {trend.market_size_estimate_usd && (
                        <div>
                          <div className="text-muted-foreground mb-1">Market Size</div>
                          <div className="font-semibold">
                            ${(trend.market_size_estimate_usd / 1000000000).toFixed(2)}B
                          </div>
                        </div>
                      )}
                      {trend.growth_rate_pct && (
                        <div>
                          <div className="text-muted-foreground mb-1">Growth Rate</div>
                          <div className="font-semibold text-green-600">
                            +{trend.growth_rate_pct}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Indicators */}
                  {trend.key_indicators && trend.key_indicators.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Indicators</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {trend.key_indicators.map((indicator, idx) => (
                          <li key={idx}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {trend.ai_trend_analysis && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        AI Analysis
                      </h4>
                      <p className="text-sm text-muted-foreground">{trend.ai_trend_analysis}</p>
                    </div>
                  )}

                  {/* Affected Companies */}
                  {trend.companies_affected && trend.companies_affected.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Affected Companies</h4>
                      <div className="flex flex-wrap gap-2">
                        {trend.companies_affected.slice(0, 10).map((company, idx) => (
                          <Badge key={idx} variant="outline">
                            {company}
                          </Badge>
                        ))}
                        {trend.companies_affected.length > 10 && (
                          <Badge variant="outline">
                            +{trend.companies_affected.length - 10} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
