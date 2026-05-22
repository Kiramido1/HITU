import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  hint?: string
  glowColor?: 'gold' | 'blue'
}

export const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(
  ({ label, error, icon, iconPosition = 'left', hint, glowColor = 'gold', className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[#94A3B8] tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative group">
          {/* Focus glow ring */}
          <div
            className={cn(
              'absolute -inset-[1px] rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none',
              'group-focus-within:opacity-100',
              glowColor === 'gold'
                ? 'bg-gradient-to-r from-[rgba(200,169,91,0.3)] to-[rgba(228,201,138,0.3)]'
                : 'bg-gradient-to-r from-[rgba(27,60,115,0.4)] to-[rgba(16,37,68,0.4)]',
              'blur-sm'
            )}
          />

          {icon && iconPosition === 'left' && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors duration-200 group-focus-within:text-[#C8A95B] z-10">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            className={cn(
              'relative w-full h-12 rounded-xl',
              'bg-[rgba(15,23,42,0.9)] backdrop-blur-sm',
              'border border-[rgba(200,169,91,0.15)]',
              'text-[#F8FAFC] placeholder:text-[#94A3B8]/60',
              'text-sm font-medium',
              'transition-all duration-300',
              'focus:outline-none focus:border-[rgba(200,169,91,0.5)]',
              'focus:shadow-[0_0_0_3px_rgba(200,169,91,0.1),0_0_20px_rgba(200,169,91,0.1)]',
              'hover:border-[rgba(200,169,91,0.25)]',
              error && 'border-red-500/50 focus:border-red-500/70',
              icon && iconPosition === 'left' ? 'pl-12 pr-4' : 'px-4',
              icon && iconPosition === 'right' ? 'pr-12' : '',
              className
            )}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors duration-200 group-focus-within:text-[#C8A95B] z-10">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            <span className="text-red-400">⚠</span> {error}
          </motion.p>
        )}

        {hint && !error && (
          <p className="text-xs text-[#94A3B8]/70">{hint}</p>
        )}
      </div>
    )
  }
)

GlowInput.displayName = 'GlowInput'
