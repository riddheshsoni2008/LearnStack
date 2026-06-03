"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TracksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Auth check
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));

    // 2. Fetch tracks
    const fetchTracks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tracks");
        const data = await res.json();
        if (data.success) {
          setTracks(data.data);
        } else {
          setError(data.message || "Failed to load tracks.");
        }
      } catch (err) {
        setError("Error connecting to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--text-muted)] text-lg animate-pulse">Loading tracks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top nav */}
      <nav className="glass border-b border-[var(--border)] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">L</div>
            <span className="text-lg font-bold">Learn<span className="gradient-text">Stack</span></span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
              Dashboard
            </Link>
            <div className="text-sm text-[var(--text-muted)] border-l border-[var(--border)] pl-6">
              Welcome, <span className="text-[var(--foreground)] font-medium">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        <h1 className="text-4xl font-extrabold mb-3">
          Select Your <span className="gradient-text">Learning Path</span>
        </h1>
        <p className="text-[var(--text-muted)] max-w-2xl">
          Start from zero and learn step-by-step with structured, gamified tracks. Earn XP, maintain your streak, and level up!
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {error ? (
          <div className="glass border border-red-500/30 rounded-2xl p-6 text-red-400 text-center max-w-lg mx-auto mt-10">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {tracks.map((track) => (
              <div key={track._id} className="glass rounded-2xl p-8 border border-[var(--border)] card-hover flex flex-col justify-between">
                <div>
                  {/* Category level and tags */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary-light)]">
                      ⚡ {track.level}
                    </span>
                    <div className="flex gap-2">
                      {track.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--surface-light)] text-[var(--text-muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold mb-3">{track.title}</h3>
                  <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
                    {track.description}
                  </p>

                  {/* Track specs */}
                  <div className="grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-6 mb-8 text-center">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Duration</div>
                      <div className="text-base font-bold">{track.totalWeeks} Weeks</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Lessons</div>
                      <div className="text-base font-bold">{track.totalLessons} Parts</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Curriculum</div>
                      <div className="text-base font-bold text-[var(--accent)]">100% Free</div>
                    </div>
                  </div>
                </div>

                {/* CTA Action */}
                <Link href={`/tracks/${track._id}`} className="btn-primary text-center !py-3 w-full">
                  Start Track
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
