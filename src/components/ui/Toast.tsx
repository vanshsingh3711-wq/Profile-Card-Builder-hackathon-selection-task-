'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'error' | 'success';
}

interface Props extends ToastProps {
  onClose: () => void;
}

export const Toast: React.FC<Props> = ({ message, type, onClose }) => (
  <div
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 font-mono text-sm uppercase tracking-widest border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]
      ${type === 'error'
        ? 'bg-[#0A4226] border-hh-pink text-hh-pink'
        : 'bg-[#0A4226] border-hh-yellow text-hh-yellow'}`}
  >
    <span>{message}</span>
    <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
      <X className="w-4 h-4" />
    </button>
  </div>
);
