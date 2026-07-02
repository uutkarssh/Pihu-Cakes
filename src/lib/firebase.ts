// Firebase client init — app, analytics, auth, and firestore.
// Client config is safe to expose (Firebase security rules protect the data).
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1xNUNWJWgTfKcvcj89AyYBUZbQalrNOo",
  authDomain: "pihu-cakes.firebaseapp.com",
  projectId: "pihu-cakes",
  storageBucket: "pihu-cakes.firebasestorage.app",
  messagingSenderId: "942188754637",
  appId: "1:942188754637:web:4d209adcdc3e44169c9b84",
  measurementId: "G-8WL8QTM573",
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Guard for SSR — Firebase browser SDKs only run in the browser.
if (typeof window !== "undefined") {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  void isSupported().then((supported) => {
    if (supported && app) analytics = getAnalytics(app);
  });
}

export { app, analytics, auth, db };
