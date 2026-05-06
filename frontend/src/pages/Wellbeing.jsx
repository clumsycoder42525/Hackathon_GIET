import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Bed, Utensils, Zap, ShieldCheck, AlertTriangle, Lightbulb, ChevronRight, Loader2 } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const Wellbeing = () => {
  const [data, setData] = useState({
    sleep: 7,
    diet: 'Healthy, moderate protein',
    activity: '30 mins walking'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/analyze-health', data);
      setReport(response.data);
      toast.success('Vitals analyzed successfully!');
    } catch (error) {
      toast.error('Vitals scan failed. System recalibrating.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold flex items-center leading-tight">
          <HeartPulse className="mr-3 text-teal-400 p-2 bg-teal-500/10 rounded-2xl animate-pulse shadow-[0_0_20px_#2dd4bf22]" size={48} />
          Vitals Analyzer
        </h2>
        <p className="text-gray-400 mt-2 font-medium">Track your biometric behavior for AI-driven longevity insights.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 border-white/5 bg-white/[0.01] space-y-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <HeartPulse size={120} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] border-b border-white/5 pb-4 text-gray-500">Log Daily Data</h3>
            
            <div className="space-y-8 relative z-10">
              {/* Sleep Input */}
              <div className="space-y-4">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Bed size={16} className="mr-2 text-blue-400" />
                  Sleep Duration
                </label>
                <div className="flex items-center space-x-6">
                  <input 
                    type="range" min="1" max="15" step="0.5"
                    value={data.sleep}
                    onChange={(e) => setData({...data, sleep: e.target.value})}
                    className="flex-1 accent-teal-500 h-1.5 bg-white/10 rounded-full cursor-pointer"
                  />
                  <span className="text-2xl font-black text-gradient w-12">{data.sleep}h</span>
                </div>
              </div>

              {/* Diet Input */}
              <div className="space-y-4">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Utensils size={16} className="mr-2 text-green-400" />
                  Nutritional Data
                </label>
                <textarea
                  value={data.diet}
                  onChange={(e) => setData({...data, diet: e.target.value})}
                  placeholder="e.g., Heavy breakfast, lunch skip, junk food..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-teal-500/50 h-28 resize-none font-medium leading-relaxed shadow-inner"
                />
              </div>

              {/* Activity Input */}
              <div className="space-y-4">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Zap size={16} className="mr-2 text-yellow-400" />
                  Kinetic Activity
                </label>
                <textarea
                  value={data.activity}
                  onChange={(e) => setData({...data, activity: e.target.value})}
                  placeholder="e.g., 2 hours gym, sedentary office work..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-teal-500/50 h-28 resize-none font-medium leading-relaxed shadow-inner"
                />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full py-5 bg-premium-gradient rounded-2xl font-black uppercase tracking-[0.2em] text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-3 shadow-teal-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Scanning Biology...</span>
                </>
              ) : (
                <>
                  <HeartPulse size={18} />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Section */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {!report ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px] border-dashed border-2 border-white/5 opacity-40 focus-within:opacity-100 transition-opacity"
              >
                <ShieldCheck size={64} className="text-gray-700 mb-6" />
                <div className="space-y-2 text-center">
                   <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Biometric Report Pending</h3>
                   <p className="text-[10px] text-gray-600 font-bold max-w-xs uppercase tracking-widest">Connect your daily vitals to receive AI-driven longevity suggestions.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Status Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card p-6 border-white/10 bg-white/[0.02] flex items-center space-x-5 shadow-xl border-t-2 border-t-teal-500/30">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${report.riskLevel === 'Low' ? 'bg-teal-500/10 text-teal-400' : report.riskLevel === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                      {report.riskLevel === 'Low' ? <ShieldCheck size={32}/> : <AlertTriangle size={32}/>}
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Risk Potential</p>
                      <h4 className="text-2xl font-black">{report.riskLevel}</h4>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 border-white/10 bg-white/[0.02] flex items-center space-x-5 shadow-xl border-t-2 border-t-teal-500/30">
                    <div className="w-14 h-14 rounded-2xl bg-premium-gradient flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                      <Zap size={32} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Data Integrity</p>
                      <h4 className="text-2xl font-black">Verified</h4>
                    </div>
                  </div>
                </div>

                {/* Detailed Insights */}
                <div className="glass-card p-8 border-white/10 bg-white/[0.02] space-y-6 shadow-2xl">
                  <h4 className="text-xs font-black flex items-center uppercase tracking-[0.2em] text-yellow-500">
                    <Lightbulb className="mr-3" size={18} />
                    Pattern Observations
                  </h4>
                  <div className="space-y-5">
                    {report.insights.map((insight, i) => (
                      <div key={i} className="flex items-start space-x-4 group">
                        <ChevronRight className="text-teal-400 mt-0.5 shrink-0 group-hover:translate-x-1 transition-transform" size={18} />
                        <p className="text-slate-300 leading-relaxed text-sm font-medium">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="glass-card p-8 border-white/10 bg-teal-500/[0.01] space-y-6 shadow-2xl relative overflow-hidden">
                  <h4 className="text-xs font-black flex items-center text-teal-400 uppercase tracking-[0.2em]">
                    <Zap className="mr-3" size={18} /> Personalized Protocol
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.suggestions.map((sug, i) => (
                      <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all group cursor-default">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 group-hover:text-purple-400">Optimization {i+1}</p>
                        <p className="text-xs text-slate-200 font-semibold leading-normal">{sug}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wellbeing;
