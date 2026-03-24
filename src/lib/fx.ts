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
 * Convert an amount from any currency to the display currency using LIVE FX rates.
 *
 * IMPORTANT: This function uses TODAY's FX rates. It is CORRECT for:
 *   - Current value (mark-to-market uses live rates)
 *   - Distributions
 * It is WRONG for:
 *   - Invested amounts (must use historical rates at investment date)
 *   For invested amounts, use getInvestedInDisplayCurrency() instead.
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
 * Get the invested amount for a company in the requested display currency,
 * using HISTORICAL FX rates (pre-computed and stored in the DB).
 *
 * This is the correct function for invested amounts — it uses per-transaction
 * historical rates summed in the portfolio_summary view.
 */
export function getInvestedInDisplayCurrency(
  company: PortfolioCompany,
  displayCurrency: string
): number {
  switch (displayCurrency) {
    case 'CHF':
      return company.total_invested_chf
    case 'USD':
      return company.total_invested_usd
    default:
      // Fallback for unsupported currencies — use CHF
      return company.total_invested_chf
  }
}

/**
 * Aggregate portfolio data into dual-currency stats (CHF + USD).
 *
 * KEY FX RULES:
 *   Invested = HISTORICAL FX rates (locked at transaction date)
 *     → Uses pre-computed total_invested_chf / total_invested_usd from DB
 *   Current Value = LIVE FX rates (mark-to-market, recomputed daily)
 *     → Uses convertToCHF/convertFromCHF with today's fxRates
 *   P&L = Value(live) - Invested(historical), both in same currency
 *   MOIC = (Value + Distributions) / Invested, per currency
 *
 * All financial math is deterministic — pure arithmetic, no LLM.
 */
export function aggregatePortfolioCHF(
  companies: PortfolioCompany[],
  fxRates: Record<string, number>
): PortfolioStats {
  let totalInvestedCHF = 0
  let totalInvestedUSD = 0
  let totalCurrentValueCHF = 0
  let totalCurrentValueUSD = 0
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

    // Invested: HISTORICAL rates (pre-computed in DB view)
    const investedCHF = c.total_invested_chf
    const investedUSD = c.total_invested_usd

    // Current value + distributions: LIVE FX rates (mark-to-market)
    const currentCHF = convertToCHF(c.current_value, currency, fxRates)
    const currentUSD = convertFromCHF(currentCHF, 'USD', fxRates)
    const distCHF = convertToCHF(c.total_distributions, currency, fxRates)

    totalInvestedCHF += investedCHF
    totalInvestedUSD += investedUSD
    totalCurrentValueCHF += currentCHF
    totalCurrentValueUSD += currentUSD
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
    const vehicleLabels: Record<string, string> = {
      fiduciary: 'Verve',
      direct: 'Direct',
      spv: 'Direct',
      safe: 'Direct',
      fund: 'LP Fund',
      fund_lp: 'LP Fund',
      fund_etf: 'LP Fund',
    }
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
  const totalDistUSD = convertFromCHF(totalDistributionsCHF, 'USD', fxRates)
  const totalValueUSD = totalCurrentValueUSD + totalDistUSD

  const portfolioMoicCHF = totalInvestedCHF > 0
    ? totalValueCHF / totalInvestedCHF
    : 0
  const portfolioMoicUSD = totalInvestedUSD > 0
    ? totalValueUSD / totalInvestedUSD
    : 0

  const unrealizedPnlCHF = totalCurrentValueCHF - totalInvestedCHF
  const unrealizedPnlUSD = totalCurrentValueUSD - totalInvestedUSD

  // Weighted average MOIC in original currencies, then compare to CHF MOIC
  const weightedMoicOrig = weightedMoicOrigDenom > 0
    ? weightedMoicOrigSum / weightedMoicOrigDenom
    : 0
  const fxImpactPct = weightedMoicOrig > 0
    ? (portfolioMoicCHF / weightedMoicOrig) - 1
    : 0

  return {
    companyCount: companies.length,
    totalInvestedCHF,
    totalInvestedUSD,
    totalCurrentValueCHF,
    totalCurrentValueUSD,
    totalDistributionsCHF,
    totalValueCHF,
    totalValueUSD,
    portfolioMoicCHF,
    portfolioMoicUSD,
    portfolioMoic: portfolioMoicCHF, // backward compat
    unrealizedPnlCHF,
    unrealizedPnlUSD,
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
