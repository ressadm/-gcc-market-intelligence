import type { DealStage } from './types'

export const AGING_THRESHOLD_DAYS = 30

export const PIPELINE_STAGES: DealStage[] = [
  'discovered',
  'screening',
  'evaluating',
  'decision',
  'committed',
]

export const TERMINAL_STAGES: DealStage[] = [
  'closed',
  'passed',
  'expired',
  'withdrawn',
]

export const STAGE_LABELS: Record<DealStage, string> = {
  discovered: 'Discovered',
  screening: 'Screening',
  evaluating: 'Evaluating',
  decision: 'Decision',
  committed: 'Committed',
  closed: 'Closed',
  passed: 'Passed',
  expired: 'Expired',
  withdrawn: 'Withdrawn',
}

export const STAGE_COLORS: Record<DealStage, string> = {
  discovered: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  screening: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  evaluating: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  decision: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  committed: 'bg-green-500/20 text-green-400 border-green-500/30',
  closed: 'bg-green-700/20 text-green-600 border-green-700/30',
  passed: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  withdrawn: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export const SOURCE_LABELS: Record<string, string> = {
  verve_coinvest: 'Verve Co-invest',
  oqal_network: 'Oqal Network',
  referral: 'Referral',
  event: 'Event',
  platform: 'Platform',
  inbound: 'Inbound',
  self_sourced: 'Self-sourced',
}
