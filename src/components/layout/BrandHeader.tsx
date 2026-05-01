
"use client";

import Logo from '@/components/layout/Logo';
import { Activity, Wifi } from 'lucide-react';

export default function BrandHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-background/50 backdrop-blur-md border-b border-black/5 dark:border-white/5">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-2 group active:scale-95 transition-transform">
          <Logo compact={false} withLink />
        </div>

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
