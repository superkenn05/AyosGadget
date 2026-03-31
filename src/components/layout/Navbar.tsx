"use client";

import Link from 'next/link';
import { Search, Bookmark, Wrench, Menu, User, Lightbulb, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser, useAuth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

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
      <Link href="/guides" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-all hover:scale-105">
        <Wrench className="w-4 h-4" />
        Mga Gabay
      </Link>
      <Link href="/troubleshoot" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-all hover:scale-105">
        <Lightbulb className="w-4 h-4" />
        Troubleshoot
      </Link>
      <Link href="/bookmarks" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-all hover:scale-105">
        <Bookmark className="w-4 h-4" />
        Naka-save
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-2xl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary neon-glow flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-primary neon-text">AyosGadget</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <NavLinks />
        </div>

        <div className="flex items-center gap-3">
          <Link href="/guides">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full ring-2 ring-primary/20 hover:ring-primary transition-all">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                      <AvatarFallback className="bg-muted">{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="right">
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-400 focus:text-rose-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Mag-logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} variant="default" className="rounded-2xl gap-2 px-8 h-12 font-bold neon-glow">
                <User className="w-4 h-4" />
                Mag-login
              </Button>
            )}
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-xl bg-white/5">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-l-white/10">
              <div className="flex flex-col gap-8 mt-12">
                <NavLinks />
                {!user ? (
                  <Button onClick={handleLogin} className="w-full rounded-2xl h-14 font-bold neon-glow">Mag-login</Button>
                ) : (
                  <Button onClick={handleLogout} variant="outline" className="w-full rounded-2xl h-14 font-bold text-rose-400 border-rose-400/20 hover:bg-rose-400/10">Mag-logout</Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
