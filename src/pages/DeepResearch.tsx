import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Globe, FileText, Sparkles, ShieldCheck, ExternalLink, ChevronLeft, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FileUploader } from '../components/FileUploader';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const DeepResearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResult('');
    setSources([]);

    try {
      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          type: 'research',
          files: files.map(f => ({ data: f.data, mimeType: f.mimeType }))
        })
      });

      const data = await response.json();
      if (data.result) {
        setResult(data.result);
        if (data.sources) {
          setSources(data.sources);
        }
      }
    } catch (error) {
      console.error("Error in deep research:", error);
      setResult("Hubo un error al realizar la investigación.");
    } finally {
      setIsSearching(false);
    }
  };

  const saveToGallery = async () => {
    if (!user || !result) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'gallery'), {
        type: 'document',
        title: query.substring(0, 50) + '...',
        content: result,
        createdAt: serverTimestamp()
      });
      alert('Investigación guardada en tu galería.');
    } catch (error) {
      console.error("Error saving research:", error);
      alert("Error al guardar la investigación.");
    } finally {
      setIsSaving(false);
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
            <Globe className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Deep Research Elite</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Investigación Multimodal de Alta Precisión</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
          <ShieldCheck className="w-3 h-3 text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Nexus Verified</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Input & Files */}
        <div className="w-96 border-r border-orange-500/10 bg-[#050505] p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-3 h-3 text-orange-500" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Objetivo de Investigación</h2>
              </div>
              
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué deseas investigar a fondo hoy? (Ej: Análisis de mercado de IA en 2026)"
                className="w-full h-32 bg-black border border-zinc-800 rounded-sm p-4 text-xs text-zinc-300 outline-none focus:border-orange-500/50 resize-none"
              />

              <FileUploader files={files} setFiles={setFiles} label="Documentos de Referencia" />

              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isSearching ? 'Investigando...' : 'Iniciar Investigación'}
              </button>
            </div>
          </form>

          <div className="pt-8 border-t border-orange-500/10 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Capacidades del Motor</h3>
            <ul className="space-y-3">
              {[
                'Búsqueda en Tiempo Real',
                'Análisis Multimodal de Archivos',
                'Verificación de Fuentes',
                'Generación de Reportes Ejecutivos'
              ].map((cap, i) => (
                <li key={i} className="flex items-center gap-2 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  <div className="w-1 h-1 bg-orange-500 rounded-full" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex-1 bg-[#020202] relative flex flex-col overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="flex-1 p-12 overflow-y-auto relative z-10 custom-scrollbar">
            {isSearching ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-orange-500/10 rounded-full animate-ping absolute inset-0" />
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center relative border border-orange-500/40">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Investigación en Curso</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Navegando la web y analizando referencias...</p>
                </div>
              </div>
            ) : result ? (
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="bg-[#050505] border border-orange-500/10 rounded-sm p-8 shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-4 flex gap-2">
                    <button 
                      onClick={saveToGallery}
                      disabled={isSaving}
                      className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[8px] font-black text-orange-500 uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all flex items-center gap-1"
                    >
                      {isSaving ? <Loader2 className="w-2 h-2 animate-spin" /> : <Save className="w-2 h-2" />}
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <div className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[8px] font-black text-orange-500 uppercase tracking-widest">
                      Reporte Final
                    </div>
                  </div>
                  
                  <div className="prose prose-invert prose-orange max-w-none prose-headings:italic prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-zinc-400 prose-p:leading-relaxed">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>

                {sources.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-[1px] flex-1 bg-orange-500/10" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fuentes Verificadas</h3>
                      <div className="h-[1px] flex-1 bg-orange-500/10" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sources.map((source, idx) => {
                        if (source.web?.uri) {
                          return (
                            <a 
                              key={idx} 
                              href={source.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group p-4 bg-[#050505] border border-zinc-800 rounded-sm hover:border-orange-500/50 transition-all flex items-center justify-between"
                            >
                              <div className="flex flex-col gap-1 overflow-hidden">
                                <span className="text-[10px] font-black text-white uppercase tracking-tight truncate">
                                  {source.web.title || 'Fuente Externa'}
                                </span>
                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest truncate">
                                  {new URL(source.web.uri).hostname}
                                </span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-zinc-700 group-hover:text-orange-500 transition-colors shrink-0" />
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Globe className="w-24 h-24 text-orange-500 mb-6" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Nexus Deep Research</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Inicia una investigación para ver los resultados aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
