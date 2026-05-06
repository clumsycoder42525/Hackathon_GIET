import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, AlertCircle, TrendingUp, Coffee, Brain, Loader2, Target, CheckCircle2, Activity } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const FocusMode = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      setIsDone(true);
      generateReport();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  // Track window focus/blur as distraction proxy
  useEffect(() => {
    const handleBlur = () => {
      if (isActive) {
        setDistractions((d) => d + 1);
        toast('Distraction detected!', { icon: '⚠️', duration: 1000 });
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isActive]);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const sessionData = {
        duration: 25 * 60 - timeLeft,
        distractions,
        timestamp: new Date().toISOString()
      };
      const response = await api.post('/focus-report', { sessionData });
      setReport(response.data);
      toast.success('Session sync complete!');
    } catch (error) {
      toast.error('Failed to sync session report.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isActive) toast.success('Focus session started');
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setDistractions(0);
    setIsDone(false);
    setReport(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto pb-20">
      {/* LEFT & CENTER: Focus Workspace */}
      <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-12 min-h-[600px] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Deep Focus Detected</span>
        </div>

        {/* Circular Timer Section */}
        <div className="relative group p-4">
          {/* Background Glows */}
          <div className={`absolute inset-0 bg-emerald-500 opacity-5 blur-[120px] rounded-full scale-150 transition-opacity duration-1000 ${isActive ? 'opacity-20' : 'opacity-0'}`} />
          
          {/* Progress Ring SVG */}
          <div className="relative w-[400px] h-[400px] flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
              <circle
                cx="200"
                cy="200"
                r="190"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-white/5"
              />
              <motion.circle
                cx="200"
                cy="200"
                r="190"
                stroke="url(#timerGradient)"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 190}
                initial={{ strokeDashoffset: 2 * Math.PI * 190 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 190 * (timeLeft / (25 * 60)) }}
                transition={{ duration: 1, ease: "linear" }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Typography */}
            <div className="text-center z-10">
              <motion.span 
                key={timeLeft}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-8xl font-thin tracking-tighter text-white drop-shadow-2xl flex items-baseline"
              >
                {formatTime(timeLeft)}
              </motion.span>
              <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.6em] font-black opacity-50">Remaining Focus Time</p>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex items-center space-x-6 z-20">
          <button 
            onClick={toggleTimer}
            className="flex items-center space-x-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-300 hover:text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] group shadow-xl"
          >
            {isActive ? (
              <><Pause size={16} className="group-hover:scale-110 transition-transform" /> <span>Pause Session</span></>
            ) : (
              <><Play size={16} fill="white" className="group-hover:scale-110 transition-transform" /> <span>Initiate Focus</span></>
            )}
          </button>

          <button 
            onClick={generateReport}
            disabled={isLoading || timeLeft === 25 * 60}
            className={`flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] shadow-xl ${timeLeft < 25*60 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 border border-white/5 text-gray-600 opacity-50 cursor-not-allowed'}`}
          >
            <CheckCircle2 size={16} />
            <span>{isLoading ? 'Syncing...' : 'End & Archive'}</span>
          </button>

          <button 
            onClick={resetTimer}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-xl"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Analytics & Environment */}
      <div className="lg:col-span-4 space-y-8">
        {/* Efficiency Report Card */}
        <div className="glass-card p-8 border-white/10 bg-white/[0.02] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={64} />
          </div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Efficiency Report</h3>
            <Activity className="text-emerald-500" size={14} />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-baseline justify-between">
              <span className="text-6xl font-thin text-white">{report?.focusScore || (isActive ? '88' : '0')}</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Elite Score</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${report?.focusScore || (isActive ? 88 : 0)}%` }}
                className="h-full bg-premium-gradient shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Distractions</p>
                <p className="text-xl font-bold text-white tracking-tight">{distractions.toString().padStart(2, '0')}</p>
              </div>
              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Peak Flow</p>
                <p className="text-xl font-bold text-white tracking-tight">{isActive ? '18m' : '0m'}</p>
              </div>
            </div>

            {report && (
              <p className="text-[11px] text-gray-400 font-medium italic border-l-2 border-emerald-500/30 pl-4 py-1 leading-relaxed">
                "{report.efficiencyAnalysis}"
              </p>
            )}
          </div>
        </div>

        {/* Soundscapes Selection */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Focus Soundscapes</h3>
          <div className="space-y-2">
            {[
              { id: 'rain', title: 'Nordic Rain', sub: '432HZ RESONANCE', active: true },
              { id: 'void', title: 'Digital Void', sub: 'DEEP STATIC WHITE NOISE', active: false },
              { id: 'forest', title: 'Ethereal Forest', sub: 'BINAURAL WIND CHIMES', active: false }
            ].map(sound => (
              <div 
                key={sound.id}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${sound.active ? 'bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sound.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-600'}`}>
                   {sound.active ? <Activity size={18} className="animate-pulse" /> : <Coffee size={18} />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-black tracking-widest uppercase ${sound.active ? 'text-emerald-400' : 'text-gray-300'}`}>{sound.title}</h4>
                    <p className="text-[9px] text-gray-500 font-bold tracking-widest mt-0.5">{sound.sub}</p>
                  </div>
                </div>
                {sound.active && <div className="flex space-x-0.5">
                  {[1,2,3,4].map(i => <motion.div key={i} animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: i*0.1 }} className="w-0.5 bg-emerald-500 rounded-full" />)}
                </div>}
              </div>
            ))}
          </div>
        </div>

        {/* Master Audio Control */}
        <div className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3 text-gray-500">
               <Coffee size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Master Feed</span>
             </div>
             <span className="text-[10px] font-black text-emerald-500">65%</span>
          </div>
          <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="absolute left-0 top-0 h-full w-[65%] bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
