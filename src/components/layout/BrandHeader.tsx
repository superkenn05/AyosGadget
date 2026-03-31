
"use client";

import Link from 'next/link';
import { Terminal, Activity, Wifi } from 'lucide-react';

export default function BrandHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-background/50 backdrop-blur-md border-b border-black/5 dark:border-white/5">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center gap-2 group active:scale-95 transition-transform">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_10px_hsla(190,100%,40%,0.3)] group-hover:scale-105 transition-transform">
            <Terminal className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-foreground uppercase leading-none">
              Ayos<span className="text-primary">Gadget</span>
            </span>
            <span className="text-[7px] font-black tracking-[0.2em] text-muted-foreground/60 uppercase leading-none mt-0.5">
              Neural Engine
            </span>
          </div>
        </Link>

        {/* Right: Mock System Indicators for Professional App Feel */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground/40">
            <Wifi className="w-3 h-3" />
            <Activity className="w-3 h-3" />
          </div>
        </div>
      </div>
    </header>
  );
}
