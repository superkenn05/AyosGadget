
'use client';

import RepairCard from '@/components/repair/RepairCard';
import CategoryIcon from '@/components/repair/CategoryIcon';
import { PRIMARY_CATEGORIES } from '@/lib/repair-data';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Sparkles, ChevronRight, ChevronLeft, Layers, Wrench, LayoutGrid } from 'lucide-react';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/language-provider';
import { searchIFixitGuides, getTrendingGuides, getIFixitWiki } from '@/lib/ifixit-api';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

function GuidesContent() {
  const { t, isMounted } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [globalGuides, setGlobalGuides] = useState<any[]>([]);
  const [categoryWiki, setCategoryWiki] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);

  const deduplicateGuides = (guides: any[]) => {
    const seen = new Set();
    return (guides || []).filter(guide => {
      if (!guide || !guide.id) return false;
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
          setGlobalGuides(deduplicateGuides(results));
        } else if (!searchQuery) {
          setCategoryWiki(null);
          const trending = await getTrendingGuides(0, 12);
          setGlobalGuides(deduplicateGuides(trending));
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
        const queryStr = searchQuery || selectedCategory || '';
        more = await searchIFixitGuides(queryStr); 
      } else {
        more = await getTrendingGuides(nextPage * 12, 12);
      }
      
      setGlobalGuides(prev => deduplicateGuides([...prev, ...more]));
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

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <section className="pt-24 pb-8 px-6">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{t('guides_title')}</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60 mt-1">{t('guides_subtitle')}</p>
              </div>
            </div>
            <Link href="/troubleshoot">
              <Button variant="outline" className="rounded-xl h-10 px-4 gap-2 text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">
                <Sparkles className="w-3 h-3" />
                {t('guides_neural_ask')}
              </Button>
            </Link>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('guides_search')}
              className="pl-14 h-14 rounded-2xl border-none shadow-md bg-white dark:bg-card font-bold uppercase tracking-widest text-[10px] focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {selectedCategory && (
        <section className="container mx-auto px-4">
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

              {(globalGuides.length > 0) && (
                <div className="space-y-16">
                  <div className="flex items-center gap-4 px-2">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">REPAIR PROTOCOLS</h2>
                    <div className="h-px flex-grow bg-slate-100 dark:bg-white/5" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {globalGuides.map((guide) => (
                      <RepairCard key={`guide-${guide.id}`} guide={guide} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {!selectedCategory && (
        <section className="container mx-auto px-6 space-y-12">
          {!searchQuery && (
            <div>
              <div className="flex items-center gap-4 mb-8 px-2">
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">{t('guides_master_modules')}</span>
                 <div className="h-px flex-grow bg-primary/10" />
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                {PRIMARY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="group relative bg-white dark:bg-card p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center gap-4 md:gap-6 shadow-md border border-transparent hover:border-primary/20 transition-all active:scale-95 text-left overflow-hidden h-24 md:h-28"
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
                      <CategoryIcon name={cat.icon} className="w-20 h-20 md:w-24 md:h-24" />
                    </div>
                    <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                      <CategoryIcon name={cat.icon} className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div className="relative z-10 flex flex-col">
                      <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Module</span>
                      <span className="text-xs md:text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none">{cat.name}</span>
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
            <div className="space-y-12">
               <div className="flex items-center gap-4 px-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">REPLACEMENT PROTOCOLS</h2>
                  <div className="h-px flex-grow bg-primary/10" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {globalGuides.map((guide) => (
                  <RepairCard key={`guide-${guide.id}`} guide={guide} variant="compact" />
                ))}
              </div>
            </div>
          ) : null}

          {globalGuides.length > 0 && (
            <div className="mt-12 text-center">
              <Button 
                onClick={loadMore} 
                disabled={isLoading}
                variant="outline" 
                className="rounded-full h-12 px-8 font-black uppercase tracking-widest text-[9px] border-primary/20 shadow-md glass"
              >
                {isLoading && <Loader2 className="w-3 h-3 animate-spin mr-3" />}
                {t('guides_access_more')}
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
