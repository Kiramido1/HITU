import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  gradient?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
  onClick?: () => void
  animate?: boolean
  delay?: number
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  gradient = false,
  padding = 'md',
  onClick,
  animate = false,
  delay = 0,
}) => {
  const base = cn(
    'relative rounded-2xl',
    'bg-[rgba(15,23,42,0.75)] backdrop-blur-xl',
    'border border-[rgba(200,169,91,0.2)]',
    'shadow-[0_4px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(200,169,91,0.1)]',
    'overflow-hidden',
    paddingMap[padding],
    hover && 'transition-all duration-300 cursor-pointer hover:border-[rgba(200,169,91,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(200,169,91,0.3),0_0_32px_rgba(200,169,91,0.08)]',
    glow && 'shadow-[0_0_30px_rgba(200,169,91,0.15)]',
    gradient && 'before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(27,60,115,0.15)_0%,transparent_100%)] before:pointer-events-none',
    className
  )

  if (animate) {
    return (
      <motion.div
        className={base}
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        whileHover={hover ? { scale: 1.01 } : undefined}
      >
        {/* Hologram shimmer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-[rgba(200,169,91,0.04)] to-transparent animate-shimmer" />
        </div>
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[rgba(200,169,91,0.5)] rounded-tl-sm" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[rgba(200,169,91,0.5)] rounded-br-sm" />
        {children}
      </motion.div>
    )
  }

  return (
    <div className={base} onClick={onClick}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-[rgba(200,169,91,0.04)] to-transparent animate-shimmer" />
      </div>
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[rgba(200,169,91,0.5)] rounded-tl-sm" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[rgba(200,169,91,0.5)] rounded-br-sm" />
      {children}
    </div>
  )
}
