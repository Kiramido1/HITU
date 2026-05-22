import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { DashboardWidget } from '@/components/ui/DashboardWidget'
import { StatCard } from '@/components/charts/StatCard'
import { AnalyticsChart } from '@/components/charts/AnalyticsChart'
import { Sidebar } from '@/components/layout/Sidebar'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/variants'
import { academicService } from '@/services/api'
import {
  Users, BookOpen, Calendar, Award, Bell, TrendingUp,
  Clock, Cpu, GraduationCap, Settings, Database,
  BarChart3, Building, Layers, Shield, Activity,
  Zap, AlertCircle, CheckCircle2
} from 'lucide-react'

const adminWidgets = [
  { label: 'Total Students', value: 4820, icon: <GraduationCap className="w-5 h-5" />, change: 8, changeType: 'increase' as const, color: 'blue' as const, subtitle: 'All departments' },
  { label: 'Active Courses', value: 128, icon: <BookOpen className="w-5 h-5" />, change: 5, changeType: 'increase' as const, color: 'gold' as const, subtitle: 'This semester' },
  { label: 'Faculty Members', value: 94, icon: <Users className="w-5 h-5" />, change: 2, changeType: 'increase' as const, color: 'green' as const, subtitle: 'Doctors & TAs' },
  { label: 'Scheduled Halls', value: 47, icon: <Building className="w-5 h-5" />, change: 3, changeType: 'decrease' as const, color: 'purple' as const, subtitle: 'AI optimized' },
]

const mockChartData = {
  enrollment: [
    { name: 'CS', value: 850 },
    { name: 'Engineering', value: 720 },
    { name: 'Business', value: 640 },
    { name: 'Medicine', value: 580 },
    { name: 'Arts', value: 420 },
  ],
  scheduleDistribution: [
    { day: 'Saturday', lectures: 45, sections: 32 },
    { day: 'Sunday', lectures: 52, sections: 28 },
    { day: 'Monday', lectures: 38, sections: 35 },
    { day: 'Tuesday', lectures: 48, sections: 30 },
    { day: 'Wednesday', lectures: 42, sections: 25 },
    { day: 'Thursday', lectures: 35, sections: 20 },
  ],
  hallUtilization: [
    { name: 'Lecture Halls', utilization: 85 },
    { name: 'Labs', utilization: 72 },
    { name: 'Seminars', utilization: 68 },
    { name: 'Amphitheaters', utilization: 91 },
  ],
  weeklyTrends: [
    { week: 'W1', courses: 120, conflicts: 5 },
    { week: 'W2', courses: 125, conflicts: 3 },
    { week: 'W3', courses: 128, conflicts: 2 },
    { week: 'W4', courses: 128, conflicts: 0 },
  ],
}

const quickActions = [
  { label: 'Manage Semesters', icon: Calendar, href: '/admin/semesters', color: 'text-[#C8A95B]' },
  { label: 'Manage Courses', icon: BookOpen, href: '/admin/courses', color: 'text-blue-400' },
  { label: 'Generate Timetable', icon: Cpu, href: '/admin/scheduler', color: 'text-emerald-400' },
  { label: 'Manage Halls', icon: Building, href: '/admin/halls', color: 'text-violet-400' },
  { label: 'Manage Doctors', icon: Users, href: '/admin/doctors', color: 'text-orange-400' },
  { label: 'Departments', icon: Layers, href: '/admin/departments', color: 'text-pink-400' },
]

