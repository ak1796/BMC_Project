import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertCircle, Search, Filter, ShieldCheck, 
  TrendingUp, Download, RefreshCw, CheckCircle2, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminFines = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Pending', 'Paid'
    const [stats, setStats] = useState({ total_pending: 0, total_collected: 0, count: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [finesRes, statsRes] = await Promise.all([
                axios.get('/api/fines'),
                axios.get('/api/fines/stats')
            ]);
            setFines(finesRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching fines:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (fineId) => {
        if (!window.confirm('Confirm manual payment settlement for this penalty?')) return;
        
        try {
            await axios.put(`/api/fines/${fineId}/pay`);
            fetchData();
        } catch (err) {
            alert('Settlement failed. Re-attempt later.');
        }
    };

    const handleSync = async () => {
        if (!window.confirm('Trigger global fine synchronization? This will check all shops for inactivity.')) return;
        
        try {
            const res = await axios.post('/api/fines/sync');
            alert(`Sync complete! ${res.data.count} new fines issued.`);
            fetchData();
        } catch (err) {
            alert('Sync failed.');
        }
    };

    const filteredFines = fines.filter(f => {
        const matchesSearch = 
            f.shop_id?.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.shop_id?.shop_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterStatus === 'All' || f.status === filterStatus;
        
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 pb-20">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h2 className="text-4xl font-black font-outfit uppercase tracking-tighter text-white">Fines & Dues</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-500" /> Administrative Penalty Compliance Hub
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSync}
                        className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-slate-950 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> Trigger Global Sync
                    </button>
                    <button className="w-12 h-12 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all flex items-center justify-center border border-white/5">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 bg-gradient-to-br from-slate-900 to-rose-500/5 border-rose-500/10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <AlertCircle size={14} className="text-rose-500" /> Outstanding Penalties
                        </p>
                        <h3 className="text-4xl font-black text-white font-outfit tracking-tighter">Rs. {stats.total_pending}</h3>
                        <p className="text-[10px] font-bold text-rose-500 mt-2 uppercase tracking-widest">Awaiting Settlement</p>
                    </div>
                </div>

                <div className="glass-card p-8 bg-gradient-to-br from-slate-900 to-emerald-500/5 border-emerald-500/10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <TrendingUp size={14} className="text-emerald-500" /> Total Collected
                        </p>
                        <h3 className="text-4xl font-black text-white font-outfit tracking-tighter">Rs. {stats.total_collected}</h3>
                        <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-widest">Financial Compliance</p>
                    </div>
                </div>

                <div className="glass-card p-8 bg-gradient-to-br from-slate-900 to-blue-500/5 border-blue-500/10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <History size={14} className="text-blue-500" /> Violation Count
                        </p>
                        <h3 className="text-4xl font-black text-white font-outfit tracking-tighter">{stats.count}</h3>
                        <p className="text-[10px] font-bold text-blue-500 mt-2 uppercase tracking-widest">Lifetime Total Records</p>
                    </div>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-600 transition-colors group-hover:text-emerald-500" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="SEARCH BY SHOP NAME, ID OR REASON..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/5 focus:border-emerald-500/50 rounded-3xl py-5 pl-16 pr-8 text-sm font-bold text-white tracking-wider outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)]"
                    />
                </div>
                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 shrink-0">
                    {['All', 'Pending', 'Paid'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filterStatus === status 
                                ? 'bg-slate-800 text-white shadow-lg' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* LIST */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-white/5">
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Shop & Establishment</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Violation Context</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Trail</th>
                                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status / Outcome</th>
                                <th className="p-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mr-4" />
                                        <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Processing Ledger...</p>
                                    </td>
                                </tr>
                            ) : filteredFines.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center opacity-30">
                                        <Search size={48} className="mx-auto mb-4" />
                                        <p className="font-black uppercase tracking-widest text-xs">No records matching criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredFines.map(fine => (
                                    <tr key={fine._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-xs text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all border border-transparent">
                                                    {fine.shop_id?.shop_id?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-100 text-sm tracking-wide">{fine.shop_id?.shop_name || 'N/A'}</p>
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">ID: {fine.shop_id?.shop_id || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-xs font-bold text-slate-300 leading-relaxed max-w-xs">{fine.reason}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-xs font-bold text-slate-100">{new Date(fine.issuedAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{new Date(fine.issuedAt).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest ${
                                                    fine.status === 'Paid' 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse-slow'
                                                }`}>
                                                    {fine.status.toUpperCase()}
                                                </span>
                                                <p className="text-[14px] font-black text-white font-outfit mt-1 tracking-tighter">Rs. {fine.amount}</p>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            {fine.status === 'Pending' && (
                                                <button 
                                                    onClick={() => handleMarkAsPaid(fine._id)}
                                                    className="w-10 h-10 bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all rounded-xl border border-white/5 flex items-center justify-center group/btn active:scale-90"
                                                    title="Mark as Settled"
                                                >
                                                    <CheckCircle2 size={20} className="transition-transform group-hover/btn:scale-110" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFines;
