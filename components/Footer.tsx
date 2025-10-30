'use client';

import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <footer className="mt-auto relative overflow-hidden">
      {/* Background with diagonal gradient matching the image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(105deg, #000000 0%, #000000 35%, #D4B577 35%, #E9CA8A 65%, #D4B577 100%)'
        }}
      />
      
      {/* Content wrapper with relative positioning to stay above background */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Left side - Logo and Quick Links */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
            {/* Logo */}
            <div className="flex-shrink-0 -ml-4 sm:-ml-8">
              <img 
                src="/Asset-1-SVG-transparent-4.png" 
                alt="MCHA Logo" 
                className="h-28 w-auto"
              />
            </div>

            {/* Quick Links */}
            <div>
              <ul className="space-y-2 text-sm">
              {user ? (
                // Admin user links
                <>
                  <li>
                    <Link href="/admin/games" className="text-gray-200 hover:text-white transition-colors">
                      Manage Games
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/rosters" className="text-gray-200 hover:text-white transition-colors">
                      Manage Teams
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/overview" className="text-gray-200 hover:text-white transition-colors">
                      Admin Overview
                    </Link>
                  </li>
                  <li>
                    <Link href="/stats" className="text-gray-200 hover:text-white transition-colors">
                      Player Stats
                    </Link>
                  </li>
                  {/* Admin Sign Out link */}
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-200 hover:text-white transition-colors text-left"
                    >
                      Admin Sign Out
                    </button>
                  </li>
                </>
              ) : (
                // Public user links
                <>
                  <li>
                    <Link href="http://hockeydubai.com" className="text-gray-200 hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/stats" className="text-gray-200 hover:text-white transition-colors">
                      Stats
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="text-gray-200 hover:text-white transition-colors">
                      Standings
                    </Link>
                  </li>
                  <li>
                    <Link href="/schedule" className="text-gray-200 hover:text-white transition-colors">
                      Schedule
                    </Link>
                  </li>
                  <li>
                    <Link href="https://hockeydubai.com/events/" className="text-gray-200 hover:text-white transition-colors">
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link href="https://hockeydubai.com/mighty-camels/" className="text-gray-200 hover:text-white transition-colors">
                      Mighty Camels EIHL
                    </Link>
                  </li>
                  <li>
                    <Link href="https://hockeydubai.com/register2025-2026/" className="text-gray-200 hover:text-white transition-colors">
                      Register now
                    </Link>
                  </li>
                  {/* Admin Sign In link */}
                  <li>
                    <Link
                      href="/admin/login"
                      className="text-gray-200 hover:text-white transition-colors"
                    >
                      Admin Sign In
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Right side - League Info */}
        <div className="text-left mr-40 md:mr-56 lg:mr-72">
          <h3 className="text-lg font-semibold mb-6 text-black">
            Mighty Camels Hockey League (MCHL)
          </h3>
          <p className="text-gray-800 text-base mb-6">
            Dubai's premier ice hockey league. Founded in<br />
            1994 and run by a bunch of beauties.
          </p>
          <a 
            href="mailto:dubaimightycamels@gmail.com" 
            className="text-gray-800 hover:text-black transition-colors text-sm font-bold inline-flex items-center gap-2"
          >
            <svg 
              width="30" 
              height="30" 
              viewBox="0 0 24 24" 
              fill="black" 
              stroke="#E9CA8A" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="m22 7-10 5L2 7"></path>
            </svg>
            dubaimightycamels@gmail.com
          </a>
        </div>
      </div>
    </div>
    </footer>
  );
}