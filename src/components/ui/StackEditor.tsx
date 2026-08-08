'use client';

import React from 'react';
import { X } from 'lucide-react';

interface StackEditorProps {
  stack: string[];
  stackInput: string;
  onInputChange: (val: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
  /** Input style variant: 'line' (underline only) | 'box' (bordered box) */
  variant?: 'line' | 'box';
}

export const StackEditor: React.FC<StackEditorProps> = ({
  stack,
  stackInput,
  onInputChange,
  onAdd,
  onRemove,
  variant = 'line',
}) => {
  const inputClass =
    variant === 'box'
      ? 'flex-1 bg-black/30 border-[2px] border-hh-yellow/30 focus:border-hh-pink outline-none text-white font-mono text-sm px-4 py-3 uppercase placeholder:text-white/10 transition-colors'
      : 'flex-1 bg-transparent border-b-2 border-hh-yellow/30 focus:border-hh-pink outline-none text-white font-mono text-base py-2 uppercase placeholder:text-white/10 transition-colors';

  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70">
        Stack <span className="text-white/30">· up to 5</span>
      </label>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="NEXT.JS"
          value={stackInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          className={inputClass}
        />
        <button
          onClick={onAdd}
          disabled={!stackInput.trim() || stack.length >= 5}
          className="px-6 py-2 bg-hh-yellow text-[#0A4226] font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 border-2 border-hh-yellow"
        >
          Add
        </button>
      </div>
      {stack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {stack.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-hh-pink text-hh-pink font-mono text-xs uppercase tracking-wider"
            >
              {tag}
              <button
                onClick={() => onRemove(tag)}
                className="hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
