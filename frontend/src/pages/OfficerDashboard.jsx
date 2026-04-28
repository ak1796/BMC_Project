import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Clock, MapPin, Truck, AlertTriangle, 
  LogOut, ShieldCheck, Mail, Phone, Info,
  ExternalLink, ChevronRight, Navigation, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OfficerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/officers/me');
      setData(data);
    } catch (err) {
      console.error('Error fetching officer profile', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleComplete = async () => {
    if (!data?.currentTask) return;
    
    setCompleting(true);
    try {
      await axios.post('/api/officers/complete-task', {
        taskId: data.currentTask._id,
        taskType: data.currentTask.taskType
      });
      alert('Mission Accomplished. Your status has been reset to Available.');
      fetchProfile();
    } catch (err) {
      alert('Update failed: ' + (err?.response?.data?.message || 'Server error'));
    }
    setCompleting(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/officer/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9FBF7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <ShieldCheck size={48} className="text-emerald-500" />
        </motion.div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Establishing Secure Uplink...</p>
      </div>
    </div>
  );

  const { officer, currentTask } = data;

  return (
    <div className="min-h-screen bg-[#F9FBF7]">
      {/* Top Navigation */}
      <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tighter italic">BMC <span className="text-emerald-500">Officer Portal</span></h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Duty: {officer.officerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchProfile}
            disabled={loading}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-slate-300 hover:text-white"
            title="Refresh Dashboard"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleLogout}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-slate-300 hover:text-white"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-8 space-y-10">
        {/* Status Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-[40px] border-2 shadow-xl flex items-center justify-between ${
            officer.availabilityStatus === 'Available'
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-orange-600 border-orange-500 text-white shadow-orange-500/20'
          }`}
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              {officer.availabilityStatus === 'Available' ? <UserCheck size={32} /> : <Clock size={32} />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Current Mission Status</p>
              <h3 className="text-4xl font-black uppercase tracking-tighter mt-1">{officer.availabilityStatus}</h3>
            </div>
          </div>
          {officer.availabilityStatus === 'Busy' && (
            <div className="text-right hidden md:block">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Estimated Handover</p>
               <p className="text-2xl font-black uppercase tabular-nums">
                 {new Date(officer.busyUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
            </div>
          )}
        </motion.section>

        {/* Active Assignment */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Live Assignment</h4>
            {currentTask && (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">
                In Progress
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!currentTask ? (
              <motion.div 
                key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white border-2 border-slate-100 p-16 rounded-[48px] text-center space-y-6 border-dashed"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} className="text-emerald-500/30" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Active Tasks</h3>
                   <p className="text-sm font-bold text-slate-400">You are currently on standby. New assignments will appear here.</p>
                   {officer.availabilityStatus === 'Busy' && (
                     <div className="pt-4">
                       <button 
                         onClick={fetchProfile}
                         className="px-6 py-3 bg-orange-100 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-200 transition-all"
                       >
                         Sync Status with HQ
                       </button>
                     </div>
                   )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="task" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-2 border-slate-100 rounded-[48px] shadow-2xl overflow-hidden"
              >
                <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row justify-between gap-8">
                   <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${
                        currentTask.taskType === 'BulkyRequest' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-rose-600 shadow-rose-600/20'
                      }`}>
                         {currentTask.taskType === 'BulkyRequest' ? <Truck size={32} /> : <AlertTriangle size={32} />}
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           {currentTask.taskType === 'BulkyRequest' ? 'Bulky Waste Request' : 'Priority Bin Overflow'}
                         </p>
                         <h3 className="text-3xl font-black uppercase tracking-tighter italic">#{currentTask.alert_id?.slice(-6) || currentTask.request_id?.slice(-6)}</h3>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <a 
                        href={
                          currentTask.taskType === 'Alert' && currentTask.dustbin_id?.lat && currentTask.dustbin_id?.lng
                            ? `https://www.google.com/maps/search/?api=1&query=${currentTask.dustbin_id.lat},${currentTask.dustbin_id.lng}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                (currentTask.shop_id?.location || '') + ' ' + (currentTask.shop_id?.marketArea || '')
                              )}`
                        }
                        target="_blank" rel="noopener noreferrer"
                        className="h-14 px-8 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                      >
                         <Navigation size={18} />
                         <span>Navigate</span>
                      </a>
                   </div>
                </div>

                <div className="p-10 space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Establishment</p>
                            <p className="text-xl font-black text-slate-800 uppercase tracking-tight">{currentTask.shop_id?.shop_name}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precise Location</p>
                            <p className="text-sm font-bold text-slate-600 flex items-start gap-2">
                               <MapPin size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                               {currentTask.shop_id?.location}, {currentTask.shop_id?.marketArea}
                            </p>
                         </div>
                         {currentTask.dustbin_id && (
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset ID (Dustbin)</p>
                              <p className="text-sm font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg inline-block border border-slate-200">
                                 {currentTask.dustbin_id.dustbin_id}
                              </p>
                           </div>
                         )}
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Note</p>
                            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 italic text-sm font-bold text-slate-600 leading-relaxed">
                               "{currentTask.comments || 'Manual inspection of the site is required. Proceed with standard protocol.'}"
                            </div>
                         </div>
                         <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock size={14} /> Assigned {new Date(currentTask.assignedAt).toLocaleTimeString()}
                         </div>
                      </div>
                   </div>

                   <div className="pt-10 border-t-2 border-slate-50">
                      <button 
                        disabled={completing}
                        onClick={handleComplete}
                        className="w-full h-20 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:scale-[1.01] transition-all shadow-2xl shadow-slate-900/30 active:scale-95 disabled:opacity-50"
                      >
                         {completing ? <RefreshCw className="animate-spin" size={24} /> : <><CheckCircle2 size={24} strokeWidth={2.5} /> Mark Mission Complete</>}
                      </button>
                      <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6">
                        Note: This action will restore your status to <span className="text-emerald-600">Available</span> in the Command Center.
                      </p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Help/Contact */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
           <div className="p-8 bg-white border-2 border-slate-100 rounded-[32px] flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                 <Phone size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HQ Support</p>
                 <p className="text-sm font-bold text-slate-800 tracking-tight">+91 22 2262 0251</p>
              </div>
           </div>
           <div className="p-8 bg-white border-2 border-slate-100 rounded-[32px] flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit ID</p>
                 <p className="text-sm font-bold text-slate-800 tracking-tight uppercase tracking-widest">{officer.employeeId}</p>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
};

const UserCheck = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
  </svg>
);

export default OfficerDashboard;
