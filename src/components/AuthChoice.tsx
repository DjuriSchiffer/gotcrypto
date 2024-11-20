import React from 'react';
import {
  signInWithGoogle,
  signInAnonymouslyUser,
} from '../services/authService';
import { Card } from 'flowbite-react';

const AuthChoice: React.FC = () => {
  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-3xl mb-8">Got Crypto?</h1>
        <div className='grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 mb-4'>
          <Card className="max-w-sm">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Sign in with Google
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400 mb-4">
              Save your data securely in the cloud and access it from any device.
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-400 mb-4">
              <li>✅ Persistent storage across devices</li>
              <li>✅ Easy backup and recovery</li>
              <li>⚠️ Requires a Google account</li>
            </ul>
            <button
              onClick={signInWithGoogle}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Sign in with Google
            </button>
          </Card>

          <Card className="max-w-sm">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Browse Anonymously
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400 mb-4">
              Store your data locally in your browser. No account required.
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-400 mb-4">
              <li>✅ Quick and easy setup</li>
              <li>✅ No personal information needed</li>
              <li>⚠️ Data is device-specific and not backed up</li>
            </ul>
            <button
              onClick={signInAnonymouslyUser}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Continue Anonymously
            </button>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default AuthChoice;
