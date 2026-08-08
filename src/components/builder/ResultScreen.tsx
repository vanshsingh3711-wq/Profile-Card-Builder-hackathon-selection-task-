'use client';

import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, Loader2, Pencil, X, Check } from 'lucide-react';
import { BuilderCard } from './BuilderCard';
import { StackEditor } from '@/components/ui/StackEditor';
import { Toast, ToastProps } from '@/components/ui/Toast';
import { BuilderProfile, CardStyle } from '@/types/builder';

interface Props {
  profile: BuilderProfile;
  cardStyle: CardStyle;
  onCardStyleChange: (s: CardStyle) => void;
  onEditProfile: (p: BuilderProfile) => void;
  onRestart: () => void;
}

const STYLE_LABELS: { id: CardStyle; label: string }[] = [
  { id: 'editorial', label: 'Editorial' },
  { id: 'terminal',  label: 'Terminal'  },
  { id: 'goa',       label: 'Goa'       },
];

export const ResultScreen: React.FC<Props> = ({
  profile,
  cardStyle,
  onCardStyleChange,
  onEditProfile,
  onRestart,
}) => {
  const exportCardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing,   setIsSharing]   = useState(false);
  const [toast,       setToast]       = useState<ToastProps | null>(null);
  const [isEditing,   setIsEditing]   = useState(false);
  const [editProfile, setEditProfile] = useState<BuilderProfile>(profile);
  const [stackInput,  setStackInput]  = useState('');

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const exportCard = async (): Promise<string | null> => {
    if (!exportCardRef.current) return null;
    // Wait for fonts & images to fully render in the hidden card
    await new Promise(r => setTimeout(r, 800));
    return toPng(exportCardRef.current, {
      quality: 1,
      pixelRatio: 2, // 800×1000 × 2 = 1600×2000 final image
      style: { transform: 'none' },
    });
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const dataUrl = await exportCard();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `HH-Goa-2026-${profile.name?.replace(/\s+/g, '-') || 'Builder'}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Frame downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate image. Try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const dataUrl = await exportCard();
      if (!dataUrl) return;
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, profile }),
      });
      if (!response.ok) throw new Error('Server error');
      const { id } = await response.json();
      const shareUrl = `${window.location.origin}/share/${id}`;
      const text = `ID Secured for Hacker House Goa 2026.\n\nWho else is building?\n\n#FrameInGoa\n\n${shareUrl}`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to X. Try downloading instead.', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const addEditStack = () => {
    const tag = stackInput.trim().toUpperCase();
    if (tag && !editProfile.stack.includes(tag) && editProfile.stack.length < 4) {
      setEditProfile(p => ({ ...p, stack: [...p.stack, tag] }));
      setStackInput('');
    }
  };

  const removeEditStack = (tag: string) =>
    setEditProfile(p => ({ ...p, stack: p.stack.filter(t => t !== tag) }));

  const saveEdit = () => {
    onEditProfile(editProfile);
    setIsEditing(false);
  };

  const displayProfile = isEditing ? editProfile : profile;

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Hidden off-screen export card (800×1000) ──────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          height: '1000px',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <BuilderCard ref={exportCardRef} profile={displayProfile} style={cardStyle} isExport />
      </div>

      <div className="w-full max-w-6xl mx-auto">
        {/* Headline */}
        <div className="mb-10 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-hh-yellow/30" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-hh-yellow">Step 04 / 04</span>
            <div className="h-px flex-1 bg-hh-yellow/30" />
          </div>
          <div className="flex flex-col items-center justify-center text-center mt-4">
            <div className="inline-flex items-center gap-4 bg-black/20 px-6 py-2 border border-hh-pink mb-4">
              <div className="w-2.5 h-2.5 bg-hh-pink animate-pulse" />
              <span className="font-mono text-sm uppercase tracking-widest text-hh-pink font-bold">Status: Secured</span>
            </div>
            <h2 className="font-bodoni text-4xl md:text-5xl text-white uppercase leading-none drop-shadow-lg">
              Your <span className="text-hh-yellow">Builder ID</span> Is Ready
            </h2>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start justify-center">
          {/* Card preview + style switcher */}
          <div className="w-full lg:w-auto lg:sticky lg:top-8 flex flex-col items-center gap-4 shrink-0">
            <div className="relative w-full max-w-[420px] mx-auto transition-transform duration-500 hover:scale-[1.02]">
              <BuilderCard profile={displayProfile} style={cardStyle} />
            </div>

            {/* Style switcher pills */}
            <div className="flex gap-2 mt-1">
              {STYLE_LABELS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => onCardStyleChange(id)}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-all
                    ${cardStyle === id
                      ? 'bg-hh-yellow text-[#0A4226] border-hh-yellow font-bold'
                      : 'bg-transparent text-hh-cream/50 border-hh-cream/20 hover:border-hh-yellow/50 hover:text-hh-cream'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-hh-yellow/40">
              — Live Render —
            </span>
          </div>

          {/* Control panel */}
          <div className="flex-1 flex flex-col gap-6 w-full max-w-md">
            {!isEditing ? (
              <div className="flex flex-col gap-6">
                {/* Spec sheet */}
                <div className="relative bg-[#0A4226] border-[3px] border-hh-yellow p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(255,20,147,0.7)]">
                  {/* Decorative barcode */}
                  <div className="absolute top-0 right-0 flex items-start">
                    <div className="flex h-4 gap-0.5 mt-2 mr-4 opacity-40">
                      {[1,3,1,2,4,1,2,1,3,1].map((w, i) => (
                        <div key={i} className="h-full bg-hh-yellow" style={{ width: `${w * 2}px` }} />
                      ))}
                    </div>
                    <div className="w-10 h-10 border-b-[3px] border-l-[3px] border-hh-yellow bg-hh-pink flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 mt-4">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-yellow/70 mb-1">Subject Name</p>
                      <p className="font-bodoni text-3xl text-white uppercase">{profile.name || '—'}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-yellow/70 mb-1.5">Designated Role</p>
                      <p className="font-mono text-sm font-bold text-[#0A4226] bg-hh-yellow px-3 py-1 inline-block uppercase tracking-widest">
                        {profile.role || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-yellow/70 mb-2">Tech Stack</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.stack?.length > 0
                          ? profile.stack.map(t => (
                              <span key={t} className="px-3 py-1 bg-transparent border border-hh-pink text-hh-pink font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(255,20,147,0.5)]">
                                {t}
                              </span>
                            ))
                          : <span className="text-white/30 font-mono text-xs">—</span>}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-dashed border-hh-yellow/30">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-yellow/70 mb-1">Generated Title</p>
                      <p className="font-bodoni text-2xl text-hh-pink uppercase drop-shadow-md">{profile.builderTitle || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-4 mt-2">
                  <button
                    onClick={handleShare}
                    disabled={isExporting || isSharing}
                    className="group relative flex items-center justify-center gap-3 w-full py-5 bg-hh-pink text-white font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-hh-pink shadow-[4px_4px_0_0_rgba(255,223,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(255,223,0,1)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSharing
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    Broadcast to X
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={isExporting || isSharing}
                    className="group relative flex items-center justify-center gap-3 w-full py-5 bg-hh-yellow text-[#0A4226] font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-hh-yellow shadow-[4px_4px_0_0_rgba(255,20,147,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(255,20,147,1)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isExporting
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />}
                    Download Image
                  </button>

                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => { setEditProfile(profile); setIsEditing(true); }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-black/20 border border-hh-yellow/30 text-hh-yellow font-mono uppercase tracking-widest text-xs hover:border-hh-yellow hover:bg-hh-yellow/10 transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit Data
                    </button>
                    <button
                      onClick={onRestart}
                      className="flex-1 py-4 bg-black/20 border border-hh-yellow/30 text-hh-yellow font-mono uppercase tracking-widest text-xs hover:border-hh-yellow hover:bg-hh-yellow/10 transition-colors"
                    >
                      Restart
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Inline editor */
              <div className="flex flex-col gap-8 bg-[#0A4226] border-[3px] border-hh-yellow p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(255,223,0,0.5)]">
                <div className="flex items-center justify-between border-b border-hh-yellow/30 pb-4">
                  <h3 className="font-bodoni text-2xl text-hh-yellow uppercase">Override Identity</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-hh-pink hover:text-white transition-colors bg-hh-pink/10 p-2 border border-hh-pink/30"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70">Subject Name</label>
                  <input
                    type="text"
                    value={editProfile.name}
                    onChange={e => setEditProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-black/30 border-[2px] border-hh-yellow/30 focus:border-hh-pink outline-none text-white font-bodoni text-3xl px-4 py-3 uppercase placeholder:text-white/10 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70">Designated Role</label>
                  <input
                    type="text"
                    value={editProfile.role}
                    onChange={e => setEditProfile(p => ({ ...p, role: e.target.value }))}
                    className="w-full bg-black/30 border-[2px] border-hh-yellow/30 focus:border-hh-pink outline-none text-white font-mono text-lg px-4 py-3 uppercase placeholder:text-white/10 transition-colors"
                  />
                </div>

                <StackEditor
                  stack={editProfile.stack}
                  stackInput={stackInput}
                  onInputChange={setStackInput}
                  onAdd={addEditStack}
                  onRemove={removeEditStack}
                  variant="box"
                />

                <div className="flex flex-col gap-3">
                  <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70">Builder Title</label>
                  <input
                    type="text"
                    value={editProfile.builderTitle}
                    onChange={e => setEditProfile(p => ({ ...p, builderTitle: e.target.value }))}
                    className="w-full bg-black/30 border-[2px] border-hh-yellow/30 focus:border-hh-pink outline-none text-hh-pink font-bodoni text-3xl px-4 py-3 uppercase placeholder:text-white/10 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    onClick={saveEdit}
                    className="w-full flex items-center justify-center gap-2 py-5 bg-hh-yellow text-[#0A4226] font-mono font-bold uppercase tracking-widest text-sm hover:bg-white border-2 border-hh-yellow shadow-[4px_4px_0_0_rgba(255,20,147,0.7)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(255,20,147,0.7)] transition-all"
                  >
                    <Check className="w-5 h-5" /> Confirm Override
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-full py-4 border-2 border-hh-yellow/30 text-hh-yellow font-mono text-xs uppercase tracking-widest hover:border-hh-yellow hover:bg-hh-yellow/10 transition-colors mt-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
