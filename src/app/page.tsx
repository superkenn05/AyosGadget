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
      <section className="relative pt-28 pb-10 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass p-8 md:p-14 rounded-3xl border-primary/10 relative overflow-hidden group shadow-2xl">
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

              <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md">
                <Link href="/troubleshoot" className="flex-1">
                  <Button className="w-full rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-4 neon-glow border-none">
                    <Cpu className="w-6 h-6" />
                    {t('home_start_scan')}
                  </Button>
                </Link>
                <Link href="/guides" className="w-full sm:w-16 h-16 rounded-2xl glass border-primary/20 flex items-center justify-center text-primary hover:bg-primary/10 transition-all hover:scale-105 shadow-lg">
                   <Globe className="w-7 h-7" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Modules Grid (Horizontal Alignment, 2 Rows) */}
      <section className="container mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">{t('home_modules')}</h2>
          </div>
          <Link href="/guides" className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 group">
            {t('home_global_hub')} <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {PRIMARY_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name}`}>
              <div className="glass group relative overflow-hidden rounded-3xl p-4 md:p-6 flex items-center justify-start transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-95 shadow-xl border-primary/10 h-28 md:h-32">
                {/* Icon at Left */}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all relative z-10 shadow-sm shrink-0 mr-4">
                  <CategoryIcon name={cat.icon} className="w-6 h-6 md:w-8 md:h-8" />
                </div>

                {/* Labels at Right of icon */}
                <div className="flex flex-col text-left relative z-10">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mb-1.5">{t('common_module')}</span>
                  <span className="text-xs md:text-lg font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{cat.name}</span>
                </div>
                
                {/* Background Watermark */}
                <div className="absolute -bottom-2 -right-2 opacity-[0.06] dark:opacity-[0.12] group-hover:opacity-[0.2] transition-opacity pointer-events-none scale-110 transform">
                   <CategoryIcon name={cat.icon} className="w-16 h-16 md:w-24 md:h-24" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Directory List */}
      <section className="container mx-auto px-6 mb-20">
        <div className="flex items-center gap-6 mb-10 px-2">
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('home_auxiliary')}</span>
          </div>
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {DIRECTORY_CATEGORIES.map((item) => (
             <Link key={item.name} href={`/guides?search=${item.name.toLowerCase()}`}>
               <div className="glass h-16 rounded-2xl flex items-center group transition-all hover:bg-primary/5 hover:border-primary/20 overflow-hidden shadow-sm">
                  <div className="w-14 h-full flex items-center justify-center bg-primary/10 text-primary font-black text-[10px] border-r border-black/5 dark:border-white/5">
                    {item.count}
                  </div>
                  <div className="px-5 flex items-center justify-between w-full">
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors truncate">{item.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                  </div>
               </div>
             </Link>
           ))}
        </div>
      </section>

      {/* Dynamic Trending Section */}
      <section className="container mx-auto px-6 pb-28">
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-4">
            <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-500">{t('home_trending')}</h2>
          </div>
          <Link href="/guides">
            <Button variant="ghost" className="h-10 rounded-full text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/30 px-6 hover:bg-muted/50 transition-colors">
              {t('home_refresh')} <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/5 dark:bg-white/[0.02] rounded-3xl border border-dashed border-primary/10">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('common_syncing')}</p>
          </div>
        ) : trendingGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {trendingGuides.map((guide) => (
              <RepairCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="p-16 glass rounded-3xl border-primary/5 max-w-2xl mx-auto text-center shadow-2xl">
            <Activity className="w-16 h-16 text-primary/40 mx-auto mb-8" />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">{t('common_error_link')}</h2>
            <p className="text-muted-foreground text-base mb-10 font-medium leading-relaxed">
              {t('common_error_desc')}
            </p>
            <Button onClick={() => window.location.reload()} className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[11px] shadow-lg">
              {t('common_retry')}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
