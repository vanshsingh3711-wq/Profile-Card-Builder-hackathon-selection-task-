import { BuilderFlow } from '@/components/builder/builder-flow';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create ID — Hacker House Goa 2026",
  description: "Upload your subject. Define your stack. Get your official #FrameInGoa badge instantly.",
};

export default function CreatePage() {
  return (
    <main className="relative min-h-screen bg-[#0A4226] overflow-hidden flex flex-col">
      {/* Background Decorative Elements - strictly matching the neon glow from the homepage */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-hh-pink/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-hh-yellow/5 blur-[120px] pointer-events-none" />

      {/* Tree SVG Background Layer */}
      <div className="absolute bottom-[-5%] left-0 right-0 h-[60vh] pointer-events-none flex justify-between items-end overflow-hidden z-0 opacity-40">
        <img src="/branding/trees/transparent_asset_01.svg" alt="" className="h-full w-auto object-contain object-bottom -ml-20" />
        <img src="/branding/trees/transparent_asset_03.svg" alt="" className="h-[80%] w-auto object-contain object-bottom -ml-10" />
        <img src="/branding/trees/transparent_asset_04.svg" alt="" className="h-[90%] w-auto object-contain object-bottom -mr-10" />
        <img src="/branding/trees/bush.svg" alt="" className="h-[60%] w-auto object-contain object-bottom -mr-20" />
      </div>

      {/* 
        The z-10 ensures the glows stay behind the UI.
        BuilderFlow handles its own max-widths and padding.
        We use [&>div]:!bg-transparent to ensure BuilderFlow's solid background doesn't cover the trees.
      */}
      <div className="relative z-10 w-full flex-1 flex flex-col [&>div]:!bg-transparent">
        <BuilderFlow />
      </div>
    </main>
  );
}