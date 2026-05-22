import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowInput } from '@/components/ui/GlowInput'
import { useAppStore } from '@/store'
import { fadeInUp } from '@/animations/variants'
import { Mail, Lock, User, BookOpen, ArrowRight, ChevronRight, Shield, Cpu, GraduationCap } from 'lucide-react'

type Role = 'admin' | 'doctor' | 'assistant' | 'student'

const roles: { id: Role; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: 'student', label: 'Student', desc: 'Undergraduate / Graduate', icon: GraduationCap, color: 'text-blue-400' },
  { id: 'doctor', label: 'Doctor', desc: 'Faculty / Professor', icon: BookOpen, color: 'text-[#C8A95B]' },
  { id: 'assistant', label: 'Teaching Assistant', desc: 'Lab / Section Instructor', icon: Cpu, color: 'text-emerald-400' },
  { id: 'admin', label: 'Administrator', desc: 'Full System Access', icon: Shield, color: 'text-violet-400' },
]

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { setUser, setToken } = useAppStore()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<Role>('student')
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', studentId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectMap: Record<Role, string> = {
    admin: '/admin', doctor: '/doctor', assistant: '/assistant', student: '/student',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.name,
          role,
          department: form.department || undefined,
          student_id: role === 'student' ? form.studentId || undefined : undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.detail || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      setToken(data.access_token)
      setUser(data.user)
      navigate(redirectMap[role], { replace: true })
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(27,60,115,0.3)_0%,transparent_60%)]" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="w-full max-w-lg relative z-10">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border border-[rgba(200,169,91,0.3)] animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                  <path d="M20 6 L23 14 L31 10 L27 18 L35 20 L27 22 L31 30 L23 26 L20 34 L17 26 L9 30 L13 22 L5 20 L13 18 L9 10 L17 14 Z" stroke="#C8A95B" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(200,169,91,0.1)" />
                  <circle cx="20" cy="20" r="5" fill="rgba(200,169,91,0.2)" stroke="#C8A95B" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            <span className="font-sora text-xl font-bold gradient-gold">Join HITU Platform</span>
          </Link>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= s ? 'bg-[#C8A95B] text-[#020817]' : 'border border-[rgba(200,169,91,0.2)] text-[#94A3B8]'}`}>{s}</div>
              {s < 2 && <div className={`h-0.5 w-16 transition-all duration-500 ${step > s ? 'bg-[#C8A95B]' : 'bg-[rgba(200,169,91,0.15)]'}`} />}
            </React.Fragment>
          ))}
        </div>

        <GlassCard className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <h2 className="font-sora text-xl font-bold text-[#F8FAFC] mb-1">Choose Your Role</h2>
                <p className="text-sm text-[#94A3B8] mb-6">Select how you'll use the HITU platform</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {roles.map((r) => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all duration-200 text-left ${role === r.id ? 'border-[rgba(200,169,91,0.4)] bg-[rgba(200,169,91,0.08)]' : 'border-[rgba(200,169,91,0.1)] hover:border-[rgba(200,169,91,0.2)]'}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${role === r.id ? 'bg-[rgba(200,169,91,0.15)]' : 'bg-[rgba(15,23,42,0.6)]'}`}>
                        <r.icon className={`w-4 h-4 ${role === r.id ? r.color : 'text-[#94A3B8]'}`} />
                      </div>
                      <div>
                        <p className={`font-semibold text-xs ${role === r.id ? 'text-[#C8A95B]' : 'text-[#F8FAFC]'}`}>{r.label}</p>
                        <p className="text-[10px] text-[#94A3B8]">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <GlowButton variant="primary" size="lg" fullWidth icon={<ChevronRight className="w-4 h-4" />} iconPosition="right" onClick={() => setStep(2)}>Continue</GlowButton>
              </motion.div>
            ) : (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="font-sora text-xl font-bold text-[#F8FAFC] mb-1">Create Your Account</h2>
                <p className="text-sm text-[#94A3B8] mb-6">Registering as <span className="text-[#C8A95B] font-semibold capitalize">{roles.find(r => r.id === role)?.label}</span></p>
                {error && (
                  <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                    <span>⚠</span><span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <GlowInput label="Full Name" type="text" placeholder="Ahmed Mohamed Hassan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} icon={<User className="w-4 h-4" />} required />
                  <GlowInput label="University Email" type="email" placeholder="you@hitu.edu.eg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} icon={<Mail className="w-4 h-4" />} required />
                  <GlowInput label="Department" type="text" placeholder="Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} icon={<BookOpen className="w-4 h-4" />} />
                  {role === 'student' && <GlowInput label="Student ID" type="text" placeholder="HITU-2024-001" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />}
                  <GlowInput label="Password" type="password" placeholder="Create a strong password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} icon={<Lock className="w-4 h-4" />} hint="Minimum 8 characters" required />
                  <div className="flex gap-3 pt-2">
                    <GlowButton variant="ghost" size="md" onClick={() => setStep(1)} type="button">Back</GlowButton>
                    <GlowButton type="submit" variant="primary" size="md" fullWidth loading={loading} magnetic icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">Create Account</GlowButton>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-center text-xs text-[#94A3B8] mt-6">Already have an account? <Link to="/login" className="text-[#C8A95B] font-semibold">Sign In</Link></p>
        </GlassCard>
      </div>
    </div>
  )
}
