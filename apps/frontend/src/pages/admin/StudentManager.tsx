import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { DataTable } from '@/components/ui/DataTable'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { academicService } from '@/services/api'
import { fadeInUp } from '@/animations/variants'
import { GraduationCap } from 'lucide-react'

interface Student {
  id: string
  email: string
  full_name: string
  department?: string
  student_id?: string
  is_active: boolean
}

export const StudentManager: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    academicService.getStudents({ limit: 100 })
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'student_id', header: 'Student ID', render: (r: Student) => r.student_id || '—' },
    { key: 'full_name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department', render: (r: Student) => r.department || '—' },
    {
      key: 'is_active',
      header: 'Status',
      render: (r: Student) => (
        <span className={r.is_active ? 'text-emerald-400' : 'text-[#94A3B8]'}>
          {r.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
            <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" /> Student Management
            </p>
            <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">
              Student <span className="gradient-gold">Registry</span>
            </h1>
          </motion.div>
          <GlassCard className="p-6">
            {loading ? (
              <p className="text-[#94A3B8] text-sm">Loading students...</p>
            ) : (
              <DataTable data={students as unknown as Record<string, unknown>[]} columns={columns as never} />
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  )
}
