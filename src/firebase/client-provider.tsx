'use client';

import React, { ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  children: ReactNode;
}> = ({ firebaseApp, firestore, auth, children }) => {
  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
};
