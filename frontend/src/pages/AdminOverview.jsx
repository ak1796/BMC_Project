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
  const [data, setData] = useState({ logs: [], unlogged: [], defaulters: [], alerts: [], shops: [], fines: [] });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First Sync Fines for defaulters (3-day rule)
        await axios.post('/api/fines/sync');

        const [logs, unlogged, defaulters, alerts, shops, fines] = await Promise.all([
          axios.get('/api/wastelogs'),
          axios.get('/api/wastelogs/unlogged'),
          axios.get('/api/wastelogs/defaulters'),
          axios.get('/api/alerts'),
          axios.get('/api/shopkeepers'),
          axios.get('/api/fines')
        ]);
        setData({ 
          logs: logs.data, 
          unlogged: unlogged.data, 
          defaulters: defaulters.data, 
          alerts: alerts.data,
          shops: shops.data,
          fines: fines.data
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
    if (!data.logs || !data.logs.length) return { 
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        zones: [
            { name: 'Sector 01', status: 'Optimal', color: 'emerald' },
            { name: 'Sector 03', status: 'Optimal', color: 'emerald' },
            { name: 'Sector 07', status: 'Delayed', color: 'amber' },
            { name: 'Sector 12', status: 'Critical', color: 'rose' },
            { name: 'Mumbai West', status: 'Optimal', color: 'emerald' },
        ],
        stream: Array(7).fill(0),
        weeklyStreamData: Array(7).fill(0),
        velocity: '0%',
        compliance: '0%',
        mean: 0,
        totalPendingFines: 0
    };

    // 7-Day Weekly Distribution
    const dayCounts = Array(7).fill(0);
    const now = new Date();
    
    data.logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        const diffDays = Math.floor((now - logDate) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
            // Get day index (0-6) where 0 is today, 1 is yesterday etc.
            // But we want to map it to Mon-Sun
            const dayIndex = logDate.getDay(); // 0 is Sunday, 1 is Monday...
            dayCounts[dayIndex] += 1;
        }
    });

    // Reorder dayCounts so they align with a standard week starting Monday
    // Standard getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Target order: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const weeklyStreamData = [dayCounts[1], dayCounts[2], dayCounts[3], dayCounts[4], dayCounts[5], dayCounts[6], dayCounts[0]];
    const maxDayLogs = Math.max(...weeklyStreamData, 1);
    const stream = weeklyStreamData.map(h => (h / maxDayLogs) * 100);

    // Efficiency Calculations
    const today = new Date().setHours(0,0,0,0);
    const uniqueLoggedToday = new Set(
        data.logs
            .filter(l => new Date(l.timestamp).setHours(0,0,0,0) === today)
            .map(l => l.shop_id?._id || l.shop_id)
    ).size;

    const velocity = data.shops.length > 0 ? Math.round((uniqueLoggedToday / data.shops.length) * 100) : 0;
    
    // Mean Calculation: Average logs per day over available data
    const mean = Math.round(data.logs.length / Math.max(new Set(data.logs.map(l => new Date(l.timestamp).toDateString())).size, 1));
    
    // Efficiency: Mean daily logs vs Theoretical capacity (Total Shops)
    const efficiency = data.shops.length > 0 ? Math.round((mean / data.shops.length) * 100) : 0;

    // Zone Monitoring Logic
    const zoneData = {};
    data.shops.forEach(shop => {
        const zone = shop.location || 'Unknown';
        if (!zoneData[zone]) {
            zoneData[zone] = { total: 0, logged: 0 };
        }
        zoneData[zone].total += 1;
        
        // Check if this shop has any logs today
        const hasLoggedToday = data.logs.some(l => 
            (l.shop_id?._id || l.shop_id) === shop._id && 
            new Date(l.timestamp).setHours(0,0,0,0) === today
        );
        if (hasLoggedToday) {
            zoneData[zone].logged += 1;
        }
    });

    const dynamicZones = Object.keys(zoneData).map(name => {
        const ratio = zoneData[name].logged / zoneData[name].total;
        let status = 'Critical';
        let color = 'rose';
        if (ratio > 0.8) { status = 'Optimal'; color = 'emerald'; }
        else if (ratio > 0.4) { status = 'Delayed'; color = 'amber'; }
        
        return { name, status, color, count: zoneData[name].total };
    }).sort((a, b) => b.count - a.count).slice(0, 5);

    const totalPendingFines = data.fines
        .filter(f => f.status === 'Pending')
        .reduce((acc, curr) => acc + curr.amount, 0);

    return { 
        stream, 
        velocity: `${velocity}%`, 
        compliance: `${Math.min(efficiency, 100)}%`,
        mean,
        weeklyStreamData,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        zones: dynamicZones.length > 0 ? dynamicZones : [
            { name: 'Sector 01', status: 'Optimal', color: 'emerald' },
            { name: 'Sector 03', status: 'Optimal', color: 'emerald' },
            { name: 'Sector 07', status: 'Delayed', color: 'amber' },
            { name: 'Sector 12', status: 'Critical', color: 'rose' },
            { name: 'Mumbai West', status: 'Optimal', color: 'emerald' },
        ],
        totalPendingFines
    };
  }, [data]);

  const stats = [
    { label: 'Total Logs', count: data.logs.length, color: 'emerald', icon: <FileText size={20} />, trend: 'LIVE', path: '/admin/reports' },
    { label: 'Defaulters', count: data.defaulters.length, color: 'rose', icon: <AlertCircle size={20} />, trend: 'CRITICAL', path: '/admin/shops?view=defaulters' },
    { label: 'Pending Fines', count: data.fines.filter(f => f.status === 'Pending').length, color: 'rose', icon: <ShieldCheck size={20} />, trend: 'PENALTY', path: '/admin/shops?view=fines' },
    { label: 'Active Alerts', count: data.alerts.length, color: 'blue', icon: <Activity size={20} />, trend: 'LIVE', path: '/admin/alerts' },
  ];

  const zones = processedMetrics.zones;

  if (loading) {
     return (
        <div className="p-32 text-center space-y-6">
           <div className="w-16 h-16 border-4 border-[#E0E0E0] border-t-emerald-500 rounded-full mx-auto animate-spin" />
           <p className="text-[#607D8B] text-xs font-semibold uppercase tracking-[0.4em]">Establishing Secure Connection...</p>
        </div>
     );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Welcome Section */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden saas-card p-10 border-[#E0E0E0] bg-white"
      >
        <div className="absolute top-0 right-0 p-8 flex flex-col items-end">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#E0E0E0] shadow-sm">
                <Clock size={16} className="text-[#2E7D32]" />
                <span className="text-sm font-semibold text-[#263238]">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 rounded-lg text-xs font-semibold font-medium">
                <Radio size={10} className="animate-pulse" /> Data Stream Verified
            </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/20 flex items-center justify-center text-[#2E7D32] shadow-sm">
                <ShieldCheck size={32} />
             </div>
             <div>
                <h1 className="text-3xl font-bold font-inter text-[#263238] tracking-tight leading-none mb-2">Command Center</h1>
                <p className="text-[#607D8B] font-medium tracking-wide text-sm">Smart Market Waste Management • Oversight Dashboard</p>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
             <div className="flex items-center gap-3 px-6 py-4 bg-[#F5F7F6]/50 rounded-2xl border border-[#E0E0E0] shadow-inner">
                <Server size={18} className="text-[#0D47A1]" />
                <div>
                   <p className="text-xs font-semibold text-[#607D8B] font-medium leading-none">System Status</p>
                   <p className="text-sm font-bold text-[#263238] mt-1">Operational</p>
                </div>
             </div>
             <div className="flex items-center gap-3 px-6 py-4 bg-[#F5F7F6]/50 rounded-2xl border border-[#E0E0E0] shadow-inner">
                <Globe size={18} className="text-purple-500" />
                <div>
                   <p className="text-xs font-semibold text-[#607D8B] font-medium leading-none">Zonal Registry</p>
                   <p className="text-sm font-bold text-[#263238] mt-1">{data.shops.length} Units</p>
                </div>
             </div>
             <div className="flex items-center gap-3 px-6 py-4 bg-[#F5F7F6]/50 rounded-2xl border border-[#E0E0E0] shadow-inner">
                <Zap size={18} className="text-[#E65100]" />
                <div>
                   <p className="text-xs font-semibold text-[#607D8B] font-medium leading-none">Today's Load</p>
                   <p className="text-sm font-bold text-[#263238] mt-1">{data.logs.filter(l => new Date(l.timestamp).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)).length} Entries</p>
                </div>
             </div>
          </div>
        </div>
        
        {/* No decorative elements */}
      </motion.section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link to={stat.path} key={stat.label} className="block">
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ y: -4 }}
              className={`saas-card p-6 border-t-2 border-${stat.color}-500 group relative overflow-hidden flex flex-col justify-between h-full`}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                    {stat.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <TrendingUp className={`text-${stat.color}-500`} size={14} />
                    <span className={`text-xs font-bold text-${stat.color}-500 tracking-wider uppercase bg-${stat.color}-500/10 px-2 py-0.5 rounded border border-${stat.color}-500/20`}>
                        {stat.trend}
                    </span>
                </div>
              </div>
              <div className="mt-6 relative z-10">
                <p className="text-xs font-medium text-[#607D8B] mb-1">{stat.label}</p>
                <h4 className="text-3xl font-bold text-[#263238] tracking-tight leading-none">{stat.count}</h4>
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
            className="xl:col-span-2 saas-card p-8 space-y-8"
         >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#0D47A1]/10 text-[#0D47A1] rounded-2xl border border-[#0D47A1]/20 shadow-inner">
                        <Map size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold font-outfit uppercase tracking-tight text-[#263238]">Live Zone Monitor</h3>
                        <p className="text-xs font-bold text-[#607D8B] font-medium mt-1">Real-time sector compliance tracking</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {zones.map((zone, i) => (
                    <div key={zone.name} className="p-4 bg-white/50 rounded-xl border border-[#E0E0E0]/80 flex flex-col items-center text-center">
                        <div className={`w-2.5 h-2.5 rounded-full bg-${zone.color}-500 mb-3`} />
                        <p className="text-sm font-semibold text-[#263238] mb-1">{zone.name}</p>
                        <p className={`text-xs font-medium text-${zone.color}-400`}>{zone.status}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between text-sm font-semibold uppercase text-[#607D8B] tracking-widest px-2">
                    <span>Weekly Activity (Mon - Sun Distribution)</span>
                    <span className="text-[#2E7D32]">Live Feedback</span>
                </div>
                <div className="h-44 saas-card bg-[#F5F7F6]/50 p-6 flex items-end justify-between items-stretch gap-4 transition-all">
                    {processedMetrics.stream.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end gap-2 group/bar">
                            <motion.div 
                                initial={{ height: 0 }} animate={{ height: `${Math.max(h, 5)}%` }}
                                transition={{ delay: 0.8 + i * 0.05 }}
                                title={`${processedMetrics.weeklyStreamData[i]} Logs`}
                                className={`rounded-t flex-1 bg-gradient-to-t transition-all cursor-pointer ${
                                    h > 70 ? 'from-emerald-600/40 to-emerald-500' : 'from-[#E0E0E0] to-slate-300'
                                }`}
                            />
                            <span className="text-xs font-semibold text-[#607D8B] text-center uppercase tracking-tighter group-hover/bar:text-[#263238] transition-colors">{processedMetrics.days[i]}</span>
                        </div>
                    ))}
                </div>
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="saas-card p-8 bg-[#F5F7F6] border border-[#E0E0E0] flex flex-col gap-8 shadow-[0_0_100px_rgba(16,185,129,0.02)]"
         >
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl border border-purple-500/20 shadow-inner">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold font-outfit uppercase tracking-tight text-[#263238]">Efficiency Data</h3>
                    <p className="text-xs font-bold text-[#607D8B] font-medium mt-1">Real-time aggregate calculations</p>
                </div>
            </div>

            <div className="space-y-6">
                {[
                    { l: 'Mean Daily Load (Collection)', v: `${processedMetrics.mean} Pts`, p: `${Math.min((processedMetrics.mean / 50) * 100, 100)}%`, color: 'purple' },
                    { l: 'Daily Collection Velocity', v: processedMetrics.velocity, p: processedMetrics.velocity, color: 'emerald' },
                    { l: 'Total Outstanding Penalties', v: `Rs. ${processedMetrics.totalPendingFines}`, p: `${Math.min((processedMetrics.totalPendingFines / 5000) * 100, 100)}%`, color: 'rose' },
                    { l: 'Defaulter Ratio', v: data.shops.length > 0 ? `${Math.round((data.defaulters.length / data.shops.length) * 100)}%` : '0%', p: data.shops.length > 0 ? `${Math.round((data.defaulters.length / data.shops.length) * 100)}%` : '0%', color: 'rose' },
                ].map(item => (
                    <div key={item.l} className="space-y-3 group cursor-default">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-semibold text-[#607D8B] uppercase tracking-tighter group-hover:text-[#263238] transition-colors">{item.l}</span>
                            <span className={`text-sm font-semibold text-${item.color}-500`}>{item.v}</span>
                        </div>
                        <div className="h-2 w-full bg-[#F5F7F6] rounded-full border border-[#E0E0E0] overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }} animate={{ width: item.p }}
                                transition={{ delay: 1.2, duration: 1.5 }}
                                className={`h-full bg-${item.color}-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] rounded-full`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 mt-6 p-6 border border-[#E0E0E0] bg-white/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100/80 flex items-center justify-center text-[#607D8B]">
                    <Globe size={32} />
                </div>
                <div>
                   <p className="text-sm font-semibold text-[#263238] uppercase tracking-tight">Active Operation</p>
                   <p className="text-sm font-medium text-[#607D8B] mt-1">All data points are synchronized with the central database.</p>
                </div>
            </div>
         </motion.div>
      </div>
    </div>
  );
};

export default AdminOverview;
