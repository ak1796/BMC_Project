import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Store, User, Lock, ArrowRight, Loader2, ShieldCheck, MapPin, 
  Phone, Trash2, Mail, Briefcase, QrCode, BellRing, Tablet, Database, CheckCircle2,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import bgTexture from '../assets/bg_texture.png';

const generateShopId = () => {
  const hex = "0123456789ABCDEF";
  const gen = (len) => Array.from({length: len}, () => hex[Math.floor(Math.random() * 16)]).join('');
  return `SHP-${gen(8)}-${gen(4)}`;
};

const Signup = () => {
  const [role, setRole] = useState('shopkeeper');
  const [formData, setFormData] = useState({
    username: '', 
    shop_id: '',
    password: '',
    shop_name: '',
    shopkeeper_name: '',
    location: '',
    ward: '',
    marketArea: '',
    shopLocation: '',
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
      const response = await fetch('/api/admins');
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
      if (!formData.shop_id || !formData.shop_id.startsWith('SHP-')) {
        setFormData(prev => ({ ...prev, shop_id: generateShopId() }));
      }
    } else {
      setFormData(prev => ({ ...prev, shop_id: '' }));
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
<<<<<<< HEAD
      {/* Background Texture Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center bg-no-repeat blur-[100px]"
        style={{ backgroundImage: `url(${bgTexture})` }}
      />
      
      {/* Decoration */}
=======
      {/* Background Decoration */}
>>>>>>> e2d6bff (feat: scaffold full-stack BMC waste management application including user reporting, admin dashboards, and backend services)
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Section: Signup Form */}
      <section className="relative z-10 w-full lg:w-[45%] h-full flex items-center justify-center p-6 lg:p-12 overflow-y-auto scroll-smooth">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg py-12"
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
            <p className="text-slate-500 font-medium text-sm lg:text-base">Join the efficient market ecosystem.</p>
          </div>

          {/* Glass Card Form */}
          <div className="glass-card p-6 lg:p-8 bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl">
            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3"
                  >
                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-xs font-bold text-rose-600">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role Toggle */}
              <div className="flex p-1 bg-slate-100/50 rounded-xl border border-slate-200/50 mb-4">
                <button
                  type="button"
                  onClick={() => setRole('shopkeeper')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs lg:text-sm font-bold rounded-lg transition-all ${
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs lg:text-sm font-bold rounded-lg transition-all ${
                    role === 'admin' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ShieldCheck size={14} /> Admin
                </button>
              </div>

              {/* Conditional Fields */}
              <div className="space-y-4 lg:space-y-5">
                {role === 'admin' ? (
                  <div className="space-y-4 lg:space-y-5">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Username</label>
                           <div className="glass-form-input flex items-center gap-4 group transition-all duration-300">
                             <User className="text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0" size={18} />
                             <input
                               name="username" type="text" required placeholder="Select username"
                               className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700"
                               value={formData.username} onChange={handleInputChange}
                             />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Ward</label>
                           <div className="glass-form-input flex items-center gap-4 group transition-all duration-300">
                             <Navigation className="text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0" size={18} />
                             <input
                               name="ward" type="text" required placeholder="EX: A, B, C-01"
                               className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700"
                               value={formData.ward} onChange={handleInputChange}
                             />
                           </div>
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                        <input
                          name="admin_name" type="text" required placeholder="Official name"
                          className="w-full glass-form-input py-3.5 px-4 bg-white/50 border-slate-200 rounded-2xl text-sm font-bold"
                          value={formData.admin_name} onChange={handleInputChange}
                        />
                     </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Contact</label>
                         <input
                           name="contact_number" type="text" required placeholder="Phone"
                           className="w-full glass-form-input py-3.5 px-4 bg-white/50 border-slate-200 rounded-2xl text-sm font-bold"
                           value={formData.contact_number} onChange={handleInputChange}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                         <input
                           name="email" type="email" required placeholder="Email"
                           className="w-full glass-form-input py-3.5 px-4 bg-white/50 border-slate-200 rounded-2xl text-sm font-bold"
                           value={formData.email} onChange={handleInputChange}
                         />
                      </div>
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Office Location</label>
                        <div className="glass-form-input flex items-center gap-4 group transition-all duration-300">
                          <MapPin className="text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0" size={18} />
                          <input
                            name="office_location" type="text" required placeholder="BMC Zonal Office"
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700"
                            value={formData.office_location} onChange={handleInputChange}
                          />
                        </div>
                     </div>
                  </div>
                ) : (
                   <div className="space-y-4 lg:space-y-5">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Shop ID</label>
                           <div className="glass-form-input flex items-center gap-4 bg-slate-50">
                             <QrCode className="text-slate-400" size={18} />
                             <input
                               name="shop_id" type="text" required
                               className="w-full bg-transparent border-none p-0 focus:ring-0 text-[10px] font-bold text-slate-600"
                               value={formData.shop_id} readOnly
                             />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assigned Ward</label>
                           <div className="glass-form-input flex items-center gap-4 group transition-all duration-300">
                             <Navigation className="text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0" size={18} />
                             <input
                               name="ward" type="text" required placeholder="EX: A-01"
                               className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700"
                               value={formData.ward} onChange={handleInputChange}
                             />
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Login Username</label>
                        <div className="glass-form-input flex items-center gap-4 group transition-all duration-300">
                          <User className="text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0" size={18} />
                          <input
                            name="username" type="text" required placeholder="Select username"
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700"
                            value={formData.username} onChange={handleInputChange}
                          />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Establishment Name</label>
                           <input
                             name="shop_name" type="text" required placeholder="Shop name"
                             className="w-full glass-form-input py-3.5 px-4 bg-white/50 border-slate-200 rounded-2xl text-sm font-bold"
                             value={formData.shop_name} onChange={handleInputChange}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Street Address</label>
                           <input
                             name="location" type="text" required placeholder="Address"
                             className="w-full glass-form-input py-3.5 px-4 bg-white/50 border-slate-200 rounded-2xl text-sm font-bold"
                             value={formData.location} onChange={handleInputChange}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Market Area</label>
                           <input
                             name="marketArea" type="text" placeholder="EX: Crawford Market"
                             className="w-full glass-form-input py-3.5 px-4 bg-white/50 border-slate-200 rounded-2xl text-sm font-bold"
                             value={formData.marketArea} onChange={handleInputChange}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Shop Specific Location</label>
                           <input
                             name="shopLocation" type="text" placeholder="EX: Shop No 4, Block B"
                             className="w-full glass-form-input py-3.5 px-4 bg-white/50 border-slate-200 rounded-2xl text-sm font-bold"
                             value={formData.shopLocation} onChange={handleInputChange}
                           />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Supervising BMC Admin</label>
                        <div className="glass-form-input flex items-center gap-4 group transition-all duration-300">
                           <Briefcase className="text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0" size={18} />
                           <select
                             name="admin_id" className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700 appearance-none"
                             value={formData.admin_id} required onChange={handleInputChange}
                           >
                             <option value="" disabled>Select Sector BMC</option>
                             {loadingAdmins ? (
                               <option disabled>Loading sectors...</option>
                             ) : (
                               admins.map(admin => (
                                 <option key={admin._id} value={admin._id}>
                                   {admin.admin_name || admin.username} ({admin.office_location})
                                 </option>
                               ))
                             )}
                           </select>
                        </div>
                     </div>
                  </div>
                )}

                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                   <div className="glass-form-input flex items-center gap-4 group transition-all duration-300">
                     <Lock className="text-slate-400 group-focus-within:text-emerald-500 transition-colors shrink-0" size={18} />
                     <input
                       name="password" type="password" required placeholder="••••••••"
                       className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700"
                       value={formData.password} onChange={handleInputChange}
                     />
                   </div>
                 </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-900/10 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin text-white" size={20} /> : (
                  <>
                    <span className="text-sm">Authenticate Registration</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">
                Already Registered? <a href="/login" className="text-emerald-600 hover:underline">Sign In Here</a>
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Right Section: Infographic */}
      <section className="relative z-10 hidden lg:flex w-[55%] landing-side-panel items-center justify-center p-12 overflow-hidden bg-slate-50">
        <div className="max-w-xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-500/10">
              <CheckCircle2 size={12} /> Compliance Guaranteed
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold text-slate-800 leading-[1.1] tracking-tighter">
              Unified Municipal <span className="text-emerald-600">Waste Logistics.</span>
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
        </div>
      </section>
    </div>
  );
};

export default Signup;

// Custom AlertCircle icon helper
const AlertCircle = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" width={size} height={size} 
    viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);
