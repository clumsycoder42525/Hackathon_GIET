import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import useAuthStore from '../store/useAuthStore';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md glass-card p-10 border-white/10 bg-white/[0.01] shadow-2xl relative overflow-hidden animate-pulse-glow"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Sparkles size={120} />
      </div>
      
      <div className="text-center mb-10 relative z-10">
        <div className="w-16 h-16 bg-premium-gradient rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <span className="text-white font-bold text-3xl">P</span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">{title} to PranaGyan</h2>
        <p className="text-gray-500 mt-2 text-[10px] uppercase tracking-widest font-black italic">Where Life Energy Meets Intelligent Learning</p>
      </div>

      {children}
    </motion.div>
  </div>
);

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.access_token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Student Workspace">
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-500" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-white"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-500" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-teal-500/50 transition-all text-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-premium-gradient rounded-xl font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              <span>Sign In</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          New here? <Link to="/signup" className="text-teal-400 font-bold hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', formData);
      setAuth(data.user, data.access_token);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Signup" subtitle="Academic Onboarding">
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-500" size={18} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Full Name"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-white"
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-500" size={18} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Email Address"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-white"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-500" size={18} />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Password"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-teal-500/50 transition-all text-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-premium-gradient rounded-xl font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              <span>Get Started</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-teal-400 font-bold hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
};
