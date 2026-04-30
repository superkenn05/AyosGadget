
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bookmark, BookmarkCheck, Wrench, CheckCircle2, AlertTriangle, Sparkles, Languages } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/providers/language-provider';
import { useEffect, useState } from 'react';
import { getGuideWithAllSteps } from '@/lib/ifixit-api';
import { translateGuide, type TranslateGuideOutput } from '@/ai/flows/translate-guide-flow';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function GuideDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t, language, isMounted } = useLanguage();
  
  const [guide, setGuide] = useState<any>(null);
  const [translatedGuide, setTranslatedGuide] = useState<TranslateGuideOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  const globalGuideRef = useMemoFirebase(() => {
    if (!id || !db) return null;
    return doc(db, 'repairGuides', id);
  }, [id, db]);

  const bookmarkRef = useMemoFirebase(() => {
    if (!user || !id || !db) return null;
    return doc(db, 'users', user.uid, 'savedGuides', id);
  }, [user, id, db]);

  const { data: cachedGuide } = useDoc(globalGuideRef);
  const { data: bookmark } = useDoc(bookmarkRef);
  const isBookmarked = !!bookmark;

  useEffect(() => {
    async function fetchAndCacheGuide() {
      if (!id) return;
      
      if (cachedGuide && cachedGuide.steps && cachedGuide.steps.length > 0) {
        setGuide(cachedGuide);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedGuide = await getGuideWithAllSteps(id);
        if (fetchedGuide) {
          setGuide(fetchedGuide);
          if (db && user) {
             const guideRef = doc(db, 'repairGuides', id);
             setDoc(guideRef, {
               ...fetchedGuide,
               syncedAt: serverTimestamp(),
               authorId: 'system_ifixit'
             }, { merge: true }).catch(() => {});
          }
        }
      } catch (error) {
        console.error("Fetch from iFixit failed:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (isMounted) {
      fetchAndCacheGuide();
    }
  }, [id, isMounted, cachedGuide, db, user]);

  useEffect(() => {
    async function handleAITranslation() {
      if (language === 'fil' && guide && !translatedGuide && !isTranslating) {
        setIsTranslating(true);
        try {
          const result = await translateGuide({
            title: guide.title,
            description: guide.description,
            steps: guide.steps?.map((s: any) => ({
              title: s.title || '',
              description: s.description || ''
            }))
          });
          
          if (result && (result.title !== guide.title || result.description !== guide.description)) {
            setTranslatedGuide(result);
          }
        } catch (error) {
          console.error("Translation failed", error);
        } finally {
          setIsTranslating(false);
        }
      }
    }
    
    if (isMounted && guide) {
      handleAITranslation();
    }
  }, [language, guide, translatedGuide, isTranslating, isMounted]);

  const handleBookmark = () => {
    if (!user) {
      toast({ title: t('common_login_required') });
      return;
    }
    if (!guide || !bookmarkRef) return;

    if (isBookmarked) {
      deleteDoc(bookmarkRef).catch(() => {});
      toast({ title: "Removed from vault" });
    } else {
      setDoc(bookmarkRef, {
        id: id,
        userId: user.uid,
        repairGuideId: id,
        title: guide.title,
        thumbnail: guide.thumbnail || '',
        category: guide.category,
        savedAt: serverTimestamp(),
      }).catch(() => {});
      toast({ title: "Saved to vault" });
    }
  };

  if (!isMounted) return null;

  if (loading && !guide) return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-6">
               <Skeleton className="h-4 w-32" />
               <div className="flex gap-2">
                 <Skeleton className="h-5 w-20 rounded-full" />
                 <Skeleton className="h-5 w-20 rounded-full" />
               </div>
               <Skeleton className="h-16 md:h-24 w-full" />
               <Skeleton className="aspect-video w-full rounded-3xl" />
               <div className="space-y-4 pt-8">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-40 w-full rounded-3xl" />
               </div>
            </div>
            <div className="space-y-10 pt-10">
               <Skeleton className="h-10 w-48" />
               {[...Array(3)].map((_, i) => (
                 <Skeleton key={i} className="h-96 w-full rounded-[2.5rem]" />
               ))}
            </div>
          </div>
          <aside className="lg:col-span-4 space-y-8 sticky top-32">
             <Skeleton className="h-20 w-full rounded-[1.5rem]" />
             <Skeleton className="h-64 w-full rounded-[2.5rem]" />
          </aside>
        </div>
      </div>
    </div>
  );

  if (!guide) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <AlertTriangle className="text-rose-500 w-12 h-12 mb-4" /> 
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Protocol Offline</h2>
      <p className="text-muted-foreground mb-8">Hindi namin mahanap ang gabay na ito.</p>
      <Link href="/guides">
        <Button variant="outline" className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
          Bumalik sa Aklatan
        </Button>
      </Link>
    </div>
  );

  const showTranslated = language === 'fil';
  const displayTitle = showTranslated ? (translatedGuide?.title || guide.title) : guide.title;
  const displayDescription = showTranslated ? (translatedGuide?.description || guide.description) : guide.description;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-12">
            <header className="space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/guides" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <ArrowLeft className="w-3 h-3" /> {t('guides_back')}
                </Link>
                <div className="flex items-center gap-4">
                  {isTranslating && (
                    <div className="flex items-center gap-2 text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      Neural Translating...
                    </div>
                  )}
                  {showTranslated && (
                    <div className="flex items-center gap-2 text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      <Languages className="w-3 h-3" />
                      Neural Sync Active
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[8px]">{guide.category}</Badge>
                <Badge variant="outline" className="font-black uppercase tracking-widest text-[8px]">{guide.difficulty}</Badge>
              </div>

              <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                {showTranslated && isTranslating && !translatedGuide ? <Skeleton className="h-16 w-full" /> : displayTitle}
              </h1>

              {guide.thumbnail && (
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl glass border-primary/5">
                  <Image src={guide.thumbnail} alt={guide.title} fill className="object-cover" priority />
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">BEFORE YOU BEGIN</h2>
                <div className="text-muted-foreground text-sm md:text-xl whitespace-pre-wrap leading-relaxed font-medium glass p-8 rounded-3xl border-primary/5 min-h-[100px]">
                  {showTranslated && isTranslating && !translatedGuide ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  ) : displayDescription}
                </div>
              </div>
            </header>

            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">{t('guides_steps')}</h2>
                <div className="h-px flex-grow bg-primary/10" />
                <Badge variant="outline" className="opacity-40 font-black text-[10px]">{guide.steps?.length} {t('guides_step_title')}</Badge>
              </div>

              <div className="space-y-12">
                {guide.steps?.map((step: any, index: number) => {
                  const keyboardKey = `manual_step_keyboard_lombard`;
                  const macbookKey = `manual_step_macbook_screws`;
                  
                  const isKeyboardStep = step.description?.includes("expansion bay modules") || step.description?.includes("ribbed tabs");
                  const isMacbookStep = step.description?.includes("securing the lower case to the MacBook Pro");

                  let stepDescription = step.description;
                  let stepTitle = step.title;
                  let isContentReady = true;

                  if (showTranslated) {
                    if (isKeyboardStep) {
                      stepDescription = t(keyboardKey);
                    } else if (isMacbookStep) {
                      stepDescription = t(macbookKey);
                    } else if (translatedGuide?.steps?.[index]) {
                      stepDescription = translatedGuide.steps[index].description;
                      stepTitle = translatedGuide.steps[index].title || stepTitle;
                    } else {
                      isContentReady = false;
                    }
                  }

                  return (
                    <div key={index} className="glass rounded-[2.5rem] overflow-hidden border-primary/5 hover:border-primary/20 transition-all group">
                      <div className="p-8 md:p-14">
                        <div className="flex items-start gap-6 md:gap-12 mb-10">
                          <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 font-black text-xl md:text-3xl shadow-xl neon-glow">
                            {index + 1}
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-6">
                              {!isContentReady ? <Skeleton className="h-8 w-48" /> : (stepTitle || t('guides_step_title') + ` ${index + 1}`)}
                            </h3>
                            <div className="text-muted-foreground text-sm md:text-xl whitespace-pre-wrap leading-relaxed font-medium">
                              {!isContentReady ? (
                                <div className="space-y-3">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-2/3" />
                                </div>
                              ) : stepDescription}
                            </div>
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
            </div>

            <div className="glass rounded-[2.5rem] border-primary/5 overflow-hidden p-10">
              <h3 className="font-black uppercase tracking-[0.1em] text-xs mb-8 flex items-center gap-4 text-primary">
                <Wrench className="w-6 h-6" />
                {t('guides_tools')}
              </h3>
              <div className="space-y-5">
                {guide.tools?.length > 0 ? (
                  guide.tools.map((tool: any, i: number) => (
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
