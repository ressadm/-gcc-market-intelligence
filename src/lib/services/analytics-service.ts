/**
 * Analytics Service for Market Intelligence
 * Provides data analysis and reporting capabilities
 */

import { MarketIntelligenceNews, GCCCountry, ITCCategory, MarketTrend } from '../market-intelligence-types'

export interface TimeSeriesDataPoint {
  date: string
  count: number
  sentiment_positive: number
  sentiment_negative: number
  sentiment_neutral: number
}

export interface CategoryTrendData {
  category: ITCCategory
  total_count: number
  week_over_week_change: number
  sentiment_score: number
  top_companies: string[]
}

export interface CountryInsights {
  country: GCCCountry
  total_news: number
  total_companies: number
  active_trends: number
  top_categories: { category: ITCCategory; count: number }[]
  sentiment_breakdown: {
    positive: number
    negative: number
    neutral: number
  }
  key_developments: string[]
}

export interface CompetitiveLandscape {
  sector: ITCCategory
  companies: {
    name: string
    country: GCCCountry
    mention_count: number
    sentiment_score: number
    recent_developments: number
    importance_level: string
  }[]
}

/**
 * Generate time series data for news volume
 */
export function generateNewsTimeSeries(
  news: MarketIntelligenceNews[],
  days: number = 30
): TimeSeriesDataPoint[] {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const dataPoints: TimeSeriesDataPoint[] = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const dayNews = news.filter(n => {
      const newsDate = new Date(n.published_date).toISOString().split('T')[0]
      return newsDate === dateStr
    })

    dataPoints.push({
      date: dateStr,
      count: dayNews.length,
      sentiment_positive: dayNews.filter(n => n.sentiment === 'positive').length,
      sentiment_negative: dayNews.filter(n => n.sentiment === 'negative').length,
      sentiment_neutral: dayNews.filter(n => n.sentiment === 'neutral').length
    })
  }

  return dataPoints
}

/**
 * Analyze category trends
 */
export function analyzeCategoryTrends(
  currentNews: MarketIntelligenceNews[],
  previousNews: MarketIntelligenceNews[]
): CategoryTrendData[] {
  const categories = Array.from(new Set(currentNews.map(n => n.category)))

  return categories.map(category => {
    const currentCount = currentNews.filter(n => n.category === category).length
    const previousCount = previousNews.filter(n => n.category === category).length
    
    const categoryNews = currentNews.filter(n => n.category === category)
    const sentimentScores = categoryNews
      .filter(n => n.ai_sentiment_score !== null)
      .map(n => n.ai_sentiment_score as number)
    
    const avgSentiment = sentimentScores.length > 0
      ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
      : 0

    const companiesMentioned = new Map<string, number>()
    categoryNews.forEach(news => {
      if (news.companies_mentioned) {
        news.companies_mentioned.forEach(company => {
          companiesMentioned.set(company, (companiesMentioned.get(company) || 0) + 1)
        })
      }
    })

    const topCompanies = Array.from(companiesMentioned.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company]) => company)

    const weekOverWeekChange = previousCount > 0
      ? ((currentCount - previousCount) / previousCount) * 100
      : 100

    return {
      category,
      total_count: currentCount,
      week_over_week_change: weekOverWeekChange,
      sentiment_score: avgSentiment,
      top_companies: topCompanies
    }
  }).sort((a, b) => b.total_count - a.total_count)
}

/**
 * Generate country-specific insights
 */
export function generateCountryInsights(
  country: GCCCountry,
  news: MarketIntelligenceNews[],
  trends: MarketTrend[],
  companies: any[]
): CountryInsights {
  const countryNews = news.filter(n => n.primary_country === country)
  const countryCompanies = companies.filter(c => c.country === country)
  const countryTrends = trends.filter(t => t.countries.includes(country))

  // Category breakdown
  const categoryMap = new Map<ITCCategory, number>()
  countryNews.forEach(n => {
    categoryMap.set(n.category, (categoryMap.get(n.category) || 0) + 1)
  })

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Sentiment breakdown
  const sentimentBreakdown = {
    positive: countryNews.filter(n => n.sentiment === 'positive').length,
    negative: countryNews.filter(n => n.sentiment === 'negative').length,
    neutral: countryNews.filter(n => n.sentiment === 'neutral').length
  }

  // Key developments (high impact news)
  const keyDevelopments = countryNews
    .filter(n => n.impact_level === 'high' || n.impact_level === 'transformative')
    .slice(0, 5)
    .map(n => n.title)

  return {
    country,
    total_news: countryNews.length,
    total_companies: countryCompanies.length,
    active_trends: countryTrends.length,
    top_categories: topCategories,
    sentiment_breakdown: sentimentBreakdown,
    key_developments: keyDevelopments
  }
}

/**
 * Analyze competitive landscape for a sector
 */
