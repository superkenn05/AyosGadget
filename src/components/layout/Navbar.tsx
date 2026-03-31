
"use client";

import Link from 'next/link';
import { Search, Bookmark, Wrench, Menu, User, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link href="/guides" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <Wrench className="w-4 h-4" />
        Mga Gabay
      </Link>
      <Link href="/troubleshoot" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <Lightbulb className="w-4 h-4" />
        Troubleshoot
      </Link>
      <Link href="/bookmarks" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <Bookmark className="w-4 h-4" />
        Naka-save
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">AyosGadget</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          
          <div className="hidden md:block">
            <Button variant="default" className="rounded-full gap-2 px-6">
              <User className="w-4 h-4" />
              Mag-login
            </Button>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-10">
                <NavLinks />
                <Button className="w-full mt-4 rounded-xl">Mag-login</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
