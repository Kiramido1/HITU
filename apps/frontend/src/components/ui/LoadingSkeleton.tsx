import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  lines?: number
  avatar?: boolean
  card?: boolean
  table?: boolean
  tableRows?: number
}

const SkeletonLine: React.FC<{ className?: string; delay?: number }> = ({ className, delay = 0 }) => (
  <motion.div
    className={cn(
      'rounded-lg bg-gradient-to-r from-[rgba(15,23,42,0.8)] via-[rgba(27,60,115,0.3)] to-[rgba(15,23,42,0.8)]',
      'bg-[length:200%_100%]',
      'animate-shimmer',
      className
    )}
    style={{ animationDelay: `${delay}ms` }}
  />
)

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  lines = 3,
  avatar = false,
  card = false,
  table = false,
  tableRows = 5,
}) => {
  if (card) {
    return (
      <div
        className={cn(
          'glass-card p-6 space-y-4',
          className
        )}
      >
        <div className="flex items-center gap-4">
          <SkeletonLine className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-3 w-1/2" delay={100} />
          </div>
        </div>
        <SkeletonLine className="h-8 w-full" delay={200} />
        <SkeletonLine className="h-3 w-full" delay={300} />
        <SkeletonLine className="h-3 w-5/6" delay={400} />
      </div>
    )
  }

  if (table) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Table header */}
        <div className="grid grid-cols-4 gap-4 pb-3 border-b border-[rgba(200,169,91,0.1)]">
          {[...Array(4)].map((_, i) => (
            <SkeletonLine key={i} className="h-4" delay={i * 50} />
          ))}
        </div>
        {/* Table rows */}
        {[...Array(tableRows)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-4 py-3">
            {[...Array(4)].map((_, colIndex) => (
              <SkeletonLine
                key={colIndex}
                className="h-4"
                delay={rowIndex * 80 + colIndex * 30}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {avatar && (
        <div className="flex items-center gap-4">
          <SkeletonLine className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-4 w-1/2" />
            <SkeletonLine className="h-3 w-1/3" delay={100} />
          </div>
        </div>
      )}
      {[...Array(lines)].map((_, i) => (
        <SkeletonLine
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
          delay={i * 100}
        />
      ))}
    </div>
  )
}

// Full page loading screen
export const PageLoader: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]"
  >
    <div className="flex flex-col items-center gap-6">
      {/* Animated HITU logo/gear */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-[rgba(200,169,91,0.2)] animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-[rgba(200,169,91,0.4)] animate-[spin_3s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
            <path
              d="M20 4 L24 12 L32 8 L28 16 L36 20 L28 24 L32 32 L24 28 L20 36 L16 28 L8 32 L12 24 L4 20 L12 16 L8 8 L16 12 Z"
              stroke="#C8A95B"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="animate-[breathe_2s_ease-in-out_infinite]"
            />
            <circle cx="20" cy="20" r="5" fill="rgba(200,169,91,0.3)" stroke="#C8A95B" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <h2 className="font-sora text-xl font-bold gradient-gold tracking-wider">HITU Platform</h2>
        <p className="text-[#94A3B8] text-sm mt-1 tracking-widest uppercase">Initializing System</p>
      </div>

      {/* Loading bar */}
      <div className="w-48 h-0.5 bg-[rgba(200,169,91,0.1)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#C8A95B] to-[#E4C98A] rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  </motion.div>
)
