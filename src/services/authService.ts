import { auth } from '../firebase/firebaseConfig';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
} from 'firebase/auth';

/**
 * Sign in with Google using a popup.
 */
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // The Auth Context will handle updating the user state
    console.log('Google Sign-In successful:', result.user);
  } catch (error: any) {
    console.error('Error during Google Sign-In:', error.message);
    // Handle Errors here.
    // You can show error messages to users if needed.
  }
};

/**
 * Sign in anonymously.
 */
export const signInAnonymouslyUser = async () => {
  try {
    const result = await signInAnonymously(auth);
    // The Auth Context will handle updating the user state
    console.log('Anonymous Sign-In successful:', result.user);
  } catch (error: any) {
    console.error('Error during Anonymous Sign-In:', error.message);
    // Handle Errors here.
    // You can show error messages to users if needed.
  }
};

/**
 * Sign out the current user.
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully.');
  } catch (error: any) {
    console.error('Error during Sign-Out:', error.message);
    // Handle Errors here.
  }
};
