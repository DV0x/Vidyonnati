"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { usePaginatedQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'
import { api } from '@/convex/_generated/api'
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
  HandHeart,
  Edit,
  Mail,
  Phone,
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

// Mirrors the unions in convex/schema.ts; see the note in the applications list.
type HelpInterestStatus = 'new' | 'contacted' | 'converted' | 'closed'
type HelpType = 'donate' | 'volunteer' | 'corporate' | 'other'

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


  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState<HelpInterestStatus | 'all'>(
    (searchParams.get('status') as HelpInterestStatus) || 'all'
  )
  const [helpType, setHelpType] = useState<HelpType | 'all'>(
    (searchParams.get('type') as HelpType) || 'all'
  )
  const pageSize = 10

  // Edit dialog state
  const [editingInterest, setEditingInterest] = useState<FunctionReturnType<typeof api.admin.helpInterests>['page'][number] | null>(null)
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

  // Cursor pagination, not numbered pages. Convex has no count operator, and a
  // total means reading every matching row — which is what pagination exists to
  // avoid. Filters live in args, so changing one resets the cursor for free.
  const { results: helpInterests, status: pageStatus, loadMore } = usePaginatedQuery(
    api.admin.helpInterests,
    { search: debouncedSearch || undefined, status: status === 'all' ? undefined : status, helpType: helpType === 'all' ? undefined : helpType },
    { initialNumItems: pageSize },
  )


  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (status !== 'all') params.set('status', status)
    if (helpType !== 'all') params.set('type', helpType)

    const query = params.toString()
    router.replace(`/admin/help-interests${query ? `?${query}` : ''}`, {
      scroll: false,
    })
  }, [debouncedSearch, status, helpType, router])


  const handleEditClick = (interest: FunctionReturnType<typeof api.admin.helpInterests>['page'][number]) => {
    setEditingInterest(interest)
    setEditStatus(interest.status as HelpInterestStatus)
    setEditNotes(interest.notes || '')
  }

  const handleSave = async () => {
    if (!editingInterest) return
    setIsSaving(true)

    try {
      // STILL SUPABASE, STILL 401. This is a write, and write paths are
      // Phase 3 — Phase 2 converted reads only. Once the mutation exists,
      // the list updates itself: it is a live Convex subscription now, which
      // is why the manual refetch that used to follow this was removed.
      const res = await fetch(`/api/admin/help-interests/${editingInterest._id}`, {
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
                  {pageStatus === 'LoadingFirstPage'
                    ? 'Loading…'
                    : `${helpInterests.length} submission${helpInterests.length !== 1 ? 's' : ''} loaded${pageStatus === 'CanLoadMore' ? '+' : ''}`}
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
                          key={interest._id}
                          interest={interest}
                          onEdit={handleEditClick}
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
                {editingInterest.studentName && (
                  <p className="text-sm flex items-center gap-2 mt-2 pt-2 border-t">
                    <ArrowRight className="h-4 w-4" />
                    Interested in helping: <strong>{editingInterest.studentName}</strong>
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
  interest: FunctionReturnType<typeof api.admin.helpInterests>['page'][number]
  onEdit: (interest: FunctionReturnType<typeof api.admin.helpInterests>['page'][number]) => void
}) {
  const status = statusConfig[interest.status] || statusConfig.new
  const StatusIcon = status.icon
  const type = typeConfig[interest.helpType] || typeConfig.other
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
        {interest.studentName ? (
          <span className="text-gray-700">{interest.studentName}</span>
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
        {new Date(interest._creationTime!).toLocaleDateString('en-IN', {
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
