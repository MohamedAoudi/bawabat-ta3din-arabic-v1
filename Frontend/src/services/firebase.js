import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase configuration - Replace with your own config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAtz8PNCAsDSTLbHdRoiZhE4HWiG82pwVI",
  authDomain: "apip-378ea.firebaseapp.com",
  projectId: "apip-378ea",
  storageBucket: "apip-378ea.firebasestorage.app",
  messagingSenderId: "111994294377",
  appId: "1:111994294377:web:f2a5b4c1cd3fe0c61752f8",
  measurementId: "G-7BX303Y8QE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      uid: result.user.uid
    };
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
};

// Google Sign Out
export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Google sign out error:", error);
    throw error;
  }
};

export default app;