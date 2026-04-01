'use client';

import RepairCard from '@/components/repair/RepairCard';
import CategoryIcon from '@/components/repair/CategoryIcon';
import { REPAIR_CATEGORIES, PRIMARY_CATEGORIES } from '@/lib/repair-data';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Sparkles, LayoutGrid, ArrowRight, Wrench, Activity, AlertTriangle, ChevronDown } from 'lucide-react';
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
    const replacement = globalGuides.filter(g => g.type === 'replacement' || !g.type);
    const teardowns = globalGuides.filter(g => g.type === 'teardown');
    const techniques = globalGuides.filter(g => g.type === 'technique' || g.type === 'troubleshooting');
    return { replacement, teardowns, techniques };
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
    <div className="min-h-screen bg-white dark:bg-background pb-24">
      {/* Search HUD Header */}
      {!selectedCategory && (
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
      )}

      {/* Device Landing Hero - Mimicking iFixit structure */}
      {categoryWiki && (
        <section className="container mx-auto px-4 mb-8 pt-20">
          <div className="bg-white dark:bg-card rounded-3xl p-6 md:p-10 mb-8 border border-slate-100 dark:border-white/10 shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
               {/* Device Image */}
               <div className="md:col-span-4 flex justify-center">
                 <div className="relative aspect-square w-full max-w-[300px]">
                   <Image 
                     src={categoryWiki.image?.original || 'https://picsum.photos/seed/device/400/400'} 
                     alt={categoryWiki.title} 
                     fill 
                     className="object-contain" 
                   />
                 </div>
               </div>
               
               {/* Device Info */}
               <div className="md:col-span-8 space-y-4">
                 <nav className="flex gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4 overflow-x-auto whitespace-nowrap pb-2">
                   <Link href="/guides" className="hover:text-primary">Device</Link>
                   <span>/</span>
                   <span className="text-primary">{categoryWiki.title}</span>
                 </nav>
                 <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">{categoryWiki.title} Repair</h2>
                 <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-3xl">
                   {categoryWiki.description || "Comprehensive repair guides for this device. Follow step-by-step instructions to fix common hardware faults."}
                 </p>
                 <div className="flex flex-wrap gap-3 pt-4">
                    <Button className="rounded-md h-10 px-6 font-bold uppercase tracking-widest text-[10px] bg-[#0071ce] hover:bg-[#005ea8]">
                      Create a Guide
                    </Button>
                    <Button variant="outline" className="rounded-md h-10 px-6 font-bold uppercase tracking-widest text-[10px] border-[#0071ce] text-[#0071ce] hover:bg-blue-50">
                      I Have This
                    </Button>
                 </div>
               </div>
             </div>
          </div>

          {/* Table of Contents Placeholder */}
          <div className="border-y border-slate-100 dark:border-white/10 py-3 mb-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4">
            <span>Table of Contents</span>
            <ChevronDown className="w-4 h-4" />
          </div>

          <h2 className="text-2xl font-black mb-8 px-2">Guides</h2>

          {/* Categorized Sections */}
          <div className="space-y-12">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('common_syncing')}</p>
              </div>
            ) : (
              <>
                {/* 1. Replacement Guides - Grid of Compact Cards */}
                {sections.replacement.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-6 px-2 text-slate-700 dark:text-slate-300">Replacement Guides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sections.replacement.map((guide) => (
                        <RepairCard key={`guide-${guide.id}`} guide={guide} variant="compact" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Teardowns */}
                {sections.teardowns.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-6 px-2 text-slate-700 dark:text-slate-300">Teardowns</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sections.teardowns.map((guide) => (
                        <RepairCard key={`guide-${guide.id}`} guide={guide} variant="compact" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Techniques / Troubleshooting */}
                {sections.techniques.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-6 px-2 text-slate-700 dark:text-slate-300">Techniques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sections.techniques.map((guide) => (
                        <RepairCard key={`guide-${guide.id}`} guide={guide} variant="compact" />
                      ))}
                    </div>
                  </div>
                )}

                {globalGuides.length === 0 && !isLoading && (
                  <div className="text-center py-24 glass rounded-3xl border-dashed border-2 border-primary/10 max-w-2xl mx-auto">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{t('guides_not_found')}</h3>
                    <p className="text-sm text-muted-foreground font-medium opacity-60">{t('guides_adjust')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Main Content for Global View (if no category selected) */}
      {!selectedCategory && (
        <section className="container mx-auto px-6 space-y-24">
          {/* Category Modules */}
          {!searchQuery && (
            <div className="py-12">
              <div className="flex items-center gap-4 mb-10">
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">{t('guides_master_modules')}</span>
                 <div className="h-px flex-grow bg-primary/10" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {PRIMARY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="glass group relative overflow-hidden rounded-3xl p-4 md:p-6 flex items-center justify-start text-left transition-all hover:border-primary/50 active:scale-95 h-28 md:h-32 shadow-xl border-primary/5"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all relative z-10 shadow-sm shrink-0 mr-4">
                      <CategoryIcon name={cat.icon} className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div className="flex flex-col relative z-10">
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-30 leading-none mb-1.5">{t('common_module')}</span>
                      <span className="text-xs md:text-lg font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{cat.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('common_syncing')}</p>
            </div>
          ) : globalGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {globalGuides.map((guide) => (
                <RepairCard key={`guide-${guide.id}`} guide={guide} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 glass rounded-3xl border-dashed border-2 border-primary/10 max-w-2xl mx-auto">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{t('guides_not_found')}</h3>
              <p className="text-sm text-muted-foreground font-medium opacity-60">{t('guides_adjust')}</p>
            </div>
          )}

          {globalGuides.length > 0 && (
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
          )}
        </section>
      )}
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
