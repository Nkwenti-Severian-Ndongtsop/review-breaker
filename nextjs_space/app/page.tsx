'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    } else if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
