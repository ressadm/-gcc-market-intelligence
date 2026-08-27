/**
 * News Collection Service for GCC Market Intelligence
 * Collects ITC news from various sources across GCC region
 */

import { MarketIntelligenceNews, GCCCountry, ITCCategory } from '../market-intelligence-types'

export interface NewsSource {
  id: string
  name: string
  url: string
  country: GCCCountry
  type: 'rss' | 'api' | 'scraper'
  categories: ITCCategory[]
  isActive: boolean
}

// Major news sources for GCC ITC tracking
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'arab-news-tech',
    name: 'Arab News - Technology',
    url: 'https://www.arabnews.com/taxonomy/term/71/feed',
    country: 'saudi_arabia',
    type: 'rss',
    categories: ['telecom', 'ai', 'fintech', 'e-commerce'],
    isActive: true
  },
  {
    id: 'gulf-news-tech',
    name: 'Gulf News - Technology',
    url: 'https://gulfnews.com/technology',
    country: 'uae',
    type: 'scraper',
    categories: ['telecom', 'ai', 'fintech', 'smart_city'],
    isActive: true
  },
  {
    id: 'the-national-tech',
    name: 'The National - Technology',
    url: 'https://www.thenationalnews.com/business/technology',
    country: 'uae',
    type: 'scraper',
    categories: ['telecom', 'ai', 'fintech'],
    isActive: true
  },
  {
    id: 'zawya-tech',
    name: 'Zawya - Technology',
    url: 'https://www.zawya.com/en/business/technology',
    country: 'uae',
    type: 'scraper',
    categories: ['fintech', 'e-commerce', 'ai'],
    isActive: true
  },
  {
    id: 'citc-sa',
    name: 'CITC Saudi Arabia',
    url: 'https://www.cst.gov.sa/en/mediacenter/news/pages/default.aspx',
    country: 'saudi_arabia',
    type: 'scraper',
    categories: ['telecom', 'cybersecurity'],
    isActive: true
  },
  {
    id: 'sama-press',
    name: 'SAMA Press Releases',
    url: 'https://www.sama.gov.sa/en-US/News/Pages/default.aspx',
    country: 'saudi_arabia',
    type: 'scraper',
    categories: ['fintech', 'payment', 'banking'],
    isActive: true
  },
  {
    id: 'wamda',
    name: 'Wamda - Startup News',
    url: 'https://www.wamda.com/news',
    country: 'uae',
    type: 'scraper',
    categories: ['fintech', 'e-commerce', 'ai', 'healthtech'],
    isActive: true
  },
  {
    id: 'magnitt',
    name: 'MAGNiTT - MENA Startups',
    url: 'https://magnitt.com/news',
    country: 'uae',
    type: 'scraper',
    categories: ['fintech', 'e-commerce', 'ai'],
    isActive: true
  }
]

