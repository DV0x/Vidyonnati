"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useAuth } from '@/app/context/AuthContext'
import type { Application, SpotlightApplication } from '@/types/database'
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
  Star,
  Sparkles,
} from 'lucide-react'

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

export default function DashboardPage() {
  const { user, student } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [spotlightApplications, setSpotlightApplications] = useState<SpotlightApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchApplications() {
      try {
        // Fetch applications and spotlight apps in parallel via API routes.
        // API routes use the server-side Supabase client with cookies,
        // avoiding the browser client auth timing issue that caused
        // data to only load after a hard refresh.
        const [appsRes, spotlightRes] = await Promise.all([
          fetch('/api/student/applications'),
          fetch('/api/student/spotlight'),
        ])

        if (appsRes.ok) {
          setApplications(await appsRes.json())
        }

        if (spotlightRes.ok) {
          setSpotlightApplications(await spotlightRes.json())
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const displayName = student?.full_name || user?.email?.split('@')[0] || 'Student'

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Welcome back, {displayName}!
        </h1>
        <p className="mt-1 text-gray-600">
          Track your scholarship applications and manage your profile.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          title="Total Applications"
          value={isLoading ? '-' : applications.length.toString()}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title="Pending"
          value={isLoading ? '-' : applications.filter(a => a.status === 'pending').length.toString()}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Approved"
          value={isLoading ? '-' : applications.filter(a => a.status === 'approved').length.toString()}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Under Review"
          value={isLoading ? '-' : applications.filter(a => a.status === 'under_review').length.toString()}
          icon={Eye}
          color="blue"
        />
      </motion.div>

      {/* Applications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl">My Applications</CardTitle>
              <CardDescription>
                View and track all your scholarship applications
              </CardDescription>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
            >
              <Link href="/apply">
                <PlusCircle className="h-4 w-4" />
                Apply Now
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {applications.map((application, index) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    index={index}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Spotlight Applications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Spotlight Applications
              </CardTitle>
              <CardDescription>
                Get featured on our homepage and connect with donors
              </CardDescription>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
            >
              <Link href="/spotlight/apply">
                <Sparkles className="h-4 w-4" />
                Apply for Spotlight
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : spotlightApplications.length === 0 ? (
              <SpotlightEmptyState />
            ) : (
              <div className="space-y-4">
                {spotlightApplications.map((application, index) => (
                  <SpotlightApplicationCard
                    key={application.id}
                    application={application}
                    index={index}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: 'primary' | 'yellow' | 'green' | 'blue'
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
          {/* Application Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {application.application_id}
              </p>
              <p className="text-sm text-gray-600">
                {application.application_type === 'first-year' ? '1st Year' : '2nd Year'} Scholarship
              </p>
            </div>
          </div>

          {/* Academic Year */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{application.academic_year}</span>
          </div>

          {/* Status Badge */}
          <Badge className={status.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>

          {/* Submitted Date */}
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {new Date(application.created_at!).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No applications yet
      </h3>
      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        You haven&apos;t submitted any scholarship applications. Start your journey
        by applying for a scholarship today.
      </p>
      <Button
        asChild
        className="mt-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
      >
        <Link href="/apply">
          <PlusCircle className="h-4 w-4" />
          Apply for Scholarship
        </Link>
      </Button>
    </div>
  )
}

function SpotlightApplicationCard({
  application,
  index,
}: {
  application: SpotlightApplication
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
      <Link href={`/dashboard/spotlight/${application.id}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-orange-200 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
          {/* Application Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-orange-100">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {application.spotlight_id}
              </p>
              <p className="text-sm text-gray-600">
                Spotlight Application
              </p>
            </div>
          </div>

          {/* Featured Badge */}
          {application.is_featured && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}

          {/* Status Badge */}
          <Badge className={status.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>

          {/* Submitted Date */}
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {new Date(application.created_at!).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function SpotlightEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Star className="h-7 w-7 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No spotlight applications yet
      </h3>
      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        Apply for the Spotlight program to get featured on our homepage and connect
        with donors who can support your education.
      </p>
      <Button
        asChild
        className="mt-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
      >
        <Link href="/spotlight">
          <Sparkles className="h-4 w-4" />
          Learn More
        </Link>
      </Button>
    </div>
  )
}
