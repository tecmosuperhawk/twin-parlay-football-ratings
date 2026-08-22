import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Twin Parlay Ratings",
  description: "College Football Power Ratings • Projections • Edges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white`}
      >
        {/* Site header with logo */}
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
              <Image
                src="/tp-logo.jpg"
                alt="Twin Parlay"
                width={36}
                height={36}
                className="rounded-md"
                priority
              />
              <span className="font-semibold tracking-tight hidden sm:inline">
                Twin Parlay Ratings
              </span>
            </Link>

            <nav className="ml-auto flex items-center gap-5 text-sm">
              <Link href="/ratings" className="text-zinc-400 hover:text-white transition">
                Ratings
              </Link>
              <Link href="/projections" className="text-zinc-400 hover:text-white transition">
                Projections
              </Link>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}