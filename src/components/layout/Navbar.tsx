
"use client";

import Link from 'next/link';
import { User, LogOut, Terminal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 pt-safe ${scrolled ? 'h-16 glass' : 'h-20 bg-transparent'}`}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary neon-glow flex items-center justify-center transition-transform">
            <Terminal className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-primary neon-text leading-none">AYOS</span>
            <span className="text-[8px] font-black tracking-[0.3em] text-muted-foreground uppercase opacity-50">GADGET ENGINE</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/guides">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 h-10 w-10 border border-white/5">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-1 ring-primary/20 p-0 overflow-hidden active:scale-90 transition-all">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback className="bg-muted">{user.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass mt-2 rounded-2xl p-2 border-white/10" align="right">
                <div className="p-3 mb-1 border-b border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Session Active</p>
                  <p className="text-xs font-bold truncate">{user.displayName || user.email}</p>
                </div>
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-10 text-rose-400 focus:text-rose-400 focus:bg-rose-400/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Terminate</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} className="rounded-xl gap-2 px-4 h-10 font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground active:scale-95 transition-all">
              <User className="w-4 h-4" />
              Auth
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
