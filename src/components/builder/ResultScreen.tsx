'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import { ManualPhotoCropper } from './ManualPhotoCropper';

import {
  Download,
  Share2,
  Loader2,
  Pencil,
  X,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

import { BuilderCard } from './BuilderCard';
import { BackCard } from './cards/BackCard';
import { StackEditor } from '@/components/ui/StackEditor';
import { Toast, ToastProps } from '@/components/ui/Toast';
import { generateBuilderTitle } from '@/app/actions';

import {
  BuilderProfile,
  CardStyle,
  BuilderResultDraft,
} from '@/types/builder';

interface Props {
  profile: BuilderProfile;
  cardStyle: CardStyle;
  resultDraft: BuilderResultDraft;
  onResultDraftChange: (updates: Partial<BuilderResultDraft>) => void;
  onCardStyleChange: (s: CardStyle) => void;
  onEditProfile: (p: BuilderProfile) => void;
  onRestart: () => void;
}

const STYLE_LABELS: {
  id: CardStyle;
  label: string;
}[] = [
  {
    id: 'editorial',
    label: 'Editorial',
  },
  {
    id: 'terminal',
    label: 'Terminal',
  },
  {
    id: 'goa',
    label: 'Goa',
  },
];

export const ResultScreen: React.FC<Props> = ({
  profile,
  cardStyle,
  resultDraft,
  onResultDraftChange,
  onCardStyleChange,
  onEditProfile,
  onRestart,
}) => {
  // We need a stable share ID so the QR code matches the final share URL.
  const [shareId] = useState(() => profile.shareId || Date.now().toString(36) + Math.random().toString(36).substring(2, 7));

  /*
   * IMPORTANT:
   *
   * This ref points directly to the VISIBLE preview card.
   *
   * We no longer create a hidden 800x1000 card.
   *
   * This guarantees that the downloaded image comes from
   * the exact same rendered card the user sees.
   */
  const exportCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [toast, setToast] = useState<ToastProps | null>(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [stackInput, setStackInput] = useState('');
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [pendingPhotoEdit, setPendingPhotoEdit] = useState<string | null>(null);

  const { isEditing, editProfile } = resultDraft;
  
  // Use profile if editProfile is null (when opening edit mode for the first time)
  const currentEditProfile = editProfile || profile;

  const setIsEditing = (val: boolean) => onResultDraftChange({ isEditing: val });
  const setEditProfile = (val: typeof editProfile | ((prev: BuilderProfile) => BuilderProfile)) => {
    if (typeof val === 'function') {
      onResultDraftChange({ editProfile: val(currentEditProfile) });
    } else {
      onResultDraftChange({ editProfile: val });
    }
  };

  const showToast = (
    message: string,
    type: 'error' | 'success'
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  /**
   * Wait until all images inside the preview card are loaded.
   */
  const waitForImages = async (
    element: HTMLElement
  ) => {
    const images = Array.from(
      element.querySelectorAll('img')
    );

    await Promise.all(
      images.map((img) => {
        if (img.complete) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );
  };

  /**
   * Export the EXACT visible preview card.
   *
   * We dynamically calculate pixelRatio so the output is
   * approximately 1200px wide regardless of the preview width.
   *
   * Example:
   *
   * Preview = 420px wide
   * Target = 1200px
   *
   * pixelRatio = 1200 / 420 = 2.85
   *
   * Because the source DOM is the actual preview,
   * layout and design remain identical.
   */
  const exportCard = async (element: HTMLDivElement | null): Promise<string | null> => {
    if (!element) {
      return null;
    }

    /*
     * Make sure fonts have finished loading.
     */
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    /*
     * Make sure images have finished loading.
     */
    await waitForImages(element);

    /*
     * Give the browser a couple of frames to finish
     * layout/paint before capturing.
     */
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });

    const rect = element.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      throw new Error('Preview card has no dimensions');
    }

    /*
     * Target a 1200px-wide output (reduced from 1600px to keep payload size small).
     *
     * Since the card uses 4:5 aspect ratio,
     * the output will be approximately 1200x1500.
     */
    const targetWidth = 1200;

    const pixelRatio = Math.max(
      1,
      targetWidth / rect.width
    );

    return toJpeg(element, {
      pixelRatio,
      quality: 0.85,

      /*
       * Helps html-to-image handle cached images.
       */
      cacheBust: true,

      /*
       * Do not modify the visible card's layout.
       */
      style: {
        transform: 'none',
      },
    });
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);

      const frontDataUrl = await exportCard(exportCardRef.current);
      const backDataUrl = await exportCard(backCardRef.current);

      if (!frontDataUrl || !backDataUrl) {
        throw new Error('Could not find preview cards');
      }

      const safeName = profile.name?.trim().replace(/\s+/g, '-') || 'Builder';

      // Download Front
      const linkFront = document.createElement('a');
      linkFront.download = `HH-Goa-2026-${safeName}-front.jpg`;
      linkFront.href = frontDataUrl;
      document.body.appendChild(linkFront);
      linkFront.click();
      linkFront.remove();

      // Download Back
      const linkBack = document.createElement('a');
      linkBack.download = `HH-Goa-2026-${safeName}-back.jpg`;
      linkBack.href = backDataUrl;
      document.body.appendChild(linkBack);
      linkBack.click();
      linkBack.remove();

      showToast('Front and back cards downloaded!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Failed to generate image. Try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const [isSharingAnywhere, setIsSharingAnywhere] = useState(false);

  const generateShareUrl = async (): Promise<string | null> => {
    try {
      /*
       * Generate the exact same image that the user sees.
       */
      const frontDataUrl = await exportCard(exportCardRef.current);
      const backDataUrl = await exportCard(backCardRef.current);

      if (!frontDataUrl || !backDataUrl) {
        throw new Error(
          'Could not generate preview'
        );
      }

      const payloadSize = frontDataUrl.length + backDataUrl.length;
      console.log(`[ResultScreen] Generating payload. Size: ${payloadSize} chars (~${Math.round(payloadSize * 0.75 / 1024)} KB)`);

      const { photo, ...profileWithoutPhoto } = profile;

      const response = await fetch(
        '/api/share',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: frontDataUrl,
            profile: {
              ...profileWithoutPhoto,
              shareId: shareId,
              profilePhoto: backDataUrl, // store the BACK card here for OG image composition
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Share server error'
        );
      }

      const { id } =
        await response.json();

      return `${window.location.origin}/share/${id}`;
    } catch (err) {
      console.error(
        'Share error:',
        err
      );
      return null;
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    const shareUrl = await generateShareUrl();
    setIsSharing(false);

    if (!shareUrl) {
      showToast(
        'Failed to connect to X. Try downloading instead.',
        'error'
      );
      return;
    }

    const text =
      `ID Secured for Hacker House Goa 2026.\n\n` +
      `Who else is building?\n\n` +
      `#FrameInGoa\n\n` +
      `${shareUrl}`;

    /*
     * X intent URL.
     */
    const xUrl =
      `https://x.com/intent/post?text=${encodeURIComponent(
        text
      )}`;

    window.open(
      xUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareAnywhere = async () => {
    setIsSharingAnywhere(true);
    const shareUrl = await generateShareUrl();
    setIsSharingAnywhere(false);

    if (!shareUrl) {
      showToast(
        'Failed to generate share link. Try downloading instead.',
        'error'
      );
      return;
    }

    const shareData = {
      title: 'My Hacker House Goa 2026 Builder ID',
      text: 'Check out my Builder ID for Hacker House Goa 2026!',
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          showToast('Failed to share.', 'error');
        }
      }
    } else if (navigator.share) {
      // Sometimes canShare is not supported but share is
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          showToast('Failed to share.', 'error');
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Share link copied! You can paste it anywhere.', 'success');
      } catch (err) {
        showToast('Failed to copy link to clipboard.', 'error');
      }
    }
  };

  const addEditStack = (forcedTag?: string) => {
    const tag = (forcedTag ?? stackInput)
        .trim()
        .toUpperCase();

    if (
      tag &&
      !currentEditProfile.stack.includes(tag) &&
      currentEditProfile.stack.length < 5
    ) {
      setEditProfile((p) => ({
        ...p,
        stack: [
          ...p.stack,
          tag,
        ],
      }));

      setStackInput('');
    }
  };

  const handleGenerateTitle = async () => {
    const trimmedRole = currentEditProfile.role?.trim() || '';
    if (!trimmedRole || !currentEditProfile.stack || currentEditProfile.stack.length === 0) {
      showToast('Please fill in your Role and Stack first to generate a title.', 'error');
      return;
    }

    setIsGeneratingTitle(true);
    try {
      const res = await generateBuilderTitle(currentEditProfile.name?.trim() || '', trimmedRole, currentEditProfile.stack);
      if (res.success && res.title) {
        setEditProfile(p => ({ ...p, builderTitle: res.title }));
      } else {
        showToast('Failed to generate title. Try typing one manually!', 'error');
      }
    } catch (err) {
      showToast('Something went wrong generating the title.', 'error');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const removeEditStack = (
    tag: string
  ) => {
    setEditProfile((p) => ({
      ...p,

      stack: p.stack.filter(
        (t) => t !== tag
      ),
    }));
  };

  const saveEdit = () => {
    if (
      !currentEditProfile.name?.trim() ||
      !currentEditProfile.role?.trim() ||
      !currentEditProfile.builderTitle?.trim() ||
      !currentEditProfile.stack ||
      currentEditProfile.stack.length === 0
    ) {
      showToast(
        'All fields (Name, Role, Stack, Title) are required to save changes.',
        'error'
      );
      return;
    }

    onEditProfile({
      ...currentEditProfile,
      name: currentEditProfile.name.trim(),
      role: currentEditProfile.role.trim(),
      builderTitle: currentEditProfile.builderTitle.trim(),
    });
    setIsEditing(false);
  };

  const displayProfile = {
    ...(isEditing ? currentEditProfile : profile),
    shareId,
  };

  return (
    <>
      {toast && (
        <Toast
          {...toast}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      <div className={`w-full max-w-6xl mx-auto transition-all duration-1000 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* ─────────────────────────────
            Headline
        ───────────────────────────── */}

        {/* ─────────────────────────────
            Headline
        ───────────────────────────── */}
        <div className="mb-8 flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-3 w-full max-w-md">
            <div className="h-px flex-1 bg-hh-yellow/20" />
            <div className="flex items-center gap-2 px-3 py-1 bg-hh-yellow/5 border border-hh-yellow/20">
              <div className="w-1.5 h-1.5 bg-hh-yellow animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-hh-yellow font-bold">
                SYS.INIT // 04:04
              </span>
            </div>
            <div className="h-px flex-1 bg-hh-yellow/20" />
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 bg-hh-pink/10 px-4 py-1.5 border border-hh-pink/30 mb-4 rounded-sm">
              <div className="w-1.5 h-1.5 bg-hh-pink rounded-full animate-pulse shadow-[0_0_8px_rgba(255,20,147,0.8)]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-hh-pink font-bold">
                Identity Matrix Secured
              </span>
            </div>
            <h2 className="font-bodoni text-5xl md:text-6xl text-white uppercase leading-[0.85] tracking-tight">
              Your <span className="text-hh-yellow">Builder ID</span>
              <br />
              Is Ready
            </h2>
            <p className="mt-4 font-mono text-[10px] md:text-xs text-hh-cream/50 uppercase tracking-widest max-w-md">
              The digital artifact of your existence at Hacker House Goa 2026.
            </p>
          </div>
        </div>

        {/* ─────────────────────────────
            Main layout
        ───────────────────────────── */}

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start justify-center">

          {/* ─────────────────────────
              PREVIEW
          ───────────────────────── */}

          <div className="w-full lg:w-auto lg:sticky lg:top-8 flex flex-col items-center gap-6 shrink-0 z-10">
            {/* The physical frame wrapper */}
            <div className="relative w-full max-w-[420px] mx-auto p-3 md:p-4 bg-black/40 border border-hh-yellow/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center group">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-hh-yellow/50" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-hh-yellow/50" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-hh-yellow/50" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-hh-yellow/50" />
              
              <div className="w-full flex justify-between items-center mb-3 px-1">
                <span className="font-mono text-[8px] text-hh-yellow/50 uppercase tracking-widest">
                  Live Render
                </span>
                <span className="font-mono text-[8px] text-hh-yellow/50 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-hh-yellow animate-pulse" />
                  Sync Active
                </span>
              </div>

              <div className="relative w-full perspective-[1200px] transition-transform duration-500 hover:scale-[1.02]">
                <div 
                  className="relative w-full shadow-2xl transition-transform duration-700 [transform-style:preserve-3d]"
                  style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  {/* Front Side */}
                  <div className="w-full [backface-visibility:hidden]">
                    <BuilderCard
                      ref={exportCardRef}
                      profile={displayProfile}
                      style={cardStyle}
                    />
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <BackCard
                      ref={backCardRef}
                      profile={displayProfile}
                      style={cardStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Flip Button */}
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="mt-6 w-full py-3 bg-black/60 border border-hh-yellow/30 text-hh-yellow font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-hh-yellow/10 hover:border-hh-yellow transition-all flex items-center justify-center gap-2"
                aria-label={isFlipped ? "Flip card to front" : "Flip card to back"}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Show {isFlipped ? 'Front' : 'Back'}
              </button>
            </div>

            {/* Style switcher */}
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-hh-cream/40">Visual Style</span>
              <div className="flex bg-black/40 border border-hh-yellow/20 p-1">
                {STYLE_LABELS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => onCardStyleChange(id)}
                    className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all ${
                      cardStyle === id
                        ? 'bg-hh-yellow text-[#0A4226] font-bold shadow-[2px_2px_0px_0px_rgba(255,20,147,0.4)]'
                        : 'bg-transparent text-hh-cream/60 hover:text-hh-cream hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─────────────────────────
              CONTROL PANEL
          ───────────────────────── */}

          <div className="flex-1 flex flex-col gap-6 w-full max-w-md">

            {!isEditing ? (

              <div className="flex flex-col gap-6">

                {/* ─────────────────
                    ACTIONS
                ───────────────── */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleShare}
                    disabled={isExporting || isSharing || isSharingAnywhere}
                    className="group relative flex items-center justify-center gap-3 w-full py-5 bg-hh-pink text-white font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-hh-pink shadow-[0_0_15px_rgba(255,20,147,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:bg-white hover:text-hh-pink transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    Broadcast to X
                  </button>

                  <button
                    onClick={handleShareAnywhere}
                    disabled={isExporting || isSharing || isSharingAnywhere}
                    className="group relative flex items-center justify-center gap-3 w-full py-5 bg-transparent text-hh-cream font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-hh-cream/30 hover:bg-white/5 hover:border-hh-cream/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSharingAnywhere ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    Share Anywhere
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={isExporting || isSharing || isSharingAnywhere}
                    className="group relative flex items-center justify-center gap-3 w-full py-4 bg-hh-yellow text-[#0A4226] font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(255,223,0,0.2)]"
                  >
                    {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />}
                    Download Image
                  </button>
                </div>

                {/* ─────────────────
                    SPEC SHEET
                ───────────────── */}
                <div className="relative bg-[#041008] border border-hh-yellow/30 p-6 md:p-8 shadow-2xl flex flex-col gap-6 mt-2">
                  <div className="flex items-center justify-between border-b border-hh-yellow/20 pb-4">
                    <span className="font-mono text-sm font-bold uppercase tracking-widest text-hh-yellow">
                      Identity Record
                    </span>
                    <button
                      onClick={() => {
                        setEditProfile(profile);
                        setIsEditing(true);
                      }}
                      className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-hh-pink border border-hh-pink/30 px-3 py-1.5 hover:bg-hh-pink/10 transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit Data
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* Name */}
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-hh-yellow/50 mb-1">Subject Name</p>
                      <p className="font-bodoni text-3xl text-white uppercase">{profile.name || '—'}</p>
                    </div>

                    {/* Role & Title */}
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-hh-yellow/50 mb-1.5">Designated Role</p>
                        <p className="font-mono text-xs font-bold text-hh-yellow uppercase tracking-widest">{profile.role || '—'}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-hh-yellow/50 mb-1.5">Builder Title</p>
                        <p className="font-mono text-xs font-bold text-hh-pink uppercase tracking-widest">{profile.builderTitle || '—'}</p>
                      </div>
                    </div>

                    {/* Stack */}
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-hh-yellow/50 mb-2">Tech Stack Matrix</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.stack?.length > 0 ? (
                          profile.stack.map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-1 bg-black/40 border border-hh-yellow/20 text-hh-cream font-mono text-[10px] uppercase tracking-wider"
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-white/30 font-mono text-xs">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-4 border-t border-hh-yellow/10">
                    <button
                      onClick={onRestart}
                      className="w-full py-3 bg-transparent border border-hh-cream/10 text-hh-cream/50 font-mono text-[10px] uppercase tracking-widest hover:text-white hover:border-hh-cream/30 transition-colors"
                    >
                      Start Over Completely
                    </button>
                  </div>
                </div>
              </div>

            ) : (

              /* ─────────────────────
                 INLINE EDITOR
              ───────────────────── */

              <div className="flex flex-col gap-6 bg-[#041008] border border-hh-pink/40 p-6 md:p-8 shadow-2xl animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-hh-pink/20 pb-4">
                  <div className="flex flex-col">
                    <h3 className="font-bodoni text-2xl text-hh-pink uppercase">Override Identity</h3>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-hh-cream/40 mt-1">Manual reconfiguration</span>
                  </div>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-hh-cream/50 hover:text-white transition-colors bg-black/40 p-2 border border-hh-cream/10 hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Photo */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-pink/70">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4 bg-black/40 border border-hh-pink/20 p-3">
                    {currentEditProfile.photo ? (
                      <div className="w-12 h-12 shrink-0 rounded-sm overflow-hidden border border-hh-pink/50">
                        <img src={currentEditProfile.photo} alt="Profile" className="w-full h-full object-cover grayscale" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 shrink-0 bg-black/60 border border-hh-pink/30 flex items-center justify-center">
                        <span className="font-mono text-[8px] text-hh-pink/50">NONE</span>
                      </div>
                    )}
                    <label className="cursor-pointer px-4 py-2 bg-hh-pink/10 border border-hh-pink/30 text-hh-pink font-mono text-[10px] uppercase tracking-widest hover:border-hh-pink hover:bg-hh-pink transition-colors hover:text-white flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPendingPhotoEdit(URL.createObjectURL(file));
                          }
                          e.target.value = '';
                        }}
                      />
                      Upload Replacement
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-pink/70">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={currentEditProfile.name}
                    onChange={(e) => setEditProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-black/40 border border-hh-pink/30 focus:border-hh-pink focus:bg-hh-pink/5 outline-none text-white font-bodoni text-2xl px-4 py-3 uppercase placeholder:text-white/10 transition-colors shadow-inner"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-pink/70">
                    Designated Role
                  </label>
                  <input
                    type="text"
                    value={currentEditProfile.role}
                    onChange={(e) => setEditProfile((p) => ({ ...p, role: e.target.value }))}
                    className="w-full bg-black/40 border border-hh-pink/30 focus:border-hh-pink focus:bg-hh-pink/5 outline-none text-white font-mono text-base px-4 py-3 uppercase placeholder:text-white/10 transition-colors shadow-inner"
                  />
                </div>

                {/* Stack */}
                <div className="flex flex-col gap-2">
                  <StackEditor
                    stack={currentEditProfile.stack}
                    stackInput={stackInput}
                    onInputChange={setStackInput}
                    onAdd={addEditStack}
                    onRemove={removeEditStack}
                    variant="box"
                  />
                </div>

                {/* Builder title */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-hh-pink/70">
                      Builder Title
                    </label>
                    <button 
                      onClick={handleGenerateTitle}
                      disabled={isGeneratingTitle}
                      className="text-[9px] px-2 py-1 bg-hh-yellow/10 border border-hh-yellow/30 font-mono text-hh-yellow hover:bg-hh-yellow hover:text-[#0A4226] uppercase tracking-widest flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      {isGeneratingTitle ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      {isGeneratingTitle ? 'Generating...' : 'Auto-Generate'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={currentEditProfile.builderTitle}
                    onChange={(e) => setEditProfile((p) => ({ ...p, builderTitle: e.target.value }))}
                    className="w-full bg-black/40 border border-hh-pink/30 focus:border-hh-pink focus:bg-hh-pink/5 outline-none text-hh-pink font-bodoni text-2xl px-4 py-3 uppercase placeholder:text-white/10 transition-colors shadow-inner"
                  />
                </div>

                {/* Save */}
                <div className="flex flex-col gap-3 mt-4">
                  <button
                    onClick={saveEdit}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-hh-pink text-white font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-hh-pink transition-all shadow-[0_0_15px_rgba(255,20,147,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                  >
                    <Check className="w-5 h-5" />
                    Commit Changes
                  </button>
                </div>
              </div>

            )}

          </div>

        </div>

      </div>

      {pendingPhotoEdit && (
        <ManualPhotoCropper
          imageSrc={pendingPhotoEdit}
          onCancel={() => {
            URL.revokeObjectURL(pendingPhotoEdit);
            setPendingPhotoEdit(null);
          }}
          onSave={(url) => {
            URL.revokeObjectURL(pendingPhotoEdit);
            setEditProfile(p => ({ ...p, photo: url }));
            setPendingPhotoEdit(null);
          }}
        />
      )}
    </>
  );
};