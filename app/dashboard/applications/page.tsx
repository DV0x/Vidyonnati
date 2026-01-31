"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import type { Application, SpotlightApplication } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  GraduationCap,
  ChevronRight,
  Search,
  Star,
  Sparkles,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  under_review: {
    label: 'Under Review',
    icon: Eye,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  needs_info: {
    label: 'Needs Info',
    icon: AlertCircle,
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
}

// Unified type for displaying both application types in one list
interface UnifiedApplication {
  id: string
  displayId: string
  type: 'scholarship' | 'spotlight'
  typeLabel: string
  status: string
  createdAt: string
  detailHref: string
}

function toUnified(app: Application): UnifiedApplication {
  return {
    id: app.id,
    displayId: app.application_id,
    type: 'scholarship',
    typeLabel: app.application_type === 'first-year' ? '1st Year Scholarship' : '2nd Year Renewal Scholarship',
    status: app.status,
    createdAt: app.created_at!,
    detailHref: `/dashboard/applications/${app.id}`,
  }
}

function spotlightToUnified(app: SpotlightApplication): UnifiedApplication {
  return {
    id: app.id,
    displayId: app.spotlight_id,
    type: 'spotlight',
    typeLabel: 'Spotlight Application',
    status: app.status,
    createdAt: app.created_at!,
    detailHref: `/dashboard/spotlight/${app.id}`,
  }
}

export default function ApplicationsPage() {
  const [allApplications, setAllApplications] = useState<UnifiedApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<UnifiedApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchApplications() {
      try {
        const [appsRes, spotlightRes] = await Promise.all([
          fetch('/api/student/applications'),
          fetch('/api/student/spotlight'),
        ])

        const unified: UnifiedApplication[] = []

        if (appsRes.ok) {
          const apps: Application[] = await appsRes.json()
          unified.push(...apps.map(toUnified))
        }

        if (spotlightRes.ok) {
          const spotlightApps: SpotlightApplication[] = await spotlightRes.json()
          unified.push(...spotlightApps.map(spotlightToUnified))
        }

        // Sort by created date descending
        unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setAllApplications(unified)
        setFilteredApplications(unified)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  useEffect(() => {
    let filtered = allApplications

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.displayId.toLowerCase().includes(query) ||
          app.typeLabel.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((app) => app.type === typeFilter)
    }

    setFilteredApplications(filtered)
  }, [searchQuery, statusFilter, typeFilter, allApplications])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            My Applications
          </h1>
          <p className="mt-1 text-gray-600">
            View and track all your applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
          >
            <Link href="/apply">
              <PlusCircle className="h-4 w-4" />
              Scholarship
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
          >
            <Link href="/spotlight/apply">
              <Sparkles className="h-4 w-4" />
              Spotlight
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by Application ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'scholarship', 'spotlight'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  typeFilter === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type === 'scholarship' ? 'Scholarship' : 'Spotlight'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'under_review', 'approved', 'rejected', 'needs_info'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all'
                  ? 'All Status'
                  : status === 'under_review'
                  ? 'Under Review'
                  : status === 'needs_info'
                  ? 'Needs Info'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </motion.div>

      {/* Applications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyState hasApplications={allApplications.length > 0} />
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application, index) => (
              <ApplicationCard
                key={application.id}
                application={application}
                index={index}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function ApplicationCard({
  application,
  index,
}: {
  application: UnifiedApplication
  index: number
}) {
  const status = statusConfig[application.status] || statusConfig.pending
  const StatusIcon = status.icon
  const isSpotlight = application.type === 'spotlight'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={application.detailHref}>
        <Card className={`hover:border-primary/50 hover:shadow-md transition-all cursor-pointer ${isSpotlight ? 'border-orange-200' : ''}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Icon and Main Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                  isSpotlight
                    ? 'bg-gradient-to-br from-primary/10 to-orange-100'
                    : 'bg-gradient-to-br from-primary/10 to-orange-500/10'
                }`}>
                  {isSpotlight ? (
                    <Star className="h-7 w-7 text-primary" />
                  ) : (
                    <GraduationCap className="h-7 w-7 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {application.displayId}
                    </h3>
                    <Badge className={status.className}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {application.typeLabel}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Submitted:{' '}
                      {new Date(application.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

function EmptyState({ hasApplications }: { hasApplications: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {hasApplications ? 'No matching applications' : 'No applications yet'}
        </h3>
        <p className="mt-2 text-sm text-gray-600 max-w-sm">
          {hasApplications
            ? 'Try adjusting your search or filter criteria.'
            : "You haven't submitted any applications yet. Apply for a scholarship or the spotlight program to get started."}
        </p>
        {!hasApplications && (
          <div className="flex gap-3 mt-6">
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
            >
              <Link href="/apply">
                <PlusCircle className="h-4 w-4" />
                Scholarship
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5"
            >
              <Link href="/spotlight/apply">
                <Sparkles className="h-4 w-4" />
                Spotlight
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
