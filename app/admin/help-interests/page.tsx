"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import type { HelpInterest, HelpType, HelpInterestStatus } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  HandHeart,
  Edit,
  Mail,
  Phone,
  RefreshCw,
  Sparkles,
  Building2,
  Users,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
} from 'lucide-react'

interface HelpInterestsResponse {
  helpInterests: HelpInterest[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  new: {
    label: 'New',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Sparkles,
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  converted: {
    label: 'Converted',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
  },
}

const typeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  donate: { label: 'Donate', icon: HandHeart },
  volunteer: { label: 'Volunteer', icon: Users },
  corporate: { label: 'Corporate', icon: Building2 },
  other: { label: 'Other', icon: HelpCircle },
}

export default function HelpInterestsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [helpInterests, setHelpInterests] = useState<HelpInterest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState<HelpInterestStatus | 'all'>(
    (searchParams.get('status') as HelpInterestStatus) || 'all'
  )
  const [helpType, setHelpType] = useState<HelpType | 'all'>(
    (searchParams.get('type') as HelpType) || 'all'
  )
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const pageSize = 10

  // Edit dialog state
  const [editingInterest, setEditingInterest] = useState<HelpInterest | null>(null)
  const [editStatus, setEditStatus] = useState<HelpInterestStatus>('new')
  const [editNotes, setEditNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchHelpInterests = useCallback(async () => {
    setIsLoading(true)

    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (status !== 'all') params.set('status', status)
    if (helpType !== 'all') params.set('type', helpType)
    params.set('page', page.toString())
    params.set('pageSize', pageSize.toString())

    const res = await fetch(`/api/admin/help-interests?${params.toString()}`)
    if (res.ok) {
      const data: HelpInterestsResponse = await res.json()
      setHelpInterests(data.helpInterests)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    }

    setIsLoading(false)
  }, [debouncedSearch, status, helpType, page])

  useEffect(() => {
    fetchHelpInterests()
  }, [fetchHelpInterests])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (status !== 'all') params.set('status', status)
    if (helpType !== 'all') params.set('type', helpType)
    if (page > 1) params.set('page', page.toString())

    const query = params.toString()
    router.replace(`/admin/help-interests${query ? `?${query}` : ''}`, {
      scroll: false,
    })
  }, [debouncedSearch, status, helpType, page, router])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, helpType])

  const handleEditClick = (interest: HelpInterest) => {
    setEditingInterest(interest)
    setEditStatus(interest.status as HelpInterestStatus)
    setEditNotes(interest.notes || '')
  }

  const handleSave = async () => {
    if (!editingInterest) return
    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/help-interests/${editingInterest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
        }),
      })

      if (res.ok) {
        toast.success('Help interest updated successfully')
        setEditingInterest(null)
        fetchHelpInterests()
      } else {
        toast.error('Failed to update help interest')
      }
    } catch {
      toast.error('An error occurred')
    }

    setIsSaving(false)
  }

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
            Help Interests
          </h1>
          <p className="mt-1 text-gray-600">
            Manage &quot;I Want to Help&quot; submissions from potential donors and volunteers
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchHelpInterests}
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
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as HelpInterestStatus | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select
                value={helpType}
                onValueChange={(value) => setHelpType(value as HelpType | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="donate">Donate</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Interests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Help Interests</CardTitle>
                <CardDescription>
                  {isLoading
                    ? 'Loading...'
                    : `${total} submission${total !== 1 ? 's' : ''} found`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : helpInterests.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="hidden md:table-cell">Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {helpInterests.map((interest) => (
                        <InterestRow
                          key={interest.id}
                          interest={interest}
                          onEdit={handleEditClick}
                        />
                      ))}
                    </TableBody>
                  </Table>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingInterest} onOpenChange={() => setEditingInterest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Help Interest</DialogTitle>
            <DialogDescription>
              Update the status and add follow-up notes
            </DialogDescription>
          </DialogHeader>

          {editingInterest && (
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <p className="font-medium text-gray-900">{editingInterest.name}</p>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {editingInterest.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {editingInterest.phone}
                  </span>
                </div>
                {editingInterest.student_name && (
                  <p className="text-sm flex items-center gap-2 mt-2 pt-2 border-t">
                    <ArrowRight className="h-4 w-4" />
                    Interested in helping: <strong>{editingInterest.student_name}</strong>
                  </p>
                )}
              </div>

              {/* Message */}
              {editingInterest.message && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </p>
                  <p className="text-sm text-blue-900">{editingInterest.message}</p>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(value) => setEditStatus(value as HelpInterestStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Follow-up Notes</Label>
                <Textarea
                  placeholder="Add notes about this lead..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInterest(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InterestRow({
  interest,
  onEdit,
}: {
  interest: HelpInterest
  onEdit: (interest: HelpInterest) => void
}) {
  const status = statusConfig[interest.status] || statusConfig.new
  const StatusIcon = status.icon
  const type = typeConfig[interest.help_type] || typeConfig.other
  const TypeIcon = type.icon

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div>
          <p className="font-medium text-gray-900">{interest.name}</p>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {interest.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="gap-1">
          <TypeIcon className="h-3 w-3" />
          {type.label}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {interest.student_name ? (
          <span className="text-gray-700">{interest.student_name}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className={status.className}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-gray-500">
        {new Date(interest.created_at!).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onEdit(interest)}>
          <Edit className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
        </Button>
      </TableCell>
    </TableRow>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <HandHeart className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No help interests found
      </h3>
      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        Try adjusting your search or filter criteria to find what you&apos;re looking for.
      </p>
    </div>
  )
}
