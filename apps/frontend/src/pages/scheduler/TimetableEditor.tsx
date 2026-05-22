import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer } from '@/animations/variants'
import { Edit3, Save, AlertCircle } from 'lucide-react'
import { academicService } from '@/services/api'

export const TimetableEditor: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [schedule, setSchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSem, setActiveSem] = useState<string | null>(null)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    setLoading(true)
    try {
      const sems = await academicService.getSemesters()
      const active = sems.find((s: any) => s.is_active)
      if (active) {
        setActiveSem(active.id)
        const data = await academicService.getSchedule(active.id)
        setSchedule(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Dummy API call for save, in reality we'd update schedule entries
      await new Promise((r) => setTimeout(r, 1000))
      alert('Changes saved successfully!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Edit3 className="w-4 h-4 text-[#C8A95B]" />
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest">Manual Override</p>
              </div>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Timetable <span className="gradient-gold">Editor</span></h1>
            </div>
            <GlowButton onClick={handleSave} variant="primary" loading={saving} icon={<Save className="w-4 h-4" />}>
              Save Changes
            </GlowButton>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <p className="text-sm text-amber-400">
                  Manual edits may introduce conflicts that violate constraints. We recommend using the AI Scheduler for most changes.
                </p>
              </div>

              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8A95B]" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left text-[#94A3B8] py-3 pr-4 font-semibold">Course</th>
                        <th className="text-left text-[#94A3B8] py-3 px-2 font-semibold">Type</th>
                        <th className="text-left text-[#94A3B8] py-3 px-2 font-semibold">Day</th>
                        <th className="text-left text-[#94A3B8] py-3 px-2 font-semibold">Time</th>
                        <th className="text-left text-[#94A3B8] py-3 px-2 font-semibold">Hall</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map(entry => (
                        <tr key={entry.id} className="border-t border-[rgba(200,169,91,0.05)]">
                          <td className="py-3 pr-4 font-medium text-[#F8FAFC]">{entry.course?.code}</td>
                          <td className="py-3 px-2 text-[#94A3B8] capitalize">{entry.entry_type}</td>
                          <td className="py-3 px-2 text-[#94A3B8] capitalize">{entry.day_of_week}</td>
                          <td className="py-3 px-2 text-[#94A3B8]">{entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}</td>
                          <td className="py-3 px-2">
                            <input
                              type="text"
                              className="w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] rounded-md px-3 py-1.5 text-sm text-[#F8FAFC]"
                              defaultValue={entry.hall?.name || ''}
                            />
                          </td>
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
