'use client';

import { FEATURED_REPAIRS } from '@/lib/repair-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Wrench, Package, ArrowLeft, Star, MessageCircle, Share2, Bookmark, BookmarkCheck, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useLanguage } from '@/components/providers/language-provider';
import { useEffect, useState } from 'react';
import { getIFixitGuide, mapIFixitToInternal } from '@/lib/ifixit-api';
import { translateGuide } from '@/ai/flows/translate-guide-flow';

export default function GuideDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const [guide, setGuide] = useState<any>(null);
  const [originalGuide, setOriginalGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  const bookmarkRef = user && guide ? doc(db, 'users', user.uid, 'bookmarks', guide.id) : null;
  const { data: bookmark } = useDoc(bookmarkRef);
  const isBookmarked = !!bookmark;

  useEffect(() => {
    async function fetchGuide() {
      if (!id) return;
      setLoading(true);
      
      let fetchedGuide = null;
      const local = FEATURED_REPAIRS.find((g) => g.id === id);
      if (local) {
        fetchedGuide = local;
      } else if (/^\d+$/.test(id as string)) {
        const ifixit = await getIFixitGuide(id as string);
        if (ifixit) {
          fetchedGuide = mapIFixitToInternal(ifixit);
        }
      }
      
      setGuide(fetchedGuide);
      setOriginalGuide(fetchedGuide);
      setLoading(false);
    }
    fetchGuide();
  }, [id]);

  // Handle live translation when language changes to Filipino
  useEffect(() => {
    async function handleTranslation() {
      if (language === 'fil' && guide && guide.language !== 'fil') {
        setIsTranslating(true);
        try {
          const translated = await translateGuide({
            title: guide.title,
            description: guide.description,
            steps: guide.steps.map((s: any) => ({ title: s.title, description: s.description })),
          });

          setGuide((prev: any) => ({
            ...prev,
            title: translated.title,
            description: translated.description,
            steps: prev.steps.map((s: any, i: number) => ({
              ...s,
              title: translated.steps[i].title,
              description: translated.steps[i].description,
            })),
            language: 'fil'
          }));
        } catch (error) {
          console.error("Translation failed", error);
        } finally {
          setIsTranslating(false);
        }
      } else if (language === 'en' && guide && guide.language === 'fil') {
        // Revert to original English if user switches back
        setGuide(originalGuide);
      }
    }
    handleTranslation();
  }, [language, originalGuide]);

  const handleBookmark = () => {
    if (!user) {
      toast({ title: t('common_login_required'), description: t('common_login_desc') });
      return;
    }
    if (!guide) return;

    if (isBookmarked) {
      deleteDoc(bookmarkRef!)
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: bookmarkRef!.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      toast({ title: "Removed from vault" });
    } else {
      const data = {
        guideId: guide.id,
        title: guide.title,
        thumbnail: guide.thumbnail,
        category: guide.category,
        savedAt: serverTimestamp(),
      };
      setDoc(bookmarkRef!, data)
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: bookmarkRef!.path,
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
      }).catch(() => {
        toast({ title: "Protocol Error", description: "Sharing failed." });
      });
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
        <div className="glass p-12 rounded-[3rem] border-primary/20">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Protocol Offline</h2>
          <p className="text-muted-foreground mb-8 text-sm">Target manual could not be initialized.</p>
          <Link href="/guides">
            <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">Return to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const difficultyColor = {
    easy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    hard: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  }[guide.difficulty as 'easy' | 'medium' | 'hard'];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* AI Translation Overlay */}
      {isTranslating && (
        <div className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm flex items-center justify-center">
          <div className="glass p-8 rounded-3xl flex flex-col items-center gap-4 border-primary/30">
            <div className="relative">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              <Loader2 className="w-10 h-10 text-primary animate-spin absolute inset-0 opacity-40" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t('chat_running')}</p>
          </div>
        </div>
      )}

      {/* Header HUD */}
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
          
          {/* Main Content: The Instructions */}
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-primary/5 border-primary/20 text-primary">
                  {guide.category}
                </Badge>
                <Badge variant="outline" className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border ${difficultyColor}`}>
                  {t(`guides_difficulty_${guide.difficulty}`)}
                </Badge>
                <div className="flex items-center gap-1.5 ml-auto text-amber-500 font-black text-xs">
                  <Star className="w-4 h-4 fill-current" />
                  {guide.rating}
                </div>
              </div>

              <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-foreground">
                {guide.title}
              </h1>

              <div className="relative aspect-video rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl glass border-primary/10">
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

              <div className="p-8 md:p-12 glass rounded-[2.5rem] md:rounded-[3.5rem] border-primary/5 bg-primary/[0.02]">
                <p className="text-muted-foreground text-sm md:text-lg font-medium leading-relaxed whitespace-pre-wrap">
                  {guide.description}
                </p>
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-4 px-2">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">{t('guides_steps')}</h2>
                <div className="h-px flex-grow bg-primary/10" />
              </div>

              <div className="space-y-10">
                {guide.steps.map((step: any, index: number) => (
                  <div key={index} className="glass rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border-primary/5 group/step transition-all hover:border-primary/20">
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
                      <div className="relative aspect-video rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 group-hover/step:scale-[1.01] transition-transform">
                        <Image
                          src={step.imageUrl}
                          alt={`${t('guides_step_title')} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 scan-line opacity-0 group-hover/step:opacity-5 transition-opacity" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar HUD: Logistics & Intelligence */}
          <div className="lg:col-span-4 space-y-8 sticky top-32">
            
            {/* Desktop Actions */}
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

            {/* Tools Module */}
            <div className="glass rounded-[2.5rem] border-primary/5 overflow-hidden">
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

            {/* Intelligence Section */}
            <div className="p-8 glass rounded-[2.5rem] border-primary/20 bg-primary/5 relative overflow-hidden group">
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

            {/* Technical Metadata */}
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
