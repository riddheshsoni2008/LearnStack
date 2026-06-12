"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "glass py-3" : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110">
            L
          </div>
          <span className="text-xl font-bold tracking-tight">
            Learn<span className="gradient-text">Stack</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">Features</a>
          <a href="#tracks" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">Course</a>
          <a href="#how-it-works" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">How It Works</a>
          <a href="#community" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">Community</a>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {!loading && user ? (
            <>
              <Link href="/profile" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">
                Profile
              </Link>
              <Link href="/dashboard" className="btn-primary text-sm !py-2.5 !px-6">
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors px-4 py-2">
                Log In
              </Link>
              <Link href="/register" className="btn-primary text-sm !py-2.5 !px-6">
                Start Learning — Free
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-[var(--foreground)] p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden glass mt-2 mx-4 rounded-xl p-6 animate-slide-up">
          <div className="flex flex-col gap-4">
            <a href="#features" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors font-medium" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#tracks" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors font-medium" onClick={() => setMobileOpen(false)}>Tracks</a>
            <a href="#how-it-works" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors font-medium" onClick={() => setMobileOpen(false)}>How It Works</a>
            <hr className="border-[var(--border)]" />
            {!loading && user ? (
              <>
                <Link href="/profile" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors font-medium">Profile</Link>
                <Link href="/dashboard" className="btn-primary text-center text-sm !py-3">Go to Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[var(--text-muted)] font-medium">Log In</Link>
                <Link href="/register" className="btn-primary text-center text-sm !py-3">Start Learning — Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
