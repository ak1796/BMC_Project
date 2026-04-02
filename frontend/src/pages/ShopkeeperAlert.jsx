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
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);

  // Start camera when in scan mode
  useEffect(() => {
    if (mode === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

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
            // Parse dustbin ID from QR URL like: /api/alerts/scan?dustbin=BIN001
            const match = url.match(/dustbin=([^&]+)/i);
            if (match) {
              setDustbinId(match[1]);
              setMode('manual');
              setMessage(`QR scanned! Dustbin ${match[1]} detected.`);
            } else {
              // Use the raw value if not a URL format
              setDustbinId(url.trim());
              setMode('manual');
              setMessage(`QR scanned: ${url.trim()}`);
            }
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
          <AlertCircle size={12} /> Emergency Reporting Protocol
        </div>
        <h1 className="text-4xl font-black font-outfit text-white tracking-tight uppercase">
          Lodge Complaint
        </h1>
        <p className="text-slate-500 font-medium">
          Scan the QR code on any dustbin to instantly raise an overflow or anomaly alert to the Market Admin.
        </p>
      </motion.header>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl"
      >
        <button
          onClick={() => setMode('scan')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            mode === 'scan'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-500 hover:text-white'
          }`}
        >
          <Camera size={16} /> Scan QR Code
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            mode === 'manual'
              ? 'bg-slate-700 text-white shadow-lg'
              : 'text-slate-500 hover:text-white'
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
            className="glass-card p-4 space-y-4"
          >
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square max-h-72 mx-auto flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              {/* Corners overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500 rounded-br-lg" />
                <motion.div
                  animate={{ y: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-4 right-4 h-0.5 bg-emerald-500/60 blur-sm"
                />
              </div>
            </div>
            {scanError && (
              <p className="text-center text-xs text-amber-400 font-medium px-4">{scanError}</p>
            )}
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-600">
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
            className="glass-card p-8 space-y-6"
          >
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 p-4 rounded-2xl text-sm font-medium ${
                  status === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
              >
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                {message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Dustbin / Asset ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <QrCode
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors"
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. BIN001 or BIN-001"
                    className="w-full !pl-12 h-14 text-sm font-bold tracking-widest"
                    value={dustbinId}
                    onChange={(e) => setDustbinId(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-slate-600 ml-1">
                  Enter manually or scan the QR on the dustbin. Seeded bin: <span className="text-emerald-500 font-black">BIN001</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
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
                    <span className="text-sm font-black uppercase tracking-[0.3em]">Lodge Alert to Office</span>
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
            className="fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black text-sm shadow-2xl shadow-emerald-500/40 z-50"
          >
            <CheckCircle2 size={20} /> Alert sent to Market Admin!
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 bg-rose-500 text-white rounded-2xl font-black text-sm shadow-2xl shadow-rose-500/40 z-50"
          >
            <AlertCircle size={20} /> {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopkeeperAlert;
