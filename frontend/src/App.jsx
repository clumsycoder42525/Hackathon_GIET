import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import NotesGen from './pages/NotesGen';
import Wellbeing from './pages/Wellbeing';
import FocusMode from './pages/FocusMode';
import MemoryTimeline from './pages/MemoryTimeline';
import { Login } from './pages/AuthPages';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/useAuthStore';

const Layout = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  
  return (
    <div className="bg-background min-h-screen text-slate-200">
      {isLoggedIn && <Navbar />}
      <main className={`${isLoggedIn ? 'pt-24 px-6 sm:px-10' : 'w-full'} flex-1 max-w-7xl mx-auto pb-10`}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1F2937',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><NotesGen /></ProtectedRoute>} />
          <Route path="/wellbeing" element={<ProtectedRoute><Wellbeing /></ProtectedRoute>} />
          <Route path="/focus" element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
          <Route path="/memory" element={<ProtectedRoute><MemoryTimeline /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
