"use client"

import { useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useQuery, useMutation } from 'convex/react'
import { convexErrorMessage } from '@/lib/convexError'
import type { FunctionReturnType } from 'convex/server'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import {
  Star,
  GripVertical,
  User,
  FileText,
  Sparkles,
  IndianRupee,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

type FeaturedStudent = FunctionReturnType<typeof api.admin.featured>[number]

export default function SpotlightManagementPage() {
  // A live subscription, so there is no local copy to keep in sync and no
  // refetch after a write — which is why the optimistic filtering below is gone.
  const featured = useQuery(api.admin.featured)
  const students = featured ?? []
  const isLoading = featured === undefined
  const [isSaving, setIsSaving] = useState(false)

  const setFeatured = useMutation(api.admin.setFeatured)
  const reorderFeatured = useMutation(api.admin.reorderFeatured)

  const scholarshipCount = students.filter((s) => s.source === 'scholarship').length
  const spotlightCount = students.filter((s) => s.source === 'spotlight').length

  const handleToggleFeatured = async (student: FeaturedStudent) => {
    const newFeatured = !student.isFeatured

    // No optimistic update: the list is a live query, so the mutation pushes
    // the change rather than the client guessing at it.
    try {
      await setFeatured({
        id: student.id,
        source: student.source,
        featured: newFeatured,
      })
      toast.success(newFeatured ? 'Student featured' : 'Student removed from spotlight')
    } catch (error) {
      toast.error(convexErrorMessage(error, 'Failed to update'))
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return

    const newStudents = [...students]
    const temp = newStudents[index]
    newStudents[index] = newStudents[index - 1]
    newStudents[index - 1] = temp

    // Update order numbers
    const reorderItems = newStudents.map((s, i) => ({
      id: s.id,
      source: s.source,
      order: i,
    }))

    await saveOrder(reorderItems)
  }

  const handleMoveDown = async (index: number) => {
    if (index === students.length - 1) return

    const newStudents = [...students]
    const temp = newStudents[index]
    newStudents[index] = newStudents[index + 1]
    newStudents[index + 1] = temp

    // Update order numbers
    const reorderItems = newStudents.map((s, i) => ({
      id: s.id,
      source: s.source,
      order: i,
    }))

    await saveOrder(reorderItems)
  }

  // `source` is the narrowed union rather than `string`: the mutation validates
  // it against v.union(...), so a widened type here would only defer the error
  // to runtime.
  const saveOrder = async (
    reorderItems: Array<{
      id: string
      source: FeaturedStudent['source']
      order: number
    }>,
  ) => {
    setIsSaving(true)

    try {
      await reorderFeatured({ items: reorderItems })
      toast.success('Order saved')
    } catch (error) {
      toast.error(convexErrorMessage(error, 'Failed to save order'))
    } finally {
      setIsSaving(false)
    }
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
            Spotlight Management
          </h1>
          <p className="mt-1 text-gray-600">
            Manage students featured on the homepage
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-gray-600">Total Featured</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{scholarshipCount}</p>
                <p className="text-sm text-gray-600">From Scholarships</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{spotlightCount}</p>
                <p className="text-sm text-gray-600">From Spotlight Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Featured Students List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Featured Students</CardTitle>
            <CardDescription>
              Use the arrows to reorder students. Changes are saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {students.map((student, index) => (
                  <StudentRow
                    key={`${student.source}-${student.id}`}
                    student={student}
                    index={index}
                    totalCount={students.length}
                    onToggleFeatured={handleToggleFeatured}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    isSaving={isSaving}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-900">How to feature students:</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>
                <strong>Scholarship applicants:</strong> Go to Scholarship Applications &rarr; Review an application &rarr; Enable &quot;Spotlight&quot; toggle
              </li>
              <li>
                <strong>Spotlight applicants:</strong> Go to Spotlight Applications &rarr; Review an application &rarr; Enable &quot;Featured on Homepage&quot; toggle
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function StudentRow({
  student,
  index,
  totalCount,
  onToggleFeatured,
  onMoveUp,
  onMoveDown,
  isSaving,
}: {
  student: FeaturedStudent
  index: number
  totalCount: number
  onToggleFeatured: (student: FeaturedStudent) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  isSaving: boolean
}) {
  const detailUrl = student.source === 'scholarship'
    ? `/admin/scholarship-applications/${student.id}`
    : `/admin/spotlight-applications/${student.id}`

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 bg-white hover:bg-gray-50 transition-colors">
      {/* Drag Handle / Order Controls */}
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onMoveUp(index)}
          disabled={index === 0 || isSaving}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div className="flex h-6 w-6 items-center justify-center">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onMoveDown(index)}
          disabled={index === totalCount - 1 || isSaving}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Order Number */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
        {index + 1}
      </div>

      {/* Photo */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-gray-100">
        {student.photoUrl ? (
          <Image
            src={student.photoUrl}
            alt={student.fullName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">{student.fullName}</p>
          <Badge
            variant="outline"
            className={
              student.source === 'scholarship'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }
          >
            {student.source === 'scholarship' ? (
              <><FileText className="h-3 w-3 mr-1" />Scholarship</>
            ) : (
              <><Sparkles className="h-3 w-3 mr-1" />Spotlight</>
            )}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 truncate">{student.displayId}</p>
        {student.annualNeed && (
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <IndianRupee className="h-3 w-3" />
            {new Intl.NumberFormat('en-IN').format(student.annualNeed)}/year needed
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={student.isFeatured}
            onCheckedChange={() => onToggleFeatured(student)}
          />
          <span className="text-sm text-gray-600 hidden sm:inline">Featured</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={detailUrl}>
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">View details</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Star className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No featured students yet
      </h3>
      <p className="mt-2 text-sm text-gray-600 max-w-sm">
        Feature students from Scholarship Applications or Spotlight Applications to show them on the homepage.
      </p>
      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline">
          <Link href="/admin/scholarship-applications">
            View Scholarship Applications
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/spotlight-applications">
            View Spotlight Applications
          </Link>
        </Button>
      </div>
    </div>
  )
}
