import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
  bgColor?: string
  trend?: {
    value: number
    label: string
  }
  delay?: number
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'text-[#C8A95B]',
  bgColor = 'bg-[rgba(200,169,91,0.1)]',
  trend,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard className="p-6 hover:border-[rgba(200,169,91,0.3)] transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${bgColor} border border-[rgba(200,169,91,0.2)] flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              trend.value > 0 ? 'bg-emerald-500/10 text-emerald-400' : trend.value < 0 ? 'bg-red-500/10 text-red-400' : 'bg-[rgba(148,163,184,0.1)] text-[#94A3B8]'
            }`}>
              {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'} {Math.abs(trend.value)}%
              <span className="text-[#94A3B8] ml-1">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="mb-1">
          <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{value}</p>
        </div>
        <p className="text-sm text-[#94A3B8]">{title}</p>
      </GlassCard>
    </motion.div>
  )
}
