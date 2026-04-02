import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGeminiClient } from '../lib/gemini';
import { Video, Loader2, Download, Wand2, ChevronLeft, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const VideoStudio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [rawVideoUri, setRawVideoUri] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setVideoUrl(null);
    setRawVideoUri(null);
    setStatus('Initializing generation...');

    try {
      const ai = getGeminiClient();
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          aspectRatio: aspectRatio
        }
      });

      setStatus('Generating video (this may take a few minutes)...');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        setRawVideoUri(downloadLink);
        // We need to fetch it with the API key header
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY as string,
          },
        });
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setStatus('');
      } else {
        setStatus('Failed to get video URL.');
      }
    } catch (error) {
      console.error(error);
      setStatus('An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const saveToGallery = async () => {
    if (!user || !videoUrl) return;
    setIsSaving(true);
    try {
      // We save the raw URI if available, or a placeholder
      // Note: raw URI might expire, but it's better than nothing without Storage
      await addDoc(collection(db, 'users', user.uid, 'gallery'), {
        type: 'video',
        title: prompt.substring(0, 50) + '...',
        content: videoUrl, // This is a blob URL, won't work after refresh
        rawUri: rawVideoUri,
        createdAt: serverTimestamp()
      });
      alert('Video guardado en tu galería (Nota: Los videos generados son temporales).');
    } catch (error) {
      console.error("Error saving video:", error);
      alert("Error al guardar el video.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 overflow-y-auto">
      <header className="p-6 border-b border-neutral-800 flex items-center gap-4">
        <button 
          onClick={() => navigate('/app')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neutral-500 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Video Studio</h1>
          <p className="text-neutral-400 text-sm mt-1">Generate cinematic videos with Veo 3.1</p>
        </div>
      </header>

      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic drone shot of a neon city..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 h-32 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              {['16:9', '9:16'].map(ar => (
                <button
                  key={ar}
                  onClick={() => setAspectRatio(ar as any)}
                  className={cn(
                    "py-2 text-xs font-medium rounded-lg border transition-colors",
                    aspectRatio === ar 
                      ? "bg-rose-600/20 border-rose-500 text-rose-300" 
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  )}
                >
                  {ar === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {loading ? 'Generating...' : 'Generate Video'}
          </button>
          
          {status && (
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300 text-center">
              {status}
            </div>
          )}
        </div>

        {/* Result Area */}
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden relative min-h-[400px]">
          {videoUrl ? (
            <div className="relative w-full h-full">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={saveToGallery}
                  disabled={isSaving}
                  className="p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-lg transition-colors"
                  title="Guardar en Galería"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                </button>
                <a 
                  href={videoUrl} 
                  download="nexus-ai-video.mp4"
                  className="p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-lg transition-colors"
                  title="Descargar"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-neutral-500">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Your generated video will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
