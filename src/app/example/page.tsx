import { BuilderCard } from '@/components/builder/BuilderCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: "Example — Hacker House Goa 2026",
};

export default function ExamplePage() {
  const exampleProfile = {
    name: "Vansh",
    role: "AI Full Stack Developer",
    builderTitle: "AGENT ARCHITECT",
    stack: ["NEXT.JS", "TYPESCRIPT", "PYTHON"],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" // Example photo
  };

  return (
    <main className="min-h-screen bg-hh-green text-hh-cream p-4 md:p-8 flex flex-col items-center relative bg-pattern">
      <Link href="/" className="self-start text-hh-cream/60 hover:text-hh-yellow flex items-center gap-2 text-sm tracking-widest uppercase transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back Home
      </Link>
      
      <h1 className="font-bodoni text-3xl md:text-5xl text-hh-yellow uppercase mb-8 text-center">
        Example Identity
      </h1>
      
      <div className="w-full max-w-[400px]">
        <BuilderCard profile={exampleProfile} />
      </div>

      <Link 
        href="/create"
        className="mt-12 px-8 py-4 bg-hh-pink text-white font-bold uppercase tracking-wider text-sm hover:bg-pink-600 transition-colors"
      >
        Create Yours Now
      </Link>
    </main>
  );
}
