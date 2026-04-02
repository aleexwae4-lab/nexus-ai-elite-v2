import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGeminiClient } from '../lib/gemini';
import { Music, Loader2, Wand2, Mic, Settings2, FileText, Music2, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { Modality } from '@google/genai';
import { FileUploader } from '../components/FileUploader';

const GENRES = ['Cinematic', 'Electronic', 'Lo-fi', 'Ambient', 'Orchestral', 'Pop', 'Rock', 'Jazz', 'Techno', 'Cyberpunk'];
const KEYS = ['C Major', 'A Minor', 'G Major', 'E Minor', 'D Major', 'B Minor', 'F Major', 'D Minor'];
const TEMPOS = ['Slow (70 BPM)', 'Moderate (100 BPM)', 'Fast (128 BPM)', 'Very Fast (150 BPM)'];
const VOICES = [
  { id: 'Kore', name: 'Kore (Calm)' },
  { id: 'Puck', name: 'Puck (Energetic)' },
  { id: 'Charon', name: 'Charon (Deep)' },
  { id: 'Fenrir', name: 'Fenrir (Powerful)' },
  { id: 'Zephyr', name: 'Zephyr (Soft)' },
];

export const AudioStudio = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'tts' | 'music'>('tts');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  
  // Advanced Options
  const [genre, setGenre] = useState(GENRES[0]);
  const [key, setKey] = useState(KEYS[0]);
  const [tempo, setTempo] = useState(TEMPOS[1]);
  const [voice, setVoice] = useState(VOICES[0].id);
  const [lyrics, setLyrics] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setAudioUrl(null);

    try {
      const ai = getGeminiClient();
      
      if (mode === 'tts') {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ 
            parts: [
              { text: `Say this text with a ${VOICES.find(v => v.id === voice)?.name} tone: ${prompt}` },
              ...files.map(f => ({ inlineData: { data: f.data, mimeType: f.mimeType } }))
            ] 
          }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice as any },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const binary = atob(base64Audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/pcm;rate=24000' });
          setAudioUrl(URL.createObjectURL(blob));
        }
      } else {
        // Music generation with advanced parameters
        const musicPrompt = `Generate a ${genre} track in the key of ${key} with a ${tempo} tempo. 
        Description: ${prompt}. 
        ${lyrics ? `Include these lyrics or theme: ${lyrics}` : ''}`;

        const response = await ai.models.generateContentStream({
          model: "lyria-3-clip-preview",
          contents: {
            parts: [
              { text: musicPrompt },
              ...files.map(f => ({ inlineData: { data: f.data, mimeType: f.mimeType } }))
            ]
          },
        });

        let audioBase64 = "";
        let mimeType = "audio/wav";

        for await (const chunk of response) {
          const parts = chunk.candidates?.[0]?.content?.parts;
          if (!parts) continue;
          for (const part of parts) {
            if (part.inlineData?.data) {
              if (!audioBase64 && part.inlineData.mimeType) {
                mimeType = part.inlineData.mimeType;
              }
              audioBase64 += part.inlineData.data;
            }
          }
        }

        if (audioBase64) {
          const binary = atob(audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          setAudioUrl(URL.createObjectURL(blob));
        }
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030303] overflow-hidden">
      <header className="p-6 border-b border-orange-500/10 bg-[#050505] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors text-zinc-500 hover:text-orange-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Music2 className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight">Audio Studio Elite</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Generación Sónica de Próxima Generación</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-80 border-r border-orange-500/10 bg-[#050505] p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Modo de Generación</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('tts')}
                className={cn(
                  "py-3 text-[10px] font-black uppercase tracking-widest rounded-sm border transition-all flex flex-col items-center gap-2",
                  mode === 'tts' 
                    ? "bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                <Mic className="w-4 h-4" /> Voz IA
              </button>
              <button
                onClick={() => setMode('music')}
                className={cn(
                  "py-3 text-[10px] font-black uppercase tracking-widest rounded-sm border transition-all flex flex-col items-center gap-2",
                  mode === 'music' 
                    ? "bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                <Music className="w-4 h-4" /> Música Lyria
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Settings2 className="w-3 h-3 text-orange-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Configuración Avanzada</h2>
            </div>

            {mode === 'music' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Género</label>
                  <select 
                    value={genre} 
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-sm p-2 text-xs text-zinc-300 outline-none focus:border-orange-500/50"
                  >
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tonalidad</label>
                  <select 
                    value={key} 
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-sm p-2 text-xs text-zinc-300 outline-none focus:border-orange-500/50"
                  >
                    {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tempo</label>
                  <select 
                    value={tempo} 
                    onChange={(e) => setTempo(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-sm p-2 text-xs text-zinc-300 outline-none focus:border-orange-500/50"
                  >
                    {TEMPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Letra / Tema</label>
                  <textarea 
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Escribe la letra o el tema principal..."
                    className="w-full h-24 bg-black border border-zinc-800 rounded-sm p-3 text-xs text-zinc-300 outline-none focus:border-orange-500/50 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Voz Seleccionada</label>
                  <div className="grid grid-cols-1 gap-2">
                    {VOICES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVoice(v.id)}
                        className={cn(
                          "p-3 text-[10px] font-bold uppercase tracking-widest rounded-sm border text-left transition-all",
                          voice === v.id 
                            ? "bg-orange-500/10 border-orange-500 text-orange-500" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        )}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-orange-500/10">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-orange-500" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Prompt & Referencias</h2>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'tts' ? "Escribe el texto que quieres que la IA diga..." : "Describe el estilo musical, instrumentos, ambiente..."}
                className="w-full bg-black border border-zinc-800 rounded-sm p-3 text-xs text-zinc-300 outline-none focus:border-orange-500/50 h-32 resize-none"
              />
              
              <FileUploader files={files} setFiles={setFiles} label="Archivos de Referencia" />

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {loading ? 'Generando Audio...' : 'Generar Audio Maestro'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="flex-1 bg-[#020202] relative flex items-center justify-center p-12 overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          {audioUrl ? (
            <div className="w-full max-w-xl p-8 bg-[#050505] rounded-sm border border-orange-500/20 shadow-2xl relative z-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20 animate-pulse">
                  <Music className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Audio Generado</h3>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                    {mode === 'tts' ? 'Voz Neuronal Nexus' : `Música Lyria: ${genre} - ${key}`}
                  </p>
                </div>
              </div>
              
              <div className="bg-black/50 p-6 rounded-sm border border-zinc-800">
                <audio src={audioUrl} controls className="w-full custom-audio-player" />
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = audioUrl;
                    link.download = `nexus-audio-${Date.now()}.wav`;
                    link.click();
                  }}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-orange-500/50 transition-all"
                >
                  Descargar Master
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center relative z-10">
              <div className="w-24 h-24 bg-orange-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/10">
                <Music2 className="w-10 h-10 text-orange-500/20" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-2">Estudio de Audio Nexus</h3>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Configura los parámetros y genera tu obra maestra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
