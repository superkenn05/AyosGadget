'use client';

import { FEATURED_REPAIRS } from '@/lib/repair-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Wrench, Package, ArrowLeft, Star, MessageCircle, Share2, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
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

export default function GuideDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bookmarkRef = user && guide ? doc(db, 'users', user.uid, 'bookmarks', guide.id) : null;
  const { data: bookmark } = useDoc(bookmarkRef);
  const isBookmarked = !!bookmark;

  useEffect(() => {
    async function fetchGuide() {
      setLoading(true);
      // Check local first
      const local = FEATURED_REPAIRS.find((g) => g.id === id);
      if (local) {
        setGuide(local);
      } else if (id && /^\d+$/.test(id as string)) {
        // Numeric ID means iFixit
        const ifixit = await getIFixitGuide(id as string);
        if (ifixit) {
          setGuide(mapIFixitToInternal(ifixit));
        }
      }
      setLoading(false);
    }
    fetchGuide();
  }, [id]);

  const handleBookmark = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to save guides." });
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
      toast({ title: "Removed from bookmarks" });
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
      toast({ title: "Saved to bookmarks" });
    }
  };

  const handleShare = () => {
    if (!guide) return;
    if (navigator.share) {
      navigator.share({
        title: t(`${guide.id}_title`) || guide.title,
        text: t(`${guide.id}_desc`) || guide.description,
        url: window.location.href,
      }).catch(() => {
        toast({ title: "Couldn't share", description: "Something went wrong." });
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-2xl font-black uppercase mb-4">Protocol Not Found</h2>
          <Link href="/guides">
            <Button variant="outline" className="rounded-xl">Return to Library</Button>
          </Link>
        </div>
      </div>
    );
  }

  const difficultyLabel = t(`guides_difficulty_${guide.difficulty}`);
  const difficultyColor = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-rose-100 text-rose-700',
  }[guide.difficulty as 'easy' | 'medium' | 'hard'];

  const localizedTitle = t(`${guide.id}_title`) || guide.title;
  const localizedDescription = t(`${guide.id}_desc`) || guide.description;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 pt-20">
        <Link href="/guides">
          <Button variant="ghost" className="mb-6 gap-2 rounded-xl text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            {t('guides_back')}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant="secondary" className="rounded-lg">{guide.category}</Badge>
                <Badge className={`rounded-lg ${difficultyColor} border-none`}>
                  {difficultyLabel}
                </Badge>
                <div className="flex items-center gap-1 text-sm font-medium text-amber-500 ml-auto">
                  <Star className="w-4 h-4 fill-amber-500" />
                  {guide.rating} ({guide.reviewsCount} reviews)
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight uppercase">{localizedTitle}</h1>
              
              <div className="relative aspect-video rounded-[3rem] overflow-hidden mb-8 shadow-2xl glass border-primary/10">
                <Image
                  src={guide.thumbnail}
                  alt={localizedTitle}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-8 glass rounded-[2.5rem] border-primary/5 shadow-sm mb-12">
                <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{t('guides_time')}: {guide.timeEstimate}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                  {localizedDescription}
                </p>
              </div>

              <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">{t('guides_steps')}</h2>
              <div className="space-y-8">
                {guide.steps.map((step: any, index: number) => (
                  <div key={index} className="glass rounded-[3rem] overflow-hidden border-primary/5">
                    <div className="p-8 md:p-12">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-lg shadow-primary/20">
                          {index + 1}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-lg mb-8 leading-relaxed font-medium">
                        {step.description}
                      </p>
                      <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-xl border border-black/5 dark:border-white/5">
                        <Image
                          src={step.imageUrl}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <Button 
                onClick={handleBookmark}
                className={`flex-1 rounded-2xl h-16 font-black uppercase tracking-widest text-xs gap-3 shadow-xl transition-all ${isBookmarked ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                {isBookmarked ? t('guides_saved') : t('guides_save')}
              </Button>
              <Button onClick={handleShare} variant="outline" size="icon" className="rounded-2xl h-16 w-16 glass border-primary/10">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="glass rounded-[2.5rem] border-primary/5 overflow-hidden">
              <div className="p-6 bg-primary/5 border-b border-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-black uppercase tracking-tight text-lg">{t('guides_tools')}</h3>
              </div>
              <div className="p-8">
                <ul className="space-y-5">
                  {guide.tools.map((tool: any, i: number) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-bold uppercase tracking-tight text-foreground/80">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      {tool.name}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full mt-8 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]" onClick={() => toast({ title: "Coming Soon" })}>{t('guides_buy_kit')}</Button>
              </div>
            </div>

            <div className="glass rounded-[2.5rem] border-primary/5 overflow-hidden">
              <div className="p-6 bg-secondary/5 border-b border-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary-foreground">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-black uppercase tracking-tight text-lg">{t('guides_parts')}</h3>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {guide.parts.map((part: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-muted/30 rounded-2xl border border-black/5 dark:border-white/5">
                      <span className="text-xs font-bold uppercase tracking-tight">{part.name}</span>
                      <span className="text-primary font-black text-xs">{part.price || 'Market Price'}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-8 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]" onClick={() => toast({ title: "Coming Soon" })}>{t('guides_order_parts')}</Button>
              </div>
            </div>

            <div className="p-8 glass rounded-[2.5rem] border-primary/20 bg-primary/5 relative overflow-hidden group">
              <div className="absolute inset-0 scan-line opacity-5" />
              <div className="flex items-center gap-4 mb-6 text-primary">
                <MessageCircle className="w-6 h-6" />
                <h3 className="font-black uppercase tracking-tight text-xl">{t('guides_help_title')}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-8 font-medium">
                {t('guides_help_desc')}
              </p>
              <Link href="/troubleshoot">
                <Button className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs bg-primary neon-glow">{t('guides_ask_ai')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
