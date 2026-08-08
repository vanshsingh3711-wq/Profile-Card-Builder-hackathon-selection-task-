'use client';

import React, { useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { BuilderAssistant } from './builder-assistant';
import { StackEditor } from '@/components/ui/StackEditor';
import { BuilderProfile } from '@/types/builder';

interface Props {
  onProfileGenerated: (p: Partial<BuilderProfile>) => void;
  onBack: () => void;
}

export const IdentityScreen: React.FC<Props> = ({ onProfileGenerated, onBack }) => {
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ name: '', role: '', builderTitle: '' });
  const [stackInput, setStackInput] = useState('');
  const [stack, setStack] = useState<string[]>([]);

  const addStack = () => {
    const tag = stackInput.trim().toUpperCase();
    if (tag && !stack.includes(tag) && stack.length < 4) {
      setStack((prev) => [...prev, tag]);
      setStackInput('');
    }
  };

  const removeStack = (tag: string) => setStack((prev) => prev.filter((t) => t !== tag));

  const submitManual = () => {
    onProfileGenerated({
      name: manual.name || 'BUILDER',
      role: manual.role || 'BUILDER',
      stack: stack.length > 0 ? stack : ['CODE', 'CRAFT'],
      builderTitle: manual.builderTitle || 'BUILDER IN THE MAKING',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-hh-yellow/60 hover:text-hh-yellow text-xs uppercase tracking-widest font-mono transition-colors self-start"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-hh-yellow/30" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-hh-yellow">Step 02 / 03</span>
          <div className="h-px flex-1 bg-hh-yellow/30" />
        </div>
        <h2 className="font-bodoni text-4xl md:text-6xl text-hh-cream uppercase leading-none">
          Your<br /><span className="text-hh-pink">Identity</span>
        </h2>
        <p className="font-mono text-xs text-hh-cream/60 uppercase tracking-widest">
          Tell the AI what you build — it turns your words into a builder profile.
        </p>
      </div>

      {/* AI Assistant — primary interaction */}
      {!showManual && (
        <div className="flex flex-col gap-6 bg-black/10 p-6 md:p-8 border border-hh-yellow/20">
          <div className="flex items-center gap-3 mb-1 border-b border-hh-yellow/20 pb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-hh-pink animate-pulse shadow-[0_0_8px_rgba(255,20,147,0.8)]" />
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-hh-pink">Studio AI · Active</span>
          </div>
          <BuilderAssistant onProfileGenerated={onProfileGenerated} />
          <div className="flex items-center gap-4 mt-2">
            <div className="h-px flex-1 bg-hh-yellow/10" />
            <button
              onClick={() => setShowManual(true)}
              className="font-mono text-xs text-hh-cream/40 uppercase tracking-widest hover:text-hh-yellow transition-colors whitespace-nowrap"
            >
              Fill manually instead
            </button>
            <div className="h-px flex-1 bg-hh-yellow/10" />
          </div>
        </div>
      )}

      {/* Manual Form — fallback */}
      {showManual && (
        <div className="flex flex-col gap-8 bg-black/10 p-6 md:p-8 border border-hh-yellow/20">
          <div className="flex items-center justify-between border-b border-hh-yellow/20 pb-4">
            <span className="font-mono text-sm uppercase tracking-widest text-hh-yellow">Manual Entry</span>
            <button
              onClick={() => setShowManual(false)}
              className="font-mono text-xs text-hh-pink uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3" /> Use AI instead
            </button>
          </div>

          {/* NAME */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70">Name</label>
            <input
              type="text"
              placeholder="YOUR NAME"
              value={manual.name}
              onChange={(e) => setManual((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-transparent border-b-2 border-hh-yellow/30 focus:border-hh-pink outline-none text-white font-bodoni text-3xl py-2 uppercase placeholder:text-white/10 transition-colors"
            />
          </div>

          {/* ROLE */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70">Role</label>
            <input
              type="text"
              placeholder="AI DEVELOPER"
              value={manual.role}
              onChange={(e) => setManual((p) => ({ ...p, role: e.target.value }))}
              className="w-full bg-transparent border-b-2 border-hh-yellow/30 focus:border-hh-pink outline-none text-white font-mono text-lg py-2 uppercase placeholder:text-white/10 transition-colors"
            />
          </div>

          {/* STACK */}
          <StackEditor
            stack={stack}
            stackInput={stackInput}
            onInputChange={setStackInput}
            onAdd={addStack}
            onRemove={removeStack}
            variant="line"
          />

          {/* BUILDER TITLE */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70">Builder Title</label>
            <input
              type="text"
              placeholder="AGENT ARCHITECT"
              value={manual.builderTitle}
              onChange={(e) => setManual((p) => ({ ...p, builderTitle: e.target.value }))}
              className="w-full bg-transparent border-b-2 border-hh-yellow/30 focus:border-hh-pink outline-none text-hh-pink font-bodoni text-3xl py-2 uppercase placeholder:text-white/10 transition-colors"
            />
          </div>

          <button
            onClick={submitManual}
            className="w-full py-5 bg-hh-yellow text-[#0A4226] font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-colors mt-4"
          >
            Generate Frame →
          </button>
        </div>
      )}
    </div>
  );
};
