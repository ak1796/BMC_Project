import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { AlertCircle, Clock, Trash2, MapPin, Search, Filter, CheckCircle2, Activity as ActivityIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await axios.get('/api/alerts');
        // Filter out resolved alerts if we only want to show active ones
        setAlerts(data.filter(a => a.status !== 'Resolved'));
      } catch (err) {
        console.error('Error alerts', err);
      }
      setLoading(false);
    };
    fetchAlerts();

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    newSocket.on('new_alert', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    return () => newSocket.close();
  }, []);

  const handleDispatch = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`/api/alerts/${id}`, { status: 'Dispatched' });
      setAlerts(prev => prev.map(a => (a._id === id || a.alert_id === id) ? { ...a, status: 'Dispatched' } : a));
    } catch (err) {
      console.error('Failed to dispatch alert', err);
      alert('Error: Could not dispatch alert. ' + (err.response?.data?.message || ''));
    }
    setActionLoading(null);
  };

  const handleResolve = async (id) => {
    const eta = window.prompt('Enter ETA for collection (e.g. "1-2 hours", "Today by 5PM")');
    if (eta === null) return; // User cancelled
    
    setActionLoading(id);
    try {
      await axios.put(`/api/alerts/${id}`, { 
        status: 'Resolved', 
        resolution_message: eta.trim() ? `Your waste will be collected in ${eta.trim()}.` : 'Your issue has been resolved and pickup is scheduled.' 
      });
      setAlerts(prev => prev.filter(a => (a._id !== id && a.alert_id !== id)));
    } catch (err) {
      console.error('Failed to resolve alert', err);
      alert('Error: Could not resolve alert. ' + (err.response?.data?.message || ''));
    }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this alert?')) return;
    setActionLoading(id);
    try {
      await axios.delete(`/api/alerts/${id}`);
      setAlerts(prev => prev.filter(a => (a._id !== id && a.alert_id !== id)));
    } catch (err) {
      console.error('Failed to delete alert', err);
      alert('Error: Could not delete alert. ' + (err.response?.data?.message || ''));
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-12">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0D47A1]/10 text-[#0D47A1] border border-[#0D47A1]/20 rounded-full text-xs font-semibold font-medium mb-3">
            <ActivityIcon size={12} /> Live Alerts
          </div>
          <h1 className="text-4xl font-semibold font-outfit text-[#263238] tracking-tight uppercase">Admin Alerts</h1>
          <p className="text-[#607D8B] font-medium tracking-wide mt-1">Live updates of all emergency bounds and bulky waste dispatch items.</p>
        </div>

        <div className="flex bg-white border border-[#E0E0E0] focus-within:border-[#0D47A1]/40 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl h-20 items-center gap-6 px-8 group transition-all duration-300">
          <Search size={22} className="text-slate-400 group-focus-within:text-[#0D47A1] transition-colors shrink-0" />
          <input
            type="text"
            placeholder="Search alerts..."
            className="bg-transparent border-none p-0 text-lg font-bold font-medium text-[#263238] focus:ring-0 w-full md:w-80 placeholder:text-slate-400 placeholder:font-medium tracking-wide"
          />
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-24 text-center space-y-6">
            <div className="w-16 h-16 border-4 border-[#E0E0E0] border-t-blue-500 rounded-full mx-auto animate-spin shadow-[0_0_30px_rgba(59,130,246,0.1)]" />
            <p className="text-[#607D8B] text-xs font-semibold uppercase tracking-[0.4em]">Loading History...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#607D8B]">Alerts Queue ({alerts.length})</h2>
              <div className="flex-1 h-px bg-white" />
            </div>

            <AnimatePresence initial={false}>
              {alerts.map((alert, idx) => (
                <motion.div
                  layout
                  key={alert._id || alert.alert_id}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: 30 }}
                  transition={{ type: "spring", damping: 20, stiffness: 150 }}
                  className="saas-card p-1 relative group overflow-hidden border-white/[0.02]"
                >
                  <div className="p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-8 flex-1">
                      <div className="w-20 h-20 rounded-3xl bg-[#0D47A1]/10 text-[#0D47A1] flex items-center justify-center shrink-0 border border-[#0D47A1]/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <AlertCircle size={32} />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-semibold font-outfit uppercase tracking-tight text-[#263238] truncate max-w-sm">{alert.shop_id?.shop_name || 'Activity'}</h4>
                        </div>
                        <p className="text-[13px] text-[#607D8B] font-medium leading-relaxed max-w-2xl line-clamp-2">
                          {alert.comments || 'No details provided.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold font-medium text-slate-600">
                          <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 rounded-xl group-hover:bg-slate-100 transition-colors">
                            <Clock size={16} /> {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 rounded-xl group-hover:bg-slate-100 transition-colors capitalize">
                            <MapPin size={16} /> Bin: {alert.dustbin_id?.dustbin_id || 'LOCAL-01'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 self-end lg:self-center">
                      {alert.status === 'Generated' && (
                        <button 
                          onClick={() => handleDispatch(alert._id || alert.alert_id)}
                          disabled={actionLoading === (alert._id || alert.alert_id)}
                          className="flex-1 lg:flex-none h-14 px-8 bg-[#0D47A1] text-white rounded-2xl text-xs font-semibold font-medium shadow-xl shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          {actionLoading === (alert._id || alert.alert_id) ? <Loader2 size={18} className="animate-spin" /> : 'Dispatch'}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleResolve(alert._id || alert.alert_id)}
                        disabled={actionLoading === (alert._id || alert.alert_id)}
                        className="flex-1 lg:flex-none h-14 px-8 bg-[#2E7D32] text-white rounded-2xl text-xs font-semibold font-medium shadow-xl shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {actionLoading === (alert._id || alert.alert_id) ? <Loader2 size={18} className="animate-spin" /> : 'Resolve'}
                      </button>
                      <button 
                        onClick={() => handleDelete(alert._id || alert.alert_id)}
                        disabled={actionLoading === (alert._id || alert.alert_id)}
                        className="h-14 p-4 aspect-square bg-slate-100 text-[#607D8B] rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-[#E0E0E0] active:scale-90 flex items-center justify-center"
                      >
                        {actionLoading === (alert._id || alert.alert_id) ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={22} strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-500/5 to-transparent skew-x-[45deg] translate-x-32 group-hover:translate-x-20 transition-transform duration-1000" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="saas-card p-32 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-[#2E7D32]/5 text-[#2E7D32] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#2E7D32]/10 animate-pulse" />
              <CheckCircle2 size={48} className="relative z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-outfit text-[#263238] uppercase">No Active Alerts</h3>
              <p className="text-slate-600 text-sm max-w-xs mx-auto font-medium">All clear! No pending emergency alerts or bulky waste requests in your jurisdiction.</p>
            </div>
            <div className="pt-4">
              <button className="px-10 py-4 bg-white border border-[#E0E0E0] rounded-2xl text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:text-[#263238] transition-all">
                Refresh Queue
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminAlerts;
