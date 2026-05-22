import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GlowButton } from '@/components/ui/GlowButton'
import { Home, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(27,60,115,0.2)_0%,transparent_70%)]" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[rgba(200,169,91,0.04)] blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[rgba(27,60,115,0.1)] blur-3xl animate-float-slow pointer-events-none" />

      <div className="text-center relative z-10 max-w-lg">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-6"
        >
          {/* Rotating ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border border-dashed border-[rgba(200,169,91,0.2)] animate-spin-slow" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border border-[rgba(200,169,91,0.1)] animate-[spin_8s_linear_infinite_reverse]" />
          </div>

          <h1 className="font-sora font-bold text-[10rem] leading-none gradient-gold opacity-80 select-none">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(200,169,91,0.2)] bg-[rgba(200,169,91,0.05)] text-[#C8A95B] text-xs font-semibold tracking-widest uppercase mb-4">
            Page Not Found
          </div>
          <h2 className="font-sora text-2xl font-bold text-[#F8FAFC] mb-3">
            Lost in the System
          </h2>
          <p className="text-[#94A3B8] text-sm mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let the AI guide you back to safety.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <GlowButton variant="primary" size="lg" magnetic icon={<Home className="w-4 h-4" />}>
                Return Home
              </GlowButton>
            </Link>
            <button onClick={() => window.history.back()}>
              <GlowButton variant="outline" size="lg" icon={<ArrowLeft className="w-4 h-4" />}>
                Go Back
              </GlowButton>
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-[#94A3B8]/40 mt-10"
        >
          HITU AI Platform — جامعة حلوان التكنولوجية الدولية
        </motion.p>
      </div>
    </div>
  )
}
