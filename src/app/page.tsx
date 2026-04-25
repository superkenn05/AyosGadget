'use client';

import CategoryIcon from '@/components/repair/CategoryIcon';
import RepairCard from '@/components/repair/RepairCard';
import { PRIMARY_CATEGORIES, DIRECTORY_CATEGORIES } from '@/lib/repair-data';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Zap, ArrowRight, Globe, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { useState, useEffect } from 'react';
import { getTrendingGuides } from '@/lib/ifixit-api';

export default function Home() {
  const { t, isMounted } = useLanguage();
  const [trendingGuides, setTrendingGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isMounted) return;

    async function fetchTrending() {
      setIsLoading(true);
      setHasError(false);
      try {
        const trending = await getTrendingGuides(0, 6);
        if (trending && trending.length > 0) {
          setTrendingGuides(trending);
        } else if (!trending) {
          setHasError(true);
        }
      } catch (error) {
        console.error("Failed to load trending guides", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrending();
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass p-6 md:p-10 rounded-[2.5rem] border-primary/5 relative overflow-hidden group shadow-xl bg-card/30 backdrop-blur-xl">
            <div className="absolute inset-0 scan-line opacity-[0.03]" />
            
            <div className="flex flex-col gap-6 relative z-10 items-center text-center">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary font-black uppercase tracking-[0.2em] text-[8px]">
                  <Activity className="w-3 h-3 animate-pulse" />
                  {t('home_neural_active')}
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1] text-foreground uppercase max-w-2xl mx-auto">
                  {t('home_title')}
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm font-medium opacity-60 max-w-md mx-auto leading-relaxed">
                  {t('home_subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Link href="/troubleshoot" className="flex-1">
                  <Button className="w-full rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all gap-3 neon-glow border-none">
                    <Cpu className="w-5 h-5" />
                    {t('home_start_scan')}
                  </Button>
                </Link>
                <Link href="/guides" className="flex-1">
                   <Button variant="outline" className="w-full h-14 rounded-2xl glass border-primary/20 text-primary hover:bg-primary/5 transition-all hover:scale-[1.02] shadow-md flex items-center justify-center">
                      <Globe className="w-5 h-5 mr-2" />
                      <span className="font-black uppercase tracking-widest text-[10px]">{t('home_global_hub')}</span>
                   </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Modules */}
      <section className="container mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-10 px-2 max-w-4xl mx-auto">
          <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">{t('home_modules')}</h2>
          <Link href="/guides" className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 group">
            {t('home_global_hub')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-4 gap-y-10 gap-x-4 max-w-4xl mx-auto">
          {PRIMARY_CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/guides?category=${cat.name}`} className="group flex flex-col items-center">
              <div className="w-16 h-16 md:w-28 md:h-28 bg-white dark:bg-card rounded-[1.5rem] md:rounded-[2rem] shadow-lg flex items-center justify-center transition-all group-hover:scale-105 active:scale-95 group-hover:shadow-xl border border-black/5 dark:border-white/5">
                <CategoryIcon name={cat.icon} className="w-6 h-6 md:w-12 md:h-12 text-slate-800 dark:text-slate-200" />
              </div>
              <span className="mt-3 md:mt-4 text-[7px] md:text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors text-center line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Auxiliary Directory */}
      <section className="container mx-auto px-6 mb-20">
        <div className="flex items-center gap-6 mb-10 px-2 max-w-4xl mx-auto">
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">{t('home_auxiliary')}</span>
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
           {DIRECTORY_CATEGORIES.map((item) => (
             <Link key={item.name} href={`/guides?search=${item.name.toLowerCase()}`}>
               <div className="glass h-12 rounded-xl flex items-center group transition-all hover:bg-primary/5 hover:border-primary/20 overflow-hidden shadow-sm border-primary/5">
                  <div className="w-10 h-full flex items-center justify-center bg-primary/10 text-primary font-black text-[8px] border-r border-primary/5">
                    {item.count}
                  </div>
                  <div className="px-4 flex items-center justify-between w-full">
                    <span className="text-[8px] font-black uppercase tracking-widest group-hover:text-primary transition-colors truncate">
                      {item.name}
                    </span>
                  </div>
               </div>
             </Link>
           ))}
        </div>
      </section>

      {/* Trending Protocols */}
      <section className="container mx-auto px-6 pb-28">
        <div className="flex items-center justify-between mb-10 px-2 max-w-4xl mx-auto lg:max-w-none">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">{t('home_trending')}</h2>
          </div>
          <Link href="/guides">
            <Button variant="ghost" className="h-9 rounded-full text-[8px] font-black uppercase tracking-widest gap-2 bg-muted/20 px-4 hover:bg-muted/30">
              {t('home_refresh')} <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        
        <div className="max-w-4xl mx-auto lg:max-w-none">
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
          ) : hasError ? (
            <div className="p-16 glass rounded-3xl border-primary/5 text-center shadow-xl bg-card">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-6 opacity-50" />
              <h2 className="text-xl font-black uppercase tracking-tighter mb-4">{t('common_error_link')}</h2>
              <p className="text-muted-foreground mb-8 text-sm max-w-md mx-auto">{t('common_error_desc')}</p>
              <Button onClick={() => window.location.reload()} className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] neon-glow">
                {t('common_retry')}
              </Button>
            </div>
          ) : (
            <div className="text-center py-20 opacity-30 italic text-[10px] uppercase font-black tracking-widest">
               Walang nakitang protocols sa ngayon.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
