import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AnalyticsChartProps {
  type: 'bar' | 'line' | 'pie' | 'area'
  data: any[]
  title: string
  subtitle?: string
  dataKey: string
  xAxisKey?: string
  colors?: string[]
  height?: number
  showLegend?: boolean
  showTrend?: boolean
  trendValue?: number
}

const DEFAULT_COLORS = ['#C8A95B', '#1B3C73', '#10E4A8', '#8B5CF6', '#F59E0B', '#EF4444']

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  type,
  data,
  title,
  subtitle,
  dataKey,
  xAxisKey,
  colors = DEFAULT_COLORS,
  height = 300,
  showLegend = true,
  showTrend = false,
  trendValue = 0,
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,169,91,0.1)" />
              <XAxis
                dataKey={xAxisKey}
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(200, 169, 91, 0.2)',
                  borderRadius: '8px',
                  color: '#F8FAFC'
                }}
              />
              {showLegend && <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />}
              <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,169,91,0.1)" />
              <XAxis
                dataKey={xAxisKey}
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(200, 169, 91, 0.2)',
                  borderRadius: '8px',
                  color: '#F8FAFC'
                }}
              />
              {showLegend && <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />}
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: colors[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,169,91,0.1)" />
              <XAxis
                dataKey={xAxisKey}
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(200, 169, 91, 0.2)',
                  borderRadius: '8px',
                  color: '#F8FAFC'
                }}
              />
              {showLegend && <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />}
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.name}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(200, 169, 91, 0.2)',
                  borderRadius: '8px',
                  color: '#F8FAFC'
                }}
              />
              {showLegend && <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />}
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const getTrendIcon = () => {
    if (trendValue > 0) return <TrendingUp className="w-4 h-4 text-emerald-400" />
    if (trendValue < 0) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-[#94A3B8]" />
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-[#94A3B8]">{subtitle}</p>}
        </div>
        {showTrend && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.1)]">
            {getTrendIcon()}
            <span className={`text-sm font-semibold ${trendValue > 0 ? 'text-emerald-400' : trendValue < 0 ? 'text-red-400' : 'text-[#94A3B8]'}`}>
              {Math.abs(trendValue)}%
            </span>
          </div>
        )}
      </div>
      {renderChart()}
    </GlassCard>
  )
}
