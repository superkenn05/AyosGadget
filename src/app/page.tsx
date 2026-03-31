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

      {/* Optimized Hero Section */}
      <section className="relative pt-44 pb-16 md:pt-56 md:pb-32 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10 animate-pulse">
            <Activity className="w-3 h-3" />
            Neural System: Online
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none text-foreground">
              <span className="text-primary italic neon-text">Ayos</span>
              <span className="text-foreground">Gadget</span>
            </h1>
            
            <p className="text-muted-foreground text-xs md:text-sm font-black uppercase tracking-[0.5em] opacity-40">
              Modern Repair Engine
            </p>
            
            <p className="text-muted-foreground text-sm md:text-xl font-medium leading-relaxed max-w-2xl mx-auto opacity-80">
              AI-driven diagnostics and professional repair protocols for high-fidelity hardware maintenance.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 w-full max-w-xl mx-auto">
            <Link href="/guides" className="flex-1">
              <Button className="w-full rounded-[2rem] h-16 md:h-20 font-black uppercase tracking-[0.15em] text-xs bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Initialize Guides
              </Button>
            </Link>
            <Link href="/troubleshoot" className="flex-1">
              <Button variant="outline" className="w-full rounded-[2rem] h-16 md:h-20 font-black uppercase tracking-[0.15em] text-xs border-white/10 glass hover:bg-white/5 active:scale-95 transition-all gap-3 text-foreground">
                <Cpu className="w-5 h-5 text-secondary" />
                Run Analyzer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container mx-auto px-6 mb-24">
        <div className="flex items-center justify-between mb-8 opacity-40">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Active Modules</h2>
          <div className="h-px flex-grow mx-6 bg-border" />
          <Link href="/guides" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">
            Browse All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {REPAIR_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name.toLowerCase()}`}>
              <div className="glass-card p-6 md:p-8 rounded-[2.5rem] flex flex-col items-center gap-5 transition-all hover:-translate-y-2 active:scale-90 group">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-primary/5 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <CategoryIcon name={cat.icon} className="w-6 h-6 md:w-10 md:h-10" />
                </div>
                <span className="font-black text-[10px] uppercase tracking-[0.15em] text-foreground/70 group-hover:text-primary transition-colors">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Protocols */}
      <section className="container mx-auto px-6 pb-32">
        <div className="flex items-center justify-between mb-8 opacity-40">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Priority Protocols</h2>
          <div className="h-px flex-grow mx-6 bg-border" />
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
