import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { REPAIR_CATEGORIES, FEATURED_REPAIRS } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Futuristic Background HUD Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Optimized App-Style Hero Section */}
      <section className="relative pt-32 pb-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass p-8 rounded-[2.5rem] border-primary/10 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 scan-line opacity-10" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em]">
                  <Activity className="w-3 h-3" />
                  Neural System: Online
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                  <span className="text-primary italic neon-text">Ayos</span>
                  <span className="text-foreground">Gadget</span>
                </h1>
                <p className="text-muted-foreground text-sm font-medium opacity-80 max-w-md">
                  AI-driven diagnostics and professional repair protocols for hardware maintenance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link href="/troubleshoot" className="flex-1">
                  <Button className="w-full rounded-2xl h-14 md:h-16 px-8 font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3">
                    <Cpu className="w-4 h-4" />
                    Run Analyzer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Tiles Grid - App Layout style */}
      <section className="container mx-auto px-6 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Modules</h2>
          <Link href="/guides" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">
            All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {REPAIR_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name.toLowerCase()}`}>
              <div className="glass-card p-5 rounded-[2rem] flex flex-col items-center gap-4 transition-all hover:-translate-y-1 active:scale-95 group">
                <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <CategoryIcon name={cat.icon} className="w-6 h-6" />
                </div>
                <span className="font-black text-[9px] uppercase tracking-[0.1em] text-foreground/70 group-hover:text-primary transition-colors">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Priority Protocols - Compact List for App feel */}
      <section className="container mx-auto px-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Priority Protocols</h2>
            <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
          </div>
          <div className="h-px flex-grow mx-4 bg-border/20" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_REPAIRS.map((guide) => (
            <RepairCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>
    </div>
  );
}
