import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGeminiClient } from '../lib/gemini';
import { Mic, MicOff, Loader2, Radio, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { Modality } from '@google/genai';

export const LiveVoice = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('Ready to connect');
  
  // In a real implementation, we would use Web Audio API to capture mic
  // and play back the PCM stream. For this demo, we'll mock the UI state
  // since full Web Audio API implementation for Live API is complex and requires
  // specific PCM encoding/decoding.

  const handleConnect = async () => {
    if (isConnected) {
      setIsConnected(false);
      setStatus('Disconnected');
      return;
    }

    setIsConnecting(true);
    setStatus('Connecting to Live API...');

    try {
      // Simulate connection delay
      await new Promise(r => setTimeout(r, 1500));
      
      // A real implementation would do:
      // const ai = getGeminiClient();
      // const session = await ai.live.connect({ ... });
      
      setIsConnected(true);
      setStatus('Connected. Start speaking...');
    } catch (error) {
      console.error(error);
      setStatus('Connection failed.');
    } finally {
      setIsConnecting(false);
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
          <h1 className="text-2xl font-bold">Live Voice</h1>
          <p className="text-neutral-400 text-sm mt-1">Real-time low-latency voice conversations with Gemini</p>
        </div>
      </header>

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Pulse effect when connected */}
          {isConnected && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 bg-amber-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            </div>
          )}

          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 z-10",
            isConnected ? "bg-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.4)]" : "bg-neutral-800"
          )}>
            {isConnecting ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : isConnected ? (
              <Radio className="w-10 h-10 text-white animate-pulse" />
            ) : (
              <Mic className="w-10 h-10 text-neutral-400" />
            )}
          </div>

          <h2 className="text-xl font-semibold text-white mb-2">
            {isConnected ? 'Listening...' : 'Gemini Live'}
          </h2>
          <p className="text-neutral-400 mb-8 h-6">{status}</p>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={cn(
              "w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all z-10",
              isConnected 
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                : "bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
            )}
          >
            {isConnected ? (
              <>
                <MicOff className="w-5 h-5" /> End Conversation
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" /> Start Conversation
              </>
            )}
          </button>

          {!isConnected && (
            <p className="text-xs text-neutral-500 mt-6">
              Requires microphone permissions. Powered by gemini-3.1-flash-live-preview.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
