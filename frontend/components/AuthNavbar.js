"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AuthNavbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="glass border-b border-[var(--border)] px-6 py-4 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110">
            L
          </div>
          <span className="text-lg font-bold tracking-tight">
            Learn<span className="gradient-text">Stack</span>
          </span>
        </Link>

        
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/tracks"
            className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Tracks
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/ai-teacher"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            🤖 AI
          </Link>

          <div className="flex items-center gap-4 border-l border-[var(--border)] pl-6 ml-2">
            {user?.totalXpEarned !== undefined && (
              <div className="flex gap-2">
                <div className="text-sm font-semibold flex items-center gap-1.5 bg-[var(--accent)]/10 text-[var(--accent-light)] px-3 py-1 rounded-full border border-[var(--accent)]/20 shadow-inner">
                  ⚡ {user.totalXpEarned} XP • Lvl {user.level || 1}
                </div>
              </div>
            )}
            <div className="text-sm text-[var(--text-muted)]">
              Hi, <span className="text-[var(--foreground)] font-semibold">{user?.name?.split(' ')[0]}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors ml-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-[var(--foreground)] p-2 hover:bg-[var(--surface-light)] rounded-lg transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden glass border border-[var(--border)] mt-4 mx-2 rounded-xl p-6 animate-slide-up shadow-2xl">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Signed in as</p>
                <p className="font-bold text-[var(--foreground)] truncate max-w-[200px]">{user?.name}</p>
              </div>
              {user?.totalXpEarned !== undefined && (
                <div className="flex flex-col gap-1 items-end">
                  <div className="text-sm font-semibold flex items-center gap-1.5 bg-[var(--accent)]/10 text-[var(--accent-light)] px-3 py-1 rounded-full border border-[var(--accent)]/20">
                    ⚡ {user.totalXpEarned} XP
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/"
              className="text-[var(--text-muted)] hover:text-white transition-colors font-medium py-2 flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl">🏠</span> Home
            </Link>
            <Link
              href="/tracks"
              className="text-[var(--text-muted)] hover:text-white transition-colors font-medium py-2 flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl">🗺️</span> Tracks
            </Link>
            <Link
              href="/dashboard"
              className="text-[var(--text-muted)] hover:text-white transition-colors font-medium py-2 flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl">📊</span> Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-[var(--text-muted)] hover:text-white transition-colors font-medium py-2 flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl">👤</span> Profile
            </Link>
            <Link
              href="/leaderboard"
              className="text-[var(--text-muted)] hover:text-white transition-colors font-medium py-2 flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl">🏅</span> Leaderboard
            </Link>
            <Link
              href="/ai-teacher"
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium py-2 flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl">🤖</span> AI Teacher
            </Link>

            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="btn-secondary w-full text-center text-red-400 border-red-500/20 hover:bg-red-500/10 !py-3 mt-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
