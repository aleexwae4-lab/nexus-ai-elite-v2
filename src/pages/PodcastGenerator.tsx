import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Loader2, Play, Save, Sparkles, FileText, Headphones, Download, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { FileUploader } from '../components/FileUploader';

export const PodcastGenerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const [podcastType, setPodcastType] = useState<'conversation' | 'solo' | 'interview'>('conversation');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Genera un podcast de tipo ${podcastType} basado en el siguiente tema o idea: ${topic}. 
          Si hay archivos adjuntos, úsalos como referencia principal para el contenido. 
          El resultado debe ser un audio de alta calidad con voces naturales y música de fondo sutil.`,
          type: 'podcast',
          files: files.map(f => ({ data: f.data, mimeType: f.mimeType }))
        })
      });

      const data = await response.json();
      if (data.result) {
        setAudioUrl(data.result);
      } else {
        alert("Error al generar el audio.");
      }
    } catch (error) {
      console.error("Error generating podcast:", error);
      alert("Hubo un error en la generación.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToGallery = async () => {
    if (!user || !audioUrl) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'gallery'), {
        type: 'podcast',
        title: topic.substring(0, 50) + '...',
        content: audioUrl,
        createdAt: serverTimestamp()
      });
      alert('Podcast guardado en tu galería.');
    } catch (error) {
      console.error("Error saving podcast:", error);
      alert("Error al guardar el podcast.");
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
            <Headphones className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Podcast Studio Pro</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Producción de Audio de Alta Fidelidad</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-80 border-r border-orange-500/10 bg-[#050505] p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Formato del Podcast</h2>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'conversation', name: 'Conversación (2 Voces)', desc: 'Host y Invitado' },
                { id: 'solo', name: 'Monólogo (1 Voz)', desc: 'Narración Directa' },
                { id: 'interview', name: 'Entrevista Profunda', desc: 'Preguntas y Respuestas' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setPodcastType(type.id as any)}
                  className={cn(
                    "p-4 text-left rounded-sm border transition-all",
                    podcastType === type.id 
                      ? "bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  )}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">{type.name}</div>
                  <div className="text-[8px] font-bold opacity-60 uppercase tracking-tighter">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-orange-500/10">
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 text-orange-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Idea o Guión</h2>
            </div>
            
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe tu idea, pega un texto largo o simplemente el tema del podcast..."
              className="w-full h-40 bg-black border border-zinc-800 rounded-sm p-4 text-xs text-zinc-300 outline-none focus:border-orange-500/50 resize-none"
            />

            <FileUploader files={files} setFiles={setFiles} label="Documentos de Referencia (PDF, TXT, IMG)" />

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {isGenerating ? 'Sintetizando Audio...' : 'Generar Podcast Maestro'}
            </button>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="flex-1 bg-[#020202] relative flex items-center justify-center p-12 overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          {audioUrl ? (
            <div className="w-full max-w-xl p-8 bg-[#050505] rounded-sm border border-orange-500/20 shadow-2xl relative z-10 text-center">
              <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-orange-500/20 animate-pulse">
                <Play className="w-10 h-10 text-orange-500 ml-2" />
              </div>
              
              <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">Podcast Finalizado</h3>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-8">
                Masterización Neuronal Completada
              </p>
              
              <div className="bg-black/50 p-6 rounded-sm border border-zinc-800 mb-8">
                <audio src={audioUrl} controls className="w-full custom-audio-player" />
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={saveToGallery}
                  disabled={isSaving}
                  className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-orange-500/50 transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Guardar en Galería
                </button>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = audioUrl;
                    link.download = `nexus-podcast-${Date.now()}.wav`;
                    link.click();
                  }}
                  className="px-6 py-3 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-orange-500 transition-all flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Descargar Master
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center relative z-10">
              <div className="w-24 h-24 bg-orange-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/10">
                <Mic className="w-10 h-10 text-orange-500/20" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-2">Estudio de Podcast Nexus</h3>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Describe tu visión y deja que la IA cree el contenido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
