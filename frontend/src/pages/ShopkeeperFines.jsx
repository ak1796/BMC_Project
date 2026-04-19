import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertCircle, ShieldCheck, History, 
  TrendingDown, CheckCircle2, ArrowRight, CreditCard, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { loadScript } from '../utils/loadScript';


const ShopkeeperFines = () => {
    const { user } = useAuth();
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_pending: 0, total_settled: 0 });
    const [payingId, setPayingId] = useState(null);

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

    const handleSettleFine = async (fine) => {
        setPayingId(fine._id);
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setPayingId(null);
            return;
        }

        try {
            const { data: orderData } = await axios.post('/api/payment/create-order', {
                fineId: fine._id
            });

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: 'INR',
                name: 'BMC Smart Waste Manager',
                description: 'Fine Settlement',
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        await axios.post('/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            fineId: fine._id
                        });
                        alert('Payment Successful!');
                        fetchFines();
                    } catch (err) {
                        alert('Payment verification failed.');
                        console.error('Verify error:', err);
                    } finally {
                        setPayingId(null);
                    }
                },
                modal: {
                    ondismiss: function() {
                        setPayingId(null);
                    }
                },
                prefill: {
                    name: user?.name || 'Shopkeeper',
                    email: user?.email || 'shopkeeper@example.com',
                    contact: user?.phone || '9999999999'
                },
                theme: {
                    color: '#2E7D32'
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error('Payment Error:', err);
            alert('Could not initiate payment. ' + (err.response?.data?.message || err.message));
            setPayingId(null);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* HEADER */}
            <div className="pb-6 border-b border-[#E0E0E0]">
                <h2 className="text-4xl font-semibold font-outfit uppercase tracking-tighter text-[#263238]">Fines & Dues</h2>
                <p className="text-xs font-semibold text-[#607D8B] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <ShieldCheck size={12} className={stats.total_pending > 0 ? 'text-rose-500' : 'text-[#2E7D32]'} /> 
                    Official BMC Penalty Ledger & Compliance
                </p>
            </div>

            {/* PERFORMANCE BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-[2.5rem] border transition-all ${
                    stats.total_pending > 0 
                    ? 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_50px_-12px_rgba(244,63,94,0.1)]' 
                    : 'bg-[#2E7D32]/5 border-[#2E7D32]/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)]'
                }`}>
                    <p className="text-xs font-semibold text-[#263238]/40 font-medium mb-2">Currently Outstanding</p>
                    <div className="flex items-end gap-3 transition-transform">
                        <h3 className={`text-5xl font-semibold font-outfit tracking-tighter ${stats.total_pending > 0 ? 'text-rose-500' : 'text-[#2E7D32]'}`}>
                            Rs. {stats.total_pending}
                        </h3>
                        {stats.total_pending > 0 && <AlertCircle size={24} className="text-rose-500 mb-2 animate-pulse" />}
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-white border border-[#E0E0E0] shadow-inner flex flex-col justify-center">
                    <p className="text-xs font-semibold text-[#607D8B] font-medium mb-2 flex items-center gap-2">
                        <TrendingDown size={14} className="text-[#2E7D32]" /> Lifetime Settled
                    </p>
                    <h3 className="text-4xl font-semibold text-[#263238] font-outfit tracking-tighter">Rs. {stats.total_settled}</h3>
                    <p className="text-xs font-bold text-slate-600 mt-2 font-medium leading-none">Compliant Records Found</p>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ACTIVE FINES */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-sm font-semibold font-medium text-[#607D8B]">Transaction Registry</h4>
                        <span className="text-xs font-semibold text-slate-600 uppercase bg-white px-3 py-1 rounded-full border border-[#E0E0E0]">
                            {fines.length} Records
                        </span>
                    </div>

                    <div className="saas-card divide-y divide-[#E0E0E0] overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="w-10 h-10 border-4 border-[#2E7D32]/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-xs font-semibold text-[#607D8B] font-medium animate-pulse">Syncing Ledger...</p>
                            </div>
                        ) : fines.length === 0 ? (
                            <div className="p-20 text-center bg-[#2E7D32]/[0.02]">
                                <Receipt size={48} className="mx-auto text-[#2E7D32]/20 mb-4" />
                                <p className="font-semibold font-medium text-xs text-[#2E7D32]/40">Financial Standing: Excellent</p>
                            </div>
                        ) : (
                            fines.map(fine => (
                                <div key={fine._id} className="p-8 hover:bg-white/[0.01] transition-all group relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-[#607D8B] font-medium">
                                                {new Date(fine.issuedAt).toLocaleDateString()} • REF: #{fine._id.slice(-6).toUpperCase()}
                                            </p>
                                            {fine.razorpay_payment_id && (
                                                <p className="text-[10px] font-bold text-[#2E7D32] mt-1 bg-[#2E7D32]/10 inline-block px-2 py-0.5 rounded uppercase tracking-widest">
                                                    Payment ID: {fine.razorpay_payment_id}
                                                </p>
                                            )}
                                            <h4 className="text-lg font-bold text-[#263238] tracking-tight">{fine.reason}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-semibold text-[#263238] font-outfit tracking-tighter">Rs. {fine.amount}</p>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-semibold tracking-widest border ${
                                                fine.status === 'Paid' 
                                                ? 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20' 
                                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
                                            }`}>
                                                {fine.status === 'Paid' ? 'SETTLED' : 'OVERDUE'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {fine.status === 'Pending' && (
                                        <button 
                                            onClick={() => handleSettleFine(fine)}
                                            disabled={payingId === fine._id}
                                            className={`w-full mt-2 py-4 rounded-2xl text-xs font-semibold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                                                payingId === fine._id 
                                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                                : 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-500/20'
                                            }`}
                                        >
                                            {payingId === fine._id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard size={16} /> Settle Penalty Now <ArrowRight size={14} />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SIDEBAR INFO */}
                <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-white border border-[#E0E0E0] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110">
                            <ShieldCheck size={120} />
                        </div>
                        <h4 className="text-sm font-bold text-[#263238] mb-4 relative z-10">Policy Notice</h4>
                        <p className="text-xs font-bold text-[#607D8B] leading-relaxed mb-6 relative z-10">
                            The BMC Smart Waste system automatically monitors daily waste log contributions. Missing for 3 consecutive days results in an automated financial penalty.
                        </p>
                        <ul className="space-y-4 relative z-10">
                            <li className="flex items-center gap-3 text-xs font-semibold text-[#607D8B] font-medium">
                                <CheckCircle2 size={14} className="text-[#2E7D32]" /> Immutable Audit Trail
                            </li>
                            <li className="flex items-center gap-3 text-xs font-semibold text-[#607D8B] font-medium">
                                <CheckCircle2 size={14} className="text-[#2E7D32]" /> Digital Receipt Issuance
                            </li>
                            <li className="flex items-center gap-3 text-xs font-semibold text-[#607D8B] font-medium">
                                <CheckCircle2 size={14} className="text-[#2E7D32]" /> Real-time Compliance Hub
                            </li>
                        </ul>
                    </div>

                    <div className="p-8 rounded-[2.5rem] border border-[#E0E0E0] bg-[#F9FBF7] text-center">
                        <History size={32} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-xs font-semibold text-[#607D8B] font-medium mb-1">Need Clarification?</p>
                        <p className="text-xs font-bold text-[#607D8B] underline cursor-pointer hover:text-[#263238] transition-colors tracking-tight">Contact your assigned BMC Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopkeeperFines;
