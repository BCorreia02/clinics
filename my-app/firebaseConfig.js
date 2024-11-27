import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApZ6k-wKrMw349p7A_JWu5cQni1gDb7QY",
  authDomain: "clinicas-b9c15.firebaseapp.com",
  projectId: "clinicas-b9c15",
  storageBucket: "clinicas-b9c15.appspot.com",
  messagingSenderId: "751302501598",
  appId: "1:751302501598:android:41e1700491bfd0136cce4f",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});


// Initialize Firestore
export const firestore = getFirestore(app);
