import type { Metadata } from "next";
import { Bodoni_Moda, Space_Mono } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Hacker House Goa 2026 — Builder Identity",
  description: "Upload a photo. Define your stack. Get your official HH Goa 2026 Builder ID instantly. #FrameInGoa",
  // CRITICAL: Next.js needs a metadataBase to resolve relative paths for OG/Twitter images
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"))
  ),
  openGraph: {
    title: "Hacker House Goa 2026 — Builder Identity",
    description: "Meet a builder heading to Hacker House Goa 2026. #FrameInGoa",
    type: "website",
    siteName: "HH Goa 2026 ID Generator",
    locale: "en_US",
    // images are auto-provided by src/app/opengraph-image.tsx (special file convention)
  },
  twitter: {
    card: "summary_large_image",
    title: "Hacker House Goa 2026 — Builder Identity",
    description: "Get your official #FrameInGoa badge instantly.",
    // images are auto-provided by src/app/twitter-image.tsx (special file convention)
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${spaceMono.variable} h-full antialiased`}
    >
      {/* 
        UI Polish: Added selection:bg-hh-pink selection:text-white 
        so text highlighting matches the bold neon brand colors 
      */}
      <body className="min-h-full flex flex-col font-mono bg-[#0A4226] text-hh-cream overflow-x-hidden selection:bg-hh-pink selection:text-white">
        {children}
      </body>
    </html>
  );
}