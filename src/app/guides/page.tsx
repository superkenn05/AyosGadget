'use client';

import RepairCard from '@/components/repair/RepairCard';
import CategoryIcon from '@/components/repair/CategoryIcon';
import { REPAIR_CATEGORIES, PRIMARY_CATEGORIES } from '@/lib/repair-data';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Sparkles, LayoutGrid, ArrowRight, Wrench, ChevronRight, ChevronLeft, ChevronDown, Layers } from 'lucide-react';
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
          // 1. Fetch Wiki Data (to see children/sub-categories)
          const wiki = await getIFixitWiki(selectedCategory);
          setCategoryWiki(wiki);
          
          // 2. Fetch Guides associated with this category/device
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

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background pb-24">
      {/* Search Header */}
      <section className="pt-24 pb-4 px-6 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="container mx-auto max-w-4xl">
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
      </section>

      {/* Deeply Nested Category Navigation */}
      {selectedCategory && (
        <section className="container mx-auto px-4 mt-8">
          {/* Breadcrumbs for tracking depth */}
          <nav className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-8 px-2 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/guides" className="hover:text-primary transition-colors">LIBRARY</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-primary truncate">{selectedCategory}</span>
          </nav>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('common_syncing')}</p>
            </div>
          ) : (
            <>
              {categoryWiki && (
                <div className="bg-white dark:bg-card rounded-3xl p-6 md:p-10 mb-12 border border-slate-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-4 left-4">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="text-[9px] font-black uppercase tracking-widest gap-2 h-8 rounded-xl">
                      <ChevronLeft className="w-3 h-3" /> Back
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-8 md:pt-0">
                    <div className="md:col-span-4 flex justify-center">
                      <div className="relative aspect-square w-full max-w-[200px]">
                        <Image 
                          src={categoryWiki.image?.original || 'https://picsum.photos/seed/device/400/400'} 
                          alt={categoryWiki.title} 
                          fill 
                          className="object-contain" 
                        />
                      </div>
                    </div>
                    <div className="md:col-span-8 space-y-4 text-center md:text-left">
                      <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none uppercase">{categoryWiki.title}</h2>
                      <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed max-w-2xl line-clamp-3">
                        {categoryWiki.description || "Browse technical manuals, teardowns, and maintenance protocols for this module."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Infinite Sub-Modules/Categories Grid */}
              {categoryWiki?.children && categoryWiki.children.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-4 mb-10 px-2">
                    <div className="flex items-center gap-2">
                       <Layers className="w-4 h-4 text-primary" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">SELECT SUB-MODULE</h3>
                    </div>
                    <div className="h-px flex-grow bg-primary/10" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categoryWiki.children.map((child: any) => (
                      <button
                        key={child.title}
                        onClick={() => handleCategoryClick(child.title)}
                        className="group flex flex-col items-center gap-3 active:scale-95 transition-transform"
                      >
                        <div className="relative aspect-square w-full bg-white dark:bg-card border border-black/5 dark:border-white/10 rounded-[2rem] shadow-lg overflow-hidden p-6 flex items-center justify-center group-hover:border-primary/50 transition-all">
                          {child.image?.thumbnail ? (
                            <Image 
                              src={child.image.thumbnail} 
                              alt={child.title} 
                              fill 
                              className="object-contain p-4 group-hover:scale-110 transition-transform" 
                            />
                          ) : (
                            <Wrench className="w-10 h-10 text-muted-foreground/20" />
                          )}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tight text-center line-clamp-2 group-hover:text-primary transition-colors">
                          {child.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Guides categorized by type - Nested View */}
              {(globalGuides.length > 0) && (
                <div className="space-y-16">
                  <div className="flex items-center gap-4 px-2">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">REPAIR PROTOCOLS</h2>
                    <div className="h-px flex-grow bg-slate-100 dark:bg-white/5" />
                  </div>

                  {sections.replacement.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pl-4 border-l-4 border-primary">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Replacement Guides</h3>
                        <span className="text-[8px] font-black text-primary uppercase opacity-40">{sections.replacement.length} manual(s)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sections.replacement.map((guide) => (
                          <RepairCard key={`guide-${guide.id}`} guide={guide} variant="compact" />
                        ))}
                      </div>
                    </div>
                  )}

                  {sections.teardowns.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pl-4 border-l-4 border-amber-500">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Teardowns</h3>
                        <span className="text-[8px] font-black text-amber-500 uppercase opacity-40">{sections.teardowns.length} manual(s)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sections.teardowns.map((guide) => (
                          <RepairCard key={`guide-${guide.id}`} guide={guide} variant="compact" />
                        ))}
                      </div>
                    </div>
                  )}

                  {sections.techniques.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pl-4 border-l-4 border-emerald-500">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Techniques</h3>
                        <span className="text-[8px] font-black text-emerald-500 uppercase opacity-40">{sections.techniques.length} manual(s)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sections.techniques.map((guide) => (
                          <RepairCard key={`guide-${guide.id}`} guide={guide} variant="compact" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {globalGuides.length === 0 && !categoryWiki?.children?.length && !isLoading && (
                <div className="text-center py-24 glass rounded-[3rem] border-dashed border-2 border-primary/10 max-w-2xl mx-auto">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{t('guides_not_found')}</h3>
                  <p className="text-sm text-muted-foreground font-medium opacity-60">{t('guides_adjust')}</p>
                  <Button onClick={handleBack} className="mt-8 rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest">
                    Go Back
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Global Landing View */}
      {!selectedCategory && (
        <section className="container mx-auto px-6 space-y-16 mt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{t('guides_title')}</h1>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-4">{t('guides_subtitle')}</p>
            </div>
            <Link href="/troubleshoot">
              <Button className="rounded-2xl h-14 px-8 gap-3 text-[10px] font-black uppercase tracking-widest bg-primary neon-glow shadow-xl">
                <Sparkles className="w-5 h-5" />
                {t('guides_neural_ask')}
              </Button>
            </Link>
          </div>

          {!searchQuery && (
            <div>
              <div className="flex items-center gap-4 mb-10 px-2">
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">{t('guides_master_modules')}</span>
                 <div className="h-px flex-grow bg-primary/10" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {PRIMARY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="glass group relative overflow-hidden rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all hover:border-primary/50 active:scale-95 shadow-xl border-primary/5 bg-white dark:bg-card h-48 md:h-64"
                  >
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all relative z-10 shadow-sm mb-6">
                      <CategoryIcon name={cat.icon} className="w-8 h-8 md:w-12 md:h-12" />
                    </div>
                    <span className="text-xs md:text-lg font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{cat.name}</span>
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
            <div className="space-y-12">
               <div className="flex items-center gap-4 px-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">TRENDING PROTOCOLS</h2>
                  <div className="h-px flex-grow bg-primary/10" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {globalGuides.map((guide) => (
                  <RepairCard key={`guide-${guide.id}`} guide={guide} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 glass rounded-[3rem] border-dashed border-2 border-primary/10 max-w-2xl mx-auto">
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
                <ChevronRight className="w-4 h-4 ml-3" />
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
