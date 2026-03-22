import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { MdLibraryMusic } from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(logoRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
    gsap.fromTo(cardRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power3.out' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎵');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #1DB95420 0%, transparent 70%)' }}>
      <div ref={logoRef} className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center">
          <MdLibraryMusic className="text-black text-2xl" />
        </div>
        <span className="text-4xl font-black text-white">Melix</span>
      </div>

      <div ref={cardRef} className="bg-[#181818] rounded-2xl p-10 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Log in to Melix</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-[#B3B3B3] mb-2 block">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="name@example.com"
              className="w-full bg-[#282828] border border-[#3E3E3E] text-white rounded-lg px-4 py-3.5 outline-none focus:border-white focus:ring-1 focus:ring-white text-sm transition-colors placeholder-[#535353]" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#B3B3B3] mb-2 block">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Password"
                className="w-full bg-[#282828] border border-[#3E3E3E] text-white rounded-lg px-4 py-3.5 pr-12 outline-none focus:border-white focus:ring-1 focus:ring-white text-sm transition-colors placeholder-[#535353]" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white transition-colors">
                {showPass ? <AiOutlineEyeInvisible className="text-xl" /> : <AiOutlineEye className="text-xl" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-[#B3B3B3] hover:text-white underline transition-colors">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#1DB954] text-black font-bold py-3.5 rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-transform text-sm mt-2">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="border-t border-[#282828] mt-8 pt-8 text-center">
          <p className="text-[#B3B3B3] text-sm">Don't have an account?{' '}
            <Link to="/signup" className="text-white font-bold hover:text-[#1DB954] transition-colors underline">
              Sign up for Melix
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
