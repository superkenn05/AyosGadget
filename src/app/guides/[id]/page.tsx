'use client';

import { FEATURED_REPAIRS } from '@/lib/repair-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Wrench, Package, ArrowLeft, Star, MessageCircle, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useLanguage } from '@/components/providers/language-provider';

export default function GuideDetailPage() {
  const params = useParams();
  const { id } = params;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const guide = FEATURED_REPAIRS.find((g) => g.id === id) || FEATURED_REPAIRS[0];

  const bookmarkRef = user ? doc(db, 'users', user.uid, 'bookmarks', guide.id) : null;
  const { data: bookmark } = useDoc(bookmarkRef);
  const isBookmarked = !!bookmark;

  const handleBookmark = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save guides.",
      });
      return;
    }

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
    if (navigator.share) {
      navigator.share({
        title: t(`${guide.id}_title`) || guide.title,
        text: t(`${guide.id}_desc`) || guide.description,
        url: window.location.href,
      }).catch(() => {
        toast({ title: "Couldn't share", description: "Something went wrong with sharing." });
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!", description: "Guide link has been copied to clipboard." });
    }
  };

  const difficultyLabel = t(`guides_difficulty_${guide.difficulty}`);
  const difficultyColor = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-rose-100 text-rose-700',
  }[guide.difficulty];

  // Localized Content
  const localizedTitle = t(`${guide.id}_title`) || guide.title;
  const localizedDescription = t(`${guide.id}_desc`) || guide.description;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-8">
        <Link href="/guides">
          <Button variant="ghost" className="mb-6 gap-2 rounded-xl text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            {t('guides_back')}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
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
              
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{localizedTitle}</h1>
              
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-8 shadow-xl">
                <Image
                  src={guide.thumbnail}
                  alt={localizedTitle}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-8 bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm mb-12">
                <h3 className="text-xl font-bold mb-4">{t('guides_time')}: {guide.timeEstimate}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {localizedDescription}
                </p>
              </div>

              <h2 className="text-3xl font-bold mb-8">{t('guides_steps')}</h2>
              <div className="space-y-12">
                {guide.steps.map((step, index) => (
                  <div key={index} className="bg-white dark:bg-card rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-white/10">
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {index + 1}
                        </div>
                        <h3 className="text-2xl font-bold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
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

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={handleBookmark}
                className={`flex-1 rounded-2xl h-14 font-bold text-lg gap-2 shadow-lg ${isBookmarked ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'shadow-primary/20'}`}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                {isBookmarked ? t('guides_saved') : t('guides_save')}
              </Button>
              <Button onClick={handleShare} variant="outline" size="icon" className="rounded-2xl h-14 w-14 shrink-0 border-2">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Tools Required */}
            <div className="border rounded-3xl border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <div className="p-6 bg-slate-50 dark:bg-white/5 border-b dark:border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-lg">{t('guides_tools')}</h3>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {guide.tools.map((tool, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {tool.name}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full mt-6 rounded-xl font-bold" onClick={() => toast({ title: "Coming Soon", description: "Repair kit shop will be available soon." })}>{t('guides_buy_kit')}</Button>
              </div>
            </div>

            {/* Parts Required */}
            <div className="border rounded-3xl border-none shadow-sm overflow-hidden bg-white dark:bg-card">
              <div className="p-6 bg-slate-50 dark:bg-white/5 border-b dark:border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary-foreground">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-lg">{t('guides_parts')}</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {guide.parts.map((part, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                      <span className="text-sm font-medium">{part.name}</span>
                      <span className="text-primary font-bold">{part.price}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6 rounded-xl font-bold" onClick={() => toast({ title: "Coming Soon", description: "Part ordering system will be available soon." })}>{t('guides_order_parts')}</Button>
              </div>
            </div>

            {/* FAQ/Community help */}
            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-bold text-lg">{t('guides_help_title')}</h3>
              </div>
              <p className="text-sm text-primary/80 mb-6 font-medium">
                {t('guides_help_desc')}
              </p>
              <Link href="/troubleshoot">
                <Button className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20">{t('guides_ask_ai')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
