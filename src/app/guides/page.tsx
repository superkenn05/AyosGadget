'use client';

import RepairCard from '@/components/repair/RepairCard';
import CategoryIcon from '@/components/repair/CategoryIcon';
import { REPAIR_CATEGORIES } from '@/lib/repair-data';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Sparkles, LayoutGrid, ArrowRight } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
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
    const params = new URLSearchParams(window.location.search);
    if (catName) {
      params.set('category', catName);
      params.delete('search');
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
              <Link href="/troubleshoot">
                <Button variant="outline" className="h-10 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t('guides_neural_ask')}
                </Button>
              </Link>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('guides_search')}
                className="pl-12 h-12 rounded-2xl border-none shadow-sm bg-white dark:bg-white/5 font-bold uppercase tracking-widest text-[10px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Professional Visual Category Cards Grid */}
      {!selectedCategory && !searchQuery && (
        <section className="container mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-8">
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">{t('guides_master_modules')}</span>
             <div className="h-px flex-grow bg-primary/10" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`glass group relative overflow-hidden rounded-[2rem] p-6 text-left transition-all hover:border-primary/50 active:scale-95 flex flex-col justify-between h-40 ${selectedCategory === null ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-black/5 dark:border-white/5'}`}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <LayoutGrid className="w-32 h-32" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none block mb-1">{t('common_system')}</span>
                <span className="text-sm font-black uppercase tracking-tighter">{t('guides_all')}</span>
              </div>
            </button>

            {REPAIR_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`glass group relative overflow-hidden rounded-[2rem] p-6 text-left transition-all hover:border-primary/50 active:scale-95 flex flex-col justify-between h-40 ${selectedCategory === cat.name ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-black/5 dark:border-white/5'}`}
              >
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CategoryIcon name={cat.icon} className="w-32 h-32" />
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedCategory === cat.name ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground group-hover:text-primary'}`}>
                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none block mb-1 opacity-50">{t('common_module')}</span>
                  <span className="text-sm font-black uppercase tracking-tighter">{cat.name}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Category Landing Grid */}
      {categoryWiki && !searchQuery && (
        <section className="container mx-auto px-6 mb-16 animate-in fade-in slide-in-from-bottom-4">
          <div className="glass rounded-[2.5rem] p-8 md:p-12 mb-12 relative overflow-hidden">
            <div className="absolute inset-0 scan-line opacity-5" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => handleCategoryClick(null)} className="h-8 rounded-full px-4 text-[8px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/10">
                    {t('common_exit')}
                  </Button>
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">{categoryWiki.title}</h2>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-xl">{categoryWiki.description}</p>
              </div>
              {categoryWiki.image?.original && (
                <div className="relative h-48 md:h-64">
                  <Image src={categoryWiki.image.original} alt={categoryWiki.title} fill className="object-contain" />
                </div>
              )}
            </div>
          </div>

          {/* Sub-categories Grid */}
          {categoryWiki.children && categoryWiki.children.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {categoryWiki.children.map((child, i) => (
                <Link key={`child-${i}`} href={`/guides?category=${child.title}`}>
                  <div className="glass group rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 transition-all">
                    <div className="relative w-12 h-12">
                      <Image 
                        src={child.image?.thumbnail || 'https://picsum.photos/seed/sub/100/100'} 
                        alt={child.title} 
                        fill 
                        className="object-contain opacity-50 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{child.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Results Grid */}
      <section className="container mx-auto px-6">
        <div className="flex items-center gap-4 mb-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            {searchQuery ? `Results for "${searchQuery}"` : selectedCategory ? `Protocols in "${selectedCategory}"` : 'Library Protocols'}
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
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-6" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('common_syncing')}</p>
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-[3rem] border-dashed border-2">
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
              className="rounded-full h-14 px-12 font-black uppercase tracking-widest text-[10px]"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('guides_access_more')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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
