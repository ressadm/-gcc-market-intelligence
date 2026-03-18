'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatMoic, moicColorClass } from '@/lib/format'
import { convertToCHF } from '@/lib/fx'
import type { PortfolioCompany } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TopCompaniesTableProps {
  companies: PortfolioCompany[]
  fxRates: Record<string, number>
  isLoading?: boolean
  onCompanyClick?: (companyId: string) => void
}

export function TopCompaniesTable({ companies, fxRates, isLoading, onCompanyClick }: TopCompaniesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-5 w-40 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const sorted = [...companies]
    .map(c => ({
      ...c,
      valueCHF: convertToCHF(c.total_value, c.investment_currency, fxRates),
    }))
    .sort((a, b) => b.valueCHF - a.valueCHF)
    .slice(0, 5)

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-heading text-lg font-semibold">Top Companies</h3>
          <p className="text-muted-foreground text-sm text-center py-8">No companies</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold">Top Companies</h3>
          <Link
            href="/portfolio"
            className="text-sm text-primary hover:underline"
          >
            View all {companies.length} companies
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead className="hidden sm:table-cell">Currency</TableHead>
              <TableHead className="text-right">Invested</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">MOIC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((company) => (
              <TableRow key={company.company_id}>
                <TableCell className="font-medium">
                  <button
                    onClick={() => onCompanyClick?.(company.company_id)}
                    className="hover:text-primary transition-colors hover:underline text-left"
                  >
                    {company.name}
                  </button>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="secondary">{company.investment_currency}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(company.total_invested, company.investment_currency || 'CHF')}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(company.valueCHF)}
                </TableCell>
                <TableCell className={cn('text-right tabular-nums', moicColorClass(company.moic))}>
                  {formatMoic(company.moic)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
