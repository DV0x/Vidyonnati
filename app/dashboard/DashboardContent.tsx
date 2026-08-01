"use client"

import Link from 'next/link'
import { motion } from 'motion/react'
import { usePreloadedQuery, type Preloaded } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

// Row types are derived from the query's return type rather than declared, so
// adding a field in Convex cannot leave this file describing a shape the
// backend no longer returns.
type Summary = NonNullable<FunctionReturnType<typeof api.dashboard.summary>>
type ApplicationRow = Summary['applications'][number]
type SpotlightRow = Summary['spotlightApplications'][number]

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

const submittedOn = (creationTime: number) =>
  new Date(creationTime).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export default function DashboardContent({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.dashboard.summary>
}) {
  // The data is already here on first paint — the server ran this query during
  // render. There is no loading state to model, which is why the skeletons and
  // the useEffect/fetch/setState dance this replaced are both gone. The
  // subscription stays live, so an admin approving an application updates this
  // view without a refetch.
  const data = usePreloadedQuery(preloaded)

  const applications = data?.applications ?? []
  const spotlightApplications = data?.spotlightApplications ?? []
  const student = data?.student ?? null

  const displayName =
    student?.fullName || student?.email?.split('@')[0] || 'Student'

  const countByStatus = (status: string) =>
    applications.filter((a) => a.status === status).length +
    spotlightApplications.filter((a) => a.status === status).length

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
          value={(applications.length + spotlightApplications.length).toString()}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title="Pending"
          value={countByStatus('pending').toString()}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Approved"
          value={countByStatus('approved').toString()}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Under Review"
          value={countByStatus('under_review').toString()}
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
            {applications.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {applications.map((application, index) => (
                  <ApplicationCard
                    key={application._id}
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
            {spotlightApplications.length === 0 ? (
              <SpotlightEmptyState />
            ) : (
              <div className="space-y-4">
                {spotlightApplications.map((application, index) => (
                  <SpotlightApplicationCard
                    key={application._id}
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
  application: ApplicationRow
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
      <Link href={`/dashboard/applications/${application._id}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
          {/* Application Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {application.applicationId}
              </p>
              <p className="text-sm text-gray-600">
                {application.applicationType === 'first-year' ? '1st Year' : '2nd Year'} Scholarship
              </p>
            </div>
          </div>

          {/* Academic Year */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{application.academicYear}</span>
          </div>

          {/* Status Badge */}
          <Badge className={status.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>

          {/* Submitted Date */}
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {submittedOn(application._creationTime)}
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
  application: SpotlightRow
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
      <Link href={`/dashboard/spotlight/${application._id}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-orange-200 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
          {/* Application Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-orange-100">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {application.spotlightId}
              </p>
              <p className="text-sm text-gray-600">
                Spotlight Application
              </p>
            </div>
          </div>

          {/* Featured Badge */}
          {application.isFeatured && (
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
            {submittedOn(application._creationTime)}
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
