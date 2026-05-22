import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GlassCard } from './GlassCard'

interface DashboardWidgetProps {
  label: string
  value: string | number
  icon: React.ReactNode
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  subtitle?: string
  color?: 'gold' | 'blue' | 'green' | 'purple'
  animate?: boolean
  delay?: number
}

const colorMap = {
  gold: {
    icon: 'bg-[rgba(200,169,91,0.15)] text-[#C8A95B]',
    glow: 'shadow-[0_0_20px_rgba(200,169,91,0.1)]',
    badge: 'text-[#C8A95B] bg-[rgba(200,169,91,0.1)]',
  },
  blue: {
    icon: 'bg-[rgba(27,60,115,0.4)] text-[#60A5FA]',
    glow: 'shadow-[0_0_20px_rgba(27,60,115,0.2)]',
    badge: 'text-[#60A5FA] bg-[rgba(27,60,115,0.2)]',
  },
  green: {
    icon: 'bg-[rgba(16,185,129,0.15)] text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    badge: 'text-emerald-400 bg-[rgba(16,185,129,0.1)]',
  },
  purple: {
    icon: 'bg-[rgba(139,92,246,0.15)] text-violet-400',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.1)]',
    badge: 'text-violet-400 bg-[rgba(139,92,246,0.1)]',
  },
}

function useCountUp(target: number, duration = 1500, delay = 0) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = performance.now()
      const update = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * target))
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(update)
        }
      }
      frameRef.current = requestAnimationFrame(update)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, delay])

  return count
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  label,
  value,
  icon,
  change,
  changeType = 'neutral',
  subtitle,
  color = 'gold',
  animate = true,
  delay = 0,
}) => {
  const colors = colorMap[color]
  const isNumeric = typeof value === 'number'
  const animatedValue = useCountUp(isNumeric ? (value as number) : 0, 1200, delay * 200)

  const changeIcon = changeType === 'increase' ? '↑' : changeType === 'decrease' ? '↓' : '→'
  const changeColor =
    changeType === 'increase' ? 'text-emerald-400' : changeType === 'decrease' ? 'text-red-400' : 'text-[#94A3B8]'

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : {}}
      whileInView={animate ? { opacity: 1, y: 0 } : {}}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <GlassCard className={cn('p-5 h-full', colors.glow)} hover={false}>
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colors.icon)}>
            {icon}
          </div>
          {change !== undefined && (
            <span className={cn('text-xs font-semibold px-2 py-1 rounded-lg', changeColor, colors.badge)}>
              {changeIcon} {Math.abs(change)}%
            </span>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="font-sora text-3xl font-bold text-[#F8FAFC]">
            {isNumeric ? animatedValue.toLocaleString() : value}
          </span>
        </div>

        {/* Label */}
        <p className="text-sm text-[#94A3B8] font-medium">{label}</p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-[#94A3B8]/60 mt-1">{subtitle}</p>
        )}

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: delay * 0.1 + 0.3 }}
            className={cn(
              'h-full origin-left',
              color === 'gold' ? 'bg-gradient-to-r from-[#C8A95B] to-[#E4C98A]' :
              color === 'blue' ? 'bg-gradient-to-r from-[#1B3C73] to-[#60A5FA]' :
              color === 'green' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
              'bg-gradient-to-r from-violet-600 to-violet-400'
            )}
          />
        </div>
      </GlassCard>
    </motion.div>
  )
}
