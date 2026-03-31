
import Navbar from '@/components/layout/Navbar';
import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { REPAIR_CATEGORIES, FEATURED_REPAIRS } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Award, ShieldCheck, Zap, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full border-primary/20 text-primary bg-primary/5">
              Maging Pro sa Pag-aayos
            </Badge>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Ayusin ang iyong gadgets sa <span className="text-primary">simpleng paraan.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              Step-by-step guides, tools, at AI support para sa iyong mga smartphones, laptops, at appliances. Tipid na, eco-friendly pa!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/guides">
                <Button size="lg" className="rounded-2xl h-14 px-8 text-lg gap-2 w-full sm:w-auto">
                  Tingnan ang mga Gabay
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/troubleshoot">
                <Button size="lg" variant="outline" className="rounded-2xl h-14 px-8 text-lg w-full sm:w-auto border-2">
                  Mag-troubleshoot gamit ang AI
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] -z-10" />
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Gabay sa Pag-aayos', value: '5,000+', icon: Award },
            { label: 'Aktibong Users', value: '200k+', icon: Star },
            { label: 'Gadgets na Na-save', value: '1M+', icon: Zap },
            { label: 'Certified Parts', value: '100%', icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Pumili ng Kategorya</h2>
            <p className="text-muted-foreground">Hanapin ang tamang gabay base sa iyong device.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {REPAIR_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name.toLowerCase()}`}>
              <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <CategoryIcon name={cat.icon} className="w-8 h-8" />
                </div>
                <span className="font-bold text-lg">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Repairs */}
      <section className="container mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Sikat na mga Pag-aayos</h2>
            <p className="text-muted-foreground">Mga gabay na madalas gamitin ng ating komunidad.</p>
          </div>
          <Link href="/guides" className="text-primary font-bold flex items-center gap-1 hover:underline">
            Tingnan lahat
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED_REPAIRS.map((guide) => (
            <RepairCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Wrench className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-primary">AyosGadget</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 AyosGadget. Gawa sa Pilipinas 🇵🇭</p>
            <div className="flex gap-6 text-sm font-medium text-muted-foreground">
              <Link href="#" className="hover:text-primary">Tungkol sa Amin</Link>
              <Link href="#" className="hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary">Makipag-ugnayan</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Minimal Badge helper locally since UI badge is already provided
function Badge({ children, variant, className }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
