'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Share2, Bookmark, BookmarkCheck, Loader2, Sparkles, AlertTriangle, Wrench, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/providers/language-provider';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getGuideWithAllSteps } from '@/lib/ifixit-api';
import { translateGuide } from '@/ai/flows/translate-guide-flow';
import { cn } from '@/lib/utils';

export default function GuideDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const [guide, setGuide] = useState<any>(null);
  const [originalGuide, setOriginalGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const translationCache = useRef<Record<string, any>>({});

  const bookmarkRef = useMemo(() => {
    if (!user || !id) return null;
    return doc(db, 'users', user.uid, 'bookmarks', id);
  }, [user, id, db]);

  const { data: bookmark } = useDoc(bookmarkRef);
  const isBookmarked = !!bookmark;

  useEffect(() => {
    async function fetchGuideData() {
      if (!id) return;
      setLoading(true);
      try {
        const fetchedGuide = await getGuideWithAllSteps(id);
        if (fetchedGuide) {
          setOriginalGuide(fetchedGuide);
          setGuide(fetchedGuide);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGuideData();
  }, [id]);

  useEffect(() => {
    async function handleTranslation() {
      if (!originalGuide || language !== 'fil') {
        if (language === 'en' && originalGuide) setGuide(originalGuide);
        return;
      }

      if (translationCache.current[id]) {
        setGuide(translationCache.current[id]);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateGuide({
          title: originalGuide.title,
          description: originalGuide.description,
          steps: originalGuide.steps.map((s: any) => ({ 
            title: s.title || '', 
            description: s.description 
          })),
        });

        const finalGuide = {
          ...originalGuide,
          title: translated.title,
          description: translated.description,
          steps: originalGuide.steps.map((s: any, i: number) => ({
            ...s,
            title: translated.steps[i]?.title || s.title,
            description: translated.steps[i]?.description || s.description,
          }))
        };

        translationCache.current[id] = finalGuide;
        setGuide(finalGuide);
      } catch (error) {
        console.error("Translation failed:", error);
        toast({ title: "Neural Sync Busy", description: "Showing original Taglish context." });
      } finally {
        setIsTranslating(false);
      }
    }
    handleTranslation();
  }, [language, originalGuide, id, toast]);

  const handleBookmark = () => {
    if (!user) {
      toast({ title: t('common_login_required') });
      return;
    }
    if (!guide || !bookmarkRef) return;

    if (isBookmarked) {
      deleteDoc(bookmarkRef);
      toast({ title: "Removed from vault" });
    } else {
      setDoc(bookmarkRef, {
        guideId: id,
        title: guide.title,
        thumbnail: guide.thumbnail || '',
        category: guide.category,
        savedAt: serverTimestamp(),
      });
      toast({ title: "Saved to vault" });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;

  if (!guide) return <div className="min-h-screen flex items-center justify-center"><AlertTriangle className="text-rose-500 mr-2" /> Protocol Offline</div>;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-12">
            <header className="space-y-6">
              <Link href="/guides" className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-8">
                <ArrowLeft className="w-3 h-3" /> {t('guides_back')}
              </Link>
              
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none">{guide.category}</Badge>
                <Badge variant="outline">{guide.difficulty}</Badge>
                {isTranslating && (
                  <div className="flex items-center gap-2 text-primary animate-pulse ml-4">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Link Syncing...</span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                {guide.title}
              </h1>

              {guide.thumbnail && (
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl glass">
                  <Image src={guide.thumbnail} alt={guide.title} fill className="object-cover" priority />
                </div>
              )}

              <p className="text-muted-foreground text-lg leading-relaxed glass p-8 rounded-3xl border-primary/5">
                {guide.description}
              </p>
            </header>

            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">{t('guides_steps')}</h2>
                <div className="h-px flex-grow bg-primary/10" />
                <Badge variant="outline" className="opacity-40">{guide.steps?.length} Hakbang</Badge>
              </div>

              <div className="space-y-12">
                {guide.steps?.map((step: any, index: number) => (
                  <div key={index} className="glass rounded-3xl overflow-hidden border-primary/5 hover:border-primary/20 transition-all">
                    <div className="p-8 md:p-12">
                      <div className="flex items-start gap-6 md:gap-10 mb-8">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 font-black text-xl shadow-lg">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-xl md:text-2xl font-black uppercase mb-4">{step.title || `Hakbang ${index + 1}`}</h3>
                          <div className="text-muted-foreground text-sm md:text-lg whitespace-pre-wrap leading-relaxed">
                            {step.description}
                          </div>
                        </div>
                      </div>
                      
                      {step.imageUrl && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-black/5 dark:border-white/5">
                          <Image src={step.imageUrl} alt={`Step ${index + 1}`} fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8 sticky top-32">
            <div className="flex gap-4">
              <Button onClick={handleBookmark} className="flex-1 rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl">
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                {isBookmarked ? t('guides_saved') : t('guides_save')}
              </Button>
              <Button variant="outline" size="icon" className="rounded-2xl h-16 w-16 glass border-primary/10 text-primary">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="glass rounded-3xl border-primary/5 overflow-hidden p-8">
              <h3 className="font-black uppercase tracking-tight text-sm mb-6 flex items-center gap-3">
                <Wrench className="w-5 h-5 text-primary" />
                {t('guides_tools')}
              </h3>
              <div className="space-y-4">
                {guide.tools?.map((tool: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase text-foreground/70">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {tool.name}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
