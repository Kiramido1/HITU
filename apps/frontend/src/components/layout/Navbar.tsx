import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/ui/GlowButton'

const navLinks = [
  { label: 'Platform', href: '#features' },
  { label: 'AI Tools', href: '#ai' },
  { label: 'Academics', href: '#academics' },
  { label: 'About HITU', href: '#about' },
]

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { notifications, unreadCount } = useAppStore()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-500',
          scrolled
            ? 'bg-[rgba(2,8,23,0.9)] backdrop-blur-2xl border-b border-[rgba(200,169,91,0.15)] shadow-[0_4px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        )}
      >
        <div className="container-hitu">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10">
                {/* Gear ring */}
                <div className="absolute inset-0 rounded-full border border-[rgba(200,169,91,0.3)] group-hover:border-[rgba(200,169,91,0.6)] transition-colors duration-300 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
                    <path
                      d="M20 6 L23 14 L31 10 L27 18 L35 20 L27 22 L31 30 L23 26 L20 34 L17 26 L9 30 L13 22 L5 20 L13 18 L9 10 L17 14 Z"
                      stroke="#C8A95B"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      fill="rgba(200,169,91,0.08)"
                    />
                    <circle cx="20" cy="20" r="5" fill="rgba(200,169,91,0.2)" stroke="#C8A95B" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              <div>
                <span className="font-sora font-bold text-lg gradient-gold tracking-wider">HITU</span>
                <p className="text-[10px] text-[#94A3B8] tracking-widest uppercase leading-none -mt-0.5">
                  AI Platform
                </p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            {isLanding && (
              <div className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-[#94A3B8] hover:text-[#C8A95B] transition-colors duration-200 tracking-wide"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* CTA Area */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button className="relative p-2 rounded-lg text-[#94A3B8] hover:text-[#C8A95B] hover:bg-[rgba(200,169,91,0.08)] transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#C8A95B] rounded-full flex items-center justify-center text-[10px] font-bold text-[#020817]">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <GlowButton variant="ghost" size="sm">Sign In</GlowButton>
                </Link>
                <Link to="/register">
                  <GlowButton variant="primary" size="sm" magnetic>Get Started</GlowButton>
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#C8A95B] hover:bg-[rgba(200,169,91,0.08)] transition-all duration-200"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <motion.span
                    animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                    className="block h-0.5 bg-current rounded-full origin-center"
                  />
                  <motion.span
                    animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                    className="block h-0.5 bg-current rounded-full"
                  />
                  <motion.span
                    animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                    className="block h-0.5 bg-current rounded-full origin-center"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[rgba(2,8,23,0.97)] backdrop-blur-2xl border-b border-[rgba(200,169,91,0.15)] p-6 lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#94A3B8] hover:text-[#C8A95B] transition-colors py-2 border-b border-[rgba(200,169,91,0.05)]"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1">
                  <GlowButton variant="outline" fullWidth>Sign In</GlowButton>
                </Link>
                <Link to="/register" className="flex-1">
                  <GlowButton variant="primary" fullWidth>Get Started</GlowButton>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
