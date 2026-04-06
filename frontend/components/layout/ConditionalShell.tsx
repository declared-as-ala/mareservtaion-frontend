'use client';

import { HomeNavbar } from '@/components/home/HomeNavbar';
import { Footer } from './Footer';

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
