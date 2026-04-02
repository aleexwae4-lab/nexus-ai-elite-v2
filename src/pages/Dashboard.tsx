import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MessageSquare, Image as ImageIcon, Video, Music, Mic, BrainCircuit, FileText, Search, Podcast, Mail, Wand2, ShieldCheck, Sparkles, Zap, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

export const Dashboard = () => {
  const { user } = useAuth();

  const tools = [
    { title: 'Nexus Chat', desc: 'Razonamiento avanzado, búsqueda web y análisis multimodal.', icon: MessageSquare, to: '/app/chat', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Nexus Forge', desc: 'Crea y despliega agentes autónomos con instrucciones maestras.', icon: BrainCircuit, to: '/app/agents', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Image Editor Pro', desc: 'Edición visual avanzada, inpainting y retoque con IA.', icon: Wand2, to: '/app/image-editor', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Email Studio', desc: 'Genera y envía campañas de correo persuasivas de alta conversión.', icon: Mail, to: '/app/email', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Doc Generator', desc: 'Crea documentos profesionales con plantillas de élite.', icon: FileText, to: '/app/documents', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Deep Research', desc: 'Motor de investigación profunda con fuentes verificadas.', icon: Search, to: '/app/research', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { title: 'Podcast Studio', desc: 'Convierte cualquier tema en diálogos de audio profesionales.', icon: Podcast, to: '/app/podcast', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { title: 'Video Analysis', desc: 'Extrae inteligencia y resúmenes de cualquier video.', icon: Video, to: '/app/video-analysis', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Image Studio', desc: 'Genera imágenes 4K y controla relaciones de aspecto.', icon: ImageIcon, to: '/app/image', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'Video Studio', desc: 'Text-to-Video e Image-to-Video con Veo 3.', icon: Video, to: '/app/video', color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Audio & Music', desc: 'Text-to-Speech y generación de música con Lyria.', icon: Music, to: '/app/audio', color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { title: 'Live Voice', desc: 'Conversaciones de voz en tiempo real con baja latencia.', icon: Mic, to: '/app/live', color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#030303] overflow-hidden">
      <header className="p-6 border-b border-orange-500/10 bg-[#050505] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <LayoutGrid className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Nexus Dashboard</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Centro de Comando de Operaciones</p>
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
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-12">
            <h2 className="text-3xl font-black italic uppercase tracking-tight text-white mb-2">
              Bienvenido, <span className="text-orange-500">{user?.displayName?.split(' ')[0] || 'Arquitecto'}</span>
            </h2>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-orange-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Protocolo de ejecución listo. Selecciona un módulo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <Link 
                key={tool.to} 
                to={tool.to}
                className="group relative p-8 bg-[#050505] border border-orange-500/10 rounded-sm hover:border-orange-500/40 transition-all duration-500 overflow-hidden shadow-2xl"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-sm flex items-center justify-center mb-6 border transition-all duration-500 group-hover:scale-110",
                    tool.bg,
                    tool.color.replace('text-', 'border-').replace('500', '500/20'),
                    tool.color
                  )}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-black italic uppercase tracking-widest text-white group-hover:text-orange-500 transition-colors">{tool.title}</h3>
                    <Sparkles className="w-3 h-3 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                    {tool.desc}
                  </p>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-800 group-hover:text-orange-500/50 transition-colors">Ejecutar Módulo</span>
                    <div className="w-8 h-px bg-zinc-800 group-hover:w-12 group-hover:bg-orange-500/50 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
