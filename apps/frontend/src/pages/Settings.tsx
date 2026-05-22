import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = React.useState({
    notifications: true,
    emailAlerts: true,
    darkMode: true,
    language: 'en',
    timezone: 'UTC'
  });

  const handleSave = () => {
    console.log('Settings saved:', settings);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input
                type="email"
                defaultValue="john.doe@hitu.edu"
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Push Notifications</span>
              <button
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.notifications ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Email Alerts</span>
              <button
                onClick={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.emailAlerts ? 'bg-amber-500' : 'bg-slate-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.emailAlerts ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 text-slate-300 rounded-lg transition-colors">
              Change Password
            </button>
            <button className="w-full px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 text-slate-300 rounded-lg transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="UTC">UTC</option>
                <option value="Cairo">Cairo (GMT+2)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
