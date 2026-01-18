"use client"

import { useFormContext } from "react-hook-form"
import { AnimatedInput } from "@/app/components/AnimatedInput"
import { FileUpload } from "@/app/components/FileUpload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { genderOptions } from "@/lib/schemas/spotlight"
import { Camera } from "lucide-react"

export function PersonalInfoStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const gender = watch("gender")

  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div className="flex flex-col items-center">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Camera className="w-4 h-4" />
          Your Photo
          <span className="text-red-500">*</span>
        </div>
        <div className="w-full max-w-xs">
          <FileUpload
            label=""
            accept="image/jpeg,image/png,image/webp"
            maxSize={2}
            required
            value={watch("photo")}
            onChange={(file) => setValue("photo", file, { shouldValidate: true })}
            error={errors.photo?.message as string}
            description="Clear, recent photo (max 2MB)"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This photo will be displayed on your spotlight profile
        </p>
      </div>

      {/* Full Name - Full width */}
      <div>
        <AnimatedInput
          label="Full Name (as per official documents)"
          {...register("fullName")}
          value={watch("fullName") || ""}
          onChange={(e) =>
            setValue("fullName", e.target.value, { shouldValidate: true })
          }
        />
        {errors.fullName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.fullName.message as string}
          </p>
        )}
      </div>

      {/* Email & Phone - Side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AnimatedInput
            type="email"
            label="Email Address"
            {...register("email")}
            value={watch("email") || ""}
            onChange={(e) =>
              setValue("email", e.target.value, { shouldValidate: true })
            }
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <div>
          <AnimatedInput
            type="tel"
            label="Mobile Number"
            {...register("phone")}
            value={watch("phone") || ""}
            onChange={(e) =>
              setValue("phone", e.target.value, { shouldValidate: true })
            }
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phone.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <input
              type="date"
              className="peer w-full h-[52px] px-3 pt-5 pb-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white"
              {...register("dateOfBirth")}
            />
            <label className="absolute left-3 top-2 text-xs text-gray-500 pointer-events-none">
              Date of Birth
            </label>
          </div>
          {errors.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1">
              {errors.dateOfBirth.message as string}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <Select
              value={gender}
              onValueChange={(value) =>
                setValue("gender", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-[52px] pt-5 pb-2 px-3 text-sm border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-lg">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "male" ? "Male" : "Female"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label
              className={`absolute left-3 pointer-events-none transition-all ${
                gender
                  ? "top-2 text-xs text-gray-500"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
              }`}
            >
              Gender
            </label>
          </div>
          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">
              {errors.gender.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Village/Town & Mandal - Side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AnimatedInput
            label="Village/Town"
            {...register("village")}
            value={watch("village") || ""}
            onChange={(e) =>
              setValue("village", e.target.value, { shouldValidate: true })
            }
          />
          {errors.village && (
            <p className="text-red-500 text-xs mt-1">
              {errors.village.message as string}
            </p>
          )}
        </div>
        <div>
          <AnimatedInput
            label="Mandal"
            {...register("mandal")}
            value={watch("mandal") || ""}
            onChange={(e) =>
              setValue("mandal", e.target.value, { shouldValidate: true })
            }
          />
          {errors.mandal && (
            <p className="text-red-500 text-xs mt-1">
              {errors.mandal.message as string}
            </p>
          )}
        </div>
      </div>

      {/* District & State - Side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <AnimatedInput
            label="District"
            {...register("district")}
            value={watch("district") || ""}
            onChange={(e) =>
              setValue("district", e.target.value, { shouldValidate: true })
            }
          />
          {errors.district && (
            <p className="text-red-500 text-xs mt-1">
              {errors.district.message as string}
            </p>
          )}
        </div>
        <div>
          <AnimatedInput
            label="State"
            {...register("state")}
            value={watch("state") || ""}
            onChange={(e) =>
              setValue("state", e.target.value, { shouldValidate: true })
            }
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">
              {errors.state.message as string}
            </p>
          )}
        </div>
      </div>

      {/* PIN Code */}
      <div className="max-w-xs">
        <AnimatedInput
          type="text"
          label="PIN Code"
          maxLength={6}
          {...register("pincode")}
          value={watch("pincode") || ""}
          onChange={(e) =>
            setValue("pincode", e.target.value.replace(/\D/g, ""), {
              shouldValidate: true,
            })
          }
        />
        {errors.pincode && (
          <p className="text-red-500 text-xs mt-1">
            {errors.pincode.message as string}
          </p>
        )}
      </div>
    </div>
  )
}
