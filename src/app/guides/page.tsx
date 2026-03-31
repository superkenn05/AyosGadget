'use client';

import RepairCard from '@/components/repair/RepairCard';
import { FEATURED_REPAIRS, REPAIR_CATEGORIES } from '@/lib/repair-data';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredGuides = FEATURED_REPAIRS.filter((guide) => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         guide.device.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? guide.category.toLowerCase() === selectedCategory.toLowerCase() : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center pt-8">
          <h1 className="text-4xl font-extrabold mb-4">Mga Gabay sa Pag-aayos</h1>
          <p className="text-xl text-muted-foreground">
            Hanapin ang tamang tutorial para sa iyong gadget.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Maghanap ng device o sira..."
              className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white dark:bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className="rounded-xl h-14 whitespace-nowrap"
              onClick={() => setSelectedCategory(null)}
            >
              Lahat
            </Button>
            {REPAIR_CATEGORIES.map((cat) => (
              <Button
                key={cat.name}
                variant={selectedCategory === cat.name ? "default" : "outline"}
                className="rounded-xl h-14 whitespace-nowrap"
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide) => (
              <RepairCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-card rounded-3xl border border-dashed">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Walang nahanap na gabay</h3>
            <p className="text-muted-foreground">Subukang baguhin ang iyong search o kategorya.</p>
          </div>
        )}
      </div>
    </div>
  );
}
