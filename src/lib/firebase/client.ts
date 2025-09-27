import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

let app: FirebaseApp;
let db: Firestore;

export function initFirebase() {
  if (!app) {
    app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });

    db = getFirestore(app);

    // Connect to emulator if running locally
    if (import.meta.env.DEV && import.meta.env.VITE_FIRESTORE_EMULATOR_HOST) {
      const [host, portStr] = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST.split(":");
      const port = parseInt(portStr, 10);
      connectFirestoreEmulator(db, host, port);
      console.log(`Connected to Firestore emulator at ${host}:${port}`);
    }
  }

  return { app, db };
}
