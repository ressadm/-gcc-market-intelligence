import type { PortfolioCompany, PortfolioStats, CurrencyBreakdown, SectorBreakdown, SourceBreakdown, StageBreakdown } from './types'

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
 * Convert a CHF amount to a display currency.
 * fxRates maps currency→CHF, so to get CHF→USD we divide by the USD→CHF rate.
 */
export function convertFromCHF(
  amountCHF: number,
  targetCurrency: string,
  fxRates: Record<string, number>
): number {
  if (targetCurrency === 'CHF') return amountCHF
  const rate = fxRates[targetCurrency]
  if (!rate) return amountCHF
  return amountCHF / rate
}

/**
 * Convert an amount from any currency to the display currency.
 * fxRates maps currency → CHF rate. To convert to USD, we go: orig → CHF → USD.
 */
export function convertToDisplay(
  amount: number,
  fromCurrency: string,
  fxRates: Record<string, number>,
  displayCurrency: string
): number {
  if (fromCurrency === displayCurrency) return amount
  // First convert to CHF
  const amountCHF = fromCurrency === 'CHF'
    ? amount
    : amount * (fxRates[fromCurrency] || 1)
  // Then convert from CHF to display currency
  if (displayCurrency === 'CHF') return amountCHF
  const rate = fxRates[displayCurrency]
  return rate ? amountCHF / rate : amountCHF
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
  const sourceMap = new Map<string, SourceBreakdown>()
  const stageMap = new Map<string, StageBreakdown>()

  // For weighted FX impact calculation
  let weightedMoicOrigSum = 0
  let weightedMoicOrigDenom = 0

  for (const c of companies) {
    const currency = c.investment_currency || 'CHF'
    // Invested: historical FX rate (locked at investment date)
    const investedCHF = currency === 'CHF'
      ? c.total_invested
      : c.total_invested * (c.original_fx_rate || 1)
    // Current value + distributions: live FX rate (recomputed daily)
    const currentCHF = convertToCHF(c.current_value, currency, fxRates)
    const distCHF = convertToCHF(c.total_distributions, currency, fxRates)

    totalInvestedCHF += investedCHF
    totalCurrentValueCHF += currentCHF
    totalDistributionsCHF += distCHF

    if (c.is_stale) staleCount++

    // Per-company MOIC in original currency (no FX conversion)
    if (c.total_invested > 0 && investedCHF > 0) {
      const moicOrig = (c.current_value + c.total_distributions) / c.total_invested
      weightedMoicOrigSum += moicOrig * investedCHF
      weightedMoicOrigDenom += investedCHF
    }

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

    // Source breakdown (vehicle)
    const vehicleLabels: Record<string, string> = { fiduciary: 'Verve', direct: 'Direct', fund: 'LP Fund' }
    const source = vehicleLabels[c.vehicle || ''] || c.vehicle || 'Unknown'
    const existingSource = sourceMap.get(source) || { source, count: 0, investedCHF: 0, currentValueCHF: 0 }
    existingSource.count++
    existingSource.investedCHF += investedCHF
    existingSource.currentValueCHF += currentCHF
    sourceMap.set(source, existingSource)

    // Stage breakdown
    const stage = c.status || 'Unknown'
    const existingStage = stageMap.get(stage) || { stage, count: 0, investedCHF: 0, currentValueCHF: 0 }
    existingStage.count++
    existingStage.investedCHF += investedCHF
    existingStage.currentValueCHF += currentCHF
    stageMap.set(stage, existingStage)
  }

  const totalValueCHF = totalCurrentValueCHF + totalDistributionsCHF
  const portfolioMoic = totalInvestedCHF > 0
    ? totalValueCHF / totalInvestedCHF
    : 0

  const unrealizedPnlCHF = totalCurrentValueCHF - totalInvestedCHF

  // Weighted average MOIC in original currencies, then compare to CHF MOIC
  const weightedMoicOrig = weightedMoicOrigDenom > 0
    ? weightedMoicOrigSum / weightedMoicOrigDenom
    : 0
  const fxImpactPct = weightedMoicOrig > 0
    ? (portfolioMoic / weightedMoicOrig) - 1
    : 0

  return {
    companyCount: companies.length,
    totalInvestedCHF,
    totalCurrentValueCHF,
    totalDistributionsCHF,
    totalValueCHF,
    portfolioMoic,
    unrealizedPnlCHF,
    fxImpactPct,
    staleCount,
    currencyBreakdown: Array.from(currencyMap.values())
      .sort((a, b) => b.investedCHF - a.investedCHF),
    sectorBreakdown: Array.from(sectorMap.values())
      .sort((a, b) => b.count - a.count),
    sourceBreakdown: Array.from(sourceMap.values())
      .sort((a, b) => b.investedCHF - a.investedCHF),
    stageBreakdown: Array.from(stageMap.values())
      .sort((a, b) => b.count - a.count),
  }
}
