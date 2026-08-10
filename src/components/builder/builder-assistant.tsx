'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RefreshCw, Check } from 'lucide-react';
import { chatWithBuilder } from '@/app/actions';
import { BuilderProfile, BuilderChatDraft, Message } from '@/types/builder';

interface BuilderAssistantProps {
  chatDraft: BuilderChatDraft;
  onChatDraftChange: (updates: Partial<BuilderChatDraft>) => void;
  onProfileGenerated: (profile: Partial<BuilderProfile>) => void;
}

export const BuilderAssistant: React.FC<BuilderAssistantProps> = ({ 
  chatDraft,
  onChatDraftChange,
  onProfileGenerated 
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { messages, aiState, selectedTitle } = chatDraft;

  const setMessages = (val: typeof messages) => onChatDraftChange({ messages: val });
  const setAiState = (val: typeof aiState) => onChatDraftChange({ aiState: val });

  const setSelectedTitle = (val: typeof selectedTitle) => onChatDraftChange({ selectedTitle: val });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, aiState.pendingTitles]);

  const sendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    // Clear pending titles while we wait for new response
    setAiState({ ...aiState, pendingTitles: null });
    setSelectedTitle(null);

    try {
      const res = await chatWithBuilder(newMessages);
      const { chatResponse, readyForTitles, profile, suggestedTitles } = res.data;

      setMessages([...newMessages, { role: 'assistant', content: chatResponse }]);
      setAiState({
        profile: {
          name: profile.name,
          role: profile.role,
          stack: profile.stack,
        },
        pendingTitles: readyForTitles && suggestedTitles.length > 0 ? suggestedTitles : null,
      });
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: "Something went wrong. Let's try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input.trim());
  };

  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
  };

  const [error, setError] = useState<string | null>(null);

  const handleUseTitleAndBuild = () => {
    if (!selectedTitle) return;
    const { profile } = aiState;

    if (!profile.name?.trim() || !profile.role?.trim() || !profile.stack || profile.stack.length === 0) {
      sendMessage("Build my card");
      return;
    }

    setError(null);
    onProfileGenerated({
      name: profile.name.trim(),
      role: profile.role.trim(),
      stack: profile.stack,
      builderTitle: selectedTitle,
    });
  };

  const handleMoreTitles = () => {
    sendMessage("Suggest 3 different title options please");
  };

  return (
    <div className="w-full flex flex-col bg-transparent border border-hh-yellow/20 shadow-2xl">
      {/* Chat Area */}
      <div className="p-4 md:p-8 flex flex-col gap-8 max-h-[450px] overflow-y-auto bg-black/40">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col w-full max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-1.5 h-1.5 ${msg.role === 'user' ? 'bg-hh-yellow' : 'bg-hh-pink'}`} />
              <div className={`font-mono text-[10px] font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-hh-yellow' : 'text-hh-pink'}`}>
                {msg.role === 'user' ? 'YOU' : 'STUDIO AI'}
              </div>
            </div>
            
            <div className={`px-5 py-4 font-mono text-sm whitespace-pre-wrap leading-relaxed w-full ${
              msg.role === 'user'
                ? 'bg-hh-yellow/5 border border-hh-yellow/30 text-white shadow-[2px_2px_0px_0px_rgba(255,223,0,0.3)]'
                : 'bg-[#0A4226]/40 border border-hh-pink/30 text-hh-cream shadow-[2px_2px_0px_0px_rgba(255,20,147,0.3)]'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="self-start flex flex-col w-full max-w-[85%] animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-hh-pink animate-pulse" />
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-hh-pink">
                STUDIO AI
              </div>
            </div>
            <div className="px-5 py-4 bg-[#0A4226]/20 border border-hh-pink/30 flex items-center gap-4 shadow-[2px_2px_0px_0px_rgba(255,20,147,0.2)]">
              <Loader2 className="w-5 h-5 text-hh-pink animate-spin shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-hh-pink uppercase tracking-widest font-bold">Analyzing Data</span>
                <span className="font-mono text-[10px] text-hh-pink/60 uppercase tracking-widest">Building identity matrix...</span>
              </div>
            </div>
          </div>
        )}

        {/* Title Selection UI */}
        {!isLoading && aiState.pendingTitles && aiState.pendingTitles.length > 0 && (
          <div className="self-start w-full mt-4 flex flex-col gap-4 border-t border-dashed border-hh-yellow/30 pt-4">
            <div className="text-xs font-bold uppercase tracking-widest text-hh-yellow">Select Your Identity Title:</div>
            <div className="flex flex-col gap-3">
              {aiState.pendingTitles.map((title) => (
                <button
                  key={title}
                  onClick={() => handleTitleSelect(title)}
                  className={`group flex items-center justify-between px-5 py-4 border text-left transition-all duration-200 font-mono text-sm uppercase tracking-widest ${
                    selectedTitle === title
                      ? 'bg-hh-yellow border-hh-yellow text-[#0A4226] font-bold shadow-[4px_4px_0px_0px_rgba(255,20,147,0.5)] scale-[1.01]'
                      : 'bg-black/40 border-hh-yellow/30 text-hh-cream hover:border-hh-yellow hover:bg-hh-yellow/10'
                  }`}
                >
                  <span>{title}</span>
                  {selectedTitle === title && <Check className="w-5 h-5 flex-shrink-0 text-[#0A4226]" />}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-3 bg-hh-pink/20 border border-hh-pink text-hh-pink font-mono text-xs uppercase tracking-wider text-center">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={handleUseTitleAndBuild}
                disabled={!selectedTitle}
                className="flex-1 py-4 bg-hh-pink text-white font-mono font-bold uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-hh-pink transition-colors disabled:opacity-40 disabled:hover:bg-hh-pink disabled:hover:text-white disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,20,147,0.2)]"
              >
                Build ID Frame →
              </button>
              <button
                onClick={handleMoreTitles}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-black/40 border border-hh-yellow/40 text-hh-yellow font-mono font-bold uppercase tracking-widest text-xs hover:border-hh-yellow hover:bg-hh-yellow/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                More Titles
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#041008] border-t border-hh-yellow/20 p-4 md:p-6">
        <form onSubmit={handleSubmit} className="relative group flex items-center">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-hh-yellow/50 group-focus-within:bg-hh-yellow rounded-full transition-colors" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={messages.length <= 1 ? "I'm Rahul, I build AI apps with Next.js..." : "Type your response..."}
            className="w-full bg-black/40 border border-hh-yellow/30 outline-none text-white pl-10 pr-16 py-4 placeholder:text-hh-cream/30 text-sm font-mono focus:border-hh-yellow focus:bg-hh-yellow/5 transition-all disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-hh-yellow text-[#0A4226] disabled:opacity-30 disabled:bg-hh-yellow/30 hover:bg-white transition-colors border border-transparent disabled:border-hh-yellow/20"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};