
import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { REPAIR_CATEGORIES, FEATURED_REPAIRS } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Futuristic Background HUD Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Hero: Compact System Dashboard Header */}
      <section className="relative pt-20 pb-6 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass p-6 rounded-[2rem] border-primary/10 relative overflow-hidden group shadow-lg">
            <div className="absolute inset-0 scan-line opacity-5" />
            
            <div className="flex flex-col gap-6 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[9px]">
                  <Activity className="w-3 h-3" />
                  System Diagnostics Active
                </div>
                <h1 className="text-3xl font-black tracking-tight leading-none text-foreground">
                  Neural <span className="text-primary italic">Analyzer</span>
                </h1>
                <p className="text-muted-foreground text-xs font-medium opacity-70">
                  Ready for hardware maintenance protocols and AI-driven troubleshooting.
                </p>
              </div>

              <div className="flex gap-3">
                <Link href="/troubleshoot" className="flex-1">
                  <Button className="w-full rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[9px] bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-2">
                    <Cpu className="w-4 h-4" />
                    Start Scan
                  </Button>
                </Link>
                <div className="w-12 h-12 rounded-xl glass border-primary/20 flex items-center justify-center text-primary">
                   <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container mx-auto px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Available Modules</h2>
          <Link href="/guides" className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group">
            All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {REPAIR_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name.toLowerCase()}`}>
              <div className="glass-card p-4 rounded-3xl flex flex-col items-center gap-3 transition-all hover:-translate-y-1 active:scale-95 group">
                <div className="w-10 h-10 bg-primary/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                </div>
                <span className="font-black text-[8px] uppercase tracking-tighter text-foreground/70 group-hover:text-primary transition-colors">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Priority List */}
      <section className="container mx-auto px-6 pb-24">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-3 h-3 text-amber-500" />
          <h2 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Priority Protocols</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_REPAIRS.map((guide) => (
            <RepairCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>
    </div>
  );
}
