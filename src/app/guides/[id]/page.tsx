'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Bookmark, BookmarkCheck, Loader2, Sparkles, AlertTriangle, Wrench, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/providers/language-provider';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getGuideWithAllSteps } from '@/lib/ifixit-api';
import { translateGuide } from '@/ai/flows/translate-guide-flow';

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
  const [translatedVersion, setTranslatedVersion] = useState<string | null>(null);
  const translationCache = useRef<Record<string, Record<string, any>>>({});

  const bookmarkRef = useMemo(() => {
    if (!user || !id) return null;
    return doc(db, 'users', user.uid, 'bookmarks', id);
  }, [user, id, db]);

  const { data: bookmark } = useDoc(bookmarkRef);
  const isBookmarked = !!bookmark;

  // 1. Initial Data Fetch
  useEffect(() => {
    async function fetchGuideData() {
      if (!id) return;
      setLoading(true);
      try {
        const fetchedGuide = await getGuideWithAllSteps(id);
        if (fetchedGuide) {
          setOriginalGuide(fetchedGuide);
          if (language === 'en') {
            setGuide(fetchedGuide);
            setTranslatedVersion('en');
          }
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGuideData();
  }, [id, language]);

  // 2. Handle Translation with Zero-Leakage English Logic
  useEffect(() => {
    async function handleTranslation() {
      if (!originalGuide) return;

      if (language === 'en') {
        setGuide(originalGuide);
        setTranslatedVersion('en');
        setIsTranslating(false);
        return;
      }

      // Check Cache
      if (translationCache.current[id]?.[language]) {
        setGuide(translationCache.current[id][language]);
        setTranslatedVersion(language);
        setIsTranslating(false);
        return;
      }

      // Force UI back to skeleton for Filipino to ensure zero English leakage
      setGuide(null);
      setTranslatedVersion(null);
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

        if (!translated) throw new Error("Translation failed");

        const finalGuide = {
          ...originalGuide,
          title: translated.title || originalGuide.title,
          description: translated.description || originalGuide.description,
          steps: originalGuide.steps.map((s: any, i: number) => ({
            ...s,
            title: translated.steps?.[i]?.title || s.title,
            description: translated.steps?.[i]?.description || s.description,
          }))
        };

        if (!translationCache.current[id]) translationCache.current[id] = {};
        translationCache.current[id][language] = finalGuide;
        
        setGuide(finalGuide);
        setTranslatedVersion(language);
      } catch (error) {
        console.error("Translation Engine Failure:", error);
        toast({
          variant: "destructive",
          title: "Neural Sync Error",
          description: "Hindi ma-translate ang manual sa ngayon. Pakisubukang i-refresh."
        });
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

  // CRITICAL: Stay in skeleton if Filipino is selected but translation isn't 100% verified as 'fil'
  const showSkeleton = loading || isTranslating || (language === 'fil' && translatedVersion !== 'fil');

  if (showSkeleton) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative">
        <Loader2 className="animate-spin text-primary w-16 h-16 mb-6" />
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
      </div>
      <div className="text-center space-y-4">
        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">
          {language === 'fil' ? 'NEURAL TRANSLATION PROTOCOL...' : t('common_syncing')}
        </p>
        {language === 'fil' && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
              Hinihimay ang bawat hakbang...
            </p>
            <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em]">Raon/Greenhills Technician Mode: ON</p>
          </div>
        )}
      </div>
    </div>
  );

  if (!guide) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AlertTriangle className="text-rose-500 mr-2" /> 
      <span className="font-black uppercase tracking-tighter">Protocol Offline</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32" key={`${id}-${language}`}>
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-12">
            <header className="space-y-6">
              <Link href="/guides" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-3 h-3" /> {t('guides_back')}
              </Link>
              
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[8px]">{guide.category}</Badge>
                <Badge variant="outline" className="font-black uppercase tracking-widest text-[8px]">{guide.difficulty}</Badge>
              </div>

              <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                {guide.title}
              </h1>

              {guide.thumbnail && (
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl glass border-primary/5">
                  <Image src={guide.thumbnail} alt={guide.title} fill className="object-cover" priority />
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">BEFORE YOU BEGIN</h2>
                <div className="text-muted-foreground text-sm md:text-xl whitespace-pre-wrap leading-relaxed font-medium glass p-8 rounded-3xl border-primary/5">
                  {guide.description}
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
                {guide.steps?.map((step: any, index: number) => (
                  <div key={`${id}-${index}-${language}`} className="glass rounded-[2.5rem] overflow-hidden border-primary/5 hover:border-primary/20 transition-all group">
                    <div className="p-8 md:p-14">
                      <div className="flex items-start gap-6 md:gap-12 mb-10">
                        <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 font-black text-xl md:text-3xl shadow-xl neon-glow">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-6">
                            {language === 'en' ? `Step ${index + 1}` : `Hakbang ${index + 1}`}
                          </h3>
                          <div className="text-muted-foreground text-sm md:text-xl whitespace-pre-wrap leading-relaxed font-medium">
                            {step.description}
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
                ))}
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
