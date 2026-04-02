import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Key, Plus, Trash2, Copy, Check, ShieldAlert, Code, BrainCircuit, Settings as SettingsIcon, ShieldCheck, Zap, Sparkles, Loader2, ChevronLeft, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { NexusAIClient } from '../lib/nexus-api';

export const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // External API Keys State
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [analizaKey, setAnalizaKey] = useState('');
  const [nexusAIKey, setNexusAIKey] = useState('nx_ceeqn7a4eohk6y4uy8ra6q');
  
  // Master Prompts State
  const [prompts, setPrompts] = useState({
    chat: 'Eres Nexus Chat, el asistente de IA más avanzado del mundo. Tu objetivo es proporcionar respuestas estratégicas, precisas y de alto valor. Utiliza un tono profesional, sofisticado y directo. Tienes acceso a herramientas de búsqueda web y análisis multimodal para ofrecer la mejor inteligencia posible.',
    image: 'Genera imágenes de calidad cinematográfica 8K, con un enfoque en el hiperrealismo, iluminación dramática y composiciones artísticas de élite. Cada imagen debe transmitir una sensación de lujo, poder y perfección técnica.',
    video: 'Crea secuencias de video fluidas y de alta fidelidad utilizando el modelo Veo 3. Enfócate en movimientos de cámara dinámicos, texturas realistas y una narrativa visual impactante que cumpla con los estándares de producción de Hollywood.',
    audio: 'Produce audio de calidad de estudio con una claridad excepcional. Las voces deben sonar naturales, con la entonación y el ritmo perfectos para el contexto. La música debe ser envolvente, utilizando las capacidades de Lyria para crear composiciones originales y emotivas.',
    live: 'Eres un agente de negociación y estrategia en tiempo real. Tu comunicación debe ser extremadamente rápida, clara y persuasiva. Analiza el contexto al instante y proporciona recomendaciones tácticas que aseguren el éxito en cualquier escenario.',
    research: 'Eres un motor de investigación profunda. Tu misión es sintetizar información compleja de múltiples fuentes verificadas, proporcionando análisis críticos, tendencias de mercado y datos estructurados para la toma de decisiones de alto nivel.',
    email: 'Eres un experto en copywriting de alta conversión. Genera correos electrónicos persuasivos, elegantes y estratégicos que capturen la atención de inmediato y guíen al destinatario hacia una acción clara y valiosa.'
  });

  useEffect(() => {
    if (user) {
      fetchApiKeys();
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'settings'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        if (data.openAIKey) setOpenAIKey(data.openAIKey);
        if (data.anthropicKey) setAnthropicKey(data.anthropicKey);
        if (data.analizaKey) setAnalizaKey(data.analizaKey);
        if (data.nexusAIKey) setNexusAIKey(data.nexusAIKey);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchApiKeys = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'apiKeys'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const keys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApiKeys(keys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncNexusAI = async () => {
    if (!nexusAIKey) return;
    setSyncing(true);
    try {
      const client = new NexusAIClient(nexusAIKey);
      // Inyectar secretos en otros sistemas
      await client.injectSecrets('Vercel', {
        'NEXUSAI_API_KEY': nexusAIKey,
        'OPENAI_API_KEY': openAIKey,
        'ANTHROPIC_API_KEY': anthropicKey,
        'ANALIZA_API_KEY': analizaKey
      });
      
      // Persistir localmente también
      if (user) {
        const q = query(collection(db, 'settings'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          await addDoc(collection(db, 'settings'), {
            userId: user.uid,
            openAIKey,
            anthropicKey,
            analizaKey,
            nexusAIKey,
            updatedAt: new Date().toISOString()
          });
        } else {
          const docId = querySnapshot.docs[0].id;
          await updateDoc(doc(db, 'settings', docId), {
            openAIKey,
            anthropicKey,
            analizaKey,
            nexusAIKey,
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      alert('Sincronización con el ecosistema Nexus completada con éxito.');
    } catch (error) {
      console.error('Error syncing Nexus AI:', error);
      alert('Error en la sincronización. Verifica tu llave de acceso.');
    } finally {
      setSyncing(false);
    }
  };

  const generateApiKey = async () => {
    if (!user || !newKeyName.trim()) return;
    const rawKey = 'nx_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    try {
      await addDoc(collection(db, 'apiKeys'), {
        id: rawKey,
        userId: user.uid,
        keyHash: rawKey,
        name: newKeyName,
        createdAt: new Date().toISOString()
      });
      setShowNewKey(rawKey);
      setNewKeyName('');
      fetchApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!window.confirm('¿Eliminar esta llave de acceso?')) return;
    try {
      await deleteDoc(doc(db, 'apiKeys', id));
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromptChange = (key: keyof typeof prompts, value: string) => {
    setPrompts(prev => ({ ...prev, [key]: value }));
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
            <SettingsIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Nexus Settings</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Configuración Maestra del Sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <ShieldCheck className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Nexus Verified</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Integrations & Keys */}
            <div className="space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Proveedores Externos</h2>
                </div>
                
                <div className="bg-[#050505] border border-orange-500/10 rounded-sm p-8 space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">OpenAI API Key (GPT-4o)</label>
                    <input
                      type="password"
                      value={openAIKey}
                      onChange={(e) => setOpenAIKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-black border border-zinc-800 rounded-sm px-4 py-3 text-xs text-white outline-none focus:border-orange-500/50 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Anthropic API Key (Claude 3.5)</label>
                    <input
                      type="password"
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full bg-black border border-zinc-800 rounded-sm px-4 py-3 text-xs text-white outline-none focus:border-orange-500/50 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Analiza API Key (X-API-KEY)</label>
                    <input
                      type="password"
                      value={analizaKey}
                      onChange={(e) => setAnalizaKey(e.target.value)}
                      placeholder="analiza_..."
                      className="w-full bg-black border border-zinc-800 rounded-sm px-4 py-3 text-xs text-white outline-none focus:border-orange-500/50 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                      <BrainCircuit className="w-3 h-3" /> Nexus AI Ecosystem Key
                    </label>
                    <input
                      type="password"
                      value={nexusAIKey}
                      onChange={(e) => setNexusAIKey(e.target.value)}
                      placeholder="nx_..."
                      className="w-full bg-black border border-orange-500/30 rounded-sm px-4 py-3 text-xs text-orange-400 outline-none focus:border-orange-500 transition-all font-mono"
                    />
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Esta llave permite la inyección automática en otros sistemas del ecosistema Nexus.</p>
                  </div>
                  <button 
                    onClick={syncNexusAI}
                    disabled={syncing || !nexusAIKey}
                    className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                  >
                    {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {syncing ? 'Sincronizando...' : 'Sincronizar Ecosistema Nexus'}
                  </button>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-orange-500" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Nexus API Keys</h2>
                </div>
                
                <div className="bg-[#050505] border border-orange-500/10 rounded-sm p-8">
                  <div className="flex gap-4 mb-8">
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Nombre de la llave..."
                      className="flex-1 bg-black border border-zinc-800 rounded-sm px-4 py-3 text-xs text-white outline-none focus:border-orange-500/50 transition-all"
                    />
                    <button
                      onClick={generateApiKey}
                      disabled={!newKeyName.trim()}
                      className="px-6 py-3 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Generar
                    </button>
                  </div>

                  {showNewKey && (
                    <div className="mb-8 p-6 bg-orange-500/5 border border-orange-500/20 rounded-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-start gap-4">
                        <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1 italic">Copia tu llave de acceso</h4>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Por seguridad, no volverá a mostrarse en el sistema.</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black border border-orange-500/20 rounded-sm px-4 py-3 text-xs text-orange-400 font-mono">
                              {showNewKey}
                            </code>
                            <button
                              onClick={() => copyToClipboard(showNewKey)}
                              className="p-3 bg-black border border-orange-500/20 hover:bg-orange-500/10 rounded-sm transition-all"
                            >
                              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-orange-500" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-800" />
                      </div>
                    ) : apiKeys.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-zinc-900 rounded-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700 italic">No hay llaves de acceso activas</p>
                      </div>
                    ) : (
                      apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-4 bg-black border border-zinc-900 rounded-sm hover:border-orange-500/20 transition-all group">
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{key.name}</h4>
                            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{new Date(key.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <code className="text-[10px] text-zinc-800 font-mono">nx_••••••••••••</code>
                            <button
                              onClick={() => deleteApiKey(key.id)}
                              className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Master Prompts */}
            <div className="space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">Master Prompts (Núcleo)</h2>
                </div>

                <div className="bg-[#050505] border border-orange-500/10 rounded-sm p-8 space-y-8">
                  {Object.entries(prompts).map(([key, value]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{key} Agent Core</label>
                        <div className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
                          <span className="text-[8px] font-black uppercase text-orange-500 tracking-widest italic">Optimizado</span>
                        </div>
                      </div>
                      <textarea
                        value={value}
                        onChange={(e) => handlePromptChange(key as keyof typeof prompts, e.target.value)}
                        rows={4}
                        className="w-full bg-black border border-zinc-800 rounded-sm p-4 text-xs text-zinc-400 outline-none focus:border-orange-500/50 transition-all resize-none font-mono custom-scrollbar"
                      />
                    </div>
                  ))}

                  <button className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(234,88,12,0.1)]">
                    Actualizar Núcleo de Agentes
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
