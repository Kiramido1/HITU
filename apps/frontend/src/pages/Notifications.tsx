import React from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { lmsService } from '@/services/api';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    lmsService.getNotifications()
      .then((data: Array<{ id: string; title: string; body?: string; notification_type: string; is_read: boolean; created_at: string }>) => {
        setNotifications(data.map((n) => ({
          id: n.id,
          type: (n.notification_type as Notification['type']) || 'info',
          title: n.title,
          message: n.body || '',
          timestamp: new Date(n.created_at).toLocaleString(),
          read: n.is_read,
        })))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, []);

  const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    await lmsService.markAllNotificationsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'warning': return 'bg-amber-500/20 border-amber-500/30';
      case 'error': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 text-slate-300 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
        <Filter className="w-5 h-5 text-slate-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
          className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">All Notifications</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredNotifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 border rounded-xl transition-all ${
              notification.read
                ? 'bg-slate-800/30 border-slate-700/30 opacity-60'
                : `bg-gradient-to-r ${getTypeColor(notification.type)} border backdrop-blur-xl`
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{notification.title}</h3>
                <p className="text-slate-300 mb-2">{notification.message}</p>
                <p className="text-sm text-slate-400">{notification.timestamp}</p>
              </div>
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
            <p className="text-slate-400">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
