import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, Loader2, Sparkles, CheckCircle2, FileText, Layout, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FileUploader } from '../components/FileUploader';
import { cn } from '../lib/utils';

export const EmailStudio = () => {
  const navigate = useNavigate();
  const { credits } = useAuth();
  const [to, setTo] = useState('');
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    if (credits < 1) {
      alert("No tienes suficientes créditos para generar un correo.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Escribe un correo electrónico profesional basado en el siguiente contexto: "${prompt}". 
          Si hay archivos adjuntos, úsalos como referencia para el contenido.
          La primera línea DEBE ser el asunto del correo con el formato "ASUNTO: [Tu Asunto]". 
          El resto debe ser el cuerpo del correo. No incluyas explicaciones adicionales.`,
          model: 'gemini-3.1-pro-preview',
          files: files.map(f => ({ data: f.data, mimeType: f.mimeType }))
        })
      });

      const data = await response.json();
      if (data.result) {
        const resultText = data.result as string;
        const lines = resultText.split('\n');
        
        let extractedSubject = '';
        let extractedBody = '';

        if (lines[0].toUpperCase().startsWith('ASUNTO:')) {
          extractedSubject = lines[0].substring(7).trim();
          extractedBody = lines.slice(1).join('\n').trim();
        } else {
          extractedSubject = 'Correo Generado por IA';
          extractedBody = resultText.trim();
        }

        setSubject(extractedSubject);
        setBody(extractedBody);
      }
    } catch (error) {
      console.error("Error generating email:", error);
      alert("Hubo un error al generar el correo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      alert("Por favor completa el destinatario, asunto y cuerpo del correo.");
      return;
    }

    setIsSending(true);
    setSendSuccess(false);
    setPreviewUrl(null);

    try {
      const response = await fetch('/api/v1/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body })
      });

      const data = await response.json();
      
      if (data.success) {
        setSendSuccess(true);
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }
        setTimeout(() => {
          setSendSuccess(false);
          setTo('');
          setSubject('');
          setBody('');
          setPrompt('');
          setFiles([]);
        }, 5000);
      } else {
        alert(data.error || "Error al enviar el correo.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Hubo un error al enviar el correo.");
    } finally {
      setIsSending(false);
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
            <Mail className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Email Studio Elite</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Campañas de Correo de Alta Conversión</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
          <ShieldCheck className="w-3 h-3 text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Nexus Verified</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Configuration */}
        <div className="w-96 border-r border-orange-500/10 bg-[#050505] p-6 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Contexto de Campaña</h2>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe el propósito del correo, el tono y los puntos clave..."
                className="w-full h-48 bg-black border border-zinc-800 rounded-sm p-4 text-xs text-zinc-300 outline-none focus:border-orange-500/50 resize-none"
              />
              
              <FileUploader files={files} setFiles={setFiles} label="Documentos de Referencia" />

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.2)]"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Redactando...' : 'Generar Borrador Maestro'}
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-orange-500/10 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Estadísticas de Envío</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <div className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Tasa de Apertura</div>
                <div className="text-lg font-black text-white italic">98.2%</div>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm">
                <div className="text-[8px] font-bold text-zinc-500 uppercase mb-1">Entregabilidad</div>
                <div className="text-lg font-black text-white italic">100%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Editor & Send */}
        <div className="flex-1 bg-[#020202] relative flex flex-col overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="flex-1 p-12 overflow-y-auto relative z-10 custom-scrollbar">
            <div className="max-w-3xl mx-auto bg-[#050505] border border-orange-500/10 rounded-sm shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-orange-500/10 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Nexus Mail Composer</span>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-[80px_1fr] items-center gap-4 border-b border-zinc-800 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Para:</span>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="destinatario@empresa.com"
                    className="bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
                  />
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center gap-4 border-b border-zinc-800 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asunto:</span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Asunto del correo..."
                    className="bg-transparent text-sm text-white outline-none placeholder:text-zinc-700 font-bold"
                  />
                </div>
                <div className="pt-4">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="El cuerpo del correo aparecerá aquí..."
                    className="w-full h-96 bg-transparent text-sm text-zinc-300 outline-none resize-none leading-relaxed placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="p-6 bg-black/40 border-t border-orange-500/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="p-2 text-zinc-500 hover:text-orange-500 transition-colors">
                    <Layout className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-zinc-500 hover:text-orange-500 transition-colors">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleSend}
                  disabled={isSending || !to.trim() || !subject.trim() || !body.trim()}
                  className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSending ? 'Enviando...' : 'Enviar Ahora'}
                </button>
              </div>
            </div>

            {sendSuccess && (
              <div className="max-w-3xl mx-auto mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-sm flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 text-green-400 font-black text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Correo enviado con éxito!</span>
                </div>
                {previewUrl && (
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Modo de prueba activo. <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Ver correo simulado aquí</a>.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
