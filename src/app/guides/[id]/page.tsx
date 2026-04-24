'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Share2, Bookmark, BookmarkCheck, Loader2, Sparkles, AlertTriangle, Wrench, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/providers/language-provider';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getGuideWithAllSteps } from '@/lib/ifixit-api';
import { translateGuide } from '@/ai/flows/translate-guide-flow';
import Image from 'next/image';

export default function GuideDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const [isMounted, setIsMounted] = useState(false);
  const [originalGuide, setOriginalGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Per-item translation state
  const [translatedMeta, setTranslatedMeta] = useState<{ title?: string; description?: string } | null>(null);
  const [translatedSteps, setTranslatedSteps] = useState<Record<number, { title?: string; description: string }>>({});
  const translationCache = useRef<Record<string, any>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bookmarkRef = useMemo(() => {
    if (!user || !id || !db) return null;
    return doc(db, 'users', user.uid, 'bookmarks', id);
  }, [user, id, db]);

  const { data: bookmark } = useDoc(bookmarkRef);
  const isBookmarked = !!bookmark;

  // 1. Initial Fetch (English)
  useEffect(() => {
    async function fetchGuideData() {
      if (!id) return;
      setLoading(true);
      try {
        const fetchedGuide = await getGuideWithAllSteps(id);
        if (fetchedGuide) {
          setOriginalGuide(fetchedGuide);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGuideData();
  }, [id]);

  // 2. Progressive Translation Effect
  useEffect(() => {
    if (!originalGuide || language !== 'fil') {
      setTranslatedMeta(null);
      setTranslatedSteps({});
      return;
    }

    const cacheKey = `${id}-fil`;
    if (translationCache.current[cacheKey]) {
      const cached = translationCache.current[cacheKey];
      setTranslatedMeta(cached.meta);
      setTranslatedSteps(cached.steps);
      return;
    }

    async function startProgressiveTranslation() {
      // Step A: Translate Title & Description
      try {
        const metaRes = await translateGuide({
          title: originalGuide.title,
          description: originalGuide.description
        });
        const nextMeta = { title: metaRes.title, description: metaRes.description };
        setTranslatedMeta(nextMeta);
        
        // Update cache partially
        translationCache.current[cacheKey] = {
          meta: nextMeta,
          steps: {}
        };
      } catch (e) {
        console.error("Meta translation error", e);
        setTranslatedMeta({ title: originalGuide.title, description: originalGuide.description });
      }

      // Step B: Translate each step one-by-one
      const steps = originalGuide.steps || [];
      for (let i = 0; i < steps.length; i++) {
        try {
          const stepRes = await translateGuide({
            steps: [{ title: steps[i].title, description: steps[i].description }]
          });
          if (stepRes.steps?.[0]) {
            setTranslatedSteps(prev => {
              const next = { ...prev, [i]: stepRes.steps![0] };
              // Update cache fully
              translationCache.current[cacheKey] = {
                meta: translationCache.current[cacheKey]?.meta,
                steps: next
              };
              return next;
            });
          }
        } catch (e) {
          console.error(`Step ${i} translation error`, e);
          setTranslatedSteps(prev => ({ ...prev, [i]: { description: steps[i].description } }));
        }
      }
    }

    startProgressiveTranslation();
  }, [language, originalGuide, id]);

  const handleBookmark = () => {
    if (!user) {
      toast({ title: t('common_login_required') });
      return;
    }
    if (!originalGuide || !bookmarkRef) return;

    if (isBookmarked) {
      deleteDoc(bookmarkRef).catch(() => {});
      toast({ title: "Removed from vault" });
    } else {
      setDoc(bookmarkRef, {
        guideId: id,
        title: originalGuide.title,
        thumbnail: originalGuide.thumbnail || '',
        category: originalGuide.category,
        savedAt: serverTimestamp(),
      }).catch(() => {});
      toast({ title: "Saved to vault" });
    }
  };

  if (!isMounted) return null;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary w-12 h-12 mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('common_syncing')}</p>
    </div>
  );

  if (!originalGuide) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AlertTriangle className="text-rose-500 mr-2" /> 
      <span className="font-black uppercase tracking-tighter">Protocol Offline</span>
    </div>
  );

  const displayTitle = (language === 'fil' ? translatedMeta?.title : originalGuide.title) || originalGuide.title;
  const displayDesc = (language === 'fil' ? translatedMeta?.description : originalGuide.description) || originalGuide.description;
  const isTranslatingMeta = language === 'fil' && !translatedMeta;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-12">
            <header className="space-y-6">
              <Link href="/guides" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-3 h-3" /> {t('guides_back')}
              </Link>
              
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[8px]">{originalGuide.category}</Badge>
                <Badge variant="outline" className="font-black uppercase tracking-widest text-[8px]">{originalGuide.difficulty}</Badge>
                {language === 'fil' && (
                  <Badge className="bg-amber-500/10 text-amber-500 border-none font-black uppercase tracking-widest text-[8px] animate-pulse">
                    <Sparkles className="w-2 h-2 mr-1" /> Neural Sync Active
                  </Badge>
                )}
              </div>

              {isTranslatingMeta ? (
                <Skeleton className="h-12 w-3/4 rounded-xl" />
              ) : (
                <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                  {displayTitle}
                </h1>
              )}

              {originalGuide.thumbnail && (
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl glass border-primary/5">
                  <Image src={originalGuide.thumbnail} alt={originalGuide.title} fill className="object-cover" priority />
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">BEFORE YOU BEGIN</h2>
                <div className="text-muted-foreground text-sm md:text-xl whitespace-pre-wrap leading-relaxed font-medium glass p-8 rounded-3xl border-primary/5 min-h-[100px]">
                  {isTranslatingMeta ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  ) : displayDesc}
                </div>
              </div>
            </header>

            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">{t('guides_steps')}</h2>
                <div className="h-px flex-grow bg-primary/10" />
                <Badge variant="outline" className="opacity-40 font-black text-[10px]">{originalGuide.steps?.length} {t('guides_step_title')}</Badge>
              </div>

              <div className="space-y-12">
                {originalGuide.steps?.map((step: any, index: number) => {
                  const isStepTranslated = language !== 'fil' || !!translatedSteps[index];
                  const currentStep = language === 'fil' ? translatedSteps[index] : step;

                  return (
                    <div key={`${index}-${language}`} className="glass rounded-[2.5rem] overflow-hidden border-primary/5 hover:border-primary/20 transition-all group">
                      <div className="p-8 md:p-14">
                        <div className="flex items-start gap-6 md:gap-12 mb-10">
                          <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 font-black text-xl md:text-3xl shadow-xl neon-glow">
                            {index + 1}
                          </div>
                          <div className="flex-grow">
                            {!isStepTranslated ? (
                              <div className="space-y-4">
                                <Skeleton className="h-8 w-1/2 rounded-lg" />
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-3/4" />
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-6">
                                  {currentStep?.title || (language === 'en' ? `Step ${index + 1}` : `Hakbang ${index + 1}`)}
                                </h3>
                                <div className="text-muted-foreground text-sm md:text-xl whitespace-pre-wrap leading-relaxed font-medium">
                                  {currentStep?.description}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {step.imageUrl && (
                          <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 bg-black/5">
                            <Image src={step.imageUrl} alt={`Step ${index + 1}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8 sticky top-32">
            <div className="flex gap-4">
              <Button onClick={handleBookmark} className="flex-1 rounded-[1.5rem] h-20 font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-2xl neon-glow border-none">
                {isBookmarked ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                {isBookmarked ? t('guides_saved') : t('guides_save')}
              </Button>
              <Button variant="outline" size="icon" className="rounded-[1.5rem] h-20 w-20 glass border-primary/10 text-primary hover:bg-primary/5 transition-all">
                <Share2 className="w-6 h-6" />
              </Button>
            </div>

            <div className="glass rounded-[2.5rem] border-primary/5 overflow-hidden p-10">
              <h3 className="font-black uppercase tracking-[0.1em] text-xs mb-8 flex items-center gap-4 text-primary">
                <Wrench className="w-6 h-6" />
                {t('guides_tools')}
              </h3>
              <div className="space-y-5">
                {originalGuide.tools?.length > 0 ? (
                  originalGuide.tools.map((tool: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {tool.name}
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-black uppercase opacity-30 italic">Standard hardware kit required</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
