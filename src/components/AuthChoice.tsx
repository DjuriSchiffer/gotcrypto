import React from 'react';
import {
  signInWithGoogle,
  signInAnonymouslyUser,
} from '../services/authService';

const AuthChoice: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl mb-8">Welcome to Crypto Dashboard</h1>
      <div className="flex space-x-4">
        <button
          onClick={signInWithGoogle}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign in with Google
        </button>
        <button
          onClick={signInAnonymouslyUser}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Continue Anonymously
        </button>
      </div>
    </div>
  );
};

export default AuthChoice;
