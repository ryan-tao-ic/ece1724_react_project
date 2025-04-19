// app/components/layout/main-layout.tsx

"use client";

import { ReactNode } from "react";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
