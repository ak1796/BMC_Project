import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  Users, Search, UserCheck, Clock, MapPin, 
  AlertTriangle, CheckCircle2, Truck, X, 
  Send, UserMinus, ShieldCheck, Mail, Info,
  FileSpreadsheet, Upload, RefreshCw, Plus,
  ChevronRight, Calendar, UserPlus, Phone, Hash, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [dispatchNote, setDispatchNote] = useState('');
  const [newOfficerData, setNewOfficerData] = useState({
    officerName: '',
    employeeId: '',
    email: '',
    phoneNumber: '',
    ward: ''
  });
  
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [offRes, taskRes] = await Promise.all([
        axios.get('/api/officers/ward'),
        axios.get('/api/officers/tasks/pending')
      ]);
      setOfficers(offRes.data);
      setPendingTasks(taskRes.data);
    } catch (err) {
      console.error('Error fetching officer data', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      setUploading(true);
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("The file is empty.");
          setUploading(false);
          return;
        }

        const response = await axios.post('/api/officers/bulk', { officers: data });
        alert(response.data.message);
        fetchData();
      } catch (err) {
        alert("Upload failed: " + (err?.response?.data?.message || err.message));
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAddOfficer = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await axios.post('/api/officers', newOfficerData);
      alert('Officer registered successfully.');
      fetchData();
      setIsAddModalOpen(false);
      setNewOfficerData({ officerName: '', employeeId: '', email: '', phoneNumber: '', ward: '' });
    } catch (err) {
      alert('Registration failed: ' + (err?.response?.data?.message || 'Server error'));
    }
    setAdding(false);
  };

  const handleOpenAssignModal = (officer) => {
    setSelectedOfficer(officer);
    setIsModalOpen(true);
    setSelectedTask(null);
    setDispatchNote('');
  };

  const handleAssign = async () => {
    if (!selectedOfficer || !selectedTask) return;
    
    setAssigning(true);
    try {
      await axios.post('/api/officers/assign-task', {
        taskId: selectedTask._id,
        taskType: selectedTask.taskType,
        officerId: selectedOfficer._id,
        dispatchNote: dispatchNote
      });
      
      await fetchData();
      setIsModalOpen(false);
      alert('Task successfully assigned and dispatched to officer.');
    } catch (err) {
      alert('Assignment failed: ' + (err?.response?.data?.message || 'Server error'));
    }
    setAssigning(false);
  };

  const filteredOfficers = officers.filter(o => 
    o.officerName.toLowerCase().includes(search.toLowerCase()) ||
    o.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-10"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
             <ShieldCheck size={14} /> Active Command Center
          </div>
          <h1 className="text-5xl font-black font-outfit text-slate-900 tracking-tighter uppercase leading-[0.9]">
            Field Officer <span className="text-emerald-600">Assignment</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-wide max-w-lg">
            Manage municipal response units, monitor real-time availability, and dispatch priority service tickets across your jurisdiction.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <div className="flex items-center bg-slate-100/50 p-1 rounded-[22px] border border-slate-200/50 shadow-inner h-14">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="h-full px-8 bg-slate-900 text-white rounded-[18px] flex items-center gap-3 transition-all shadow-lg shadow-slate-900/20 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <UserPlus size={16} />
              <span>Register Unit</span>
            </button>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-full px-8 bg-transparent text-slate-600 rounded-[18px] flex items-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest hover:text-emerald-600 disabled:opacity-50"
            >
              {uploading ? <RefreshCw className="animate-spin" size={16} /> : <FileSpreadsheet size={16} className="text-emerald-500" />}
              <span>Batch Import</span>
            </button>
          </div>
          
          <div className="relative group h-14">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[22px] blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
            <div className="relative bg-white border-2 border-slate-100 focus-within:border-emerald-500/30 rounded-[20px] px-6 h-full flex items-center gap-4 transition-all shadow-sm min-w-[360px]">
              <Search size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 focus:ring-0 w-full placeholder:text-slate-400" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Fleet', value: officers.length, icon: <Users className="text-blue-600" />, bg: 'bg-blue-600/5', border: 'border-blue-600/10' },
           { label: 'Ready for Dispatch', value: officers.filter(o => o.availabilityStatus === 'Available').length, icon: <UserCheck className="text-emerald-600" />, bg: 'bg-emerald-600/5', border: 'border-emerald-600/10' },
           { label: 'Unassigned Tickets', value: pendingTasks.length, icon: <Truck className="text-orange-600" />, bg: 'bg-orange-600/5', border: 'border-orange-600/10' }
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.1 }}
             className={`p-8 rounded-[32px] border-2 ${stat.border} ${stat.bg} flex items-center gap-8 group hover:scale-[1.02] transition-transform duration-300`}
           >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-4xl font-black text-slate-900 mt-0.5">{stat.value}</p>
              </div>
           </motion.div>
         ))}
      </div>

      {/* Officers Table */}
      <div className="bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Detail</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duty Schedule</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <RefreshCw className="animate-spin text-emerald-500" size={32} />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synchronizing Encrypted Registry...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Users size={48} className="text-slate-300" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Response Units Registered</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => (
                  <tr key={officer._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-700 font-black text-lg shadow-inner">
                          {officer.officerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{officer.officerName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Mail size={12} className="text-slate-400" />
                            <p className="text-xs text-slate-500 font-bold">{officer.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border border-slate-800 shadow-lg">
                        <Hash size={12} /> {officer.employeeId}
                      </div>
                      {officer.ward && (
                         <p className="text-[10px] font-black text-emerald-600 uppercase mt-2 ml-1 tracking-widest">{officer.ward} Sector</p>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 ${
                        officer.availabilityStatus === 'Available'
                          ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5 shadow-lg'
                          : officer.availabilityStatus === 'Busy'
                          ? 'bg-orange-500/5 text-orange-600 border-orange-500/20 shadow-orange-500/5 shadow-lg'
                          : 'bg-slate-500/5 text-slate-600 border-slate-500/20 shadow-slate-500/5 shadow-lg'
                      }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                           officer.availabilityStatus === 'Available' ? 'bg-emerald-500' : 'bg-orange-500'
                        }`} />
                        {officer.availabilityStatus}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       {officer.availabilityStatus === 'Busy' ? (
                          <div className="space-y-1.5">
                             <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                                <Clock size={14} strokeWidth={3} /> Duty Until
                             </div>
                             <p className="text-lg font-black text-slate-800 tabular-nums">
                                {new Date(officer.busyUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                          </div>
                       ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                             <Calendar size={14} /> Standby Mode
                          </div>
                       )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => handleOpenAssignModal(officer)}
                        disabled={officer.availabilityStatus !== 'Available'}
                        className={`h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                          officer.availabilityStatus === 'Available'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                            : 'bg-slate-50 text-slate-300 border-2 border-slate-100 cursor-not-allowed'
                        }`}
                      >
                        Dispatch Unit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => !adding && setIsAddModalOpen(false)}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
               <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Register Unit</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Manual Staff Enrollment</p>
                  </div>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                  >
                    <X size={20} />
                  </button>
               </div>

               <form onSubmit={handleAddOfficer} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                        <div className="relative group">
                          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10 pointer-events-none">
                            <User size={22} />
                          </div>
                          <input 
                            required type="text" placeholder="Enter Full Name"
                            style={{ paddingLeft: '80px' }}
                            className="w-full h-16 bg-slate-50 border-2 border-slate-100 focus:border-emerald-500/30 focus:bg-white rounded-[24px] text-sm font-bold transition-all outline-none text-slate-800"
                            value={newOfficerData.officerName}
                            onChange={(e) => setNewOfficerData({...newOfficerData, officerName: e.target.value})}
                          />
                        </div>
                     </div>

                     <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Assigned Identity</label>
                        <div className="relative">
                          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
                            <Hash size={22} />
                          </div>
                          <input 
                            type="text" readOnly value="AUTO-GENERATED BY SYSTEM"
                            style={{ paddingLeft: '80px' }}
                            className="w-full h-16 bg-slate-100 border-2 border-slate-100 rounded-[24px] text-xs font-black tracking-[0.2em] text-slate-400 cursor-not-allowed outline-none uppercase"
                          />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                        <div className="relative group">
                          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10 pointer-events-none">
                            <Mail size={22} />
                          </div>
                          <input 
                            required type="email" placeholder="Email Address"
                            style={{ paddingLeft: '80px' }}
                            className="w-full h-16 bg-slate-50 border-2 border-slate-100 focus:border-emerald-500/30 focus:bg-white rounded-[24px] text-sm font-bold transition-all outline-none text-slate-800"
                            value={newOfficerData.email}
                            onChange={(e) => setNewOfficerData({...newOfficerData, email: e.target.value})}
                          />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Line</label>
                        <div className="relative group">
                          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10 pointer-events-none">
                            <Phone size={22} />
                          </div>
                          <input 
                            required type="text" placeholder="Phone Number"
                            style={{ paddingLeft: '80px' }}
                            className="w-full h-16 bg-slate-50 border-2 border-slate-100 focus:border-emerald-500/30 focus:bg-white rounded-[24px] text-sm font-bold transition-all outline-none text-slate-800"
                            value={newOfficerData.phoneNumber}
                            onChange={(e) => setNewOfficerData({...newOfficerData, phoneNumber: e.target.value})}
                          />
                        </div>
                     </div>

                     <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector Jurisdiction (Optional)</label>
                        <div className="relative group">
                          <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10 pointer-events-none">
                            <MapPin size={22} />
                          </div>
                          <input 
                            type="text" placeholder="EX: K-East Ward"
                            style={{ paddingLeft: '80px' }}
                            className="w-full h-16 bg-slate-50 border-2 border-slate-100 focus:border-emerald-500/30 focus:bg-white rounded-[24px] text-sm font-bold transition-all outline-none text-slate-800"
                            value={newOfficerData.ward}
                            onChange={(e) => setNewOfficerData({...newOfficerData, ward: e.target.value})}
                          />
                        </div>
                     </div>
                  </div>

                  <button 
                    disabled={adding}
                    type="submit"
                    className="w-full h-16 bg-emerald-600 text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {adding ? 'Processing...' : <><CheckCircle2 size={20} /> Register Unit</>}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => !assigning && setIsModalOpen(false)}
               className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 40 }}
               className="w-full max-w-4xl bg-white rounded-[48px] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
               {/* Left Side: Context */}
               <div className="w-full md:w-[320px] bg-slate-900 p-10 flex flex-col justify-between border-r border-slate-800">
                  <div className="space-y-8">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Truck size={32} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-white leading-none uppercase italic italic tracking-tighter">Unit<br/><span className="text-emerald-500 underline decoration-4 underline-offset-8">Dispatch</span></h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest pt-4">Field Commander Control</p>
                    </div>

                    <div className="pt-8 border-t border-slate-800 space-y-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigning to</p>
                          <p className="text-xl font-black text-white uppercase tracking-tighter">{selectedOfficer?.officerName}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee ID</p>
                          <p className="text-sm font-mono font-bold text-emerald-500">{selectedOfficer?.employeeId}</p>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                  >
                    <X size={16} /> Cancel Operation
                  </button>
               </div>

               {/* Right Side: Selection */}
               <div className="flex-1 p-10 overflow-y-auto custom-scrollbar flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Select Priority Ticket</h4>
                    <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                       <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                       <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{pendingTasks.length} Pending</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                     {pendingTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                           <CheckCircle2 size={48} className="text-emerald-500/20 mb-4" />
                           <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Dispatch Queue Empty</p>
                        </div>
                     ) : (
                        pendingTasks.map((task) => (
                           <div 
                              key={task._id}
                              onClick={() => setSelectedTask(task)}
                              className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer relative group ${
                                 selectedTask?._id === task._id 
                                    ? 'border-emerald-600 bg-emerald-600/[0.03] shadow-xl shadow-emerald-900/5' 
                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                              }`}
                           >
                              <div className="flex items-start justify-between gap-6">
                                 <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                       task.taskType === 'BulkyRequest' 
                                          ? 'bg-slate-100 text-slate-600' 
                                          : 'bg-rose-500/10 text-rose-600'
                                    }`}>
                                       {task.taskType === 'BulkyRequest' ? <Truck size={24} strokeWidth={2.5} /> : <AlertTriangle size={24} strokeWidth={2.5} />}
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-2 mb-1">
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                             {task.taskType === 'BulkyRequest' ? 'Bulky Waste' : 'Priority Alert'}
                                          </p>
                                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                                          <p className="text-[10px] font-black text-slate-900 uppercase">#{task.alert_id?.slice(-6) || task.request_id?.slice(-6)}</p>
                                       </div>
                                       <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                                          {task.shop_id?.shop_name}
                                       </h4>
                                       <p className="text-xs font-bold text-slate-500 mt-1">{task.shop_id?.location}</p>
                                    </div>
                                 </div>
                                 <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                                       <Calendar size={10} /> {new Date(task.createdAt).toLocaleDateString()}
                                    </p>
                                 </div>
                              </div>
                              
                              <div className="mt-6 flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                                 <Info size={14} className="text-slate-400 shrink-0" />
                                 <p className="text-xs font-bold text-slate-600 italic leading-relaxed">
                                    "{task.comments || 'No description provided'}"
                                 </p>
                              </div>

                              {selectedTask?._id === task._id && (
                                 <motion.div 
                                    layoutId="selectedIndicator"
                                    className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 border-4 border-white"
                                 >
                                    <CheckCircle2 size={16} strokeWidth={3} />
                                 </motion.div>
                              )}
                           </div>
                        ))
                     )}
                  </div>

                  <div className="mt-8 space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deployment Instructions</label>
                     <textarea 
                        value={dispatchNote}
                        onChange={(e) => setDispatchNote(e.target.value)}
                        placeholder="Optional instructions for the officer..."
                        className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500/30 rounded-3xl p-6 text-sm font-bold text-slate-800 transition-all h-28 resize-none outline-none"
                     />
                  </div>

                  <div className="mt-8 flex gap-4">
                     <button 
                        disabled={!selectedTask || assigning}
                        onClick={handleAssign}
                        className="flex-1 h-20 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-slate-900/30 active:scale-95"
                     >
                        {assigning ? (
                           <RefreshCw className="animate-spin" size={24} />
                        ) : (
                           <>
                              <Send size={20} strokeWidth={2.5} />
                              Confirm Deployment
                           </>
                        )}
                     </button>
                     
                     <button 
                        disabled={!selectedTask || assigning}
                        title="Deploy & Send Notification"
                        onClick={handleAssign}
                        className="w-20 h-20 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center hover:scale-[1.02] transition-all disabled:opacity-30 shadow-2xl shadow-emerald-500/30 active:scale-95"
                     >
                        <Mail size={28} strokeWidth={2.5} />
                     </button>
                  </div>
                  
                  <p className="mt-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Clock size={12} className="text-orange-500" />
                    Unit locked for {selectedTask?.taskType === 'BulkyRequest' ? '6' : '2-4'} hours upon dispatch confirmation.
                  </p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOfficers;
