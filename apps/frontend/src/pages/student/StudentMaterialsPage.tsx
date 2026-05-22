import React, { useState, useEffect } from 'react'
import { lmsService } from '@/services/api'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { BookOpen, Download, File, Search, Filter, Eye, Calendar } from 'lucide-react'

interface Material {
  id: string
  title: string
  course: string
  course_name: string
  type: 'pdf' | 'video' | 'link' | 'ppt'
  week: number
  size: string
  uploadedBy: string
  uploadedAt: string
  url: string
}

const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  pdf: { label: 'PDF', icon: '📄', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  ppt: { label: 'Slides', icon: '📊', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  video: { label: 'Video', icon: '🎬', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  link: { label: 'Link', icon: '🔗', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
}

export const StudentMaterialsPage: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [materials, setMaterials] = useState<Material[]>([])
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('All Courses')
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  useEffect(() => {
    lmsService.getMyMaterials()
      .then((data: Array<Record<string, unknown>>) => {
        setMaterials(data.map((m) => ({
          id: String(m.id),
          title: String(m.title),
          course: String(m.course_id || ''),
          course_name: String(m.title),
          type: (String(m.material_type || 'pdf') as Material['type']),
          week: Number(m.week_number || 1),
          size: m.file_size ? `${Math.round(Number(m.file_size) / 1024)} KB` : '—',
          uploadedBy: 'Faculty',
          uploadedAt: String(m.created_at || '').slice(0, 10),
          url: m.file_url ? `/uploads/${m.file_url}` : '#',
        })))
      })
      .catch(console.error)
  }, [])

  const courses = ['All Courses', ...new Set(materials.map((m) => m.course).filter(Boolean))]

  const filtered = materials.filter(m =>
    (selectedCourse === 'All Courses' || m.course === selectedCourse) &&
    (!selectedWeek || m.week === selectedWeek) &&
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  const weeks = [...new Set(materials.map(m => m.week))].sort()

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
            <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> LMS — Course Materials
            </p>
            <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Study <span className="gradient-gold">Materials</span></h1>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..."
                className="w-full pl-10 pr-4 h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[rgba(200,169,91,0.4)]" />
            </div>

            {/* Course filter */}
            <div className="flex gap-2">
              {courses.map(c => (
                <button key={c} onClick={() => setSelectedCourse(c)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${selectedCourse === c ? 'bg-[rgba(200,169,91,0.15)] text-[#C8A95B] border border-[rgba(200,169,91,0.3)]' : 'bg-[rgba(15,23,42,0.5)] text-[#94A3B8] border border-[rgba(200,169,91,0.08)] hover:border-[rgba(200,169,91,0.2)]'}`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Week filter */}
            <div className="flex gap-2">
              <button onClick={() => setSelectedWeek(null)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${!selectedWeek ? 'bg-[rgba(200,169,91,0.15)] text-[#C8A95B] border border-[rgba(200,169,91,0.3)]' : 'bg-[rgba(15,23,42,0.5)] text-[#94A3B8] border border-[rgba(200,169,91,0.08)]'}`}>
                All Weeks
              </button>
              {weeks.map(w => (
                <button key={w} onClick={() => setSelectedWeek(w)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${selectedWeek === w ? 'bg-[rgba(200,169,91,0.15)] text-[#C8A95B] border border-[rgba(200,169,91,0.3)]' : 'bg-[rgba(15,23,42,0.5)] text-[#94A3B8] border border-[rgba(200,169,91,0.08)]'}`}>
                  Wk {w}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-xs text-[#94A3B8] mb-4">{filtered.length} file{filtered.length !== 1 ? 's' : ''} found</p>

          {/* Materials grid */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((material, i) => {
              const cfg = typeConfig[material.type]
              return (
                <motion.div key={material.id} variants={staggerItem}>
                  <GlassCard className="p-5 group hover:border-[rgba(200,169,91,0.3)] transition-all duration-200">
                    {/* Top row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${cfg.bg}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#F8FAFC] leading-snug line-clamp-2">{material.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-mono font-bold text-[#C8A95B]">{material.course}</span>
                          <span className="text-[#94A3B8]/40">•</span>
                          <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[10px] text-[#94A3B8] mb-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Week {material.week}</span>
                      <span>•</span>
                      <span>{material.size}</span>
                      <span>•</span>
                      <span>{material.uploadedAt}</span>
                    </div>

                    <p className="text-[10px] text-[#94A3B8]/60 mb-3">{material.uploadedBy}</p>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GlowButton variant="outline" size="sm" fullWidth icon={<Eye className="w-3.5 h-3.5" />}>Preview</GlowButton>
                      <GlowButton variant="primary" size="sm" fullWidth icon={<Download className="w-3.5 h-3.5" />}>Download</GlowButton>
                    </div>
                    <div className="flex gap-2 group-hover:hidden">
                      <div className="flex-1 h-8 rounded-lg bg-[rgba(15,23,42,0.3)]" />
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}

            {filtered.length === 0 && (
              <div className="col-span-3 py-16 text-center">
                <File className="w-10 h-10 text-[#94A3B8]/30 mx-auto mb-3" />
                <p className="text-sm text-[#94A3B8]/50">No materials found matching your filters</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
