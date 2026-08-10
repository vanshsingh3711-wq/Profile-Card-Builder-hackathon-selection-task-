'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const COMMON_TECHS = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", "Python", 
  "PostgreSQL", "Prisma", "PHP", "PyTorch", "Node.js", 
  "Express", "Django", "Flask", "FastAPI", "MongoDB", 
  "Redis", "AWS", "Docker", "Kubernetes", "GraphQL", 
  "Vue", "Angular", "Svelte", "Go", "Rust", 
  "C++", "Java", "Spring", "C#", ".NET", 
  "Swift", "Kotlin", "Flutter", "React Native", "Solidity", 
  "Web3.js", "Ethers.js", "Hardhat", "Firebase", "Supabase", 
  "Vercel", "Cloudflare", "Figma", "Stripe", "TensorFlow", 
  "LangChain", "OpenAI"
];

interface StackEditorProps {
  stack: string[];
  stackInput: string;
  onInputChange: (val: string) => void;
  onAdd: (tag?: string) => void;
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSuggestions = () => {
    if (!stackInput.trim() || stack.length >= 5) return [];
    const query = stackInput.trim().toLowerCase();
    
    // Filter out already selected (case-insensitive)
    const available = COMMON_TECHS.filter(t => !stack.map(s => s.toUpperCase()).includes(t.toUpperCase()));
    
    const prefixes = available.filter(t => t.toLowerCase().startsWith(query));
    const partials = available.filter(t => t.toLowerCase().includes(query) && !t.toLowerCase().startsWith(query));
    
    return [...prefixes, ...partials].slice(0, 6);
  };

  const suggestions = getSuggestions();

  useEffect(() => {
    setHighlightedIndex(-1);
    setShowSuggestions(suggestions.length > 0);
  }, [stackInput, suggestions.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex]);
      } else {
        onAdd();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (tech: string) => {
    onAdd(tech);
    setShowSuggestions(false);
  };

  const isMaxed = stack.length >= 5;

  const inputClass =
    variant === 'box'
      ? 'flex-1 bg-black/30 border-[2px] border-hh-yellow/30 focus:border-hh-pink outline-none text-white font-mono text-sm px-4 py-3 uppercase placeholder:text-white/10 transition-colors'
      : 'flex-1 bg-transparent border-b-2 border-hh-yellow/30 focus:border-hh-pink outline-none text-white font-mono text-base py-2 uppercase placeholder:text-white/10 transition-colors';

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <label className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-hh-yellow/70 flex justify-between">
        <span>Stack <span className="text-white/30">· up to 5</span></span>
        {isMaxed && <span className="text-hh-pink">Maximum 5 technologies</span>}
      </label>
      
      {!isMaxed && (
        <div className="relative">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="NEXT.JS"
              value={stackInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              className={inputClass}
            />
            <button
              onClick={() => onAdd()}
              disabled={!stackInput.trim()}
              className="px-6 py-2 bg-hh-yellow text-[#0A4226] font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 border-2 border-hh-yellow"
            >
              Add
            </button>
          </div>
          
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-hh-yellow/30 z-50 max-h-48 overflow-y-auto shadow-[4px_4px_0_0_rgba(255,223,0,0.3)]">
              {suggestions.map((tech, i) => (
                <div
                  key={tech}
                  onClick={() => handleSelect(tech)}
                  className={`px-4 py-2 cursor-pointer font-mono text-sm uppercase transition-colors ${
                    i === highlightedIndex ? 'bg-hh-yellow/20 text-hh-yellow font-bold' : 'text-white hover:bg-hh-yellow/10'
                  }`}
                >
                  {tech}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
