import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useEffect } from 'react';
import { FiCamera, FiLock } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || '');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const pageRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      if (image) fd.append('profileImage', image);
      const res = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) return toast.error('Passwords do not match');
    if (newPass.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await api.put('/users/change-password', { currentPassword: currPass, newPassword: newPass });
      toast.success('Password changed!');
      setCurrPass(''); setNewPass(''); setConfirmPass('');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  return (
    <div ref={pageRef} className="max-w-2xl mx-auto fade-in py-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#282828]">
            {preview
              ? <img src={preview} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#1DB954]">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
            <FiCamera className="text-black text-sm" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
          <p className="text-[#B3B3B3]">{user?.email}</p>
          {user?.role === 'admin' && (
            <span className="inline-block mt-1 px-3 py-0.5 bg-[#1DB954] text-black text-xs font-bold rounded-full">Admin</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#181818] rounded-full p-1 mb-8 w-fit">
        {['profile', 'security'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
              tab === t ? 'bg-white text-black' : 'text-[#B3B3B3] hover:text-white'
            }`}>
            {t === 'security' ? '🔒 Security' : '👤 Profile'}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5 bg-[#181818] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Edit Profile</h2>
          <div>
            <label className="text-sm font-semibold text-[#B3B3B3] mb-2 block">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#1DB954] text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#B3B3B3] mb-2 block">Email</label>
            <input value={user?.email} disabled
              className="w-full bg-[#282828] text-[#B3B3B3] rounded-lg px-4 py-3 outline-none text-sm cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-[#1DB954] text-black font-bold py-3 rounded-full hover:scale-105 disabled:opacity-50 transition-transform">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Security Form */}
      {tab === 'security' && (
        <form onSubmit={handleChangePassword} className="space-y-5 bg-[#181818] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Change Password</h2>
          {[
            { label: 'Current Password', val: currPass, set: setCurrPass },
            { label: 'New Password', val: newPass, set: setNewPass },
            { label: 'Confirm New Password', val: confirmPass, set: setConfirmPass },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="text-sm font-semibold text-[#B3B3B3] mb-2 block">{label}</label>
              <input type="password" value={val} onChange={e => set(e.target.value)} required
                className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#1DB954] text-sm" />
            </div>
          ))}
          <button type="submit" disabled={saving}
            className="w-full bg-[#1DB954] text-black font-bold py-3 rounded-full hover:scale-105 disabled:opacity-50 transition-transform">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
