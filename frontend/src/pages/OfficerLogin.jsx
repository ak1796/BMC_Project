import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OfficerLogin = () => {
  const [formData, setFormData] = useState({ employeeId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/officers/login', formData);
      login(data);
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBF7] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-900/20 border-2 border-slate-800">
            <ShieldCheck size={40} className="text-emerald-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Officer <span className="text-emerald-600">Portal</span></h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Municipal Response Unit Authorization</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-100 p-10 rounded-[40px] shadow-xl space-y-8 relative overflow-hidden">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
            >
              <Info size={14} /> {error}
            </motion.div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee Identity</label>
              <div className="relative group">
                <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="text" required placeholder="EX: BMC-OFF-XXXXXX"
                  style={{ paddingLeft: '75px' }}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-50 focus:border-emerald-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Credential</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="password" required placeholder="••••••••"
                  style={{ paddingLeft: '75px' }}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-50 focus:border-emerald-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><ArrowRight size={20} strokeWidth={2.5} /> Login</>}
          </button>

          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">
            Authorized Personnel Only &copy; 2026 BMC
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const Info = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export default OfficerLogin;
