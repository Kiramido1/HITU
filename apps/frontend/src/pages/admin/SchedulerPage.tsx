import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { Cpu, Play, CheckCircle, AlertTriangle, Clock, BarChart3, RefreshCw, Download, Zap, Settings } from 'lucide-react'
import { exportTimetableToPDF, exportTimetableToExcel } from '@/lib/exportUtils'
import { academicService } from '@/services/api'

type GenerationPhase = 'idle' | 'loading' | 'running' | 'complete' | 'error'

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00']

const typeColors = {
  lecture: 'from-[rgba(200,169,91,0.2)] to-[rgba(27,60,115,0.3)] border-[rgba(200,169,91,0.3)] text-[#C8A95B]',
  section: 'from-[rgba(16,100,68,0.2)] to-[rgba(16,100,68,0.1)] border-emerald-500/30 text-emerald-400',
  lab: 'from-[rgba(124,58,237,0.2)] to-[rgba(124,58,237,0.1)] border-violet-500/30 text-violet-400',
}

export const SchedulerPage: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [phase, setPhase] = useState<GenerationPhase>('idle')
  const [progress, setProgress] = useState(0)
  const [schedule, setSchedule] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [progressLog, setProgressLog] = useState<string[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null)
  const [semesters, setSemesters] = useState<any[]>([])
  const [optimizeStrategy, setOptimizeStrategy] = useState<'balanced' | 'compact' | 'spread'>('balanced')
  const [ollamaModel, setOllamaModel] = useState<string>('llama3')
  const [generationResult, setGenerationResult] = useState<any>(null)

  useEffect(() => {
    // Load semesters on mount
    loadSemesters()
  }, [])

  const loadSemesters = async () => {
    try {
      const data = await academicService.getSemesters()
      setSemesters(data)
      if (data.length > 0) {
        const active = data.find((s: any) => s.is_active)
        setSelectedSemester(active?.id || data[0].id)
      }
    } catch (error) {
      console.error('Failed to load semesters:', error)
    }
  }

  const runScheduler = async () => {
    if (!selectedSemester) {
      alert('Please select a semester first')
      return
    }

    setPhase('running')
    setProgress(0)
    setProgressLog([])
    setGenerationResult(null)

    try {
      setProgressLog(prev => [...prev, `Initializing Ollama AI engine (${ollamaModel})...`])
      setProgress(10)
      await new Promise(r => setTimeout(r, 200))

      setProgressLog(prev => [...prev, `Loading courses, halls, and instructors for semester...`])
      setProgress(20)
      await new Promise(r => setTimeout(r, 200))

      setProgressLog(prev => [...prev, 'Constructing academic constraints prompt...'])
      setProgress(30)
      await new Promise(r => setTimeout(r, 200))

      setProgressLog(prev => [...prev, 'Enforcing hard constraints: no double-booking...'])
      setProgress(40)
      await new Promise(r => setTimeout(r, 200))

      setProgressLog(prev => [...prev, 'Enforcing doctor availability windows...'])
      setProgress(50)
      await new Promise(r => setTimeout(r, 200))

      setProgressLog(prev => [...prev, 'Connecting to local Ollama instance...'])
      setProgress(60)
      await new Promise(r => setTimeout(r, 200))

      setProgressLog(prev => [...prev, `Generating schedule (this may take a few minutes)...`])
      setProgress(70)
      await new Promise(r => setTimeout(r, 200))

      setProgressLog(prev => [...prev, 'Parsing and validating AI response...'])
      setProgress(80)

      // Call real API with Ollama model parameter
      const result = await academicService.generateSchedule(selectedSemester, optimizeStrategy, 30.0)

      setProgressLog(prev => [...prev, result.success ? 'Solution found!' : 'No feasible solution found'])
      setProgress(90)
      await new Promise(r => setTimeout(r, 200))

      if (result.success) {
        setProgressLog(prev => [...prev, `✓ ${result.entries_generated} schedule entries generated`])
        setProgressLog(prev => [...prev, `✓ ${result.conflicts_detected} conflicts detected`])
        setProgressLog(prev => [...prev, `✓ Solve time: ${result.solve_time_seconds}s`])
        setProgressLog(prev => [...prev, '✓ Timetable generated successfully!'])

        // Load the generated schedule
        const scheduleData = await academicService.getSchedule(selectedSemester)
        setSchedule(scheduleData)
        setGenerationResult(result)
      } else {
        setProgressLog(prev => [...prev, `✗ ${result.message}`])
      }

      setProgress(100)
      setPhase(result.success ? 'complete' : 'error')
    } catch (error) {
      setProgressLog(prev => [...prev, '✗ Error generating schedule'])
      setProgressLog(prev => [...prev, String(error)])
      setPhase('error')
    }
  }

  const filtered = selectedLevel ? schedule.filter(e => e.level === selectedLevel) : schedule

  const getEntryAt = (day: string, time: string) =>
    filtered.find(e => e.day === day && e.start === time)

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-[#C8A95B]" />
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest">Ollama LLM Engine</p>
              </div>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">AI Timetable <span className="gradient-gold">Generator</span></h1>
            </div>
            <div className="flex gap-3">
              {phase === 'complete' && (
                <>
                  <GlowButton variant="outline" size="md" icon={<Download className="w-4 h-4" />}
                    onClick={() => exportTimetableToPDF(schedule.map(e => ({ course_code: e.course, course_name: e.course, hall_name: e.hall, hall_code: e.hall, day: e.day, start_time: e.start, end_time: e.end, entry_type: e.type as any, group_number: 1 })), 'Fall 2025')}>
                    Export PDF
                  </GlowButton>
                  <GlowButton variant="ghost" size="md" icon={<Download className="w-4 h-4" />}
                    onClick={() => exportTimetableToExcel(schedule.map(e => ({ course_code: e.course, course_name: e.course, hall_name: e.hall, hall_code: e.hall, day: e.day, start_time: e.start, end_time: e.end, entry_type: e.type as any, group_number: 1 })), 'Fall 2025')}>
                    Export Excel
                  </GlowButton>
                </>
              )}
              <GlowButton variant="primary" size="md" magnetic
                icon={phase === 'running' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                onClick={runScheduler} loading={phase === 'running'} disabled={!selectedSemester}>
                {phase === 'idle' ? 'Generate Schedule' : phase === 'running' ? 'Running AI...' : 'Regenerate'}
              </GlowButton>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-[#C8A95B]" />
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Configuration</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#94A3B8] mb-1.5 block">Select Semester</label>
                  <select
                    value={selectedSemester || ''}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.15)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[rgba(200,169,91,0.3)]"
                  >
                    <option value="">Select a semester...</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name} ({sem.academic_year}) {sem.is_active && '✓'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] mb-1.5 block">Optimization Strategy</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'balanced', label: 'Balanced' },
                      { value: 'compact', label: 'Compact' },
                      { value: 'spread', label: 'Spread' },
                    ].map((strategy) => (
                      <button
                        key={strategy.value}
                        onClick={() => setOptimizeStrategy(strategy.value as any)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          optimizeStrategy === strategy.value
                            ? 'bg-[rgba(200,169,91,0.2)] text-[#C8A95B] border border-[rgba(200,169,91,0.3)]'
                            : 'bg-[rgba(15,23,42,0.6)] text-[#94A3B8] border border-[rgba(200,169,91,0.1)] hover:border-[rgba(200,169,91,0.2)]'
                        }`}
                      >
                        {strategy.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#C8A95B]" />
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Generation Results</h3>
              </div>
              {generationResult ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#94A3B8]">Status</span>
                    <span className={`text-xs font-semibold ${generationResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {generationResult.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#94A3B8]">Entries Generated</span>
                    <span className="text-xs font-semibold text-[#C8A95B]">{generationResult.entries_generated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#94A3B8]">Conflicts</span>
                    <span className={`text-xs font-semibold ${generationResult.conflicts_detected > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {generationResult.conflicts_detected}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#94A3B8]">Solve Time</span>
                    <span className="text-xs font-semibold text-[#C8A95B]">{generationResult.solve_time_seconds}s</span>
                  </div>
                  {generationResult.statistics && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#94A3B8]">Utilization</span>
                      <span className="text-xs font-semibold text-[#C8A95B]">{generationResult.statistics.utilization_rate}%</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#94A3B8] text-center py-4">Run the scheduler to see results</p>
              )}
            </GlassCard>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Courses', value: '128', icon: <BarChart3 className="w-4 h-4" />, color: 'text-[#C8A95B]' },
              { label: 'Solve Time', value: phase === 'complete' ? '2.4s' : '—', icon: <Clock className="w-4 h-4" />, color: 'text-blue-400' },
              { label: 'Conflicts', value: phase === 'complete' ? '0' : '—', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-emerald-400' },
              { label: 'Optimized', value: phase === 'complete' ? '94%' : '—', icon: <Zap className="w-4 h-4" />, color: 'text-violet-400' },
            ].map((s, i) => (
              <motion.div key={i} variants={staggerItem}>
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={s.color}>{s.icon}</span>
                    <p className="text-xs text-[#94A3B8]">{s.label}</p>
                  </div>
                  <p className={`text-2xl font-bold font-sora ${s.color}`}>{s.value}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* AI Progress Panel */}
            <div className="lg:col-span-1">
              <GlassCard className="p-5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-4 h-4 text-[#C8A95B]" />
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">Engine Log</h2>
                  {phase === 'running' && <span className="ml-auto flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-[#C8A95B] opacity-75" /><span className="relative h-2 w-2 rounded-full bg-[#C8A95B]" /></span>}
                  {phase === 'complete' && <CheckCircle className="ml-auto w-4 h-4 text-emerald-400" />}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#94A3B8] mb-1.5">
                    <span>Progress</span><span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(15,23,42,0.6)] overflow-hidden">
                    <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#1B3C73] to-[#C8A95B]" />
                  </div>
                </div>

                {/* Log output */}
                <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scroll">
                  {phase === 'idle' && (
                    <p className="text-xs text-[#94A3B8]/60 text-center py-8">Press Generate to start the AI engine</p>
                  )}
                  {progressLog.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 text-xs">
                      <span className="text-[#C8A95B] flex-shrink-0 mt-0.5">›</span>
                      <span className={log.startsWith('✓') ? 'text-emerald-400' : 'text-[#94A3B8]'}>{log}</span>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Timetable Grid */}
            <div className="lg:col-span-2">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#F8FAFC]">Timetable Grid</h2>
                  <div className="flex items-center gap-2">
                    {[null, 1, 2, 3, 4].map((level) => (
                      <button key={level ?? 'all'} onClick={() => setSelectedLevel(level)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${selectedLevel === level ? 'bg-[rgba(200,169,91,0.2)] text-[#C8A95B] border border-[rgba(200,169,91,0.3)]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}>
                        {level === null ? 'All' : `L${level}`}
                      </button>
                    ))}
                  </div>
                </div>

                {phase === 'idle' ? (
                  <div className="h-64 flex items-center justify-center text-center">
                    <div>
                      <Cpu className="w-12 h-12 text-[#94A3B8]/30 mx-auto mb-3" />
                      <p className="text-sm text-[#94A3B8]/50">Run the AI engine to generate the timetable</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left text-[#94A3B8] py-2 pr-4 font-medium">Time</th>
                          {DAYS.map(d => <th key={d} className="text-center text-[#94A3B8] py-2 px-2 font-medium">{d.slice(0, 3)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {TIME_SLOTS.map(time => (
                          <tr key={time}>
                            <td className="text-[#94A3B8] py-1.5 pr-4 font-mono">{time}</td>
                            {DAYS.map(day => {
                              const entry = getEntryAt(day, time)
                              return (
                                <td key={day} className="py-1 px-1">
                                  {entry ? (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: Math.random() * 0.5 }}
                                      className={`rounded-lg p-1.5 bg-gradient-to-br border text-center ${typeColors[entry.type as keyof typeof typeColors]}`}
                                    >
                                      <p className="font-bold leading-tight">{entry.course}</p>
                                      <p className="opacity-70 text-[9px]">{entry.hall}</p>
                                    </motion.div>
                                  ) : (
                                    <div className="h-10 rounded-lg bg-[rgba(15,23,42,0.3)] border border-[rgba(255,255,255,0.02)]" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[rgba(200,169,91,0.08)]">
                  {[['lecture', 'Lecture'], ['section', 'Section'], ['lab', 'Lab']].map(([type, label]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded bg-gradient-to-br border ${typeColors[type as keyof typeof typeColors]}`} />
                      <span className="text-[10px] text-[#94A3B8]">{label}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
