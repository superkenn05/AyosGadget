import Navbar from '@/components/layout/Navbar';
import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { REPAIR_CATEGORIES, FEATURED_REPAIRS } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Award, ShieldCheck, Zap, Wrench, Sparkles, Cpu, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] mb-10 animate-pulse">
              <Activity className="w-4 h-4" />
              System Status: Optimal ⚡
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9] max-w-5xl">
              Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary neon-text">
                Repairing.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-2xl text-muted-foreground/80 mb-14 leading-relaxed font-medium">
              Diagnose electronic issues in seconds using our neural network troubleshooting engine. Pro-grade guides for everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center w-full">
              <Link href="/guides" className="w-full sm:w-auto">
                <Button size="lg" className="rounded-full h-20 px-12 text-2xl font-black gap-4 w-full sm:w-auto neon-glow bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all">
                  Get Started
                  <ArrowRight className="w-7 h-7" />
                </Button>
              </Link>
              <Link href="/troubleshoot" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="rounded-full h-20 px-12 text-2xl font-bold w-full sm:w-auto border-white/20 glass hover:bg-white/10 transition-all gap-4">
                  <Cpu className="w-7 h-7 text-secondary" />
                  Ask Ayos AI
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[160px] -z-10" />
        <div className="absolute -bottom-20 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px] -z-10" />
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 mb-40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Repair Guides', value: '5,000+', icon: Award, color: 'text-primary' },
            { label: 'Active Users', value: '200k+', icon: Star, color: 'text-secondary' },
            { label: 'Devices Saved', value: '1M+', icon: Zap, color: 'text-amber-400' },
            { label: 'Success Rate', value: '98%', icon: ShieldCheck, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="glass p-10 rounded-[3rem] text-center border-white/5 hover:border-white/20 transition-all duration-500 group">
              <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <p className="text-4xl font-black mb-2 tracking-tighter">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mb-40">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">Core Systems</h2>
            <p className="text-muted-foreground text-xl leading-relaxed">Select a device category to initialize the repair sequence.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {REPAIR_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name.toLowerCase()}`}>
              <div className="group glass p-12 rounded-[3rem] flex flex-col items-center text-center transition-all duration-500 hover:ring-1 hover:ring-primary/50 hover:-translate-y-4">
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-2xl">
                  <CategoryIcon name={cat.icon} className="w-12 h-12" />
                </div>
                <span className="font-black text-2xl tracking-tighter group-hover:text-primary transition-colors">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Repairs */}
      <section className="container mx-auto px-4 pb-40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20">
          <div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">Top Protocols</h2>
            <p className="text-muted-foreground text-xl">The most deployed repair procedures this week.</p>
          </div>
          <Link href="/guides">
            <Button variant="outline" className="rounded-full h-16 px-10 text-lg font-black glass border-white/10 hover:bg-white/5 gap-3">
              View All Modules
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {FEATURED_REPAIRS.map((guide) => (
            <RepairCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      <footer className="bg-background border-t border-white/5 py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-primary/30 shadow-lg">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-3xl font-black text-primary tracking-tighter">AyosGadget</span>
            </div>
            <p className="text-muted-foreground font-bold tracking-tight">© 2025 Neural Repair Systems. Operating under Protocol AI.</p>
            <div className="flex gap-12 text-sm font-black uppercase tracking-widest text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Manifesto</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Uptime</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}