"use client"

import { motion } from "motion/react"
import { Check, User, GraduationCap, Users, FileText, PenLine, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepProgressProps {
  currentStep: number
  totalSteps: number
  steps: { title: string; shortTitle: string }[]
}

const stepIcons = [User, GraduationCap, Users, FileText, PenLine, Send]

export function StepProgress({ currentStep, totalSteps, steps }: StepProgressProps) {
  const progress = (currentStep / (totalSteps - 1)) * 100

  return (
    <div className="w-full">
      {/* Mobile: Compact progress */}
      <div className="sm:hidden">
        <div className="flex items-center gap-3">
          {/* Step icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-md shadow-primary/20">
            {(() => {
              const Icon = stepIcons[currentStep]
              return <Icon className="w-4 h-4 text-white" />
            })()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {steps[currentStep]?.shortTitle}
              </span>
              <span className="text-xs font-medium text-gray-500">
                {currentStep + 1} of {totalSteps}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal stepper */}
      <div className="hidden sm:block">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg shadow-gray-200/50 p-6">
          <div className="flex items-start justify-between">
            {steps.map((step, index) => {
              const Icon = stepIcons[index]
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isPending = index > currentStep

              return (
                <div key={index} className="flex items-start flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    {/* Step circle */}
                    <motion.div
                      className={cn(
                        "relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300",
                        isCompleted && "bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/25",
                        isCurrent && "bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/30",
                        isPending && "bg-gray-100 border-2 border-gray-200"
                      )}
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </motion.div>
                      ) : (
                        <Icon className={cn(
                          "w-5 h-5",
                          isCurrent ? "text-white" : "text-gray-400"
                        )} />
                      )}

                      {/* Pulse effect for current step */}
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-primary/20"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>

                    {/* Label */}
                    <span
                      className={cn(
                        "mt-3 text-xs font-medium text-center max-w-[70px] leading-tight transition-colors",
                        isCompleted && "text-primary",
                        isCurrent && "text-gray-900",
                        isPending && "text-gray-400"
                      )}
                    >
                      {step.shortTitle}
                    </span>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-3 mt-5">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: isCompleted ? "100%" : "0%" }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
