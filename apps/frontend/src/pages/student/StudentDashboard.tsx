import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { DashboardWidget } from '@/components/ui/DashboardWidget'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/variants'
import { BookOpen, FileText, Download, Clock, Award, CheckCircle, AlertTriangle, Calendar } from 'lucide-react'
import { formatDistanceToNow, isPast } from 'date-fns'

const myCourses = [
  { id: '1', code: 'CS-401', name: 'Algorithm Design', doctor: 'Dr. Ahmed Hassan', materials: 8, assignments: 3 },
  { id: '2', code: 'CS-301', name: 'Data Structures', doctor: 'Dr. Sara Mansour', materials: 12, assignments: 2 },
  { id: '3', code: 'MATH-201', name: 'Linear Algebra', doctor: 'Dr. Khalid Ibrahim', materials: 6, assignments: 1 },
]

const myAssignments = [
  { id: '1', title: 'Assignment 1 — Sorting Algorithms', course: 'CS-401', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'pending', grade: null },
  { id: '2', title: 'Lab Report — Binary Trees', course: 'CS-301', deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'submitted', grade: null },
  { id: '3', title: 'Problem Set 1 — Vectors', course: 'MATH-201', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'graded', grade: 88 },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
  submitted: { label: 'Submitted', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: CheckCircle },
  graded: { label: 'Graded', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: Award },
  late: { label: 'Late', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: AlertTriangle },
}

const mySchedule = [
  { course: 'CS-401', day: 'Saturday', time: '08:00–10:00', hall: 'B-204', type: 'Lecture' },
  { course: 'CS-301', day: 'Sunday', time: '10:00–12:00', hall: 'A-102', type: 'Lecture' },
  { course: 'CS-401', day: 'Tuesday', time: '14:00–16:00', hall: 'Lab-1', type: 'Section' },
  { course: 'MATH-201', day: 'Wednesday', time: '08:00–10:00', hall: 'C-301', type: 'Lecture' },
]

export const StudentDashboard: React.FC = () => {
  const { user, sidebarCollapsed } = useAppStore()
  const [activeTab, setActiveTab] = useState<'courses' | 'assignments' | 'schedule'>('courses')

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
            <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1">Student Portal</p>
            <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">
              Welcome, <span className="gradient-gold">{user?.full_name?.split(' ')[0] ?? 'Student'}</span>
            </h1>
          </motion.div>

          {/* Widgets */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Enrolled Courses', value: 3, icon: <BookOpen className="w-5 h-5" />, color: 'gold' as const },
              { label: 'Assignments Due', value: 2, icon: <FileText className="w-5 h-5" />, color: 'blue' as const },
              { label: 'Materials', value: 26, icon: <Download className="w-5 h-5" />, color: 'green' as const },
              { label: 'Current GPA', value: '3.8', icon: <Award className="w-5 h-5" />, color: 'purple' as const },
            ].map((w, i) => <motion.div key={i} variants={staggerItem}><DashboardWidget {...w} delay={i} subtitle="" /></motion.div>)}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.1)] mb-6 w-fit">
            {['courses', 'assignments', 'schedule'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab ? 'bg-[rgba(200,169,91,0.15)] text-[#C8A95B] border border-[rgba(200,169,91,0.3)]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          {activeTab === 'courses' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCourses.map((course, i) => (
                <GlassCard key={i} className="p-5 group hover:border-[rgba(200,169,91,0.3)] transition-all duration-200" gradient>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(200,169,91,0.1)] border border-[rgba(200,169,91,0.2)] flex items-center justify-center">
                      <span className="font-mono text-[#C8A95B] text-xs font-bold">{course.code.split('-')[1]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#F8FAFC]">{course.code}</p>
                      <p className="text-xs text-[#94A3B8]">{course.doctor}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#94A3B8] mb-4">{course.name}</p>
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-3 border-t border-[rgba(200,169,91,0.08)]">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{course.materials} Materials</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.assignments} Assignments</span>
                  </div>
                  <GlowButton variant="outline" size="sm" fullWidth className="mt-3">View Course</GlowButton>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {myAssignments.map((a, i) => {
                const cfg = statusConfig[a.status]
                const isOverdue = isPast(a.deadline) && a.status === 'pending'
                return (
                  <GlassCard key={i} className={`p-5 ${isOverdue ? 'border-red-500/20' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-[#F8FAFC]">{a.title}</p>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                            <cfg.icon className="w-3 h-3" />{cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                          <span className="text-[#C8A95B] font-semibold">{a.course}</span>
                          <span>•</span>
                          <span className={isPast(a.deadline) && a.status === 'pending' ? 'text-red-400' : ''}>
                            Due {formatDistanceToNow(a.deadline, { addSuffix: true })}
                          </span>
                          {a.grade && <><span>•</span><span className="text-emerald-400 font-semibold">{a.grade}/100</span></>}
                        </div>
                      </div>
                      {a.status === 'pending' && (
                        <GlowButton variant="primary" size="sm" magnetic>Submit</GlowButton>
                      )}
                    </div>
                  </GlassCard>
                )
              })}
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {mySchedule.map((item, i) => (
                <GlassCard key={i} className="p-4 flex items-center gap-4">
                  <div className="w-1 h-12 rounded-full bg-gradient-to-b from-[#C8A95B] to-[#1B3C73] flex-shrink-0" />
                  <div className="w-20 text-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#C8A95B] mx-auto mb-0.5" />
                    <p className="text-xs text-[#94A3B8]">{item.day}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#F8FAFC] text-sm">{item.course}</p>
                    <p className="text-xs text-[#94A3B8]">{item.time} • {item.hall}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${item.type === 'Lecture' ? 'text-[#C8A95B] bg-[rgba(200,169,91,0.1)] border-[rgba(200,169,91,0.2)]' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'}`}>
                    {item.type}
                  </span>
                </GlassCard>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
