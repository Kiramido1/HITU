import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

export interface Conflict {
  id: string;
  type: 'hall' | 'doctor' | 'assistant' | 'capacity' | 'overlap';
  severity: 'error' | 'warning' | 'info';
  message: string;
  details: string;
  affectedSlots: string[];
  suggestion?: string;
}

interface ConflictDetectionProps {
  conflicts: Conflict[];
  onResolve?: (conflictId: string) => void;
  onDismiss?: (conflictId: string) => void;
  showSuggestions?: boolean;
}

const SEVERITY_COLORS = {
  error: {
    bg: 'from-red-500/20 to-red-600/20',
    border: 'border-red-500/50',
    icon: 'text-red-400',
    text: 'text-red-300',
  },
  warning: {
    bg: 'from-amber-500/20 to-amber-600/20',
    border: 'border-amber-500/50',
    icon: 'text-amber-400',
    text: 'text-amber-300',
  },
  info: {
    bg: 'from-blue-500/20 to-blue-600/20',
    border: 'border-blue-500/50',
    icon: 'text-blue-400',
    text: 'text-blue-300',
  },
};

const SEVERITY_ICONS = {
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

export const ConflictDetection: React.FC<ConflictDetectionProps> = ({
  conflicts,
  onResolve,
  onDismiss,
  showSuggestions = true,
}) => {
  const conflictsBySeverity = useMemo(() => {
    return {
      error: conflicts.filter(c => c.severity === 'error'),
      warning: conflicts.filter(c => c.severity === 'warning'),
      info: conflicts.filter(c => c.severity === 'info'),
    };
  }, [conflicts]);

  const totalConflicts = conflicts.length;
  const errorCount = conflictsBySeverity.error.length;
  const warningCount = conflictsBySeverity.warning.length;

  if (totalConflicts === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
      >
        <CheckCircle className="w-5 h-5 text-emerald-400" />
        <span className="text-emerald-300 font-medium">No conflicts detected</span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl"
      >
        <div className="flex items-center gap-4">
          <AlertTriangle className={`w-6 h-6 ${errorCount > 0 ? 'text-red-400' : 'text-amber-400'}`} />
          <div>
            <h3 className="text-lg font-bold text-white">Schedule Conflicts</h3>
            <p className="text-sm text-slate-400">
              {totalConflicts} conflict{totalConflicts !== 1 ? 's' : ''} detected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {errorCount > 0 && (
            <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg">
              <span className="text-red-400 text-sm font-medium">{errorCount} Error{errorCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <span className="text-amber-400 text-sm font-medium">{warningCount} Warning{warningCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Conflicts List */}
      <div className="space-y-3 max-h-[500px] overflow-auto">
        <AnimatePresence mode="popLayout">
          {conflicts.map((conflict) => {
            const SeverityIcon = SEVERITY_ICONS[conflict.severity];
            const colors = SEVERITY_COLORS[conflict.severity];

            return (
              <motion.div
                key={conflict.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 bg-gradient-to-r ${colors.bg} backdrop-blur-xl border ${colors.border} rounded-xl`}
              >
                <div className="flex items-start gap-3">
                  <SeverityIcon className={`w-5 h-5 mt-0.5 ${colors.icon} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className={`font-semibold ${colors.text}`}>{conflict.message}</h4>
                      <button
                        onClick={() => onDismiss?.(conflict.id)}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{conflict.details}</p>

                    {showSuggestions && conflict.suggestion && (
                      <div className="p-3 bg-slate-900/30 border border-slate-700/30 rounded-lg">
                        <p className="text-xs text-slate-300">
                          <span className="font-semibold text-amber-400">Suggestion:</span> {conflict.suggestion}
                        </p>
                      </div>
                    )}

                    {onResolve && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => onResolve(conflict.id)}
                          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-sm font-medium rounded-lg transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Conflict detection utility function
export const detectConflicts = (schedule: any[]): Conflict[] => {
  const conflicts: Conflict[] = [];
  const slotMap = new Map<string, any[]>();

  // Group slots by day and time
  schedule.forEach(slot => {
    const key = `${slot.day}-${slot.startTime}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, []);
    }
    slotMap.get(key)!.push(slot);
  });

  // Check for hall conflicts
  slotMap.forEach((slots, key) => {
    const hallMap = new Map<string, any[]>();
    slots.forEach(slot => {
      if (!hallMap.has(slot.hallId)) {
        hallMap.set(slot.hallId, []);
      }
      hallMap.get(slot.hallId)!.push(slot);
    });

    hallMap.forEach((hallSlots, hallId) => {
      if (hallSlots.length > 1) {
        conflicts.push({
          id: `hall-${key}-${hallId}`,
          type: 'hall',
          severity: 'error',
          message: 'Hall Conflict',
          details: `Multiple courses scheduled in the same hall at the same time`,
          affectedSlots: hallSlots.map(s => s.id),
          suggestion: 'Move one of the courses to a different time or hall',
        });
      }
    });
  });

  // Check for doctor conflicts
  slotMap.forEach((slots, key) => {
    const doctorMap = new Map<string, any[]>();
    slots.forEach(slot => {
      if (!doctorMap.has(slot.doctorId)) {
        doctorMap.set(slot.doctorId, []);
      }
      doctorMap.get(slot.doctorId)!.push(slot);
    });

    doctorMap.forEach((doctorSlots, doctorId) => {
      if (doctorSlots.length > 1) {
        conflicts.push({
          id: `doctor-${key}-${doctorId}`,
          type: 'doctor',
          severity: 'error',
          message: 'Doctor Conflict',
          details: `Doctor scheduled to teach multiple courses at the same time`,
          affectedSlots: doctorSlots.map(s => s.id),
          suggestion: 'Reschedule one of the courses to a different time',
        });
      }
    });
  });

  // Check for assistant conflicts
  slotMap.forEach((slots, key) => {
    const assistantMap = new Map<string, any[]>();
    slots.forEach(slot => {
      if (slot.assistantId) {
        if (!assistantMap.has(slot.assistantId)) {
          assistantMap.set(slot.assistantId, []);
        }
        assistantMap.get(slot.assistantId)!.push(slot);
      }
    });

    assistantMap.forEach((assistantSlots, assistantId) => {
      if (assistantSlots.length > 1) {
        conflicts.push({
          id: `assistant-${key}-${assistantId}`,
          type: 'assistant',
          severity: 'error',
          message: 'Assistant Conflict',
          details: `Assistant scheduled for multiple sections at the same time`,
          affectedSlots: assistantSlots.map(s => s.id),
          suggestion: 'Reschedule one of the sections to a different time',
        });
      }
    });
  });

  // Check for capacity issues
  schedule.forEach(slot => {
    if (slot.capacity && slot.enrolled && slot.enrolled > slot.capacity) {
      conflicts.push({
        id: `capacity-${slot.id}`,
        type: 'capacity',
        severity: 'warning',
        message: 'Capacity Warning',
        details: `Course enrollment exceeds hall capacity`,
        affectedSlots: [slot.id],
        suggestion: 'Move to a larger hall or reduce enrollment',
      });
    }
  });

  return conflicts;
};
