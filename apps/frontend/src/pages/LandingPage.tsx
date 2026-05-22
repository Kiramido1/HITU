import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { HeroScene } from '@/three/HeroScene'
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/variants'
import {
  ArrowRight, Cpu, BookOpen, Calendar, Shield,
  GraduationCap, Users, Award, BarChart3, Zap,
  ChevronRight, Globe, Clock, Star
} from 'lucide-react'

const features = [
  { icon: Cpu, title: 'AI Timetable Engine', desc: 'OR-Tools CP-SAT solver generates conflict-free schedules in seconds', color: 'text-[#C8A95B]', glow: 'rgba(200,169,91,0.15)' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Separate portals for Admin, Doctor, TA, and Student roles', color: 'text-violet-400', glow: 'rgba(124,58,237,0.15)' },
  { icon: BookOpen, title: 'LMS Integration', desc: 'Upload materials, create assignments, track submissions seamlessly', color: 'text-blue-400', glow: 'rgba(59,130,246,0.15)' },
  { icon: Calendar, title: 'Smart Scheduling', desc: 'Minimize student gaps, respect availability, optimize hall usage', color: 'text-emerald-400', glow: 'rgba(16,185,129,0.15)' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time insights on courses, loads, and department metrics', color: 'text-pink-400', glow: 'rgba(236,72,153,0.15)' },
  { icon: Globe, title: 'Multi-Department', desc: 'Support unlimited departments, levels, and academic years', color: 'text-orange-400', glow: 'rgba(249,115,22,0.15)' },
]

const stats = [
  { value: '4,800+', label: 'Enrolled Students' },
  { value: '128', label: 'Active Courses' },
  { value: '0', label: 'Schedule Conflicts' },
  { value: '2.4s', label: 'AI Solve Time' },
]

const roles = [
  { role: 'Admin', icon: Shield, color: 'text-violet-400', border: 'border-violet-400/20', bg: 'bg-violet-400/5', desc: 'Full system control — semesters, halls, AI generation', href: '/register' },
  { role: 'Doctor', icon: Award, color: 'text-[#C8A95B]', border: 'border-[rgba(200,169,91,0.2)]', bg: 'bg-[rgba(200,169,91,0.05)]', desc: 'Manage courses, upload materials, create assignments', href: '/register' },
  { role: 'Teaching Assistant', icon: Cpu, color: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/5', desc: 'Handle sections, upload lab materials, guide students', href: '/register' },
  { role: 'Student', icon: GraduationCap, color: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/5', desc: 'View timetable, access materials, submit assignments', href: '/register' },
]

const timeline = [
  { year: '1975', title: 'University Founded', desc: 'HITU established as a leading engineering institution' },
  { year: '2010', title: 'Digital Transformation', desc: 'First digital academic management system launched' },
  { year: '2020', title: 'Cloud Migration', desc: 'Complete infrastructure moved to cloud platform' },
  { year: '2025', title: 'AI Platform Launch', desc: 'World-class AI-powered academic OS deployed' },
]

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020817] text-[#F8FAFC] overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 border-b border-[rgba(200,169,91,0.08)] bg-[rgba(2,8,23,0.8)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border border-[rgba(200,169,91,0.4)] animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path d="M12 3L13.8 8.4L19.2 6L16.8 11.4L22.2 12L16.8 12.6L19.2 18L13.8 15.6L12 21L10.2 15.6L4.8 18L7.2 12.6L1.8 12L7.2 11.4L4.8 6L10.2 8.4Z" stroke="#C8A95B" strokeWidth="1.2" strokeLinejoin="round" fill="rgba(200,169,91,0.1)" />
              </svg>
            </div>
          </div>
          <span className="font-sora font-bold text-xl gradient-gold">HITU</span>
          <span className="text-xs text-[#94A3B8] ml-1 hidden sm:block">AI Platform</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[#94A3B8]">
          {['Features', 'Roles', 'Timeline', 'Contact'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-[#C8A95B] transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"><GlowButton variant="ghost" size="sm">Sign In</GlowButton></Link>
          <Link to="/register"><GlowButton variant="primary" size="sm" magnetic>Get Started</GlowButton></Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,8,23,0.6)_70%)]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(200,169,91,0.3)] bg-[rgba(200,169,91,0.08)] mb-6">
              <Zap className="w-3.5 h-3.5 text-[#C8A95B]" />
              <span className="text-xs text-[#C8A95B] font-semibold">Powered by OR-Tools AI Engine</span>
            </div>
            <h1 className="font-sora text-5xl md:text-7xl font-black leading-tight mb-6">
              The Future of<br />
              <span className="gradient-gold">University AI</span>
            </h1>
            <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto mb-8 leading-relaxed">
              An enterprise-grade academic operating system with AI-powered scheduling,
              role-based portals, and integrated LMS — built for HITU.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register">
                <GlowButton variant="primary" size="lg" magnetic icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                  Enter the Platform
                </GlowButton>
              </Link>
              <Link to="/login">
                <GlowButton variant="outline" size="lg">Sign In</GlowButton>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] text-[#94A3B8]/50 uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#C8A95B] to-transparent" />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-6 border-y border-[rgba(200,169,91,0.08)]">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={i} variants={staggerItem}>
              <p className="font-sora text-4xl font-black gradient-gold mb-1">{s.value}</p>
              <p className="text-sm text-[#94A3B8]">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs text-[#C8A95B] uppercase tracking-widest mb-3">Platform Capabilities</p>
            <h2 className="font-sora text-4xl font-bold text-[#F8FAFC] mb-4">
              Everything a University Needs
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">An end-to-end academic platform built on enterprise architecture, AI intelligence, and premium UX.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <GlassCard className="p-6 h-full group hover:border-[rgba(200,169,91,0.3)] transition-all duration-300" gradient>
                  <div className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ background: f.glow, borderColor: f.glow }}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-sora font-bold text-[#F8FAFC] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI SHOWCASE ── */}
      <section className="py-24 px-6 bg-[rgba(8,18,37,0.5)]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-xs text-[#C8A95B] uppercase tracking-widest mb-3">AI Scheduling Engine</p>
            <h2 className="font-sora text-4xl font-bold text-[#F8FAFC] mb-5">
              Timetables Generated<br /><span className="gradient-gold">in Seconds</span>
            </h2>
            <p className="text-[#94A3B8] leading-relaxed mb-6">
              Our OR-Tools CP-SAT constraint solver handles thousands of variables — doctor availability,
              hall capacity, student load distribution — and returns a conflict-free schedule optimally.
            </p>
            <div className="space-y-3 mb-8">
              {['No hall double-booking', 'Doctor availability respected', 'Minimal student attendance days', 'Auto-balanced section groups'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-[10px] font-bold">✓</span>
                  </div>
                  <span className="text-sm text-[#94A3B8]">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/register">
              <GlowButton variant="primary" size="md" magnetic icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                Try AI Scheduler
              </GlowButton>
            </Link>
          </motion.div>

          {/* Live scheduler mockup */}
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-[#C8A95B]" />
                <span className="text-sm font-semibold text-[#F8FAFC]">AI Engine Live</span>
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              </div>
              {/* Fake log */}
              <div className="space-y-2 mb-4">
                {['Loading 128 courses, 47 halls...', 'Building constraint matrix (8,960 vars)...', 'Enforcing hard constraints...', 'Optimizing soft objectives...', '✓ 0 conflicts — optimal solution found!'].map((log, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                    className="flex items-start gap-2 text-xs">
                    <span className="text-[#C8A95B]">›</span>
                    <span className={log.startsWith('✓') ? 'text-emerald-400 font-semibold' : 'text-[#94A3B8]'}>{log}</span>
                  </motion.div>
                ))}
              </div>
              {/* Mini grid */}
              <div className="grid grid-cols-5 gap-1 mt-4">
                {[
                  { course: 'CS-401', color: 'bg-[rgba(200,169,91,0.2)] border-[rgba(200,169,91,0.3)]' },
                  { course: '', color: '' },
                  { course: 'MATH', color: 'bg-blue-500/10 border-blue-500/30' },
                  { course: '', color: '' },
                  { course: 'ENG-201', color: 'bg-violet-500/10 border-violet-500/30' },
                  { course: 'PHYS', color: 'bg-emerald-500/10 border-emerald-500/30' },
                  { course: 'CS-301', color: 'bg-[rgba(200,169,91,0.15)] border-[rgba(200,169,91,0.2)]' },
                  { course: '', color: '' },
                  { course: 'MATH', color: 'bg-blue-500/10 border-blue-500/30' },
                  { course: '', color: '' },
                ].map((cell, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className={`h-8 rounded text-center text-[9px] font-bold flex items-center justify-center border ${cell.course ? cell.color + ' text-[#F8FAFC]' : 'bg-[rgba(15,23,42,0.3)] border-[rgba(255,255,255,0.02)] text-transparent'}`}>
                    {cell.course || '·'}
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-[#94A3B8]">
                <span>Solve time: <span className="text-[#C8A95B] font-semibold">2.4s</span></span>
                <span>Status: <span className="text-emerald-400 font-semibold">OPTIMAL</span></span>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs text-[#C8A95B] uppercase tracking-widest mb-3">Access Control</p>
            <h2 className="font-sora text-4xl font-bold text-[#F8FAFC] mb-4">Four Roles, One Platform</h2>
            <p className="text-[#94A3B8]">Each role gets a dedicated portal tailored to their workflow.</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((r, i) => (
              <motion.div key={i} variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
                <Link to={r.href}>
                  <div className={`p-6 rounded-2xl border ${r.border} ${r.bg} hover:border-opacity-60 transition-all duration-300 cursor-pointer group h-full`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.bg} border ${r.border}`}>
                      <r.icon className={`w-6 h-6 ${r.color}`} />
                    </div>
                    <h3 className={`font-sora font-bold mb-2 ${r.color}`}>{r.role}</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{r.desc}</p>
                    <span className={`text-xs font-semibold ${r.color} flex items-center gap-1`}>
                      Get Started <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section id="timeline" className="py-24 px-6 bg-[rgba(8,18,37,0.4)]">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs text-[#C8A95B] uppercase tracking-widest mb-3">Our Journey</p>
            <h2 className="font-sora text-4xl font-bold text-[#F8FAFC]">Five Decades of Excellence</h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-[#C8A95B] via-[rgba(200,169,91,0.3)] to-transparent" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <motion.div key={i} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <GlassCard className="p-5 inline-block max-w-xs">
                      <span className="text-xs font-mono text-[#C8A95B] font-bold">{item.year}</span>
                      <h3 className="font-sora font-bold text-[#F8FAFC] mt-1 mb-1">{item.title}</h3>
                      <p className="text-xs text-[#94A3B8]">{item.desc}</p>
                    </GlassCard>
                  </div>
                  <div className="relative z-10 w-4 h-4 rounded-full bg-[#C8A95B] border-4 border-[#020817] flex-shrink-0" />
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(27,60,115,0.3)_0%,transparent_70%)]" />
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative max-w-2xl mx-auto">
          <p className="text-xs text-[#C8A95B] uppercase tracking-widest mb-4">Ready to Start?</p>
          <h2 className="font-sora text-5xl font-black text-[#F8FAFC] mb-5">
            Join <span className="gradient-gold">HITU</span> Today
          </h2>
          <p className="text-[#94A3B8] mb-8">Experience the world's most advanced university platform. AI-powered, enterprise-ready, future-proof.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register"><GlowButton variant="primary" size="lg" magnetic icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">Create Account</GlowButton></Link>
            <Link to="/login"><GlowButton variant="outline" size="lg">Sign In</GlowButton></Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(200,169,91,0.08)] py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
              <path d="M12 3L13.8 8.4L19.2 6L16.8 11.4L22.2 12L16.8 12.6L19.2 18L13.8 15.6L12 21L10.2 15.6L4.8 18L7.2 12.6L1.8 12L7.2 11.4L4.8 6L10.2 8.4Z" stroke="#C8A95B" strokeWidth="1.2" strokeLinejoin="round" fill="rgba(200,169,91,0.1)" />
            </svg>
            <span className="font-sora font-bold gradient-gold">HITU Platform</span>
            <span className="text-[10px] text-[#94A3B8]/50 ml-2">v1.0</span>
          </div>
          <p className="text-xs text-[#94A3B8]/50 text-center">
            © {new Date().getFullYear()} Helwan International Technological University. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  )
}
