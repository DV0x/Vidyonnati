"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { toast } from "@/hooks/use-toast"
import { Loader2, UserPlus, Eye, EyeOff, Check } from "lucide-react"

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const supabase = createClient()

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  }

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean)

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (!isPasswordStrong) {
      newErrors.password = "Password doesn't meet requirements"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: "student",
          },
          emailRedirectTo: `${window.location.origin}/callback?next=${redirectTo}`,
        },
      })

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        // User already exists
        toast({
          title: "Account Exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      })

      // Redirect to login page with success message
      router.push("/login?registered=true")
    } catch (err) {
      console.error("Registration error:", err)
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback?next=${redirectTo}`,
        queryParams: {
          prompt: 'select_account', // Force account selection on every login
        },
      },
    })

    if (error) {
      toast({
        title: "Google Sign-up Failed",
        description: error.message,
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/40 relative overflow-hidden flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-orange-300/30 to-rose-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/20 via-purple-200/20 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative px-4 py-8 sm:py-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block mb-4">
              <h2 className="text-2xl font-bold text-primary">Vidyonnati</h2>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create Account
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Start your scholarship application journey
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-5 sm:p-6">
            <form onSubmit={handleEmailRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <AnimatedInput
                  type="text"
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    setErrors({ ...errors, fullName: undefined })
                  }}
                  disabled={isLoading || isGoogleLoading}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <AnimatedInput
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors({ ...errors, email: undefined })
                  }}
                  disabled={isLoading || isGoogleLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <AnimatedInput
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors({ ...errors, password: undefined })
                    }}
                    disabled={isLoading || isGoogleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Password must have:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <PasswordCheck passed={passwordChecks.length} label="6+ characters" />
                      <PasswordCheck passed={passwordChecks.uppercase} label="Uppercase letter" />
                      <PasswordCheck passed={passwordChecks.lowercase} label="Lowercase letter" />
                      <PasswordCheck passed={passwordChecks.number} label="Number" />
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <AnimatedInput
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setErrors({ ...errors, confirmPassword: undefined })
                    }}
                    disabled={isLoading || isGoogleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-6 text-base font-semibold bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleRegister}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-6 text-base font-medium border-2 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 mt-4">
              By registering, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link
                href={`/login${redirectTo !== "/dashboard" ? `?redirect=${redirectTo}` : ""}`}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/" className="hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// Password check indicator component
function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${passed ? "text-green-600" : "text-gray-400"}`}>
      {passed ? (
        <Check className="w-3 h-3" />
      ) : (
        <div className="w-3 h-3 rounded-full border border-current" />
      )}
      <span>{label}</span>
    </div>
  )
}

// Loading fallback for Suspense
function RegisterFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

// Wrap in Suspense for useSearchParams
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterContent />
    </Suspense>
  )
}
