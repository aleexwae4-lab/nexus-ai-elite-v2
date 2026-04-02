import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wand2, 
  Upload, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon,
  Layers,
  Scissors,
  Palette,
  Maximize2,
  Eraser,
  Zap,
  Brush,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { FileUploader } from '../components/FileUploader';

const AI_PRESETS = [
  { id: 'remove-bg', name: 'Eliminar Fondo', icon: Scissors, prompt: 'Elimina el fondo de esta imagen y deja al sujeto principal sobre un fondo transparente o blanco puro.' },
  { id: 'enhance', name: 'Mejorar Calidad', icon: Zap, prompt: 'Mejora la calidad, nitidez y detalles de esta imagen. Haz que se vea profesional y de alta resolución.' },
  { id: 'artistic', name: 'Estilo Artístico', icon: Palette, prompt: 'Convierte esta imagen en una obra de arte digital con un estilo cinematográfico y vibrante.' },
  { id: 'expand', name: 'Expandir Imagen', icon: Maximize2, prompt: 'Expande los bordes de esta imagen imaginando lo que hay alrededor, manteniendo el estilo y la iluminación.' },
  { id: 'retouch', name: 'Retoque Facial', icon: Brush, prompt: 'Realiza un retoque profesional sutil, suavizando la piel y resaltando los rasgos faciales sin perder naturalidad.' },
  { id: 'color-grade', name: 'Color Hollywood', icon: Palette, prompt: 'Aplica un etalonaje de color profesional estilo Hollywood, con tonos fríos en las sombras y cálidos en las luces.' },
  { id: 'lighting', name: 'Luz de Estudio', icon: Sparkles, prompt: 'Mejora la iluminación de la imagen, simulando una luz de estudio profesional de tres puntos.' },
  { id: 'object-removal', name: 'Limpiar Fondo', icon: Eraser, prompt: 'Elimina objetos distractores del fondo y rellena el espacio de forma coherente con el entorno.' },
  { id: 'style-transfer', name: 'Óleo Clásico', icon: Palette, prompt: 'Aplica un estilo de pintura al óleo clásica a la imagen, manteniendo las formas originales.' },
];

export const ImageEditor = () => {
  const { credits } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  
  // Basic filters state
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImage(result);
        setOriginalImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIEdit = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!image || !finalPrompt.trim()) return;
    
    setIsProcessing(true);
    try {
      const [header, data] = image.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';

      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          type: 'image-edit',
          imageData: { data, mimeType },
          model: 'gemini-2.5-flash-image',
          files: files.map(f => ({ data: f.data, mimeType: f.mimeType }))
        })
      });

      const result = await response.json();
      if (result.result) {
        setImage(result.result);
      } else {
        alert(result.error || "Error al procesar la imagen");
      }
    } catch (error) {
      console.error("AI Edit Error:", error);
      alert("Error en la conexión con el servidor");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturate: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0,
    });
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = 'nexus-edited-image.png';
    link.click();
  };

  const filterStyle = {
    filter: `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturate}%) 
      blur(${filters.blur}px) 
      sepia(${filters.sepia}%) 
      grayscale(${filters.grayscale}%)
    `
  };

  return (
    <div className="h-full flex flex-col bg-[#030303]">
      {/* Header */}
      <div className="flex-none p-6 border-b border-orange-500/10 bg-[#050505] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors text-zinc-500 hover:text-orange-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Wand2 className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight">Image Editor Pro</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Edición Neuronal de Alta Gama</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
          >
            <Upload className="w-3 h-3" />
            Subir Imagen
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
          
          {image && (
            <button 
              onClick={downloadImage}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-[0_0_15px_rgba(234,88,12,0.3)]"
            >
              <Download className="w-3 h-3" />
              Exportar
            </button>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Filters & AI */}
        <div className="w-80 border-r border-orange-500/10 bg-[#050505] p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Ajustes Básicos</h2>
              <button onClick={resetFilters} className="text-[10px] text-orange-500 hover:text-orange-400">Reiniciar</button>
            </div>

            {Object.entries(filters).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>{key}</span>
                  <span className="text-orange-500">{value}{key === 'blur' ? 'px' : '%'}</span>
                </div>
                <input 
                  type="range" 
                  min={key === 'blur' ? 0 : 0} 
                  max={key === 'blur' ? 20 : 200}
                  value={value}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-orange-500/10 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Funciones IA Pro</h2>
            <div className="grid grid-cols-2 gap-2">
              {AI_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleAIEdit(preset.prompt)}
                  disabled={isProcessing || !image}
                  className="flex flex-col items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-sm hover:border-orange-500/50 transition-all group disabled:opacity-50"
                >
                  <preset.icon className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-tighter text-center">{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-orange-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prompt Personalizado</h3>
              </div>
              <textarea 
                placeholder="Describe el cambio (ej: 'agrega una puesta de sol', 'cambia el color de la camisa a azul')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 bg-black border border-zinc-800 rounded-sm p-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-orange-500/50 outline-none resize-none"
              />
              
              <FileUploader files={files} setFiles={setFiles} label="Imágenes de Referencia" />

              <button 
                onClick={() => handleAIEdit()}
                disabled={isProcessing || !image || !prompt.trim()}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
              >
                {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Ejecutar Edición IA
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#020202] relative flex items-center justify-center p-12 overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          {image ? (
            <div className="relative group max-w-full max-h-full">
              <div className="absolute -inset-4 bg-orange-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img 
                src={image} 
                alt="Editor" 
                style={filterStyle}
                className="relative z-10 max-w-full max-h-[70vh] rounded-sm border border-orange-500/20 shadow-2xl transition-all duration-300"
              />
              
              {/* Overlay Tools */}
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setImage(originalImage)} className="p-2 bg-black/80 border border-white/10 rounded-sm text-white hover:bg-orange-600 transition-colors" title="Restaurar Original">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button className="p-2 bg-black/80 border border-white/10 rounded-sm text-white hover:bg-orange-600 transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md aspect-video border-2 border-dashed border-orange-500/20 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-widest text-white mb-1">Suelta tu imagen aquí</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">o haz clic para explorar archivos</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