// Keywords for ITC relevance detection
export const ITC_KEYWORDS = {
  telecom: ['5g', '5g network', 'telecom', 'mobile network', 'fiber optic', 'broadband', 'stc', 'mobily', 'zain', 'etisalat', 'du'],
  fintech: ['fintech', 'digital payment', 'mobile payment', 'sama', 'open banking', 'bnpl', 'buy now pay later', 'digital wallet', 'payment gateway', 'tamara', 'tabby', 'stc pay'],
  ai: ['artificial intelligence', 'ai', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'sdaia', 'generative ai', 'chatbot'],
  cloud: ['cloud computing', 'aws', 'azure', 'google cloud', 'cloud infrastructure', 'saas', 'paas', 'iaas', 'data center'],
  cybersecurity: ['cybersecurity', 'cyber security', 'data protection', 'privacy', 'encryption', 'threat', 'vulnerability', 'hack', 'breach'],
  e-commerce: ['e-commerce', 'ecommerce', 'online shopping', 'marketplace', 'noon', 'amazon.sa', 'digital commerce'],
  smart_city: ['smart city', 'neom', 'the line', 'iot', 'smart infrastructure', 'connected city'],
  gov_tech: ['digital government', 'e-government', 'gov tech', 'digital services', 'yesser', 'elm', 'absher'],
  blockchain: ['blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'nft', 'web3', 'defi'],
  healthtech: ['healthtech', 'digital health', 'telemedicine', 'health app', 'medical technology']
}

// Saudi/GCC companies to track
export const TRACKED_COMPANIES = [
  'stc', 'saudi telecom', 'mobily', 'zain', 'aramco', 'neom',
  'elm', 'lucidya', 'lean', 'tamara', 'jahez', 'hungerstation',
  'careem', 'noon', 'tabby', 'stc pay', 'urpay', 'geidea',
  'hala', 'mrsool', 'unifonic', 'jisr', 'foodics', 'sary',
  'etisalat', 'e&', 'du', 'emirates', 'adnoc', 'pure harvest'
]

// Regulatory bodies
export const REGULATORY_ENTITIES = [
  'citc', 'sama', 'sdaia', 'mcit', 'nca', 'cma',
  'communications and information technology commission',
  'saudi central bank', 'data and ai authority'
]

/**
 * Analyzes text content for ITC relevance and categorization
 */
export function analyzeContent(text: string): {
  isRelevant: boolean
  categories: ITCCategory[]
  relevanceScore: number
  mentionedCompanies: string[]
  mentionedEntities: string[]
} {
  const lowerText = text.toLowerCase()
  const categories: Set<ITCCategory> = new Set()
  const mentionedCompanies: Set<string> = new Set()
  const mentionedEntities: Set<string> = new Set()
  let relevanceScore = 0

  // Check for category keywords
  Object.entries(ITC_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        categories.add(category as ITCCategory)
        relevanceScore += 0.1
      }
    })
  })

  // Check for tracked companies
  TRACKED_COMPANIES.forEach(company => {
    if (lowerText.includes(company.toLowerCase())) {
      mentionedCompanies.add(company)
      relevanceScore += 0.15
    }
  })

  // Check for regulatory entities
  REGULATORY_ENTITIES.forEach(entity => {
    if (lowerText.includes(entity.toLowerCase())) {
      mentionedEntities.add(entity)
      relevanceScore += 0.2
    }
  })

  // Cap relevance score at 1.0
  relevanceScore = Math.min(relevanceScore, 1.0)

  return {
    isRelevant: relevanceScore > 0.3 || categories.size > 0,
    categories: Array.from(categories),
    relevanceScore,
    mentionedCompanies: Array.from(mentionedCompanies),
    mentionedEntities: Array.from(mentionedEntities)
  }
}

/**
 * Performs basic sentiment analysis on text
 */
export function analyzeSentiment(text: string): {
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
} {
  const lowerText = text.toLowerCase()

  const positiveWords = [
    'growth', 'launch', 'innovation', 'success', 'partnership', 'expansion',
    'investment', 'funding', 'breakthrough', 'milestone', 'achievement',
    'opportunity', 'boost', 'surge', 'record', 'profit', 'gain', 'winner',
    'advanced', 'improved', 'excellent', 'outstanding', 'strong', 'positive',
    'progress', 'development', 'upgrade', 'modernize', 'transform'
  ]

  const negativeWords = [
    'decline', 'loss', 'failure', 'issue', 'problem', 'concern', 'risk',
    'threat', 'challenge', 'delay', 'suspended', 'breach', 'hack', 'fine',
    'penalty', 'violation', 'complaint', 'down', 'drop', 'weak', 'poor',
    'negative', 'crisis', 'scandal', 'lawsuit', 'fraud', 'scam'
  ]

  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = lowerText.match(regex)
    if (matches) positiveCount += matches.length
  })

  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = lowerText.match(regex)
    if (matches) negativeCount += matches.length
  })

  const totalWords = positiveCount + negativeCount
  if (totalWords === 0) {
    return { sentiment: 'neutral', score: 0 }
  }

  const sentimentScore = (positiveCount - negativeCount) / Math.max(totalWords, 1)

  if (sentimentScore > 0.2) {
    return { sentiment: 'positive', score: sentimentScore }
  } else if (sentimentScore < -0.2) {
    return { sentiment: 'negative', score: sentimentScore }
  } else {
    return { sentiment: 'neutral', score: sentimentScore }
  }
}

