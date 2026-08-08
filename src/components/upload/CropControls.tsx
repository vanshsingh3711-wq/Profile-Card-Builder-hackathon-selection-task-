'use client';

import React from 'react';
import { ZoomIn, ZoomOut, RefreshCw, Maximize } from 'lucide-react';

interface CropControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  onReset: () => void;
  onAutoFrame: () => void;
}

export const CropControls: React.FC<CropControlsProps> = ({
  zoom,
  setZoom,
  onReset,
  onAutoFrame,
}) => {
  return (
    <div className="flex flex-col items-center gap-6 mt-6 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-4 w-full px-4">
        <button 
          onClick={() => setZoom(Math.max(1, zoom - 0.1))}
          className="text-hh-yellow hover:text-white hover:scale-110 transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.05}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-hh-pink h-1.5 bg-hh-yellow/20 rounded-full appearance-none outline-none cursor-pointer hover:bg-hh-yellow/30 transition-colors"
        />
        <button 
          onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          className="text-hh-yellow hover:text-white hover:scale-110 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 border border-hh-yellow/20 hover:border-hh-yellow hover:bg-hh-yellow/10 text-hh-yellow text-xs font-mono uppercase tracking-widest transition-all active:scale-95"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>
        <button
          onClick={onAutoFrame}
          className="flex items-center gap-2 px-4 py-2 border border-hh-pink hover:bg-hh-pink/20 text-hh-pink text-xs font-mono uppercase tracking-widest transition-all active:scale-95"
        >
          <Maximize className="w-3 h-3" />
          Auto Frame
        </button>
      </div>
    </div>
  );
};
