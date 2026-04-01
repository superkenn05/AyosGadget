'use client';

import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { PRIMARY_CATEGORIES, DIRECTORY_CATEGORIES } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Zap, ArrowRight, Globe, Loader2 } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="relative pt-28 pb-10 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass p-8 md:p-14 rounded-[3xl] border-primary/10 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 scan-line opacity-5" />
            
            <div className="flex flex-col gap-8 relative z-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-[0.2em] text-[9px]">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  {t('home_neural_active')}
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-foreground uppercase">
                  {t('home_title')}
                </h1>
                <p className="text-muted-foreground text-sm md:text-lg font-medium opacity-70 max-w-lg mx-auto leading-relaxed">
                  {t('home_subtitle')}
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-md">
                <Link href="/troubleshoot">
                  <Button className="w-full rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-4 neon-glow border-none">
                    <Cpu className="w-6 h-6" />
                    {t('home_start_scan')}
                  </Button>
                </Link>
                <Link href="/guides">
                   <Button variant="outline" className="w-full h-16 rounded-2xl glass border-primary/20 text-primary hover:bg-primary/5 transition-all hover:scale-[1.02] shadow-lg">
                      <Globe className="w-6 h-6" />
                   </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Modules Section (MGA GAMIT) - Forced 4 Rows (2 Columns for 8 items) */}
      <section className="container mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-12 px-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">{t('home_modules')}</h2>
          <Link href="/guides" className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 group">
            {t('home_global_hub')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-y-12 gap-x-6 max-w-2xl mx-auto">
          {PRIMARY_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name}`} className="group flex flex-col items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-card rounded-[2rem] shadow-xl flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:shadow-2xl border border-black/5 dark:border-white/5">
                <CategoryIcon name={cat.icon} className="w-10 h-10 md:w-14 md:h-14 text-slate-800 dark:text-slate-200" />
              </div>
              <span className="mt-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Auxiliary Directory Section */}
      <section className="container mx-auto px-6 mb-20">
        <div className="flex items-center gap-6 mb-10 px-2">
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('home_auxiliary')}</span>
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-4">
           {DIRECTORY_CATEGORIES.map((item) => (
             <Link key={item.name} href={`/guides?search=${item.name.toLowerCase()}`}>
               <div className="glass h-14 rounded-xl flex items-center group transition-all hover:bg-primary/5 hover:border-primary/20 overflow-hidden shadow-sm border-primary/5">
                  <div className="w-12 h-full flex items-center justify-center bg-primary/10 text-primary font-black text-[9px] border-r border-primary/5">
                    {item.count}
                  </div>
                  <div className="px-4 flex items-center justify-between w-full">
                    <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-primary transition-colors truncate">
                      {item.name}
                    </span>
                  </div>
               </div>
             </Link>
           ))}
        </div>
      </section>

      {/* Trending Protocols Section */}
      <section className="container mx-auto px-6 pb-28">
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">{t('home_trending')}</h2>
          </div>
          <Link href="/guides">
            <Button variant="ghost" className="h-10 rounded-full text-[9px] font-black uppercase tracking-widest gap-2 bg-muted/20 px-5 hover:bg-muted/30">
              {t('home_refresh')} <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-primary/[0.02] rounded-3xl border border-dashed border-primary/10">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-[9px] font-black uppercase tracking-widest opacity-50">{t('common_syncing')}</p>
          </div>
        ) : trendingGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingGuides.map((guide) => (
              <RepairCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="p-16 glass rounded-3xl border-primary/5 text-center shadow-xl">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">{t('common_error_link')}</h2>
            <Button onClick={() => window.location.reload()} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
              {t('common_retry')}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
