import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA_GYCgu1sIZcKP5Hp3x-s_1UEdCQjkznw",
  authDomain: "powerful-arcana-9v8b6.firebaseapp.com",
  projectId: "powerful-arcana-9v8b6",
  storageBucket: "powerful-arcana-9v8b6.firebasestorage.app",
  messagingSenderId: "230304779077",
  appId: "1:230304779077:web:d94dfe44fbcb76601e8c2c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logoutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { onAuthStateChanged };
