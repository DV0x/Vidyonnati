"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { AdminActivityLog } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  Users,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
} from 'lucide-react'

interface Stats {
  pendingApplications: number
  newHelpInterests: number
  pendingDonations: number
  featuredStudents: number
}

interface ActivityLogWithAdmin extends AdminActivityLog {
  admin_name?: string
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [activities, setActivities] = useState<ActivityLogWithAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [adminName, setAdminName] = useState<string>('')

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      const supabase = createClient()

      // Fetch admin name
      const { data: admin } = await supabase
        .from('admins')
        .select('name')
        .eq('id', user.id)
        .single()

      if (admin?.name) {
        setAdminName(admin.name)
      }

      // Fetch stats from API
      const statsRes = await fetch('/api/admin/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Fetch recent activity log
      const { data: activityData } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (activityData) {
        // Fetch admin names for activities
        const adminIds = [...new Set(activityData.map(a => a.admin_user_id))]
        const { data: admins } = await supabase
          .from('admins')
          .select('id, name')
          .in('id', adminIds)

        const adminMap = new Map(admins?.map(a => [a.id, a.name]) || [])

        setActivities(activityData.map(activity => ({
          ...activity,
          admin_name: adminMap.get(activity.admin_user_id) || 'Unknown Admin',
        })))
      }

      setIsLoading(false)
    }

    fetchData()
  }, [user])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const displayName = adminName || user?.email?.split('@')[0] || 'Admin'

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 text-white"
      >
        <h1 className="text-2xl font-bold sm:text-3xl">
          Welcome back, {displayName}!
        </h1>
        <p className="mt-1 text-slate-300">{today}</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          title="Pending Applications"
          value={isLoading ? '-' : (stats?.pendingApplications ?? 0).toString()}
          icon={FileText}
          color="yellow"
          href="/admin/scholarship-applications?status=pending"
        />
        <StatsCard
          title="New Help Interests"
          value={isLoading ? '-' : (stats?.newHelpInterests ?? 0).toString()}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Pending Donations"
          value={isLoading ? '-' : (stats?.pendingDonations ?? 0).toString()}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Featured Students"
          value={isLoading ? '-' : (stats?.featuredStudents ?? 0).toString()}
          icon={Star}
          color="primary"
        />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>
              Latest actions taken by administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <EmptyActivity />
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
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
  href,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: 'primary' | 'yellow' | 'green' | 'blue'
  href?: string
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
  }

  const content = (
    <Card className={href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
          {href && <ArrowRight className="h-5 w-5 text-gray-400" />}
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

function ActivityCard({
  activity,
  index,
}: {
  activity: ActivityLogWithAdmin
  index: number
}) {
  const getActivityIcon = () => {
    if (activity.action_type === 'status_change') {
      const newStatus = (activity.new_value as { status?: string })?.status
      switch (newStatus) {
        case 'approved':
          return { icon: CheckCircle2, className: 'bg-green-100 text-green-600' }
        case 'rejected':
          return { icon: XCircle, className: 'bg-red-100 text-red-600' }
        case 'under_review':
          return { icon: Eye, className: 'bg-blue-100 text-blue-600' }
        default:
          return { icon: Clock, className: 'bg-yellow-100 text-yellow-600' }
      }
    }
    return { icon: FileText, className: 'bg-gray-100 text-gray-600' }
  }

  const getActivityDescription = () => {
    if (activity.action_type === 'status_change') {
      const oldStatus = (activity.old_value as { status?: string })?.status || 'unknown'
      const newStatus = (activity.new_value as { status?: string })?.status || 'unknown'
      return `Changed status from "${formatStatus(oldStatus)}" to "${formatStatus(newStatus)}"`
    }
    if (activity.action_type === 'notes_update') {
      return 'Updated reviewer notes'
    }
    return activity.action_type
  }

  const { icon: ActivityIcon, className } = getActivityIcon()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
    >
      <div className={`rounded-full p-2 ${className}`}>
        <ActivityIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {getActivityDescription()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {activity.entity_type === 'application' && (
            <Link
              href={`/admin/scholarship-applications/${activity.entity_id}`}
              className="text-primary hover:underline"
            >
              View Application
            </Link>
          )}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-500">
          {activity.admin_name}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(activity.created_at!).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  )
}

function formatStatus(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    needs_info: 'Needs Info',
  }
  return statusLabels[status] || status
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Clock className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No recent activity
      </h3>
      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        Activity will appear here once you start reviewing applications.
      </p>
    </div>
  )
}
