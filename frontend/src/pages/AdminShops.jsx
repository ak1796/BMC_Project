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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 rounded-full text-xs font-semibold font-medium">
               <ShieldCheck size={12} /> Verified Registry
            </div>
            {currentView && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-medium border ${
                  currentView === 'defaulters' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-[#E65100]/10 text-[#E65100] border-[#E65100]/20'
                }`}
              >
                Filtered: {currentView}
              </motion.div>
            )}
          </div>
          <h1 className="text-4xl font-semibold font-outfit text-[#263238] tracking-tight uppercase">
            {currentView ? `${currentView} List` : 'Manage Establishments'}
          </h1>
          <p className="text-[#607D8B] font-medium tracking-wide">
            {currentView 
              ? `Displaying all ${currentView} records flagged by the system.` 
              : 'Directory of assigned shops and administrators.'
            }
          </p>
        </div>
        
        <div className="flex-1 max-w-2xl flex gap-3">
          <div className="flex-1 bg-white border border-[#E0E0E0] rounded-2xl px-6 py-4 flex items-center gap-4 shadow-inner group">
            <Search size={22} className="text-slate-600 group-focus-within:text-[#2E7D32] transition-colors" />
            <input 
              type="text" 
              placeholder={`Search in ${currentView || 'registry'}...`} 
              className="bg-transparent border-none p-0 text-sm font-semibold font-medium focus:ring-0 w-full placeholder:text-slate-700" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {currentView ? (
            <button 
              onClick={clearFilter}
              className="px-6 h-14 bg-rose-500 text-[#263238] rounded-2xl text-xs font-semibold font-medium flex items-center gap-2 hover:scale-105 transition-all"
            >
              <RotateCcw size={16} /> Show All
            </button>
          ) : (
            <button className="btn-secondary px-5 h-14 bg-white border-[#E0E0E0]"><Filter size={24} /></button>
          )}
        </div>
      </motion.header>

      {loading ? (
        <div className="p-32 text-center space-y-6">
           <div className="w-16 h-16 border-4 border-[#E0E0E0] border-t-emerald-500 rounded-full mx-auto animate-spin" />
           <p className="text-[#607D8B] text-xs font-semibold uppercase tracking-[0.4em]">Loading {currentView || 'List'}...</p>
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
                className="saas-card p-1 group relative overflow-hidden flex flex-col hover:border-[#2E7D32]/20 transition-all duration-500"
              >
                <div className="p-8 space-y-8 flex-1 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-[#E0E0E0] ${
                      currentView === 'defaulters' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 text-[#2E7D32]'
                    }`}>
                        <AlertCircle size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={`px-4 py-1.5 rounded-xl text-xs font-semibold font-medium shadow-xl ${
                          currentView === 'fines'
                            ? shop.fine_status === 'Paid' ? 'bg-[#2E7D32] text-[#263238] border border-[#2E7D32]/90 shadow-emerald-500/20' : 'bg-rose-500 text-[#263238] border border-rose-600 shadow-rose-500/20'
                            : shop.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                            : 'bg-[#0D47A1]/10 text-[#0D47A1] border border-[#0D47A1]/20'
                       }`}>
                         {currentView === 'fines' ? `Rs. ${shop.fine_amount} ${shop.fine_status}` : shop.role}
                       </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-2xl font-semibold font-outfit text-[#263238] group-hover:text-[#2E7D32] transition-all duration-500 group-hover:scale-105 origin-left leading-tight">
                       {shop.shop_name || shop.admin_name || shop.username}
                    </h4>
                    <p className="inline-block text-sm font-semibold text-[#607D8B] font-medium bg-slate-50 px-3 py-1 rounded-lg border border-white/[0.05] group-hover:border-[#2E7D32]/20 group-hover:text-[#2E7D32] transition-all">
                       {shop.shop_id || shop.username}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[#607D8B] font-bold text-xs uppercase tracking-tighter pt-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 border border-[#E0E0E0]">
                       <MapPin size={14} />
                    </div>
                    <span className="group-hover:text-[#263238] transition-colors truncate">{shop.location || shop.office_location || 'Not Specified'}</span>
                  </div>
                </div>

                <div className="p-8 border-t border-[#E0E0E0] bg-white/[0.01] flex items-center justify-between relative z-10">
                  <div className="flex gap-3">
                    {shop.email && (
                      <a href={`mailto:${shop.email}`} className="w-10 h-10 bg-slate-100 rounded-xl text-[#607D8B] hover:text-[#263238] hover:bg-[#2E7D32]/20 transition-all border border-[#E0E0E0] flex items-center justify-center">
                         <Mail size={18} />
                      </a>
                    )}
                    {(shop.contact_number) && (
                      <a href={`tel:${shop.contact_number}`} className="w-10 h-10 bg-slate-100 rounded-xl text-[#607D8B] hover:text-[#263238] hover:bg-[#2E7D32]/20 transition-all border border-[#E0E0E0] flex items-center justify-center">
                         <Phone size={18} />
                      </a>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedShop(shop)}
                    className="text-sm font-semibold text-[#2E7D32] hover:text-[#2E7D32] font-medium flex items-center gap-2 group/btn"
                  >
                    View Details <ExternalLink size={14} className="transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-full bg-[#2E7D32]/[0.01] skew-x-[-45deg] translate-x-32 group-hover:translate-x-20 transition-transform duration-1000" />
              </motion.div>
            ))}
          </AnimatePresence>
          {(!loading && filteredShops.length === 0) && (
              <div className="col-span-full py-20 text-center saas-card border-dashed">
                 <Search size={48} className="mx-auto text-slate-800 mb-4" />
                 <p className="text-[#607D8B] font-semibold font-medium text-xs">No entries found matching your query.</p>
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
               className="saas-card w-full max-w-2xl relative z-10 overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)]"
            >
              <div className="px-8 py-6 border-b border-[#E0E0E0] flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#2E7D32]/10 rounded-xl flex items-center justify-center text-[#2E7D32] border border-[#2E7D32]/20">
                     <User size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#263238] uppercase tracking-wider">
                    Establishment Profile
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedShop(null)}
                  className="p-2 text-[#607D8B] hover:text-[#263238] bg-slate-100 hover:bg-rose-500/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-8 py-2 border-b border-[#E0E0E0] flex gap-8 bg-white/50">
                {['profile', 'fines', 'issue'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={`py-3 text-xs font-semibold font-medium relative transition-colors ${
                      modalTab === tab ? 'text-[#2E7D32]' : 'text-[#607D8B] hover:text-[#607D8B]'
                    }`}
                  >
                    {tab === 'profile' ? 'Registration' : tab === 'fines' ? 'Fine History' : 'Manual Penalty'}
                    {modalTab === tab && (
                      <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E7D32]" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {modalTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <label className="text-xs font-semibold text-[#607D8B] font-medium block mb-3">Identification Handle</label>
                      <div className="text-sm font-semibold text-[#2E7D32] bg-[#2E7D32]/10 px-6 py-4 rounded-2xl border border-[#2E7D32]/20 tracking-[0.2em] shadow-inner">
                        {selectedShop.shop_id || selectedShop.username}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-xs font-semibold text-[#607D8B] font-medium block mb-2">Full Legal Entity</label>
                        <div className="text-base font-bold text-[#263238] tracking-wide">{selectedShop.shop_name || selectedShop.admin_name || 'Not Provided'}</div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#607D8B] font-medium block mb-2">Operational Territory</label>
                        <div className="text-base font-bold text-[#263238] tracking-wide">{selectedShop.location || selectedShop.office_location || 'Not Provided'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-xs font-semibold text-[#607D8B] font-medium block mb-2">Contact Personnel</label>
                        <div className="text-base font-bold text-[#607D8B] tracking-wide">{selectedShop.shopkeeper_name || selectedShop.username || 'Not Provided'}</div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#607D8B] font-medium block mb-2">Direct Communication</label>
                        <div className="text-base font-bold text-[#607D8B] tracking-wide">{selectedShop.contact_number || 'Not Provided'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'fines' && (
                  <div className="space-y-6">
                    {shopFines.length === 0 ? (
                      <div className="py-12 text-center bg-white/50 rounded-3xl border border-[#E0E0E0] border-dashed">
                        <ShieldCheck size={32} className="mx-auto text-slate-700 mb-3" />
                        <p className="text-[#607D8B] text-xs font-semibold font-medium">Clean record. No penalties found.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {shopFines.map(fine => (
                          <div key={fine._id} className="p-6 bg-white/80 rounded-2xl border border-[#E0E0E0] flex items-center justify-between group hover:border-[#2E7D32]/20 transition-all">
                            <div className="space-y-1">
                              <p className="text-[#263238] font-bold text-sm tracking-wide">{fine.reason}</p>
                              <p className="text-xs font-semibold text-[#607D8B] font-medium">{new Date(fine.issuedAt).toLocaleDateString()} • {new Date(fine.issuedAt).toLocaleTimeString()}</p>
                            </div>
                             <div className="text-right flex items-center gap-4">
                                <div>
                                  <p className="text-lg font-semibold text-[#263238] font-outfit tracking-tighter">Rs. {fine.amount}</p>
                                  <span className={`text-xs font-semibold font-medium ${fine.status === 'Paid' ? 'text-[#2E7D32]' : 'text-rose-500'}`}>
                                    {fine.status}
                                  </span>
                                </div>
                                {fine.status === 'Pending' && (
                                  <button 
                                    onClick={() => handleMarkAsPaid(fine._id)}
                                    className="w-8 h-8 bg-[#2E7D32]/10 text-[#2E7D32] hover:bg-[#2E7D32] hover:text-[#263238] transition-all rounded-lg border border-[#2E7D32]/20 flex items-center justify-center p-0"
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
                    <div className="p-6 bg-[#E65100]/5 border border-[#E65100]/10 rounded-2xl">
                       <p className="text-xs text-[#E65100]/80 font-bold uppercase tracking-wider leading-relaxed">
                         Note: Manual penalties should only be issued for verified policy violations or missed collections as per BMC guidelines.
                       </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-semibold text-[#607D8B] font-medium block mb-3">Penalty Value (INR)</label>
                        <div className="grid grid-cols-4 gap-3">
                           {[200, 500, 1000, 2000].map(val => (
                             <button
                               key={val}
                               type="button"
                               onClick={() => setFineAmount(val)}
                               className={`py-4 rounded-xl text-xs font-semibold border transition-all ${
                                 fineAmount === val 
                                   ? 'bg-[#2E7D32] text-[#263238] border-[#2E7D32] shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                                   : 'bg-[#F5F7F6] text-[#607D8B] border-[#E0E0E0] hover:border-[#2E7D32]/30'
                               }`}
                             >
                               {val}
                             </button>
                           ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#607D8B] font-medium block mb-3">Violation Description</label>
                        <textarea 
                          required
                          value={fineReason}
                          onChange={(e) => setFineReason(e.target.value)}
                          placeholder="EX: Repeated failure to segregate waste..."
                          className="w-full bg-[#F5F7F6] border-[#E0E0E0] rounded-2xl p-5 text-sm text-[#263238] placeholder:text-slate-700 focus:ring-emerald-500/20 focus:border-[#2E7D32] transition-all min-h-[120px] resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      disabled={issuing}
                      className="w-full h-16 bg-[#2E7D32] text-[#263238] rounded-2xl font-semibold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {issuing ? 'Processing Violation...' : 'Authenticate Penalty'}
                    </button>
                  </form>
                )}
                
                <div className="pt-10 flex justify-center">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-[0.3em] italic flex items-center gap-2">
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
