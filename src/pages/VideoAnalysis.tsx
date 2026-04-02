import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Upload, Loader2, Sparkles, ShieldCheck, Play, FileText, Info, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FileUploader } from '../components/FileUploader';
import { cn } from '../lib/utils';

export const VideoAnalysis = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('Analiza este video en detalle. ¿Qué está sucediendo?');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [files, setFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit for base64
        alert("El video es demasiado grande. Por favor sube un video menor a 50MB.");
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setResult('');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setIsAnalyzing(true);
    setResult('');

    try {
      const base64Data = await fileToBase64(videoFile);
      
      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: 'video-analysis',
          videoData: {
            data: base64Data,
            mimeType: videoFile.type || 'video/mp4'
          },
          files: files.map(f => ({ data: f.data, mimeType: f.mimeType }))
        })
      });

      const data = await response.json();
      if (data.result) {
        setResult(data.result);
      } else {
        alert(data.error || "Error al analizar el video.");
      }
    } catch (error) {
      console.error("Error analyzing video:", error);
      alert("Hubo un error en el análisis.");
    } finally {
      setIsAnalyzing(false);
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
            <Video className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Video AI Analysis</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visión Computacional de Élite</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
          <ShieldCheck className="w-3 h-3 text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Nexus Verified</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Input & Video Upload */}
        <div className="w-96 border-r border-orange-500/10 bg-[#050505] p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Play className="w-3 h-3 text-orange-500" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Video Principal</h2>
              </div>
              
              <div 
                className={cn(
                  "relative border border-zinc-800 rounded-sm overflow-hidden bg-black aspect-video flex items-center justify-center cursor-pointer group transition-all",
                  !videoPreview && "border-dashed hover:border-orange-500/50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {videoPreview ? (
                  <video src={videoPreview} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-zinc-700 mx-auto mb-2 group-hover:text-orange-500 transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">Subir Video</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="video/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-orange-500" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Instrucciones de Análisis</h2>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 bg-black border border-zinc-800 rounded-sm p-4 text-xs text-zinc-300 outline-none focus:border-orange-500/50 resize-none"
              />
            </div>

            <FileUploader files={files} setFiles={setFiles} label="Referencias Adicionales" />

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !videoFile}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAnalyzing ? 'Procesando...' : 'Iniciar Análisis'}
            </button>
          </div>

          <div className="pt-8 border-t border-orange-500/10 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3 text-orange-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Guía de Uso</h3>
            </div>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
              Sube videos de hasta 50MB. Puedes adjuntar guiones o descripciones en PDF para un análisis contextual profundo.
            </p>
          </div>
        </div>

        {/* Right: Analysis Results */}
        <div className="flex-1 bg-[#020202] relative flex flex-col overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="flex-1 p-12 overflow-y-auto relative z-10 custom-scrollbar">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-orange-500/10 rounded-full animate-ping absolute inset-0" />
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center relative border border-orange-500/40">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Analizando Fotogramas</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gemini 3.1 Pro está procesando el flujo visual...</p>
                </div>
              </div>
            ) : result ? (
              <div className="max-w-4xl mx-auto">
                <div className="bg-[#050505] border border-orange-500/10 rounded-sm p-8 shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[8px] font-black text-orange-500 uppercase tracking-widest">
                      Reporte de Visión
                    </div>
                  </div>
                  
                  <div className="prose prose-invert prose-orange max-w-none prose-headings:italic prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-zinc-400 prose-p:leading-relaxed">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Video className="w-24 h-24 text-orange-500 mb-6" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Nexus Vision Engine</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">El análisis visual aparecerá aquí después de procesar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
