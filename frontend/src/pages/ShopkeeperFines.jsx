import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertCircle, ShieldCheck, History, 
  TrendingDown, CheckCircle2, ArrowRight, CreditCard, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShopkeeperFines = () => {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_pending: 0, total_settled: 0 });

    useEffect(() => {
        fetchFines();
    }, []);

    const fetchFines = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/fines');
            setFines(res.data);
            
            // Calculate stats
            const pending = res.data.filter(f => f.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
            const settled = res.data.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
            setStats({ total_pending: pending, total_settled: settled });
        } catch (err) {
            console.error('Error fetching shopkeeper fines:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSettleFine = async (fineId) => {
        try {
            await axios.put(`/api/fines/${fineId}/pay`);
            fetchFines();
        } catch (err) {
            alert('Payment failed. Please try again.');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* HEADER */}
            <div className="pb-6 border-b border-white/5">
                <h2 className="text-4xl font-black font-outfit uppercase tracking-tighter text-white">Fines & Dues</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <ShieldCheck size={12} className={stats.total_pending > 0 ? 'text-rose-500' : 'text-emerald-500'} /> 
                    Official BMC Penalty Ledger & Compliance
                </p>
            </div>

            {/* PERFORMANCE BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-[2.5rem] border transition-all ${
                    stats.total_pending > 0 
                    ? 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_50px_-12px_rgba(244,63,94,0.1)]' 
                    : 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)]'
                }`}>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Currently Outstanding</p>
                    <div className="flex items-end gap-3 transition-transform">
                        <h3 className={`text-5xl font-black font-outfit tracking-tighter ${stats.total_pending > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            Rs. {stats.total_pending}
                        </h3>
                        {stats.total_pending > 0 && <AlertCircle size={24} className="text-rose-500 mb-2 animate-pulse" />}
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 shadow-inner flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingDown size={14} className="text-emerald-500" /> Lifetime Settled
                    </p>
                    <h3 className="text-4xl font-black text-white font-outfit tracking-tighter">Rs. {stats.total_settled}</h3>
                    <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-widest leading-none">Compliant Records Found</p>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ACTIVE FINES */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Transaction Registry</h4>
                        <span className="text-[10px] font-black text-slate-600 uppercase bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                            {fines.length} Records
                        </span>
                    </div>

                    <div className="glass-card divide-y divide-white/5 overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Syncing Ledger...</p>
                            </div>
                        ) : fines.length === 0 ? (
                            <div className="p-20 text-center bg-emerald-500/[0.02]">
                                <Receipt size={48} className="mx-auto text-emerald-500/20 mb-4" />
                                <p className="font-black uppercase tracking-[0.2em] text-[10px] text-emerald-500/40">Financial Standing: Excellent</p>
                            </div>
                        ) : (
                            fines.map(fine => (
                                <div key={fine._id} className="p-8 hover:bg-white/[0.01] transition-all group relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                {new Date(fine.issuedAt).toLocaleDateString()} • REF: #{fine._id.slice(-6).toUpperCase()}
                                            </p>
                                            <h4 className="text-lg font-bold text-white tracking-tight">{fine.reason}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-white font-outfit tracking-tighter">Rs. {fine.amount}</p>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest border ${
                                                fine.status === 'Paid' 
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
                                            }`}>
                                                {fine.status === 'Paid' ? 'SETTLED' : 'OVERDUE'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {fine.status === 'Pending' && (
                                        <button 
                                            onClick={() => handleSettleFine(fine._id)}
                                            className="w-full mt-2 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
                                        >
                                            <CreditCard size={16} /> Settle Penalty Now <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SIDEBAR INFO */}
                <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110">
                            <ShieldCheck size={120} />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4 relative z-10">Policy Notice</h4>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed mb-6 relative z-10">
                            The BMC Smart Waste system automatically monitors daily waste log contributions. Missing for 3 consecutive days results in an automated financial penalty.
                        </p>
                        <ul className="space-y-4 relative z-10">
                            <li className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <CheckCircle2 size={14} className="text-emerald-500" /> Immutable Audit Trail
                            </li>
                            <li className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <CheckCircle2 size={14} className="text-emerald-500" /> Digital Receipt Issuance
                            </li>
                            <li className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <CheckCircle2 size={14} className="text-emerald-500" /> Real-time Compliance Hub
                            </li>
                        </ul>
                    </div>

                    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-slate-900 to-slate-800 text-center">
                        <History size={32} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Need Clarification?</p>
                        <p className="text-xs font-bold text-slate-400 underline cursor-pointer hover:text-white transition-colors tracking-tight">Contact your assigned BMC Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopkeeperFines;
