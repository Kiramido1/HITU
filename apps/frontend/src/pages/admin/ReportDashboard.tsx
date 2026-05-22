import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store'
import { fadeInUp, staggerContainer, staggerItem } from '@/animations/variants'
import { Download, FileText, BarChart3, Database, FileSpreadsheet } from 'lucide-react'
import { exportTimetableToPDF, exportTimetableToExcel } from '@/lib/exportUtils'

const reportTypes = [
  { id: 'semester_overview', name: 'Semester Overview Report', description: 'Comprehensive summary of active courses, enrollments, and staff allocations.', icon: <FileText className="w-5 h-5 text-blue-400" /> },
  { id: 'hall_utilization', name: 'Hall Utilization Analysis', description: 'Detailed breakdown of hall usage, capacity efficiency, and peak hours.', icon: <BarChart3 className="w-5 h-5 text-purple-400" /> },
  { id: 'doctor_workload', name: 'Doctor Workload Summary', description: 'Total assigned hours, course distribution, and section mapping per faculty member.', icon: <Database className="w-5 h-5 text-emerald-400" /> },
  { id: 'master_schedule', name: 'Master AI Schedule', description: 'The complete generated timetable for the entire university, formatted for printing.', icon: <FileSpreadsheet className="w-5 h-5 text-[#C8A95B]" /> },
]

export const ReportDashboard: React.FC = () => {
  const { sidebarCollapsed } = useAppStore()
  const [loadingReport, setLoadingReport] = useState<string | null>(null)

  const handleExportPDF = async (reportId: string) => {
    setLoadingReport(`${reportId}-pdf`)
    try {
      // Simulate report generation delay
      await new Promise(r => setTimeout(r, 1500))
      // Mock schedule data for export to satisfy the utility
      const mockData = [{ course_code: 'CS101', course_name: 'Intro to CS', hall_name: 'Main Hall', hall_code: 'MH1', day: 'Saturday', start_time: '08:00', end_time: '10:00', entry_type: 'lecture' as any, group_number: 1 }]
      exportTimetableToPDF(mockData, `Report_${reportId}`)
    } finally {
      setLoadingReport(null)
    }
  }

  const handleExportExcel = async (reportId: string) => {
    setLoadingReport(`${reportId}-excel`)
    try {
      await new Promise(r => setTimeout(r, 1500))
      const mockData = [{ course_code: 'CS101', course_name: 'Intro to CS', hall_name: 'Main Hall', hall_code: 'MH1', day: 'Saturday', start_time: '08:00', end_time: '10:00', entry_type: 'lecture' as any, group_number: 1 }]
      exportTimetableToExcel(mockData, `Report_${reportId}`)
    } finally {
      setLoadingReport(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <div className="p-6 lg:p-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-[#C8A95B]" />
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest">Data & Analytics</p>
              </div>
              <h1 className="font-sora text-3xl font-bold text-[#F8FAFC]">Export <span className="gradient-gold">Center</span></h1>
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => (
              <motion.div key={report.id} variants={staggerItem}>
                <GlassCard className="p-6 h-full flex flex-col hover:border-[rgba(200,169,91,0.3)] transition-colors duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center flex-shrink-0">
                      {report.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#F8FAFC] text-lg">{report.name}</h3>
                      <p className="text-sm text-[#94A3B8] mt-1">{report.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-[rgba(200,169,91,0.1)] flex gap-3">
                    <GlowButton
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => handleExportPDF(report.id)}
                      loading={loadingReport === `${report.id}-pdf`}
                      icon={<FileText className="w-4 h-4" />}
                    >
                      Export PDF
                    </GlowButton>
                    <GlowButton
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => handleExportExcel(report.id)}
                      loading={loadingReport === `${report.id}-excel`}
                      icon={<FileSpreadsheet className="w-4 h-4" />}
                    >
                      Export Excel
                    </GlowButton>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
