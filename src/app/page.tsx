import Navbar from '@/components/layout/Navbar';
import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { REPAIR_CATEGORIES, FEATURED_REPAIRS } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Award, ShieldCheck, Zap, Wrench, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-40 md:pb-32">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute -bottom-40 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] -z-10" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-primary text-sm font-bold mb-8 animate-float">
            <Sparkles className="w-4 h-4" />
            Maging Pro sa Pag-aayos ng Gadget
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
            Ayusin ang iyong <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text">
              Gadget sa AI.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            Ang pinaka-modernong platform para sa device repair. Gamit ang interactive AI troubleshooting at step-by-step 3D visual guides.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/guides" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-2xl h-16 px-10 text-xl font-black gap-3 w-full sm:w-auto neon-glow transition-all hover:scale-105 active:scale-95">
                Magsimulang Mag-ayos
                <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
            <Link href="/troubleshoot" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="rounded-2xl h-16 px-10 text-xl font-bold w-full sm:w-auto border-white/10 glass hover:bg-white/10 transition-all">
                Subukan ang Ayos AI
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Gabay sa Pag-aayos', value: '5,000+', icon: Award },
            { label: 'Aktibong Users', value: '200k+', icon: Star },
            { label: 'Gadgets na Na-save', value: '1M+', icon: Zap },
            { label: 'Certified Parts', value: '100%', icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-[2.5rem] text-center hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary neon-glow">
                <stat.icon className="w-7 h-7" />
              </div>
              <p className="text-3xl font-black mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Pumili ng Kategorya</h2>
          <p className="text-muted-foreground text-lg">Anong gadget ang nais mong ayusin ngayong araw?</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {REPAIR_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name.toLowerCase()}`}>
              <div className="group glass p-10 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,242,255,0.15)] hover:-translate-y-2">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:scale-110">
                  <CategoryIcon name={cat.icon} className="w-10 h-10" />
                </div>
                <span className="font-black text-xl">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Repairs */}
      <section className="container mx-auto px-4 pb-32">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Sikat na Tutorial</h2>
            <p className="text-muted-foreground text-lg">Ang mga pinaka-pinagkakatiwalaang gabay ng komunidad.</p>
          </div>
          <Link href="/guides" className="group text-primary font-black text-lg flex items-center gap-2 px-6 py-3 glass rounded-2xl hover:bg-primary/10 transition-all">
            Tingnan lahat
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURED_REPAIRS.map((guide) => (
            <RepairCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      <footer className="bg-background border-t border-white/5 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.5)]">
                <Wrench className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-black text-primary tracking-tighter">AyosGadget</span>
            </div>
            <p className="text-muted-foreground font-medium">© 2025 AyosGadget. Powered by AI ⚡</p>
            <div className="flex gap-10 text-sm font-bold text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">About</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
