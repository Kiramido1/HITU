import React from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardWidget } from '@/components/ui/DashboardWidget'
import { GlassCard } from '@/components/ui/GlassCard'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useAppStore } from '@/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/variants'
import { Users, BookOpen, Calendar, Award, Bell, TrendingUp, Clock, Cpu } from 'lucide-react'

const widgets = [
  { label: 'Enrolled Students', value: 1240, icon: <Users className="w-5 h-5" />, change: 12, changeType: 'increase' as const, color: 'blue' as const, subtitle: 'Across all departments' },
  { label: 'Active Courses', value: 48, icon: <BookOpen className="w-5 h-5" />, change: 4, changeType: 'increase' as const, color: 'gold' as const, subtitle: 'This semester' },
  { label: 'Avg. GPA', value: '3.72', icon: <Award className="w-5 h-5" />, change: 2, changeType: 'increase' as const, color: 'green' as const, subtitle: 'University wide' },
  { label: 'Pending Schedules', value: 7, icon: <Calendar className="w-5 h-5" />, change: 15, changeType: 'decrease' as const, color: 'purple' as const, subtitle: 'Need AI optimization' },
]

const recentActivity = [
  { text: 'AI scheduled CS-401 for 3 sections', time: '2 min ago', type: 'ai' },
  { text: 'New student registration: Sara El-Masry', time: '15 min ago', type: 'user' },
  { text: 'Grade submission deadline: MATH-301', time: '1 hour ago', type: 'alert' },
  { text: 'Room B204 reserved for midterms', time: '2 hours ago', type: 'info' },
  { text: 'Faculty meeting rescheduled via AI', time: '3 hours ago', type: 'ai' },
]

const scheduleItems = [
  { course: 'CS-401: Algorithms', time: '08:00 – 09:30', room: 'B-204', students: 35 },
  { course: 'MATH-301: Linear Algebra', time: '10:00 – 11:30', room: 'A-102', students: 48 },
  { course: 'ENG-201: Technical Writing', time: '12:00 – 13:00', room: 'C-301', students: 52 },
  { course: 'PHYS-202: Mechanics', time: '14:00 – 15:30', room: 'Lab-1', students: 28 },
]

export const DashboardPage: React.FC = () => {
  const { user, sidebarCollapsed } = useAppStore()
  const sidebarWidth = sidebarCollapsed ? 72 : 260

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />

      <main
        className="flex-1 min-h-screen transition-all duration-300 overflow-y-auto"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-6 lg:p-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1">Welcome Back</p>
              <h1 className="font-sora text-2xl lg:text-3xl font-bold text-[#F8FAFC]">
                {user?.full_name ?? 'Student'}{' '}
                <span className="gradient-gold">Dashboard</span>
              </h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(200,169,91,0.08)] border border-[rgba(200,169,91,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-[#94A3B8]">AI Engine Active</span>
              </div>
              <button className="w-9 h-9 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] flex items-center justify-center text-[#94A3B8] hover:text-[#C8A95B] transition-colors">
                <Bell className="w-4 h-4" />
              </button>
            </motion.div>
          </div>

          {/* Stat Widgets */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {widgets.map((w, i) => (
              <motion.div key={i} variants={staggerItem}>
                <DashboardWidget {...w} delay={i} />
              </motion.div>
            ))}
          </motion.div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Schedule */}
            <div className="lg:col-span-2">
              <GlassCard className="p-6" animate delay={0.1}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C8A95B]" />
                    <h2 className="font-semibold text-[#F8FAFC] text-sm">Today's Schedule</h2>
                  </div>
                  <span className="text-xs text-[#94A3B8]">Thursday, May 16</span>
                </div>
                <div className="space-y-3">
                  {scheduleItems.map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(200,169,91,0.08)] hover:border-[rgba(200,169,91,0.2)] transition-all duration-200 group">
                      <div className="w-1 h-10 rounded-full bg-gradient-to-b from-[#C8A95B] to-[#1B3C73] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F8FAFC] truncate">{item.course}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-[#94A3B8]"><Clock className="w-3 h-3" />{item.time}</span>
                          <span className="text-xs text-[#94A3B8]">Room {item.room}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                        <Users className="w-3 h-3" />{item.students}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Activity Feed */}
            <div>
              <GlassCard className="p-6 h-full" animate delay={0.2}>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-[#C8A95B]" />
                  <h2 className="font-semibold text-[#F8FAFC] text-sm">Recent Activity</h2>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((a, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="flex items-start gap-3 pb-3 border-b border-[rgba(200,169,91,0.06)] last:border-0">
                      <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-xs mt-0.5 ${
                        a.type === 'ai' ? 'bg-[rgba(200,169,91,0.15)] text-[#C8A95B]' :
                        a.type === 'alert' ? 'bg-red-500/15 text-red-400' :
                        a.type === 'user' ? 'bg-[rgba(27,60,115,0.4)] text-blue-400' :
                        'bg-[rgba(15,23,42,0.5)] text-[#94A3B8]'
                      }`}>
                        {a.type === 'ai' ? <Cpu className="w-3 h-3" /> : a.type === 'alert' ? '!' : a.type === 'user' ? <Users className="w-3 h-3" /> : '·'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#94A3B8] leading-relaxed">{a.text}</p>
                        <p className="text-[10px] text-[#94A3B8]/50 mt-0.5">{a.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Bottom: Skeleton placeholder for future modules */}
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['AI Recommendations', 'Grade Analytics', 'Attendance Overview'].map((title, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }}>
                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#C8A95B] animate-pulse" />
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">{title}</p>
                  </div>
                  <LoadingSkeleton lines={3} />
                  <p className="text-xs text-[#94A3B8]/40 mt-3 text-center">Coming in Phase 2</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage;
