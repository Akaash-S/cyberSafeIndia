// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwdLeQQT4Usc4SPRx3HzsEumTqjHUbv6w",
  authDomain: "cyber-safe-india.firebaseapp.com",
  projectId: "cyber-safe-india",
  storageBucket: "cyber-safe-india.firebasestorage.app",
  messagingSenderId: "856932794557",
  appId: "1:856932794557:web:c7260de97871031f02f7d4",
  measurementId: "G-NTYVBSN4VN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
