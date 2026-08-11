import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-hh-green text-hh-cream relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-hh-yellow/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-hh-pink/5 blur-[100px] pointer-events-none" />

      {/* Tree SVG Background Layer */}
      <div className="absolute bottom-[-5%] left-0 right-0 h-[60vh] pointer-events-none flex justify-between items-end overflow-hidden z-0 opacity-40">
        <img src="/branding/trees/transparent_asset_01.svg" alt="" className="h-full w-auto object-contain object-bottom -ml-20" />
        <img src="/branding/trees/transparent_asset_03.svg" alt="" className="h-[80%] w-auto object-contain object-bottom -ml-10" />
        <img src="/branding/trees/transparent_asset_04.svg" alt="" className="h-[90%] w-auto object-contain object-bottom -mr-10" />
        <img src="/branding/trees/bush.svg" alt="" className="h-[60%] w-auto object-contain object-bottom -mr-20" />
      </div>

      {/* Header - Matching reference image exactly */}
      <header className="flex justify-between items-center p-6 md:p-8 relative z-10 max-w-7xl mx-auto w-full">
        <Image
          src="/branding/2-47.svg"
          alt="2:47 PM STUDIO"
          width={100}
          height={40}
          className="w-20 md:w-24"
          style={{ filter: "brightness(0) saturate(100%) invert(86%) sepia(50%) saturate(1048%) hue-rotate(352deg) brightness(106%) contrast(104%)" }} // Forces it to match the yellow theme
        />
        <div className="flex items-center gap-6">
          <span className="hidden md:inline-block text-hh-cream font-mono text-xs md:text-sm tracking-widest uppercase hover:text-hh-yellow transition-colors cursor-pointer">
            Check Hype
          </span>
          <Link
            href="/create"
            className="bg-hh-yellow text-hh-green font-bodoni font-bold text-sm md:text-base px-6 py-2 border-[3px] border-dashed border-hh-pink/60 hover:border-hh-pink transition-all uppercase"
          >
            Apply
          </Link>
        </div>
      </header>

      {/* Main Content (Poster Layout) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-6xl mx-auto">

        {/* Exact Logo Lockup (The Overlap Requirement) */}
        <div className="w-full flex flex-col items-center justify-center mb-16 md:mb-20">
          <div className="relative w-full flex justify-center items-center">
            {/* Base Yellow Typography */}
            <Image
              src="/branding/Hacker house.png"
              alt="HACKER HOUSE"
              width={1200}
              height={300}
              priority
              className="w-full h-auto object-contain drop-shadow-xl"
            />
            {/* Overlapping Neon Pink Hindi Text */}
            <Image
              src="/branding/goa_hindi.svg"
              alt="GOA"
              width={300}
              height={150}
              className="absolute z-10 w-[18%] md:w-[14%] top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_15px_rgba(255,20,147,0.5)]"
            />
          </div>

          {/* Reference Footer pinned directly under the logo */}
          <div className="flex w-full justify-between items-center mt-4 px-1 md:px-3">
            <span className="font-mono text-[10px] md:text-sm text-hh-yellow uppercase tracking-widest">
              Goa, India · 28 - 31 Oct 2026
            </span>
            <span className="font-mono text-[10px] md:text-sm text-hh-yellow uppercase tracking-widest">
              2:47 PM Studio
            </span>
          </div>
        </div>

        {/* Generator Call to Action */}
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-700">
          <h2 className="font-bodoni text-3xl md:text-5xl uppercase tracking-widest text-hh-cream mb-4 relative text-center leading-tight">
            Build Your <br className="md:hidden" /><span className="text-hh-pink">Builder</span> Identity
          </h2>

          <p className="text-xs md:text-sm max-w-md mx-auto mb-10 text-hh-cream/60 leading-relaxed font-mono uppercase tracking-widest text-center">
            Upload your subject. Define your stack. Get your official #FrameInGoa badge instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
            <Link
              href="/create"
              className="w-full sm:w-auto px-10 py-5 bg-hh-yellow text-hh-green font-mono font-bold uppercase tracking-[0.2em] text-sm hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,223,0,0.2)] text-center"
            >
              Start Generator →
            </Link>
            <Link
              href="/example"
              className="w-full sm:w-auto px-10 py-5 bg-transparent text-hh-cream font-mono font-bold uppercase tracking-[0.2em] text-sm border border-hh-cream/20 hover:border-hh-cream transition-all duration-300 text-center"
            >
              View Example
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}