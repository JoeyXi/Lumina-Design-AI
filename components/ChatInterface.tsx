import React, { useState, useRef, useEffect } from 'react';
import { Send, Wand2, Bot, User, ShoppingBag } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isVisualUpdate: boolean) => void;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'chat' | 'edit'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input, mode === 'edit');
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Bot size={18} className="text-indigo-600" />
          Design Assistant
        </h3>
        <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-medium">
          <button 
            onClick={() => setMode('chat')}
            className={`px-3 py-1.5 rounded-md transition-all ${mode === 'chat' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setMode('edit')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${mode === 'edit' ? 'bg-indigo-600 shadow text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Wand2 size={12} />
            Refine
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10 text-sm px-6">
            <p>Ask for advice or switch to <strong>Refine</strong> mode to edit the image directly.</p>
            <p className="mt-2 text-xs opacity-70">e.g., "Make the sofa green" or "Where can I buy this rug?"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'}
            `}>
               {msg.isVisualUpdate && msg.role === 'user' && (
                  <div className="flex items-center gap-1 text-xs opacity-75 mb-1 border-b border-white/20 pb-1">
                    <Wand2 size={10} /> Visual Edit Request
                  </div>
               )}
               <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100">
                   <div className="flex space-x-1">
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                   </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'edit' ? "Describe changes (e.g. 'Add a blue rug')..." : "Ask about design, products..."}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
            />
            <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all 
                  ${input.trim() && !isLoading 
                    ? mode === 'edit' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-800 text-white hover:bg-slate-900' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                `}
            >
                {mode === 'edit' ? <Wand2 size={18} /> : <Send size={18} />}
            </button>
        </form>
      </div>
    </div>
  );
};
