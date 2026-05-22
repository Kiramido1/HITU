import React from 'react';
import { FileText, Search, Filter, Download, Eye } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  user: string;
  timestamp: string;
  details: string;
  severity: 'info' | 'warning' | 'error';
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = React.useState<AuditLog[]>([
    {
      id: '1',
      action: 'CREATE',
      entity: 'Schedule',
      entityId: 'SCH-001',
      user: 'admin@hitu.edu',
      timestamp: '2024-01-15 10:30:00',
      details: 'Created new schedule for Fall 2024 semester',
      severity: 'info'
    },
    {
      id: '2',
      action: 'UPDATE',
      entity: 'Course',
      entityId: 'CS401',
      user: 'john.doe@hitu.edu',
      timestamp: '2024-01-15 09:15:00',
      details: 'Updated course credits from 3 to 4',
      severity: 'warning'
    },
    {
      id: '3',
      action: 'DELETE',
      entity: 'Hall',
      entityId: 'H105',
      user: 'admin@hitu.edu',
      timestamp: '2024-01-14 16:45:00',
      details: 'Deleted hall H105 due to maintenance',
      severity: 'error'
    }
  ]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterSeverity, setFilterSeverity] = React.useState<'all' | 'info' | 'warning' | 'error'>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info': return 'INFO';
      case 'warning': return 'WARNING';
      case 'error': return 'ERROR';
      default: return severity.toUpperCase();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 text-slate-300 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as 'all' | 'info' | 'warning' | 'error')}
            className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Entity</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Entity ID</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">User</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Timestamp</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Severity</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Details</th>
              <th className="text-center py-3 px-4 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-white font-medium">{log.action}</span>
                </td>
                <td className="py-3 px-4 text-white">{log.entity}</td>
                <td className="py-3 px-4 text-slate-300">{log.entityId}</td>
                <td className="py-3 px-4 text-white">{log.user}</td>
                <td className="py-3 px-4 text-slate-300">{log.timestamp}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                    {getSeverityBadge(log.severity)}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{log.details}</td>
                <td className="py-3 px-4 text-center">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View Details">
                    <Eye className="w-4 h-4 text-amber-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Logs Found</h3>
          <p className="text-slate-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
