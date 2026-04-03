import React from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { MessageSquare } from 'lucide-react';

export const Chat = () => {
  return (
    <div className="h-full flex flex-col bg-[#030303] p-6">
      <header className="mb-6 flex items-center gap-4">
        <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <MessageSquare className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">Nexus Chat</h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Núcleo de Inteligencia Multimodal</p>
        </div>
      </header>
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  );
};
