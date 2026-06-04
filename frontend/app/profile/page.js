"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, fetchUser } = useAuth();
  
  const [progress, setProgress] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      try {
        // Force refresh user data to get latest XP, Level, and Last Active
        await fetchUser();
        
        // Fetch user progress
        const progRes = await fetch("/api/progress/me", { cache: "no-store" });
        const progData = await progRes.json();
        if (progData.success) {
          setProgress(progData.data);
        }

        // Fetch all tracks to calculate total lessons
        const tracksRes = await fetch("/api/tracks", { cache: "no-store" });
        const tracksData = await tracksRes.json();
        if (tracksData.success) {
          setTracks(tracksData.data);
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--text-muted)] text-lg animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate Overall Progress
  const completedLessons = progress.filter(p => p.completed).length;
  const totalLessons = tracks.reduce((acc, track) => acc + (track.totalLessons || 0), 0);
  const overallPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <AuthNavbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 mb-10 sm:mb-12 text-center md:text-left">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-lg border-4 border-[var(--background)] ring-2 ring-[var(--primary-dark)]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-1 sm:mb-2">{user.name}</h1>
            <p className="text-[var(--text-muted)] text-base sm:text-lg mb-4">{user.email}</p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--surface-light)] border border-[var(--border)]">
              <span className="text-sm font-bold gradient-text uppercase tracking-wider">
                Level: {user.level || "Beginner"}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--text-muted)]">
              <span>📅 Member Since: {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}</span>
              {user.lastActive && (
                <span>🕐 Last Active: {new Date(user.lastActive).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* XP Card */}
          <div className="glass border border-[var(--border)] rounded-2xl p-6 text-center shadow-lg transform transition hover:scale-105">
            <div className="text-4xl mb-3">⚡</div>
            <div className="text-3xl font-black text-yellow-400 mb-1">{user.xp || 0}</div>
            <div className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Total XP</div>
          </div>

          {/* Streak Card */}
          <div className="glass border border-[var(--border)] rounded-2xl p-6 text-center shadow-lg transform transition hover:scale-105">
            <div className="text-4xl mb-3">🔥</div>
            <div className="text-3xl font-black text-orange-500 mb-1">{user.streak || 0}</div>
            <div className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Day Streak</div>
          </div>

          {/* Lessons Card */}
          <div className="glass border border-[var(--border)] rounded-2xl p-6 text-center shadow-lg transform transition hover:scale-105">
            <div className="text-4xl mb-3">📚</div>
            <div className="text-3xl font-black text-[var(--primary-light)] mb-1">{completedLessons}</div>
            <div className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Lessons Completed</div>
          </div>
        </div>

        {/* Overall Progress Section */}
        <div className="glass border border-[var(--border)] rounded-2xl p-8 mb-12 shadow-xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Overall Journey</h3>
              <p className="text-sm text-[var(--text-muted)]">Your progress across the entire LearnStack curriculum.</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black gradient-text">{overallPercent}%</span>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-4 bg-[#0a0a0f] rounded-full overflow-hidden border border-[var(--border)] mt-6 relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[var(--primary-dark)] via-[var(--primary)] to-[var(--accent)] transition-all duration-1000 ease-out relative"
              style={{ width: `${overallPercent}%` }}
            >
              {/* Shine effect */}
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }}></div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>{completedLessons} Completed</span>
            <span>{totalLessons} Total Lessons</span>
          </div>
        </div>
      </div>
    </div>
  );
}
