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
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* League Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hockey League</h3>
            <p className="text-gray-300 text-sm mb-2">
              Track stats, schedules, and rosters for your hockey league
            </p>
            <p className="text-gray-400 text-xs">
              Managing Division A & B teams
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {user ? (
                // Admin user links
                <>
                  <li>
                    <Link href="/admin/games" className="text-gray-300 hover:text-white transition-colors">
                      Manage Games
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/rosters" className="text-gray-300 hover:text-white transition-colors">
                      Manage Teams
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/overview" className="text-gray-300 hover:text-white transition-colors">
                      Admin Overview
                    </Link>
                  </li>
                  <li>
                    <Link href="/stats" className="text-gray-300 hover:text-white transition-colors">
                      Player Stats
                    </Link>
                  </li>
                </>
              ) : (
                // Public user links
                <>
                  <li>
                    <Link href="/stats" className="text-gray-300 hover:text-white transition-colors">
                      Player Stats
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                      Standings
                    </Link>
                  </li>
                  <li>
                    <Link href="/schedule" className="text-gray-300 hover:text-white transition-colors">
                      Schedule
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">League Contact</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Need Help?</p>
              <p className="text-gray-400">
                Please speak to your team captain to get in touch with the platform manager for any questions or concerns
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Hockey League Management. All rights reserved.
          </p>
          <div className="flex items-center mt-4 sm:mt-0">
            {user ? (
              <button
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                Admin Sign Out
              </button>
            ) : (
              <Link
                href="/admin/login"
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                Admin Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}