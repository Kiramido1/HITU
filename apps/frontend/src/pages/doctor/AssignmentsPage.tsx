import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowInput } from '@/components/ui/GlowInput'
import { Modal } from '@/components/ui/Modal'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { FileText, Plus, Clock, Users, CheckCircle, AlertTriangle, Eye, Trash2 } from 'lucide-react'
import { formatDistanceToNow, isPast, format } from 'date-fns'

interface Submission { id: string; student: string; submittedAt: Date; status: string; grade: number | null; file: string }
interface Assignment {
  id: string; title: string; course: string; deadline: Date
  description: string; max_grade: number; submissions: Submission[]
}

const mockAssignments: Assignment[] = [
  {
    id: '1', title: 'Assignment 1 — Sorting Algorithms', course: 'CS-401',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    description: 'Implement and compare 3 sorting algorithms. Analyze time complexity.', max_grade: 100,
    submissions: [
      { id: 's1', student: 'Ahmed Ali', submittedAt: new Date(Date.now() - 1000 * 60 * 60), status: 'submitted', grade: null, file: 'ahmed_sort.pdf' },
      { id: 's2', student: 'Sara Mohamed', submittedAt: new Date(Date.now() - 2000 * 60 * 60), status: 'graded', grade: 88, file: 'sara_sort.pdf' },
    ]
  },
  {
    id: '2', title: 'Lab Report — Binary Trees', course: 'CS-301',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: 'Implement a BST with insert, delete, and traversal operations.', max_grade: 50,
    submissions: [
      { id: 's3', student: 'Khalid Ibrahim', submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'late', grade: null, file: 'khalid_bst.pdf' },
    ]
  },
]

const statusColor: Record<string, string> = {
  submitted: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  graded: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  late: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export const AssignmentsPage: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [grades, setGrades] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ title: '', course: 'CS-401', description: '', deadline: '', max_grade: 100 })

  const handleCreate = () => {
    setAssignments(prev => [{
      id: Date.now().toString(), ...form,
      deadline: new Date(form.deadline), max_grade: Number(form.max_grade), submissions: [],
    }, ...prev])
    setShowCreate(false)
  }

  const handleGrade = (submissionId: string) => {
    const grade = parseInt(grades[submissionId] ?? '0')
    setSelected(prev => prev ? ({
      ...prev,
      submissions: prev.submissions.map(s => s.id === submissionId ? { ...s, grade, status: 'graded' } : s)
    }) : null)
  }

  const totalSubmissions = assignments.reduce((a, asgn) => a + asgn.submissions.length, 0)
  const pendingGrades = assignments.reduce((a, asgn) => a + asgn.submissions.filter(s => s.status !== 'graded').length, 0)

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> LMS — Assignments</p>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Manage <span className="gradient-gold">Assignments</span></h1>
            </div>
            <GlowButton variant="primary" size="md" magnetic icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>New Assignment</GlowButton>
          </motion.div>

          {/* Stats */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Active Assignments', value: assignments.length, color: 'text-[#C8A95B]', icon: <FileText className="w-4 h-4" /> },
              { label: 'Total Submissions', value: totalSubmissions, color: 'text-blue-400', icon: <Users className="w-4 h-4" /> },
              { label: 'Pending Grades', value: pendingGrades, color: pendingGrades > 0 ? 'text-amber-400' : 'text-emerald-400', icon: <Clock className="w-4 h-4" /> },
            ].map((s, i) => (
              <motion.div key={i} variants={staggerItem}>
                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={s.color}>{s.icon}</span>
                    <p className="text-xs text-[#94A3B8]">{s.label}</p>
                  </div>
                  <p className={`text-3xl font-bold font-sora ${s.color}`}>{s.value}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Assignment cards */}
          <div className="space-y-4">
            {assignments.map((asgn, i) => {
              const isOverdue = isPast(asgn.deadline)
              const pendingCount = asgn.submissions.filter(s => s.status !== 'graded').length
              return (
                <motion.div key={asgn.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <GlassCard className={`p-5 ${isOverdue ? 'border-amber-500/20' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(200,169,91,0.1)] border border-[rgba(200,169,91,0.2)] flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[#C8A95B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-semibold text-[#F8FAFC]">{asgn.title}</h3>
                          <span className="text-xs font-mono font-bold text-[#C8A95B] bg-[rgba(200,169,91,0.1)] px-2 py-0.5 rounded">{asgn.course}</span>
                          {isOverdue && <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">Deadline Passed</span>}
                        </div>
                        <p className="text-xs text-[#94A3B8] mb-3">{asgn.description}</p>
                        <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {format(asgn.deadline, 'dd MMM yyyy, HH:mm')}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {asgn.submissions.length} submissions</span>
                          <span>Max: {asgn.max_grade} pts</span>
                          {pendingCount > 0 && <span className="text-amber-400 font-semibold">{pendingCount} pending grade{pendingCount > 1 ? 's' : ''}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <GlowButton variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelected(asgn)}>Review</GlowButton>
                        <button onClick={() => setAssignments(p => p.filter(a => a.id !== asgn.id))}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Create Assignment Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Assignment" size="md">
        <div className="space-y-4">
          <GlowInput label="Title" placeholder="Assignment 1 — Sorting Algorithms" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <div>
            <label className="block text-xs text-[#94A3B8] mb-2">Course</label>
            <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}
              className="w-full h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] px-3 focus:outline-none focus:border-[rgba(200,169,91,0.4)]">
              {['CS-401', 'CS-301', 'MATH-201'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#94A3B8] mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full h-24 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] p-3 resize-none focus:outline-none focus:border-[rgba(200,169,91,0.4)]"
              placeholder="Assignment instructions..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <GlowInput label="Deadline" type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            <GlowInput label="Max Grade" type="number" value={form.max_grade.toString()} onChange={e => setForm({ ...form, max_grade: parseInt(e.target.value) })} />
          </div>
          <div className="flex gap-3 pt-2">
            <GlowButton variant="ghost" fullWidth onClick={() => setShowCreate(false)}>Cancel</GlowButton>
            <GlowButton variant="primary" fullWidth magnetic onClick={handleCreate}>Create</GlowButton>
          </div>
        </div>
      </Modal>

      {/* Submissions Review Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? ''} size="lg">
        <div className="space-y-3">
          {selected?.submissions.length === 0 && (
            <p className="text-center text-[#94A3B8] py-8">No submissions yet</p>
          )}
          {selected?.submissions.map((sub) => (
            <div key={sub.id} className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(200,169,91,0.08)]">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C8A95B] to-[#1B3C73] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {sub.student.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#F8FAFC]">{sub.student}</p>
                <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                  <span>{sub.file}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(sub.submittedAt, { addSuffix: true })}</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor[sub.status]}`}>{sub.status}</span>
              {sub.grade !== null ? (
                <span className="font-bold text-emerald-400">{sub.grade}/{selected.max_grade}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Grade" min={0} max={selected.max_grade}
                    onChange={e => setGrades(g => ({ ...g, [sub.id]: e.target.value }))}
                    className="w-20 h-8 rounded-lg bg-[rgba(15,23,42,0.8)] border border-[rgba(200,169,91,0.2)] text-sm text-[#F8FAFC] px-2 focus:outline-none focus:border-[rgba(200,169,91,0.4)]" />
                  <GlowButton variant="primary" size="sm" onClick={() => handleGrade(sub.id)} icon={<CheckCircle className="w-3.5 h-3.5" />}>Grade</GlowButton>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
