'use client';

import RepairCard from '@/components/repair/RepairCard';
import RepairCardSkeleton from '@/components/repair/RepairCardSkeleton';
import { useUser, useFirestore, useCollection, useAuth } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Bookmark, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useLanguage } from '@/components/providers/language-provider';

export default function BookmarksPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { t } = useLanguage();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const bookmarksQuery = user ? query(
    collection(db, 'users', user.uid, 'savedGuides'),
    orderBy('savedAt', 'desc')
  ) : null;

  const { data: bookmarks, loading: bookmarksLoading } = useCollection(bookmarksQuery);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto p-12 bg-white dark:bg-card rounded-3xl shadow-sm border dark:border-white/10">
            <LogIn className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">{t('common_login_required')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('common_login_desc')}
            </p>
            <Button onClick={handleLogin} className="w-full h-12 rounded-xl">{t('common_login_google')}</Button>
          </div>
        </div>
      </div>
    );
  }

  const bookmarkedGuides = (bookmarks || []).map(b => ({
    id: b.repairGuideId || b.id,
    title: b.title,
    thumbnail: b.thumbnail,
    category: b.category,
    difficulty: 'easy', 
    device: 'Hardware',
    timeEstimate: '30-60 mins',
    rating: 4.5
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-12 pt-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{t('bookmarks_title')}</h1>
            <p className="text-muted-foreground">{t('bookmarks_subtitle')}</p>
          </div>
        </div>

        {bookmarksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <RepairCardSkeleton key={i} />
            ))}
          </div>
        ) : bookmarkedGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarkedGuides.map((guide) => (
              <RepairCard key={guide.id} guide={guide as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-card rounded-3xl border border-dashed dark:border-white/20">
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('bookmarks_empty_title')}</h3>
            <p className="text-muted-foreground mb-8">{t('bookmarks_empty_desc')}</p>
            <Link href="/guides">
              <Button variant="secondary" className="rounded-xl h-12">{t('bookmarks_browse')}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
