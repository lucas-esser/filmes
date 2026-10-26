import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence, getAuth, initializeAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBjmvZf5fpf88lxQWgioAzKbfU1pIR8ptA',
  authDomain: 'banco-de-dados---mobile.firebaseapp.com',
  databaseURL: 'https://banco-de-dados---mobile-default-rtdb.firebaseio.com/',
  projectId: 'banco-de-dados---mobile',
  storageBucket: 'banco-de-dados---mobile.firebasestorage.app',
  messagingSenderId: '1088455177665',
  appId: '1:1088455177665:web:efc5f26747cdeb01632b40',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
})();

export const rtdb = getDatabase(app);
export const firebaseConfigured = true;
export const firebaseConfigMessage = '';
