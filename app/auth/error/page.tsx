'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    setError(errorParam || 'Unknown authentication error');
  }, [searchParams]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <p className="mt-2 text-gray-600">
            {error === 'AccessDenied' ? 
              'Access was denied. This could be due to an issue with your Google account or permissions.' : 
              error}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-md">
            <h2 className="text-lg font-medium text-yellow-800">Troubleshooting Tips</h2>
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
              <li>Make sure you're using a valid Google account</li>
              <li>Try clearing your browser cookies and cache</li>
              <li>Ensure you've granted the necessary permissions</li>
              <li>If you previously signed up with email/password, try that method instead</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link 
              href="/auth/signin"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
            >
              Try Again
            </Link>
            <Link 
              href="/"
              className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 