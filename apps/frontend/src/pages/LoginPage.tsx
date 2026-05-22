import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowInput } from '@/components/ui/GlowInput'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { Eye, EyeOff, Mail, ArrowRight, AlertCircle } from 'lucide-react'

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  doctor: '/doctor',
  assistant: '/assistant',
  student: '/student',
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setUser, setToken, isAuthenticated, user } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect already-authenticated users immediately
  if (isAuthenticated && user) {
    navigate(ROLE_HOME[user.role] || '/', { replace: true })
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')

    try {
      // Backend LoginRequest expects JSON {email, password}
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.detail || 'Invalid university email or password.')
        setLoading(false)
        return
      }

      // Token response already contains the full user object — no second /me call needed
      const token = data.access_token
      const userData = data.user

      setToken(token)
      setUser(userData)
      navigate(ROLE_HOME[userData.role] || '/', { replace: true })
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(27,60,115,0.3)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(200,169,91,0.08)_0%,transparent_60%)]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border border-[rgba(200,169,91,0.3)] animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                  <path d="M20 6 L23 14 L31 10 L27 18 L35 20 L27 22 L31 30 L23 26 L20 34 L17 26 L9 30 L13 22 L5 20 L13 18 L9 10 L17 14 Z"
                    stroke="#C8A95B" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(200,169,91,0.1)" />
                  <circle cx="20" cy="20" r="5" fill="rgba(200,169,91,0.2)" stroke="#C8A95B" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-sora text-2xl font-bold gradient-gold tracking-wider">HITU</span>
              <p className="text-xs text-[#94A3B8] tracking-widest uppercase">University Platform</p>
            </div>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <GlassCard className="p-8" glow>
            <motion.div variants={staggerItem} className="mb-8">
              <h1 className="font-sora text-2xl font-bold text-[#F8FAFC] mb-1">Welcome Back</h1>
              <p className="text-sm text-[#94A3B8]">Sign in to your HITU account</p>
            </motion.div>

            {/* Error banner */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div variants={staggerItem}>
                <GlowInput
                  label="University Email"
                  type="email"
                  placeholder="admin@hitu.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
              </motion.div>

              <motion.div variants={staggerItem}>
                <GlowInput
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={
                    <button type="button" onClick={() => setShowPass(!showPass)} className="focus:outline-none">
                      {showPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  }
                  iconPosition="right"
                  required
                />
                <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" className="text-xs text-[#94A3B8] hover:text-[#C8A95B] transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <GlowButton type="submit" variant="primary" size="lg" fullWidth loading={loading}
                  magnetic icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Sign In to HITU
                </GlowButton>
              </motion.div>
            </form>

            {/* Quick test accounts */}
            <motion.div variants={staggerItem} className="mt-6 p-4 rounded-xl bg-[rgba(200,169,91,0.05)] border border-[rgba(200,169,91,0.15)]">
              <p className="text-xs text-[#C8A95B] font-semibold mb-2 uppercase tracking-wide">Test Accounts</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { role: 'Admin', email: 'admin@hitu.edu', pass: 'Admin@1234' },
                  { role: 'Doctor', email: 'doctor@hitu.edu', pass: 'Doctor@1234' },
                  { role: 'Assistant', email: 'assistant@hitu.edu', pass: 'Assist@1234' },
                  { role: 'Student', email: 'student@hitu.edu', pass: 'Student@1234' },
                ].map(({ role, email: e, pass }) => (
                  <button key={role} type="button"
                    onClick={() => { setEmail(e); setPassword(pass); setError('') }}
                    className="text-left px-2 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-[#C8A95B] hover:bg-[rgba(200,169,91,0.08)] transition-colors">
                    <span className="font-semibold text-[#F8FAFC]">{role}</span>
                    <span className="block text-[10px] opacity-60">{e}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.p variants={staggerItem} className="text-center text-xs text-[#94A3B8] mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#C8A95B] hover:text-[#E4C98A] font-semibold transition-colors">
                Create Account
              </Link>
            </motion.p>
          </GlassCard>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-center text-xs text-[#94A3B8]/50 mt-6">
          جامعة حلوان التكنولوجية الدولية • Helwan Int'l Technological University
        </motion.p>
      </div>
    </div>
  )
}
