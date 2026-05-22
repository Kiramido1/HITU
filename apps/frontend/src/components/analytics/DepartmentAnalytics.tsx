import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import { AnalyticsChart } from '../charts/AnalyticsChart';

interface DepartmentStats {
  id: string;
  name: string;
  code: string;
  totalCourses: number;
  totalStudents: number;
  totalDoctors: number;
  totalAssistants: number;
  averageLoad: number;
  scheduleQuality: number;
  utilizationRate: number;
}

interface DepartmentAnalyticsProps {
  departments: DepartmentStats[];
  selectedDepartment?: string;
  onDepartmentSelect?: (departmentId: string) => void;
}

export const DepartmentAnalytics: React.FC<DepartmentAnalyticsProps> = ({
  departments,
  selectedDepartment,
  onDepartmentSelect,
}) => {
  const selectedDept = useMemo(() => {
    return departments.find(d => d.id === selectedDepartment) || departments[0];
  }, [departments, selectedDepartment]);

  const departmentComparisonData = useMemo(() => {
    return departments.map(dept => ({
      name: dept.code,
      courses: dept.totalCourses,
      students: dept.totalStudents,
      quality: dept.scheduleQuality,
    }));
  }, [departments]);

  const workloadDistributionData = useMemo(() => {
    return departments.map(dept => ({
      name: dept.code,
      doctors: dept.totalDoctors,
      assistants: dept.totalAssistants,
      load: dept.averageLoad,
    }));
  }, [departments]);

  const utilizationData = useMemo(() => {
    return departments.map(dept => ({
      name: dept.code,
      utilization: dept.utilizationRate,
    }));
  }, [departments]);

  return (
    <div className="space-y-6">
      {/* Department Selector */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
        <Building2 className="w-6 h-6 text-amber-400" />
        <select
          value={selectedDepartment || departments[0]?.id}
          onChange={(e) => onDepartmentSelect?.(e.target.value)}
          className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
        >
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name} ({dept.code})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Department Overview */}
      {selectedDept && (
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
            <p className="text-3xl font-bold text-white">{selectedDept.totalCourses}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-400 text-sm">Total Students</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedDept.totalStudents}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-slate-400 text-sm">Avg Load</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedDept.averageLoad.toFixed(1)}h</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-xl border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-slate-400 text-sm">Schedule Quality</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedDept.scheduleQuality.toFixed(0)}%</p>
          </div>
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course & Student Distribution */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Course & Student Distribution</h3>
          <AnalyticsChart
            type="bar"
            data={departmentComparisonData}
            title="Courses per Department"
            dataKey="courses"
            xAxisKey="name"
            colors={['#3b82f6', '#10b981', '#8b5cf6']}
            height={250}
          />
        </div>

        {/* Workload Distribution */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Workload Distribution</h3>
          <AnalyticsChart
            type="bar"
            data={workloadDistributionData}
            title="Average Teaching Load (hours)"
            dataKey="load"
            xAxisKey="name"
            colors={['#f59e0b', '#ef4444', '#06b6d4']}
            height={250}
          />
        </div>

        {/* Schedule Quality Comparison */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Schedule Quality</h3>
          <AnalyticsChart
            type="line"
            data={departmentComparisonData}
            title="Schedule Quality Score"
            dataKey="quality"
            xAxisKey="name"
            colors={['#10b981']}
            height={250}
            showTrend
            trendValue={selectedDept?.scheduleQuality}
          />
        </div>

        {/* Hall Utilization */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Hall Utilization Rate</h3>
          <AnalyticsChart
            type="area"
            data={utilizationData}
            title="Utilization %"
            dataKey="utilization"
            xAxisKey="name"
            colors={['#8b5cf6']}
            height={250}
          />
        </div>
      </div>

      {/* Department Comparison Table */}
      <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Department Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Department</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Courses</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Students</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Doctors</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Assistants</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Avg Load</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Quality</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer ${
                    selectedDepartment === dept.id ? 'bg-amber-500/10' : ''
                  }`}
                  onClick={() => onDepartmentSelect?.(dept.id)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium">{dept.name}</span>
                      <span className="text-slate-400 text-sm">({dept.code})</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-white">{dept.totalCourses}</td>
                  <td className="text-center py-3 px-4 text-white">{dept.totalStudents}</td>
                  <td className="text-center py-3 px-4 text-white">{dept.totalDoctors}</td>
                  <td className="text-center py-3 px-4 text-white">{dept.totalAssistants}</td>
                  <td className="text-center py-3 px-4 text-white">{dept.averageLoad.toFixed(1)}h</td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                      dept.scheduleQuality >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                      dept.scheduleQuality >= 60 ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {dept.scheduleQuality.toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 text-white">{dept.utilizationRate.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
