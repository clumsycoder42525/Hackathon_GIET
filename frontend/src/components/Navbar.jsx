import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, BookOpen, HeartPulse, 
  Timer, History, Settings, LogOut, Menu, X, User as UserIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import SettingsModal from './SettingsModal';

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'AI Chat', icon: MessageSquare, path: '/chat' },
    { name: 'Notes Gen', icon: BookOpen, path: '/notes' },
    { name: 'Wellbeing', icon: HeartPulse, path: '/wellbeing' },
    { name: 'Focus Mode', icon: Timer, path: '/focus' },
    { name: 'Memory', icon: History, path: '/memory' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0 bg-background/60 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 bg-premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div className="hidden sm:block leading-tight">
            <h1 className="text-xl font-black tracking-tighter text-white italic">PranaGyan</h1>
            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none">Life Energy & Learning</p>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                relative px-4 py-2 rounded-xl transition-all duration-300 group
                ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-2 relative z-10 font-bold text-sm">
                    <item.icon size={18} className={isActive ? 'text-teal-400' : 'text-gray-500 group-hover:text-white'} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-teal-500/5 rounded-xl border border-teal-500/10 shadow-inner"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gradient origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right: User Section */}
        <div className="flex items-center space-x-4 shrink-0">
          <div className="hidden sm:flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 transition-all hover:border-white/10">
            <div className="w-8 h-8 rounded-full bg-premium-gradient flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-teal-500/20">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-black text-white truncate max-w-[100px]">{user?.name || 'User'}</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Academic Plan</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Settings size={20} />
          </button>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-background/95 backdrop-blur-3xl"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all
                    ${isActive ? 'bg-premium-gradient text-white shadow-xl shadow-teal-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-black uppercase tracking-widest text-xs">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </nav>
  );
};

export default Navbar;
