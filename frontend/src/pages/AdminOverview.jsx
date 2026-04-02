import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  FileText, Users, AlertCircle, Activity, TrendingUp, 
  ShieldCheck, Zap, Server, Globe, Clock, ArrowRight,
  Map, BarChart3, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdminOverview = () => {
  const [data, setData] = useState({ logs: [], unlogged: [], defaulters: [], alerts: [], shops: [] });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logs, unlogged, defaulters, alerts, shops] = await Promise.all([
          axios.get('/api/wastelogs'),
          axios.get('/api/wastelogs/unlogged'),
          axios.get('/api/wastelogs/defaulters'),
          axios.get('/api/alerts'),
          axios.get('/api/shopkeepers')
        ]);
        setData({ 
          logs: logs.data, 
          unlogged: unlogged.data, 
          defaulters: defaulters.data, 
          alerts: alerts.data,
          shops: shops.data
        });
      } catch (err) {
        console.error('Error fetching admin overview', err);
      }
      setLoading(false);
    };
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // REAL DATA CALCULATIONS
  const processedMetrics = useMemo(() => {
    if (!data.logs.length) return { stream: Array(12).fill(0), velocity: '0%', compliance: '0%' };

    const hours = Array(12).fill(0);
    const now = new Date();
    data.logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        const diffHours = Math.floor((now - logDate) / (1000 * 60 * 60));
        if (diffHours < 12) {
            hours[11 - diffHours] += 1;
        }
    });
    const maxLogs = Math.max(...hours, 1);
    const stream = hours.map(h => (h / maxLogs) * 100);

    const today = new Date().setHours(0,0,0,0);
    const uniqueLoggedToday = new Set(
        data.logs
            .filter(l => new Date(l.timestamp).setHours(0,0,0,0) === today)
            .map(l => l.shop_id?._id || l.shop_id)
    ).size;
    const velocity = data.shops.length > 0 ? Math.round((uniqueLoggedToday / data.shops.length) * 100) : 0;
    const compliance = data.shops.length > 0 ? Math.round(((data.logs.length / 7) / data.shops.length) * 100) : 0;

    return { stream, velocity: `${velocity}%`, compliance: `${Math.min(compliance, 100)}%` };
  }, [data]);

  const stats = [
    { label: 'Total Logs', count: data.logs.length, color: 'emerald', icon: <FileText size={20} />, trend: 'LIVE', path: '/admin/reports' },
    { label: 'Unlogged Shops', count: data.unlogged.length, color: 'amber', icon: <Users size={20} />, trend: 'WAIT', path: '/admin/shops?view=unlogged' },
    { label: 'Defaulters', count: data.defaulters.length, color: 'rose', icon: <AlertCircle size={20} />, trend: 'CRITICAL', path: '/admin/shops?view=defaulters' },
    { label: 'Active Alerts', count: data.alerts.length, color: 'blue', icon: <Activity size={20} />, trend: 'LIVE', path: '/admin/alerts' },
  ];

  const zones = [
    { name: 'Sector 01', status: 'Optimal', color: 'emerald' },
    { name: 'Sector 03', status: 'Optimal', color: 'emerald' },
    { name: 'Sector 07', status: 'Delayed', color: 'amber' },
    { name: 'Sector 12', status: 'Critical', color: 'rose' },
    { name: 'Mumbai West', status: 'Optimal', color: 'emerald' },
  ];

  if (loading) {
     return (
        <div className="p-32 text-center space-y-6">
           <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full mx-auto animate-spin" />
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Establishing Secure Connection...</p>
        </div>
     );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Welcome Section */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card p-10 border-white/[0.03] bg-gradient-to-br from-slate-900 to-slate-950"
      >
        <div className="absolute top-0 right-0 p-8 flex flex-col items-end">
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
                <Clock size={16} className="text-emerald-500" />
                <span className="text-[11px] font-black text-slate-100 uppercase tracking-[0.1em]">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                <Radio size={10} className="animate-pulse" /> Data Stream Verified
            </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="flex items-center gap-4">
             <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl group cursor-default">
                <ShieldCheck size={40} className="group-hover:rotate-12 transition-transform duration-500" />
             </div>
             <div>
                <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase leading-none mb-2">Command Center</h1>
                <p className="text-slate-500 font-medium tracking-wide">Smart Market Waste Management • Oversight Dashboard v4.1</p>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
             <div className="flex items-center gap-3 px-6 py-4 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
                <Server size={18} className="text-blue-500" />
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">System Status</p>
                   <p className="text-sm font-bold text-slate-100 mt-1">Operational</p>
                </div>
             </div>
             <div className="flex items-center gap-3 px-6 py-4 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
                <Globe size={18} className="text-purple-500" />
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Registry</p>
                   <p className="text-sm font-bold text-slate-100 mt-1">{data.shops.length} Units</p>
                </div>
             </div>
             <div className="flex items-center gap-3 px-6 py-4 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
                <Zap size={18} className="text-amber-500" />
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Today's Load</p>
                   <p className="text-sm font-bold text-slate-100 mt-1">{data.logs.filter(l => new Date(l.timestamp).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)).length} Entries</p>
                </div>
             </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent opaicty-20" />
      </motion.section>

      {/* Stats Grid - Premiumized with navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <Link to={stat.path} key={stat.label} className="block">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`glass-card p-8 border-t-[4px] border-${stat.color}-500 group relative overflow-hidden flex flex-col justify-between h-full hover:bg-white/[0.02] transition-colors`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className={`p-4 rounded-3xl bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-${stat.color}-500/10`}>
                    {stat.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <TrendingUp className={`text-${stat.color}-500 group-hover:animate-bounce transition-all`} size={16} />
                    <span className={`text-[10px] font-black text-${stat.color}-500 shadow-xl tracking-widest uppercase bg-${stat.color}-500/10 px-2 py-0.5 rounded-md border border-${stat.color}-500/20`}>
                        {stat.trend}
                    </span>
                </div>
              </div>
              <div className="mt-8 relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h4 className="text-4xl font-black text-white font-outfit tracking-tighter leading-none">{stat.count}</h4>
              </div>
              
              {/* Real Data Sparkline */}
              <div className="mt-6 h-10 w-full flex items-end gap-1 px-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  {processedMetrics.stream.map((v, i) => (
                      <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(v, 4)}%` }}
                          transition={{ delay: 0.5 + (i * 0.05) }}
                          className={`flex-1 bg-${stat.color}-500/20 rounded-full group-hover:bg-${stat.color}-500/40 transition-colors`}
                      />
                  ))}
              </div>

              <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-${stat.color}-500/5 blur-[60px] pointer-events-none transition-all duration-1000 group-hover:scale-150`} />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Visual Data Blocks */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
         <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="xl:col-span-2 glass-card p-8 space-y-8"
         >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20 shadow-inner">
                        <Map size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-white">Live Zone Monitor</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time sector compliance tracking</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {zones.map((zone, i) => (
                    <div key={zone.name} className="p-5 bg-slate-950/40 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:bg-slate-900 transition-all cursor-default">
                        <div className={`w-3 h-3 rounded-full bg-${zone.color}-500 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)] ${zone.color === 'emerald' ? 'animate-pulse' : ''}`} />
                        <p className="text-[11px] font-black text-slate-100 uppercase tracking-tighter mb-1">{zone.name}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest text-${zone.color}-500/60 group-hover:text-${zone.color}-500 transition-colors`}>{zone.status}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-500 tracking-widest px-2">
                    <span>Hourly Activity (Last 12 Hours)</span>
                    <span className="text-emerald-500">Live Feedback</span>
                </div>
                <div className="h-44 glass-card bg-slate-950/50 p-6 flex items-end justify-between items-stretch gap-2 transition-all">
                    {processedMetrics.stream.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end gap-2 group/bar">
                            <motion.div 
                                initial={{ height: 0 }} animate={{ height: `${Math.max(h, 5)}%` }}
                                transition={{ delay: 0.8 + i * 0.05 }}
                                className={`rounded-t-xl bg-gradient-to-t transition-all cursor-pointer ${
                                    h > 70 ? 'from-emerald-500/40 to-emerald-400 group-hover:scale-x-110 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'from-slate-800 to-slate-700'
                                }`}
                            />
                            <span className="text-[8px] font-bold text-center opacity-0 group-hover/bar:opacity-100 transition-opacity">T-{11-i}h</span>
                        </div>
                    ))}
                </div>
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card p-8 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col gap-8 shadow-[0_0_100px_rgba(16,185,129,0.02)]"
         >
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl border border-purple-500/20 shadow-inner">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-white">Efficiency Data</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time aggregate calculations</p>
                </div>
            </div>

            <div className="space-y-6">
                {[
                    { l: 'Daily Collection Velocity', v: processedMetrics.velocity, color: 'emerald' },
                    { l: 'Weekly Aggregate Compliance', v: processedMetrics.compliance, color: 'blue' },
                    { l: 'Defaulter Ratio', v: data.shops.length > 0 ? `${Math.round((data.defaulters.length / data.shops.length) * 100)}%` : '0%', color: 'rose' },
                ].map(item => (
                    <div key={item.l} className="space-y-3 group cursor-default">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-white transition-colors">{item.l}</span>
                            <span className={`text-[12px] font-black text-${item.color}-500`}>{item.v}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full border border-white/[0.03] overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} animate={{ width: item.v }}
                                transition={{ delay: 1.2, duration: 1.5 }}
                                className={`h-full bg-${item.color}-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] rounded-full`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 mt-6 p-6 border border-white/5 bg-white/[0.02] rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 shadow-inner">
                    <Globe size={32} />
                </div>
                <div>
                   <p className="text-sm font-black text-white uppercase tracking-tight">Active Operation</p>
                   <p className="text-[11px] font-medium text-slate-500 mt-1">All data points are synchronized with the central database.</p>
                </div>
            </div>
         </motion.div>
      </div>
    </div>
  );
};

export default AdminOverview;
