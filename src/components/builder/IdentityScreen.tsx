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
          className="flex items-center gap-2 text-hh-yellow/60 hover:text-hh-yellow text-[10px] font-bold uppercase tracking-[0.2em] font-mono transition-colors self-start mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return
        </button>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-hh-yellow/20" />
          <div className="flex items-center gap-2 px-3 py-1 bg-hh-yellow/5 border border-hh-yellow/20">
            <div className="w-1.5 h-1.5 bg-hh-yellow animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-hh-yellow font-bold">
              SYS.INIT // 02:04
            </span>
          </div>
          <div className="h-px flex-1 bg-hh-yellow/20" />
        </div>
        <div className="text-center mt-2 mb-2">
          <h2 className="font-bodoni text-5xl md:text-6xl text-hh-yellow uppercase leading-[0.85]">
            Define Your
            <br />
            <span className="text-white">Identity</span>
          </h2>
          <p className="mt-4 font-mono text-xs md:text-sm text-hh-cream/60 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
            Tell the AI what you build, or manually enter your details.
            <br />
            <span className="text-hh-pink font-bold mt-2 inline-block">Name &middot; Role &middot; Tech Stack</span>
          </p>
        </div>
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
              className="font-mono text-xs text-hh-yellow uppercase tracking-widest px-4 py-2 border border-hh-yellow/30 hover:border-hh-yellow hover:bg-hh-yellow/10 transition-all whitespace-nowrap bg-black/20"
            >
              Fill manually instead
            </button>
            <div className="h-px flex-1 bg-hh-yellow/10" />
          </div>
        </div>
      )}

      {/* Manual Form — fallback */}
      {showManual && (
        <div className="flex flex-col gap-8 bg-black/40 p-6 md:p-8 border border-hh-yellow/20 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-hh-yellow/20 pb-4 gap-4">
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold uppercase tracking-widest text-hh-yellow">Manual Builder Identity</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-hh-cream/50 mt-1">Directly configure your identity matrix</span>
            </div>
            <button
              onClick={() => setShowManual(false)}
              className="font-mono text-xs text-hh-pink uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 border border-hh-pink/30 px-3 py-1.5 hover:bg-hh-pink/10"
            >
              <RefreshCw className="w-3 h-3" /> Use AI instead
            </button>
          </div>

          {/* NAME */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70 flex justify-between">
              <span>Name <span className="text-hh-pink">*</span></span>
            </label>
            <input
              type="text"
              placeholder="YOUR NAME"
              value={manual.name}
              onChange={(e) => setManual({ ...manual, name: e.target.value })}
              className="w-full bg-black/40 border border-hh-yellow/30 focus:border-hh-yellow focus:bg-hh-yellow/5 outline-none text-white font-bodoni text-2xl md:text-3xl px-4 py-3 uppercase placeholder:text-white/10 transition-all shadow-inner"
            />
          </div>

          {/* ROLE */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70 flex justify-between">
              <span>Role <span className="text-hh-pink">*</span></span>
            </label>
            <input
              type="text"
              placeholder="AI DEVELOPER"
              value={manual.role}
              onChange={(e) => setManual({ ...manual, role: e.target.value })}
              className="w-full bg-black/40 border border-hh-yellow/30 focus:border-hh-yellow focus:bg-hh-yellow/5 outline-none text-white font-mono text-lg px-4 py-3 uppercase placeholder:text-white/10 transition-all shadow-inner"
            />
          </div>

          {/* STACK */}
          <div className="flex flex-col gap-2">
            <StackEditor
              stack={stack}
              stackInput={stackInput}
              onInputChange={setStackInput}
              onAdd={addStack}
              onRemove={removeStack}
              variant="box"
            />
            {stack.length === 0 && (
              <span className="font-mono text-[10px] text-hh-pink uppercase tracking-widest mt-1">* At least 1 technology required</span>
            )}
          </div>

          {/* BUILDER TITLE */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70 flex justify-between">
                <span>Builder Title <span className="text-hh-pink">*</span></span>
              </label>
              <button 
                onClick={handleGenerateTitle}
                disabled={isGeneratingTitle}
                className="text-[10px] px-3 py-1.5 bg-hh-pink/10 border border-hh-pink/30 font-mono text-hh-pink hover:bg-hh-pink hover:text-white uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isGeneratingTitle ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {isGeneratingTitle ? 'Generating...' : 'Auto-Generate Title'}
              </button>
            </div>
            <input
              type="text"
              placeholder="AGENT ARCHITECT"
              value={manual.builderTitle}
              onChange={(e) => setManual({ ...manual, builderTitle: e.target.value })}
              className="w-full bg-black/40 border border-hh-pink/30 focus:border-hh-pink focus:bg-hh-pink/5 outline-none text-hh-pink font-bodoni text-2xl md:text-3xl px-4 py-3 uppercase placeholder:text-white/10 transition-all shadow-inner"
            />
          </div>

          {error && (
            <div className="p-4 bg-hh-pink/10 border-l-2 border-hh-pink text-hh-pink font-mono text-xs uppercase tracking-wider">
              {error}
            </div>
          )}

          <button
            onClick={submitManual}
            className="w-full py-5 bg-hh-yellow text-[#0A4226] font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-all mt-4 shadow-[0_0_20px_rgba(255,223,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            Build Identity Frame →
          </button>
        </div>
      )}
    </div>
  );
};
