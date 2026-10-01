import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB0n_ZTtRDSa8KSI3KMJYEmT2lv9jDUsvI",
  authDomain: "dioganize-9cedc.firebaseapp.com",
  projectId: "dioganize-9cedc",
  storageBucket: "dioganize-9cedc.firebasestorage.app",
  messagingSenderId: "8904175187",
  appId: "1:8904175187:web:eaa76a6661353de726a0a6",
  measurementId: "G-WERQLCNRV9"
};


const configured = !Object.values(firebaseConfig).some((value) => String(value).startsWith('YOUR_'));
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const firebaseConfigured = configured;
