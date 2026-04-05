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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7F6] px-4 sm:px-6 py-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[500px] relative z-10"
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
            Create an account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#607D8B] text-sm"
          >
            Enter your details below to create your account
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
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Role Segmented Control */}
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

            {role === 'admin' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#607D8B]">Admin Username</label>
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="Enter Username"
                    className="w-full h-11"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#607D8B]">Admin Full Name</label>
                  <input
                    name="admin_name"
                    type="text"
                    required
                    placeholder="Enter Full Name"
                    className="w-full h-11"
                    value={formData.admin_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#607D8B]">Office Location</label>
                  <input
                    name="office_location"
                    type="text"
                    required
                    placeholder="Enter Office Location"
                    className="w-full h-11"
                    value={formData.office_location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#607D8B]">Contact No</label>
                    <input
                      name="contact_number"
                      type="text"
                      required
                      placeholder="Phone Number"
                      className="w-full h-11"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#607D8B]">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Email Address"
                      className="w-full h-11"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'shopkeeper' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#607D8B]">Shop Username</label>
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="Choose a unique username"
                    className="w-full h-11"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="block text-sm font-medium text-[#607D8B]">Shop Name</label>
                     <input
                       name="shop_name"
                       type="text"
                       required
                       placeholder="Shop Name"
                       className="w-full h-11"
                       value={formData.shop_name}
                       onChange={handleInputChange}
                     />
                   </div>
                   <div className="space-y-1.5">
                     <label className="block text-sm font-medium text-[#607D8B]">Location</label>
                     <input
                       name="location"
                       type="text"
                       required
                       placeholder="Location/Zone"
                       className="w-full h-11"
                       value={formData.location}
                       onChange={handleInputChange}
                     />
                   </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#607D8B]">Assigned BMC / Admin</label>
                  <select
                    name="admin_id"
                    className="w-full h-11"
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
                          <option key={admin._id} value={admin._id}>
                            {admin.admin_name || admin.username} ({admin.office_location || 'Sector 0'})
                          </option>
                        ))
                      ) : (
                        <option disabled>No BMCs available</option>
                      )
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#607D8B]">Shopkeeper Full Name</label>
                  <input
                    name="shopkeeper_name"
                    type="text"
                    placeholder="Full Name"
                    className="w-full h-11"
                    value={formData.shopkeeper_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#607D8B]">Contact No</label>
                  <input
                    name="contact_number"
                    type="text"
                    placeholder="Phone Number"
                    className="w-full h-11"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#607D8B]">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full h-11"
                value={formData.password}
                onChange={handleInputChange}
              />
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
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex flex-col items-center justify-center gap-4 relative z-10"
        >
          <p className="text-sm text-[#607D8B]">
            Already have an account?{' '}
            <a href="/login" className="text-[#2E7D32] font-medium hover:text-[#2E7D32]">
              Sign in
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
