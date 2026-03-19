'use client'

import { useCompanyDetail } from '@/hooks/use-company-detail'
import { CompanyDetail, CompanyDetailSkeleton, CompanyNotFound } from '@/components/company-detail'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { company, transactions, fxRates, isLoading, error, refetch } = useCompanyDetail(id)

  if (isLoading) {
    return <CompanyDetailSkeleton />
  }

  if (error === 'Company not found' || (!isLoading && !company)) {
    return <CompanyNotFound />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg text-foreground">Failed to load company</p>
        <p className="text-sm text-muted-foreground">{error}</p>
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

  if (!company) return null

  return (
    <CompanyDetail
      company={company}
      transactions={transactions}
      fxRates={fxRates}
      onRefresh={refetch}
    />
  )
}
