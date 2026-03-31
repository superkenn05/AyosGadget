'use client';

import Navbar from '@/components/layout/Navbar';
import RepairCard from '@/components/repair/RepairCard';
import { useUser, useFirestore, useCollection, useAuth } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { FEATURED_REPAIRS } from '@/lib/repair-data';
import { Bookmark, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function BookmarksPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const bookmarksQuery = user ? query(
    collection(db, 'users', user.uid, 'bookmarks'),
    orderBy('savedAt', 'desc')
  ) : null;

  const { data: bookmarks, loading: bookmarksLoading } = useCollection(bookmarksQuery);

  if (userLoading || bookmarksLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto p-12 bg-white rounded-3xl shadow-sm">
            <LogIn className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Kailangang Mag-login</h2>
            <p className="text-muted-foreground mb-8">
              Mag-login para makita ang iyong mga naka-save na repair guides.
            </p>
            <Button onClick={handleLogin} className="w-full h-12 rounded-xl">Mag-login gamit ang Google</Button>
          </div>
        </div>
      </div>
    );
  }

  // Map bookmarks back to FEATURED_REPAIRS data
  const bookmarkedGuides = (bookmarks || []).map(b => 
    FEATURED_REPAIRS.find(r => r.id === b.guideId)
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">Mga Naka-save</h1>
            <p className="text-muted-foreground">Ang iyong koleksyon ng mga repair guides.</p>
          </div>
        </div>

        {bookmarkedGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarkedGuides.map((guide) => (
              <RepairCard key={guide!.id} guide={guide!} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Wala pang naka-save</h3>
            <p className="text-muted-foreground mb-8">Mag-save ng mga gabay para mabilis mo itong mahanap.</p>
            <Link href="/guides">
              <Button variant="secondary" className="rounded-xl h-12">Mag-browse ng mga Gabay</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
