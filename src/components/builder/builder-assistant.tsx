'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RefreshCw, Check } from 'lucide-react';
import { chatWithBuilder } from '@/app/actions';
import { BuilderProfile } from '@/types/builder';

interface BuilderAssistantProps {
  onProfileGenerated: (profile: Partial<BuilderProfile>) => void;
}

type Message = { role: 'assistant' | 'user'; content: string };

interface AIState {
  profile: { name: string | null; role: string | null; stack: string[] };
  pendingTitles: string[] | null; // titles waiting for user to pick
}

export const BuilderAssistant: React.FC<BuilderAssistantProps> = ({ onProfileGenerated }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! 👋 I'm your Studio AI. What's your name and what do you build?" }
  ]);
  const [aiState, setAiState] = useState<AIState>({
    profile: { name: null, role: null, stack: [] },
    pendingTitles: null,
  });
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    setAiState(prev => ({ ...prev, pendingTitles: null }));
    setSelectedTitle(null);

    try {
      const res = await chatWithBuilder(newMessages);
      const { chatResponse, readyForTitles, profile, suggestedTitles } = res.data;

      setMessages(prev => [...prev, { role: 'assistant', content: chatResponse }]);
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Let's try again!" }]);
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
      setError("Please tell Studio AI your Name, Role, and Tech Stack in the chat before building your card!");
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
    <div className="w-full flex flex-col bg-transparent border-[2px] border-hh-yellow/20">
      {/* Chat Area */}
      <div className="p-4 md:p-6 flex flex-col gap-6 max-h-[400px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <div className={`font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5 ${msg.role === 'user' ? 'text-hh-yellow' : 'text-hh-pink'}`}>
              {msg.role === 'user' ? 'YOU' : 'STUDIO AI'}
            </div>
            <div className={`p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed ${
              msg.role === 'user'
                ? 'bg-hh-yellow/10 border border-hh-yellow/50 text-white shadow-[2px_2px_0px_0px_rgba(255,223,0,0.5)]'
                : 'bg-hh-pink/10 border border-hh-pink/50 text-white shadow-[2px_2px_0px_0px_rgba(255,20,147,0.5)]'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="self-start text-hh-pink flex gap-2 items-center text-xs uppercase tracking-widest mt-2 font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
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
                  className={`group flex items-center justify-between px-4 py-3 border text-left transition-all duration-200 font-mono text-sm uppercase tracking-widest ${
                    selectedTitle === title
                      ? 'bg-hh-yellow border-hh-yellow text-[#0A4226] font-bold shadow-[3px_3px_0px_0px_rgba(255,20,147,0.5)]'
                      : 'bg-black/20 border-hh-yellow/30 text-hh-cream hover:border-hh-yellow hover:bg-hh-yellow/10'
                  }`}
                >
                  <span>{title}</span>
                  {selectedTitle === title && <Check className="w-4 h-4 flex-shrink-0 text-[#0A4226]" />}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-3 bg-hh-pink/20 border border-hh-pink text-hh-pink font-mono text-xs uppercase tracking-wider text-center">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={handleUseTitleAndBuild}
                disabled={!selectedTitle}
                className="flex-1 py-4 bg-hh-pink text-white font-mono font-bold uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-hh-pink transition-colors disabled:opacity-40 disabled:hover:bg-hh-pink disabled:hover:text-white disabled:cursor-not-allowed"
              >
                Build ID Frame →
              </button>
              <button
                onClick={handleMoreTitles}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-transparent border border-hh-yellow/40 text-hh-yellow font-mono font-bold uppercase tracking-widest text-xs hover:border-hh-yellow hover:bg-hh-yellow/10 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                More Titles
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t-[2px] border-hh-yellow/20 flex bg-black/40">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder={messages.length <= 1 ? "I'm Rahul, I build AI apps with Next.js..." : "Type response..."}
          className="flex-1 bg-transparent border-none outline-none text-white px-5 py-4 placeholder:text-white/30 text-sm font-mono focus:bg-hh-yellow/5 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 bg-hh-yellow text-[#0A4226] font-bold disabled:opacity-30 hover:bg-white transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};