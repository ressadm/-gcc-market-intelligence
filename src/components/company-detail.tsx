'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AddTransactionDialog } from '@/components/add-transaction-dialog'
import { UpdateValuationDialog } from '@/components/update-valuation-dialog'
import { formatCurrency, formatCurrencyPrecise, formatMoic, formatDate, moicColorClass, valueColorClass } from '@/lib/format'
import { convertToCHF } from '@/lib/fx'
import type { PortfolioCompany, Transaction } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ArrowLeft, AlertCircle, Plus, RefreshCw } from 'lucide-react'

interface CompanyDetailProps {
  company: PortfolioCompany
  transactions: Transaction[]
  fxRates: Record<string, number>
  onRefresh?: () => void
}

const typeBadgeColors: Record<string, string> = {
  EQT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CVL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SAFE: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  ADJ: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  DIST: 'bg-green-500/20 text-green-400 border-green-500/30',
  RECAP: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export function CompanyDetail({ company, transactions, fxRates, onRefresh }: CompanyDetailProps) {
  const [showAddTxn, setShowAddTxn] = useState(false)
  const [showUpdateVal, setShowUpdateVal] = useState(false)
  const ccy = company.investment_currency || 'CHF'
  // Invested: pre-computed from per-transaction historical FX rates
  const investedCHF = company.total_invested_chf
  // Current value: live FX (recomputed daily)
  const valueCHF = convertToCHF(company.current_value, ccy, fxRates)
  const gainLoss = valueCHF - investedCHF

  return (
    <div className="space-y-6">
      {/* Back link + Header */}
      <div>
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-heading text-2xl font-bold">{company.name}</h1>
          <Badge variant={company.status === 'Active' ? 'default' : 'secondary'}>
            {company.status}
          </Badge>
          <Badge variant="outline">{ccy}</Badge>
          {company.first_investment_date && (
            <span className="text-sm text-muted-foreground">
              Since {formatDate(company.first_investment_date)}
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Invested</p>
            <p className="text-xl font-mono font-semibold mt-1 tabular-nums">
              {formatCurrency(company.total_invested, ccy)}
            </p>
            {ccy !== 'CHF' && (
              <p className="text-xs text-muted-foreground mt-1">{formatCurrency(investedCHF)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-xl font-mono font-semibold mt-1 tabular-nums">
              {formatCurrency(valueCHF)}
            </p>
            {ccy !== 'CHF' && (
              <p className="text-xs text-muted-foreground mt-1">{formatCurrency(company.current_value, ccy)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">MOIC</p>
            <p className={cn('text-xl font-mono font-semibold mt-1 tabular-nums', moicColorClass(company.moic))}>
              {formatMoic(company.moic)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gain / Loss</p>
            <p className={cn('text-xl font-mono font-semibold mt-1 tabular-nums', valueColorClass(gainLoss))}>
              {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-lg font-semibold">Transaction History</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpdateVal(true)}
              className="text-xs"
            >
              <RefreshCw size={12} className="mr-1" />
              Update Valuation
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddTxn(true)}
              className="text-xs"
            >
              <Plus size={12} className="mr-1" />
              Add Transaction
            </Button>
          </div>
        </div>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No transactions recorded</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount ({ccy})</TableHead>
                  <TableHead className="text-right">Amount (CHF)</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Shares</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Price/Share</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">FX Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => {
                  const amountCHF = txn.fx_rate_orig_to_chf
                    ? txn.amount_orig * txn.fx_rate_orig_to_chf
                    : txn.amount_orig
                  const isCash = txn.is_cash_event

                  return (
                    <TableRow
                      key={txn.id}
                      className={cn(!isCash && 'opacity-60')}
                    >
                      <TableCell className="text-sm">{formatDate(txn.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', typeBadgeColors[txn.type] || '')}
                        >
                          {txn.type}
                        </Badge>
                        {!isCash && (
                          <span className="ml-1 text-xs text-muted-foreground">(non-cash)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {txn.amount_orig > 0
                          ? formatCurrency(txn.amount_orig, ccy)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {amountCHF > 0
                          ? formatCurrency(amountCHF)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums hidden md:table-cell">
                        {txn.shares ? new Intl.NumberFormat('en-CH', { maximumFractionDigits: 3 }).format(txn.shares) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums hidden md:table-cell">
                        {txn.price_per_share_orig
                          ? formatCurrencyPrecise(txn.price_per_share_orig, ccy)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums hidden lg:table-cell text-muted-foreground">
                        {txn.fx_rate_orig_to_chf
                          ? txn.fx_rate_orig_to_chf.toFixed(4)
                          : ccy === 'CHF' ? '1.0000' : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AddTransactionDialog
        companyId={company.company_id}
        companyName={company.name}
        companyCurrency={ccy}
        open={showAddTxn}
        onOpenChange={setShowAddTxn}
        onSuccess={onRefresh}
      />

      <UpdateValuationDialog
        companyId={company.company_id}
        companyName={company.name}
        companyCurrency={ccy}
        currentSharePrice={company.latest_share_price}
        totalShares={company.total_shares}
        open={showUpdateVal}
        onOpenChange={setShowUpdateVal}
        onSuccess={onRefresh}
      />
    </div>
  )
}

export function CompanyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <Skeleton className="h-6 w-40 mb-3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full mb-2" />
        ))}
      </div>
    </div>
  )
}

export function CompanyNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <p className="text-lg text-foreground">Company not found</p>
      <Link
        href="/portfolio"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Portfolio
      </Link>
    </div>
  )
}
