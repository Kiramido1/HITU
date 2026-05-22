import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Camera } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState({
    name: 'Dr. John Doe',
    email: 'john.doe@hitu.edu',
    phone: '+20 123 456 7890',
    department: 'Computer Science',
    role: 'Professor',
    location: 'Cairo, Egypt',
    joinDate: 'September 2020'
  });

  const handleSave = () => {
    setIsEditing(false);
    console.log('Profile saved:', profile);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full flex items-center justify-center mx-auto">
                <User className="w-16 h-16 text-amber-400" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-full transition-colors">
                <Camera className="w-4 h-4 text-amber-300" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
            <p className="text-slate-400 mb-4">{profile.role}</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                ) : (
                  <p className="text-white">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                ) : (
                  <p className="text-white">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                ) : (
                  <p className="text-white">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Department</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                ) : (
                  <p className="text-white">{profile.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Role</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                ) : (
                  <p className="text-white">{profile.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                ) : (
                  <p className="text-white">{profile.location}</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Member since {profile.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
