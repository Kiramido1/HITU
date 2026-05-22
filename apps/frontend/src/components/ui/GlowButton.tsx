import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'navy'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface GlowButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  magnetic?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-[#C8A95B] via-[#E4C98A] to-[#C8A95B]',
    'text-[#020817] font-semibold',
    'shadow-[0_0_20px_rgba(200,169,91,0.4)]',
    'hover:shadow-[0_0_30px_rgba(200,169,91,0.7),0_0_60px_rgba(200,169,91,0.3)]',
    'hover:brightness-110',
    'border border-[rgba(200,169,91,0.6)]',
  ].join(' '),
  outline: [
    'bg-transparent',
    'text-[#C8A95B]',
    'border border-[rgba(200,169,91,0.4)]',
    'hover:bg-[rgba(200,169,91,0.1)]',
    'hover:border-[rgba(200,169,91,0.7)]',
    'hover:shadow-[0_0_20px_rgba(200,169,91,0.2)]',
    'backdrop-blur-sm',
  ].join(' '),
  ghost: [
    'bg-[rgba(200,169,91,0.08)]',
    'text-[#E4C98A]',
    'border border-[rgba(200,169,91,0.15)]',
    'hover:bg-[rgba(200,169,91,0.15)]',
    'hover:border-[rgba(200,169,91,0.3)]',
    'backdrop-blur-sm',
  ].join(' '),
  navy: [
    'bg-gradient-to-r from-[#102544] to-[#1B3C73]',
    'text-white',
    'border border-[rgba(27,60,115,0.6)]',
    'hover:shadow-[0_0_25px_rgba(27,60,115,0.5)]',
    'hover:brightness-110',
  ].join(' '),
  danger: [
    'bg-gradient-to-r from-red-600 to-red-700',
    'text-white',
    'border border-red-500/30',
    'hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-4 text-sm gap-1.5',
  md: 'h-10 px-6 text-sm gap-2',
  lg: 'h-12 px-8 text-base gap-2.5',
  xl: 'h-14 px-10 text-lg gap-3',
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  loading,
  className,
  type = 'button',
  magnetic = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 })

  const translateX = useTransform(springX, [-1, 1], [-8, 8])
  const translateY = useTransform(springY, [-1, 1], [-4, 4])

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set((e.clientX - centerX) / (rect.width / 2))
    mouseY.set((e.clientY - centerY) / (rect.height / 2))
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={magnetic ? { x: translateX, y: translateY } : undefined}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl font-medium',
        'transition-all duration-300 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus:outline-none focus:ring-2 focus:ring-[rgba(200,169,91,0.5)]',
        'overflow-hidden',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {/* Shine sweep effect */}
      <span className="absolute inset-0 pointer-events-none">
        <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 group-hover:left-[100%]" />
      </span>

      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : (
        <span className="relative flex items-center">
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </span>
      )}
    </motion.button>
  )
}
