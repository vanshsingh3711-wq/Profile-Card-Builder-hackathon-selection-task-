import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  
  // Construct absolute URL for OG image
  // In production, this would be your actual domain
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const imageUrl = `${baseUrl}/shares/${id}.png`;

  return {
    title: 'Hacker House Goa 2026 — Builder Identity',
    description: 'Meet a builder heading to Hacker House Goa 2026.',
    openGraph: {
      title: 'Hacker House Goa 2026 — Builder Identity',
      description: 'Meet a builder heading to Hacker House Goa 2026.',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 1000,
          alt: 'Builder Identity Card',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hacker House Goa 2026 — Builder Identity',
      description: 'Meet a builder heading to Hacker House Goa 2026.',
      images: [imageUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;

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
            src={`/shares/${id}.png`}
            alt="Builder Card"
            width={800}
            height={1000}
            className="w-full h-auto"
            priority
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
            href={`/shares/${id}.png`}
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