/**
 * Detects the primary GCC country mentioned in text
 */
export function detectCountry(text: string): GCCCountry {
  const lowerText = text.toLowerCase()

  const countryKeywords: Record<GCCCountry, string[]> = {
    saudi_arabia: ['saudi', 'riyadh', 'jeddah', 'ksa', 'kingdom', 'sama', 'citc', 'neom', 'tabuk'],
    uae: ['uae', 'dubai', 'abu dhabi', 'emirates', 'sharjah', 'ajman'],
    qatar: ['qatar', 'doha', 'qatari'],
    kuwait: ['kuwait', 'kuwaiti'],
    bahrain: ['bahrain', 'manama', 'bahraini'],
    oman: ['oman', 'muscat', 'omani']
  }

  let maxMatches = 0
  let detectedCountry: GCCCountry = 'saudi_arabia' // default

  Object.entries(countryKeywords).forEach(([country, keywords]) => {
    let matches = 0
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        matches++
      }
    })
    if (matches > maxMatches) {
      maxMatches = matches
      detectedCountry = country as GCCCountry
    }
  })

  return detectedCountry
}

/**
 * Generate AI-style summary of article (simulated)
 */
export function generateSummary(title: string, content: string, maxLength: number = 200): string {
  if (!content || content.length === 0) {
    return title
  }

  // Simple extractive summarization - take first few sentences
  const sentences = content.match(/[^.!?]+[.!?]+/g) || []
  let summary = ''
  
  for (const sentence of sentences) {
    if ((summary + sentence).length <= maxLength) {
      summary += sentence
    } else {
      break
    }
  }

  return summary.trim() || title
}

/**
 * Mock news fetcher - in production, this would call actual APIs
 */
export async function fetchNewsFromSource(source: NewsSource): Promise<Partial<MarketIntelligenceNews>[]> {
  // This is a mock implementation
  // In production, you would:
  // 1. Call RSS feeds
  // 2. Use web scraping APIs
  // 3. Integrate with news APIs
  // 4. Use LLM APIs for content analysis
  
  console.log(`Fetching news from ${source.name}...`)
  
  // Return empty array - actual implementation would fetch real news
  return []
}

/**
 * Process and enrich raw news article
 */
export function processNewsArticle(
  rawArticle: {
    title: string
    content: string
    source: string
    url: string
    publishedDate: string
  }
): Partial<MarketIntelligenceNews> {
  const fullText = `${rawArticle.title} ${rawArticle.content}`
  
  const contentAnalysis = analyzeContent(fullText)
  const sentimentAnalysis = analyzeSentiment(fullText)
  const country = detectCountry(fullText)
  const summary = generateSummary(rawArticle.title, rawArticle.content)

  return {
    title: rawArticle.title,
    full_content: rawArticle.content,
    summary: summary,
    source: rawArticle.source,
    source_url: rawArticle.url,
    published_date: rawArticle.publishedDate,
    
    primary_country: country,
    countries: [country],
    
    category: contentAnalysis.categories[0] || 'other',
    tags: contentAnalysis.categories.slice(1),
    
    sentiment: sentimentAnalysis.sentiment,
    ai_sentiment_score: sentimentAnalysis.score,
    ai_relevance_score: contentAnalysis.relevanceScore,
    
    companies_mentioned: contentAnalysis.mentionedCompanies,
    government_entities: contentAnalysis.mentionedEntities,
    
    is_relevant: contentAnalysis.isRelevant,
    is_processed: true,
    ai_summary: summary
  }
}
