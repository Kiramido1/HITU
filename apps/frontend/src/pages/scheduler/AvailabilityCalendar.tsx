import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { Calendar, Save, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
const TIME_SLOTS = [
  { start: '08:00', end: '10:00', label: '8:00 - 10:00' },
  { start: '10:00', end: '12:00', label: '10:00 - 12:00' },
  { start: '12:00', end: '14:00', label: '12:00 - 14:00' },
  { start: '14:00', end: '16:00', label: '14:00 - 16:00' },
  { start: '16:00', end: '18:00', label: '16:00 - 18:00' }
]

type AvailabilityStatus = 'available' | 'preferred' | 'unavailable'

interface Slot {
  day: string
  start_time: string
  end_time: string
  status: AvailabilityStatus
}

export const AvailabilityCalendar: React.FC = () => {
  const { sidebarCollapsed, user, accessToken } = useAppStore()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/academic/availability', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        const formattedSlots = data.map((item: any) => ({
          day: item.day,
          start_time: item.start_time.slice(0, 5), // "08:00:00" -> "08:00"
          end_time: item.end_time.slice(0, 5),
          status: item.is_blocked ? 'unavailable' : item.is_preferred ? 'preferred' : 'available'
        }))
        setSlots(formattedSlots)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to fetch availability')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      const payload = slots.map(s => ({
        day: s.day.toLowerCase(),
        start_time: `${s.start_time}:00`,
        end_time: `${s.end_time}:00`,
        is_blocked: s.status === 'unavailable',
        is_preferred: s.status === 'preferred',
        note: ''
      }))

      const res = await fetch('/api/v1/academic/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ slots: payload })
      })

      if (res.ok) {
        setSuccessMsg('Availability saved successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        setErrorMsg('Failed to save availability.')
      }
    } catch (err) {
      setErrorMsg('Network error while saving.')
    } finally {
      setSaving(false)
    }
  }

  const toggleSlot = (day: string, start: string, end: string) => {
    const existingIndex = slots.findIndex(s => s.day.toLowerCase() === day.toLowerCase() && s.start_time === start)

    if (existingIndex >= 0) {
      const current = slots[existingIndex]
      let newStatus: AvailabilityStatus = 'available'

      if (current.status === 'available') newStatus = 'preferred'
      else if (current.status === 'preferred') newStatus = 'unavailable'
      else {
        // Remove if it goes back to default state (assuming 'available' is default, wait 'available' is default meaning no record or explicit record? let's make it remove on unavailable -> next click)
        const newSlots = [...slots]
        newSlots.splice(existingIndex, 1)
        setSlots(newSlots)
        return
      }

      const newSlots = [...slots]
      newSlots[existingIndex].status = newStatus
      setSlots(newSlots)
    } else {
      // Doesn't exist, add as 'preferred' or 'unavailable' (let's say first click means preferred)
      setSlots([...slots, { day, start_time: start, end_time: end, status: 'preferred' }])
    }
  }

  const getSlotStatus = (day: string, start: string): AvailabilityStatus => {
    const slot = slots.find(s => s.day.toLowerCase() === day.toLowerCase() && s.start_time === start)
    return slot ? slot.status : 'available'
  }

  const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
      case 'preferred': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
      case 'unavailable': return 'bg-red-500/20 border-red-500/50 text-red-400 cursor-not-allowed'
      default: return 'bg-[rgba(15,23,42,0.6)] border-[rgba(200,169,91,0.1)] hover:border-[rgba(200,169,91,0.3)] text-[#94A3B8]'
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
                <Calendar className="w-4 h-4 text-[#C8A95B]" />
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest">Schedule Management</p>
              </div>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">My <span className="gradient-gold">Availability</span></h1>
            </div>
            <GlowButton variant="primary" size="md" icon={<Save className="w-4 h-4" />} onClick={handleSave} loading={saving}>
              Save Availability
            </GlowButton>
          </motion.div>

          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-sm text-emerald-400">{successMsg}</p>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{errorMsg}</p>
            </motion.div>
          )}

          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <GlassCard className="p-6">
              <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-[rgba(200,169,91,0.1)]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border bg-[rgba(15,23,42,0.6)] border-[rgba(200,169,91,0.1)]" />
                  <span className="text-xs text-[#94A3B8]">Available (Default)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border bg-emerald-500/20 border-emerald-500/50" />
                  <span className="text-xs text-[#94A3B8]">Preferred Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border bg-red-500/20 border-red-500/50" />
                  <span className="text-xs text-[#94A3B8]">Unavailable</span>
                </div>
                <p className="text-xs text-[#C8A95B] ml-auto">Click slots to toggle status</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8A95B]" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-[#F8FAFC]">Time</th>
                        {DAYS.map(d => (
                          <th key={d} className="py-3 px-4 text-center text-sm font-semibold text-[#F8FAFC]">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map(time => (
                        <tr key={time.start} className="border-t border-[rgba(200,169,91,0.05)]">
                          <td className="py-4 px-4 text-xs font-mono text-[#94A3B8] whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {time.label}
                            </div>
                          </td>
                          {DAYS.map(day => {
                            const status = getSlotStatus(day, time.start)
                            return (
                              <td key={`${day}-${time.start}`} className="py-2 px-2 text-center">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => toggleSlot(day, time.start, time.end)}
                                  className={`w-full py-3 rounded-lg border transition-all duration-200 ${getStatusColor(status)}`}
                                >
                                  {status === 'preferred' && 'Preferred'}
                                  {status === 'unavailable' && 'Busy'}
                                  {status === 'available' && '-'}
                                </motion.button>
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
