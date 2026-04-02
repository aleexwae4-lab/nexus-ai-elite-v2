import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Download, Save, Loader2, Layout, Type, FileCode, Briefcase, GraduationCap, ChevronLeft, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FileUploader } from '../components/FileUploader';

const TEMPLATES = [
  { id: 'contract', name: 'Contrato de Servicios', icon: Briefcase, prompt: 'Genera un contrato de prestación de servicios profesionales detallado, incluyendo cláusulas de confidencialidad, términos de pago y duración.' },
  { id: 'proposal', name: 'Propuesta de Negocio', icon: Layout, prompt: 'Crea una propuesta de negocio persuasiva que incluya resumen ejecutivo, objetivos, metodología y presupuesto estimado.' },
  { id: 'report', name: 'Informe Ejecutivo', icon: FileText, prompt: 'Genera un informe ejecutivo formal con introducción, análisis de datos, conclusiones y recomendaciones estratégicas.' },
  { id: 'academic', name: 'Ensayo Académico', icon: GraduationCap, prompt: 'Escribe un ensayo académico estructurado con tesis, argumentos de apoyo, contraargumentos y una conclusión sólida.' },
  { id: 'code', name: 'Documentación Técnica', icon: FileCode, prompt: 'Genera documentación técnica detallada para un proyecto de software, incluyendo arquitectura, guía de instalación y referencia de API.' },
];

export const DocumentGenerator = () => {
  const { user, credits } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    if (credits < 1) {
      alert("No tienes suficientes créditos para generar un documento.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Genera un documento profesional detallado sobre el siguiente tema: ${prompt}. Estructúralo con títulos, subtítulos y viñetas. Devuelve el contenido en formato HTML limpio para un editor de texto.`,
          model: 'gemini-3.1-pro-preview',
          files: files.map(f => ({ data: f.data, mimeType: f.mimeType }))
        })
      });

      const data = await response.json();
      if (data.result) {
        setDocumentContent(data.result);
      }
    } catch (error) {
      console.error("Error generating document:", error);
      alert("Hubo un error al generar el documento.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = documentContent;
    const text = tempDiv.innerText || tempDiv.textContent || "";
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 15, 15);
    doc.save('documento.pdf');
  };

  const downloadWord = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = documentContent;
    const text = tempDiv.innerText || tempDiv.textContent || "";
    
    const paragraphs = text.split('\n').map(t => 
      new Paragraph({
        children: [new TextRun(t)],
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "documento.docx");
  };

  const saveToGallery = async () => {
    if (!user || !documentContent) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'gallery'), {
        type: 'document',
        title: prompt.substring(0, 50) + '...',
        content: documentContent,
        createdAt: serverTimestamp()
      });
      alert('Documento guardado en tu galería.');
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Error al guardar el documento.");
    } finally {
      setIsSaving(false);
    }
  };

  const applyTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
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
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">Nexus Doc Studio</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Generación de Documentos de Élite</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <ShieldCheck className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Nexus Verified</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Plantillas Rápidas</h2>
            <div className="space-y-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template.prompt)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-black border border-neutral-800 hover:border-orange-500/50 transition-all text-left group"
                >
                  <template.icon className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Configuración</h2>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe tu documento..."
                className="w-full h-32 bg-black border border-neutral-800 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              />
              
              <FileUploader files={files} setFiles={setFiles} label="Archivos de Referencia" />

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                {isGenerating ? 'Generando...' : 'Generar con IA'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col min-h-[700px]">
            <div className="flex items-center justify-between px-6 py-4 bg-neutral-900/50 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">Editor de Texto Pro</h2>
              </div>
              {documentContent && (
                <div className="flex items-center gap-2">
                  <button onClick={downloadPDF} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs transition-colors" title="Descargar PDF">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button onClick={downloadWord} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs transition-colors" title="Descargar Word">
                    <Download className="w-3.5 h-3.5" /> Word
                  </button>
                  <button onClick={saveToGallery} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg text-xs transition-colors" title="Guardar en Galería">
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Guardar
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 bg-white text-black">
              <ReactQuill
                theme="snow"
                value={documentContent}
                onChange={setDocumentContent}
                className="h-full min-h-[600px]"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
