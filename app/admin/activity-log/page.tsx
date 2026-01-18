"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import type { AdminActivityLog, Admin } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  History,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  AlertCircle,
  FileText,
  Star,
  User,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'

interface ActivityLogResponse {
  activities: (AdminActivityLog & { admin: { name: string | null; email: string } })[]
  admins: Admin[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const actionTypeConfig: Record<string, { label: string; className: string }> = {
  status_change: { label: 'Status Change', className: 'bg-blue-100 text-blue-800' },
  notes_update: { label: 'Notes Update', className: 'bg-gray-100 text-gray-800' },
  featured_change: { label: 'Featured Change', className: 'bg-amber-100 text-amber-800' },
  spotlight_reorder: { label: 'Spotlight Reorder', className: 'bg-purple-100 text-purple-800' },
}

const entityTypeConfig: Record<string, { label: string; basePath: string }> = {
  application: { label: 'Scholarship Application', basePath: '/admin/scholarship-applications' },
  spotlight_application: { label: 'Spotlight Application', basePath: '/admin/spotlight-applications' },
  donation: { label: 'Donation', basePath: '/admin/donations' },
  help_interest: { label: 'Help Interest', basePath: '/admin/help-interests' },
  spotlight: { label: 'Spotlight', basePath: '/admin/spotlight' },
}

function getStatusIcon(status: string | undefined) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'under_review':
      return <Eye className="h-4 w-4 text-blue-600" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'needs_info':
      return <AlertCircle className="h-4 w-4 text-orange-600" />
    case 'confirmed':
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'contacted':
      return <MessageSquare className="h-4 w-4 text-blue-600" />
    case 'converted':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'closed':
      return <XCircle className="h-4 w-4 text-gray-600" />
    default:
      return <FileText className="h-4 w-4 text-gray-600" />
  }
}

export default function ActivityLogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activities, setActivities] = useState<ActivityLogResponse['activities']>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter state
  const [actionType, setActionType] = useState(searchParams.get('action_type') || 'all')
  const [entityType, setEntityType] = useState(searchParams.get('entity_type') || 'all')
  const [adminId, setAdminId] = useState(searchParams.get('admin_id') || 'all')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const pageSize = 20

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)

    const params = new URLSearchParams()
    if (actionType !== 'all') params.set('action_type', actionType)
    if (entityType !== 'all') params.set('entity_type', entityType)
    if (adminId !== 'all') params.set('admin_id', adminId)
    params.set('page', page.toString())
    params.set('pageSize', pageSize.toString())

    const res = await fetch(`/api/admin/activity-log?${params.toString()}`)
    if (res.ok) {
      const data: ActivityLogResponse = await res.json()
      setActivities(data.activities)
      setAdmins(data.admins)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    }

    setIsLoading(false)
  }, [actionType, entityType, adminId, page])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (actionType !== 'all') params.set('action_type', actionType)
    if (entityType !== 'all') params.set('entity_type', entityType)
    if (adminId !== 'all') params.set('admin_id', adminId)
    if (page > 1) params.set('page', page.toString())

    const query = params.toString()
    router.replace(`/admin/activity-log${query ? `?${query}` : ''}`, {
      scroll: false,
    })
  }, [actionType, entityType, adminId, page, router])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [actionType, entityType, adminId])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Activity Log
          </h1>
          <p className="mt-1 text-gray-600">
            View all admin actions and changes made to the system
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchActivities}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Action Type Filter */}
              <Select
                value={actionType}
                onValueChange={setActionType}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="status_change">Status Change</SelectItem>
                  <SelectItem value="notes_update">Notes Update</SelectItem>
                  <SelectItem value="featured_change">Featured Change</SelectItem>
                  <SelectItem value="spotlight_reorder">Spotlight Reorder</SelectItem>
                </SelectContent>
              </Select>

              {/* Entity Type Filter */}
              <Select
                value={entityType}
                onValueChange={setEntityType}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="application">Scholarship Applications</SelectItem>
                  <SelectItem value="spotlight_application">Spotlight Applications</SelectItem>
                  <SelectItem value="donation">Donations</SelectItem>
                  <SelectItem value="help_interest">Help Interests</SelectItem>
                  <SelectItem value="spotlight">Spotlight</SelectItem>
                </SelectContent>
              </Select>

              {/* Admin Filter */}
              <Select
                value={adminId}
                onValueChange={setAdminId}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admins</SelectItem>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name || admin.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>
                  {isLoading
                    ? 'Loading...'
                    : `${total} activit${total !== 1 ? 'ies' : 'y'} found`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4 mt-4">
                    <p className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function ActivityRow({
  activity,
}: {
  activity: AdminActivityLog & { admin: { name: string | null; email: string } }
}) {
  const actionConfig = actionTypeConfig[activity.action_type] || {
    label: activity.action_type,
    className: 'bg-gray-100 text-gray-800',
  }
  const entityConfig = entityTypeConfig[activity.entity_type] || {
    label: activity.entity_type,
    basePath: null,
  }

  // Parse old/new values
  const oldValue = activity.old_value as Record<string, unknown> | null
  const newValue = activity.new_value as Record<string, unknown> | null

  // Generate link to entity
  const entityLink = entityConfig.basePath && activity.entity_id !== 'batch'
    ? `${entityConfig.basePath}/${activity.entity_id}`
    : null

  // Format timestamp
  const timestamp = new Date(activity.created_at!).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="rounded-lg border p-4 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
          {activity.action_type === 'status_change' ? (
            getStatusIcon(newValue?.status as string)
          ) : activity.action_type === 'featured_change' ? (
            <Star className="h-4 w-4 text-amber-600" />
          ) : activity.action_type === 'notes_update' ? (
            <FileText className="h-4 w-4 text-gray-600" />
          ) : (
            <History className="h-4 w-4 text-gray-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={actionConfig.className}>
              {actionConfig.label}
            </Badge>
            <Badge variant="outline">
              {entityConfig.label}
            </Badge>
            {entityLink && (
              <Button asChild variant="ghost" size="sm" className="h-6 px-2">
                <Link href={entityLink}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
            )}
          </div>

          {/* Description */}
          <div className="mt-2 text-sm text-gray-700">
            {activity.action_type === 'status_change' && (
              <p>
                Changed status from{' '}
                <code className="bg-gray-100 px-1 rounded">{String(oldValue?.status || 'unknown')}</code>
                {' '}to{' '}
                <code className="bg-gray-100 px-1 rounded">{String(newValue?.status || 'unknown')}</code>
              </p>
            )}
            {activity.action_type === 'notes_update' && (
              <p>Updated reviewer notes</p>
            )}
            {activity.action_type === 'featured_change' && (
              <p>
                {newValue?.is_featured ? 'Added to' : 'Removed from'} homepage spotlight
              </p>
            )}
            {activity.action_type === 'spotlight_reorder' && (
              <p>Reordered spotlight students</p>
            )}
          </div>

          {/* Meta */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {activity.admin.name || activity.admin.email}
            </span>
            <span>{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <History className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No activity found
      </h3>
      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        Try adjusting your filters or check back later when there are more actions logged.
      </p>
    </div>
  )
}
