'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (accessToken && !user) {
      fetchMe();
    } else if (!accessToken) {
      router.replace('/login');
    } else if (user?.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [accessToken, user, fetchMe, router]);

  if (!accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}

