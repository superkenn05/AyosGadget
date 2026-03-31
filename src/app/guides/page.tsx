'use client';

import RepairCard from '@/components/repair/RepairCard';
import { FEATURED_REPAIRS, REPAIR_CATEGORIES } from '@/lib/repair-data';
import { Input } from '@/components/ui/input';
import { Search, Filter, Cpu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/language-provider';

export default function GuidesPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredGuides = FEATURED_REPAIRS.filter((guide) => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         guide.device.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? guide.category.toLowerCase() === selectedCategory.toLowerCase() : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Search HUD Header */}
      <section className="pt-20 pb-6 px-6 sticky top-0 z-30 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">{t('guides_title')}</h1>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">{t('guides_subtitle')}</p>
              </div>
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-primary">
                <Cpu className="w-5 h-5" />
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
      <section className="container mx-auto px-6 mb-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            className={`rounded-full h-9 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === null ? 'neon-glow' : 'border-black/5 dark:border-white/10'}`}
            onClick={() => setSelectedCategory(null)}
          >
            {t('guides_all')}
          </Button>
          {REPAIR_CATEGORIES.map((cat) => (
            <Button
              key={cat.name}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              className={`rounded-full h-9 px-6 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.name ? 'neon-glow' : 'border-black/5 dark:border-white/10'}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Results Grid */}
      <section className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">{t('guides_results')} ({filteredGuides.length})</span>
          <div className="h-px flex-grow bg-black/5 dark:bg-white/10" />
        </div>

        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <RepairCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-[2.5rem] border-dashed border-2 border-black/5 dark:border-white/5">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-black uppercase tracking-tighter mb-2">{t('guides_not_found')}</h3>
            <p className="text-xs text-muted-foreground font-medium">{t('guides_adjust')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
