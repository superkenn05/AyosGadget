
"use client";

import Link from 'next/link';
import { Terminal } from 'lucide-react';

export default function BrandHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-safe pointer-events-none">
      <div className="container mx-auto px-6 h-16 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2 pointer-events-auto glass px-4 py-1.5 rounded-full border-primary/10 shadow-lg">
          <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center neon-glow">
            <Terminal className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-sm font-black tracking-tighter text-primary neon-text uppercase">
            AyosGadget
          </span>
        </Link>
      </div>
    </div>
  );
}
