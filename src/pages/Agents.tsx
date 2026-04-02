import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { BrainCircuit, Plus, Trash2, Bot, Sparkles, ShieldCheck, Info, Loader2, X, FileText, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { FileUploader } from '../components/FileUploader';

export const Agents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  
  const [name, setName] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [model, setModel] = useState('gemini-3.1-pro-preview');
  const [files, setFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!name.trim() && files.length === 0) return;
    setIsGeneratingPrompt(true);
    try {
      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Genera una instrucción de sistema (Master Prompt) de élite para un agente llamado "${name}". El agente debe ser sofisticado, profesional y experto. Utiliza los archivos adjuntos como referencia para definir su comportamiento y conocimientos especializados.`,
          type: 'text',
          files: files.map(f => ({ data: f.data, mimeType: f.mimeType }))
        })
      });
      const data = await response.json();
      if (data.result) {
        setSystemInstruction(data.result);
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !name.trim() || !systemInstruction.trim()) return;
    
    try {
      await addDoc(collection(db, 'agents'), {
        id: crypto.randomUUID(),
        userId: user.uid,
        name,
        systemInstruction,
        model,
        createdAt: new Date().toISOString()
      });
      
      setIsCreating(false);
      setName('');
      setSystemInstruction('');
      setFiles([]);
      fetchAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'agents', id));
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#030303] overflow-hidden">
      <header className="p-6 border-b border-orange-500/10 bg-[#050505] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors text-zinc-500 hover:text-orange-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <BrainCircuit className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Nexus Forge</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Arquitectura de Agentes Autónomos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <ShieldCheck className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Nexus Verified</span>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nuevo Agente
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {isCreating && (
            <div className="bg-[#050505] border border-orange-500/20 rounded-sm p-8 mb-12 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Configuración de Agente de Élite</h2>
                </div>
                <button onClick={() => setIsCreating(false)} className="text-zinc-600 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Identidad del Agente</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Estratega de Marketing, Arquitecto de Software..."
                      className="w-full bg-black border border-zinc-800 rounded-sm px-4 py-3 text-xs text-white outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Base de Conocimiento (Opcional)</label>
                    <FileUploader files={files} setFiles={setFiles} label="Subir Documentos de Referencia" />
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">
                      Sube archivos para que la IA genere un Master Prompt basado en tu documentación.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Núcleo de Procesamiento</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-sm px-4 py-3 text-xs text-white outline-none focus:border-orange-500/50 transition-all appearance-none"
                    >
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Razonamiento Complejo)</option>
                      <option value="gemini-3-flash-preview">Gemini 3 Flash (Velocidad & General)</option>
                      <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (Baja Latencia)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Instrucción Maestra (Master Prompt)</label>
                      <button 
                        onClick={handleGeneratePrompt}
                        disabled={isGeneratingPrompt || (!name.trim() && files.length === 0)}
                        className="text-[9px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 flex items-center gap-1 disabled:opacity-50"
                      >
                        {isGeneratingPrompt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Auto-Generar
                      </button>
                    </div>
                    <textarea
                      value={systemInstruction}
                      onChange={(e) => setSystemInstruction(e.target.value)}
                      placeholder="Define el comportamiento, tono y límites del agente..."
                      className="w-full h-64 bg-black border border-zinc-800 rounded-sm p-4 text-xs text-zinc-300 outline-none focus:border-orange-500/50 resize-none font-mono custom-scrollbar"
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={handleCreate}
                      disabled={!name.trim() || !systemInstruction.trim()}
                      className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                    >
                      Desplegar Agente en Nexus Core
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sincronizando con la Forja...</p>
              </div>
            ) : agents.length === 0 && !isCreating ? (
              <div className="col-span-full text-center py-32 border border-dashed border-orange-500/10 rounded-sm bg-orange-500/5">
                <BrainCircuit className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">No hay Agentes Desplegados</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest max-w-md mx-auto mb-8">
                  Crea tu primer Agente de Hiper-Excelencia definiendo una instrucción maestra y seleccionando un núcleo de procesamiento.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left mb-12 px-6">
                  {[
                    { name: 'Elite Copywriter', color: 'text-orange-500', desc: 'Escritura persuasiva y optimizada para conversión.' },
                    { name: 'Software Architect', color: 'text-blue-500', desc: 'Diseño de sistemas robustos y escalables.' },
                    { name: 'Business Advisor', color: 'text-purple-500', desc: 'Estrategia ejecutiva basada en datos.' }
                  ].map((tpl, i) => (
                    <div 
                      key={i}
                      onClick={() => {
                        setName(tpl.name);
                        setSystemInstruction(`Eres un ${tpl.name} de clase mundial. Tu objetivo es proporcionar resultados excepcionales con un tono profesional y sofisticado.`);
                        setIsCreating(true);
                      }}
                      className="p-6 bg-black border border-zinc-800 rounded-sm hover:border-orange-500/30 cursor-pointer transition-all group"
                    >
                      <h4 className={cn("text-[10px] font-black uppercase tracking-widest mb-2", tpl.color)}>{tpl.name}</h4>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">{tpl.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsCreating(true)}
                  className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-200 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Crear Agente Personalizado
                </button>
              </div>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="bg-[#050505] border border-orange-500/10 rounded-sm p-6 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-tight text-white">{agent.name}</h3>
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{agent.model}</p>
                    </div>
                  </div>
                  
                  <div className="bg-black rounded-sm p-4 border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3 h-3 text-zinc-700" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Instrucción Maestra</span>
                    </div>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest line-clamp-4 leading-relaxed italic">
                      "{agent.systemInstruction}"
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Activo en Nexus Core</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-800">
                      ID: {agent.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
