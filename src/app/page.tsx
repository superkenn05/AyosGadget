'use client';

import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { REPAIR_CATEGORIES, FEATURED_REPAIRS } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Zap, ArrowRight, ShieldCheck, Loader2, Globe } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { useState, useEffect } from 'react';
import { getTrendingGuides, mapIFixitToInternal } from '@/lib/ifixit-api';

export default function Home() {
  const { t } = useLanguage();
  const [trendingGuides, setTrendingGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchTrending() {
      setIsLoading(true);
      try {
        const trending = await getTrendingGuides(0, 6);
        setTrendingGuides(trending.map(mapIFixitToInternal));
      } catch (error) {
        console.error("Failed to load trending guides", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Futuristic Background HUD Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Hero: Compact System Dashboard Header */}
      <section className="relative pt-20 pb-6 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass p-8 md:p-12 rounded-[3rem] border-primary/10 relative overflow-hidden group shadow-xl">
            <div className="absolute inset-0 scan-line opacity-5" />
            
            <div className="flex flex-col gap-8 relative z-10 items-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                  <Activity className="w-4 h-4" />
                  System Diagnostics Active
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-foreground">
                  {t('home_title')}
                </h1>
                <p className="text-muted-foreground text-sm font-medium opacity-70 max-w-lg mx-auto">
                  {t('home_subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Link href="/troubleshoot" className="flex-1">
                  <Button className="w-full rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-3">
                    <Cpu className="w-5 h-5" />
                    {t('home_start_scan')}
                  </Button>
                </Link>
                <Link href="/guides" className="w-full sm:w-14 h-14 rounded-2xl glass border-primary/20 flex items-center justify-center text-primary hover:bg-primary/5 transition-colors">
                   <Globe className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="container mx-auto px-6 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">{t('home_modules')}</h2>
          <Link href="/guides" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 group">
            All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
          {REPAIR_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name.toLowerCase()}`}>
              <div className="glass-card p-6 rounded-[2rem] flex flex-col items-center gap-4 transition-all hover:-translate-y-2 active:scale-95 group">
                <div className="w-10 h-10 bg-primary/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                </div>
                <span className="font-black text-[9px] uppercase tracking-tighter text-foreground/70 group-hover:text-primary transition-colors text-center">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="container mx-auto px-6 mb-12">
         <div className="h-px w-full bg-black/5 dark:bg-white/5" />
      </div>

      {/* Dynamic Trending Section */}
      <section className="container mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Trending Protocols</h2>
          </div>
          <Link href="/guides">
            <Button variant="ghost" className="h-8 rounded-full text-[9px] font-black uppercase tracking-widest gap-2">
              Browse More <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-black/5 dark:border-white/10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Syncing Global Datastreams...</p>
          </div>
        ) : trendingGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingGuides.map((guide) => (
              <RepairCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="p-12 glass rounded-[3rem] border-primary/5 max-w-2xl mx-auto text-center">
            <Activity className="w-12 h-12 text-primary/40 mx-auto mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Wala pang Trending</h2>
            <p className="text-muted-foreground mb-8">
              Hindi kami makakonekta sa iFixit library sa ngayon. Pakisuyong i-refresh ang iyong browser.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