export const AdminDashboard: React.FC = () => {
  const { user, sidebarCollapsed } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const sidebarWidth = sidebarCollapsed ? 72 : 260

  useEffect(() => {
    academicService.getDashboardOverview()
      .then((overview) => setDashboardData({ overview }))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 min-h-screen transition-all duration-300 overflow-y-auto" style={{ marginLeft: sidebarWidth }}>
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-[#C8A95B]" />
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest">Admin Control Center</p>
              </div>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">
                System <span className="gradient-gold">Dashboard</span>
              </h1>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-[rgba(200,169,91,0.08)] border border-[rgba(200,169,91,0.15)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-[#94A3B8]">All Systems Operational</span>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Stats with StatCard */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Students"
              value={dashboardData?.user_statistics?.total_students || 4820}
              icon={GraduationCap}
              color="text-[#C8A95B]"
              bgColor="bg-[rgba(200,169,91,0.1)]"
              trend={{ value: 8, label: 'vs last semester' }}
              delay={0}
            />
            <StatCard
              title="Active Courses"
              value={dashboardData?.overview?.total_courses || 128}
              icon={BookOpen}
              color="text-blue-400"
              bgColor="bg-[rgba(59,130,246,0.1)]"
              trend={{ value: 5, label: 'this semester' }}
              delay={0.1}
            />
            <StatCard
              title="Faculty Members"
              value={(dashboardData?.user_statistics?.total_doctors || 0) + (dashboardData?.user_statistics?.total_assistants || 0)}
              icon={Users}
              color="text-emerald-400"
              bgColor="bg-[rgba(16,185,129,0.1)]"
              trend={{ value: 2, label: 'new hires' }}
              delay={0.2}
            />
            <StatCard
              title="Scheduled Halls"
              value={dashboardData?.overview?.total_halls || 47}
              icon={Building}
              color="text-violet-400"
              bgColor="bg-[rgba(139,92,246,0.1)]"
              trend={{ value: -3, label: 'optimization' }}
              delay={0.3}
            />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6" animate>
                <div className="flex items-center gap-2 mb-5">
                  <Settings className="w-4 h-4 text-[#C8A95B]" />
                  <h2 className="font-semibold text-[#F8FAFC] text-sm">Quick Actions</h2>
                </div>
                <div className="space-y-2">
                  {quickActions.map((action, i) => (
                    <Link key={i} to={action.href}>
                      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.15 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[rgba(200,169,91,0.2)] hover:bg-[rgba(200,169,91,0.05)] transition-all duration-200 cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.1)] flex items-center justify-center">
                          <action.icon className={`w-4 h-4 ${action.color}`} />
                        </div>
                        <span className="text-sm text-[#94A3B8] group-hover:text-[#F8FAFC]">{action.label}</span>
                        <span className="ml-auto text-[#94A3B8]/40">›</span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* AI Scheduler Status */}
            <div className="lg:col-span-2">
              <GlassCard className="p-6" animate delay={0.1}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#C8A95B]" />
                    <h2 className="font-semibold text-[#F8FAFC] text-sm">AI Timetable Engine</h2>
                  </div>
                  <Link to="/admin/scheduler">
                    <GlowButton variant="primary" size="sm" magnetic>Generate Schedule</GlowButton>
                  </Link>
                </div>

                {/* Status cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Courses Pending', value: '23', status: 'warning' },
                    { label: 'Conflicts Found', value: '0', status: 'success' },
                    { label: 'Halls Available', value: '47', status: 'info' },
                  ].map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(200,169,91,0.08)] text-center">
                      <p className={`text-xl font-bold font-sora ${s.status === 'warning' ? 'text-amber-400' : s.status === 'success' ? 'text-emerald-400' : 'text-[#C8A95B]'}`}>{s.value}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Weekly distribution preview */}
                <div className="space-y-2">
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-3">Weekly Load Distribution</p>
                  {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'].map((day, i) => {
                    const pct = [78, 92, 65, 88, 45][i]
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-xs text-[#94A3B8] w-24 flex-shrink-0">{day}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[rgba(15,23,42,0.6)] overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={`h-full rounded-full ${pct > 85 ? 'bg-amber-400' : 'bg-gradient-to-r from-[#1B3C73] to-[#C8A95B]'}`} />
                        </div>
                        <span className="text-xs font-semibold text-[#C8A95B] w-10 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <AnalyticsChart
              type="pie"
              data={mockChartData.enrollment}
              title="Enrollment by Department"
              subtitle="Current semester distribution"
              dataKey="value"
              xAxisKey="name"
              colors={['#C8A95B', '#1B3C73', '#10E4A8', '#8B5CF6', '#F59E0B']}
              height={300}
            />
            <AnalyticsChart
              type="bar"
              data={mockChartData.hallUtilization}
              title="Hall Utilization"
              subtitle="Capacity usage by hall type"
              dataKey="utilization"
              xAxisKey="name"
              colors={['#C8A95B']}
              height={300}
              showTrend
              trendValue={12}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <AnalyticsChart
              type="area"
              data={mockChartData.weeklyTrends}
              title="Weekly Schedule Trends"
              subtitle="Courses scheduled vs conflicts over time"
              dataKey="courses"
              xAxisKey="week"
              colors={['#C8A95B']}
              height={300}
              showTrend
              trendValue={15}
            />
            <AnalyticsChart
              type="line"
              data={mockChartData.scheduleDistribution}
              title="Daily Schedule Distribution"
              subtitle="Lectures and sections per day"
              dataKey="lectures"
              xAxisKey="day"
              colors={['#C8A95B', '#10E4A8']}
              height={300}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
