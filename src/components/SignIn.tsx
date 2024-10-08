import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { Button } from 'flowbite-react';

const SignIn: React.FC = () => {
  const signUpWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // The Auth Context will automatically update the user state
      // You can handle additional user setup here if needed
      console.log('User signed in:', result.user);
    } catch (error: any) {
      console.error('Error during sign-in:', error.message);
    }
  };

  return (
    <Button onClick={signUpWithGoogle} color="gray" rel="noreferrer">
      Sign in with Google
    </Button>
  );
};

export default SignIn;
