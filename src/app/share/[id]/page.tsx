import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};



export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Hacker House Goa 2026 — Builder Identity',
    description: 'Meet a builder heading to Hacker House Goa 2026. #FrameInGoa',
    openGraph: {
      title: 'Hacker House Goa 2026 — Builder Identity',
      description: 'Meet a builder heading to Hacker House Goa 2026. #FrameInGoa',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hacker House Goa 2026 — Builder Identity',
      description: 'Meet a builder heading to Hacker House Goa 2026. #FrameInGoa',
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const imageEndpoint = `/api/share-image/${id}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-hh-green text-hh-cream relative overflow-hidden bg-pattern">
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-hh-pink/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-hh-yellow/10 blur-3xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-2xl w-full">
        <h1 className="font-bodoni text-3xl md:text-5xl text-hh-yellow uppercase text-center mb-2">
          Builder Identity
        </h1>
        <p className="text-hh-cream/70 mb-8 uppercase tracking-widest text-sm text-center">
          Hacker House Goa 2026
        </p>

        <div className="relative w-full max-w-[400px] mb-8 shadow-2xl shadow-black/50 border border-hh-yellow/20">
          <Image
            src={imageEndpoint}
            alt="Builder Card"
            width={800}
            height={1000}
            className="w-full h-auto object-contain"
            priority
            unoptimized
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[400px]">
          <Link
            href="/create"
            className="flex-1 flex items-center justify-center px-6 py-4 bg-hh-yellow text-hh-green font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors text-center"
          >
            Create Your Own
          </Link>
          <a
            href={imageEndpoint}
            download={`HH-Goa-2026-${id}.png`}
            className="flex-1 flex items-center justify-center px-6 py-4 bg-hh-pink text-white font-bold uppercase tracking-wider text-sm hover:bg-pink-600 transition-colors text-center"
          >
            Download
          </a>
        </div>
      </div>
    </main>
  );
}
