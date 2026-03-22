import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { MdLibraryMusic } from 'react-icons/md';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be 6+ characters');
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success('Welcome to Melix! 🎵');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #1DB95420 0%, transparent 70%)' }}>
      <Link to="/" className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center">
          <MdLibraryMusic className="text-black text-2xl" />
        </div>
        <span className="text-4xl font-black text-white">Melix</span>
      </Link>

      <div ref={cardRef} className="bg-[#181818] rounded-2xl p-10 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Sign up for free</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Name', val: name, set: setName, type: 'text', placeholder: 'Your name' },
            { label: 'Email address', val: email, set: setEmail, type: 'email', placeholder: 'name@example.com' },
          ].map(({ label, val, set, type, placeholder }) => (
            <div key={label}>
              <label className="text-sm font-semibold text-[#B3B3B3] mb-2 block">{label}</label>
              <input type={type} value={val} onChange={e => set(e.target.value)} required placeholder={placeholder}
                className="w-full bg-[#282828] border border-[#3E3E3E] text-white rounded-lg px-4 py-3.5 outline-none focus:border-white text-sm transition-colors placeholder-[#535353]" />
            </div>
          ))}
          <div>
            <label className="text-sm font-semibold text-[#B3B3B3] mb-2 block">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min. 6 characters"
                className="w-full bg-[#282828] border border-[#3E3E3E] text-white rounded-lg px-4 py-3.5 pr-12 outline-none focus:border-white text-sm transition-colors placeholder-[#535353]" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white">
                {showPass ? <AiOutlineEyeInvisible className="text-xl" /> : <AiOutlineEye className="text-xl" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#1DB954] text-black font-bold py-3.5 rounded-full hover:scale-105 disabled:opacity-50 transition-transform text-sm mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="border-t border-[#282828] mt-8 pt-8 text-center">
          <p className="text-[#B3B3B3] text-sm">Already have an account?{' '}
            <Link to="/login" className="text-white font-bold hover:text-[#1DB954] underline transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
