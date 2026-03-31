"use client";

import Link from 'next/link';
import { Search, Bookmark, Wrench, Menu, User, Lightbulb, LogOut, Terminal, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser, useAuth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
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

  const NavLinks = () => (
    <>
      <Link href="/guides" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all">
        <div className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Wrench className="w-4 h-4" />
        </div>
        Modules
      </Link>
      <Link href="/troubleshoot" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all">
        <div className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Cpu className="w-4 h-4" />
        </div>
        Neural Engine
      </Link>
      <Link href="/bookmarks" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all">
        <div className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Bookmark className="w-4 h-4" />
        </div>
        Vault
      </Link>
    </>
  );

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'h-20 glass' : 'h-28 bg-transparent'}`}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-primary neon-glow flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Terminal className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-primary neon-text leading-none">AYOS</span>
            <span className="text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase opacity-50">Gadget Engine</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-12">
          <NavLinks />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 glass rounded-full border-white/5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Core Secure
          </div>

          <Link href="/guides">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 h-12 w-12 border border-white/5">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full ring-2 ring-primary/20 hover:ring-primary transition-all p-0 overflow-hidden">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-muted">{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 glass mt-4 rounded-3xl p-4 border-white/10" align="right">
                  <div className="p-4 mb-2 border-b border-white/5">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Authenticated as</p>
                    <p className="font-bold truncate">{user.displayName || user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-12 text-rose-400 focus:text-rose-400 focus:bg-rose-400/10 cursor-pointer">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Terminate Session</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} className="rounded-2xl gap-3 px-8 h-12 font-black uppercase tracking-widest text-[10px] neon-glow bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all">
                <User className="w-4 h-4" />
                Auth Sequence
              </Button>
            )}
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-xl bg-white/5 h-12 w-12 border border-white/5">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-l-white/10 w-[300px] p-0">
              <div className="p-10 flex flex-col gap-10 mt-20">
                <NavLinks />
                <div className="h-px bg-white/5 w-full" />
                {!user ? (
                  <Button onClick={handleLogin} className="w-full rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] neon-glow">Initialize Login</Button>
                ) : (
                  <Button onClick={handleLogout} variant="outline" className="w-full rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] text-rose-400 border-rose-400/20 hover:bg-rose-400/10">End Session</Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}