import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, MapPin, Send, Trash2, Globe, Leaf } from 'lucide-react';
import axios from 'axios';

const CitizenReport = () => {
    const [searchParams] = useSearchParams();
    const dustbinId = searchParams.get('dustbin');
    const location = searchParams.get('location');

    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!dustbinId) return;

        setIsSubmitting(true);
        setError('');
        try {
            await axios.post('/api/alerts/public-report', {
                dustbin_id: dustbinId,
                comments: comments || 'Citizen Alert: Immediate attention required.'
            });
            setIsSuccess(true);
        } catch (err) {
            console.error('Failed to submit report', err);
            setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Report Received</h2>
                        <p className="text-slate-500 font-medium">Thank you for contributing to a cleaner city. A municipal response unit has been notified.</p>
                    </div>
                    <button 
                        onClick={() => window.close()}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg"
                    >
                        Close Window
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Abstract Background Decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
                <div className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Globe size={80} />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Leaf size={12} /> Public Service
                        </div>
                        <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter leading-tight">Report Waste <br/><span className="text-emerald-500">Node Issue</span></h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                                <Trash2 size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Node Identified</h4>
                                <p className="text-lg font-black text-slate-900 tracking-tight">{dustbinId || 'Scanning...'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2">
                            <MapPin size={18} className="text-emerald-500" />
                            <span className="text-sm font-bold text-slate-600 truncate">{location || 'Locating site...'}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Report Details (Optional)</label>
                        <textarea 
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="e.g. Bin is overflowing, fire alert, or foul smell..."
                            className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-emerald-500/30 transition-all outline-none resize-none"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isSubmitting || !dustbinId}
                        className="w-full h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-4 transition-all hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl group"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="text-sm font-black uppercase tracking-widest">Submit Alert</span>
                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </button>
                    
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.1em]">
                        Your contribution helps keep the city clean.
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default CitizenReport;
