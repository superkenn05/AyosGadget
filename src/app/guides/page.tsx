
'use client';

import RepairCard from '@/components/repair/RepairCard';
import CategoryIcon from '@/components/repair/CategoryIcon';
import { REPAIR_CATEGORIES, PRIMARY_CATEGORIES } from '@/lib/repair-data';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Sparkles, LayoutGrid, ArrowRight, Wrench, Activity, AlertTriangle } from 'lucide-react';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/language-provider';
import { searchIFixitGuides, getTrendingGuides, mapIFixitToInternal, getIFixitWiki, IFixitWiki } from '@/lib/ifixit-api';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

function GuidesContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [globalGuides, setGlobalGuides] = useState<any[]>([]);
  const [categoryWiki, setCategoryWiki] = useState<IFixitWiki | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);

  const deduplicateGuides = (guides: any[]) => {
    const seen = new Set();
    return guides.filter(guide => {
      const duplicate = seen.has(guide.id);
      seen.add(guide.id);
      return !duplicate;
    });
  };

  const sections = useMemo(() => {
    const replacement = globalGuides.filter(g => g.type === 'replacement' || g.type === 'technique' || !g.type);
    const teardowns = globalGuides.filter(g => g.type === 'teardown');
    const troubleshooting = globalGuides.filter(g => g.type === 'troubleshooting');
    return { replacement, teardowns, troubleshooting };
  }, [globalGuides]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [categoryParam, searchParam]);

  useEffect(() => {
    async function loadCategoryData() {
      setIsLoading(true);
      setPage(0);
      
      try {
        if (selectedCategory) {
          const wiki = await getIFixitWiki(selectedCategory);
          setCategoryWiki(wiki);
          const results = await searchIFixitGuides(selectedCategory);
          setGlobalGuides(deduplicateGuides(results.map(mapIFixitToInternal)));
        } else if (!searchQuery) {
          setCategoryWiki(null);
          const trending = await getTrendingGuides(0, 12);
          setGlobalGuides(deduplicateGuides(trending.map(mapIFixitToInternal)));
        }
      } catch (error) {
        console.error("Error loading category data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategoryData();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsLoading(true);
        setCategoryWiki(null);
        try {
          const results = await searchIFixitGuides(searchQuery);
          setGlobalGuides(deduplicateGuides(results.map(mapIFixitToInternal)));
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      } else if (searchQuery.length === 0 && !selectedCategory) {
        setIsLoading(true);
        try {
          const trending = await getTrendingGuides(0, 12);
          setGlobalGuides(deduplicateGuides(trending.map(mapIFixitToInternal)));
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setIsLoading(true);
    try {
      let more: any[] = [];
      if (selectedCategory || searchQuery) {
        const query = searchQuery || selectedCategory || '';
        more = await searchIFixitGuides(query); 
      } else {
        more = await getTrendingGuides(nextPage * 12, 12);
      }
      
      const mappedMore = more.map(mapIFixitToInternal);
      setGlobalGuides(prev => deduplicateGuides([...prev, ...mappedMore]));
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more guides:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (catName: string | null) => {
    const params = new URLSearchParams();
    if (catName) {
      params.set('category', catName);
    }
    router.push(`/guides?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Search HUD Header */}
      <section className="pt-24 pb-8 px-6 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">{t('guides_title')}</h1>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">{t('guides_subtitle')}</p>
                </div>
              </div>
              <Link href="/troubleshoot">
                <Button variant="outline" className="h-12 rounded-2xl gap-2 text-[10px] font-black uppercase tracking-widest border-primary/20 shadow-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t('guides_neural_ask')}
                </Button>
              </Link>
            </div>

            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder={t('guides_search')}
                className="pl-14 h-14 rounded-2xl border-none shadow-md bg-white dark:bg-white/5 font-bold uppercase tracking-widest text-[10px] focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Modules (Label on Left, Icon on Right) */}
      {!selectedCategory && !searchQuery && (
        <section className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-10">
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">{t('guides_master_modules')}</span>
             <div className="h-px flex-grow bg-primary/10" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {PRIMARY_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`glass group relative overflow-hidden rounded-[2.5rem] p-6 md:p-8 flex items-center justify-between text-left transition-all hover:border-primary/50 active:scale-95 h-32 md:h-40 shadow-xl border-primary/5 ${selectedCategory === cat.name ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : ''}`}
              >
                {/* Labels on Left */}
                <div className="flex flex-col relative z-10 flex-grow pr-4">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-30 leading-none mb-1 md:mb-2">{t('common_module')}</span>
                  <span className="text-xs md:text-lg font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors break-words">{cat.name}</span>
                </div>

                {/* Icon on Right */}
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all relative z-10 shadow-sm shrink-0">
                  <CategoryIcon name={cat.icon} className="w-5 h-5 md:w-8 md:h-8" />
                </div>

                {/* Watermark */}
                <div className="absolute -bottom-4 -right-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none scale-150 transform">
                   <CategoryIcon name={cat.icon} className="w-16 h-16 md:w-24 md:h-24" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Device Landing Hero */}
      {categoryWiki && (
        <section className="container mx-auto px-6 mb-16 animate-in fade-in slide-in-from-bottom-4 pt-12">
          <div className="glass rounded-[3rem] p-8 md:p-12 mb-12 relative overflow-hidden border-primary/10 shadow-2xl">
            <div className="absolute inset-0 scan-line opacity-5" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-center">
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-2">
                   <Button variant="ghost" onClick={() => handleCategoryClick(null)} className="h-10 rounded-full px-5 text-[9px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/10">
                     <ArrowRight className="w-3 h-3 rotate-180 mr-2" /> {t('guides_back')}
                   </Button>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-30">/ {categoryWiki.type}</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">{categoryWiki.title}</h2>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl text-sm md:text-lg">{categoryWiki.description}</p>
                <div className="flex flex-wrap gap-4 pt-4">
                   <Button className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] neon-glow shadow-xl">Initialize Repair</Button>
                   <Button variant="outline" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] border-primary/20 glass">I own this device</Button>
                </div>
              </div>
              {categoryWiki.image?.original && (
                <div className="lg:col-span-4 relative aspect-square">
                  <Image src={categoryWiki.image.original} alt={categoryWiki.title} fill className="object-contain drop-shadow-2xl" />
                </div>
              )}
            </div>
          </div>

          {/* Device Sub-categories */}
          {categoryWiki.children && categoryWiki.children.length > 0 && !searchQuery && (
            <div className="mb-16">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-10 px-2">Sub-Modules Detected</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                 {categoryWiki.children.map((child, i) => (
                   <Link key={`child-${i}`} href={`/guides?category=${child.title}`}>
                     <div className="glass group rounded-[2rem] p-8 h-40 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 transition-all active:scale-95 shadow-lg border-primary/5">
                       <div className="relative w-12 h-12 opacity-40 group-hover:opacity-100 transition-opacity">
                         <Image 
                           src={child.image?.thumbnail || 'https://picsum.photos/seed/sub/100/100'} 
                           alt={child.title} 
                           fill 
                           className="object-contain" 
                         />
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-widest leading-tight line-clamp-2">{child.title}</span>
                     </div>
                   </Link>
                 ))}
               </div>
            </div>
          )}
        </section>
      )}

      {/* Main Content Sections */}
      <section className="container mx-auto px-6 space-y-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('common_syncing')}</p>
          </div>
        ) : globalGuides.length > 0 ? (
          <>
            {/* 1. Replacement Guides (Compact Horizontal) */}
            {sections.replacement.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-12 px-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Replacement Protocols</h3>
                  <div className="h-px flex-grow bg-primary/10" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sections.replacement.map((guide) => (
                    <RepairCard key={`guide-${guide.id}`} guide={guide} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Troubleshooting */}
            {sections.troubleshooting.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-12 px-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">System Troubleshooting</h3>
                  <div className="h-px flex-grow bg-amber-500/10" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {sections.troubleshooting.map((guide) => (
                    <RepairCard key={`guide-${guide.id}`} guide={guide} variant="trouble" />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Teardowns & Advanced */}
            {sections.teardowns.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-12 px-2">
                  <Activity className="w-5 h-5 text-secondary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Advanced Teardowns</h3>
                  <div className="h-px flex-grow bg-secondary/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {sections.teardowns.map((guide) => (
                    <RepairCard key={`guide-${guide.id}`} guide={guide} />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination / Load More */}
            <div className="mt-20 text-center">
              <Button 
                onClick={loadMore} 
                disabled={isLoading}
                variant="outline" 
                className="rounded-full h-16 px-16 font-black uppercase tracking-widest text-[10px] border-primary/20 shadow-xl glass"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-3" />}
                {t('guides_access_more')}
                <ArrowRight className="w-4 h-4 ml-3" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-24 glass rounded-[3rem] border-dashed border-2 border-primary/10 max-w-2xl mx-auto">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{t('guides_not_found')}</h3>
            <p className="text-sm text-muted-foreground font-medium opacity-60">{t('guides_adjust')}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function GuidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
      <GuidesContent />
    </Suspense>
  );
}
