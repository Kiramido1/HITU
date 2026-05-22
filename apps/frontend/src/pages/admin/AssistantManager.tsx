import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowInput } from '@/components/ui/GlowInput'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/ui/DataTable'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { Users, Plus, Edit, BookOpen, Clock, Search, Calendar, TrendingUp } from 'lucide-react'
import { apiClient } from '@/services/api'

interface Assistant {
  id: string
  full_name: string
  email: string
  department_id: string
  max_hours_per_week: number
  current_hours: number
  created_at: string
}

interface AssistantSchedule {
  assistant_id: string
  assistant_name: string
  total_assigned_hours: number
  max_hours: number
  courses_assigned: number
  schedule_entries: Array<{
    day: string
    time_slot: string
    course_name: string
    hall_name: string
  }>
}

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu']

export const AssistantManager: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [assistantSchedule, setAssistantSchedule] = useState<AssistantSchedule | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', department_id: '', max_hours_per_week: 8 })

  const handleCreate = async () => {
    try {
      const payload = {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: 'assistant',
        department: form.department_id || undefined
      }
      await apiClient.post('/auth/register', payload)
      await fetchAssistants()
      setShowModal(false)
      setForm({ full_name: '', email: '', password: '', department_id: '', max_hours_per_week: 8 })
    } catch (error: any) {
      console.error('Failed to create assistant:', error)
      alert(error.response?.data?.detail || 'Failed to create assistant.')
    }
  }

  useEffect(() => {
    fetchAssistants()
  }, [])

  const fetchAssistants = async () => {
    try {
      const { data } = await apiClient.get('/academic/assistants')
      setAssistants(data)
    } catch (error) {
      console.error('Failed to fetch assistants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssistantSchedule = async (assistantId: string) => {
    try {
      const { data } = await apiClient.get(`/academic/assistants/${assistantId}/schedule`)
      setAssistantSchedule(data)
    } catch (error) {
      console.error('Failed to fetch assistant schedule:', error)
    }
  }

  const filtered = assistants.filter(d =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'name', header: 'Assistant',
      render: (r: Assistant) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A95B] to-[#1B3C73] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r.full_name.split(' ').filter(w => w.startsWith('Dr') === false).map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F8FAFC]">{r.full_name}</p>
            <p className="text-[10px] text-[#94A3B8]">{r.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'workload', header: 'Workload',
      render: (r: Assistant) => {
        const max = r.max_hours_per_week || 20
        const cur = r.current_hours || 0
        const pct = max > 0 ? (cur / max) * 100 : 0
        const color = pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-400' : 'bg-emerald-400'
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1 h-1.5 rounded-full bg-[rgba(15,23,42,0.6)] overflow-hidden">
              <motion.div animate={{ width: `${pct}%` }} className={`h-full rounded-full ${color}`} />
            </div>
            <span className="text-xs text-[#94A3B8] flex-shrink-0">{cur}/{max}h</span>
          </div>
        )
      }
    },
    {
      key: 'actions', header: '',
      render: (r: Assistant) => (
        <div className="flex gap-2">
          <button onClick={() => { setSelectedAssistant(r); fetchAssistantSchedule(r.id); setShowScheduleModal(true); }}
            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors" title="View Schedule">
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg text-[#C8A95B] hover:bg-[rgba(200,169,91,0.1)] transition-colors" title="Edit">
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-[#94A3B8]">Loading assistants...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Faculty Management</p>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Assistant <span className="gradient-gold">Manager</span></h1>
            </div>
            <GlowButton variant="primary" size="md" magnetic icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>Add Assistant</GlowButton>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mb-6">
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-[#C8A95B]" />
                  <span className="text-sm text-[#94A3B8]">Total Assistants</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{assistants.length}</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-[#94A3B8]">Total Hours/Week</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{assistants.reduce((a, d) => a + d.current_hours, 0)}</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-[#94A3B8]">Avg Load</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">
                  {assistants.length > 0 ? `${Math.round(assistants.reduce((a, d) => a + (d.max_hours_per_week > 0 ? (d.current_hours / d.max_hours_per_week) * 100 : 0), 0) / assistants.length)}%` : '0%'}
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[rgba(200,169,91,0.4)]" />
          </div>

          <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} rowKey="id" />
        </div>
      </main>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Assistant" size="md">
        <div className="space-y-4">
          <GlowInput label="Full Name" placeholder="Eng. Ahmed Hassan" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <GlowInput label="University Email" type="email" placeholder="assistant@hitu.edu.eg" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <GlowInput label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <GlowInput label="Department ID" placeholder="dept-uuid" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} />
          <GlowInput label="Max Teaching Hours/Week" type="number" value={form.max_hours_per_week.toString()} onChange={e => setForm({ ...form, max_hours_per_week: parseInt(e.target.value) })} />
          <div className="flex gap-3 pt-2">
            <GlowButton variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancel</GlowButton>
            <GlowButton variant="primary" fullWidth magnetic onClick={handleCreate}>Add Assistant</GlowButton>
          </div>
        </div>
      </Modal>

      <Modal open={showScheduleModal} onClose={() => setShowScheduleModal(false)} title={`${selectedAssistant?.full_name} Schedule`} size="lg">
        {assistantSchedule && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <GlassCard className="p-4">
                <p className="text-xs text-[#94A3B8] mb-1">Assigned Hours</p>
                <p className="text-2xl font-bold font-sora text-[#F8FAFC]">{assistantSchedule.total_assigned_hours}/{assistantSchedule.max_hours}h</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs text-[#94A3B8] mb-1">Courses Assigned</p>
                <p className="text-2xl font-bold font-sora text-[#F8FAFC]">{assistantSchedule.courses_assigned}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs text-[#94A3B8] mb-1">Schedule Entries</p>
                <p className="text-2xl font-bold font-sora text-[#F8FAFC]">{assistantSchedule.schedule_entries.length}</p>
              </GlassCard>
            </div>
            <GlassCard className="p-4">
              <p className="text-sm text-[#94A3B8] mb-3">Weekly Schedule</p>
              {assistantSchedule.schedule_entries.length > 0 ? (
                <div className="space-y-2">
                  {assistantSchedule.schedule_entries.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(15,23,42,0.4)] border border-[rgba(200,169,91,0.1)]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-[#C8A95B] bg-[rgba(200,169,91,0.1)] px-2 py-1 rounded">{entry.day}</span>
                        <span className="text-sm text-[#F8FAFC]">{entry.time_slot}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#F8FAFC]">{entry.course_name}</p>
                        <p className="text-xs text-[#94A3B8]">{entry.hall_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#94A3B8] text-center py-4">No schedule entries found</p>
              )}
            </GlassCard>
          </div>
        )}
      </Modal>
    </div>
  )
}
