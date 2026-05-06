import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Smile, MessageCircle, AlertCircle, Loader2, Mic, Volume2, VolumeX } from 'lucide-react';
import api from '../api';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Chat = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Companion. How can I help with your studies today?", tone: 'neutral' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true); // New: Auto-TTS setting
  const [currentlySpeaking, setCurrentlySpeaking] = useState(null); // idx of message being read
  
  const messagesEndRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Load last session on mount
  useEffect(() => {
    const fetchLastSession = async () => {
      try {
        const { data } = await api.get('/user/dashboard');
        if (data.lastChat?.messages) {
          setMessages(data.lastChat.messages);
        }
      } catch (err) {
        console.error('Failed to fetch chat history');
      }
    };
    fetchLastSession();

    // Check for context from Neural Memory
    if (location.state?.initialMsg) {
      setInput(location.state.initialMsg);
      toast.success("Memory Context Syncing...", { icon: '🧠' });
    }
  }, [location.state]);

  const handleSend = async (e, overrideInput = null) => {
    if (e) e.preventDefault();
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || isLoading) return;

    const userMessage = { role: 'user', content: finalInput };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input if sending via form
    if (!overrideInput) setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        message: finalInput,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        tone: response.data.detectedTone,
        tip: response.data.empathyTip
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // AUTO-SPEAK logic
      if (autoSpeak) {
        speak(aiMessage.content, messages.length + 1);
      }
      
      if (response.data.detectedTone === 'stressed') {
        toast('Hang in there! You got this.', { icon: '❤️' });
      }
    } catch (error) {
      toast.error('AI connection lost. Check your internet.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting to my brain right now. Please try again later.",
        tone: 'neutral'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Stable Client-Side Voice Engine ---
  
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser. Works best in Google Chrome.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        setInput(prev => prev + (prev ? " " : "") + finalTranscript);
      }
    };

    recognitionRef.current.onerror = (err) => {
      console.error("Speech Error:", err.error);
      
      if (err.error === 'network') {
        // PERMANENT FIX: Fallback to high-reliability Whisper mode on network error
        toast.error("Low-latency voice failed. Switching to High-Accuracy AI Sync...", { icon: '🔄' });
        stopListening();
        startWhisperMode(); // Trigger backup recording
      } else if (err.error === 'not-allowed' || err.error === 'permission-denied') {
        setIsListening(false);
        isListeningRef.current = false;
        toast.error("Microphone permission denied.");
        stopListening();
      }
    };

    recognitionRef.current.onend = () => {
      // AUTO-RESTART IF UNEXPECTED STOP
      if (isListeningRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Speech restart failed:", e);
          setIsListening(false);
          isListeningRef.current = false;
        }
      }
    };

    recognitionRef.current.start();
  };

  // --- Backup Whisper Mode (Triggered on network error) ---
  
  const startWhisperMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      setIsListening(true);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');

        const loadingToast = toast.loading("AI Syncing your voice...");
        try {
          const { data } = await api.post('/transcribe', formData);
          if (data.text) {
            setInput(prev => prev + (prev ? " " : "") + data.text.trim());
            toast.success("Voice synced via AI!", { id: loadingToast });
          } else {
            toast.error("Sync failed. Speak again.", { id: loadingToast });
          }
        } catch (err) {
          toast.error("Voice AI Offline. Check server logs.", { id: loadingToast });
        }
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start();
      toast("Recording... Stop when done.", { icon: '🎤' });
    } catch (e) {
      toast.error("Microphone blocked.");
    }
  };

  const stopListening = () => {
    setIsListening(false);
    isListeningRef.current = false;
    
    // Stop Native Recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    
    // Stop MediaRecorder (Whisper Fallback)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const speak = (text, idx) => {
    if (currentlySpeaking === idx) {
      window.speechSynthesis.cancel();
      setCurrentlySpeaking(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setCurrentlySpeaking(null);
    setCurrentlySpeaking(idx);
    window.speechSynthesis.speak(utterance);
  };

  const getToneStyle = (tone) => {
    switch (tone) {
      case 'stressed': return 'border-orange-500/30 bg-orange-500/5 text-orange-200';
      case 'confused': return 'border-blue-500/30 bg-blue-500/5 text-blue-200';
      case 'motivated': return 'border-green-500/30 bg-green-500/5 text-green-200';
      default: return 'border-white/5 bg-white/[0.02] text-slate-200';
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Sparkles className="mr-2 text-teal-400" size={24} />
            Academic AI Mentor
          </h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Logged in as {user?.name}</p>
        </div>
        <div className="flex -space-x-2">
          {[1,2,3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-slate-800" />
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-background bg-premium-gradient flex items-center justify-center text-[10px] font-bold shadow-lg shadow-teal-500/20">
            AI
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card p-6 overflow-hidden flex flex-col border-white/5 bg-white/[0.01]">
        <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-xl ${
                  msg.role === 'user' 
                    ? 'bg-premium-gradient text-white shadow-teal-500/10' 
                    : `glass-card border-white/5 ${getToneStyle(msg.tone)}`
                }`}>
                  <div className="flex justify-between items-start">
                    <p className="leading-relaxed text-sm font-medium">{msg.content}</p>
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => speak(msg.content, idx)}
                        className={`ml-3 p-1 rounded-lg transition-colors ${currentlySpeaking === idx ? 'text-teal-400 bg-teal-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                      >
                        {currentlySpeaking === idx ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    )}
                  </div>
                  
                  {msg.tip && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center text-[10px] uppercase font-black tracking-widest opacity-60">
                      <Smile size={12} className="mr-1.5" />
                      {msg.tip}
                    </div>
                  )}
                  
                  {msg.tone && msg.tone !== 'neutral' && msg.role === 'assistant' && (
                    <div className="mt-2 text-[9px] uppercase tracking-[0.2em] font-black opacity-30 flex items-center">
                      <AlertCircle size={10} className="mr-1" />
                      Tone: {msg.tone}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass-card p-4 border-white/5 bg-white/[0.02] flex items-center space-x-2 shadow-2xl">
                <Loader2 className="animate-spin text-teal-400" size={16} />
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Assistant Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="mt-6 relative flex items-center space-x-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... Speak naturally" : "Ask anything about your studies..."}
              className={`w-full bg-white/[0.03] border rounded-2xl py-5 pl-6 pr-16 focus:outline-none transition-all text-white placeholder-gray-500 text-sm ${isListening ? 'border-teal-400 shadow-[0_0_20px_#2dd4bf33] bg-teal-500/5' : 'border-white/10 focus:border-teal-500/50'}`}
            />
            <button
              type="button"
              onClick={startListening}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                isListening 
                  ? 'text-teal-400 bg-teal-500/20 animate-pulse shadow-[0_0_15px_#2dd4bf55] scale-110 ring-2 ring-teal-500/40' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mic size={20} />
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-[60px] px-6 bg-premium-gradient rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 shadow-xl shadow-teal-500/20 flex items-center justify-center shrink-0"
          >
            <Send size={20} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
