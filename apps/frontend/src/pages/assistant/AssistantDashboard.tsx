import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { DashboardWidget } from '@/components/ui/DashboardWidget'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/variants'
import { BookOpen, Upload, Calendar, Users, FileText, Clock, Cpu } from 'lucide-react'

const mySections = [
  { id: '1', course: 'CS-401', section: 'Section A', students: 28, day: 'Tuesday', time: '14:00–16:00', hall: 'Lab-1' },
  { id: '2', course: 'CS-301', section: 'Section B', students: 25, day: 'Thursday', time: '10:00–12:00', hall: 'Lab-2' },
]

export const AssistantDashboard: React.FC = () => {
  const { user, sidebarCollapsed } = useAppStore()

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-[#94A3B8] uppercase tracking-widest">Teaching Assistant Portal</p>
            </div>
            <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">
              Welcome, <span className="text-emerald-400">{user?.full_name?.split(' ')[0] ?? 'TA'}</span>
            </h1>
          </motion.div>

          {/* Widgets */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'My Sections', value: 2, icon: <BookOpen className="w-5 h-5" />, color: 'gold' as const, subtitle: '' },
              { label: 'Total Students', value: 53, icon: <Users className="w-5 h-5" />, color: 'blue' as const, subtitle: '' },
              { label: 'Uploaded Files', value: 14, icon: <Upload className="w-5 h-5" />, color: 'green' as const, subtitle: '' },
              { label: 'This Week Hours', value: 4, icon: <Clock className="w-5 h-5" />, color: 'purple' as const, subtitle: '' },
            ].map((w, i) => <motion.div key={i} variants={staggerItem}><DashboardWidget {...w} delay={i} /></motion.div>)}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* My Sections */}
            <GlassCard className="p-6" animate>
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h2 className="font-semibold text-[#F8FAFC] text-sm">My Sections</h2>
              </div>
              <div className="space-y-3">
                {mySections.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(16,100,68,0.15)] hover:border-emerald-500/30 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-emerald-400">{s.course}</span>
                        <span className="text-xs text-[#94A3B8]">— {s.section}</span>
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-0.5 flex items-center gap-2">
                        <span>{s.day}</span><span>•</span><span>{s.time}</span><span>•</span><span>{s.hall}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-400">{s.students}</p>
                      <p className="text-[10px] text-[#94A3B8]">Students</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/assistant/materials" className="flex-1">
                  <GlowButton variant="outline" size="sm" fullWidth icon={<Upload className="w-3.5 h-3.5" />}>Upload Section Material</GlowButton>
                </Link>
              </div>
            </GlassCard>

            {/* Schedule */}
            <GlassCard className="p-6" animate delay={0.1}>
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h2 className="font-semibold text-[#F8FAFC] text-sm">This Week's Schedule</h2>
              </div>
              <div className="space-y-3">
                {mySections.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-emerald-500/10">
                    <div className="w-1 h-10 rounded-full bg-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#F8FAFC]">{s.course} — {s.section}</p>
                      <p className="text-xs text-[#94A3B8]">{s.day} • {s.time} • {s.hall}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Section</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-[rgba(15,23,42,0.4)] border border-[rgba(200,169,91,0.08)]">
                <p className="text-xs text-[#94A3B8] mb-1">Weekly Load</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-[rgba(15,23,42,0.6)] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '50%' }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">4/8 hours</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
