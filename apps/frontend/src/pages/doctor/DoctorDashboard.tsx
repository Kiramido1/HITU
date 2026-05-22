import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { DashboardWidget } from '@/components/ui/DashboardWidget'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/variants'
import { BookOpen, Upload, Calendar, Users, Bell, FileText, Clock, Award, ChevronRight } from 'lucide-react'

const myCourses = [
  { id: '1', code: 'CS-401', name: 'Algorithm Design', students: 48, level: 4 },
  { id: '2', code: 'CS-301', name: 'Data Structures', students: 52, level: 3 },
  { id: '3', code: 'MATH-201', name: 'Linear Algebra', students: 38, level: 2 },
]

const mySchedule = [
  { course: 'CS-401', time: '08:00 – 10:00', hall: 'B-204', day: 'Saturday', type: 'Lecture' },
  { course: 'CS-301', time: '10:00 – 12:00', hall: 'A-102', day: 'Sunday', type: 'Lecture' },
  { course: 'MATH-201', time: '14:00 – 16:00', hall: 'C-301', day: 'Monday', type: 'Lecture' },
]

const recentActivity = [
  { text: '3 new assignment submissions in CS-401', time: '10 min ago' },
  { text: 'Schedule updated for MATH-201', time: '1 hour ago' },
  { text: 'New student enrolled in CS-301', time: '2 hours ago' },
]

export const DoctorDashboard: React.FC = () => {
  const { user, sidebarCollapsed } = useAppStore()

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-[#C8A95B]" />
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest">Faculty Portal</p>
              </div>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">
                Dr. {user?.full_name ?? 'Faculty'} <span className="gradient-gold text-2xl">Dashboard</span>
              </h1>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'My Courses', value: 3, icon: <BookOpen className="w-5 h-5" />, color: 'gold' as const },
              { label: 'Total Students', value: 138, icon: <Users className="w-5 h-5" />, color: 'blue' as const },
              { label: 'Active Assignments', value: 7, icon: <FileText className="w-5 h-5" />, color: 'green' as const },
              { label: 'Pending Reviews', value: 24, icon: <Clock className="w-5 h-5" />, color: 'purple' as const },
            ].map((w, i) => (
              <motion.div key={i} variants={staggerItem}><DashboardWidget {...w} delay={i} subtitle="" /></motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* My Courses */}
            <GlassCard className="p-6" animate>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C8A95B]" />
                  <h2 className="font-semibold text-[#F8FAFC] text-sm">My Courses</h2>
                </div>
              </div>
              <div className="space-y-3">
                {myCourses.map((course, i) => (
                  <motion.div key={i} whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
                    <Link to={`/doctor/courses/${course.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(200,169,91,0.08)] hover:border-[rgba(200,169,91,0.25)] transition-all duration-200">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(200,169,91,0.1)] border border-[rgba(200,169,91,0.2)] flex items-center justify-center">
                          <span className="font-mono text-[#C8A95B] text-xs font-bold">{course.level}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#F8FAFC]">{course.code}</p>
                          <p className="text-xs text-[#94A3B8]">{course.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#C8A95B]">{course.students}</p>
                          <p className="text-[10px] text-[#94A3B8]">Students</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#94A3B8]/50" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/doctor/materials" className="flex-1">
                  <GlowButton variant="outline" size="sm" fullWidth icon={<Upload className="w-3.5 h-3.5" />}>Upload Material</GlowButton>
                </Link>
                <Link to="/doctor/assignments" className="flex-1">
                  <GlowButton variant="primary" size="sm" fullWidth icon={<FileText className="w-3.5 h-3.5" />}>Assignments</GlowButton>
                </Link>
              </div>
            </GlassCard>

            {/* My Schedule */}
            <GlassCard className="p-6" animate delay={0.1}>
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-4 h-4 text-[#C8A95B]" />
                <h2 className="font-semibold text-[#F8FAFC] text-sm">My Schedule</h2>
              </div>
              <div className="space-y-3">
                {mySchedule.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(200,169,91,0.06)]">
                    <div className="w-1 h-10 rounded-full bg-gradient-to-b from-[#C8A95B] to-[#1B3C73] flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#F8FAFC]">{item.course}</p>
                      <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                        <span>{item.day}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                        <span>•</span>
                        <span>{item.hall}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#C8A95B] bg-[rgba(200,169,91,0.1)] border border-[rgba(200,169,91,0.2)] px-2 py-0.5 rounded-full">{item.type}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-xs text-[#94A3B8] uppercase tracking-wider">Recent Activity</p>
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-[#C8A95B] mt-0.5">·</span>
                    <div className="flex-1">
                      <p className="text-[#94A3B8]">{a.text}</p>
                      <p className="text-[#94A3B8]/40">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
