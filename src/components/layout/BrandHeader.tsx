"use client";

import Link from 'next/link';
import { Terminal } from 'lucide-react';

export default function BrandHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-safe pointer-events-none">
      <div className="container mx-auto px-6 h-16 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2 pointer-events-auto glass px-4 py-1.5 rounded-full border-primary/10 shadow-lg group">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center neon-glow group-hover:scale-110 transition-transform">
            <Terminal className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter text-primary neon-text uppercase leading-none">
              AyosGadget
            </span>
            <span className="text-[6px] font-black tracking-[0.3em] text-muted-foreground/50 uppercase leading-none mt-0.5">
              Neural Engine
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
