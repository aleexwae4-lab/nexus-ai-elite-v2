import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Loader2, Brain, Globe, MapPin, BrainCircuit, Sparkles, ShieldCheck, Plus, X, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FileUploader } from '../components/FileUploader';

export const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [files, setFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchAgents();
    }
  }, [user]);

  const fetchAgents = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'agents'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedAgents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(fetchedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && files.length === 0) || loading) return;

    const userMessage = input;
    const currentFiles = [...files];
    
    setInput('');
    setFiles([]);
    setShowUploader(false);
    
    setMessages(prev => [...prev, { role: 'user', text: userMessage || 'Análisis de archivos adjuntos' }]);
    setLoading(true);

    try {
      const selectedAgent = agents.find(a => a.id === selectedAgentId);
      
      let type = 'text';
      if (useSearch) type = 'research';
      
      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage || 'Analiza los archivos adjuntos y proporciona un resumen detallado.',
          type,
          model: useThinking ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview',
          systemInstruction: selectedAgent?.systemInstruction,
          files: currentFiles.map(f => ({ data: f.data, mimeType: f.mimeType }))
        })
      });

      const data = await response.json();
      let responseText = data.result || 'Lo siento, no pude procesar tu solicitud.';

      if (useMaps && data.sources) {
        const links = data.sources.map((c: any) => c.maps?.uri).filter(Boolean);
        if (links.length > 0) {
          responseText += '\n\n**Ubicaciones encontradas:**\n' + links.map((l: string) => `- [Ver en Maps](${l})`).join('\n');
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error de conexión con Nexus Core.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030303] overflow-hidden">
      <header className="p-6 border-b border-orange-500/10 bg-[#050505] flex flex-wrap items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors text-zinc-500 hover:text-orange-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Bot className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Nexus Chat Elite</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Razonamiento Multimodal Avanzado</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {agents.length > 0 && (
            <div className="flex items-center gap-2 mr-4 bg-black border border-zinc-800 rounded-sm px-3 py-1">
              <BrainCircuit className="w-3 h-3 text-orange-500" />
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white outline-none"
              >
                <option value="">Asistente Nexus</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <button 
            onClick={() => { setUseThinking(!useThinking); if(!useThinking) { setUseSearch(false); setUseMaps(false); } }}
            className={cn(
              "px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
              useThinking ? "bg-orange-500/20 border-orange-500 text-orange-500" : "bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700"
            )}
          >
            <Brain className="w-3 h-3" /> Thinking
          </button>
          <button 
            onClick={() => { setUseSearch(!useSearch); if(!useSearch) { setUseMaps(false); setUseThinking(false); } }}
            className={cn(
              "px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
              useSearch ? "bg-blue-500/20 border-blue-500 text-blue-500" : "bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700"
            )}
          >
            <Globe className="w-3 h-3" /> Search
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <ShieldCheck className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Nexus Verified</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          {messages.length === 0 && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 opacity-20">
              <div className="relative">
                <div className="w-24 h-24 bg-orange-500/10 rounded-full animate-pulse absolute inset-0" />
                <Bot className="w-24 h-24 text-orange-500 relative" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Nexus Intelligence Core</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Inicia una conversación de élite</p>
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-6", msg.role === 'user' ? "flex-row-reverse" : "")}>
              <div className={cn(
                "w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border",
                msg.role === 'user' ? "bg-black border-zinc-800" : "bg-orange-500/10 border-orange-500/20"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-zinc-500" /> : <Bot className="w-5 h-5 text-orange-500" />}
              </div>
              <div className={cn(
                "px-6 py-4 rounded-sm max-w-[85%] border shadow-2xl",
                msg.role === 'user' ? "bg-black border-zinc-800 text-zinc-300" : "bg-[#050505] border-orange-500/10 text-zinc-200"
              )}>
                <div className="prose prose-invert prose-orange max-w-none prose-p:leading-relaxed prose-pre:bg-black prose-pre:border prose-pre:border-zinc-800 prose-headings:italic prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-6">
              <div className="w-10 h-10 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-orange-500" />
              </div>
              <div className="px-6 py-4 rounded-sm bg-[#050505] border border-orange-500/10 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nexus está pensando...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-8 bg-[#050505] border-t border-orange-500/10">
        <div className="max-w-4xl mx-auto space-y-4">
          {showUploader && (
            <div className="mb-4 bg-black border border-orange-500/10 p-4 rounded-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Referencias Multimodales</h3>
                <button onClick={() => setShowUploader(false)} className="text-zinc-600 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <FileUploader files={files} setFiles={setFiles} />
            </div>
          )}

          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Escribe tu mensaje para Nexus AI..."
              className="w-full bg-black border border-zinc-800 rounded-sm pl-14 pr-14 py-4 text-xs text-zinc-300 outline-none focus:border-orange-500/50 resize-none h-16 custom-scrollbar"
              rows={1}
            />
            <button
              onClick={() => setShowUploader(!showUploader)}
              className={cn(
                "absolute left-4 top-4 p-1.5 rounded-sm transition-all",
                files.length > 0 ? "bg-orange-500 text-black" : "text-zinc-600 hover:text-white"
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={(!input.trim() && files.length === 0) || loading}
              className="absolute right-4 top-4 p-1.5 bg-orange-600 text-white rounded-sm hover:bg-orange-700 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(234,88,12,0.2)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-6 opacity-30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Nexus Elite Core v2.5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Sistemas Estables</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
