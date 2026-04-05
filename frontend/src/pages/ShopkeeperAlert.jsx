import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import jsQR from 'jsqr';
import { QrCode, Send, AlertCircle, CheckCircle2, Camera, CameraOff, Keyboard, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShopkeeperAlert = () => {
  const [mode, setMode] = useState('manual'); // 'manual' | 'scan'
  const [dustbinId, setDustbinId] = useState('');
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [scanError, setScanError] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [fetchingAlerts, setFetchingAlerts] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);

  // Start camera when in scan mode
  useEffect(() => {
    fetchMyAlerts();
    if (mode === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const fetchMyAlerts = async () => {
    try {
      const { data } = await axios.get('/api/alerts');
      // Filter out bulky requests so it only shows manual reports here, OR show all? We will show all for full transparency.
      setAlerts(data.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    }
    setFetchingAlerts(false);
  };

  const startCamera = async () => {
    setScanError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      // Poll frames for QR decoding using jsQR
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      scannerRef.current = setInterval(() => {
        if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) return;
        try {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code && code.data) {
            const url = code.data;
            const match = url.match(/dustbin=(SMW-DB-[^&]+)/i);
            
            let extractedId = '';
            let message = '';
            
            if (match) {
              extractedId = match[1];
              message = `QR scanned! Dustbin ${extractedId} detected.`;
            } else if (url.startsWith('SMW-DB-')) {
               // Allow plain ID strings that start with our prefix
               extractedId = url.trim();
               message = `QR scanned! Dustbin ${extractedId} detected.`;
            } else {
               try {
                  const parsedData = JSON.parse(url);
                  // Check for our specific JSON keys
                  if (parsedData.dustbin_id && (parsedData.system_origin === 'SMW-PRO' || parsedData.dustbin_id.startsWith('SMW-DB-'))) {
                     extractedId = parsedData.dustbin_id;
                     message = `QR scanned! Dustbin ${extractedId} detected at ${parsedData.location || 'assigned location'}.`;
                  } else {
                     throw new Error('Invalid SMW content');
                  }
               } catch (e) {
                  // If it's not a URL, not a plain SMW-DB ID, and not SMW JSON, reject it
                  setScanError('Unauthorized QR Code. Please scan official SMW tags only.');
                  return;
               }
            }
            
            setDustbinId(extractedId);
            setMode('manual');
            setMessage(message);
            setScanError(''); // Clear any previous errors
            clearInterval(scannerRef.current);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop());
            }
          }
        } catch {}
      }, 500);
    } catch (err) {
      setScanError('Camera access denied. Please allow camera permissions or use manual entry below.');
      setMode('manual');
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) clearInterval(scannerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dustbinId.trim()) return;
    setStatus('loading');
    setMessage('');
    try {
      await axios.post('/api/alerts', {
        dustbin_id: dustbinId.trim(),
        comments: comments.trim() || 'Overflow / Unlogged waste reported via merchant portal.',
      });
      setStatus('success');
      setMessage('Alert lodged successfully! Admin notified in real-time.');
      setDustbinId('');
      setComments('');
      fetchMyAlerts(); // Refresh the list after submission
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to lodge alert. Please try again.');
    }
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-semibold font-medium">
          <AlertCircle size={12} /> Emergency Reporting Protocol
        </div>
        <h1 className="text-4xl font-semibold font-outfit text-[#263238] tracking-tight uppercase">
          Lodge Complaint
        </h1>
        <p className="text-[#607D8B] font-medium">
          Scan the QR code on any dustbin to instantly raise an overflow or anomaly alert to the Market Admin.
        </p>
      </motion.header>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 p-1.5 bg-white border border-[#E0E0E0] rounded-2xl"
      >
        <button
          onClick={() => setMode('scan')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold font-medium transition-all ${
            mode === 'scan'
              ? 'bg-[#2E7D32] text-white shadow-lg shadow-[#2E7D32]/20'
              : 'bg-transparent text-[#607D8B] hover:bg-slate-50 hover:text-[#263238]'
          }`}
        >
          <Camera size={16} /> Scan QR Code
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold font-medium transition-all ${
            mode === 'manual'
              ? 'bg-[#0D47A1] text-white shadow-lg shadow-[#0D47A1]/20'
              : 'bg-transparent text-[#607D8B] hover:bg-slate-50 hover:text-[#263238]'
          }`}
        >
          <Keyboard size={16} /> Manual Entry
        </button>
      </motion.div>

      {/* QR Scanner View */}
      <AnimatePresence mode="wait">
        {mode === 'scan' && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="saas-card p-4 space-y-4"
          >
            <div className="relative rounded-2xl overflow-hidden bg-[#F5F7F6] aspect-square max-h-72 mx-auto flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              {/* Corners overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#2E7D32] rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#2E7D32] rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#2E7D32] rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#2E7D32] rounded-br-lg" />
                <motion.div
                  animate={{ y: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-4 right-4 h-0.5 bg-[#2E7D32]/60 blur-sm"
                />
              </div>
            </div>
            {scanError && (
              <p className="text-center text-xs text-[#E65100] font-medium px-4">{scanError}</p>
            )}
            <p className="text-center text-xs font-semibold font-medium text-slate-600">
              Align QR code within the frame
            </p>
          </motion.div>
        )}

        {/* Manual / Post-Scan Form */}
        {mode === 'manual' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="saas-card p-8 space-y-6"
          >
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 p-4 rounded-2xl text-sm font-medium ${
                  status === 'success'
                    ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20'
                    : 'bg-[#0D47A1]/10 text-[#0D47A1] border border-[#0D47A1]/20'
                }`}
              >
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                {message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#607D8B] font-medium ml-1">
                  Dustbin / Asset ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <QrCode
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#2E7D32] transition-colors"
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. SMW-DB-000001"
                    className="w-full !pl-12 h-14 text-sm font-bold tracking-widest"
                    value={dustbinId}
                    onChange={(e) => setDustbinId(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-600 ml-1">
                  Enter manually or scan the QR on the dustbin. Seeded bin: <span className="text-[#2E7D32] font-semibold">SMW-DB-000001</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#607D8B] font-medium ml-1">
                  Incident Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Bin is overflowing, waste not collected since 2 days..."
                  className="w-full px-4 py-3 resize-none"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !dustbinId.trim()}
                className="w-full btn-primary h-14 flex items-center justify-center gap-3 bg-rose-500 hover:bg-rose-400 shadow-rose-500/20 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    <span className="text-sm font-semibold uppercase tracking-[0.3em]">Lodge Alert to Office</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Toast */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 bg-[#2E7D32] text-[#263238] rounded-2xl font-semibold text-sm shadow-2xl shadow-emerald-500/40 z-50"
          >
            <CheckCircle2 size={20} /> Alert sent to Market Admin!
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 bg-rose-500 text-[#263238] rounded-2xl font-semibold text-sm shadow-2xl shadow-rose-500/40 z-50"
          >
            <AlertCircle size={20} /> {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complaint History Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 space-y-6"
      >
         <h2 className="text-xl font-semibold font-outfit font-medium text-[#263238] border-b border-[#E0E0E0] pb-4">
            Your Complaint History
         </h2>
         
         <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-10">
            {fetchingAlerts ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#2E7D32]" size={32} /></div>
            ) : alerts.length === 0 ? (
                <div className="p-8 text-center text-[#607D8B] font-bold font-medium text-xs saas-card">
                    No complaints lodged yet.
                </div>
            ) : (
                alerts.map(alert => (
                    <div key={alert._id} className="saas-card p-6 border-l-[4px] relative overflow-hidden transition-all group" style={{ borderColor: alert.status === 'Resolved' ? '#10b981' : '#3b82f6' }}>
                        <div className="flex flex-wrap justify-between items-start gap-4 relative z-10">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-[#263238] uppercase tracking-wider text-sm">
                                        Ticket #{alert._id.slice(-6).toUpperCase()}
                                    </h3>
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-widest border uppercase ${
                                        alert.status === 'Resolved' ? 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20' : 'bg-[#0D47A1]/10 text-[#0D47A1] border-[#0D47A1]/20'
                                    }`}>
                                        {alert.status}
                                    </span>
                                    {alert.comments?.includes('BULKY') && (
                                        <span className="px-2 py-1 bg-[#E65100]/10 text-[#E65100] border border-[#E65100]/20 rounded-md text-xs font-semibold tracking-widest uppercase">
                                            Bulky Request
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-[#607D8B]">BIN: <span className="text-[#607D8B]">{alert.dustbin_id?.dustbin_id || 'N/A'}</span></p>
                                <p className="text-sm text-[#607D8B] mt-2 bg-white/50 p-3 rounded-xl border border-[#E0E0E0]">
                                    {alert.comments || 'No description provided.'}
                                </p>
                            </div>
                            
                            <div className="text-right">
                                <p className="text-xs font-bold text-[#607D8B] font-medium">Logged On</p>
                                <p className="text-xs font-semibold text-[#607D8B]">{new Date(alert.timestamp).toLocaleDateString()}</p>
                                <p className="text-xs text-[#607D8B]">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>

                        {/* Resolution Message Box */}
                        <AnimatePresence>
                            {alert.status === 'Resolved' && alert.resolution_message && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 pt-4 border-t border-[#E0E0E0] relative z-10"
                                >
                                    <div className="bg-[#2E7D32]/5 border border-[#2E7D32]/10 p-4 rounded-xl flex items-start gap-3">
                                        <CheckCircle2 className="text-[#2E7D32] shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-xs font-semibold font-medium text-[#2E7D32]/70 mb-1">Admin Resolution / ETA</p>
                                            <p className="text-sm font-bold text-[#2E7D32] leading-relaxed">{alert.resolution_message}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {/* Glow effect for resolved cards */}
                        {alert.status === 'Resolved' && (
                            <div className="absolute inset-0 bg-[#2E7D32]/[0.02] pointer-events-none" />
                        )}
                    </div>
                ))
            )}
         </div>
      </motion.section>
    </div>
  );
};

export default ShopkeeperAlert;
