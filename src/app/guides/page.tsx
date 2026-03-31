'use client';

import RepairCard from '@/components/repair/RepairCard';
import { FEATURED_REPAIRS, REPAIR_CATEGORIES } from '@/lib/repair-data';
import { Input } from '@/components/ui/input';
import { Search, Filter, Cpu, Loader2, Globe, ArrowRight, Sparkles, LayoutGrid } from 'lucide-react';
import { useState, useEffect, Suspense, useCallback } from 'react';
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

  // Helper to deduplicate guides by ID
  const deduplicateGuides = (guides: any[]) => {
    const seen = new Set();
    return guides.filter(guide => {
      const duplicate = seen.has(guide.id);
      seen.add(guide.id);
      return !duplicate;
    });
  };

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(categoryParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [categoryParam, searchParam]);

  // Initial load or category change search
  useEffect(() => {
    async function loadCategoryData() {
      setIsLoading(true);
      setPage(0);
      
      try {
        if (selectedCategory) {
          // Fetch Wiki Data for Category Landing Page
          const wiki = await getIFixitWiki(selectedCategory);
          setCategoryWiki(wiki);
          
          // Search specifically for the category
          const results = await searchIFixitGuides(selectedCategory);
          setGlobalGuides(deduplicateGuides(results.map(mapIFixitToInternal)));
        } else if (!searchQuery) {
          // Load trending if nothing selected
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

  // Search logic (debounced)
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
        // Note: Real pagination might need offset param in searchIFixitGuides
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
    const params = new URLSearchParams(window.location.search);
    if (catName) {
      params.set('category', catName);
    } else {
      params.delete('category');
    }
    router.push(`/guides?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Search HUD Header */}
      <section className="pt-24 pb-6 px-6 sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tighter uppercase leading-none">{t('guides_title')}</h1>
                  <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1">{t('guides_subtitle')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/troubleshoot">
                  <Button variant="outline" className="h-10 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Neural Ask
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={t('guides_search')}
                className="pl-12 h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-white/5 font-bold uppercase tracking-widest text-[10px] placeholder:opacity-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Category Chips */}
      <section className="container mx-auto px-6 py-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className={`rounded-full h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === null ? 'neon-glow' : 'border-black/5 dark:border-white/10'}`}
            onClick={() => handleCategoryClick(null)}
          >
            {t('guides_all')}
          </Button>
          {REPAIR_CATEGORIES.map((cat) => (
            <Button
              key={cat.name}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              className={`rounded-full h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.name ? 'neon-glow' : 'border-black/5 dark:border-white/10'}`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Category Landing Page Content */}
      {categoryWiki && !searchQuery && (
        <section className="container mx-auto px-6 mb-12">
          <div className="glass rounded-[3rem] p-8 md:p-12 border-primary/10 overflow-hidden relative">
            <div className="absolute inset-0 scan-line opacity-5" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  <Globe className="w-3 h-3" />
                  System Directory: {categoryWiki.title}
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight">
                  {categoryWiki.title} <span className="text-primary">Repair</span>
                </h2>
                <p className="text-muted-foreground text-sm md:text-lg font-medium leading-relaxed max-w-2xl">
                  {categoryWiki.description}
                </p>
              </div>
              <div className="lg:col-span-4 flex justify-center">
                {categoryWiki.image?.original && (
                  <div className="relative w-48 h-48 md:w-64 md:h-64 group">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <Image 
                      src={categoryWiki.image.original} 
                      alt={categoryWiki.title} 
                      fill 
                      className="object-contain relative z-10 filter drop-shadow-2xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-categories Grid */}
          {categoryWiki.children && categoryWiki.children.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-xl font-black uppercase tracking-tighter">{categoryWiki.children.length} Sub-Modules</h3>
                <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {categoryWiki.children.map((child, i) => (
                  <Link key={`child-${i}-${child.title}`} href={`/guides?category=${encodeURIComponent(child.title)}`}>
                    <div className="glass-card p-6 rounded-[2rem] flex flex-col items-center text-center gap-4 group hover:border-primary/50 transition-all">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 mb-2">
                        <Image 
                          src={child.image?.thumbnail || 'https://picsum.photos/seed/sub/200/200'} 
                          alt={child.title} 
                          fill 
                          className="object-contain group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tight leading-tight">{child.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Results Grid */}
      <section className="container mx-auto px-6">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px w-8 bg-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            {searchQuery ? `Search Results for "${searchQuery}"` : categoryWiki ? 'Linked Protocols' : 'Global Datastreams'}
          </h3>
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
        </div>

        {globalGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {globalGuides.map((guide) => (
              <RepairCard key={`guide-${guide.id}`} guide={guide} />
            ))}
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 glass rounded-[3rem] border-dashed border-2">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Syncing with iFixit Core...</p>
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-[3rem] border-dashed border-2 border-black/5 dark:border-white/5">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-black uppercase tracking-tighter mb-2">{t('guides_not_found')}</h3>
            <p className="text-xs text-muted-foreground font-medium">{t('guides_adjust')}</p>
          </div>
        )}

        {globalGuides.length > 0 && (
          <div className="mt-16 text-center">
            <Button 
              onClick={loadMore} 
              disabled={isLoading}
              variant="outline" 
              className="rounded-full h-14 px-12 font-black uppercase tracking-[0.2em] text-[10px] border-primary/20 hover:border-primary group"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Access More Protocols
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function GuidesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <GuidesContent />
    </Suspense>
  );
}
