import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Timer, Heart, Rocket, Target, FileText, ChevronRight, MessageSquare, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../api';

const StatCard = ({ icon: Icon, title, value, detail, color, isLoading }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card glass-card-hover p-6 border-white/5 bg-white/[0.02] shadow-xl"
  >
    {isLoading ? (
      <div className="animate-pulse space-y-4">
        <div className="w-12 h-12 bg-white/5 rounded-2xl" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="h-8 bg-white/5 rounded w-3/4" />
      </div>
    ) : (
      <>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500`}>
          <Icon className="text-teal-400" size={24} />
        </div>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-white">{value}</h3>
        <p className="text-xs text-gray-500 mt-2 flex items-center">
          <Activity size={12} className="mr-1 inline text-green-400" />
          {detail}
        </p>
      </>
    )}
  </motion.div>
);

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/user/dashboard');
        setData(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
            Welcome back to <span className="text-gradient font-black">PranaGyan</span>, {user?.name}!
          </h2>
          <p className="text-gray-400 font-medium">Your life energy and intelligent learning are in sync.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-tighter">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div className="flex items-center justify-end space-x-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_#2dd4bf]" />
            <span className="text-[10px] text-teal-500 uppercase font-black tracking-widest">System Online</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={Brain} 
          title="Learning Progress" 
          value={isLoading ? '' : `${data?.recentNotes?.length * 10}%`} 
          detail={isLoading ? '' : `${data?.recentNotes?.length || 0} active notes saved`} 
          color="bg-teal-500/10"
          isLoading={isLoading}
        />
        <StatCard 
          icon={Timer} 
          title="Focus Time" 
          value={isLoading ? '' : formatDuration(data?.focusStats?.totalSeconds || 0)} 
          detail={isLoading ? '' : `Last session: ${data?.focusStats?.recentScore || 0}% efficiency`} 
          color="bg-teal-500/10"
          isLoading={isLoading}
        />
        <StatCard 
          icon={Heart} 
          title="Wellbeing Score" 
          value="Healthy" 
          detail="Mood stability: High" 
          color="bg-teal-500/10"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Notes Brief */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center">
              <Rocket className="mr-2 text-teal-400 group-hover:animate-bounce" size={20} />
              Recent Academic Memories
            </h3>
            <Link to="/notes" className="text-xs text-teal-400 font-bold flex items-center hover:translate-x-1 transition-transform">
              View All <ChevronRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 glass-card bg-white/5 animate-pulse" />)
            ) : data?.recentNotes?.length > 0 ? (
              data.recentNotes.map((note) => (
                <motion.div 
                  key={note._id}
                  whileHover={{ scale: 1.01 }}
                  className="glass-card p-5 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] flex items-start space-x-4 transition-all"
                >
                  <div className="w-1 bg-premium-gradient h-12 rounded-full shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-lg">{note.title}</h4>
                      <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                        {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Active Node'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{note.summary}</p>
                    <div className="flex space-x-2 mt-3 overflow-hidden">
                      {note.keyConcepts?.slice(0, 3).map((concept, i) => (
                        <span key={i} className="text-[9px] bg-white/5 px-2 py-1 rounded-full text-gray-400 font-bold uppercase tracking-tighter whitespace-nowrap">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card p-10 text-center border-dashed border-white/10 opacity-50 flex flex-col items-center">
                <FileText size={32} className="mb-4 text-gray-700" />
                <p className="text-gray-500 text-sm font-medium">No notes generated yet.</p>
                <Link to="/notes" className="mt-4 px-4 py-2 bg-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/20">Create First Note</Link>
              </div>
            )}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center text-gradient">
            <Target className="mr-2 text-blue-400" size={20} />
            Deep Actions
          </h3>
          <div className="space-y-3">
            <Link to="/focus" className="block glass-card p-4 border-white/5 hover:bg-white/5 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                <Timer size={48} />
              </div>
              <span className="block text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">Resume Concentration</span>
              <span className="text-xs text-gray-500">Track and block study distractions</span>
            </Link>
            
            <Link to="/chat" className="block glass-card p-4 border-white/5 hover:bg-white/5 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                <MessageSquare size={48} />
              </div>
              <span className="block text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-purple-400 transition-colors">AI Academic Consultation</span>
              <span className="text-xs text-gray-500">Solve complex study problems now</span>
            </Link>

            <div className="glass-card p-6 bg-premium-gradient shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform shadow-teal-500/20 mt-6 animate-pulse-glow">
               <div className="relative z-10">
                <h4 className="text-white font-black text-lg underline-offset-4 decoration-2">Pro Academic Upgrade</h4>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Unlock cloud memory & unlimited tokens</p>
                <button className="mt-4 px-4 py-2 bg-white rounded-xl text-[10px] font-black text-teal-600 uppercase tracking-widest shadow-xl">Upgrade Account</button>
               </div>
               <PlusCircle size={80} className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
