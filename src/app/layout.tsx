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
        {/* Simple top bar */}
        <div className="max-w-6xl mx-auto px-4 pt-5 pb-2 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/tp-logo.jpg"
              alt="Twin Parlay"
              width={40}
              height={40}
              className="rounded-md"
              priority
            />
            <span className="font-semibold tracking-tight text-lg">
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

        {children}
      </body>
    </html>
  );
}