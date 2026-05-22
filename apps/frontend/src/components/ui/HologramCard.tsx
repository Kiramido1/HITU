import React from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HologramCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export const HologramCard: React.FC<HologramCardProps> = ({
  children,
  className,
  intensity = 15,
}) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 200, damping: 20 })
  const springY = useSpring(y, { stiffness: 200, damping: 20 })

  const rotateX = useTransform(springY, [-1, 1], [intensity, -intensity])
  const rotateY = useTransform(springX, [-1, 1], [-intensity, intensity])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / (rect.width / 2))
    y.set((e.clientY - centerY) / (rect.height / 2))
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={cn(
        'relative rounded-2xl cursor-pointer',
        'bg-[rgba(15,23,42,0.8)] backdrop-blur-xl',
        'border border-[rgba(200,169,91,0.2)]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
        'transition-shadow duration-300',
        'hover:shadow-[0_16px_64px_rgba(0,0,0,0.6),0_0_30px_rgba(200,169,91,0.1)]',
        'overflow-hidden',
        className
      )}
    >
      {/* Holographic shimmer layer */}
      <motion.div
        style={{
          background: useTransform(
            [springX, springY],
            ([mx, my]) =>
              `radial-gradient(circle at ${50 + (mx as number) * 30}% ${50 + (my as number) * 30}%, rgba(200,169,91,0.12) 0%, transparent 60%)`
          ),
        }}
        className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
      />

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,91,0.4)] to-transparent animate-scan-line" />
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[rgba(200,169,91,0.6)] rounded-tl-xl z-10" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[rgba(200,169,91,0.6)] rounded-tr-xl z-10" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[rgba(200,169,91,0.6)] rounded-bl-xl z-10" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[rgba(200,169,91,0.6)] rounded-br-xl z-10" />

      <div className="relative z-30">{children}</div>
    </motion.div>
  )
}
