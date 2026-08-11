import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Examples — Hacker House Goa 2026",
};

export default function ExampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
