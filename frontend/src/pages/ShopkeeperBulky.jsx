import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Info, AlertTriangle, CheckCircle, Clock, MapPin, Search, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShopkeeperBulky = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBulky = async () => {
    try {
      const { data } = await axios.get('/api/alerts');
      // Show ALL alerts for Shopkeeper on this dashboard (both Bulky and Report Issues)
      setRequests(data);
    } catch (err) {
      console.error('Error fetching bulky requests', err);
    }
    setLoading(false);
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to remove this request?')) return;
    try {
      await axios.delete(`/api/alerts/${id}`);
      fetchBulky();
    } catch (err) {
      alert('Failed to revoke request: ' + (err?.response?.data?.message || 'Server error'));
    }
  };

  const handleRecomplain = async (id) => {
    // 1. Locate the specific request in state
    const req = requests.find(r => r._id === id);
    if (!req) return;

    // 2. If Resolved, check if 12 hours have passed since resolution
    if (req.status === 'Resolved') {
      const timeSinceUpdate = Date.now() - new Date(req.updatedAt || req.timestamp).getTime();
      if (timeSinceUpdate < 12 * 3600000) {
        alert("You can't re-complain within 12 hours of resolution. Please allow standard logistics time to complete the physical pickup.");
        return;
      }
    }

    if (!window.confirm('Are you sure you want to escalate this and reopen the ticket?')) return;
    try {
      await axios.put(`/api/alerts/${id}`, { status: 'Generated', resolution_message: '' });
      fetchBulky();
    } catch (err) {
      alert('Failed to escalate request: ' + (err?.response?.data?.message || 'Server error'));
    }
  };

  useEffect(() => {
    fetchBulky();
  }, []);

  return (
    <div className="space-y-12">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E65100]/10 text-[#E65100] border border-[#E65100]/20 rounded-full text-xs font-semibold font-medium mb-2">
             <AlertTriangle size={12} /> Priority Logistics
          </div>
          <h1 className="text-4xl font-semibold font-outfit text-[#263238] tracking-tight uppercase">Dispatch & Ticket Hub</h1>
          <p className="text-[#607D8B] font-medium tracking-wide">Track your collection ETAs and emergency ticket statuses in real-time.</p>
        </div>
        
        <div className="flex gap-4">
           <div className="saas-card p-4 flex items-center gap-4 bg-white group cursor-pointer hover:border-[#E65100]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#E65100]/10 text-[#E65100] flex items-center justify-center">
                 <Truck size={20} />
              </div>
              <div>
                 <p className="text-xs font-semibold text-[#607D8B] font-medium leading-none">Next Pickup</p>
                 <p className="text-lg font-bold text-[#263238] uppercase mt-1">~14 Hours</p>
              </div>
           </div>
        </div>
      </motion.header>

      {/* Advisory Panel */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.98 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.2 }}
         className="relative group h-full"
      >
         <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20  opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
         <div className="saas-card p-8 bg-gradient-to-br from-amber-500/[0.03] to-transparent border-[#E65100]/10 flex flex-col md:flex-row items-center gap-8 relative z-10 overflow-hidden">
            <div className="w-20 h-20 rounded-[2rem] bg-[#E65100]/10 text-[#E65100] flex items-center justify-center border border-[#E65100]/20 shadow-inner group-hover:rotate-12 transition-transform duration-500 shrink-0">
               <Info size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-4 text-center md:text-left flex-1">
               <div>
                  <h4 className="text-xl font-semibold font-outfit uppercase tracking-tight text-[#E65100]">Dispatch Guidelines</h4>
                  <p className="text-sm text-[#607D8B] font-medium leading-relaxed mt-1">
                     Requests are synchronized with Sector-07 logistics every 24 hours. Ensure items are tagged with your establishment ID. 
                     Live updates will appear in the registry below as admins assign pickup windows.
                  </p>
               </div>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {['Sector-07 Sync', 'Automatic Queueing', 'Live Status'].map(badge => (
                     <span key={badge} className="px-3 py-1.5 bg-white border border-[#E0E0E0] rounded-xl text-xs font-semibold font-medium text-[#607D8B]">
                        {badge}
                     </span>
                  ))}
               </div>
            </div>
         </div>
      </motion.div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-lg font-semibold font-outfit font-medium text-[#263238] flex items-center gap-3">
             <Truck size={20} className="text-[#E65100]" /> Active Service & Ticket Requests
           </h2>
           <div className="flex items-center gap-4 text-xs font-semibold uppercase text-[#607D8B] tracking-widest">
              <span className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-2.5 py-1 rounded-lg border border-green-500/10">● SYSTEM LIVE</span>
           </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
           <AnimatePresence mode="popLayout">
              {requests.map((req, idx) => (
                <motion.div 
                  layout
                  key={req._id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: "circOut" }}
                  className="saas-card p-1 bg-white/40 relative group overflow-hidden"
                >
                  <div className="p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                     <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center border border-[#E0E0E0] text-[#607D8B] group-hover:bg-[#E65100]/10 group-hover:text-[#E65100] group-hover:border-[#E65100]/20 transition-all duration-500 shadow-inner">
                           <Truck size={32} />
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold font-outfit uppercase tracking-tight text-[#263238] group-hover:text-[#E65100] transition-colors">
                                 {req.comments?.includes('BULKY') ? `Dispatch Req. #${(req._id || req.alert_id).slice(-6).toUpperCase()}` : `Issue Tkt. #${(req._id || req.alert_id).slice(-6).toUpperCase()}`}
                              </h3>
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-[0.2em] border ${
                                 req.status === 'Resolved' 
                                    ? 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20' 
                                    : 'bg-[#0D47A1]/10 text-[#0D47A1] border-[#0D47A1]/20'
                              }`}>
                                 {req.status === 'Resolved' ? 'RESOLVED' : 'QUEUED'}
                              </span>
                           </div>
                           <div className="flex flex-wrap items-center gap-4 text-xs font-bold font-medium text-[#607D8B] text-slate-600">
                              <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full group-hover:text-[#607D8B] transition-colors">
                                 <Calendar size={14} /> Registered: {new Date(req.timestamp).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full group-hover:text-[#607D8B] transition-colors">
                                 <Clock size={14} /> Time: {new Date(req.timestamp).toLocaleTimeString()}
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full group-hover:text-[#E65100] transition-colors uppercase">
                                 <MapPin size={14} /> Bin: {req.dustbin_id?.dustbin_id || 'Zone-Alpha'}
                              </span>
                           </div>
                           <p className="text-sm font-medium text-[#607D8B] mt-2 italic bg-[#F5F7F6] p-2 rounded-lg border border-[#E0E0E0]">
                                "{req.comments || 'No description provided for this request.'}"
                           </p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                        <div className="flex-1 lg:flex-none text-right px-4 space-y-1">
                           <p className={`text-xs font-semibold font-medium leading-none ${req.status === 'Resolved' ? 'text-[#2E7D32]' : 'text-slate-700'}`}>
                              {req.status === 'Resolved' ? 'Collection Target / Message' : 'Wait Metric'}
                           </p>
                           <p className={`text-sm font-semibold group-hover:text-[#263238] transition-colors capitalize ${req.status === 'Resolved' ? 'text-[#2E7D32]' : 'text-[#607D8B]'}`}>
                              {req.status === 'Resolved' 
                                 ? req.resolution_message 
                                 : `~${((Date.now() - new Date(req.timestamp).getTime()) / 3600000).toFixed(1)}h Wait`}
                           </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 mt-2">
                            {/* Re-complain: Allowed for 3 days after resolution, but locked for the first 12h */}
                            {((req.status === 'Resolved' && (Date.now() - new Date(req.updatedAt || req.timestamp).getTime() < 259200000)) || 
                              (req.status === 'Generated' && (Date.now() - new Date(req.timestamp).getTime() > 60000))) && (
                                <button 
                                   onClick={() => handleRecomplain(req._id)}
                                   title={req.status === 'Resolved' ? 'Solution Disagreement' : 'Escalate delay (Protocol trigger: 12h)'}
                                   className="h-10 px-4 bg-white hover:bg-rose-500/10 hover:text-rose-500 text-rose-500 font-semibold text-xs rounded-xl transition-all border border-rose-500/20 active:scale-95 shadow-sm whitespace-nowrap"
                                >
                                   Re-complain
                                </button>
                            )}

                            {/* Verify & Close: Always visible for Resolved tickets until manually removed */}
                            {req.status === 'Resolved' && (
                                <button 
                                   onClick={() => handleRevoke(req._id)}
                                   className="h-10 px-4 bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-lg shadow-[#2E7D32]/20 whitespace-nowrap"
                                >
                                   Verify & Close
                                </button>
                            )}

                            {/* Revoke Request: Only if NOT Resolved */}
                            {req.status !== 'Resolved' && (
                                <button 
                                   onClick={() => handleRevoke(req._id)}
                                   className="h-10 px-6 bg-slate-100 hover:bg-rose-500/10 hover:text-rose-500 text-[#607D8B] font-semibold text-xs rounded-xl transition-all border border-[#E0E0E0] active:scale-95 shadow-sm whitespace-nowrap"
                                >
                                   Revoke Request
                                </button>
                            )}
                        </div>
                     </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-amber-500/5 to-transparent skew-x-[45deg] translate-x-32 group-hover:translate-x-16 transition-transform duration-1000" />
                </motion.div>
              ))}
           </AnimatePresence>

           {!loading && requests.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="saas-card p-24 text-center space-y-6"
              >
                <div className="w-24 h-24 bg-white border border-[#E0E0E0] rounded-[3rem] flex items-center justify-center mx-auto text-slate-800 shadow-inner group overflow-hidden relative">
                   <div className="absolute inset-0 bg-[#2E7D32]/5 animate-pulse" />
                   <CheckCircle size={48} className="relative z-10 text-[#2E7D32]/40" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-semibold font-outfit text-[#263238] uppercase tracking-tight">Queue Depleted</h3>
                   <p className="text-slate-600 text-sm max-w-xs mx-auto font-medium">All special collection protocols are either completed or have not been initialized.</p>
                </div>
                <div className="pt-4">
                   <button className="px-8 py-3 bg-slate-50 border border-[#E0E0E0] rounded-2xl text-xs font-semibold uppercase tracking-[0.3em] text-[#607D8B] hover:text-[#263238] transition-all">
                      Initialization Guide
                   </button>
                </div>
              </motion.div>
           )}
        </div>
      </section>
    </div>
  );
};

export default ShopkeeperBulky;
