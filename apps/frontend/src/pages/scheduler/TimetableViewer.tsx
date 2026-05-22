import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer } from '@/animations/variants'
import { Calendar, Download, Search } from 'lucide-react'
import { exportTimetableToPDF } from '@/lib/exportUtils'
import { academicService } from '@/services/api'

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00']

export const TimetableViewer: React.FC = () => {
  const { sidebarCollapsed, user } = useAppStore()
  const [schedule, setSchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    setLoading(true)
    try {
      // In a real scenario we might fetch the active semester's schedule,
      // or the user's specific personalized schedule
      const sems = await academicService.getSemesters()
      const activeSem = sems.find((s: any) => s.is_active)
      if (activeSem) {
        let data = []
        if (user?.role === 'doctor' || user?.role === 'assistant') {
           data = await academicService.getDoctorSchedule(user.id, activeSem.id)
        } else {
           data = await academicService.getSchedule(activeSem.id)
        }
        setSchedule(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getEntryAt = (day: string, time: string) =>
    schedule.find(e => e.day_of_week === day.toLowerCase() && e.start_time.startsWith(time))

  const typeColors = {
    lecture: 'from-[rgba(200,169,91,0.2)] to-[rgba(27,60,115,0.3)] border-[rgba(200,169,91,0.3)] text-[#C8A95B]',
    section: 'from-[rgba(16,100,68,0.2)] to-[rgba(16,100,68,0.1)] border-emerald-500/30 text-emerald-400',
    lab: 'from-[rgba(124,58,237,0.2)] to-[rgba(124,58,237,0.1)] border-violet-500/30 text-violet-400',
  }

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[#C8A95B]" />
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest">Academic Term</p>
              </div>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">My <span className="gradient-gold">Timetable</span></h1>
            </div>
            <button
              onClick={() => exportTimetableToPDF(schedule, 'My Timetable')}
              className="flex items-center gap-2 px-4 py-2 bg-[rgba(200,169,91,0.1)] text-[#C8A95B] border border-[rgba(200,169,91,0.3)] rounded-lg hover:bg-[rgba(200,169,91,0.2)] transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <GlassCard className="p-6">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8A95B]" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left text-[#94A3B8] py-3 pr-4 font-semibold">Time</th>
                        {DAYS.map(d => <th key={d} className="text-center text-[#94A3B8] py-3 px-2 font-semibold">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map(time => (
                        <tr key={time} className="border-t border-[rgba(200,169,91,0.05)]">
                          <td className="text-[#94A3B8] py-3 pr-4 font-mono">{time}</td>
                          {DAYS.map(day => {
                            const entry = getEntryAt(day, time)
                            return (
                              <td key={day} className="py-2 px-2">
                                {entry ? (
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className={`rounded-lg p-3 bg-gradient-to-br border text-center ${typeColors[entry.entry_type as keyof typeof typeColors] || typeColors.lecture}`}
                                  >
                                    <p className="font-bold">{entry.course?.code || 'Course'}</p>
                                    <p className="opacity-80 text-xs mt-1">{entry.hall?.name || 'TBA'}</p>
                                    <p className="opacity-60 text-[10px] mt-0.5 capitalize">{entry.entry_type}</p>
                                  </motion.div>
                                ) : (
                                  <div className="h-16 rounded-lg bg-[rgba(15,23,42,0.3)] border border-[rgba(255,255,255,0.02)]" />
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
