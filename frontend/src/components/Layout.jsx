import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, LayoutDashboard, ClipboardList, Trash2, 
  AlertCircle, Users, FileBarChart, Menu, X, Store, Bell, Settings, QrCode, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resolutionToast, setResolutionToast] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
       const newSocket = io('http://localhost:5000');
       newSocket.on('alert_resolved', (alert) => {
          if (alert.shop_id === user._id || (alert.shop_id && alert.shop_id._id === user._id)) {
              setResolutionToast(alert.resolution_message || 'Your issue has been resolved and pickup is scheduled.');
              setTimeout(() => setResolutionToast(null), 10000);
          }
       });
       return () => newSocket.close();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const shopkeeperLinks = [
    { to: '/shopkeeper/overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/shopkeeper/history', label: 'History', icon: <ClipboardList size={20} /> },
    { to: '/shopkeeper/bulky', label: 'Large Waste', icon: <Trash2 size={20} /> },
    { to: '/shopkeeper/alert', label: 'Report Issue', icon: <Bell size={20} />, highlight: true },
    { to: '/shopkeeper/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const adminLinks = [
    { to: '/admin/overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/alerts', label: 'Alerts', icon: <AlertCircle size={20} /> },
    { to: '/admin/shops', label: 'Shops', icon: <Users size={20} /> },
    { to: '/admin/reports', label: 'Reports', icon: <FileBarChart size={20} /> },
    { to: '/admin/qr-generator', label: 'QR Generator', icon: <QrCode size={20} />, eco: true },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : shopkeeperLinks;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-inter overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 p-6 fixed inset-y-0 z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 px-2 mb-10"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <Store size={24} />
          </div>
          <div>
            <span className="text-xl font-bold font-outfit uppercase tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
              Smart Market
            </span>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Waste Management System</p>
          </div>
        </motion.div>

        <nav className="flex-1 space-y-2">
          {links.map((link, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              key={link.to}
            >
              <NavLink
                to={link.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative
                  ${isActive 
                    ? link.eco 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 shadow-lg shadow-emerald-500/5' 
                    : link.highlight
                      ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20'
                      : link.eco 
                        ? 'text-emerald-600/60 hover:bg-emerald-500/5 hover:text-emerald-500 border border-transparent hover:border-emerald-500/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                `}
              >
                {link.icon}
                <span className="font-semibold text-sm tracking-wide">{link.label}</span>
                {location.pathname === link.to && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                  />
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800/50 space-y-4">
          <div className="px-4 py-3 bg-slate-800/30 rounded-2xl flex items-center gap-3 border border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-default">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs border border-emerald-500/20 shadow-inner">
              {user?.username?.charAt(0) || user?.shop_id?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.shop_name || user?.username}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-tight">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all active:scale-90"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen relative">
        {/* Subtle Background Glows */}
        <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] pointer-events-none" />

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-5 bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-lg bg-opacity-80">
          <div className="flex items-center gap-2">
             <Store size={22} className="text-emerald-500" />
             <span className="font-bold font-outfit uppercase tracking-tighter">Smart Market</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2.5 bg-slate-800 text-slate-300 rounded-xl active:scale-95 transition-all shadow-lg"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Content Wrapper */}
        <div className="p-6 lg:p-12 max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Shopkeeper Notification Toast */}
        <AnimatePresence>
          {resolutionToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-8 right-8 z-[100] flex items-start gap-4 p-5 bg-emerald-950 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/20 max-w-sm"
            >
              <div className="w-10 h-10 shrink-0 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500">Alert Resolved</h4>
                <p className="text-xs font-semibold text-emerald-100 leading-relaxed">{resolutionToast}</p>
              </div>
              <button onClick={() => setResolutionToast(null)} className="absolute top-4 right-4 text-emerald-500/50 hover:text-emerald-400">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%', skewX: 5 }} 
              animate={{ x: 0, skewX: 0 }} 
              exit={{ x: '100%', skewX: 5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-xs bg-slate-900 z-[70] p-8 lg:hidden border-l border-slate-800 shadow-2xl flex flex-col"
            >
              <div className="mb-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <Store size={32} />
                </div>
                <h3 className="text-xl font-bold font-outfit uppercase">Smart Market</h3>
              </div>

              <nav className="flex-1 space-y-3">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all duration-300
                      ${isActive ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}
                    `}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="pt-8 border-t border-slate-800">
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-4 px-6 py-4 text-rose-500 font-black text-lg w-full bg-rose-500/5 rounded-2xl active:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={24} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
