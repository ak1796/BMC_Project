import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Store, User, Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle,
  QrCode, BellRing, Tablet, Database, CheckCircle2
} from 'lucide-react';
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

  const infographicSteps = [
    {
      icon: <QrCode className="text-emerald-500" size={24} />,
      title: "Smart Reporting",
      desc: "Scan the QR code on any BMC green dustbin to instantly report if it's full."
    },
    {
      icon: <BellRing className="text-blue-500" size={24} />,
      title: "Instant Connection",
      desc: "Your complaint is instantly lodged to BMC for optimized pickup scheduling."
    },
    {
      icon: <Tablet className="text-indigo-500" size={24} />,
      title: "Daily Waste Logs",
      desc: "Shopkeepers maintain daily digital logs of waste disposal for transparency."
    },
    {
      icon: <Database className="text-purple-500" size={24} />,
      title: "Admin Oversight",
      desc: "Real-time records help BMC admins monitor compliance across the market."
    }
  ];

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-[#F9FBF7] relative overflow-hidden font-inter">
      {/* Background Texture Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat blur-[100px]"
        style={{ backgroundImage: `url('/C:/Users/admin/.gemini/antigravity/brain/32f2f293-18f2-4136-813e-72585536a434/login_bg_texture_1775586565594.png')` }}
      />
      
      {/* Decoration */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Section: Login Form */}
      <section className="relative z-10 w-full lg:w-[45%] h-full flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md py-8"
        >
          {/* Logo & Header */}
          <div className="mb-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-sm border border-white/50 mb-6"
            >
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            </motion.div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 leading-[1.2]">
              Smart Market <span className="text-emerald-700 block lg:inline">Waste Management System</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm lg:text-base">System Access Portal</p>
          </div>

          {/* Glass Card Form */}
          <div className="glass-card p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3"
                  >
                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-rose-600">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role Toggle */}
              <div className="flex p-1 bg-slate-100/50 rounded-xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setRole('shopkeeper')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs lg:text-sm font-bold rounded-lg transition-all ${
                    role === 'shopkeeper' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Store size={14} /> Shopkeeper
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs lg:text-sm font-bold rounded-lg transition-all ${
                    role === 'admin' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ShieldCheck size={14} /> Admin
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity ID</label>
                  <div className="glass-form-input flex items-center gap-4 group transition-all duration-300">
                    <User className="text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Enter username"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-400"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                  </div>
                  <div className="glass-form-input flex items-center gap-4 group transition-all duration-300">
                    <Lock className="text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0" size={18} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/10 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin text-white" size={20} /> : (
                  <>
                    <span className="text-sm">Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">
                New User? <a href="/signup" className="text-emerald-600 hover:underline">Register Account</a>
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Right Section: Infographic */}
      <section className="relative z-10 hidden lg:flex w-[55%] landing-side-panel items-center justify-center p-12 overflow-hidden">
        <div className="max-w-xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-500/10">
              <CheckCircle2 size={12} /> Market Efficiency Hub
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-slate-800 leading-[1.1] tracking-tighter">
              Sustainable Markets for <span className="text-emerald-600">Smart Cities.</span>
            </h2>
          </motion.div>

          <div className="space-y-6 relative ml-2">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500/30 via-slate-200 to-transparent" />
            {infographicSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-6 relative group"
              >
                <div className="w-10 h-10 shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 mb-0.5">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-normal max-w-sm font-medium">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 p-5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm inline-flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-xs font-black text-slate-700 tracking-tight">Used by 24+ BMC Market Sectors</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Login;

