import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Filter, Mail, Phone, ExternalLink, ShieldCheck, AlertCircle, MapPin, MoreHorizontal, X, User, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopFines, setShopFines] = useState([]);
  const [modalTab, setModalTab] = useState('profile'); // 'profile', 'fines', 'issue'
  const [fineAmount, setFineAmount] = useState(500);
  const [fineReason, setFineReason] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentView = searchParams.get('view'); 

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        let url = '/api/shopkeepers';
        if (currentView === 'unlogged') url = '/api/wastelogs/unlogged';
        if (currentView === 'defaulters') url = '/api/wastelogs/defaulters';
        if (currentView === 'fines') url = '/api/fines';
        
        const { data } = await axios.get(url);
        // If it's the fines view, data is already fine objects
        const processedShops = currentView === 'fines' 
          ? data.map(f => ({ ...f.shop_id, fine_amount: f.amount, fine_id: f._id, fine_status: f.status }))
          : data;
           
        setShops(Array.isArray(processedShops) ? processedShops : []);
      } catch (err) {
        console.error('Error fetching shops', err);
      }
      setLoading(false);
    };
    fetchShops();
  }, [currentView]);

  const handleMarkAsPaid = async (fineId) => {
    if (!window.confirm('Confirm manual payment settlement?')) return;
    try {
      await axios.put(`/api/fines/${fineId}/pay`);
      // Re-fetch fines for the selected shop
      const finesRes = await axios.get(`/api/fines?shop_id=${selectedShop._id}`);
      setShopFines(finesRes.data);
    } catch (err) {
      alert('Settlement failed.');
    }
  };

  useEffect(() => {
    if (selectedShop) {
      const fetchShopFines = async () => {
        try {
          const { data } = await axios.get(`/api/fines?shopId=${selectedShop._id}`);
          setShopFines(data);
        } catch (err) {
          console.error('Error fetching shop fines', err);
        }
      };
      fetchShopFines();
    } else {
      setShopFines([]);
      setModalTab('profile');
    }
  }, [selectedShop]);

  const handleIssueFine = async (e) => {
    e.preventDefault();
    setIssuing(true);
    try {
      await axios.post('/api/fines', {
        shop_id: selectedShop._id,
        amount: fineAmount,
        reason: fineReason
      });
      // Refresh fines
      const { data } = await axios.get(`/api/fines?shopId=${selectedShop._id}`);
      setShopFines(data);
      setModalTab('fines');
      setFineReason('');
    } catch (err) {
      console.error('Error issuing fine', err);
    }
    setIssuing(false);
  };

  const filteredShops = Array.isArray(shops) ? shops.filter(s => {
    const term = search.trim().toLowerCase();
    if (!term) return true;

    const shopName = String(s.shop_name || s.admin_name || s.username || '').toLowerCase();
    const shopId = String(s.shop_id || s.username || '').toLowerCase();
    const location = String(s.location || s.office_location || '').toLowerCase();

    return shopName.includes(term) || shopId.includes(term) || (term.length >= 3 && location.includes(term));
  }) : [];

  const clearFilter = () => {
    setSearchParams({});
    setSearch('');
  };

  return (
    <div className="space-y-12 relative">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-10"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
               <ShieldCheck size={12} /> Verified Registry
            </div>
            {currentView && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  currentView === 'defaulters' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}
              >
                Filtered: {currentView}
              </motion.div>
            )}
          </div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tight uppercase">
            {currentView ? `${currentView} List` : 'Manage Establishments'}
          </h1>
          <p className="text-slate-500 font-medium tracking-wide">
            {currentView 
              ? `Displaying all ${currentView} records flagged by the system.` 
              : 'Directory of all registered shops and administrators.'
            }
          </p>
        </div>
        
        <div className="flex-1 max-w-2xl flex gap-3">
          <div className="flex-1 bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-inner group">
            <Search size={22} className="text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder={`Search in ${currentView || 'registry'}...`} 
              className="bg-transparent border-none p-0 text-sm font-black uppercase tracking-widest focus:ring-0 w-full placeholder:text-slate-700" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {currentView ? (
            <button 
              onClick={clearFilter}
              className="px-6 h-14 bg-rose-500 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
            >
              <RotateCcw size={16} /> Show All
            </button>
          ) : (
            <button className="btn-secondary px-5 h-14 bg-slate-900 border-white/5"><Filter size={24} /></button>
          )}
        </div>
      </motion.header>

      {loading ? (
        <div className="p-32 text-center space-y-6">
           <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full mx-auto animate-spin" />
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Loading {currentView || 'List'}...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredShops.map((shop, idx) => (
              <motion.div 
                key={shop._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-1 group relative overflow-hidden flex flex-col hover:border-emerald-500/20 transition-all duration-500"
              >
                <div className="p-8 space-y-8 flex-1 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 ${
                      currentView === 'defaulters' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-emerald-500'
                    }`}>
                        <AlertCircle size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl ${
                          currentView === 'fines'
                            ? shop.fine_status === 'Paid' ? 'bg-emerald-500 text-white border border-emerald-600 shadow-emerald-500/20' : 'bg-rose-500 text-white border border-rose-600 shadow-rose-500/20'
                            : shop.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                       }`}>
                         {currentView === 'fines' ? `Rs. ${shop.fine_amount} ${shop.fine_status}` : shop.role}
                       </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-2xl font-black font-outfit text-slate-100 group-hover:text-emerald-500 transition-all duration-500 group-hover:scale-105 origin-left leading-tight">
                       {shop.shop_name || shop.admin_name || shop.username}
                    </h4>
                    <p className="inline-block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/[0.03] px-3 py-1 rounded-lg border border-white/[0.05] group-hover:border-emerald-500/20 group-hover:text-emerald-500 transition-all">
                       {shop.shop_id || shop.username}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-tighter pt-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 border border-white/5">
                       <MapPin size={14} />
                    </div>
                    <span className="group-hover:text-slate-200 transition-colors truncate">{shop.location || shop.office_location || 'Not Specified'}</span>
                  </div>
                </div>

                <div className="p-8 border-t border-white/[0.03] bg-white/[0.01] flex items-center justify-between relative z-10">
                  <div className="flex gap-3">
                    {shop.email && (
                      <a href={`mailto:${shop.email}`} className="w-10 h-10 bg-slate-800 rounded-xl text-slate-500 hover:text-white hover:bg-emerald-500/20 transition-all border border-white/5 flex items-center justify-center">
                         <Mail size={18} />
                      </a>
                    )}
                    {(shop.contact_number) && (
                      <a href={`tel:${shop.contact_number}`} className="w-10 h-10 bg-slate-800 rounded-xl text-slate-500 hover:text-white hover:bg-emerald-500/20 transition-all border border-white/5 flex items-center justify-center">
                         <Phone size={18} />
                      </a>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedShop(shop)}
                    className="text-[11px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-2 group/btn"
                  >
                    View Details <ExternalLink size={14} className="transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-full bg-emerald-500/[0.01] skew-x-[-45deg] translate-x-32 group-hover:translate-x-20 transition-transform duration-1000" />
              </motion.div>
            ))}
          </AnimatePresence>
          {(!loading && filteredShops.length === 0) && (
              <div className="col-span-full py-20 text-center glass-card border-dashed">
                 <Search size={48} className="mx-auto text-slate-800 mb-4" />
                 <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No entries found matching your query.</p>
              </div>
          )}
        </div>
      )}

      {/* Modal for Details with Tabs */}
      <AnimatePresence>
        {selectedShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedShop(null)}
               className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 40 }}
               className="glass-card w-full max-w-2xl relative z-10 overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)]"
            >
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                     <User size={20} />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">
                    Establishment Profile
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedShop(null)}
                  className="p-2 text-slate-500 hover:text-white bg-slate-800 hover:bg-rose-500/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-8 py-2 border-b border-white/5 flex gap-8 bg-slate-900/50">
                {['profile', 'fines', 'issue'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={`py-3 text-[10px] font-black uppercase tracking-[0.2em] relative transition-colors ${
                      modalTab === tab ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab === 'profile' ? 'Registration' : tab === 'fines' ? 'Fine History' : 'Manual Penalty'}
                    {modalTab === tab && (
                      <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {modalTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Identification Handle</label>
                      <div className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-6 py-4 rounded-2xl border border-emerald-500/20 tracking-[0.2em] shadow-inner">
                        {selectedShop.shop_id || selectedShop.username}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Full Legal Entity</label>
                        <div className="text-base font-bold text-white tracking-wide">{selectedShop.shop_name || selectedShop.admin_name || 'Not Provided'}</div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Operational Territory</label>
                        <div className="text-base font-bold text-white tracking-wide">{selectedShop.location || selectedShop.office_location || 'Not Provided'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Contact Personnel</label>
                        <div className="text-base font-bold text-slate-300 tracking-wide">{selectedShop.shopkeeper_name || selectedShop.username || 'Not Provided'}</div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Direct Communication</label>
                        <div className="text-base font-bold text-slate-300 tracking-wide">{selectedShop.contact_number || 'Not Provided'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'fines' && (
                  <div className="space-y-6">
                    {shopFines.length === 0 ? (
                      <div className="py-12 text-center bg-slate-900/50 rounded-3xl border border-white/5 border-dashed">
                        <ShieldCheck size={32} className="mx-auto text-slate-700 mb-3" />
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Clean record. No penalties found.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {shopFines.map(fine => (
                          <div key={fine._id} className="p-6 bg-slate-900/80 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                            <div className="space-y-1">
                              <p className="text-white font-bold text-sm tracking-wide">{fine.reason}</p>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(fine.issuedAt).toLocaleDateString()} • {new Date(fine.issuedAt).toLocaleTimeString()}</p>
                            </div>
                             <div className="text-right flex items-center gap-4">
                                <div>
                                  <p className="text-lg font-black text-white font-outfit tracking-tighter">Rs. {fine.amount}</p>
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${fine.status === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {fine.status}
                                  </span>
                                </div>
                                {fine.status === 'Pending' && (
                                  <button 
                                    onClick={() => handleMarkAsPaid(fine._id)}
                                    className="w-8 h-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 transition-all rounded-lg border border-emerald-500/20 flex items-center justify-center p-0"
                                    title="Mark as Paid"
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>
                                )}
                              </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {modalTab === 'issue' && (
                  <form onSubmit={handleIssueFine} className="space-y-8">
                    <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                       <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider leading-relaxed">
                         Note: Manual penalties should only be issued for verified policy violations or missed collections as per BMC guidelines.
                       </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Penalty Value (INR)</label>
                        <div className="grid grid-cols-4 gap-3">
                           {[200, 500, 1000, 2000].map(val => (
                             <button
                               key={val}
                               type="button"
                               onClick={() => setFineAmount(val)}
                               className={`py-4 rounded-xl text-xs font-black border transition-all ${
                                 fineAmount === val 
                                   ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                   : 'bg-slate-950 text-slate-400 border-white/5 hover:border-emerald-500/30'
                               }`}
                             >
                               {val}
                             </button>
                           ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Violation Description</label>
                        <textarea 
                          required
                          value={fineReason}
                          onChange={(e) => setFineReason(e.target.value)}
                          placeholder="EX: Repeated failure to segregate waste..."
                          className="w-full bg-slate-950 border-white/5 rounded-2xl p-5 text-sm text-white placeholder:text-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[120px] resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      disabled={issuing}
                      className="w-full h-16 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {issuing ? 'Processing Violation...' : 'Authenticate Penalty'}
                    </button>
                  </form>
                )}
                
                <div className="pt-10 flex justify-center">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] italic flex items-center gap-2">
                       <ShieldCheck size={12} /> SECURE BMC SYSTEM NODE
                    </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminShops;
