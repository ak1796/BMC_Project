import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('shopkeeper');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password, role);

    if (result.success) {
      const savedUser = localStorage.getItem('user');
      if (savedUser && savedUser !== 'undefined') {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') navigate('/admin');
        else navigate('/shopkeeper');
      } else {
        setError('Synchronizing authentication state...');
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse-soft" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full delay-1000 animate-pulse-soft" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-emerald-400 mb-6 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
          >
            <Store size={40} strokeWidth={1.5} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-white mb-2 font-outfit tracking-tight"
          >
            Sign In
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 font-medium tracking-wide uppercase text-[10px] bg-slate-900/50 inline-block px-3 py-1 rounded-full border border-slate-800"
          >
            Welcome Back
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 lg:p-10 border border-white/5 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 text-[13px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 shadow-inner"
                >
                  <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Role Segmented Control */}
            <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-slate-800/60 mb-8 relative z-10 w-full backdrop-blur-md overflow-hidden">
              <button
                type="button"
                onClick={() => setRole('shopkeeper')}
                className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all duration-300 rounded-xl z-10 ${
                  role === 'shopkeeper' ? 'text-slate-950 bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'
                }`}
              >
                Shopkeeper
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-all duration-300 rounded-xl z-10 ${
                  role === 'admin' ? 'text-slate-950 bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'
                }`}
              >
                Administrator
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Username / Shop ID</label>
              <div className="relative group/input">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                <input
                  type="text"
                  required
                  placeholder="Enter Username or Shop ID"
                  className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group/input">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full !pl-12 h-14 text-sm tracking-widest"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-3 h-14 group/btn"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="text-sm uppercase font-black tracking-widest">Sign In</span>
                    <ArrowRight size={20} className="transition-transform group-hover/btn:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col items-center justify-center gap-4"
        >
          <p className="text-xs font-bold text-slate-500 tracking-wide">
            Don't have an account?{' '}
            <a href="/signup" className="text-emerald-500 hover:text-emerald-400 transition-colors uppercase font-black tracking-widest ml-1 text-[10px]">
              Sign Up
            </a>
          </p>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure Login</span>
            </div>
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">v4.0.2 Stable</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
