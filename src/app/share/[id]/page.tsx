import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSharedProfile } from '@/lib/share-profile';
import { InteractiveViewer } from './InteractiveViewer';

export const dynamic = 'force-dynamic';

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
      images: [result.cardImageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [result.cardImageUrl],
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

  const { cardImageUrl, profile } = result;
  const backImageUrl = profile.profilePhoto; // We stored the back card here previously

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#060B08] text-hh-cream relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-hh-green/10 via-[#060B08] to-[#060B08]">
      
      {/* 9. BACKGROUND / VISUAL DESIGN */}
      <div className="absolute inset-0 bg-pattern opacity-[0.05] pointer-events-none mix-blend-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full bg-hh-green/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-hh-pink/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-hh-yellow/10 blur-3xl pointer-events-none" />

      {/* Interactive viewer handles 2, 3, 4, 5, 6 */}
      <InteractiveViewer 
        frontImage={cardImageUrl} 
        backImage={backImageUrl} 
        profile={profile}
      />

      {/* 7 & 8. SHARE CTA & DOWNLOAD */}
      <div className="z-10 flex flex-col items-center w-full max-w-xl">
        <h3 className="font-mono text-sm text-hh-cream/70 mb-4 tracking-widest uppercase">
          Want your own Builder ID?
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/create"
            className="flex-1 flex items-center justify-center px-6 py-4 bg-hh-yellow text-hh-green font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors text-center shadow-lg shadow-hh-yellow/20"
          >
            Create Your Own
          </Link>
          <a
            href={cardImageUrl}
            download={`HH-Goa-2026-${id}.jpeg`}
            className="flex-1 flex items-center justify-center px-6 py-4 bg-transparent border border-hh-pink text-hh-pink font-bold uppercase tracking-wider text-sm hover:bg-hh-pink hover:text-white transition-all text-center"
          >
            Download Front
          </a>
        </div>
      </div>

    </main>
  );
}
