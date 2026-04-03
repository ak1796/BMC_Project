import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, Leaf, Download, Printer, FileText, 
  MapPin, CheckCircle2, AlertTriangle, Loader2,
  Trash2, Globe, Sparkles, Share2, PlusCircle, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const AdminQRGenerator = () => {
  const [formData, setFormData] = useState({
    dustbin_id: '',
    location: '',
    ward: 'Ward A',
    admin_id: ''
  });

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admins', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAdmins(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, admin_id: data[0]._id }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch admins", err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const generateRandomID = () => {
    const chars = '0123456789ABCDEF';
    let id = 'SMW-DB-';
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData(prev => ({ ...prev, dustbin_id: id }));
  };

  useEffect(() => {
    generateRandomID();
    fetchAdmins();
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const qrRef = useRef(null);

  const wards = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E', 'Ward F'];

  const qrData = JSON.stringify({
    dustbin_id: formData.dustbin_id || 'PENDING',
    location: formData.location || 'NOT SET',
    ward: formData.ward
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.dustbin_id || !formData.location || !formData.admin_id) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/dustbins/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          dustbin_id: formData.dustbin_id,
          location: formData.location,
          admin_id: formData.admin_id,
          qr_code_link: `${window.location.origin}/api/alerts/scan?dustbin=${formData.dustbin_id}`
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to register dustbin');
      }
    } catch (err) {
      console.error("Failed to submit dustbin", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPNG = () => {
    try {
      const canvas = document.createElement("canvas");
      // Target only the main QR code SVG, not background icons
      const svg = qrRef.current.querySelector(".qr-main-svg");
      if (!svg) throw new Error("QR SVG not found");

      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const image = new Image();
      image.src = "data:image/svg+xml;base64," + svg64;

      image.onload = () => {
        canvas.width = 1200;
        canvas.height = 1200;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 100, 100, 1000, 1000);
        
        const link = document.createElement("a");
        link.download = `SMW_QR_${formData.dustbin_id || 'Tag'}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
    } catch (err) {
      console.error("PNG Download failed", err);
      alert("Failed to generate PNG. Please try again.");
    }
  };

  const downloadPDF = async () => {
    try {
      const element = qrRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Nuclear Option: Remove all Tailwind v4 styles from the clone to prevent parsing oklch
          clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
          
          const clonedElement = clonedDoc.querySelector('.qr-card-to-export');
          if (clonedElement) {
            // Re-apply critical layout styles that were lost when removing tailwind
            clonedElement.style.display = 'flex';
            clonedElement.style.flexDirection = 'column';
            clonedElement.style.alignItems = 'center';
            clonedElement.style.gap = '2rem';
            clonedElement.style.padding = '40px';
            clonedElement.style.background = '#ffffff';
            clonedElement.style.color = '#0f172a';
            clonedElement.style.borderRadius = '3rem';
            clonedElement.style.position = 'relative';
            clonedElement.style.overflow = 'hidden';
            clonedElement.style.width = '500px'; // Set a fixed width for the export
            
            // Clean specific children layout
            const container = clonedElement.querySelector('.flex-col');
            if (container) {
              container.style.display = 'flex';
              container.style.flexDirection = 'column';
              container.style.alignItems = 'center';
              container.style.gap = '2rem';
            }
          }
        },
        ignoreElements: (el) => el?.classList?.contains('ignore-on-export')
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const imgWidth = 160;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (pdfWidth - imgWidth) / 2;
      const y = 30;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text('Smart Market Waste Management System', pdfWidth / 2, y + imgHeight + 15, { align: 'center' });
      pdf.setTextColor(16, 185, 129); 
      pdf.text('Towards a Cleaner & Greener City', pdfWidth / 2, y + imgHeight + 22, { align: 'center' });
      
      pdf.save(`SMW_Dustbin_${formData.dustbin_id || 'Tag'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF.");
    }
  };

  const handlePrint = async () => {
    try {
      const element = qrRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
          const clonedElement = clonedDoc.querySelector('.qr-card-to-export');
          if (clonedElement) {
            clonedElement.style.display = 'flex';
            clonedElement.style.flexDirection = 'column';
            clonedElement.style.alignItems = 'center';
            clonedElement.style.padding = '40px';
            clonedElement.style.background = '#ffffff';
            clonedElement.style.width = '150mm';
          }
        },
        ignoreElements: (el) => el?.classList?.contains('ignore-on-export')
      });
      const imgData = canvas.toDataURL('image/png');
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return alert("Please allow popups to print.");

      printWindow.document.write(`
        <html>
          <head>
            <title>QR Print - ${formData.dustbin_id}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
              img { width: 150mm; height: auto; }
              @page { size: auto; margin: 10mm; }
            </style>
          </head>
          <body>
            <img src="${imgData}" />
            <script>
              window.onload = () => {
                window.print();
                setTimeout(() => window.close(), 1000);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Print failed", err);
      alert("Failed to initiate print. Please check your browser's popup blocker.");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-10"
      >
        <div className="space-y-2">
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }} 
               className="inline-flex items-center gap-2 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
             <Leaf size={12} fill="currentColor" /> Sustainability Initiative
          </div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tight uppercase">QR Generator</h1>
          <p style={{ color: '#64748b' }} className="text-sm font-medium tracking-wide">Generate smart identification tags for sustainable city infrastructure.</p>
        </div>
        
        <div className="flex gap-4">
           <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.1)' }} className="glass-card px-6 py-3 flex items-center gap-4 border">
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }} className="w-10 h-10 rounded-full flex items-center justify-center">
                 <Globe size={20} />
              </div>
              <div>
                 <p style={{ color: '#64748b' }} className="text-[10px] font-black tracking-widest uppercase mb-1">Eco-System</p>
                 <p className="text-sm font-bold text-white leading-none">Active Monitor</p>
              </div>
           </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Left Panel: Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 space-y-8 bg-gradient-to-br from-slate-900 to-emerald-950/20"
        >
          <div className="flex items-center gap-4 mb-2">
             <PlusCircle className="text-emerald-500" size={24} />
             <h3 className="text-xl font-black font-outfit uppercase text-white tracking-tight">Deploy New Node</h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label style={{ color: '#64748b' }} className="text-[10px] font-black uppercase tracking-widest ml-1">Asset Identifier (Dustbin ID)</label>
              <div className="relative group flex gap-2">
                 <div className="relative flex-1">
                    <Trash2 className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} size={20} />
                    <input 
                      type="text" 
                      readOnly
                      style={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', color: '#34d399' }}
                      className="w-full !pl-12 h-14 text-sm font-black tracking-[0.2em] cursor-default"
                      value={formData.dustbin_id}
                    />
                 </div>
                 <button 
                   type="button"
                   onClick={generateRandomID}
                   style={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.05)' }}
                   className="px-4 hover:bg-slate-700 rounded-xl border transition-colors group/refresh"
                   title="Generate New ID"
                 >
                    <RotateCcw size={18} style={{ color: '#94a3b8' }} className="group-hover/refresh:rotate-180 transition-transform duration-500" />
                 </button>
              </div>
            </div>

            <div className="space-y-2">
              <label style={{ color: '#64748b' }} className="text-[10px] font-black uppercase tracking-widest ml-1">Geographic Placement (Location)</label>
              <div className="relative group">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} size={20} />
                 <input 
                   type="text" 
                   required
                   style={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', color: '#ffffff' }}
                   placeholder="e.g. Sector 21, Navi Mumbai"
                   className="w-full !pl-12 h-14 text-sm font-bold tracking-widest placeholder:text-slate-700"
                   value={formData.location}
                   onChange={(e) => setFormData({...formData, location: e.target.value})}
                 />
              </div>
            </div>

            <div className="space-y-2">
               <label style={{ color: '#64748b' }} className="text-[10px] font-black uppercase tracking-widest ml-1">Assigned BMC / Admin</label>
               <select 
                 style={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', color: '#ffffff' }}
                 className="w-full h-14 px-6 text-sm font-bold tracking-widest appearance-none"
                 value={formData.admin_id}
                 required
                 onChange={(e) => setFormData({...formData, admin_id: e.target.value})}
               >
                 {loadingAdmins ? (
                   <option>Loading Admins...</option>
                 ) : (
                   admins.map(admin => (
                     <option key={admin._id} value={admin._id}>
                       {admin.admin_name || admin.username} ({admin.office_location || 'No Location'})
                     </option>
                   ))
                 )}
               </select>
            </div>

            <div className="space-y-2">
               <label style={{ color: '#64748b' }} className="text-[10px] font-black uppercase tracking-widest ml-1">Administrative Ward</label>
               <select 
                 style={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.05)', color: '#ffffff' }}
                 className="w-full h-14 px-6 text-sm font-bold tracking-widest appearance-none"
                 value={formData.ward}
                 onChange={(e) => setFormData({...formData, ward: e.target.value})}
               >
                 {wards.map(w => <option key={w}>{w}</option>)}
               </select>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-slate-950 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-emerald-500/20"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <Leaf size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-black uppercase tracking-[0.3em]">Generate Eco QR</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.1)' }} 
               className="p-5 rounded-2xl border">
             <div className="flex gap-4">
                <Sparkles style={{ color: '#34d399' }} className="shrink-0" size={20} />
                <p style={{ color: '#94a3b8' }} className="text-[11px] font-medium leading-relaxed italic">
                  "Each smart QR enables efficient waste sorting and optimized collection routes, reducing the carbon footprint of city logistics."
                </p>
             </div>
          </div>
        </motion.div>

        {/* Right Panel: Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div ref={qrRef} 
               style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
               className="qr-card-to-export p-10 shadow-[0_0_100px_rgba(16,185,129,0.15)] relative overflow-hidden group rounded-[2rem]"
          >
             {/* Eco Badge */}
             <div className="absolute top-6 right-6 flex flex-col items-end opacity-40 group-hover:opacity-100 transition-opacity">
                <div style={{ backgroundColor: '#d1fae5', borderColor: 'rgba(16, 185, 129, 0.2)' }} 
                     className="flex items-center gap-2 px-3 py-1.5 rounded-full border">
                   <Leaf size={14} style={{ color: '#059669' }} />
                   <span style={{ color: '#047857' }} className="text-[10px] font-black uppercase tracking-widest">Smart Waste Node</span>
                </div>
             </div>

             <div className="flex flex-col items-center gap-8 py-4 relative z-10">
                <div style={{ backgroundColor: '#f8fafc', borderColor: 'rgba(16, 185, 129, 0.3)' }} 
                     className="p-6 border-4 rounded-[3rem] shadow-2xl relative">
                  <QRCodeSVG 
                    value={qrData}
                    size={280}
                    level="H"
                    includeMargin={false}
                    className="rounded-2xl qr-main-svg"
                  />
                  {/* Small Center Logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div style={{ backgroundColor: '#ffffff', borderColor: '#10b981' }} 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center p-2 shadow-xl border-2">
                        <Globe style={{ color: '#059669' }} size={32} />
                     </div>
                  </div>
                </div>

                <div className="text-center space-y-3">
                   <h4 style={{ color: '#0f172a' }} className="text-3xl font-black font-outfit uppercase tracking-tighter">
                      {formData.dustbin_id || "ID PENDING"}
                   </h4>
                   <div className="flex items-center justify-center gap-3">
                      <div style={{ backgroundColor: '#d1fae5', color: '#059669' }} 
                           className="w-8 h-8 rounded-full flex items-center justify-center">
                         <MapPin size={16} />
                      </div>
                      <span style={{ color: '#475569' }} className="text-sm font-bold truncate max-w-[250px]">
                         {formData.location || "Location not assigned"}
                      </span>
                   </div>
                   <p style={{ color: '#94a3b8' }} className="text-[10px] font-black uppercase tracking-[0.4em] pt-4">
                      towards a cleaner, greener city
                   </p>
                </div>
             </div>
             
             {/* Background Leaf Patterns */}
             <div className="absolute top-[-20px] left-[-20px] opacity-10 pointer-events-none ignore-on-export">
                <Leaf size={180} style={{ color: '#f1f5f9' }} />
             </div>
             <div className="absolute bottom-[-40px] right-[-40px] opacity-10 pointer-events-none rotate-[45deg] ignore-on-export">
                <Leaf size={120} style={{ color: '#10b981' }} />
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <button 
               onClick={downloadPNG}
               style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }}
               className="h-16 rounded-2xl hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-500 border transition-all active:scale-95 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
             >
                <Download size={20} /> PNG
             </button>
             <button 
               onClick={downloadPDF}
               style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }}
               className="h-16 rounded-2xl hover:bg-blue-500/10 text-slate-300 hover:text-blue-500 border transition-all active:scale-95 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
             >
                <FileText size={20} /> PDF
             </button>
             <button 
               onClick={handlePrint}
               style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }}
               className="col-span-2 md:col-span-1 h-16 rounded-2xl hover:bg-purple-500/10 text-slate-300 hover:text-purple-500 border transition-all active:scale-95 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
             >
                <Printer size={20} /> Print
             </button>
          </div>

          <AnimatePresence>
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                className="p-6 border rounded-3xl flex items-center gap-5"
              >
                 <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }} 
                      className="w-12 h-12 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <h5 className="font-black text-emerald-500 uppercase tracking-widest text-sm">QR Generated Successfully</h5>
                    <p style={{ color: '#64748b' }} className="text-[11px] font-medium tracking-wide mt-1">Sustainability node has been established in the digital registry.</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminQRGenerator;
