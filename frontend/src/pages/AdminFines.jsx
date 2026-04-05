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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E0E0E0]">
                <div>
                    <h2 className="text-4xl font-semibold font-outfit uppercase tracking-tighter text-[#263238]">Fines & Dues</h2>
                    <p className="text-xs font-semibold text-[#607D8B] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-[#2E7D32]" /> Administrative Penalty Compliance Hub
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSync}
                        className="px-6 py-3 bg-[#2E7D32]/10 hover:bg-[#2E7D32] text-[#2E7D32] hover:text-[#263238] border border-[#2E7D32]/20 rounded-2xl text-xs font-semibold font-medium transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> Trigger Global Sync
                    </button>
                    <button className="w-12 h-12 bg-slate-100 rounded-2xl text-[#607D8B] hover:text-[#263238] transition-all flex items-center justify-center border border-[#E0E0E0]">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="saas-card p-8 bg-[#F5F7F6] border border-[#E0E0E0] to-rose-500/5 border-rose-500/10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-xs font-semibold text-[#607D8B] font-medium mb-2 flex items-center gap-2">
                           <AlertCircle size={14} className="text-rose-500" /> Outstanding Penalties
                        </p>
                        <h3 className="text-4xl font-semibold text-[#263238] font-outfit tracking-tighter">Rs. {stats.total_pending}</h3>
                        <p className="text-xs font-bold text-rose-500 mt-2 font-medium">Awaiting Settlement</p>
                    </div>
                </div>

                <div className="saas-card p-8 bg-[#F5F7F6] border border-[#E0E0E0] to-emerald-500/5 border-[#2E7D32]/10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-xs font-semibold text-[#607D8B] font-medium mb-2 flex items-center gap-2">
                           <TrendingUp size={14} className="text-[#2E7D32]" /> Total Collected
                        </p>
                        <h3 className="text-4xl font-semibold text-[#263238] font-outfit tracking-tighter">Rs. {stats.total_collected}</h3>
                        <p className="text-xs font-bold text-[#2E7D32] mt-2 font-medium">Financial Compliance</p>
                    </div>
                </div>

                <div className="saas-card p-8 bg-[#F5F7F6] border border-[#E0E0E0] to-blue-500/5 border-[#0D47A1]/10 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-xs font-semibold text-[#607D8B] font-medium mb-2 flex items-center gap-2">
                           <History size={14} className="text-[#0D47A1]" /> Violation Count
                        </p>
                        <h3 className="text-4xl font-semibold text-[#263238] font-outfit tracking-tighter">{stats.count}</h3>
                        <p className="text-xs font-bold text-[#0D47A1] mt-2 font-medium">Lifetime Total Records</p>
                    </div>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-600 transition-colors group-hover:text-[#2E7D32]" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="SEARCH BY SHOP NAME, ID OR REASON..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/50 border border-[#E0E0E0] focus:border-[#2E7D32]/50 rounded-3xl py-5 pl-16 pr-8 text-sm font-bold text-[#263238] tracking-wider outline-none transition-all placeholder:text-slate-600 focus:shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)]"
                    />
                </div>
                <div className="flex bg-white/50 p-1.5 rounded-2xl border border-[#E0E0E0] shrink-0">
                    {['All', 'Pending', 'Paid'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-3 rounded-xl text-xs font-semibold font-medium transition-all ${
                                filterStatus === status 
                                ? 'bg-slate-100 text-[#263238] shadow-lg' 
                                : 'text-[#607D8B] hover:text-[#607D8B]'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* LIST */}
            <div className="saas-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-100/50 border-b border-[#E0E0E0]">
                                <th className="p-6 text-xs font-semibold text-[#607D8B] font-medium">Shop & Establishment</th>
                                <th className="p-6 text-xs font-semibold text-[#607D8B] font-medium">Violation Context</th>
                                <th className="p-6 text-xs font-semibold text-[#607D8B] font-medium">Audit Trail</th>
                                <th className="p-6 text-xs font-semibold text-[#607D8B] font-medium">Status / Outcome</th>
                                <th className="p-6 text-right text-xs font-semibold text-[#607D8B] font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E0E0E0]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="w-12 h-12 border-4 border-[#2E7D32]/20 border-t-emerald-500 rounded-full animate-spin mx-auto mr-4" />
                                        <p className="mt-4 text-xs font-semibold text-[#607D8B] font-medium animate-pulse">Processing Ledger...</p>
                                    </td>
                                </tr>
                            ) : filteredFines.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center opacity-30">
                                        <Search size={48} className="mx-auto mb-4" />
                                        <p className="font-semibold font-medium text-xs">No records matching criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredFines.map(fine => (
                                    <tr key={fine._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-xs text-[#607D8B] group-hover:text-[#2E7D32] group-hover:border-[#2E7D32]/20 transition-all border border-transparent">
                                                    {fine.shop_id?.shop_id?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#263238] text-sm tracking-wide">{fine.shop_id?.shop_name || 'N/A'}</p>
                                                    <p className="text-xs font-semibold text-slate-600 font-medium mt-1">ID: {fine.shop_id?.shop_id || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-xs font-bold text-[#607D8B] leading-relaxed max-w-xs">{fine.reason}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-xs font-bold text-[#263238]">{new Date(fine.issuedAt).toLocaleDateString()}</p>
                                            <p className="text-xs font-semibold text-slate-600 font-medium mt-1">{new Date(fine.issuedAt).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-widest ${
                                                    fine.status === 'Paid' 
                                                    ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20' 
                                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse-slow'
                                                }`}>
                                                    {fine.status.toUpperCase()}
                                                </span>
                                                <p className="text-[14px] font-semibold text-[#263238] font-outfit mt-1 tracking-tighter">Rs. {fine.amount}</p>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            {fine.status === 'Pending' && (
                                                <button 
                                                    onClick={() => handleMarkAsPaid(fine._id)}
                                                    className="w-10 h-10 bg-slate-100 text-[#607D8B] hover:text-[#2E7D32] hover:bg-[#2E7D32]/10 transition-all rounded-xl border border-[#E0E0E0] flex items-center justify-center group/btn active:scale-90"
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
