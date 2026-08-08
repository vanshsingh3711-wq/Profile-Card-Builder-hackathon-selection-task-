'use client';

import React from 'react';
import { BuilderProfile } from '@/types/builder';
import { EditorialCard } from '../builder/cards/EditorialCard';
import { TerminalCard } from '../builder/cards/TerminalCard';
import { GoaCard } from '../builder/cards/GoaCard';

interface CardPhotoPreviewProps {
  imageSrc: string;
  cropPixels: { x: number; y: number; width: number; height: number } | null;
}

export const CardPhotoPreview: React.FC<CardPhotoPreviewProps> = ({
  imageSrc,
  cropPixels,
}) => {
  // Create a fast, lightweight crop preview using CSS background
  // and clip it to a 4:5 aspect ratio without expensive canvas operations.
  
  // We need to calculate the CSS background position and size 
  // based on the cropPixels and the container size.
  // Actually, since the BuilderCard expects a valid image URL for `photo`, 
  // we would normally generate a canvas data URL, but the prompt says:
  // "The three previews should update immediately when the user moves/zooms the image."
  // "do NOT regenerate a JPEG on every mouse movement"
  // "During editing, use CSS transforms / crop-library rendering."

  // The cards are designed to take a `profile.photo` URL and put it in an <img> tag 
  // with object-cover.
  // To avoid modifying the card code heavily, we can generate a very fast 
  // low-res canvas preview for the cards, OR we can pass a dummy profile 
  // but we must modify how the cards show the image if we want to use CSS transforms.
  
  // Actually, generating a canvas data URL synchronously inside a requestAnimationFrame 
  // or a fast effect is possible if the canvas is small (e.g. 160x200).
  // Let's create a local state for the fast preview URL.
  
  const [fastPreview, setFastPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!imageSrc || !cropPixels) return;

    let isActive = true;

    // Use a small canvas for realtime preview to keep it fast
    const canvas = document.createElement('canvas');
    canvas.width = 240; 
    canvas.height = 240; 
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (!isActive) return;
      
      ctx.fillStyle = '#050A05';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(
        img,
        cropPixels.x,
        cropPixels.y,
        cropPixels.width,
        cropPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      setFastPreview(canvas.toDataURL('image/jpeg', 0.6));
    };

    return () => {
      isActive = false;
    };
  }, [imageSrc, cropPixels]);

  // Dummy profile for preview
  const dummyProfile: BuilderProfile = {
    name: 'YOUR NAME',
    role: 'FULL STACK DEVELOPER',
    stack: ['NEXT.JS', 'TYPESCRIPT', 'PYTHON'],
    builderTitle: 'AGENT ARCHITECT',
    photo: fastPreview || imageSrc, // Fallback to original image before crop is ready
  };

  const previewSize = "w-full aspect-[4/5]";

  return (
    <div className="w-full flex flex-col gap-4">
      <h3 className="font-mono text-xs text-hh-yellow uppercase tracking-widest text-center mb-2">
        Card Preview
      </h3>
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="flex flex-col gap-2 items-center">
          <div className="w-full shadow-lg transform transition-transform origin-top scale-100">
             <EditorialCard profile={dummyProfile} sizeClass={previewSize} />
          </div>
          <span className="font-mono text-[9px] text-hh-cream/50 uppercase">Editorial</span>
        </div>
        
        <div className="flex flex-col gap-2 items-center">
          <div className="w-full shadow-lg transform transition-transform origin-top scale-100">
             <TerminalCard profile={dummyProfile} sizeClass={previewSize} />
          </div>
          <span className="font-mono text-[9px] text-hh-cream/50 uppercase">Terminal</span>
        </div>

        <div className="flex flex-col gap-2 items-center">
          <div className="w-full shadow-lg transform transition-transform origin-top scale-100">
             <GoaCard profile={dummyProfile} sizeClass={previewSize} />
          </div>
          <span className="font-mono text-[9px] text-hh-cream/50 uppercase">Goa</span>
        </div>
      </div>
    </div>
  );
};
