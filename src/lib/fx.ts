import type { PortfolioCompany, PortfolioStats, CurrencyBreakdown, SectorBreakdown } from './types'

/**
 * Deterministic FX conversion — resolves Sprint 1 LLM arithmetic inconsistency.
 * Pure function: amount × fxRate = CHF value. No LLM involved.
 */
export function convertToCHF(
  amount: number,
  currency: string | null,
  fxRates: Record<string, number>
): number {
  if (!currency || currency === 'CHF') return amount
  const rate = fxRates[currency]
  if (rate === undefined) {
    console.warn(`Missing FX rate for ${currency}, using amount as-is`)
    return amount
  }
  return amount * rate
}

/**
 * Aggregate portfolio data into CHF-normalized stats.
 * All financial math is deterministic — pure arithmetic, no LLM.
 */
export function aggregatePortfolioCHF(
  companies: PortfolioCompany[],
  fxRates: Record<string, number>
): PortfolioStats {
  let totalInvestedCHF = 0
  let totalCurrentValueCHF = 0
  let totalDistributionsCHF = 0
  let staleCount = 0

  const currencyMap = new Map<string, CurrencyBreakdown>()
  const sectorMap = new Map<string, SectorBreakdown>()

  for (const c of companies) {
    const currency = c.investment_currency || 'CHF'
    const investedCHF = convertToCHF(c.total_invested, currency, fxRates)
    const currentCHF = convertToCHF(c.current_value, currency, fxRates)
    const distCHF = convertToCHF(c.total_distributions, currency, fxRates)

    totalInvestedCHF += investedCHF
    totalCurrentValueCHF += currentCHF
    totalDistributionsCHF += distCHF

    if (c.is_stale) staleCount++

    // Currency breakdown
    const existing = currencyMap.get(currency) || {
      currency,
      count: 0,
      investedCHF: 0,
      currentValueCHF: 0,
    }
    existing.count++
    existing.investedCHF += investedCHF
    existing.currentValueCHF += currentCHF
    currencyMap.set(currency, existing)

    // Sector breakdown
    const sector = c.sector || 'Unknown'
    const existingSector = sectorMap.get(sector) || {
      sector,
      count: 0,
      investedCHF: 0,
      currentValueCHF: 0,
    }
    existingSector.count++
    existingSector.investedCHF += investedCHF
    existingSector.currentValueCHF += currentCHF
    sectorMap.set(sector, existingSector)
  }

  const totalValueCHF = totalCurrentValueCHF + totalDistributionsCHF
  const portfolioMoic = totalInvestedCHF > 0
    ? totalValueCHF / totalInvestedCHF
    : 0

  return {
    companyCount: companies.length,
    totalInvestedCHF,
    totalCurrentValueCHF,
    totalDistributionsCHF,
    totalValueCHF,
    portfolioMoic,
    staleCount,
    currencyBreakdown: Array.from(currencyMap.values())
      .sort((a, b) => b.investedCHF - a.investedCHF),
    sectorBreakdown: Array.from(sectorMap.values())
      .sort((a, b) => b.count - a.count),
  }
}
