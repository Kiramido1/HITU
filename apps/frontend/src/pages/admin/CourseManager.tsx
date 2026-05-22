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
import { BookOpen, Plus, Edit, Trash2, Search, Filter, UserPlus, AlertTriangle, Users, Clock } from 'lucide-react'
import { apiClient } from '@/services/api'

interface Course {
  id: string
  name: string
  code: string
  description: string
  credit_hours: number
  lecture_count: number
  section_count: number
  lab_count: number
  student_count: number
  level: string
  department_id: string
  semester_id: string
  doctor_id: string
  is_active: boolean
  created_at: string
}

interface Doctor {
  id: string
  full_name: string
  email: string
}

interface Assistant {
  id: string
  full_name: string
  email: string
}

const levelColors: Record<string, string> = {
  '1': 'text-blue-400',
  '2': 'text-emerald-400',
  '3': 'text-[#C8A95B]',
  '4': 'text-violet-400',
  'pg': 'text-pink-400'
}

export const CourseManager: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [courses, setCourses] = useState<Course[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', code: '', description: '', credit_hours: 3,
    lecture_count: 2, section_count: 2, lab_count: 0, student_count: 0,
    level: '1', department_id: '', semester_id: ''
  })
  const [assignForm, setAssignForm] = useState({ doctor_id: '', assistant_id: '', section_group: '' })

  useEffect(() => {
    fetchCourses()
    fetchDoctors()
    fetchAssistants()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data } = await apiClient.get('/academic/courses')
      setCourses(data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const { data } = await apiClient.get('/academic/doctors')
      setDoctors(data)
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    }
  }

  const fetchAssistants = async () => {
    try {
      const { data } = await apiClient.get('/academic/assistants')
      setAssistants(data)
    } catch (error) {
      console.error('Failed to fetch assistants:', error)
    }
  }

  const filtered = courses.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())) &&
    (!filterLevel || c.level === filterLevel)
  )

  const handleCreate = async () => {
    try {
      const payload: any = { ...form }
      if (!payload.department_id) delete payload.department_id
      if (!payload.semester_id) delete payload.semester_id
      await apiClient.post('/academic/courses', payload)
      await fetchCourses()
      setShowModal(false)
      setForm({
        name: '', code: '', description: '', credit_hours: 3,
        lecture_count: 2, section_count: 2, lab_count: 0, student_count: 0,
        level: '1', department_id: '', semester_id: ''
      })
    } catch (error) {
      console.error('Failed to create course:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      await apiClient.delete(`/academic/courses/${id}`)
      await fetchCourses()
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  const handleAssignDoctor = async () => {
    if (!selectedCourse) return
    try {
      await apiClient.post(`/academic/courses/${selectedCourse.id}/assign-doctor`, null, {
        params: { doctor_id: assignForm.doctor_id },
      })
      await fetchCourses()
      setShowAssignModal(false)
      setSelectedCourse(null)
      setAssignForm({ doctor_id: '', assistant_id: '', section_group: '' })
    } catch (error) {
      console.error('Failed to assign doctor:', error)
    }
  }

  const handleAssignAssistant = async () => {
    if (!selectedCourse) return
    try {
      await apiClient.post(`/academic/courses/${selectedCourse.id}/assign-assistant`, null, {
        params: {
          assistant_id: assignForm.assistant_id,
          section_group: assignForm.section_group ? parseInt(assignForm.section_group) : undefined,
        },
      })
      await fetchCourses()
      setShowAssignModal(false)
      setSelectedCourse(null)
      setAssignForm({ doctor_id: '', assistant_id: '', section_group: '' })
    } catch (error) {
      console.error('Failed to assign assistant:', error)
    }
  }

  const columns = [
    {
      key: 'code', header: 'Code',
      render: (row: Course) => <span className="font-mono text-[#C8A95B] text-sm font-bold">{row.code}</span>
    },
    { key: 'name', header: 'Course Name' },
    {
      key: 'level', header: 'Level',
      render: (row: Course) => (
        <span className={`font-semibold ${levelColors[row.level] || 'text-gray-400'}`}>
          {row.level === 'pg' ? 'Postgrad' : `Level ${row.level}`}
        </span>
      )
    },
    { key: 'credit_hours', header: 'Credits' },
    {
      key: 'hours', header: 'Lec / Sec / Lab',
      render: (row: Course) => (
        <span className="text-[#94A3B8] text-sm">
          {row.lecture_count}L / {row.section_count}S / {row.lab_count}Lab
        </span>
      )
    },
    {
      key: 'students', header: 'Students',
      render: (row: Course) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{row.student_count}</span>
        </div>
      )
    },
    {
      key: 'status', header: 'Status',
      render: (row: Course) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          row.is_active
            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            : 'text-[#94A3B8] bg-[rgba(148,163,184,0.1)] border-[rgba(148,163,184,0.2)]'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions', header: '',
      render: (row: Course) => (
        <div className="flex gap-2">
          <button onClick={() => { setSelectedCourse(row); setShowAssignModal(true); }}
            className="p-1.5 rounded-lg text-[#C8A95B] hover:bg-[rgba(200,169,91,0.1)] transition-colors" title="Assign Staff">
            <UserPlus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="text-[#94A3B8]">Loading courses...</div>
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
                <BookOpen className="w-3.5 h-3.5" /> Academic Management
              </p>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Course <span className="gradient-gold">Manager</span></h1>
            </div>
            <GlowButton variant="primary" size="md" magnetic icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Add Course
            </GlowButton>
          </motion.div>

          {/* Statistics cards */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-4 gap-4 mb-6">
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-[#C8A95B]" />
                  <span className="text-sm text-[#94A3B8]">Total Courses</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{courses.length}</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-[#94A3B8]">Total Students</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{courses.reduce((sum, c) => sum + c.student_count, 0)}</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-[#94A3B8]">Total Credit Hours</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{courses.reduce((sum, c) => sum + c.credit_hours, 0)}</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-[#94A3B8]">Unassigned</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{courses.filter(c => !c.doctor_id).length}</p>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Level filter cards */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-5 gap-4 mb-6">
            {['1', '2', '3', '4', 'pg'].map((level, i) => (
              <motion.div key={level} variants={staggerItem}>
                <button onClick={() => setFilterLevel(filterLevel === level ? null : level)} className="w-full text-left">
                  <GlassCard className={`p-4 text-center transition-all duration-200 ${filterLevel === level ? 'border-[rgba(200,169,91,0.4)]' : ''}`}>
                    <p className={`text-2xl font-bold font-sora ${levelColors[level]}`}>
                      {courses.filter(c => c.level === level).length}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-1">{level === 'pg' ? 'Postgrad' : `Level ${level}`}</p>
                  </GlassCard>
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Search bar */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by course name or code..."
                className="w-full pl-10 pr-4 h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[rgba(200,169,91,0.4)] transition-colors"
              />
            </div>
            {filterLevel && (
              <GlowButton variant="ghost" size="md" onClick={() => setFilterLevel(null)}>Clear Filter</GlowButton>
            )}
          </div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} rowKey="id" />
          </motion.div>
        </div>
      </main>

      {/* Create Course Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Course" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <GlowInput label="Course Code" placeholder="CS-401" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <GlowInput label="Course Name" placeholder="Algorithm Design" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="block text-xs text-[#94A3B8] mb-2">Academic Level</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] px-3 focus:outline-none focus:border-[rgba(200,169,91,0.4)]">
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="pg">Postgraduate</option>
            </select>
          </div>
          <GlowInput label="Credit Hours" type="number" value={form.credit_hours.toString()} onChange={(e) => setForm({ ...form, credit_hours: parseInt(e.target.value) })} />
          <GlowInput label="Lecture Count" type="number" value={form.lecture_count.toString()} onChange={(e) => setForm({ ...form, lecture_count: parseInt(e.target.value) })} />
          <GlowInput label="Section Count" type="number" value={form.section_count.toString()} onChange={(e) => setForm({ ...form, section_count: parseInt(e.target.value) })} />
          <GlowInput label="Lab Count" type="number" value={form.lab_count.toString()} onChange={(e) => setForm({ ...form, lab_count: parseInt(e.target.value) })} />
          <GlowInput label="Student Count" type="number" value={form.student_count.toString()} onChange={(e) => setForm({ ...form, student_count: parseInt(e.target.value) })} />
          <div className="col-span-2">
            <GlowInput label="Description" placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <GlowButton variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancel</GlowButton>
            <GlowButton variant="primary" fullWidth magnetic onClick={handleCreate}>Create Course</GlowButton>
          </div>
        </div>
      </Modal>

      {/* Assign Staff Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title={`Assign Staff - ${selectedCourse?.name}`} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#94A3B8] mb-2">Assign Doctor</label>
            <select value={assignForm.doctor_id} onChange={(e) => setAssignForm({ ...assignForm, doctor_id: e.target.value })}
              className="w-full h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] px-3 focus:outline-none focus:border-[rgba(200,169,91,0.4)]">
              <option value="">Select Doctor</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#94A3B8] mb-2">Assign Assistant</label>
            <select value={assignForm.assistant_id} onChange={(e) => setAssignForm({ ...assignForm, assistant_id: e.target.value })}
              className="w-full h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] px-3 focus:outline-none focus:border-[rgba(200,169,91,0.4)]">
              <option value="">Select Assistant</option>
              {assistants.map(a => (
                <option key={a.id} value={a.id}>{a.full_name}</option>
              ))}
            </select>
          </div>
          <GlowInput label="Section Group (Optional)" type="number" placeholder="1" value={assignForm.section_group} onChange={(e) => setAssignForm({ ...assignForm, section_group: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <GlowButton variant="ghost" fullWidth onClick={() => setShowAssignModal(false)}>Cancel</GlowButton>
            <GlowButton variant="primary" fullWidth magnetic onClick={handleAssignDoctor}>Assign Doctor</GlowButton>
            <GlowButton variant="primary" fullWidth magnetic onClick={handleAssignAssistant}>Assign Assistant</GlowButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
