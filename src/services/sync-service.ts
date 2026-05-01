'use client';

import { getTrendingGuides, searchIFixitGuides } from '@/lib/ifixit-api';
import { doc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileOverview Neural Ingestion Service
 * Handles bulk syncing of iFixit data to the local Firestore Vault.
 */

export interface SyncProgress {
  total: number;
  current: number;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  message: string;
}

export async function ingestTopGuides(
  db: Firestore, 
  pages: number = 5, 
  onProgress?: (progress: SyncProgress) => void
) {
  const limitPerPage = 20;
  const totalItems = pages * limitPerPage;
  let currentCount = 0;

  if (onProgress) {
    onProgress({ total: totalItems, current: 0, status: 'syncing', message: 'Initializing Neural Link...' });
  }

  try {
    for (let p = 0; p < pages; p++) {
      if (onProgress) {
        onProgress({ 
          total: totalItems, 
          current: currentCount, 
          status: 'syncing', 
          message: `Fetching protocols page ${p + 1}...` 
        });
      }

      const guides = await getTrendingGuides(p * limitPerPage, limitPerPage);
      
      if (!guides || guides.length === 0) break;

      for (const guide of guides) {
        const guideRef = doc(db, 'repairGuides', guide.id);
        
        // Non-blocking write
        setDoc(guideRef, {
          ...guide,
          syncedAt: serverTimestamp(),
          authorId: 'system_ifixit'
        }, { merge: true }).catch(err => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: guideRef.path,
            operation: 'write',
            requestResourceData: guide
          }));
        });

        // Sync Device too
        if (guide.device) {
          const deviceId = guide.device.toLowerCase().replace(/\s+/g, '-');
          const deviceRef = doc(db, 'devices', deviceId);
          setDoc(deviceRef, {
            id: deviceId,
            name: guide.device,
            thumbnail: guide.thumbnail,
            syncedAt: serverTimestamp()
          }, { merge: true }).catch(() => {});
        }

        currentCount++;
        if (onProgress) {
          onProgress({ 
            total: totalItems, 
            current: currentCount, 
            status: 'syncing', 
            message: `Ingesting: ${guide.title}` 
          });
        }
      }
    }

    if (onProgress) {
      onProgress({ total: totalItems, current: currentCount, status: 'completed', message: 'Neural Library Fully Synchronized.' });
    }
  } catch (error: any) {
    if (onProgress) {
      onProgress({ total: totalItems, current: currentCount, status: 'error', message: `Sync Failed: ${error.message}` });
    }
  }
}
