'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import Link from 'next/link';
import { createPortal } from 'react-dom';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [navSlot, setNavSlot] = React.useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
    // Redirect /admin to /admin/games since dashboard is removed
    if (!loading && user && pathname === '/admin') {
      router.push('/admin/games');
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    setNavSlot(document.getElementById('header-nav-slot'));
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Show login page without layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-700">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {navSlot && createPortal(
        <div className="header-nav">
          <div className="header-nav-inner">
            <Link href="http://hockeydubai.com">
              Home
            </Link>
            <Link
              href="/admin/games"
              className={pathname === '/admin/games' ? 'active' : ''}
            >
              Games
            </Link>
            <Link
              href="/admin/rosters"
              className={pathname === '/admin/rosters' ? 'active' : ''}
            >
              Teams
            </Link>
            <Link
              href="/admin/overview"
              className={pathname === '/admin/overview' ? 'active' : ''}
            >
              Overview
            </Link>
            <Link
              href="/admin/instructions"
              className={pathname === '/admin/instructions' ? 'active' : ''}
            >
              Instructions
            </Link>
            <button onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>,
        navSlot
      )}

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}