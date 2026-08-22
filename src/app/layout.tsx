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
        <header className="border-b border-zinc-800 bg-zinc-900">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/tp-logo.jpg"
                alt="Twin Parlay"
                width={34}
                height={34}
                className="rounded-md"
                priority
              />
              <span className="font-semibold tracking-tight text-white text-[15px]">
                Twin Parlay Ratings
              </span>
            </Link>

            <nav className="ml-auto flex items-center gap-6 text-sm font-medium">
              <Link href="/ratings" className="text-zinc-300 hover:text-white">
                Ratings
              </Link>
              <Link href="/projections" className="text-zinc-300 hover:text-white">
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