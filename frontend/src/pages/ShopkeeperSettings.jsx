import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Settings, User, Store as StoreIcon, MapPin, Phone, Lock, Save, Loader2, CheckCircle2, Building2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShopkeeperSettings = () => {
  const { user, login } = useAuth(); // login won't work perfectly unless we just update the localStorage user. Or we can just use set state
  const [formData, setFormData] = useState({
    shop_name: user?.shop_name || '',
    shopkeeper_name: user?.shopkeeper_name || '',
    location: user?.location || '',
    contact_number: user?.contact_number || '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [assignedAdmin, setAssignedAdmin] = useState(null);

  // Fetch assigned BMC admin info
  useEffect(() => {
    if (user?.admin_id) {
      axios.get('/api/admins')
        .then(({ data }) => {
          const adminIdToMatch = typeof user.admin_id === 'object' ? user.admin_id._id : user.admin_id;
          const found = data.find(a => a._id === adminIdToMatch || a._id.toString() === adminIdToMatch?.toString() || a._id === user.admin_id);
          if (found) {
            setAssignedAdmin(found);
          } else {
            setAssignedAdmin({ admin_name: 'No Matching Admin Found', office_location: 'Check DB connection' });
          }
        })
        .catch(() => {
          setAssignedAdmin({ admin_name: 'Error Loading Admin', office_location: 'Network Error' });
        });
    }
  }, [user]);

  // Hydrate form if user prop hydrates later
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        shop_name: user.shop_name || prev.shop_name,
        shopkeeper_name: user.shopkeeper_name || prev.shopkeeper_name,
        location: user.location || prev.location,
        contact_number: user.contact_number || prev.contact_number
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data } = await axios.put('/api/shopkeepers/profile', formData);
      // Update local storage
      const existingUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...existingUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess(true);
      setFormData(prev => ({ ...prev, password: '' })); // clear password after success
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 rounded-full text-xs font-semibold font-medium mb-3">
             <Settings size={12} /> Configuration
          </div>
          <h1 className="text-4xl font-semibold font-outfit text-[#263238] tracking-tight uppercase">Profile Settings</h1>
          <p className="text-[#607D8B] font-medium tracking-wide">Update your personal identifiers, location, and credentials.</p>
        </div>
      </motion.header>

      {/* Assigned BMC Admin Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="saas-card p-6 border-l-4 border-[#2E7D32]"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#2E7D32]/10 text-[#2E7D32] rounded-xl flex items-center justify-center border border-[#2E7D32]/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#607D8B] font-medium">Assigned Authority</p>
            <p className="text-sm font-semibold text-[#263238] uppercase tracking-wide">BMC Administrator</p>
          </div>
        </div>
        {assignedAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 font-medium">Admin Name</p>
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#2E7D32]" />
                <p className="text-sm font-bold text-[#263238]">{assignedAdmin.admin_name || '—'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 font-medium">Office Location</p>
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-[#2E7D32]" />
                <p className="text-sm font-bold text-[#263238]">{assignedAdmin.office_location || '—'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 font-medium">Contact</p>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#2E7D32]" />
                <p className="text-sm font-bold text-[#263238]">{assignedAdmin.contact_number || assignedAdmin.email || '—'}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 font-medium">
            {user?.admin_id ? 'Loading admin info...' : 'No BMC administrator assigned yet.'}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSubmit} className="saas-card p-8 lg:p-10 space-y-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <AnimatePresence>
             {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 text-[13px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3">
                   {error}
                </motion.div>
             )}
             {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 text-[13px] font-bold text-[#2E7D32] bg-[#2E7D32]/10 border border-[#2E7D32]/30 rounded-2xl flex items-center gap-3">
                   <CheckCircle2 size={18} /> Profile updated successfully!
                </motion.div>
             )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2 md:col-span-2 mb-2">
              <label className="text-xs font-semibold text-[#2E7D32] font-medium ml-1">Assigned Shop ID (Immutable)</label>
              <div className="relative group/input">
                <StoreIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E7D32]/70" />
                <input
                  type="text"
                  readOnly
                  disabled
                  title="Your unique identification node cannot be manually altered"
                  value={user?.shop_id || 'Authenticating...'}
                  className="w-full !pl-12 h-14 text-sm font-semibold tracking-widest bg-[#2E7D32]/5 text-[#2E7D32] border-[#2E7D32]/30 cursor-not-allowed shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2 mb-2">
              <label className="text-xs font-semibold text-[#2E7D32] font-medium ml-1">Shop Username (Immutable)</label>
              <div className="relative group/input">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E7D32]/70" />
                <input
                  type="text"
                  readOnly
                  disabled
                  value={user?.username || 'Not assigned'}
                  className="w-full !pl-12 h-14 text-sm font-semibold tracking-widest bg-[#2E7D32]/5 text-[#2E7D32] border-[#2E7D32]/30 cursor-not-allowed shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#607D8B] font-medium ml-1">Entity Name (Shop)</label>
              <div className="relative group/input">
                <StoreIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-[#2E7D32]" />
                <input
                  type="text"
                  readOnly
                  disabled
                  placeholder="Retail / Establishment Name"
                  className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide bg-white/50 cursor-not-allowed opacity-70"
                  value={formData.shop_name}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#607D8B] font-medium ml-1">Shopkeeper Name</label>
              <div className="relative group/input">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-[#2E7D32]" />
                <input
                  type="text"
                  readOnly
                  disabled
                  placeholder="Full Name"
                  className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide bg-white/50 cursor-not-allowed opacity-70"
                  value={formData.shopkeeper_name}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#607D8B] font-medium ml-1">Geographic Location</label>
              <div className="relative group/input">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-[#2E7D32]" />
                <input
                  type="text"
                  readOnly
                  disabled
                  placeholder="Sector / Zone / Address"
                  className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide bg-white/50 cursor-not-allowed opacity-70"
                  value={formData.location}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#607D8B] font-medium ml-1">Contact Details</label>
              <div className="relative group/input">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-[#2E7D32]" />
                <input
                  type="text"
                  required
                  placeholder="Phone / Email"
                  className="w-full !pl-12 h-14 text-sm font-semibold tracking-wide"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2 mt-4 pt-8 border-t border-[#E0E0E0]">
               <h3 className="text-sm font-bold text-[#263238] mb-4 font-medium">Security</h3>
               <label className="text-xs font-semibold text-[#607D8B] font-medium ml-1">New Password (Optional)</label>
               <div className="relative group/input">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within/input:text-[#2E7D32]" />
                  <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className="w-full !pl-12 h-14 text-sm tracking-widest"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
               </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
             <button
                type="submit"
                disabled={loading}
                className="btn-primary h-14 px-10 flex items-center justify-center gap-3"
             >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span className="text-sm uppercase font-semibold tracking-widest">Save Settings</span>
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ShopkeeperSettings;
