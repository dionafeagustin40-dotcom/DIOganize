import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB0n_ZTtRDSa8KSI3KMJYEmT2lv9jDUsvI",
  authDomain: "dioganize-9cedc.firebaseapp.com",
  projectId: "dioganize-9cedc",
  storageBucket: "dioganize-9cedc.firebasestorage.app",
  messagingSenderId: "8904175187",
  appId: "1:8904175187:web:eaa76a6661353de726a0a6",
  measurementId: "G-WERQLCNRV9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
