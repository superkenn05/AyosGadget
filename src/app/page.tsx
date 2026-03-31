import Navbar from '@/components/layout/Navbar';
import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { REPAIR_CATEGORIES, FEATURED_REPAIRS } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Mobile-Optimized HUD Hero */}
      <section className="relative pt-24 pb-12 md:pt-40 md:pb-24 overflow-hidden px-6">
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col gap-6 md:gap-10 items-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              <Activity className="w-3 h-3" />
              Neural Link: Active
            </div>
            
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-none text-foreground">
                Modern <br />
                <span className="text-primary neon-text">Repair Engine.</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-xl font-medium leading-relaxed max-w-sm md:max-w-xl">
                AI-driven diagnostics and professional repair protocols for your hardware. High-fidelity guides for everyone.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              <Link href="/guides" className="w-full">
                <Button className="w-full rounded-2xl h-14 md:h-20 font-black uppercase tracking-[0.15em] text-xs md:text-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-all">
                  Initialize System
                </Button>
              </Link>
              <Link href="/troubleshoot" className="w-full">
                <Button variant="outline" className="w-full rounded-2xl h-14 md:h-20 font-black uppercase tracking-[0.15em] text-xs md:text-sm border-black/10 dark:border-white/10 glass active:scale-95 transition-all gap-3">
                  <Cpu className="w-5 h-5 text-secondary" />
                  Run Analyzer
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Ambient Neural Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] -z-10 -translate-x-1/4" />
      </section>

      {/* Systems Grid - Mobile Native Style */}
      <section className="container mx-auto px-6 mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Active Systems</h2>
          <Link href="/guides" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">
            Browse All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {REPAIR_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name.toLowerCase()}`}>
              <div className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col items-center gap-4 transition-all active:scale-90 shadow-sm">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <CategoryIcon name={cat.icon} className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.1em] truncate w-full text-center text-foreground">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Protocols - Scrollable on Mobile */}
      <section className="container mx-auto px-6 pb-24 md:pb-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Priority Protocols</h2>
          <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_REPAIRS.map((guide) => (
            <RepairCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>
    </div>
  );
}