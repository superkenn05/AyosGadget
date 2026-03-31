
import Navbar from '@/components/layout/Navbar';
import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { REPAIR_CATEGORIES, FEATURED_REPAIRS } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cpu, Activity, Zap, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* HUD Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full glass border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">
              <Activity className="w-3 h-3" />
              Neural Link: Stable
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter leading-[1.1]">
                Modern <br />
                <span className="text-primary neon-text">Repair Engine.</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xs">
                AI-driven diagnostics and pro-grade repair protocols for your electronics.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/guides">
                <Button className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-all">
                  Initialize
                </Button>
              </Link>
              <Link href="/troubleshoot">
                <Button variant="outline" className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-white/10 glass active:scale-95 transition-all gap-2">
                  <Cpu className="w-4 h-4 text-secondary" />
                  Analyze
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Neural Ambient Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] -z-10 -translate-x-1/4" />
      </section>

      {/* Categories Grid - App Style */}
      <section className="container mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Systems</h2>
          <Link href="/guides" className="text-[10px] font-black text-primary uppercase tracking-widest">Browse All</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {REPAIR_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name.toLowerCase()}`}>
              <div className="glass-card p-5 rounded-3xl flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                  <CategoryIcon name={cat.icon} className="w-6 h-6" />
                </div>
                <span className="font-bold text-[10px] uppercase tracking-tighter truncate w-full text-center">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Protocols */}
      <section className="container mx-auto px-6 pb-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Protocols</h2>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="space-y-6">
          {FEATURED_REPAIRS.map((guide) => (
            <RepairCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>
    </div>
  );
}
