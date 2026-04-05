import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, LayoutDashboard, ClipboardList, Truck, 
  AlertCircle, Users, FileBarChart, Menu, X, Store, Bell, Settings, QrCode, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import logo from '../assets/logo.png';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resolutionToast, setResolutionToast] = useState(null);
  const [pendingFinesCount, setPendingFinesCount] = useState(0);

  useEffect(() => {
    const fetchPendingFines = async () => {
      if (user && user.role === 'shopkeeper') {
        try {
          const res = await axios.get('/api/fines');
          const pending = res.data.filter(f => f.status === 'Pending').length;
          setPendingFinesCount(pending);
        } catch (err) {
          console.error('Error fetching pending fines:', err);
        }
      }
    };
    fetchPendingFines();

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
    { to: '/shopkeeper/fines', label: 'Fines & Dues', icon: <ShieldCheck size={20} />, badge: pendingFinesCount > 0 ? pendingFinesCount : null },
    { to: '/shopkeeper/bulky', label: 'Service Tracker', icon: <Truck size={20} /> },
    { to: '/shopkeeper/alert', label: 'Report Issue', icon: <Bell size={20} />, highlight: true },
    { to: '/shopkeeper/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const adminLinks = [
    { to: '/admin/overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/alerts', label: 'Alerts', icon: <AlertCircle size={20} /> },
    { to: '/admin/shops', label: 'Shops', icon: <Users size={20} /> },
    { to: '/admin/fines', label: 'Fines & Dues', icon: <ShieldCheck size={20} /> },
    { to: '/admin/reports', label: 'Reports', icon: <FileBarChart size={20} /> },
    { to: '/admin/qr-generator', label: 'QR Generator', icon: <QrCode size={20} />, eco: true },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : shopkeeperLinks;

  return (
    <div className="min-h-screen bg-[#F5F7F6] text-[#263238] flex font-inter overflow-x-hidden">
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-[#E0E0E0]/60 p-5 fixed inset-y-0 z-50">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 px-2 mb-8"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-[#2E7D32]/10 text-[#2E7D32] font-bold">
            <img src={logo} alt="BMC Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span className="text-lg font-bold font-inter text-[#263238] uppercase tracking-tight">
              Smart Market
            </span>
            <p className="text-xs text-[#607D8B] font-medium">Waste Management</p>
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
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-[#2E7D32]/10 text-[#2E7D32] font-semibold' 
                    : 'text-[#607D8B] hover:bg-slate-100/50 hover:text-[#263238] font-medium'}
                `}
              >
                {link.icon}
                <span className="font-semibold text-sm tracking-wide">{link.label}</span>
                {link.badge && (
                  <span className="ml-auto bg-[#2E7D32]/90 text-[#263238] text-xs font-semibold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
                {location.pathname === link.to && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-[#2E7D32] rounded-r-full"
                  />
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="pt-6 mt-6 border-t border-[#E0E0E0]/60 space-y-4">
          <div className="px-3 py-3 bg-white rounded-xl flex items-center gap-3 border border-[#E0E0E0]/60 hover:bg-slate-100/50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#2E7D32]/90 text-[#263238] flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.username?.charAt(0) || user?.shop_id?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#263238] truncate">{user?.shop_name || user?.username}</p>
              <p className="text-xs text-[#607D8B] capitalize">{user?.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 text-[#607D8B] hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all active:scale-95"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 min-h-screen relative bg-[#F5F7F6]">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#E0E0E0]/60 sticky top-0 z-40">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={logo} alt="BMC Logo" className="w-full h-full object-cover" />
             </div>
             <span className="font-bold font-outfit uppercase tracking-tighter">Smart Market</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2.5 bg-slate-100 text-[#607D8B] rounded-xl active:scale-95 transition-all shadow-lg"
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
              className="fixed bottom-8 right-8 z-[100] flex items-start gap-4 p-5 bg-white border border-[#2E7D32]/30 rounded-2xl shadow-2xl shadow-emerald-500/20 max-w-sm"
            >
              <div className="w-10 h-10 shrink-0 bg-[#2E7D32]/20 text-[#2E7D32] rounded-full flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold font-medium text-[#2E7D32]">Alert Resolved</h4>
                <p className="text-xs font-semibold text-[#263238] leading-relaxed">{resolutionToast}</p>
              </div>
              <button onClick={() => setResolutionToast(null)} className="absolute top-4 right-4 text-[#2E7D32]/50 hover:text-[#2E7D32]">
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
              className="fixed inset-0 bg-[#F5F7F6]/60 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%', skewX: 5 }} 
              animate={{ x: 0, skewX: 0 }} 
              exit={{ x: '100%', skewX: 5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-xs bg-white z-[70] p-8 lg:hidden border-l border-[#E0E0E0] shadow-2xl flex flex-col"
            >
              <div className="mb-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl overflow-hidden flex items-center justify-center mb-4">
                  <img src={logo} alt="BMC Logo" className="w-full h-full object-cover" />
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
                      ${isActive ? 'bg-[#2E7D32] text-slate-950 shadow-xl shadow-emerald-500/20' : 'text-[#607D8B] hover:text-[#263238]'}
                    `}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="pt-8 border-t border-[#E0E0E0]">
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-4 px-6 py-4 text-rose-500 font-semibold text-lg w-full bg-rose-500/5 rounded-2xl active:bg-rose-500/10 transition-colors"
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
