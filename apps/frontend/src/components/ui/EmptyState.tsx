import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Search, Calendar, Users, FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'inbox' | 'search' | 'calendar' | 'users' | 'file' | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ICONS: Record<string, React.ComponentType> = {
  inbox: Inbox,
  search: Search,
  calendar: Calendar,
  users: Users,
  file: FileText
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action
}) => {
  const IconComponent = typeof icon === 'string' ? ICONS[icon] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-24 h-24 mb-6 flex items-center justify-center bg-slate-800/50 rounded-full">
        {typeof icon === 'string' && IconComponent ? (
          <div className="w-12 h-12 text-slate-600">
            <IconComponent />
          </div>
        ) : (
          icon
        )}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-slate-400 text-center max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};
