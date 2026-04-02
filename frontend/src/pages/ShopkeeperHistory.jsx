import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Filter, Download, Trash2, ClipboardList, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShopkeeperHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.get('/api/wastelogs/export/my-logs', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `waste_logs_${new Date().toLocaleDateString().replace(/\//g,'-')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || 'Server error'));
    }
    setExporting(false);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axios.get('/api/wastelogs');
        setLogs(data);
      } catch (err) {
        console.error('Error fetching logs', err);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const [activeTab, setActiveTab] = useState('Today');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.waste_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.dustbin_id?.dustbin_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const logDate = new Date(log.timestamp);
    const today = new Date();
    
    if (activeTab === 'Today') {
      return logDate.toDateString() === today.toDateString();
    } else if (activeTab === 'Last 7 Days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return logDate >= sevenDaysAgo;
    }
    // For 'All Time'
    return true;
  });

  return (
    <div className="space-y-10">
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tight uppercase">Transmission Logs</h1>
          <p className="text-slate-500 font-medium tracking-wide mt-1">Immutable archive of your establishment's waste submissions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by type or bin..." 
                className="!pl-12 w-64 h-12 bg-slate-900 border-white/[0.05] rounded-2xl text-xs font-bold uppercase tracking-widest focus:w-80 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button onClick={handleExport} disabled={exporting} className="btn-secondary h-12 flex items-center gap-3 px-6 shadow-xl shadow-black/20 disabled:opacity-50">
              <Download size={18} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">{exporting ? 'Exporting...' : 'Export XLSX'}</span>
           </button>
        </div>
      </motion.header>

      <div className="glass-card overflow-hidden border-white/[0.03]">
        <div className="p-5 border-b border-white/5 bg-slate-900/40 flex flex-wrap items-center gap-4">
           {[
              { l: 'Today' },
              { l: 'Last 7 Days' },
              { l: 'All Time', icon: <Calendar size={14} /> }
           ].map(tab => (
              <button 
                key={tab.l}
                onClick={() => setActiveTab(tab.l)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                   activeTab === tab.l ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.icon} {tab.l}
              </button>
           ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/60 text-slate-600 text-[10px] uppercase font-black tracking-widest border-b border-white/[0.02]">
              <tr>
                <th className="px-8 py-6">Identity / Time</th>
                <th className="px-8 py-6 text-center">Protocol Type</th>
                <th className="px-8 py-6">Quantification</th>
                <th className="px-8 py-6">Asset Node</th>
                <th className="px-8 py-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              <AnimatePresence mode="popLayout">
                {filteredLogs.map((log, idx) => (
                  <motion.tr 
                    layout
                    key={log._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-white/[0.02] group transition-all cursor-default"
                  >
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all border border-transparent group-hover:border-emerald-500/20">
                             <ClipboardList size={18} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-200 tracking-tight">#{log._id.slice(-6).toUpperCase()}</p>
                             <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                                <span className="group-hover:text-slate-400 transition-colors">{new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                <span>•</span>
                                <span className="group-hover:text-slate-400 transition-colors">{new Date(log.timestamp).toLocaleTimeString()}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border transition-all ${
                        log.waste_type === 'Wet' 
                          ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                          : 'bg-blue-500/5 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${log.waste_type === 'Wet' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        {log.waste_type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <p className="text-sm font-black text-slate-100">{log.no_of_bags} Packages</p>
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-white/[0.03] inline-block px-2 py-0.5 rounded-lg border border-white/[0.05]">
                             {log.bag_size} Volumetric
                          </p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-400 font-outfit uppercase tracking-tighter">Asset Gateway</span>
                          <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-500 transition-colors uppercase">{log.dustbin_id?.dustbin_id || 'BIN-001'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex flex-col items-end gap-2 group/btn">
                          {log.bulky_request ? (
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-[9px] font-black tracking-[0.2em] uppercase">
                               Bulky Hub Enabled
                            </span>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 group-hover/btn:bg-emerald-500/10 group-hover/btn:text-emerald-500 transition-all border border-transparent group-hover/btn:border-emerald-500/20">
                               <ChevronRight size={16} />
                            </div>
                          )}
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {loading && (
            <div className="p-24 text-center space-y-6">
              <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full mx-auto animate-spin shadow-[0_0_30px_rgba(16,185,129,0.1)]" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Establishing Secure Datastream</p>
            </div>
          )}
          {!loading && filteredLogs.length === 0 && (
            <div className="p-24 text-center space-y-4 bg-white/[0.01]">
              <div className="p-6 bg-slate-900 border border-white/[0.03] rounded-[2.5rem] inline-block mx-auto text-slate-700 animate-pulse">
                 <ClipboardList size={40} />
              </div>
              <h3 className="text-xl font-bold font-outfit text-slate-200 uppercase">Null Records Returned</h3>
              <p className="text-slate-600 text-sm max-w-xs mx-auto font-medium">No transmissions match your current filter parameters or the registry is empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperHistory;
