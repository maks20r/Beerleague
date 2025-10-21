'use client';

import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <div className="header-background">
        <div className="header-top">
          <img src="/Asset-1-SVG-transparent-4.png" alt="MCHA Logo" className="header-logo" />
          <div className="header-text">
            Home of<br />
            Mighty Camels Hockey<br />
            Association
          </div>
          <img src="/Group-120.png" alt="Team Logo" className="header-logo-right" />

          {/* Mobile menu button - Always show for mobile */}
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Desktop navigation slot */}
        <div id="header-nav-slot">
          {(!user || !pathname.startsWith('/admin')) && (
            <div className="header-nav">
              <div className="header-nav-inner">
                <Link href="http://hockeydubai.com">Home</Link>
                <Link href="/" className={pathname === '/' ? 'active' : ''}>Standings</Link>
                <Link href="/stats" className={pathname === '/stats' ? 'active' : ''}>Stats</Link>
                <Link href="/schedule" className={pathname === '/schedule' ? 'active' : ''}>Schedule</Link>
                <Link href="/admin/login" className={pathname === '/admin/login' ? 'active' : ''}>Admin Login</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu overlay */}
      <>
        <div
          className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-header">
            <span className="font-bold text-lg">Menu</span>
            <button
              className="mobile-menu-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <nav className="mobile-menu-nav">
            {user ? (
              <>
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
                <button onClick={handleSignOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="http://hockeydubai.com">
                  Home
                </Link>
                <Link
                  href="/"
                  className={pathname === '/' ? 'active' : ''}
                >
                  Standings
                </Link>
                <Link
                  href="/stats"
                  className={pathname === '/stats' ? 'active' : ''}
                >
                  Stats
                </Link>
                <Link
                  href="/schedule"
                  className={pathname === '/schedule' ? 'active' : ''}
                >
                  Schedule
                </Link>
                <Link href="/admin/login">
                  Admin Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </>
    </>
  );
}
