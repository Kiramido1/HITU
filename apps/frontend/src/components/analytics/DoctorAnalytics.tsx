import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, BookOpen, TrendingUp, Award, Calendar } from 'lucide-react';
import { AnalyticsChart } from '../charts/AnalyticsChart';

interface DoctorStats {
  id: string;
  name: string;
  email: string;
  department: string;
  totalCourses: number;
  totalHours: number;
  averageDailyLoad: number;
  peakDay: string;
  scheduleQuality: number;
  studentCount: number;
  preferredSlots: string[];
}

interface DoctorAnalyticsProps {
  doctors: DoctorStats[];
  selectedDoctor?: string;
  onDoctorSelect?: (doctorId: string) => void;
}

export const DoctorAnalytics: React.FC<DoctorAnalyticsProps> = ({
  doctors,
  selectedDoctor,
  onDoctorSelect,
}) => {
  const selectedDoc = useMemo(() => {
    return doctors.find(d => d.id === selectedDoctor) || doctors[0];
  }, [doctors, selectedDoctor]);

  const workloadDistributionData = useMemo(() => {
    return doctors.map(doc => ({
      name: doc.name.split(' ')[0],
      hours: doc.totalHours,
      courses: doc.totalCourses,
    }));
  }, [doctors]);

  const qualityData = useMemo(() => {
    return doctors.map(doc => ({
      name: doc.name.split(' ')[0],
      quality: doc.scheduleQuality,
    }));
  }, [doctors]);

  const departmentData = useMemo(() => {
    const deptMap = new Map();
    doctors.forEach(doc => {
      if (!deptMap.has(doc.department)) {
        deptMap.set(doc.department, { totalDoctors: 0, totalHours: 0, totalCourses: 0 });
      }
      const data = deptMap.get(doc.department);
      data.totalDoctors++;
      data.totalHours += doc.totalHours;
      data.totalCourses += doc.totalCourses;
    });
    return Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      doctors: data.totalDoctors,
      hours: data.totalHours,
      courses: data.totalCourses,
    }));
  }, [doctors]);

  const peakDayData = useMemo(() => {
    const dayMap = new Map();
    doctors.forEach(doc => {
      dayMap.set(doc.peakDay, (dayMap.get(doc.peakDay) || 0) + 1);
    });
    return Array.from(dayMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [doctors]);

  return (
    <div className="space-y-6">
      {/* Doctor Selector */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
        <User className="w-6 h-6 text-amber-400" />
        <select
          value={selectedDoctor || doctors[0]?.id}
          onChange={(e) => onDoctorSelect?.(e.target.value)}
          className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
        >
          {doctors.map(doc => (
            <option key={doc.id} value={doc.id}>
              {doc.name} - {doc.department}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Doctor Overview */}
      {selectedDoc && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Total Courses</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedDoc.totalCourses}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-400 text-sm">Total Hours</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedDoc.totalHours}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-slate-400 text-sm">Daily Load</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedDoc.averageDailyLoad.toFixed(1)}h</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-xl border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-slate-400 text-sm">Quality Score</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedDoc.scheduleQuality.toFixed(0)}%</p>
          </div>
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Distribution */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Workload Distribution</h3>
          <AnalyticsChart
            type="bar"
            data={workloadDistributionData}
            title="Teaching Hours per Doctor"
            dataKey="hours"
            xAxisKey="name"
            colors={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']}
            height={250}
          />
        </div>

        {/* Schedule Quality */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Schedule Quality</h3>
          <AnalyticsChart
            type="line"
            data={qualityData}
            title="Quality Score per Doctor"
            dataKey="quality"
            xAxisKey="name"
            colors={['#10b981']}
            height={250}
            showTrend
            trendValue={selectedDoc?.scheduleQuality}
          />
        </div>

        {/* Department Distribution */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Department Distribution</h3>
          <AnalyticsChart
            type="pie"
            data={departmentData}
            title="Doctors per Department"
            dataKey="doctors"
            colors={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']}
            height={250}
            showLegend
          />
        </div>

        {/* Peak Days */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Peak Teaching Days</h3>
          <AnalyticsChart
            type="bar"
            data={peakDayData}
            title="Doctors per Peak Day"
            dataKey="count"
            xAxisKey="name"
            colors={['#f59e0b']}
            height={250}
          />
        </div>
      </div>

      {/* Doctor Comparison Table */}
      <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Doctor Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Doctor</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Department</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Courses</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Hours</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Daily Load</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Peak Day</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Quality</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Students</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr
                  key={doc.id}
                  className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer ${
                    selectedDoctor === doc.id ? 'bg-amber-500/10' : ''
                  }`}
                  onClick={() => onDoctorSelect?.(doc.id)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-white">{doc.department}</td>
                  <td className="text-center py-3 px-4 text-white">{doc.totalCourses}</td>
                  <td className="text-center py-3 px-4 text-white">{doc.totalHours}</td>
                  <td className="text-center py-3 px-4 text-white">{doc.averageDailyLoad.toFixed(1)}h</td>
                  <td className="text-center py-3 px-4 text-white">{doc.peakDay}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                      doc.scheduleQuality >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                      doc.scheduleQuality >= 60 ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {doc.scheduleQuality.toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 text-white">{doc.studentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workload Balance Analysis */}
      <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          Workload Balance Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            const avgHours = doctors.reduce((sum, d) => sum + d.totalHours, 0) / doctors.length;
            const overloaded = doctors.filter(d => d.totalHours > avgHours * 1.3);
            const underloaded = doctors.filter(d => d.totalHours < avgHours * 0.7);

            return (
              <>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Average Load</p>
                  <p className="text-2xl font-bold text-white">{avgHours.toFixed(1)}h/week</p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Overloaded Doctors</p>
                  <p className="text-2xl font-bold text-white">{overloaded.length}</p>
                  <p className="text-xs text-red-400 mt-1">Recommendation: Redistribute load</p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Underloaded Doctors</p>
                  <p className="text-2xl font-bold text-white">{underloaded.length}</p>
                  <p className="text-xs text-amber-400 mt-1">Recommendation: Assign more courses</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
