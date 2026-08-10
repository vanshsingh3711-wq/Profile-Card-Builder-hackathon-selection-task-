'use client';

import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { BuilderAssistant } from './builder-assistant';
import { StackEditor } from '@/components/ui/StackEditor';
import { BuilderProfile, BuilderIdentityDraft, BuilderChatDraft } from '@/types/builder';
import { generateBuilderTitle } from '@/app/actions';

interface Props {
  profile: BuilderProfile;
  identityDraft: BuilderIdentityDraft;
  chatDraft: BuilderChatDraft;
  onIdentityDraftChange: (updates: Partial<BuilderIdentityDraft>) => void;
  onChatDraftChange: (updates: Partial<BuilderChatDraft>) => void;
  onProfileGenerated: (p: Partial<BuilderProfile>) => void;
  onBack: () => void;
}

export const IdentityScreen: React.FC<Props> = ({ 
  profile, 
  identityDraft, 
  chatDraft, 
  onIdentityDraftChange, 
  onChatDraftChange, 
  onProfileGenerated, 
  onBack 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const { showManual, manual, stackInput, stack } = identityDraft;

  const setShowManual = (val: boolean) => onIdentityDraftChange({ showManual: val });
  const setManual = (val: typeof manual) => onIdentityDraftChange({ manual: val });
  const setStackInput = (val: string) => onIdentityDraftChange({ stackInput: val });
  const setStack = (val: string[]) => onIdentityDraftChange({ stack: val });

  const handleGenerateTitle = async () => {
    const trimmedRole = manual.role.trim();
    if (!trimmedRole || stack.length === 0) {
      setError("Please fill in your Role and Stack first to generate a title.");
      return;
    }
    
    setError(null);
    setIsGeneratingTitle(true);
    
    try {
      const res = await generateBuilderTitle(manual.name.trim(), trimmedRole, stack);
      if (res.success && res.title) {
        setManual({ ...manual, builderTitle: res.title });
      } else {
        setError("Failed to generate title. Try typing one manually!");
      }
    } catch (err) {
      setError("Something went wrong generating the title.");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const addStack = (forcedTag?: string) => {
    const tag = (forcedTag ?? stackInput).trim().toUpperCase();
    if (tag && !stack.includes(tag) && stack.length < 5) {
      setStack([...stack, tag]);
      setStackInput('');
      setError(null);
    }
  };

  const removeStack = (tag: string) => setStack(stack.filter((t) => t !== tag));

  const submitManual = () => {
    const trimmedName = manual.name.trim();
    const trimmedRole = manual.role.trim();
    const trimmedTitle = manual.builderTitle.trim();

    if (!trimmedName || !trimmedRole || !trimmedTitle || stack.length === 0) {
      setError('Please fill in your Name, Role, at least 1 Stack item, and Builder Title to proceed.');
      return;
    }

    setError(null);
    onProfileGenerated({
      name: trimmedName,
      role: trimmedRole,
      stack: stack,
      builderTitle: trimmedTitle,
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
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-hh-yellow">Step 02 / 04</span>
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
          <BuilderAssistant 
            chatDraft={chatDraft}
            onChatDraftChange={onChatDraftChange}
            onProfileGenerated={onProfileGenerated} 
          />
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
              onChange={(e) => setManual({ ...manual, name: e.target.value })}
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
              onChange={(e) => setManual({ ...manual, role: e.target.value })}
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
            <div className="flex justify-between items-end">
              <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70">Builder Title</label>
              <button 
                onClick={handleGenerateTitle}
                disabled={isGeneratingTitle}
                className="text-[10px] font-mono text-hh-pink hover:text-white uppercase tracking-widest flex items-center gap-1 disabled:opacity-50 transition-colors"
              >
                {isGeneratingTitle ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {isGeneratingTitle ? 'Generating...' : 'Generate Title'}
              </button>
            </div>
            <input
              type="text"
              placeholder="AGENT ARCHITECT"
              value={manual.builderTitle}
              onChange={(e) => setManual({ ...manual, builderTitle: e.target.value })}
              className="w-full bg-transparent border-b-2 border-hh-yellow/30 focus:border-hh-pink outline-none text-hh-pink font-bodoni text-3xl py-2 uppercase placeholder:text-white/10 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 bg-hh-pink/20 border border-hh-pink text-hh-pink font-mono text-xs uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          <button
            onClick={submitManual}
            className="w-full py-5 bg-hh-yellow text-[#0A4226] font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-colors mt-2"
          >
            Generate Frame →
          </button>
        </div>
      )}
    </div>
  );
};
