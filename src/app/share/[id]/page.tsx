import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSharedProfile } from '@/lib/share-profile';

type Props = {
  params: Promise<{ id: string }>;
};



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getSharedProfile(id);
  
  const defaultTitle = 'Hacker House Goa 2026 — Builder Identity';
  const defaultDesc = 'Meet a builder heading to Hacker House Goa 2026. #FrameInGoa';

  if (!result.ok) {
    return {
      title: defaultTitle,
      description: defaultDesc,
      openGraph: { title: defaultTitle, description: defaultDesc },
      twitter: { card: 'summary_large_image', title: defaultTitle, description: defaultDesc },
    };
  }

  const title = `${result.profile.name} — Hacker House Goa 2026`;
  const description = `${result.profile.name} is a ${result.profile.role} heading to Hacker House Goa 2026.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const result = await getSharedProfile(id);

  if (!result.ok) {
     if (result.error === 'not_found') {
        notFound();
     }
     // For storage or malformed errors, show a simpler error state instead of a broken image
     return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-hh-green text-hh-cream">
            <h1 className="font-bodoni text-3xl text-hh-yellow mb-4">Error Loading Profile</h1>
            <p className="font-mono text-sm">{result.message}</p>
        </main>
     );
  }

  const { imageUrl } = result;

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
            src={imageUrl}
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
            href={imageUrl}
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
