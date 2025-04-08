'use client';

import { useEffect } from 'react';

export default function CancelledRedirect({ eventName }: { eventName: string }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="max-w-xl mx-auto py-10 space-y-6 text-center">
      <h1 className="text-2xl font-bold">You have successfully cancelled your registration.</h1>
      <p className="text-sm">Event: {eventName}</p>
      <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
    </div>
  );
}
