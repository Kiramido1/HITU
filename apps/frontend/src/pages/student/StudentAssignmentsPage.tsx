import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { lmsService } from '@/services/api'
import { fadeInUp } from '@/animations/variants'
import { FileText, Upload, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface Assignment {
  id: string
  title: string
  description?: string
  deadline?: string
  max_grade: number
  course_id: string
}

export const StudentAssignmentsPage: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    lmsService.getMyAssignments()
      .then(setAssignments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (assignmentId: string, file?: File) => {
    const form = new FormData()
    form.append('assignment_id', assignmentId)
    if (file) form.append('file', file)
    setSubmitting(assignmentId)
    try {
      await lmsService.submitAssignment(form)
      alert('Submission uploaded successfully.')
    } catch {
      alert('Submission failed. Check deadline and try again.')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
            <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> LMS — Assignments
            </p>
            <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">
              My <span className="gradient-gold">Assignments</span>
            </h1>
          </motion.div>

          {loading ? (
            <p className="text-[#94A3B8]">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <GlassCard className="p-8 text-center text-[#94A3B8]">No assignments for your enrolled courses.</GlassCard>
          ) : (
            <div className="space-y-4">
              {assignments.map((a) => (
                <GlassCard key={a.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-[#F8FAFC]">{a.title}</h2>
                      {a.description && <p className="text-sm text-[#94A3B8] mt-1">{a.description}</p>}
                      {a.deadline && (
                        <p className="text-xs text-[#C8A95B] mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due {format(new Date(a.deadline), 'PPp')}
                        </p>
                      )}
                    </div>
                    <label>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleSubmit(a.id, f)
                        }}
                      />
                      <GlowButton
                        variant="primary"
                        size="sm"
                        icon={<Upload className="w-3.5 h-3.5" />}
                        disabled={submitting === a.id}
                        onClick={() => {}}
                      >
                        {submitting === a.id ? 'Uploading...' : 'Submit'}
                      </GlowButton>
                    </label>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
