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
    if (!window.confirm('Are you sure you want to revoke this request?')) return;
    try {
      await axios.delete(`/api/alerts/${id}`);
      fetchBulky();
    } catch (err) {
      alert('Failed to revoke request: ' + (err?.response?.data?.message || 'Server error'));
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
             <AlertTriangle size={12} /> Priority Logistics
          </div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tight uppercase">Dispatch & Ticket Hub</h1>
          <p className="text-slate-500 font-medium tracking-wide">Track your collection ETAs and emergency ticket statuses in real-time.</p>
        </div>
        
        <div className="flex gap-4">
           <div className="glass-card p-4 flex items-center gap-4 bg-slate-900 group cursor-pointer hover:border-amber-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                 <Truck size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Next Pickup</p>
                 <p className="text-lg font-bold text-white uppercase mt-1">~14 Hours</p>
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
         <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-[100px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
         <div className="glass-card p-8 bg-gradient-to-br from-amber-500/[0.03] to-transparent border-amber-500/10 flex flex-col md:flex-row items-center gap-8 relative z-10 overflow-hidden">
            <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-inner group-hover:rotate-12 transition-transform duration-500 shrink-0">
               <Info size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-4 text-center md:text-left flex-1">
               <div>
                  <h4 className="text-xl font-black font-outfit uppercase tracking-tight text-amber-200">Dispatch Guidelines</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed mt-1">
                     Requests are synchronized with Sector-07 logistics every 24 hours. Ensure items are tagged with your establishment ID. 
                     Live updates will appear in the registry below as admins assign pickup windows.
                  </p>
               </div>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {['Sector-07 Sync', 'Automatic Queueing', 'Live Status'].map(badge => (
                     <span key={badge} className="px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {badge}
                     </span>
                  ))}
               </div>
            </div>
         </div>
      </motion.div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-lg font-black font-outfit uppercase tracking-widest text-slate-200 flex items-center gap-3">
             <Truck size={20} className="text-amber-500" /> Active Service & Ticket Requests
           </h2>
           <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">
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
                  className="glass-card p-1 bg-slate-900/40 relative group overflow-hidden"
                >
                  <div className="p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                     <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800 flex items-center justify-center border border-white/5 text-slate-500 group-hover:bg-amber-500/10 group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all duration-500 shadow-inner">
                           <Truck size={32} />
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <h3 className="text-lg font-black font-outfit uppercase tracking-tight text-white group-hover:text-amber-500 transition-colors">
                                 {req.comments?.includes('BULKY') ? `Dispatch Req. #${(req._id || req.alert_id).slice(-6).toUpperCase()}` : `Issue Tkt. #${(req._id || req.alert_id).slice(-6).toUpperCase()}`}
                              </h3>
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-[0.2em] border ${
                                 req.status === 'Resolved' 
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                                 {req.status === 'Resolved' ? 'RESOLVED' : 'QUEUED'}
                              </span>
                           </div>
                           <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">
                              <span className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full group-hover:text-slate-300 transition-colors">
                                 <Calendar size={14} /> Registered: {new Date(req.timestamp).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full group-hover:text-slate-300 transition-colors">
                                 <Clock size={14} /> Time: {new Date(req.timestamp).toLocaleTimeString()}
                              </span>
                              <span className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full group-hover:text-amber-500 transition-colors uppercase">
                                 <MapPin size={14} /> Bin: {req.dustbin_id?.dustbin_id || 'Zone-Alpha'}
                              </span>
                           </div>
                           <p className="text-sm font-medium text-slate-300 mt-2 italic bg-black/20 p-2 rounded-lg border border-white/5">
                                "{req.comments || 'No description provided for this request.'}"
                           </p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="flex-1 lg:flex-none text-right px-4 space-y-1">
                           <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${req.status === 'Resolved' ? 'text-emerald-500' : 'text-slate-700'}`}>
                              {req.status === 'Resolved' ? 'Collection Target / Message' : 'Wait Metric'}
                           </p>
                           <p className={`text-sm font-black group-hover:text-white transition-colors capitalize ${req.status === 'Resolved' ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {req.status === 'Resolved' ? req.resolution_message : '~12.4h'}
                           </p>
                        </div>
                        <button 
                           onClick={() => handleRevoke(req._id)}
                           className="h-14 px-8 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/5 active:scale-95 shadow-lg"
                        >
                           Revoke Request
                        </button>
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
                className="glass-card p-24 text-center space-y-6"
              >
                <div className="w-24 h-24 bg-slate-900 border border-white/[0.03] rounded-[3rem] flex items-center justify-center mx-auto text-slate-800 shadow-inner group overflow-hidden relative">
                   <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                   <CheckCircle size={48} className="relative z-10 text-emerald-500/40" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black font-outfit text-slate-200 uppercase tracking-tight">Queue Depleted</h3>
                   <p className="text-slate-600 text-sm max-w-xs mx-auto font-medium">All special collection protocols are either completed or have not been initialized.</p>
                </div>
                <div className="pt-4">
                   <button className="px-8 py-3 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all">
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
