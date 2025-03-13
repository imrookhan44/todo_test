'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md"
    >
      Sign Out
    </button>
  );
} 