import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Mic, Upload, Sparkles, BookCheck, ClipboardList, CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const NotesGen = () => {
  const [inputMode, setInputMode] = useState('text');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if ((inputMode === 'text' && !text.trim()) || (inputMode === 'audio' && !file)) {
      toast.error('Please provide content to summarize');
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', title || 'Untitled Academic Note');
    if (inputMode === 'text') formData.append('text', text);
    if (inputMode === 'audio') formData.append('audio', file);

    try {
      const response = await api.post('/generate-notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      toast.success('Notes generated and synced!');
      // Clear inputs
      setText('');
      setTitle('');
      setFile(null);
    } catch (error) {
      toast.error('Failed to generate notes. AI is overloaded.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold flex items-center">
          <BookCheck className="mr-3 text-teal-400 p-2 bg-teal-500/10 rounded-2xl shadow-[0_0_20px_#2dd4bf22]" size={48} />
          Smart Notes Generator
        </h2>
        <p className="text-gray-400 mt-2 font-medium">Transform resources into structured academic breakthroughs.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Input Card */}
        <div className="glass-card p-8 border-white/5 bg-white/[0.01] space-y-6 shadow-2xl">
          <div className="space-y-4">
             <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Session Title</label>
             <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Quantum Mechanics Lecture 12"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-teal-500/50 transition-all text-white font-bold"
             />
          </div>

          <div className="flex space-x-2 p-1.5 bg-white/5 rounded-2xl w-fit">
            <button 
              onClick={() => setInputMode('text')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'text' ? 'bg-premium-gradient text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Text Logic
            </button>
            <button 
              onClick={() => setInputMode('audio')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'audio' ? 'bg-premium-gradient text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              Audio Scan
            </button>
          </div>

          {inputMode === 'text' ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste lecture transcript or text here..."
              className="w-full h-64 bg-white/[0.02] border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-teal-500/50 transition-all text-slate-300 resize-none text-sm leading-relaxed"
            />
          ) : (
            <div className="border-2 border-dashed border-white/10 rounded-2xl h-64 flex flex-col items-center justify-center p-10 group hover:border-teal-500/50 transition-all cursor-pointer relative overflow-hidden bg-white/[0.01]">
              <input 
                type="file" 
                accept="audio/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="text-teal-400" size={28} />
              </div>
              <p className="text-slate-300 font-black uppercase tracking-widest text-xs">
                {file ? file.name : 'Upload Audio Data'}
              </p>
              <p className="text-gray-600 text-[10px] mt-2 font-bold">Supports AI transcription for MP3/WAV</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-5 bg-premium-gradient rounded-2xl font-black uppercase tracking-[0.2em] text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-3 shadow-teal-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin text-teal-400" size={18} />
                <span>Syncing with Groq...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Smart Brain</span>
              </>
            )}
          </button>
        </div>

        {/* Output Card */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-12 border-white/5 bg-white/[0.01] border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[500px] opacity-40 focus-within:opacity-100 transition-opacity"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
                  <FileText size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Waiting for Data</h3>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Submit lecture input to generate academic memory</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Structured Notes */}
                <div className="glass-card p-8 border-white/5 bg-white/[0.01] shadow-2xl border-t-teal-500/30 border-t-2 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <FileText size={48} />
                   </div>
                  <h3 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center border-b border-white/5 pb-4">
                    <ClipboardList className="mr-3 text-teal-400" size={24} />
                    Academic Brief
                  </h3>
                  <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                    {result.structuredNotes}
                  </div>
                </div>

                {/* Key Concepts & Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                    <h4 className="font-black text-teal-400 mb-4 flex items-center uppercase tracking-widest text-xs">
                      <Sparkles className="mr-2" size={14} /> Core Concepts
                    </h4>
                    <div className="space-y-2">
                      {result.keyConcepts?.map((concept, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs text-slate-400 font-bold">
                          <CheckCircle2 size={12} className="mt-0.5 text-green-500/60" />
                          <span>{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                    <h4 className="font-black text-blue-400 mb-4 flex items-center uppercase tracking-widest text-xs">
                      <AlertCircle className="mr-2" size={14} /> Critical Logic
                    </h4>
                    <div className="space-y-2">
                       {result.importantQuestions?.map((q, i) => (
                        <div key={i} className="flex items-start space-x-3 text-xs text-slate-400 font-bold group">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
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

export default NotesGen;
