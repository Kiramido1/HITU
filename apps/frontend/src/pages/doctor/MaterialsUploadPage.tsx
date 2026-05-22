import React, { useRef, useState, useEffect } from 'react'
import { lmsService } from '@/services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { Upload, File, Trash2, Eye, Download, BookOpen, Plus, CheckCircle } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: string
  type: string
  course: string
  week: number
  uploadedAt: string
}

export const MaterialsUploadPage: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [courses, setCourses] = useState<Array<{ id: string; code: string; name: string }>>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')

  useEffect(() => {
    lmsService.getMyCourses().then((data) => {
      setCourses(data)
      if (data.length > 0) setSelectedCourse(data[0].id)
    }).catch(console.error)
  }, [])

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFiles = async (fileList: FileList) => {
    if (fileList.length === 0 || !selectedCourse) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('course_id', selectedCourse)
      form.append('title', fileList[0].name)
      form.append('material_type', 'lecture')
      form.append('file', fileList[0])
      await lmsService.uploadMaterial(selectedCourse, form)
      const courseCode = courses.find((c) => c.id === selectedCourse)?.code || selectedCourse
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: fileList[0].name,
        size: `${(fileList[0].size / 1024 / 1024).toFixed(1)} MB`,
        type: fileList[0].name.split('.').pop() || 'file',
        course: courseCode,
        week: files.length + 1,
        uploadedAt: new Date().toISOString().split('T')[0],
      }
      setFiles((prev) => [newFile, ...prev])
      setUploaded(true)
      setTimeout(() => setUploaded(false), 3000)
    } catch (e) {
      console.error(e)
      alert('Upload failed. Ensure you are assigned to this course.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" /> LMS — Course Materials
              </p>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Upload <span className="gradient-gold">Materials</span></h1>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Upload zone */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6">
                <h2 className="text-sm font-semibold text-[#F8FAFC] mb-4">Upload File</h2>

                {/* Course selector */}
                <div className="mb-4">
                  <label className="text-xs text-[#94A3B8] mb-2 block">Select Course</label>
                  <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] text-sm text-[#F8FAFC] px-3 focus:outline-none focus:border-[rgba(200,169,91,0.4)]">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                  </select>
                </div>

                {/* Drop zone */}
                <motion.div
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  animate={{ borderColor: isDragging ? 'rgba(200,169,91,0.6)' : 'rgba(200,169,91,0.2)' }}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragging ? 'bg-[rgba(200,169,91,0.08)]' : 'hover:bg-[rgba(200,169,91,0.04)]'}`}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx,.docx,.mp4" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />

                  <AnimatePresence mode="wait">
                    {uploading ? (
                      <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="w-12 h-12 rounded-full border-2 border-t-[#C8A95B] border-[rgba(200,169,91,0.2)] animate-spin mx-auto mb-3" />
                        <p className="text-sm text-[#94A3B8]">Uploading...</p>
                      </motion.div>
                    ) : uploaded ? (
                      <motion.div key="success" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <p className="text-sm text-emerald-400 font-semibold">Uploaded!</p>
                      </motion.div>
                    ) : (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="w-12 h-12 rounded-xl bg-[rgba(200,169,91,0.1)] border border-[rgba(200,169,91,0.2)] flex items-center justify-center mx-auto mb-3">
                          <Upload className="w-6 h-6 text-[#C8A95B]" />
                        </div>
                        <p className="text-sm font-semibold text-[#F8FAFC] mb-1">Drag & drop or click</p>
                        <p className="text-xs text-[#94A3B8]">PDF, PPT, DOCX, MP4 supported</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </GlassCard>
            </div>

            {/* Files list */}
            <div className="lg:col-span-2">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">Uploaded Materials ({files.length})</h2>
                </div>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                  {files.map((file, i) => (
                    <motion.div key={file.id} variants={staggerItem}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(200,169,91,0.08)] hover:border-[rgba(200,169,91,0.2)] transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                        <File className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F8FAFC] truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5">
                          <span className="text-[#C8A95B] font-semibold">{file.course}</span>
                          <span>•</span>
                          <span>Week {file.week}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.uploadedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg text-[#C8A95B] hover:bg-[rgba(200,169,91,0.1)] transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setFiles(p => p.filter(f => f.id !== file.id))}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
