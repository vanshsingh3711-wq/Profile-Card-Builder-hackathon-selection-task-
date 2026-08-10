import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RefreshCw, Check, X } from 'lucide-react';

interface ManualPhotoCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (croppedDataUrl: string) => void;
}

export const ManualPhotoCropper: React.FC<ManualPhotoCropperProps> = ({
  imageSrc,
  onCancel,
  onSave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [imgStyle, setImgStyle] = useState({ width: 0, height: 0, scaleToCover: 1 });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const cw = containerRef.current?.clientWidth || 320;
    const ch = containerRef.current?.clientHeight || 320;

    const scale = Math.max(cw / nw, ch / nh);
    setImgStyle({ width: nw * scale, height: nh * scale, scaleToCover: scale });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = () => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);

    // Use a short timeout to let the UI update (e.g. showing a loading state if we want)
    setTimeout(() => {
      const img = imageRef.current!;
      const container = containerRef.current!;
      
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      
      const TARGET_SIZE = 1200;
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }
      
      const canvasScale = TARGET_SIZE / cw;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
      
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const finalScale = imgStyle.scaleToCover * zoom * canvasScale;
      
      const cx = (cw / 2 + position.x) * canvasScale;
      const cy = (ch / 2 + position.y) * canvasScale;
      
      const renderWidth = nw * finalScale;
      const renderHeight = nh * finalScale;
      
      ctx.drawImage(
        img,
        cx - renderWidth / 2,
        cy - renderHeight / 2,
        renderWidth,
        renderHeight
      );
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      onSave(dataUrl);
      setIsProcessing(false);
    }, 10);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060B08]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-[#0A4226] border-2 border-hh-yellow shadow-[8px_8px_0_0_rgba(255,20,147,0.5)] p-6 md:p-8 w-full max-w-md flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
          <h3 className="font-bodoni text-2xl text-hh-yellow uppercase">Adjust Photo</h3>
          <button onClick={onCancel} className="text-hh-pink hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CROP AREA */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-square overflow-hidden bg-black border-2 border-hh-yellow cursor-move touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Grid overlay for guidance (optional) */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-20">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div className="" />
            </div>
          </div>
          
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop"
            draggable={false}
            onLoad={handleImageLoad}
            className="absolute top-1/2 left-1/2 origin-center pointer-events-none max-w-none"
            style={{
              width: imgStyle.width,
              height: imgStyle.height,
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
            }}
          />
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5 text-hh-yellow/70" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-hh-pink bg-black/30 outline-none"
            />
            <ZoomIn className="w-5 h-5 text-hh-yellow/70" />
          </div>
          
          <button
            onClick={handleReset}
            className="self-center flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-hh-yellow/60 hover:text-hh-yellow transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Default
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 mt-2">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-4 border-2 border-hh-yellow/30 text-hh-yellow font-mono text-xs uppercase tracking-widest hover:border-hh-yellow hover:bg-hh-yellow/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-hh-yellow text-[#0A4226] font-mono font-bold uppercase tracking-widest text-xs hover:bg-white border-2 border-hh-yellow shadow-[4px_4px_0_0_rgba(255,20,147,0.5)] transition-all disabled:opacity-50"
          >
            {isProcessing ? 'Saving...' : (
              <>
                <Check className="w-4 h-4" /> Save Photo
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
