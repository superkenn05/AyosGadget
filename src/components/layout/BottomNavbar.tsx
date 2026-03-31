"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, Lightbulb, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Guides', href: '/guides', icon: Wrench },
  { label: 'AI Fix', href: '/troubleshoot', icon: Lightbulb },
  { label: 'Saved', href: '/bookmarks', icon: Bookmark },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden">
      <div className="glass rounded-[2.5rem] p-2 flex items-center justify-around border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-500 group",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 transition-all duration-500",
                isActive && "neon-glow drop-shadow-[0_0_8px_hsla(190,100%,50%,0.8)]"
              )} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter mt-1 transition-all duration-500",
                isActive ? "opacity-100" : "opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full neon-glow" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
