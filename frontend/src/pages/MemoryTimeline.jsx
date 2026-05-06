import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { History, TrendingUp, Calendar, BookCheck, MessageCircle, HeartPulse, Sparkles, ChevronRight, Loader2, Target, Brain } from 'lucide-react';
import api from '../api';

const MemoryTimeline = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const { data } = await api.get('/user/dashboard');
        setData(data);
      } catch (err) {
        console.error('Failed to fetch timeline data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  // Mock trends (usually calculated on backend for full production)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Adjust for Mon-Sun
  const learningStats = [45, 78, 38, 85, 72, 50, 90]; // Tweaked Tuesday for visual feedback
  const moodStats = ['Happy', 'Focused', 'Neutral', 'Motivated', 'Happy', 'Relaxed', 'Focused'];

  return (
    <div className="space-y-10 pb-10">
      <header>
        <h2 className="text-3xl font-black flex items-center leading-tight">
          <History className="mr-3 text-purple-400" size={32} />
          Academic Memory Brain
        </h2>
        <p className="text-gray-400 mt-2 font-medium">Visualizing your cognitive evolution and academic breakthroughs.</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-10 border-white/5 bg-white/[0.01] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-110">
             <TrendingUp size={120} />
          </div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="font-black text-xs uppercase tracking-[0.3em] flex items-center text-gray-500">
              <TrendingUp className="mr-3 text-green-400" size={20} />
              Learning Intensity Index
            </h3>
            <span className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Historical Vitals</span>
          </div>
          
          <div className="flex items-end justify-between h-56 space-x-2 md:space-x-6 relative z-10">
            {learningStats.map((stat, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group/bar">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${stat}%` }}
                  transition={{ duration: 1.5, delay: i * 0.1, ease: 'backOut' }}
                  className={`w-full rounded-t-xl transition-all shadow-2xl relative ${
                    i === currentDayIndex 
                    ? 'bg-teal-400 opacity-100 shadow-[0_0_30px_rgba(45,212,191,0.5)] animate-pulse-glow' 
                    : 'bg-premium-gradient opacity-30 group-hover/bar:opacity-80'
                  }`}
                >
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-3 bg-slate-800 rounded-xl text-[10px] font-black text-white shadow-2xl opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none scale-90 group-hover/bar:scale-100 whitespace-nowrap">
                    {i === currentDayIndex ? 'Live: ' : ''}{stat}%
                  </div>
                  {i === currentDayIndex && (
                    <div className="absolute inset-0 bg-white/20 rounded-t-xl animate-ping opacity-20" />
                  )}
                </motion.div>
                <span className={`text-[9px] mt-4 font-black uppercase tracking-widest leading-none ${
                   i === currentDayIndex ? 'text-teal-400' : 'text-gray-600'
                }`}>
                  {weekDays[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-10 border-white/5 bg-white/[0.01] flex flex-col shadow-2xl border-t-pink-500/30 border-t-2">
          <h3 className="font-black text-xs uppercase tracking-[0.3em] flex items-center mb-10 text-gray-500">
            <HeartPulse className="mr-3 text-pink-500 animate-pulse" size={20} />
            Mood Stability
          </h3>
          <div className="space-y-4 flex-1">
            {moodStats.slice(0, 7).map((mood, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl text-[10px] font-black tracking-widest uppercase transition-all hover:translate-x-2 hover:bg-white/5 border border-white/5 group">
                <span className="text-gray-500 group-hover:text-pink-400 transition-colors">{weekDays[i]}</span>
                <span className="text-slate-300 group-hover:text-white transition-colors">{mood}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memory List */}
      <section className="space-y-10">
        <h3 className="text-xl font-black flex items-center border-b border-white/5 pb-8 uppercase tracking-[0.2em] text-gradient">
          <Calendar className="mr-4 text-blue-400" size={28} />
          Academic Milestones
        </h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
             <Loader2 size={40} className="animate-spin text-purple-400" />
             <span className="text-[10px] font-black uppercase tracking-widest">Reconstructing Memory...</span>
          </div>
        ) : (
          <div className="relative space-y-12 before:absolute before:left-8 before:top-4 before:bottom-0 before:w-1 before:bg-white/5 shadow-inner">
            {data?.recentNotes?.map((note, i) => (
              <motion.div 
                key={note._id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-24 group"
              >
                <div className="absolute left-0 top-1 w-16 h-16 bg-slate-900 border-2 border-white/5 rounded-full flex items-center justify-center z-10 group-hover:border-purple-500/50 transition-all shadow-2xl group-hover:scale-110">
                  <BookCheck size={28} className="text-purple-400" />
                </div>
                
                <div className="glass-card p-8 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h4 className="font-black text-2xl text-white tracking-tight">{note.title}</h4>
                      <p className="text-[9px] uppercase font-black tracking-[0.4em] text-purple-500 mt-1">Smart Note Node</p>
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Active Node'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-2 italic">"{note.summary}"</p>
                  <div className="mt-6">
                     <div className="flex space-x-2">
                        {note.keyConcepts?.slice(0, 3).map((concept, j) => (
                           <span key={j} className="text-[9px] bg-white/5 px-3 py-1.5 rounded-lg text-gray-500 font-black uppercase tracking-widest">
                              {concept}
                           </span>
                        ))}
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {data?.focusStats?.history?.map((report, i) => (
              <motion.div 
                key={report._id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (data?.recentNotes?.length || 0) * 0.1 + i * 0.1 }}
                className="relative pl-24 group"
              >
                <div className="absolute left-0 top-1 w-16 h-16 bg-slate-900 border-2 border-white/5 rounded-full flex items-center justify-center z-10 group-hover:border-blue-500/50 transition-all shadow-2xl group-hover:scale-110">
                  <Target size={28} className="text-blue-400" />
                </div>
                
                <div className="glass-card p-8 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-[0.02] transition-opacity" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h4 className="font-black text-2xl text-white tracking-tight">Focus Peak: {report.focusScore}%</h4>
                      <p className="text-[9px] uppercase font-black tracking-[0.4em] text-blue-500 mt-1">Concentration Cycle</p>
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Sync Point'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium italic line-clamp-2">"{report.analysis}"</p>
                  <div className="mt-6 flex items-center justify-between">
                     <div className="flex items-center space-x-4 border-l-2 border-white/5 pl-4">
                        <div className="text-center">
                           <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Duration</p>
                           <p className="text-xs font-black text-white">{Math.floor(report.duration/60)}m</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Drifts</p>
                           <p className="text-xs font-black text-white">{report.distractions}</p>
                        </div>
                     </div>
                     <button className="flex items-center text-[10px] font-black text-purple-400 uppercase tracking-widest hover:translate-x-1 transition-transform group">
                        View Analysis <ChevronRight size={14} className="ml-1" />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {!data?.recentNotes?.length && !data?.focusStats?.history?.length && (
              <div className="glass-card p-20 text-center border-dashed border-2 border-white/5 opacity-50 ml-24 flex flex-col items-center">
                 <Sparkles size={48} className="mb-6 text-gray-700" />
                 <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">The Brain is Idle</h4>
                 <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest max-w-xs leading-loose">Commence study sessions or generate notes to populate your academic neural network.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default MemoryTimeline;
