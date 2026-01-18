"use client"

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import type { StudentUpdate } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Loader2,
  Shield,
  CheckCircle2,
} from 'lucide-react'

export default function ProfilePage() {
  const { user, student, isLoading: authLoading, refreshStudent } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    village: '',
    mandal: '',
    district: '',
    pincode: '',
    address: '',
  })

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name || '',
        phone: student.phone || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        village: student.village || '',
        mandal: student.mandal || '',
        district: student.district || '',
        pincode: student.pincode || '',
        address: student.address || '',
      })
    }
  }, [student])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)

    const supabase = createClient()
    const updateData: StudentUpdate = {
      full_name: formData.full_name || null,
      phone: formData.phone || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      village: formData.village || null,
      mandal: formData.mandal || null,
      district: formData.district || null,
      pincode: formData.pincode || null,
      address: formData.address || null,
    }

    const { error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', user.id)

    setIsSaving(false)

    if (error) {
      toast.error('Failed to update profile', {
        description: error.message,
      })
    } else {
      toast.success('Profile updated successfully')
      await refreshStudent()
      setIsEditing(false)
    }
  }

  if (authLoading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Profile</h1>
        <p className="mt-1 text-gray-600">
          Manage your personal information and account settings
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                This information will be used to pre-fill your applications
              </CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email (Read Only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Email Address
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Date of Birth
                  </Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full h-10 rounded-md border border-input px-3 py-2 text-sm ${
                      !isEditing ? 'bg-gray-50' : 'bg-background'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Address Section */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Address Details
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="village">Village</Label>
                    <Input
                      id="village"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter village"
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mandal">Mandal</Label>
                    <Input
                      id="mandal"
                      name="mandal"
                      value={formData.mandal}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter mandal"
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter district"
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter pincode"
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter full address"
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      if (student) {
                        setFormData({
                          full_name: student.full_name || '',
                          phone: student.phone || '',
                          date_of_birth: student.date_of_birth || '',
                          gender: student.gender || '',
                          village: student.village || '',
                          mandal: student.mandal || '',
                          district: student.district || '',
                          pincode: student.pincode || '',
                          address: student.address || '',
                        })
                      }
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">
                  Change your password to keep your account secure
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="/forgot-password">Change Password</a>
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sign-in Method</p>
                <p className="text-sm text-gray-500">
                  {user?.app_metadata?.provider === 'google'
                    ? 'Signed in with Google'
                    : 'Signed in with Email/Password'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Active
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Account Created</p>
                <p className="text-sm text-gray-500">
                  {student?.created_at
                    ? new Date(student.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-[600px] w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  )
}
