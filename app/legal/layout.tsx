import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: true, follow: false },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <div className="max-w-3xl mx-auto px-4 py-12">{children}</div>;
}
