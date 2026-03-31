
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, Cpu, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Neural', href: '/', icon: Home },
  { label: 'Protocols', href: '/guides', icon: Wrench },
  { label: 'Analyze', href: '/troubleshoot', icon: Cpu },
  { label: 'Vault', href: '/bookmarks', icon: Bookmark },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 mb-1",
                isActive && "drop-shadow-[0_0_8px_hsla(190,100%,50%,0.8)]"
              )} />
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full neon-glow" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
