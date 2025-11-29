"use client"

import { useFormContext } from "react-hook-form"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { indianStates } from "@/lib/schemas/application"

export function PersonalInfoStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext()

  const state = watch("state")

  return (
    <div className="space-y-4">
      {/* Full Name - Full width */}
      <div>
        <AnimatedInput
          label="Full Name (as per official documents)"
          {...register("fullName")}
          value={watch("fullName")}
          onChange={(e) => setValue("fullName", e.target.value, { shouldValidate: true })}
        />
        {errors.fullName && (
          <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>
        )}
      </div>

      {/* Email & Phone - Side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AnimatedInput
            type="email"
            label="Email Address"
            {...register("email")}
            value={watch("email")}
            onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
          )}
        </div>
        <div>
          <AnimatedInput
            type="tel"
            label="Mobile Number"
            {...register("phone")}
            value={watch("phone")}
            onChange={(e) => setValue("phone", e.target.value, { shouldValidate: true })}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>
          )}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <input
              type="date"
              className="peer w-full h-[52px] px-3 pt-5 pb-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              {...register("dateOfBirth")}
            />
            <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none">
              Date of Birth
            </label>
          </div>
          {errors.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message as string}</p>
          )}
        </div>
      </div>

      {/* Address - Full width */}
      <div>
        <AnimatedInput
          label="Full Address"
          {...register("address")}
          value={watch("address")}
          onChange={(e) => setValue("address", e.target.value, { shouldValidate: true })}
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address.message as string}</p>
        )}
      </div>

      {/* City & State - Side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AnimatedInput
            label="City"
            {...register("city")}
            value={watch("city")}
            onChange={(e) => setValue("city", e.target.value, { shouldValidate: true })}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city.message as string}</p>
          )}
        </div>
        <div>
          <div className="relative">
            <Select
              value={state}
              onValueChange={(value) => setValue("state", value, { shouldValidate: true })}
            >
              <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {indianStates.map((stateName) => (
                  <SelectItem key={stateName} value={stateName}>
                    {stateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className={`absolute left-3 pointer-events-none transition-all ${
              state ? "top-2 text-xs text-gray-500" : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
            }`}>
              State
            </label>
          </div>
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state.message as string}</p>
          )}
        </div>
      </div>

      {/* PIN Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AnimatedInput
            type="text"
            label="PIN Code"
            maxLength={6}
            {...register("pincode")}
            value={watch("pincode")}
            onChange={(e) => setValue("pincode", e.target.value.replace(/\D/g, ""), { shouldValidate: true })}
          />
          {errors.pincode && (
            <p className="text-red-500 text-xs mt-1">{errors.pincode.message as string}</p>
          )}
        </div>
      </div>
    </div>
  )
}
