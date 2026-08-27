'use client'

import { useState } from 'react'
import { useGCCCompanies } from '@/hooks/use-market-intelligence'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  Search,
  Globe,
  ExternalLink,
  Linkedin,
  Twitter,
  MapPin,
  Users,
  Calendar,
  DollarSign
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

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<GCCCountry | 'all'>('saudi_arabia')
  
  const { companies, total, isLoading, error } = useGCCCompanies({
    countries: selectedCountry !== 'all' ? [selectedCountry] : undefined,
    search: searchQuery || undefined
  })

  const getImportanceColor = (level: string | null) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case 'startup': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'enterprise': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'government': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">GCC ITC Companies</h1>
        <p className="text-muted-foreground">Tracked technology companies across GCC region</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>{total} companies tracked</span>
        </div>
      </div>

      {/* Companies Grid */}
      {error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : companies.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No companies found</p>
              </CardContent>
            </Card>
          ) : (
            companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{company.name}</CardTitle>
                      {company.name_arabic && (
                        <p className="text-sm text-muted-foreground">{company.name_arabic}</p>
                      )}
                    </div>
                    {company.importance_level && (
                      <Badge className={getImportanceColor(company.importance_level)}>
                        {company.importance_level}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getCompanyTypeColor(company.company_type)}>
                      {company.company_type}
                    </Badge>
                    <Badge variant="outline">{company.sector}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {company.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {company.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {company.city && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{company.city}, {COUNTRY_LABELS[company.country]}</span>
                      </div>
                    )}

                    {company.founded_year && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Founded {company.founded_year}</span>
                      </div>
                    )}

                    {company.employee_count && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{company.employee_count} employees</span>
                      </div>
                    )}

                    {company.total_funding_usd && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>${(company.total_funding_usd / 1000000).toFixed(1)}M raised</span>
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex gap-2 pt-2">
                    {company.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {company.linkedin_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {company.twitter_handle && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://twitter.com/${company.twitter_handle}`} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Key Investors */}
                  {company.key_investors && company.key_investors.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium mb-1">Key Investors:</p>
                      <div className="flex flex-wrap gap-1">
                        {company.key_investors.slice(0, 3).map((investor, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {investor}
                          </Badge>
                        ))}
                        {company.key_investors.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{company.key_investors.length - 3}
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
