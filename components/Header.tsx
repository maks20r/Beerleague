'use client';

import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="header-background">
      <div className="header-top">
        <img src="/Asset-1-SVG-transparent-4.png" alt="MCHA Logo" className="header-logo" />
        <div className="header-text">
          Home of<br />
          Mighty Camels Hockey<br />
          Association
        </div>
        <img src="/Group-120.png" alt="Team Logo" className="header-logo-right" />
      </div>
      <div id="header-nav-slot">
        {user && (
          <div className="header-nav">
            <div className="header-nav-inner">
              <Link href="/admin/games">Games</Link>
              <Link href="/admin/rosters">Teams</Link>
              <Link href="/">View Public Site</Link>
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
