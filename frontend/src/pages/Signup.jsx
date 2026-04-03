import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, Lock, ArrowRight, Loader2, ShieldCheck, MapPin, Phone, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const Signup = () => {
  const [role, setRole] = useState('shopkeeper');
  const [formData, setFormData] = useState({
    username: '', // Used for admin
    password: '',
    shop_name: '',
    shopkeeper_name: '',
    location: '',
    admin_id: '',
    dustbin_id: '',
    contact_number: '',
    admin_name: '',
    office_location: '',
    email: ''
  });
  
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);


  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const response = await fetch('/api/admins'); // Usually this should be public or handle auth if needed
      const data = await response.json();
      if (Array.isArray(data)) {
        setAdmins(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, admin_id: data[0]._id }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch admins", err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (role === 'shopkeeper') {
      fetchAdmins();
    }
  }, [role]);



  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signup(role, formData);

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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse-soft" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full delay-1000 animate-pulse-soft" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[500px] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] overflow-hidden mb-6 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
          >
            <img src={logo} alt="BMC Logo" className="w-full h-full object-cover" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-white mb-2 font-outfit tracking-tight"
          >
            Registration
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 font-medium tracking-wide mx-auto max-w-[280px]"
          >
            Create an account to access the dashboard.
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
            <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-slate-800/60 mb-6 relative z-10 w-full backdrop-blur-md overflow-hidden">
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

            {role === 'admin' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Username</label>
                  <div className="relative group/input">
                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input
                      name="username"
                      type="text"
                      required
                      placeholder="Enter Username"
                      className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Full Name</label>
                  <div className="relative group/input">
                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input
                      name="admin_name"
                      type="text"
                      required
                      placeholder="Enter Full Name"
                      className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide"
                      value={formData.admin_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Office Location</label>
                  <div className="relative group/input">
                    <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input
                      name="office_location"
                      type="text"
                      required
                      placeholder="Enter Office Location"
                      className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide"
                      value={formData.office_location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact No</label>
                    <div className="relative group/input">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                      <input
                        name="contact_number"
                        type="text"
                        required
                        placeholder="Phone Number"
                        className="w-full !pl-11 h-14 text-sm font-semibold tracking-wide"
                        value={formData.contact_number}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative group/input">
                      <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Email Address"
                        className="w-full !pl-11 h-14 text-sm font-semibold tracking-wide"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}


            {role === 'shopkeeper' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Shop Username</label>
                  <div className="relative group/input">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input
                      name="username"
                      type="text"
                      required
                      placeholder="Choose a unique username"
                      className="w-full !pl-11 h-14 text-sm font-semibold tracking-wide"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Shop Name</label>
                     <div className="relative group/input">
                       <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                       <input
                         name="shop_name"
                         type="text"
                         required
                         placeholder="Shop Name"
                         className="w-full !pl-11 h-14 text-sm font-semibold tracking-wide"
                         value={formData.shop_name}
                         onChange={handleInputChange}
                       />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                     <div className="relative group/input">
                       <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                       <input
                         name="location"
                         type="text"
                         required
                         placeholder="Location/Zone"
                         className="w-full !pl-11 h-14 text-sm font-semibold tracking-wide"
                         value={formData.location}
                         onChange={handleInputChange}
                       />
                     </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned BMC / Admin</label>
                  <div className="relative group/input">
                    <ShieldCheck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 z-10" />
                    <select
                      name="admin_id"
                      style={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', color: '#ffffff' }}
                      className="w-full !pl-12 pr-10 h-14 text-sm font-bold tracking-widest appearance-none outline-none border rounded-2xl relative z-0 focus:border-emerald-500/50 transition-colors"
                      value={formData.admin_id}
                      required
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Select assigned BMC</option>
                      {loadingAdmins ? (
                        <option disabled>Loading BMCs...</option>
                      ) : (
                        admins.length > 0 ? (
                          admins.map(admin => (
                            <option key={admin._id} value={admin._id} style={{ backgroundColor: '#0f172a' }}>
                              {admin.admin_name || admin.username} ({admin.office_location || 'Sector 0'})
                            </option>
                          ))
                        ) : (
                          <option disabled>No BMCs available</option>
                        )
                      )}
                    </select>
                    <ArrowRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 rotate-90 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Shopkeeper Full Name</label>
                  <div className="relative group/input">
                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input
                      name="shopkeeper_name"
                      type="text"
                      placeholder="Full Name"
                      className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide"
                      value={formData.shopkeeper_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact No</label>
                  <div className="relative group/input">
                    <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input
                      name="contact_number"
                      type="text"
                      placeholder="Phone Number"
                      className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group/input">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full !pl-12 h-14 text-sm tracking-widest"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-3 h-14 group/btn shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="text-sm uppercase font-black tracking-widest">Create Account</span>
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
          className="mt-8 flex flex-col items-center justify-center gap-4 relative z-10"
        >
          <p className="text-xs font-bold text-slate-500 tracking-wide">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors uppercase font-black tracking-widest ml-1 text-[10px]">
              Sign In
            </a>
          </p>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure Network</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
