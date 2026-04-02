import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Filter, Mail, Phone, ExternalLink, ShieldCheck, AlertCircle, MapPin, MoreHorizontal, X, User, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentView = searchParams.get('view'); // 'unlogged' or 'defaulters' or null

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        let url = '/api/shopkeepers';
        if (currentView === 'unlogged') url = '/api/wastelogs/unlogged';
        if (currentView === 'defaulters') url = '/api/wastelogs/defaulters';
        
        const { data } = await axios.get(url);
        setShops(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching shops', err);
      }
      setLoading(false);
    };
    fetchShops();
  }, [currentView]);

  const filteredShops = Array.isArray(shops) ? shops.filter(s => {
    const term = search.trim().toLowerCase();
    if (!term) return true;

    const shopName = String(s.shop_name || s.admin_name || s.username || '').toLowerCase();
    const shopId = String(s.shop_id || s.username || '').toLowerCase();
    const location = String(s.location || s.office_location || '').toLowerCase();

    // MATCHING LOGIC
    const primaryMatch = shopName.includes(term) || shopId.includes(term);
    const secondaryMatch = term.length >= 3 && location.includes(term);

    return primaryMatch || secondaryMatch;
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
                          shop.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                       }`}>
                         {shop.role}
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

      {/* Modal for Details */}
      <AnimatePresence>
        {selectedShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedShop(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 40 }}
               className="glass-card w-full max-w-lg relative z-10 overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)]"
            >
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                  <User size={24} className="text-emerald-500" /> 
                  Profile Information
                </h3>
                <button 
                  onClick={() => setSelectedShop(null)}
                  className="p-2 text-slate-500 hover:text-white bg-slate-800 hover:bg-rose-500/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Identification</label>
                  <div className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-5 py-4 rounded-2xl border border-emerald-500/20 tracking-[0.2em]">
                    {selectedShop.shop_id || selectedShop.username}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Entity Name</label>
                    <div className="text-sm font-bold text-white tracking-wide truncate">{selectedShop.shop_name || selectedShop.admin_name || 'Not Provided'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Assigned Zone</label>
                    <div className="text-sm font-bold text-white tracking-wide truncate">{selectedShop.location || selectedShop.office_location || 'Not Provided'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Primary Representative</label>
                    <div className="text-sm font-bold text-slate-300 tracking-wide truncate">{selectedShop.shopkeeper_name || selectedShop.username || 'Not Provided'}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Contact Line</label>
                    <div className="text-sm font-bold text-slate-300 tracking-wide truncate">{selectedShop.contact_number || 'Not Provided'}</div>
                  </div>
                </div>
                
                <div className="pt-4">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center italic">Verified by Smart Market Management Oracle</p>
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