export function analyzeCompetitiveLandscape(
  sector: ITCCategory,
  companies: any[],
  news: MarketIntelligenceNews[]
): CompetitiveLandscape {
  const sectorCompanies = companies.filter(c => c.sector === sector)

  const companiesWithMetrics = sectorCompanies.map(company => {
    const companyNews = news.filter(n => 
      n.companies_mentioned?.some(c => 
        c.toLowerCase().includes(company.name.toLowerCase())
      )
    )

    const sentimentScores = companyNews
      .filter(n => n.ai_sentiment_score !== null)
      .map(n => n.ai_sentiment_score as number)
    
    const avgSentiment = sentimentScores.length > 0
      ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
      : 0

    // Recent developments (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentDevelopments = companyNews.filter(n => 
      new Date(n.published_date) >= thirtyDaysAgo
    ).length

    return {
      name: company.name,
      country: company.country,
      mention_count: companyNews.length,
      sentiment_score: avgSentiment,
      recent_developments: recentDevelopments,
      importance_level: company.importance_level || 'medium'
    }
  }).sort((a, b) => b.mention_count - a.mention_count)

  return {
    sector,
    companies: companiesWithMetrics
  }
}

/**
 * Calculate market momentum score
 */
export function calculateMarketMomentum(
  news: MarketIntelligenceNews[],
  previousPeriodNews: MarketIntelligenceNews[]
): {
  score: number
  direction: 'accelerating' | 'stable' | 'declining'
  factors: string[]
} {
  const factors: string[] = []
  
  // Volume change
  const volumeChange = news.length - previousPeriodNews.length
  const volumeChangePercent = previousPeriodNews.length > 0
    ? (volumeChange / previousPeriodNews.length) * 100
    : 100

  // Sentiment shift
  const currentPositive = news.filter(n => n.sentiment === 'positive').length / news.length
  const previousPositive = previousPeriodNews.filter(n => n.sentiment === 'positive').length / previousPeriodNews.length
  const sentimentShift = currentPositive - previousPositive

  // High impact news count
  const highImpactCount = news.filter(n => 
    n.impact_level === 'high' || n.impact_level === 'transformative'
  ).length

  // Calculate score (0-100)
  let score = 50 // baseline

  // Volume contribution (±20 points)
  if (volumeChangePercent > 20) {
    score += 20
    factors.push('Significant increase in news volume')
  } else if (volumeChangePercent > 0) {
    score += 10
    factors.push('Moderate increase in news volume')
  } else if (volumeChangePercent < -20) {
    score -= 20
    factors.push('Significant decrease in news volume')
  }

  // Sentiment contribution (±15 points)
  if (sentimentShift > 0.1) {
    score += 15
    factors.push('Improving market sentiment')
  } else if (sentimentShift < -0.1) {
    score -= 15
    factors.push('Declining market sentiment')
  }

  // High impact news contribution (±15 points)
  if (highImpactCount >= 5) {
    score += 15
    factors.push('Multiple high-impact developments')
  } else if (highImpactCount >= 2) {
    score += 8
    factors.push('Notable high-impact developments')
  }

  // Determine direction
  let direction: 'accelerating' | 'stable' | 'declining'
  if (score >= 60) {
    direction = 'accelerating'
  } else if (score <= 40) {
    direction = 'declining'
  } else {
    direction = 'stable'
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    direction,
    factors
  }
}

/**
 * Generate executive summary
 */
export function generateExecutiveSummary(
  stats: any,
  topCategories: CategoryTrendData[],
  momentum: ReturnType<typeof calculateMarketMomentum>
): {
  headline: string
  summary: string
  keyPoints: string[]
  outlook: string
} {
  const totalNews = stats.total_news_items || 0
  const recentNews = stats.news_last_7d || 0
  
  const topCategory = topCategories[0]
  const fastestGrowing = topCategories
    .filter(c => c.week_over_week_change > 0)
    .sort((a, b) => b.week_over_week_change - a.week_over_week_change)[0]

  const headline = momentum.direction === 'accelerating'
    ? 'GCC ITC Market Shows Strong Growth Momentum'
    : momentum.direction === 'declining'
    ? 'GCC ITC Market Activity Moderating'
    : 'GCC ITC Market Maintains Steady Activity'

  const summary = `The GCC ITC market has shown ${momentum.direction} momentum with ${recentNews} developments tracked in the past week. ${topCategory.category} leads activity with ${topCategory.total_count} items, while ${fastestGrowing?.category || 'several sectors'} showing notable growth. Market sentiment remains ${stats.sentiment_breakdown.positive > stats.sentiment_breakdown.negative ? 'positive' : 'mixed'}.`

  const keyPoints: string[] = [
    `${recentNews} new developments in past 7 days`,
    `${topCategory.category} sector leading with ${topCategory.total_count} items`,
    fastestGrowing ? `${fastestGrowing.category} showing ${fastestGrowing.week_over_week_change.toFixed(0)}% week-over-week growth` : 'Stable growth across sectors',
    `${stats.active_trends} active market trends being monitored`,
    `${stats.tracked_companies} companies actively tracked`
  ]

  const outlook = momentum.direction === 'accelerating'
    ? 'Strong momentum expected to continue with ongoing digital transformation initiatives and government support.'
    : momentum.direction === 'declining'
    ? 'Market activity may stabilize as sector consolidates recent developments.'
    : 'Steady growth trajectory expected with continued focus on key technology sectors.'

  return {
    headline,
    summary,
    keyPoints,
    outlook
  }
}
