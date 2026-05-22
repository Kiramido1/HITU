import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowInput } from '@/components/ui/GlowInput'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/ui/DataTable'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/variants'
import { Building2, Plus, Users, BookOpen, BarChart3, TrendingUp, Trash2, Edit } from 'lucide-react'
import { apiClient } from '@/services/api'

interface Department {
  id: string
  name: string
  code: string
  description: string
  student_count: number
  head_of_department: string
  semester_id: string
  created_at: string
}

interface DepartmentStats {
  department_id: string
  department_name: string
  department_code: string
  total_courses: number
  total_students: number
  head_of_department: string
}

export const DepartmentManager: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', code: '', description: '', student_count: 0, head_of_department: '', semester_id: '' })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const { data } = await apiClient.get('/academic/departments')
      setDepartments(data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartmentStats = async (departmentId: string) => {
    try {
      const { data } = await apiClient.get(`/academic/statistics/department/${departmentId}`)
      setDepartmentStats(data)
    } catch (error) {
      console.error('Failed to fetch department stats:', error)
    }
  }

  const handleCreate = async () => {
    try {
      const payload: any = { ...form }
      if (!payload.semester_id) delete payload.semester_id
      if (!payload.description) delete payload.description
      if (!payload.head_of_department) delete payload.head_of_department

      await apiClient.post('/academic/departments', payload)
      await fetchDepartments()
      setShowModal(false)
      setForm({ name: '', code: '', description: '', student_count: 0, head_of_department: '', semester_id: '' })
    } catch (error: any) {
      console.error('Failed to create department:', error)
      const errorMsg = error.response?.data?.detail || 'Failed to create department. Code may already exist.'
      alert(`Error: ${errorMsg}`)
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const payload: any = { ...form }
      if (!payload.semester_id) delete payload.semester_id
      if (!payload.description) delete payload.description
      if (!payload.head_of_department) delete payload.head_of_department

      await apiClient.put(`/academic/departments/${id}`, payload)
      await fetchDepartments()
      setShowModal(false)
      setForm({ name: '', code: '', description: '', student_count: 0, head_of_department: '', semester_id: '' })
    } catch (error: any) {
      console.error('Failed to update department:', error)
      const errorMsg = error.response?.data?.detail || 'Failed to update department. Code may already exist.'
      alert(`Error: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return
    try {
      await apiClient.delete(`/academic/departments/${id}`)
      await fetchDepartments()
    } catch (error) {
      console.error('Failed to delete department:', error)
    }
  }

  const handleViewStats = (department: Department) => {
    setSelectedDepartment(department)
    fetchDepartmentStats(department.id)
    setShowStatsModal(true)
  }

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department)
    setForm({
      name: department.name,
      code: department.code,
      description: department.description,
      student_count: department.student_count,
      head_of_department: department.head_of_department,
      semester_id: department.semester_id
    })
    setShowModal(true)
  }

  const columns = [
    { key: 'name', header: 'Department Name' },
    { key: 'code', header: 'Code', render: (row: Department) => <span className="font-mono text-[#C8A95B]">{row.code}</span> },
    { key: 'head_of_department', header: 'Head of Department', render: (row: Department) => row.head_of_department || '-' },
    {
      key: 'student_count', header: 'Students',
      render: (row: Department) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{row.student_count}</span>
        </div>
      )
    },
    {
      key: 'actions', header: 'Actions',
      render: (row: Department) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleViewStats(row)}
            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors" title="View Statistics">
            <BarChart3 className="w-4 h-4" />
          </button>
          <button onClick={() => handleEdit(row)}
            className="p-1.5 rounded-lg text-[#C8A95B] hover:bg-[rgba(200,169,91,0.1)] transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
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
        <div className="text-[#94A3B8]">Loading departments...</div>
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
                <Building2 className="w-3.5 h-3.5" /> Academic Management
              </p>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Department <span className="gradient-gold">Manager</span></h1>
            </div>
            <GlowButton variant="primary" size="md" magnetic icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              New Department
            </GlowButton>
          </motion.div>

          {/* Statistics cards */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-4 gap-4 mb-8">
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-[#C8A95B]" />
                  <span className="text-sm text-[#94A3B8]">Total Departments</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{departments.length}</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-[#94A3B8]">Total Students</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{departments.reduce((sum, d) => sum + d.student_count, 0)}</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-[#94A3B8]">Avg Students/Dept</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">
                  {departments.length > 0 ? Math.round(departments.reduce((sum, d) => sum + d.student_count, 0) / departments.length) : 0}
                </p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-5 hover">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-[#94A3B8]">Active HODs</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">
                  {departments.filter(d => d.head_of_department).length}
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <DataTable data={departments as unknown as Record<string, unknown>[]} columns={columns as any} rowKey="id" />
          </motion.div>
        </div>
      </main>

      {/* Create/Edit Department Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={selectedDepartment ? 'Edit Department' : 'Create New Department'} size="md">
        <div className="space-y-4">
          <GlowInput label="Department Name" placeholder="Computer Science" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <GlowInput label="Department Code" placeholder="CS" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <GlowInput label="Head of Department" placeholder="Dr. John Smith" value={form.head_of_department} onChange={(e) => setForm({ ...form, head_of_department: e.target.value })} />
          <GlowInput label="Student Count" type="number" min="0" value={form.student_count.toString()} onChange={(e) => setForm({ ...form, student_count: parseInt(e.target.value) })} />
          <GlowInput label="Description" placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <GlowButton variant="ghost" fullWidth onClick={() => { setShowModal(false); setSelectedDepartment(null); setForm({ name: '', code: '', description: '', student_count: 0, head_of_department: '', semester_id: '' }) }}>Cancel</GlowButton>
            <GlowButton variant="primary" fullWidth magnetic onClick={() => selectedDepartment ? handleUpdate(selectedDepartment.id) : handleCreate()}>
              {selectedDepartment ? 'Update Department' : 'Create Department'}
            </GlowButton>
          </div>
        </div>
      </Modal>

      {/* Statistics Modal */}
      <Modal open={showStatsModal} onClose={() => setShowStatsModal(false)} title={`${selectedDepartment?.name} Statistics`} size="lg">
        {departmentStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-[#C8A95B]" />
                  <span className="text-sm text-[#94A3B8]">Total Courses</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{departmentStats.total_courses}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-[#94A3B8]">Total Students</span>
                </div>
                <p className="text-3xl font-bold font-sora text-[#F8FAFC]">{departmentStats.total_students}</p>
              </GlassCard>
            </div>
            <GlassCard className="p-5">
              <p className="text-sm text-[#94A3B8] mb-2">Head of Department</p>
              <p className="text-2xl font-bold font-sora text-[#F8FAFC]">{departmentStats.head_of_department || 'Not Assigned'}</p>
            </GlassCard>
          </div>
        )}
      </Modal>
    </div>
  )
}
