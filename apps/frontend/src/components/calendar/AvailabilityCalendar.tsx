import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, X, Save, RefreshCw } from 'lucide-react';

export interface TimeSlot {
  id?: string;
  day: number; // 0-6 (Monday-Sunday)
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  hallId?: string;
  hallName?: string;
  preferred?: boolean;
}

interface AvailabilityCalendarProps {
  availability: TimeSlot[];
  onAvailabilityChange: (availability: TimeSlot[]) => void;
  onSave?: () => void;
  editable?: boolean;
  showHalls?: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  onAvailabilityChange,
  onSave,
  editable = true,
  showHalls = true,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ day: number; time: string } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ day: number; time: string } | null>(null);
  const [selectedHall, setSelectedHall] = useState<string | null>(null);

  const isSlotAvailable = useCallback((day: number, time: string) => {
    return availability.some(slot =>
      slot.day === day &&
      time >= slot.startTime &&
      time < slot.endTime
    );
  }, [availability]);

  const getSlotForCell = useCallback((day: number, time: string) => {
    return availability.find(slot =>
      slot.day === day &&
      time >= slot.startTime &&
      time < slot.endTime
    );
  }, [availability]);

  const handleCellMouseDown = (day: number, time: string) => {
    if (!editable) return;
    setIsSelecting(true);
    setSelectionStart({ day, time });
    setSelectionEnd({ day, time });
  };

  const handleCellMouseEnter = (day: number, time: string) => {
    if (isSelecting && editable) {
      setSelectionEnd({ day, time });
    }
  };

  const handleCellMouseUp = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) return;

    const startDay = Math.min(selectionStart.day, selectionEnd.day);
    const endDay = Math.max(selectionStart.day, selectionEnd.day);
    const startTimeIndex = TIME_SLOTS.indexOf(selectionStart.time);
    const endTimeIndex = TIME_SLOTS.indexOf(selectionEnd.time);

    const newAvailability = [...availability];

    for (let day = startDay; day <= endDay; day++) {
      for (let i = startTimeIndex; i <= endTimeIndex; i++) {
        const time = TIME_SLOTS[i];
        const existingSlot = getSlotForCell(day, time);

        if (existingSlot) {
          const index = newAvailability.findIndex(s => s.id === existingSlot.id);
          if (index !== -1) {
            newAvailability.splice(index, 1);
          }
        } else {
          newAvailability.push({
            id: `slot-${day}-${time}-${Date.now()}`,
            day,
            startTime: time,
            endTime: TIME_SLOTS[i + 1] || '21:00',
            hallId: selectedHall || undefined,
            preferred: true,
          });
        }
      }
    }

    onAvailabilityChange(newAvailability);
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleRemoveSlot = (slot: TimeSlot) => {
    const newAvailability = availability.filter(s => s.id !== slot.id);
    onAvailabilityChange(newAvailability);
  };

  const getSelectedRange = () => {
    if (!selectionStart || !selectionEnd) return null;

    const startDay = Math.min(selectionStart.day, selectionEnd.day);
    const endDay = Math.max(selectionStart.day, selectionEnd.day);
    const startTimeIndex = TIME_SLOTS.indexOf(selectionStart.time);
    const endTimeIndex = TIME_SLOTS.indexOf(selectionEnd.time);

    return { startDay, endDay, startTimeIndex, endTimeIndex };
  };

  const isSelectedInRange = (day: number, time: string) => {
    const range = getSelectedRange();
    if (!range) return false;

    const timeIndex = TIME_SLOTS.indexOf(time);
    return day >= range.startDay &&
           day <= range.endDay &&
           timeIndex >= range.startTimeIndex &&
           timeIndex <= range.endTimeIndex;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Availability Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          {editable && onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
          <button
            onClick={() => onAvailabilityChange([])}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
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
                  {TIME_SLOTS.map(time => {
                    const available = isSlotAvailable(dayIndex, time);
                    const selected = isSelectedInRange(dayIndex, time);
                    const slot = getSlotForCell(dayIndex, time);

                    return (
                      <div
                        key={`${day}-${time}`}
                        className={`h-[60px] border-b border-slate-700/30 transition-all duration-200 cursor-pointer ${
                          available
                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30'
                            : selected
                            ? 'bg-amber-500/30'
                            : 'hover:bg-slate-700/20'
                        }`}
                        onMouseDown={() => handleCellMouseDown(dayIndex, time)}
                        onMouseEnter={() => handleCellMouseEnter(dayIndex, time)}
                        onMouseUp={handleCellMouseUp}
                      >
                        {slot && (
                          <div className="p-2 h-full flex flex-col justify-center">
                            <div className="flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3 text-emerald-400" />
                              <span className="text-xs text-emerald-300 font-medium">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            {showHalls && slot.hallName && (
                              <span className="text-xs text-emerald-200/70">{slot.hallName}</span>
                            )}
                            {editable && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSlot(slot);
                                }}
                                className="absolute top-1 right-1 p-1 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <X className="w-3 h-3 text-red-400" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Info */}
      <AnimatePresence>
        {isSelecting && selectionStart && selectionEnd && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 p-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm text-white font-medium">
                    {DAYS[selectionStart.day]} - {DAYS[selectionEnd.day]}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectionStart.time} - {selectionEnd.time}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSelecting(false);
                  setSelectionStart(null);
                  setSelectionEnd(null);
                }}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
