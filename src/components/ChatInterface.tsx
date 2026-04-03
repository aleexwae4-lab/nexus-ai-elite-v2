import React, { useState } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { sendMessage } from '../services/chatService';

export const ChatInterface = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', text: response || 'No response' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error: No se pudo procesar la solicitud.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && <Bot className="w-8 h-8 text-orange-500 shrink-0" />}
            <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
              {msg.text}
            </div>
            {msg.role === 'user' && <User className="w-8 h-8 text-neutral-500 shrink-0" />}
          </div>
        ))}
        {isLoading && <Loader2 className="w-8 h-8 animate-spin text-orange-500" />}
      </div>
      <div className="p-4 border-t border-neutral-800 flex gap-2">
        <input
          className="flex-1 bg-neutral-800 text-white p-3 rounded-xl"
          placeholder="Comandos rápidos: 'hazme 5 reels virales'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="bg-orange-600 text-white p-3 rounded-xl">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
