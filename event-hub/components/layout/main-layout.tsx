'use client';

import { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
} 