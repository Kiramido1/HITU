import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, User, Calendar, AlertTriangle } from 'lucide-react';

interface ScheduleSlot {
  id: string;
  day: number; // 0-6 (Monday-Sunday)
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  courseId: string;
  courseName: string;
  courseCode: string;
  hallId: string;
  hallName: string;
  hallCode: string;
  doctorId: string;
  doctorName: string;
  assistantId?: string;
  assistantName?: string;
  type: 'lecture' | 'lab' | 'section';
  section?: number;
  conflicts?: string[];
}

interface InteractiveTimetableProps {
  schedule: ScheduleSlot[];
  onSlotClick?: (slot: ScheduleSlot) => void;
  onSlotDrag?: (slot: ScheduleSlot, newDay: number, newTime: string) => void;
  editable?: boolean;
  showConflicts?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const TYPE_COLORS = {
  lecture: 'from-blue-500/20 to-blue-600/20 border-blue-400/30',
  lab: 'from-purple-500/20 to-purple-600/20 border-purple-400/30',
  section: 'from-emerald-500/20 to-emerald-600/20 border-emerald-400/30',
};

export const InteractiveTimetable: React.FC<InteractiveTimetableProps> = ({
  schedule,
  onSlotClick,
  onSlotDrag,
  editable = false,
  showConflicts = true,
}) => {
  const [draggedSlot, setDraggedSlot] = useState<ScheduleSlot | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ day: number; time: string } | null>(null);

  const getSlotForCell = useCallback((day: number, time: string) => {
    return schedule.find(slot =>
      slot.day === day &&
      time >= slot.startTime &&
      time < slot.endTime
    );
  }, [schedule]);

  const handleDragStart = (slot: ScheduleSlot) => {
    if (editable) {
      setDraggedSlot(slot);
    }
  };

  const handleDragOver = (e: React.DragEvent, day: number, time: string) => {
    e.preventDefault();
    if (editable) {
      setHoveredCell({ day, time });
    }
  };

  const handleDrop = (day: number, time: string) => {
    if (editable && draggedSlot && onSlotDrag) {
      onSlotDrag(draggedSlot, day, time);
      setDraggedSlot(null);
      setHoveredCell(null);
    }
  };

  const getSlotHeight = (slot: ScheduleSlot) => {
    const startHour = parseInt(slot.startTime.split(':')[0]);
    const endHour = parseInt(slot.endTime.split(':')[0]);
    return (endHour - startHour) * 60 + 'px';
  };

  const getSlotTop = (slot: ScheduleSlot) => {
    const startHour = parseInt(slot.startTime.split(':')[0]);
    return (startHour - 8) * 60 + 'px';
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Interactive Timetable</h2>
        </div>
        {showConflicts && schedule.some(s => s.conflicts && s.conflicts.length > 0) && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              {schedule.filter(s => s.conflicts && s.conflicts.length > 0).length} Conflicts Detected
            </span>
          </div>
        )}
      </div>

      {/* Timetable Grid */}
      <div className="flex h-[calc(100%-80px)]">
        {/* Time Column */}
        <div className="w-20 flex-shrink-0 border-r border-slate-700/50 bg-slate-900/30">
          <div className="h-12 border-b border-slate-700/50" />
          {TIME_SLOTS.map(time => (
            <div key={time} className="h-[60px] flex items-start justify-center pt-2 border-b border-slate-700/30">
              <span className="text-xs text-slate-400 font-medium">{time}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 overflow-auto">
          <div className="flex min-w-[800px]">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex-1 border-r border-slate-700/50 last:border-r-0">
                {/* Day Header */}
                <div className="h-12 flex items-center justify-center border-b border-slate-700/50 bg-slate-900/30">
                  <span className="text-sm font-semibold text-slate-300">{day}</span>
                </div>

                {/* Time Slots */}
                <div className="relative h-[780px]">
                  {TIME_SLOTS.map(time => (
                    <div
                      key={`${day}-${time}`}
                      className={`h-[60px] border-b border-slate-700/30 transition-all duration-200 ${
                        hoveredCell?.day === dayIndex && hoveredCell?.time === time
                          ? 'bg-amber-500/10'
                          : 'hover:bg-slate-700/20'
                      }`}
                      onDragOver={(e) => handleDragOver(e, dayIndex, time)}
                      onDrop={() => handleDrop(dayIndex, time)}
                    />
                  ))}

                  {/* Schedule Slots */}
                  <AnimatePresence>
                    {schedule
                      .filter(slot => slot.day === dayIndex)
                      .map(slot => (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute left-1 right-1 rounded-lg border backdrop-blur-sm cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10 ${
                            TYPE_COLORS[slot.type]
                          } ${
                            slot.conflicts && slot.conflicts.length > 0
                              ? 'border-red-500/50 bg-red-500/10'
                              : ''
                          } ${
                            draggedSlot?.id === slot.id ? 'opacity-50' : ''
                          }`}
                          style={{
                            top: getSlotTop(slot),
                            height: getSlotHeight(slot),
                          }}
                          draggable={editable}
                          onDragStart={() => handleDragStart(slot)}
                          onClick={() => onSlotClick?.(slot)}
                        >
                          <div className="p-2 h-full flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs font-bold text-white/90">{slot.courseCode}</span>
                                {slot.conflicts && slot.conflicts.length > 0 && (
                                  <AlertTriangle className="w-3 h-3 text-red-400" />
                                )}
                              </div>
                              <p className="text-xs text-white/70 font-medium line-clamp-2">{slot.courseName}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-white/60">
                                <Clock className="w-3 h-3" />
                                <span>{slot.startTime} - {slot.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-white/60">
                                <MapPin className="w-3 h-3" />
                                <span>{slot.hallCode}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-white/60">
                                <User className="w-3 h-3" />
                                <span className="truncate">{slot.doctorName}</span>
                              </div>
                              {slot.assistantName && (
                                <div className="flex items-center gap-1 text-xs text-white/50">
                                  <User className="w-3 h-3" />
                                  <span className="truncate">{slot.assistantName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
