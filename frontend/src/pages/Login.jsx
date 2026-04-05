import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7F6] px-4 sm:px-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl overflow-hidden mb-6 bg-[#2E7D32]/10 text-[#2E7D32] shadow-sm"
          >
            <img src={logo} alt="BMC Logo" className="w-10 h-10 object-contain" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-[#263238] mb-2 font-inter tracking-tight"
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#607D8B] text-sm"
          >
            Sign in to your account to continue
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="saas-card p-6 sm:p-8 relative"
        >
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 text-sm font-medium text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex p-1 bg-white/50 rounded-lg border border-[#E0E0E0]/80 mb-6">
              <button
                type="button"
                onClick={() => setRole('shopkeeper')}
                className={`flex-1 py-2 text-sm font-medium transition-all rounded-md ${
                  role === 'shopkeeper' ? 'bg-slate-100 text-[#263238] shadow-sm' : 'text-[#607D8B] hover:text-[#263238]'
                }`}
              >
                Shopkeeper
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-sm font-medium transition-all rounded-md ${
                  role === 'admin' ? 'bg-slate-100 text-[#263238] shadow-sm' : 'text-[#607D8B] hover:text-[#263238]'
                }`}
              >
                Admin
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#607D8B]">Username / Shop ID</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter Username or Shop ID"
                  className="w-full h-11"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#607D8B]">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 h-11"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex flex-col items-center justify-center gap-4"
        >
          <p className="text-sm text-[#607D8B]">
            Don't have an account?{' '}
            <a href="/signup" className="text-[#2E7D32] font-medium hover:text-[#2E7D32]">
              Sign up
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
