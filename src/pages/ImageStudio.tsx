import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGeminiClient } from '../lib/gemini';
import { Image as ImageIcon, Loader2, Download, Wand2, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export const ImageStudio = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('1K');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResultImage(null);

    try {
      const ai = getGeminiClient();
      
      // If 2K or 4K, we must use pro-image-preview. Otherwise flash-image-preview.
      const modelName = (quality === '2K' || quality === '4K') 
        ? 'gemini-3-pro-image-preview' 
        : 'gemini-3.1-flash-image-preview';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: quality
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setResultImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold">Image Studio</h1>
          <p className="text-neutral-400 text-sm mt-1">Generate stunning images with Gemini 3.1 Flash & Pro</p>
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
              placeholder="A futuristic city at sunset, cyberpunk style..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-32 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'].map(ar => (
                <button
                  key={ar}
                  onClick={() => setAspectRatio(ar)}
                  className={cn(
                    "py-2 text-xs font-medium rounded-lg border transition-colors",
                    aspectRatio === ar 
                      ? "bg-purple-600/20 border-purple-500 text-purple-300" 
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  )}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Quality</label>
            <div className="grid grid-cols-3 gap-2">
              {['1K', '2K', '4K'].map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={cn(
                    "py-2 text-xs font-medium rounded-lg border transition-colors",
                    quality === q 
                      ? "bg-purple-600/20 border-purple-500 text-purple-300" 
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-2">2K and 4K use the Pro model.</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {/* Result Area */}
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden relative min-h-[400px]">
          {resultImage ? (
            <>
              <img src={resultImage} alt="Generated" className="w-full h-full object-contain" />
              <a 
                href={resultImage} 
                download="nexus-ai-image.png"
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </a>
            </>
          ) : (
            <div className="text-center text-neutral-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Your generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
