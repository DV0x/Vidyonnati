"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { Application } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function ApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchApplications() {
      if (!user) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setApplications(data)
        setFilteredApplications(data)
      }
      setIsLoading(false)
    }

    fetchApplications()
  }, [user])

  useEffect(() => {
    let filtered = applications

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.application_id.toLowerCase().includes(query) ||
          app.academic_year.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [searchQuery, statusFilter, applications])

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
            View and track all your scholarship applications
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
        >
          <Link href="/apply">
            <PlusCircle className="h-4 w-4" />
            New Application
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Application ID or Year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
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
                  ? 'All'
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
          <EmptyState hasApplications={applications.length > 0} />
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
  application: Application
  index: number
}) {
  const status = statusConfig[application.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/dashboard/applications/${application.id}`}>
        <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Icon and Main Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/10">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {application.application_id}
                    </h3>
                    <Badge className={status.className}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {application.application_type === 'first-year'
                      ? '1st Year Scholarship'
                      : '2nd Year Renewal Scholarship'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {application.academic_year}
                    </span>
                    <span>
                      Submitted:{' '}
                      {new Date(application.created_at!).toLocaleDateString('en-IN', {
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
            : "You haven't submitted any scholarship applications. Start your journey by applying for a scholarship today."}
        </p>
        {!hasApplications && (
          <Button
            asChild
            className="mt-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
          >
            <Link href="/apply">
              <PlusCircle className="h-4 w-4" />
              Apply for Scholarship
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
