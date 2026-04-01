'use client';

import { FEATURED_REPAIRS } from '@/lib/repair-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Wrench, ArrowLeft, Star, MessageCircle, Share2, Bookmark, BookmarkCheck, Loader2, Sparkles, AlertTriangle, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useLanguage } from '@/components/providers/language-provider';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getIFixitGuide, mapIFixitToInternal, getIFixitWiki } from '@/lib/ifixit-api';
import { translateGuide } from '@/ai/flows/translate-guide-flow';
import { Skeleton } from '@/components/ui/skeleton';

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const [guide, setGuide] = useState<any>(null);
  const [originalGuide, setOriginalGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const translationRef = useRef<string | null>(null);

  // Memoize document reference for bookmarks
  const bookmarkRef = useMemo(() => {
    if (!user || !guide?.id) return null;
    return doc(db, 'users', user.uid, 'bookmarks', guide.id);
  }, [user, guide?.id, db]);

  const { data: bookmark } = useDoc(bookmarkRef);
  const isBookmarked = !!bookmark;

  // Initial Fetch: Full Guide Fetch including Steps
  useEffect(() => {
    async function fetchGuide() {
      if (!id) return;
      setLoading(true);
      try {
        let fetchedGuide = null;
        
        const local = FEATURED_REPAIRS.find((g) => g.id === id);
        if (local) {
          fetchedGuide = local;
        } else {
          const ifixit = await getIFixitGuide(id);
          if (ifixit) {
            fetchedGuide = mapIFixitToInternal(ifixit);
          } else {
            const wiki = await getIFixitWiki(id);
            if (wiki) {
              router.replace(`/guides?category=${encodeURIComponent(id)}`);
              return;
            }
          }
        }
        
        if (fetchedGuide) {
          setOriginalGuide(fetchedGuide);
          setGuide(fetchedGuide);
        }
      } catch (error) {
        console.error("Neural Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGuide();
  }, [id, router]);

  // AI Live Translation for Step-by-Step Instructions
  useEffect(() => {
    async function handleTranslation() {
      if (!originalGuide || !originalGuide.steps || originalGuide.steps.length === 0) return;
      
      // Prevent multiple concurrent translations or re-translating if already in target language
      const translationKey = `${id}-${language}`;
      if (translationRef.current === translationKey) return;

      if (language === 'fil' && guide?.language !== 'fil') {
        setIsTranslating(true);
        translationRef.current = translationKey;
        try {
          const translated = await translateGuide({
            title: originalGuide.title,
            description: originalGuide.description,
            steps: originalGuide.steps.map((s: any) => ({ 
              title: s.title || '', 
              description: s.description 
            })),
          });

          if (translated) {
            setGuide({
              ...originalGuide,
              title: translated.title,
              description: translated.description,
              steps: originalGuide.steps.map((s: any, i: number) => ({
                ...s,
                title: translated.steps[i]?.title || s.title,
                description: translated.steps[i]?.description || s.description,
              })),
              language: 'fil'
            });
          }
        } catch (error: any) {
          console.error("AI Translation failed:", error);
          translationRef.current = null;
          toast({ 
            variant: "destructive", 
            title: "Neural Link Busy", 
            description: "Limitado ang AI quota sa ngayon. Pakisubukan muli makalipas ang ilang sandali." 
          });
        } finally {
          setIsTranslating(false);
        }
      } else if (language === 'en' && guide?.language === 'fil') {
        setGuide(originalGuide);
        translationRef.current = `${id}-en`;
      }
    }
    handleTranslation();
  }, [language, originalGuide, id, guide?.language, toast]);

  const handleBookmark = () => {
    if (!user) {
      toast({ title: t('common_login_required'), description: t('common_login_desc') });
      return;
    }
    if (!guide || !bookmarkRef) return;

    if (isBookmarked) {
      deleteDoc(bookmarkRef)
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: bookmarkRef.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      toast({ title: "Removed from vault" });
    } else {
      const data = {
        guideId: guide.id,
        title: guide.title,
        thumbnail: guide.thumbnail || '',
        category: guide.category,
        savedAt: serverTimestamp(),
      };
      setDoc(bookmarkRef, data)
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: bookmarkRef.path,
            operation: 'create',
            requestResourceData: data,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      toast({ title: "Secured in vault" });
    }
  };

  const handleShare = () => {
    if (!guide) return;
    if (navigator.share) {
      navigator.share({
        title: guide.title,
        text: guide.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Neural Link Copied" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('common_syncing')}</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8 bg-background">
        <div className="glass p-12 rounded-3xl border-primary/20">
          <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Protocol Offline</h2>
          <p className="text-muted-foreground mb-8 text-sm">Target manual could not be initialized. Please check your connection.</p>
          <div className="flex flex-col gap-4">
             <Button onClick={() => window.location.reload()} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">{t('common_retry')}</Button>
             <Link href="/guides">
               <Button variant="ghost" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">{t('guides_back')}</Button>
             </Link>
          </div>
        </div>
      </div>
    );
  }

  const difficultyColor = {
    easy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    hard: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  }[guide.difficulty as 'easy' | 'medium' | 'hard'] || 'bg-muted text-muted-foreground';

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="fixed top-14 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 md:hidden">
        <div className="px-4 h-12 flex items-center justify-between">
           <Link href="/guides" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
             <ArrowLeft className="w-3 h-3" /> {t('guides_back')}
           </Link>
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8 text-muted-foreground">
               <Share2 className="w-4 h-4" />
             </Button>
             <Button variant="ghost" size="icon" onClick={handleBookmark} className={`h-8 w-8 ${isBookmarked ? 'text-primary' : 'text-muted-foreground'}`}>
               {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
             </Button>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-32 md:pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-primary/5 border-primary/20 text-primary">
                  {guide.category}
                </Badge>
                <Badge variant="outline" className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border ${difficultyColor}`}>
                  {t(`guides_difficulty_${guide.difficulty}`)}
                </Badge>
                {isTranslating && (
                  <div className="flex items-center gap-2 text-primary animate-pulse ml-4">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Neural Link Syncing...</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 ml-auto text-amber-500 font-black text-xs">
                  <Star className="w-4 h-4 fill-current" />
                  {guide.rating}
                </div>
              </div>

              {isTranslating ? (
                <Skeleton className="h-12 md:h-20 w-3/4 rounded-2xl md:rounded-3xl" />
              ) : (
                <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-foreground">
                  {guide.title}
                </h1>
              )}

              {guide.thumbnail && (
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl glass border-primary/10">
                  <Image
                    src={guide.thumbnail}
                    alt={guide.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 scan-line opacity-10" />
                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">{t('guides_time')}</p>
                    <p className="text-white font-black text-sm uppercase tracking-tight">{guide.timeEstimate}</p>
                  </div>
                </div>
              )}

              <div className="p-8 md:p-12 glass rounded-3xl border-primary/5 bg-primary/[0.02]">
                {isTranslating ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm md:text-lg font-medium leading-relaxed whitespace-pre-wrap">
                    {guide.description}
                  </p>
                )}
              </div>
            </section>

            {guide.prerequisites && guide.prerequisites.length > 0 && (
              <section className="p-6 glass border-amber-500/20 bg-amber-500/5 rounded-3xl">
                <div className="flex items-center gap-3 text-amber-500 mb-4">
                  <Info className="w-5 h-5" />
                  <h3 className="font-black uppercase tracking-widest text-xs">Prerequisite Steps Detected</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  You may need to complete these guides before starting the main protocol:
                </p>
                <div className="flex flex-wrap gap-2">
                  {guide.prerequisites.map((pr: any) => (
                    <Link key={pr.id} href={`/guides/${pr.id}`}>
                      <Badge variant="secondary" className="rounded-xl h-8 px-4 cursor-pointer hover:bg-secondary/80">
                        {pr.title}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-8">
              <div className="flex items-center gap-4 px-2">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">{t('guides_steps')}</h2>
                <div className="h-px flex-grow bg-primary/10" />
              </div>

              <div className="space-y-10">
                {isTranslating ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="glass rounded-3xl overflow-hidden border-primary/5 p-8 md:p-16">
                      <div className="flex items-start gap-6 md:gap-10 mb-10">
                         <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-primary/20 animate-pulse" />
                         <div className="flex-grow pt-2 space-y-4">
                            <Skeleton className="h-8 w-1/3 rounded-xl" />
                            <div className="space-y-2">
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-5/6" />
                               <Skeleton className="h-4 w-4/6" />
                            </div>
                         </div>
                      </div>
                      <Skeleton className="aspect-video w-full rounded-3xl" />
                    </div>
                  ))
                ) : guide.steps && guide.steps.length > 0 ? (
                  guide.steps.map((step: any, index: number) => (
                    <div key={index} className="glass rounded-3xl overflow-hidden border-primary/5 group/step transition-all hover:border-primary/20">
                      <div className="p-8 md:p-16">
                        <div className="flex items-start gap-6 md:gap-10 mb-10">
                          <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl md:text-4xl shadow-2xl shadow-primary/30 group-hover/step:scale-110 transition-transform">
                            {index + 1}
                          </div>
                          <div className="flex-grow pt-2">
                            <h3 className="text-xl md:text-3xl font-black tracking-tight uppercase mb-4 text-foreground">
                              {step.title || `${t('guides_step_title')} ${index + 1}`}
                            </h3>
                            <div className="text-muted-foreground text-sm md:text-lg leading-relaxed font-medium whitespace-pre-wrap">
                              {step.description}
                            </div>
                          </div>
                        </div>
                        {step.imageUrl && (
                          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 group-hover/step:scale-[1.01] transition-transform">
                            <Image
                              src={step.imageUrl}
                              alt={`${t('guides_step_title')} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 scan-line opacity-0 group-hover/step:opacity-5 transition-opacity" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center glass rounded-3xl border-dashed border-primary/10">
                    <p className="text-muted-foreground italic">{t('guides_not_found')}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-32">
            <div className="hidden lg:flex gap-4">
              <Button 
                onClick={handleBookmark}
                className={`flex-1 rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl transition-all ${isBookmarked ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                {isBookmarked ? t('guides_saved') : t('guides_save')}
              </Button>
              <Button onClick={handleShare} variant="outline" size="icon" className="rounded-2xl h-16 w-16 glass border-primary/10 hover:border-primary/50 text-primary">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="glass rounded-3xl border-primary/5 overflow-hidden">
              <div className="p-6 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-primary" />
                  <h3 className="font-black uppercase tracking-tight text-sm">{t('guides_tools')}</h3>
                </div>
                <Badge variant="outline" className="text-[8px] opacity-40 uppercase">{guide.tools?.length || 0} units</Badge>
              </div>
              <div className="p-8 space-y-5">
                {guide.tools && guide.tools.length > 0 ? (
                  guide.tools.map((tool: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tight text-foreground/70 group/tool">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover/tool:bg-primary/10 transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      {tool.name}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-[10px] italic">No specialized tools flagged.</p>
                )}
                <Button variant="secondary" className="w-full mt-4 rounded-xl h-12 font-black uppercase tracking-widest text-[9px] bg-primary/10 text-primary hover:bg-primary/20 border-none">
                  {t('guides_buy_kit')}
                </Button>
              </div>
            </div>

            <div className="p-8 glass rounded-3xl border-primary/20 bg-primary/5 relative overflow-hidden group">
              <div className="absolute inset-0 scan-line opacity-5" />
              <div className="flex items-center gap-4 mb-6 text-primary">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg leading-none">{t('guides_help_title')}</h3>
                  <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-50">Neural Support Engine</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-8 font-medium leading-relaxed">
                {t('guides_help_desc')}
              </p>
              <Link href="/troubleshoot">
                <Button className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-primary neon-glow shadow-xl hover:scale-105 transition-all">
                  {t('guides_ask_ai')}
                </Button>
              </Link>
            </div>

            <div className="px-8 text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">
                 AyosGadget Protocol ID: AG-{id?.toString().padStart(6, '0')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
