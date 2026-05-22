import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowInput } from '@/components/ui/GlowInput'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/ui/DataTable'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/variants'
import { Calendar, Plus, CheckCircle, Archive, Clock, Trash2, BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react'
import { apiClient } from '@/services/api'

interface Semester {
  id: string
  name: string
  academic_year: string
  semester_number: number
  status: 'upcoming' | 'active' | 'completed' | 'archived'
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

interface SemesterStats {
  semester_id: string
  semester_name: string
  total_courses: number
  total_departments: number
  total_students: number
  total_credit_hours: number
  total_lectures: number
  total_sections: number
  status: string
  is_active: boolean
}

const statusConfig = {
  active: { label: 'Active', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle },
  upcoming: { label: 'Upcoming', color: 'text-[#C8A95B] bg-[rgba(200,169,91,0.1)] border-[rgba(200,169,91,0.2)]', icon: Clock },
  completed: { label: 'Completed', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: CheckCircle },
  archived: { label: 'Archived', color: 'text-[#94A3B8] bg-[rgba(148,163,184,0.1)] border-[rgba(148,163,184,0.2)]', icon: Archive },
}

export const SemesterManager: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [semesterStats, setSemesterStats] = useState<SemesterStats | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', academic_year: '', semester_number: 1, start_date: '', end_date: '', description: '' })

  useEffect(() => {
    fetchSemesters()
  }, [])

  const fetchSemesters = async () => {
    try {
      const { data } = await apiClient.get('/academic/semesters')
      setSemesters(data)
    } catch (error) {
      console.error('Failed to fetch semesters:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSemesterStats = async (semesterId: string) => {
    try {
      const { data } = await apiClient.get(`/academic/statistics/semester/${semesterId}`)
      setSemesterStats(data)
    } catch (error) {
      console.error('Failed to fetch semester stats:', error)
    }
  }

  const handleCreate = async () => {
    try {
      await apiClient.post('/academic/semesters', form)
      await fetchSemesters()
      setShowModal(false)
      setForm({ name: '', academic_year: '', semester_number: 1, start_date: '', end_date: '', description: '' })
    } catch (error) {
      console.error('Failed to create semester:', error)
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await apiClient.put(`/academic/semesters/${id}/activate`)
      await fetchSemesters()
    } catch (error) {
      console.error('Failed to activate semester:', error)
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await apiClient.put(`/academic/semesters/${id}/archive`)
      await fetchSemesters()
    } catch (error) {
      console.error('Failed to archive semester:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this semester?')) return
    try {
      await apiClient.delete(`/academic/semesters/${id}`)
      await fetchSemesters()
    } catch (error) {
      console.error('Failed to delete semester:', error)
    }
  }

  const handleViewStats = (semester: Semester) => {
    setSelectedSemester(semester)
    fetchSemesterStats(semester.id)
    setShowStatsModal(true)
  }

  const columns = [
    { key: 'name', header: 'Semester Name' },
    { key: 'academic_year', header: 'Academic Year' },
    {
      key: 'semester_number', header: 'Semester',
      render: (row: Semester) => `Semester ${row.semester_number}`
    },
    {
      key: 'status', header: 'Status',
      render: (row: Semester) => {
        const cfg = statusConfig[row.status]
        const Icon = cfg.icon
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
        )
      }
    },
    { key: 'start_date', header: 'Start Date', render: (row: Semester) => row.start_date ? new Date(row.start_date).toLocaleDateString() : '-' },
    { key: 'end_date', header: 'End Date', render: (row: Semester) => row.end_date ? new Date(row.end_date).toLocaleDateString() : '-' },
    {
      key: 'actions', header: 'Actions',
      render: (row: Semester) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleViewStats(row)}
            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors" title="View Statistics">
            <BarChart3 className="w-4 h-4" />
          </button>
          {row.status !== 'active' && (
            <button onClick={() => handleActivate(row.id)}
              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors" title="Activate">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {row.status === 'active' && (
            <button onClick={() => handleArchive(row.id)}
              className="p-1.5 rounded-lg text-[#C8A95B] hover:bg-[rgba(200,169,91,0.1)] transition-colors" title="Archive">
              <Archive className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-[#94A3B8]">Loading semesters...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Academic Management
              </p>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Semester <span className="gradient-gold">Manager</span></h1>
            </div>
            <GlowButton variant="primary" size="md" magnetic icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              New Semester
            </GlowButton>
          </motion.div>

          {/* Status summary cards */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-4 gap-4 mb-8">
            {Object.entries(statusConfig).map(([status, cfg], i) => (
              <motion.div key={status} variants={staggerItem}>
                <GlassCard className="p-5 text-center hover">
                  <div className={`flex items-center justify-center gap-2 mb-2 ${cfg.color.split(' ')[0]}`}>
                    <cfg.icon className="w-5 h-5" />
                    <span className="text-3xl font-bold font-sora">
                      {semesters.filter(s => s.status === status).length}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider">{cfg.label} Semesters</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <DataTable data={semesters as unknown as Record<string, unknown>[]} columns={columns as any} rowKey="id" />
          </motion.div>
        </div>
      </main>

      {/* Create Semester Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Semester" size="md">
        <div className="space-y-4">
          <GlowInput label="Semester Name" placeholder="Fall 2025" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <GlowInput label="Academic Year" placeholder="2025/2026" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} />
            <GlowInput label="Semester Number" type="number" min="1" max="2" value={form.semester_number.toString()} onChange={(e) => setForm({ ...form, semester_number: parseInt(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <GlowInput label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <GlowInput label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <GlowInput label="Description" placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <GlowButton variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancel</GlowButton>
            <GlowButton variant="primary" fullWidth magnetic onClick={handleCreate}>Create Semester</GlowButton>
          </div>
        </div>
      </Modal>

      {/* Statistics Modal */}
      <Modal open={showStatsModal} onClose={() => setShowStatsModal(false)} title={`${selectedSemester?.name} Statistics`} size="lg">
        {semesterStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-[#C8A95B]" />
                  <span className="text-sm text-[#94A3B8]">Total Courses</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{semesterStats.total_courses}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-[#94A3B8]">Total Students</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{semesterStats.total_students}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-[#94A3B8]">Total Credit Hours</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{semesterStats.total_credit_hours}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-[#94A3B8]">Total Departments</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{semesterStats.total_departments}</p>
              </GlassCard>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-5">
                <p className="text-sm text-[#94A3B8] mb-2">Total Lectures</p>
                <p className="text-2xl font-bold font-sora text-[#F8FAFC]">{semesterStats.total_lectures}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <p className="text-sm text-[#94A3B8] mb-2">Total Sections</p>
                <p className="text-2xl font-bold font-sora text-[#F8FAFC]">{semesterStats.total_sections}</p>
              </GlassCard>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
