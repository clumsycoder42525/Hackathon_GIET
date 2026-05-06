import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Brain, Bell, Palette, Shield, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const SettingsModal = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl glass-card bg-slate-900/90 border-white/10 shadow-emerald-500/5 shadow-2xl overflow-hidden flex flex-col max-h-full"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
                <Palette size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">System Settings</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Configure your academic identity</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Profile Section */}
              <section className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 border-b border-white/5 pb-4">Personal Neural Identity</h3>
                <div className="flex items-center space-x-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <div className="w-16 h-16 rounded-full bg-premium-gradient flex items-center justify-center text-xl font-black text-white shadow-xl shadow-teal-500/10">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white leading-tight">{user?.name || 'User'}</h4>
                    <p className="text-xs text-gray-500 font-medium">{user?.email || 'student@pranagyan.ai'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <div className="flex items-center space-x-3 text-sm font-bold text-gray-300 group-hover:text-white">
                      <User size={18} className="text-teal-400" />
                      <span>Edit Profile</span>
                    </div>
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <div className="flex items-center space-x-3 text-sm font-bold text-gray-300 group-hover:text-white">
                      <Shield size={18} className="text-blue-400" />
                      <span>Privacy & Security</span>
                    </div>
                  </button>
                </div>
              </section>

              {/* Preferences Section */}
              <section className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 border-b border-white/5 pb-4">Cognitive Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <Brain size={18} className="text-purple-400" />
                      <span className="text-sm font-bold text-gray-200">AI Auto-Voice</span>
                    </div>
                    <div className="w-10 h-6 bg-teal-500 rounded-full flex items-center px-1 shadow-inner relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full shadow-lg ml-auto" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 opacity-50">
                    <div className="flex items-center space-x-3">
                      <Bell size={18} className="text-pink-400" />
                      <span className="text-sm font-bold text-gray-200">Smart Reminders</span>
                    </div>
                    <div className="w-10 h-6 bg-slate-800 rounded-full flex items-center px-1 shadow-inner relative cursor-pointer">
                      <div className="w-4 h-4 bg-gray-600 rounded-full shadow-lg" />
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                   <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-4">Select Interface Hue</h3>
                   <div className="flex space-x-3">
                      {['#2dd4bf', '#a855f7', '#3b82f6'].map((color) => (
                        <div 
                          key={color}
                          className="w-8 h-8 rounded-full border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                   </div>
                </div>
              </section>

            </div>
          </div>

          {/* Footer */}
          <div className="p-8 bg-white/[0.01] flex items-center justify-between border-t border-white/5">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-loose">
              PranaGyan Build 1.0.4 <br /> 
              Syncing with Academic Core v4
            </p>
            <button 
              onClick={() => {
                logout();
                toast.success("Safe departure, Scholar.");
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <LogOut size={14} />
              <span>Terminate Session</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
