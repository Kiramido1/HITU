import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store'
import {
  LayoutDashboard, BookOpen, Calendar, Users, Building, Layers,
  Cpu, FileText, Upload, GraduationCap, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, Shield, Award, Cpu as TA, Clock
} from 'lucide-react'

type NavItem = { label: string; href: string; icon: React.ElementType; badge?: number }

const navByRole: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Semesters', href: '/admin/semesters', icon: Calendar },
    { label: 'Departments', href: '/admin/departments', icon: Layers },
    { label: 'Courses', href: '/admin/courses', icon: BookOpen },
    { label: 'Halls', href: '/admin/halls', icon: Building },
    { label: 'Doctors', href: '/admin/doctors', icon: Users },
    { label: 'Assistants', href: '/admin/assistants', icon: TA },
    { label: 'Students', href: '/admin/students', icon: GraduationCap },
    { label: 'AI Scheduler', href: '/admin/scheduler', icon: Cpu, badge: 1 },
    { label: 'Reports', href: '/admin/reports', icon: FileText },
  ],
  doctor: [
    { label: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { label: 'Assignments', href: '/doctor/assignments', icon: FileText },
    { label: 'Materials', href: '/doctor/materials', icon: Upload },
    { label: 'Availability', href: '/doctor/availability', icon: Clock },
    { label: 'Schedule', href: '/timetable', icon: Calendar },
  ],
  assistant: [
    { label: 'Dashboard', href: '/assistant', icon: LayoutDashboard },
    { label: 'Materials', href: '/assistant/materials', icon: Upload },
    { label: 'Availability', href: '/assistant/availability', icon: Clock },
    { label: 'Schedule', href: '/timetable', icon: Calendar },
  ],
  student: [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'Assignments', href: '/student/assignments', icon: FileText, badge: 2 },
    { label: 'Materials', href: '/student/materials', icon: Upload },
    { label: 'Schedule', href: '/timetable', icon: Calendar },
  ],
}

const roleIcons: Record<string, React.ElementType> = {
  admin: Shield,
  doctor: Award,
  assistant: TA,
  student: GraduationCap,
}

const roleColors: Record<string, string> = {
  admin: 'text-violet-400',
  doctor: 'text-[#C8A95B]',
  assistant: 'text-emerald-400',
  student: 'text-blue-400',
}

export const Sidebar: React.FC = () => {
  const { user, logout, sidebarCollapsed, toggleSidebar } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()
  const role = user?.role ?? 'student'
  const navItems = navByRole[role] ?? navByRole.student
  const RoleIcon = roleIcons[role]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 h-screen z-40 bg-[rgba(8,18,37,0.97)] backdrop-blur-xl border-r border-[rgba(200,169,91,0.1)] flex flex-col overflow-hidden"
    >
      {/* Top: Logo + toggle */}
      <div className={`flex items-center h-16 border-b border-[rgba(200,169,91,0.08)] flex-shrink-0 ${sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
        {!sidebarCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-full border border-[rgba(200,169,91,0.4)] animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                  <path d="M10 3 L11.5 7 L15.5 5 L13.5 9 L17.5 10 L13.5 11 L15.5 15 L11.5 13 L10 17 L8.5 13 L4.5 15 L6.5 11 L2.5 10 L6.5 9 L4.5 5 L8.5 7 Z" stroke="#C8A95B" strokeWidth="1" strokeLinejoin="round" fill="rgba(200,169,91,0.15)" />
                </svg>
              </div>
            </div>
            <span className="font-sora font-bold gradient-gold text-lg">HITU</span>
          </motion.div>
        )}
        <button onClick={toggleSidebar}
          className="w-7 h-7 rounded-lg border border-[rgba(200,169,91,0.15)] bg-[rgba(15,23,42,0.5)] flex items-center justify-center text-[#94A3B8] hover:text-[#C8A95B] hover:border-[rgba(200,169,91,0.3)] transition-all duration-200">
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Role badge */}
      {!sidebarCollapsed && user && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mx-3 my-3 p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(200,169,91,0.08)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A95B] to-[#1B3C73] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F8FAFC] truncate">{user.full_name}</p>
              <div className="flex items-center gap-1">
                <RoleIcon className={`w-3 h-3 ${roleColors[role]}`} />
                <p className={`text-[10px] font-semibold capitalize ${roleColors[role]}`}>{role}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link key={item.href} to={item.href}>
              <motion.div whileHover={{ x: sidebarCollapsed ? 0 : 4 }} transition={{ duration: 0.15 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-[rgba(200,169,91,0.12)] text-[#C8A95B] border border-[rgba(200,169,91,0.25)]'
                    : 'text-[#94A3B8] hover:bg-[rgba(200,169,91,0.05)] hover:text-[#F8FAFC]'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}>
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-[#C8A95B]" />
                )}
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium flex-1">{item.label}</motion.span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span className="w-5 h-5 rounded-full bg-[#C8A95B] text-[#020817] text-[10px] font-bold flex items-center justify-center">{item.badge}</span>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[rgba(8,18,37,0.95)] border border-[rgba(200,169,91,0.2)] rounded-lg text-xs text-[#F8FAFC] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className={`border-t border-[rgba(200,169,91,0.08)] px-2 py-3 space-y-1 flex-shrink-0 ${sidebarCollapsed ? '' : ''}`}>
        <Link to="/settings" className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[rgba(200,169,91,0.05)] transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm">Settings</span>}
        </Link>
        <Link to="/notifications" className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[rgba(200,169,91,0.05)] transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <Bell className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm">Notifications</span>}
        </Link>
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  )
}
