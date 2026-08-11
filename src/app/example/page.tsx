'use client';

import { BuilderCard } from '@/components/builder/BuilderCard';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';



export default function ExamplePage() {
  const exampleProfile1 = {
    name: "Vansh",
    role: "AI Full Stack Developer",
    builderTitle: "AGENT ARCHITECT",
    stack: ["NEXT.JS", "TYPESCRIPT", "PYTHON"],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" 
  };
  
  const exampleProfile2 = {
    name: "Priya",
    role: "Frontend Engineer",
    builderTitle: "UI/UX DESIGNER",
    stack: ["REACT", "TAILWIND", "FIGMA"],
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80" 
  };

  return (
    <main className="min-h-screen bg-hh-green text-hh-cream flex flex-col relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-hh-yellow/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-hh-pink/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto p-6 md:p-8 relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation */}
        <header className="flex justify-between items-center mb-16 md:mb-24">
          <Link href="/" className="flex items-center">
            <Image
              src="/branding/2-47.svg"
              alt="2:47 PM STUDIO"
              width={100}
              height={40}
              className="w-20 md:w-24 hover:opacity-80 transition-opacity"
              style={{ filter: "brightness(0) saturate(100%) invert(86%) sepia(50%) saturate(1048%) hue-rotate(352deg) brightness(106%) contrast(104%)" }}
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-hh-cream font-mono text-xs md:text-sm tracking-widest uppercase hover:text-hh-yellow transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="font-mono text-hh-pink tracking-widest uppercase text-sm mb-4">Examples</p>
          <h1 className="font-bodoni text-4xl md:text-6xl text-hh-yellow uppercase tracking-widest leading-tight mb-6">
            Builder Identities
          </h1>
          <p className="font-mono text-hh-cream/70 text-sm md:text-base max-w-xl leading-relaxed tracking-widest uppercase">
            See what you can build. Select your style, verify your identity, and claim your spot on the grid.
          </p>
        </div>

        {/* 2-Column Example Grid */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 mb-24 w-full">
          {/* Card 1 */}
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="w-full max-w-[400px]">
               <BuilderCard profile={exampleProfile1} style="goa" />
            </div>
            <div className="mt-8 flex flex-col items-center">
              <span className="font-mono text-hh-yellow text-xs tracking-widest uppercase border border-hh-yellow/30 px-4 py-2 rounded-full backdrop-blur-sm bg-hh-green/50">Classic Goa Style</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="w-full max-w-[400px]">
               <BuilderCard profile={exampleProfile2} style="editorial" />
            </div>
            <div className="mt-8 flex flex-col items-center">
              <span className="font-mono text-hh-pink text-xs tracking-widest uppercase border border-hh-pink/30 px-4 py-2 rounded-full backdrop-blur-sm bg-hh-green/50">Editorial Style</span>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-auto pt-16 pb-8 flex flex-col items-center border-t border-hh-cream/10 animate-in fade-in duration-1000 delay-500">
          <h2 className="font-bodoni text-2xl md:text-3xl text-hh-cream uppercase tracking-widest mb-8 text-center">
            Want your own?
          </h2>
          <Link 
            href="/create"
            className="px-10 py-5 bg-hh-yellow text-hh-green font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,223,0,0.2)] text-center w-full sm:w-auto"
          >
            Create Your Builder ID →
          </Link>
        </div>

      </div>
    </main>
  );
}
