import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdLibraryMusic } from 'react-icons/md';
import { BsCheckCircleFill } from 'react-icons/bs';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center">
          <MdLibraryMusic className="text-black text-xl" />
        </div>
        <span className="text-3xl font-black text-white">Melix</span>
      </Link>
      <div className="bg-[#181818] rounded-2xl p-10 w-full max-w-md shadow-2xl">
        {sent ? (
          <div className="text-center">
            <BsCheckCircleFill className="text-6xl text-[#1DB954] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
            <p className="text-[#B3B3B3] mb-6">We sent a reset link to <strong className="text-white">{email}</strong></p>
            <Link to="/login" className="text-[#1DB954] font-bold hover:underline">Back to login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-3">Forgot Password?</h1>
            <p className="text-[#B3B3B3] text-sm mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Your email"
                className="w-full bg-[#282828] border border-[#3E3E3E] text-white rounded-lg px-4 py-3.5 outline-none focus:border-white text-sm placeholder-[#535353]" />
              <button type="submit" disabled={loading}
                className="w-full bg-[#1DB954] text-black font-bold py-3 rounded-full hover:scale-105 disabled:opacity-50 transition-transform text-sm">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <div className="text-center mt-6">
              <Link to="/login" className="text-[#B3B3B3] text-sm hover:text-white transition-colors">← Back to login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
