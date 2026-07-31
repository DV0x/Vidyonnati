"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { usePaginatedQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '@/convex/_generated/api'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Star,
  AlertTriangle,
} from 'lucide-react'

// Mirrors the union in convex/schema.ts. Declared locally because
// types/database.ts goes away with the Supabase client in Phase 5.
type SpotlightStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'needs_info'

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Eye,
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  needs_info: {
    label: 'Needs Info',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
  },
}

export default function SpotlightApplicationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()


  // Filter state from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState<SpotlightStatus | 'all'>(
    (searchParams.get('status') as SpotlightStatus) || 'all'
  )
  const [featured, setFeatured] = useState<'all' | 'true' | 'false'>(
    (searchParams.get('featured') as 'all' | 'true' | 'false') || 'all'
  )
  const pageSize = 10

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Cursor pagination, not numbered pages. Convex has no count operator, and a
  // total means reading every matching row — which is what pagination exists to
  // avoid. Filters live in args, so changing one resets the cursor for free.
  const { results: applications, status: pageStatus, loadMore } = usePaginatedQuery(
    api.admin.spotlightApplications,
    { search: debouncedSearch || undefined, status: status === 'all' ? undefined : status, isFeatured: featured === 'all' ? undefined : featured === 'true' },
    { initialNumItems: pageSize },
  )


  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (status !== 'all') params.set('status', status)
    if (featured !== 'all') params.set('featured', featured)

    const query = params.toString()
    router.replace(`/admin/spotlight-applications${query ? `?${query}` : ''}`, {
      scroll: false,
    })
  }, [debouncedSearch, status, featured, router])


  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Spotlight Applications
        </h1>
        <p className="mt-1 text-gray-600">
          Review and manage spotlight-only applications from students
        </p>
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
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or spotlight ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as SpotlightStatus | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs_info">Needs Info</SelectItem>
                </SelectContent>
              </Select>

              {/* Featured Filter */}
              <Select
                value={featured}
                onValueChange={(value) => setFeatured(value as 'all' | 'true' | 'false')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Applications</CardTitle>
                <CardDescription>
                  {pageStatus === 'LoadingFirstPage' ? 'Loading…' : `${applications.length} application${applications.length !== 1 ? 's' : ''} loaded${pageStatus === 'CanLoadMore' ? '+' : ''}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pageStatus === 'LoadingFirstPage' ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Spotlight ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Featured</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => (
                        <ApplicationRow
                          key={application._id}
                          application={application}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {pageStatus === 'CanLoadMore' || pageStatus === 'LoadingMore' ? (
                  <div className="flex justify-center border-t pt-4 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadMore(pageSize)}
                      disabled={pageStatus === 'LoadingMore'}
                    >
                      {pageStatus === 'LoadingMore' ? 'Loading…' : 'Load more'}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function ApplicationRow({ application }: { application: FunctionReturnType<typeof api.admin.spotlightApplications>['page'][number] }) {
  const status = statusConfig[application.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <TableRow className="cursor-pointer hover:bg-gray-50">
      <TableCell>
        <Link
          href={`/admin/spotlight-applications/${application._id}`}
          className="font-medium text-primary hover:underline"
        >
          {application.spotlightId}
        </Link>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-gray-900">{application.fullName}</p>
          <p className="text-sm text-gray-500">{application.email}</p>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="text-gray-600">{application.courseStream}</span>
      </TableCell>
      <TableCell>
        <Badge className={status.className}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {application.isFeatured ? (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Featured
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell className="hidden sm:table-cell text-gray-500">
        {new Date(application._creationTime!).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/spotlight-applications/${application._id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">View</span>
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Sparkles className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No spotlight applications found
      </h3>
      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        Try adjusting your search or filter criteria to find what you&apos;re looking for.
      </p>
    </div>
  )
}
