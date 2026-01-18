"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import type { Donation, DonationStatus } from '@/types/database'
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
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
  Edit,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react'

interface DonationsResponse {
  donations: Donation[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertCircle,
  },
}

export default function DonationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState<DonationStatus | 'all'>(
    (searchParams.get('status') as DonationStatus) || 'all'
  )
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const pageSize = 10

  // Edit dialog state
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null)
  const [editStatus, setEditStatus] = useState<DonationStatus>('pending')
  const [editNotes, setEditNotes] = useState('')
  const [editReference, setEditReference] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchDonations = useCallback(async () => {
    setIsLoading(true)

    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (status !== 'all') params.set('status', status)
    params.set('page', page.toString())
    params.set('pageSize', pageSize.toString())

    const res = await fetch(`/api/admin/donations?${params.toString()}`)
    if (res.ok) {
      const data: DonationsResponse = await res.json()
      setDonations(data.donations)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    }

    setIsLoading(false)
  }, [debouncedSearch, status, page])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (status !== 'all') params.set('status', status)
    if (page > 1) params.set('page', page.toString())

    const query = params.toString()
    router.replace(`/admin/donations${query ? `?${query}` : ''}`, {
      scroll: false,
    })
  }, [debouncedSearch, status, page, router])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const handleEditClick = (donation: Donation) => {
    setEditingDonation(donation)
    setEditStatus(donation.status as DonationStatus)
    setEditNotes(donation.notes || '')
    setEditReference(donation.transaction_reference || '')
  }

  const handleSave = async () => {
    if (!editingDonation) return
    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/donations/${editingDonation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
          transaction_reference: editReference,
        }),
      })

      if (res.ok) {
        toast.success('Donation updated successfully')
        setEditingDonation(null)
        fetchDonations()
      } else {
        toast.error('Failed to update donation')
      }
    } catch {
      toast.error('An error occurred')
    }

    setIsSaving(false)
  }

  // Calculate total amount
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)

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
            Donations
          </h1>
          <p className="mt-1 text-gray-600">
            View and manage donation records
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDonations}
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
                  placeholder="Search by name, email, or donation ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as DonationStatus | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Donations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Donation Records</CardTitle>
                <CardDescription>
                  {isLoading
                    ? 'Loading...'
                    : `${total} donation${total !== 1 ? 's' : ''} found • Total: ${formatCurrency(totalAmount)}`}
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
            ) : donations.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donation ID</TableHead>
                        <TableHead>Donor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((donation) => (
                        <DonationRow
                          key={donation.id}
                          donation={donation}
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
      <Dialog open={!!editingDonation} onOpenChange={() => setEditingDonation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Donation</DialogTitle>
            <DialogDescription>
              Update the donation status and add notes
            </DialogDescription>
          </DialogHeader>

          {editingDonation && (
            <div className="space-y-4">
              {/* Donation Info */}
              <div className="rounded-lg bg-gray-50 p-3 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">ID:</span> {editingDonation.donation_id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Donor:</span> {editingDonation.donor_name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Amount:</span> {formatCurrency(editingDonation.amount)}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(value) => setEditStatus(value as DonationStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Reference */}
              <div className="space-y-2">
                <Label>Transaction Reference</Label>
                <Input
                  placeholder="Enter transaction/reference number..."
                  value={editReference}
                  onChange={(e) => setEditReference(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add notes about this donation..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDonation(null)}>
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

function DonationRow({
  donation,
  onEdit,
}: {
  donation: Donation
  onEdit: (donation: Donation) => void
}) {
  const status = statusConfig[donation.status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <span className="font-medium text-primary">{donation.donation_id}</span>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-gray-900">{donation.donor_name}</p>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {donation.donor_email}
            </span>
            <span className="flex items-center gap-1 hidden md:flex">
              <Phone className="h-3 w-3" />
              {donation.donor_phone}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 font-semibold text-green-600">
          <IndianRupee className="h-4 w-4" />
          {new Intl.NumberFormat('en-IN').format(donation.amount)}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={status.className}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell text-gray-500">
        {new Date(donation.created_at!).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onEdit(donation)}>
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
        <IndianRupee className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No donations found
      </h3>
      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        Try adjusting your search or filter criteria to find what you&apos;re looking for.
      </p>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
