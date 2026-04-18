import { useState } from 'react';
import axios from 'axios';
import { FileSpreadsheet, Download, RefreshCw, CheckCircle, Info, Calendar, FileText, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminReports = () => {
  const [exporting, setExporting] = useState(null);
  const [selectedRange, setSelectedRange] = useState('1'); // '1', '7', '30'

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const response = await axios.get(`/api/wastelogs/export/${type}?days=${selectedRange}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${new Date().toLocaleDateString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Transmission Error: Check link protocols.');
    } finally {
      setExporting(null);
    }
  };

  const reportCards = [
    { 
      id: 'logged', 
      title: 'Waste Collection Report', 
      desc: 'Detailed list of all successful waste collection entries for the selected period.',
      icon: <Activity className="text-[#2E7D32]" size={40} />,
      gradient: 'from-emerald-500/10 to-transparent'
    },
    { 
      id: 'unlogged', 
      title: 'Defaulters List', 
      desc: 'List of shops that have failed to log waste for 3 consecutive days.',
      icon: <ShieldCheck className="text-[#0D47A1]" size={40} />,
      gradient: 'from-blue-500/10 to-transparent'
    }
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#E0E0E0] rounded-full text-xs font-semibold uppercase tracking-[0.3em] text-[#607D8B] mb-2 shadow-inner">
           <FileText size={14} /> Reports
        </div>
        <h1 className="text-5xl font-semibold font-outfit text-[#263238] tracking-tighter uppercase">System Reports</h1>
        <p className="text-[#607D8B] font-medium tracking-wide max-w-2xl mx-auto leading-relaxed">
          Generate and download Excel reports for waste collection and compliance monitoring.
        </p>

        <div className="pt-6 flex justify-center">
            <div className="relative group min-w-[200px]">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2E7D32] transition-colors" size={18} />
                <select 
                    value={selectedRange}
                    onChange={(e) => setSelectedRange(e.target.value)}
                    className="w-full !pl-12 pr-10 h-14 bg-white border border-[#E0E0E0] rounded-2xl text-xs font-bold font-medium tracking-widest appearance-none outline-none focus:border-[#2E7D32]/50 focus:ring-4 focus:ring-[#2E7D32]/5 transition-all cursor-pointer uppercase"
                >
                    <option value="1">Today Only</option>
                    <option value="7">Past 7 Days</option>
                    <option value="30">Past 30 Days</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                </div>
            </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {reportCards.map((report, idx) => (
          <motion.div 
            key={report.id}
            initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            whileHover={{ y: -8, scale: 1.01 }}
            className={`saas-card p-10 flex flex-col items-center text-center space-y-8 bg-gradient-to-br ${report.gradient} border-[#E0E0E0] group transition-all duration-500 overflow-hidden relative`}
          >
            <div className="p-6 bg-white rounded-[2.5rem] border border-[#E0E0E0] shadow-2xl relative z-10 group-hover:rotate-12 transition-transform duration-700">
              {report.icon}
            </div>
            <div className="relative z-10 space-y-3">
              <h3 className="text-2xl font-semibold text-[#263238] font-outfit uppercase tracking-tight">{report.title}</h3>
              <p className="text-[#607D8B] text-sm leading-relaxed max-w-xs mx-auto font-medium">{report.desc}</p>
            </div>
            
            <div className="flex gap-4 w-full pt-6 relative z-10">
              <div className="flex-1 flex items-center justify-center gap-3 bg-[#F9FBF7]/50 rounded-2xl px-4 py-4 text-xs font-semibold text-[#2E7D32] border border-[#2E7D32]/10 shadow-inner font-medium uppercase tracking-tighter">
                <Calendar size={16} /> Operative: {selectedRange === '1' ? 'Today' : `Past ${selectedRange} Days`}
              </div>
              <button 
                onClick={() => handleExport(report.id)}
                disabled={!!exporting}
                className="flex-[2] btn-primary h-14 flex items-center justify-center gap-3 active:scale-95 group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                {exporting === report.id ? (
                  <RefreshCw className="animate-spin" size={24} />
                ) : (
                  <>
                    <Download size={20} className="stroke-[2.5px] transition-transform group-hover/btn:translate-y-1" />
                    <span className="text-xs font-semibold font-medium relative z-10">Download Excel</span>
                  </>
                )}
              </button>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.01]  pointer-events-none -mr-24 -mt-24" />
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="saas-card p-10 border-[#0D47A1]/10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="w-20 h-20 rounded-[2rem] bg-[#0D47A1]/10 text-[#0D47A1] flex items-center justify-center border border-[#0D47A1]/20 shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0 relative z-10">
           <Info size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-4 flex-1 relative z-10">
          <h4 className="text-xl font-semibold font-outfit uppercase tracking-tight text-[#0D47A1]-200">Report Information</h4>
          <p className="text-sm text-[#607D8B] font-medium leading-relaxed">
            Reports are generated in real-time. For large datasets, the download may take a few seconds. All reports include shop details, timestamps, and collection status.
          </p>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#0D47A1]/40 uppercase tracking-[0.3em] pt-2">
            <div className="w-2 h-2 bg-[#0D47A1] rounded-full animate-ping" />
            LIVE LINK ACQUISITION: SUCCESSFUL
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminReports;
