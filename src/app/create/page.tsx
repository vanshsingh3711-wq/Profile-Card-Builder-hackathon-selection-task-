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

      {/* 
        The z-10 ensures the glows stay behind the UI.
        BuilderFlow handles its own max-widths and padding.
      */}
      <div className="relative z-10 w-full flex-1 flex flex-col">
        <BuilderFlow />
      </div>
    </main>
  );
}