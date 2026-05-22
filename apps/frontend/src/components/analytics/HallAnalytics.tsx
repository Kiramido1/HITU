import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, TrendingUp, AlertCircle, Building } from 'lucide-react';
import { AnalyticsChart } from '../charts/AnalyticsChart';

interface HallStats {
  id: string;
  name: string;
  code: string;
  capacity: number;
  building: string;
  floor: number;
  totalBookings: number;
  utilizationRate: number;
  peakHours: string[];
  averageOccupancy: number;
  idleHours: number;
}

interface HallAnalyticsProps {
  halls: HallStats[];
  selectedHall?: string;
  onHallSelect?: (hallId: string) => void;
}

export const HallAnalytics: React.FC<HallAnalyticsProps> = ({
  halls,
  selectedHall,
  onHallSelect,
}) => {
  const selectedHallData = useMemo(() => {
    return halls.find(h => h.id === selectedHall) || halls[0];
  }, [halls, selectedHall]);

  const utilizationData = useMemo(() => {
    return halls.map(hall => ({
      name: hall.code,
      utilization: hall.utilizationRate,
      capacity: hall.capacity,
    }));
  }, [halls]);

  const occupancyData = useMemo(() => {
    return halls.map(hall => ({
      name: hall.code,
      occupancy: hall.averageOccupancy,
    }));
  }, [halls]);

  const buildingData = useMemo(() => {
    const buildingMap = new Map();
    halls.forEach(hall => {
      if (!buildingMap.has(hall.building)) {
        buildingMap.set(hall.building, { totalHalls: 0, totalCapacity: 0, totalBookings: 0 });
      }
      const data = buildingMap.get(hall.building);
      data.totalHalls++;
      data.totalCapacity += hall.capacity;
      data.totalBookings += hall.totalBookings;
    });
    return Array.from(buildingMap.entries()).map(([name, data]) => ({
      name,
      halls: data.totalHalls,
      capacity: data.totalCapacity,
      bookings: data.totalBookings,
    }));
  }, [halls]);

  const peakHoursData = useMemo(() => {
    const hourMap = new Map();
    halls.forEach(hall => {
      hall.peakHours.forEach(hour => {
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      });
    });
    return Array.from(hourMap.entries())
      .map(([hour, count]) => ({ name: hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [halls]);

  return (
    <div className="space-y-6">
      {/* Hall Selector */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
        <MapPin className="w-6 h-6 text-amber-400" />
        <select
          value={selectedHall || halls[0]?.id}
          onChange={(e) => onHallSelect?.(e.target.value)}
          className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
        >
          {halls.map(hall => (
            <option key={hall.id} value={hall.id}>
              {hall.name} ({hall.code}) - {hall.building}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Hall Overview */}
      {selectedHallData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Building className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Capacity</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedHallData.capacity}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-400 text-sm">Bookings</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedHallData.totalBookings}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-slate-400 text-sm">Utilization</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedHallData.utilizationRate.toFixed(0)}%</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-xl border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span className="text-slate-400 text-sm">Idle Hours</span>
            </div>
            <p className="text-3xl font-bold text-white">{selectedHallData.idleHours}</p>
          </div>
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Rate */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Hall Utilization Rate</h3>
          <AnalyticsChart
            type="bar"
            data={utilizationData}
            title="Utilization %"
            dataKey="utilization"
            xAxisKey="name"
            colors={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']}
            height={250}
          />
        </div>

        {/* Average Occupancy */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Average Occupancy</h3>
          <AnalyticsChart
            type="line"
            data={occupancyData}
            title="Avg Occupancy per Hall"
            dataKey="occupancy"
            xAxisKey="name"
            colors={['#10b981']}
            height={250}
            showTrend
            trendValue={selectedHallData?.averageOccupancy}
          />
        </div>

        {/* Building Distribution */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Building Distribution</h3>
          <AnalyticsChart
            type="pie"
            data={buildingData}
            title="Halls per Building"
            dataKey="halls"
            colors={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']}
            height={250}
            showLegend
          />
        </div>

        {/* Peak Hours */}
        <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Peak Usage Hours</h3>
          <AnalyticsChart
            type="bar"
            data={peakHoursData}
            title="Bookings per Hour"
            dataKey="count"
            xAxisKey="name"
            colors={['#f59e0b']}
            height={250}
          />
        </div>
      </div>

      {/* Hall Comparison Table */}
      <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Hall Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Hall</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Capacity</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Building</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Floor</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Bookings</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Utilization</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Avg Occupancy</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Idle Hours</th>
              </tr>
            </thead>
            <tbody>
              {halls.map((hall) => (
                <tr
                  key={hall.id}
                  className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer ${
                    selectedHall === hall.id ? 'bg-amber-500/10' : ''
                  }`}
                  onClick={() => onHallSelect?.(hall.id)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium">{hall.name}</span>
                      <span className="text-slate-400 text-sm">({hall.code})</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-white">{hall.capacity}</td>
                  <td className="text-center py-3 px-4 text-white">{hall.building}</td>
                  <td className="text-center py-3 px-4 text-white">{hall.floor}</td>
                  <td className="text-center py-3 px-4 text-white">{hall.totalBookings}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                      hall.utilizationRate >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                      hall.utilizationRate >= 50 ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {hall.utilizationRate.toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 text-white">{hall.averageOccupancy.toFixed(0)}</td>
                  <td className="text-center py-3 px-4 text-white">{hall.idleHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Idle Hall Detection */}
      <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          Idle Hall Detection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {halls.filter(h => h.utilizationRate < 30).map(hall => (
            <div
              key={hall.id}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-white font-medium">{hall.name}</span>
              </div>
              <p className="text-sm text-slate-400 mb-1">Utilization: {hall.utilizationRate.toFixed(0)}%</p>
              <p className="text-sm text-slate-400">Idle Hours: {hall.idleHours}</p>
              <p className="text-xs text-red-400 mt-2">Recommendation: Consider consolidating bookings</p>
            </div>
          ))}
          {halls.filter(h => h.utilizationRate < 30).length === 0 && (
            <p className="text-slate-400 col-span-3 text-center py-4">No idle halls detected - all halls are well utilized</p>
          )}
        </div>
      </div>
    </div>
  );
};
