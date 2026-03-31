'use client';

import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { PRIMARY_CATEGORIES, DIRECTORY_CATEGORIES } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Zap, ArrowRight, Globe, Loader2, List } from 'lucide-react';
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
      {/* Hero: Compact System Dashboard Header */}
      <section className="relative pt-24 pb-8 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="glass p-8 md:p-16 rounded-[3rem] border-primary/10 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 scan-line opacity-5" />
            
            <div className="flex flex-col gap-10 relative z-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                  <Activity className="w-4 h-4 animate-pulse" />
                  {t('home_neural_active')}
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-foreground uppercase">
                  {t('home_title')}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base font-medium opacity-70 max-w-xl mx-auto">
                  {t('home_subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
                <Link href="/troubleshoot" className="flex-1">
                  <Button className="w-full rounded-[2rem] h-16 px-10 font-black uppercase tracking-widest text-xs bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all gap-4 neon-glow">
                    <Cpu className="w-6 h-6" />
                    {t('home_start_scan')}
                  </Button>
                </Link>
                <Link href="/guides" className="w-full sm:w-16 h-16 rounded-[2rem] glass border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-all hover:scale-105">
                   <Globe className="w-7 h-7" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mini-Modules Grid (Compact Icons) */}
      <section className="container mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">{t('home_modules')}</h2>
          </div>
          <Link href="/guides" className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 group">
            {t('home_global_hub')} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
          {PRIMARY_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name}`}>
              <div className="flex flex-col items-center gap-3 group transition-all">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl glass border-primary/5 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 group-hover:scale-110 active:scale-90 transition-all shadow-sm">
                  <CategoryIcon name={cat.icon} className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter text-center leading-tight opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Directory List */}
      <section className="container mx-auto px-6 mb-20">
        <div className="flex items-center gap-4 mb-10 px-4">
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
          <div className="flex items-center gap-3">
             <List className="w-4 h-4 text-muted-foreground/50" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">{t('home_auxiliary')}</span>
          </div>
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {DIRECTORY_CATEGORIES.map((item) => (
             <Link key={item.name} href={`/guides?search=${item.name.toLowerCase()}`}>
               <div className="glass h-16 rounded-2xl flex items-center group transition-all hover:bg-primary/5 hover:border-primary/20">
                  <div className="w-16 h-full flex items-center justify-center bg-primary/10 text-primary font-black text-[10px] border-r border-black/5 dark:border-white/5">
                    {item.count}
                  </div>
                  <div className="px-6 flex items-center justify-between w-full">
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">{item.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                  </div>
               </div>
             </Link>
           ))}
        </div>
      </section>

      {/* Dynamic Trending Section */}
      <section className="container mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-amber-500">{t('home_trending')}</h2>
          </div>
          <Link href="/guides">
            <Button variant="ghost" className="h-10 rounded-full text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/30">
              {t('home_refresh')} <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/5 dark:bg-white/[0.02] rounded-[4rem] border border-dashed border-primary/10">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('common_syncing')}</p>
          </div>
        ) : trendingGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingGuides.map((guide) => (
              <RepairCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="p-16 glass rounded-[4rem] border-primary/5 max-w-2xl mx-auto text-center">
            <Activity className="w-16 h-16 text-primary/40 mx-auto mb-8" />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">{t('common_error_link')}</h2>
            <p className="text-muted-foreground mb-10 font-medium">
              {t('common_error_desc')}
            </p>
            <Button onClick={() => window.location.reload()} className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest">{t('common_retry')}</Button>
          </div>
        )}
      </section>
    </div>
  );
}
