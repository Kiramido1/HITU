import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlowInput } from '@/components/ui/GlowInput'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email.')
      return
    }
    setLoading(true)
    setError('')

    try {
      // Dummy API call since there is no endpoint yet
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
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
            </div>
          </Link>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <GlassCard className="p-8" glow>
            <motion.div variants={staggerItem} className="mb-8 text-center">
              <h1 className="font-sora text-2xl font-bold text-[#F8FAFC] mb-2">Reset Password</h1>
              <p className="text-sm text-[#94A3B8]">Enter your email to receive reset instructions</p>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 p-6 rounded-xl bg-green-500/10 border border-green-500/25 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
                <div>
                  <h3 className="text-green-400 font-semibold mb-1">Check your email</h3>
                  <p className="text-sm text-[#94A3B8]">We've sent password reset instructions to {email}</p>
                </div>
                <GlowButton onClick={() => window.location.href = '/login'} variant="outline" className="w-full mt-2">
                  Return to Login
                </GlowButton>
              </motion.div>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                <motion.div variants={staggerItem}>
                  <GlowInput
                    label="University Email"
                    type="email"
                    placeholder="student@hitu.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-4 h-4" />}
                    required
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <GlowButton type="submit" variant="primary" size="lg" fullWidth loading={loading}
                    magnetic icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                    Send Reset Link
                  </GlowButton>
                </motion.div>
              </form>
            )}

            {!success && (
              <motion.p variants={staggerItem} className="text-center text-xs text-[#94A3B8] mt-6">
                Remembered your password?{' '}
                <Link to="/login" className="text-[#C8A95B] hover:text-[#E4C98A] font-semibold transition-colors">
                  Sign In
                </Link>
              </motion.p>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
