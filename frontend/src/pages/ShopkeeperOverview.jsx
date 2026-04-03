import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { QrCode, ClipboardList, Send, Trash2, ArrowRight, Clock, Plus, BarChart3, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ShopkeeperOverview = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dustbins, setDustbins] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fines, setFines] = useState([]);
  const [showStatement, setShowStatement] = useState(false);
  const [loadingDustbins, setLoadingDustbins] = useState(false);
  const [formData, setFormData] = useState({
    dustbin_id: user?.dustbin_id || '',
    waste_type: 'Dry',
    no_of_bags: 1,
    bulky_request: false
  });

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get('/api/wastelogs');
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs', err);
    }
  };

  const fetchFines = async () => {
    try {
      const { data } = await axios.get('/api/fines');
      if (Array.isArray(data)) {
        setFines(data.sort((a,b) => new Date(b.issuedAt) - new Date(a.issuedAt)));
      }
    } catch (err) {
      console.error('Error fetching fines', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get('/api/alerts');
      // Sort so newest are first
      setAlerts(data.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      console.error('Error fetching alerts', err);
    }
  };

  const fetchDustbins = async () => {
    setLoadingDustbins(true);
    try {
      let response;
      if (user?.admin_id) {
        response = await axios.get(`/api/dustbins/admin/${user.admin_id}`);
      } else {
        // Fallback: fetch all dustbins
        response = await axios.get('/api/dustbins/all');
      }
      if (Array.isArray(response.data) && response.data.length > 0) {
        setDustbins(response.data);
        // Auto-select first available dustbin if none already selected
        setFormData(prev => ({
          ...prev,
          dustbin_id: prev.dustbin_id || response.data[0].dustbin_id
        }));
      }
    } catch (err) {
      console.error('Error fetching dustbins:', err.response?.data || err.message);
    } finally {
      setLoadingDustbins(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchDustbins();
    fetchAlerts();
    fetchFines();
  }, [user]);

  useEffect(() => {
    if (showLogForm && dustbins.length > 0 && !formData.dustbin_id) {
      setFormData(prev => ({ ...prev, dustbin_id: dustbins[0].dustbin_id }));
    }
  }, [showLogForm, dustbins]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        no_of_bags: parseInt(formData.no_of_bags) || 1,
      };
      await axios.post('/api/wastelogs', payload);
      setShowLogForm(false);
      fetchLogs();
      setFormData({ dustbin_id: user?.dustbin_id || '', waste_type: 'Dry', no_of_bags: 1, bulky_request: false });
    } catch (err) {
      alert('Submission failed: ' + (err.response?.data?.message || 'Server error'));
    }
    setLoading(false);
  };

  // REAL DATA CALCULATIONS
  const processedMetrics = useMemo(() => {
    const defaultMetrics = { compliance: '0%', avgVolume: '0', bulkyCount: 0, pendingFinesCount: 0 };
    if (!logs || !logs.length) return defaultMetrics;

    const now = new Date();
    const last7Days = new Date(now.setDate(now.getDate() - 7));
    const recentLogs = logs.filter(l => new Date(l.timestamp) >= last7Days);

    const uniqueDays = new Set(recentLogs.map(l => new Date(l.timestamp).toDateString())).size;
    const compliance = Math.round((uniqueDays / 7) * 100);
    const totalBags = recentLogs.reduce((acc, curr) => acc + (curr.no_of_bags || 0), 0);
    const avgVolume = recentLogs.length > 0 ? (totalBags / recentLogs.length).toFixed(1) : '0';

    const pendingFinesCount = fines.filter(f => f.status === 'Pending').length;

    return { 
        compliance: `${Math.min(compliance, 100)}%`, 
        avgVolume: `${avgVolume} bags`, 
        bulkyCount: logs.filter(l => l.bulky_request).length,
        pendingFinesCount
    };
  }, [logs, fines]);

  const containerStats = [
    { label: 'Total Entries', val: logs.length, icon: <ClipboardList size={22} />, color: 'emerald', path: '/shopkeeper/history' },
    { label: 'Pending Fines', val: processedMetrics.pendingFinesCount, icon: <AlertCircle size={22} />, color: 'rose', path: '/shopkeeper/overview' },
    { label: 'Account Health', val: processedMetrics.compliance, icon: <BarChart3 size={22} />, color: 'blue', path: '/shopkeeper/history' },
  ];

  return (
    <div className="space-y-10">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-outfit tracking-tight text-white capitalize">
            Shopkeeper Dashboard
          </h1>
          <p className="text-slate-500 font-medium tracking-wide">Manage your daily waste compliance and pickup logistics.</p>
        </div>
        <button 
          onClick={() => setShowLogForm(true)}
          className="btn-primary group flex items-center gap-3 px-8 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
        >
          <div className="p-1 bg-slate-950/20 rounded-lg group-hover:rotate-90 transition-transform duration-500">
            <Plus size={20} className="stroke-[3px]" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Add Waste Entry</span>
        </button>
      </motion.header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {containerStats.map((stat, idx) => (
          <Link key={stat.label} to={stat.path} className="block">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`glass-card p-8 border-l-[6px] border-${stat.color}-500 group relative overflow-hidden active:scale-95 transition-all`}
            >
               <div className="flex items-center justify-between relative z-10">
                  <div>
                     <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{stat.label}</p>
                     <p className="text-4xl font-black font-outfit text-white group-hover:scale-110 transition-transform origin-left duration-500">{stat.val}</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20`}>
                     {stat.icon}
                  </div>
               </div>
               <div className={`absolute bottom-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-3xl pointer-events-none group-hover:bg-${stat.color}-500/10 transition-colors`} />
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <section className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-lg font-black font-outfit uppercase tracking-wider text-slate-200">Recent Waste Logs</h3>
               <Link to="/shopkeeper/history" className="text-xs font-black text-emerald-500 hover:text-emerald-400 flex items-center gap-2 tracking-widest uppercase">
                  View Full History <ArrowRight size={14} />
               </Link>
            </div>
            
            <div className="glass-card divide-y divide-white/5 overflow-hidden">
               {logs.slice(0, 5).map((log, idx) => (
                  <motion.div 
                    key={log._id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="p-6 flex items-center justify-between hover:bg-white/[0.02] group transition-all"
                  >
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border transition-all duration-500 group-hover:scale-110 ${
                           log.waste_type === 'Wet' 
                             ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                             : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                           {log.waste_type[0]}
                        </div>
                        <div>
                           <p className="font-bold text-slate-100 text-lg">{log.waste_type} Waste • {log.no_of_bags} Bags</p>
                           <div className="flex items-center gap-3 mt-1.5 font-bold text-[10px] uppercase tracking-widest text-slate-600">
                             <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString()}</span>
                             <span className="w-1 h-1 bg-slate-800 rounded-full" />
                             <span>Bin: {log.dustbin_id?.dustbin_id || 'XN-001'}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        {log.bulky_request && (
                           <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[10px] font-black tracking-widest uppercase">
                              Bulky Action
                           </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-700">{new Date(log.timestamp).toLocaleDateString()}</span>
                     </div>
                  </motion.div>
               ))}
               {logs.length === 0 && (
                  <div className="p-20 text-center space-y-4">
                     <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-center mx-auto text-slate-700 animate-bounce">
                        <ClipboardList size={32} />
                     </div>
                     <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">No active data stream</p>
                  </div>
               )}
            </div>
         </section>

         <section className="space-y-6">
            <h3 className="text-lg font-black font-outfit uppercase tracking-wider text-slate-200 px-2">Performance Summary</h3>
            <div className="glass-card p-8 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 relative overflow-hidden h-[400px]">
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                        <BarChart3 size={24} />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Personal Tracking</p>
                        <p className="text-lg font-bold text-white uppercase">Compliance Matrix</p>
                     </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                     {[
                        { l: 'Weekly Consistency', v: processedMetrics.compliance, c: 'emerald' },
                        { l: 'Avg. Bag Volume', v: processedMetrics.avgVolume, c: 'blue' },
                        { l: 'System Trust Score', v: '9.8', c: 'emerald' }
                     ].map(item => (
                        <div key={item.l} className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase text-slate-600 tracking-tighter">
                              <span>{item.l}</span>
                              <span className={`text-${item.c}-500`}>{item.v}</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/[0.02]">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: item.v.includes('%') ? item.v : '90%' }} 
                                className={`h-full bg-${item.c}-500 rounded-full`}
                                transition={{ duration: 1.5, delay: 0.5 }}
                              />
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
                     <TrendingUp className="text-emerald-500" size={24} />
                     <p className="text-[11px] font-medium text-slate-400">Your compliance is <span className="text-emerald-500 font-black">Top 5%</span> in this sector.</p>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.03] blur-[80px] pointer-events-none" />
            </div>

            {/* NEW TICKET AND ETA SECTION */}
            {/* FINES SECTION */}
            <div className="pt-6">
                <div className="flex items-center justify-between px-2 mb-6">
                    <h3 className="text-lg font-black font-outfit uppercase tracking-wider text-slate-200">Penalties & Dues</h3>
                    <button 
                        onClick={() => setShowStatement(true)}
                        className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-2"
                    >
                        View Statement <ClipboardList size={14} />
                    </button>
                </div>
                
                <div className="glass-card divide-y divide-white/5 overflow-hidden">
                    {fines.filter(f => f.status === 'Pending').length === 0 ? (
                        <div className="p-12 text-center bg-emerald-500/5 items-center flex flex-col gap-3">
                            <ShieldCheck size={32} className="text-emerald-500/30" />
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">No outstanding penalties.</p>
                        </div>
                    ) : (
                        fines.filter(f => f.status === 'Pending').map(f => (
                            <div key={f._id} className="p-6 hover:bg-rose-500/[0.02] transition-colors relative group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight text-rose-500">
                                            Rs. {f.amount} Penalty
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Issued: {new Date(f.issuedAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="px-2 py-1 rounded text-[8px] font-black tracking-widest bg-rose-500/20 text-rose-500 animate-pulse">
                                        OVERDUE
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-slate-300 leading-relaxed">{f.reason}</p>
                                
                                <button 
                                    onClick={async () => {
                                        try {
                                            await axios.put(`/api/fines/${f._id}/pay`);
                                            fetchFines();
                                        } catch (err) {
                                            alert('Payment failed');
                                        }
                                    }}
                                    className="mt-4 w-full py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    Settle Penalty Now
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* STATEMENT MODAL */}
            <AnimatePresence>
                {showStatement && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
                        onClick={() => setShowStatement(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                                <div>
                                    <h3 className="text-2xl font-black font-outfit uppercase tracking-tight text-white">Financial Statement</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Transaction History & Penalties</p>
                                </div>
                                <button onClick={() => setShowStatement(false)} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">✕</button>
                            </div>
                            
                            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                                {fines.length === 0 ? (
                                    <div className="py-20 text-center opacity-30">
                                        <ClipboardList size={48} className="mx-auto mb-4" />
                                        <p className="font-black uppercase tracking-widest text-xs">No transactions recorded</p>
                                    </div>
                                ) : (
                                    fines.map(f => (
                                        <div key={f._id} className="p-5 bg-slate-950/50 rounded-2xl border border-white/5 flex items-center justify-between group">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                                                    f.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}>
                                                    <AlertCircle size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-100 text-sm">{f.reason}</p>
                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                                                        {new Date(f.issuedAt).toLocaleDateString()} • {f.status === 'Paid' ? 'SETTLED' : 'PENDING'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-white font-outfit tracking-tighter">Rs. {f.amount}</p>
                                                <p className={`text-[8px] font-black uppercase tracking-widest ${f.status === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {f.status === 'Paid' ? 'Transaction Success' : 'Awaiting Payment'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="p-8 bg-slate-800/30 border-t border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Outstanding</p>
                                    <p className="text-2xl font-black text-rose-500 font-outfit tracking-tighter">
                                        Rs. {fines.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Lifetime Settled</p>
                                    <p className="text-2xl font-black text-emerald-500 font-outfit tracking-tighter">
                                        Rs. {fines.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pt-6">
                <h3 className="text-lg font-black font-outfit uppercase tracking-wider text-slate-200 px-2 mb-6">Service Tickets & ETA</h3>
                <div className="glass-card divide-y divide-white/5 overflow-hidden max-h-[400px] overflow-y-auto">
                    {alerts.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">No active tickets.</div>
                    ) : (
                        alerts.map(a => (
                            <div key={a._id || a.alert_id} className="p-5 hover:bg-white/[0.02] transition-colors relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xs font-black uppercase text-white truncate max-w-[200px]" title={a.comments}>
                                        {a.comments?.includes('BULKY') ? 'Bulky Waste Request' : 'Emergency Report'}
                                    </h4>
                                    <span className={`px-2 py-1 rounded text-[8px] font-black tracking-widest ${
                                        a.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'
                                    }`}>
                                        {a.status === 'Resolved' ? 'RESOLVED' : 'QUEUE'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-3 truncate">{a.comments || 'No description provided.'}</p>
                                
                                {a.status === 'Resolved' && a.resolution_message && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70 mb-1">Admin ETA Message</p>
                                        <p className="text-xs font-bold text-emerald-400">{a.resolution_message}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
         </section>
      </div>

      {/* Log Form Modal */}
      <AnimatePresence>
        {showLogForm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setShowLogForm(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-emerald-500/5 to-transparent">
                <div>
                   <h3 className="text-2xl font-black font-outfit uppercase tracking-tight text-white">Add Waste Entry</h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Waste Collection Form</p>
                </div>
                <button 
                  onClick={() => setShowLogForm(false)} 
                  className="w-12 h-12 flex items-center justify-center bg-slate-800 text-slate-500 hover:text-white rounded-2xl transition-all active:scale-90"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dustbin ID</label>
                       <div className="relative group">
                          <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-emerald-500 transition-colors z-10" size={20} />
                          <select 
                            style={{ backgroundColor: '#0f172a' }}
                            className="w-full !pl-12 pr-10 h-14 text-sm font-bold tracking-widest appearance-none outline-none border border-white/5 rounded-2xl focus:border-emerald-500/50 transition-colors"
                            value={formData.dustbin_id} 
                            required
                            onChange={(e) => setFormData({...formData, dustbin_id: e.target.value})}
                          >
                            <option value="" disabled>Select Bin</option>
                            {loadingDustbins ? (
                              <option disabled>Loading nodes...</option>
                            ) : (
                              dustbins.map(bin => (
                                <option key={bin._id} value={bin.dustbin_id}>
                                  {bin.dustbin_id} - {bin.location}
                                </option>
                              ))
                            )}
                          </select>
                          <ArrowRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 rotate-90 pointer-events-none" />
                       </div>
                    </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Waste Type</label>
                      <select 
                        className="w-full h-14 text-sm font-bold tracking-widest appearance-none" 
                        value={formData.waste_type} onChange={(e) => setFormData({...formData, waste_type: e.target.value})}
                      >
                        <option>Dry</option><option>Wet</option><option>Electronics</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Number of Bags</label>
                   <input 
                     type="number" min="1" required className="w-full h-14 text-sm font-black tracking-widest"
                     value={formData.no_of_bags} onChange={(e) => setFormData({...formData, no_of_bags: e.target.value === '' ? '' : parseInt(e.target.value)})}
                   />
                </div>

                <motion.label 
                   whileTap={{ scale: 0.98 }}
                   className="flex items-center gap-4 p-5 bg-slate-800/30 rounded-3xl cursor-pointer border border-white/[0.03] hover:border-amber-500/20 transition-all group"
                >
                  <input 
                     type="checkbox" checked={formData.bulky_request} 
                     onChange={(e) => setFormData({...formData, bulky_request: e.target.checked})}
                     className="w-6 h-6 rounded-lg bg-slate-900 border-slate-700 checked:bg-amber-500 transition-all"
                  />
                  <div>
                     <p className="text-sm font-black uppercase tracking-widest text-slate-200 group-hover:text-amber-500 transition-colors">Request Bulky Waste Pickup</p>
                     <p className="text-[10px] font-medium text-slate-500 mt-0.5">Special pickup for large items</p>
                  </div>
                </motion.label>

                <div className="pt-4">
                  <button 
                    type="submit" disabled={loading} 
                    className="w-full btn-primary h-16 flex items-center justify-center gap-3 relative group/submit overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 opacity-0 group-hover/submit:opacity-10 transition-opacity" />
                    {loading ? (
                      <Clock className="animate-spin" size={24} />
                    ) : (
                      <>
                        <Send size={20} className="stroke-[2.5px] transition-transform group-hover/submit:translate-x-1 group-hover/submit:-translate-y-1" />
                        <span className="text-sm font-black uppercase tracking-[0.3em]">Submit Entry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopkeeperOverview;
