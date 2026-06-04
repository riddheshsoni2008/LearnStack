"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";

// ═══════════════════════════════════════════════════════════════
// Rarity Styles
// ═══════════════════════════════════════════════════════════════
const RARITY_STYLES = {
  common: { border: "border-gray-500/30", bg: "bg-gray-500/10", text: "text-gray-300", label: "Common", glow: "" },
  rare: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", label: "Rare", glow: "shadow-blue-500/10" },
  epic: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400", label: "Epic", glow: "shadow-purple-500/10" },
  legendary: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Legendary", glow: "shadow-yellow-500/20" },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, fetchUser } = useAuth();
  
  const [progress, setProgress] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [xpHistory, setXpHistory] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Auto-refresh Last Active every 60 seconds
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      fetchUser();
    }, 60000);
    return () => clearInterval(intervalId);
  }, [user, fetchUser]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      try {
        const [progRes, tracksRes, badgesRes, myBadgesRes, xpRes] = await Promise.all([
          fetch("/api/progress/me", { cache: "no-store" }),
          fetch("/api/tracks", { cache: "no-store" }),
          fetch("/api/badges", { cache: "no-store" }),
          fetch("/api/badges/me", { cache: "no-store" }),
          fetch("/api/badges/xp-history", { cache: "no-store" }),
        ]);

        const [progData, tracksData, badgesData, myBadgesData, xpData] = await Promise.all([
          progRes.json(), tracksRes.json(), badgesRes.json(), myBadgesRes.json(), xpRes.json(),
        ]);

        if (progData.success) setProgress(progData.data);
        if (tracksData.success) setTracks(tracksData.data);
        if (badgesData.success) setAllBadges(badgesData.data);
        if (myBadgesData.success) setMyBadges(myBadgesData.data);
        if (xpData.success) setXpHistory(xpData.data);
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

  // Calculations
  const completedLessons = progress.filter(p => p.completed).length;
  const totalLessons = tracks.reduce((acc, track) => acc + (track.totalLessons || 0), 0);
  const overallPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const earnedBadgeIds = myBadges.map(b => b._id);

  // Track progress map
  const trackProgressMap = {};
  progress.forEach((p) => {
    if (p.trackId?._id) {
      trackProgressMap[p.trackId._id] = (trackProgressMap[p.trackId._id] || 0) + 1;
    }
  });

  // Level progress
  const levelProgress = user.currentLevelProgress || { percent: 0, xpIntoLevel: 0, xpForLevel: 1 };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <AuthNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        {/* ═══ Profile Header ═══ */}
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 mb-10 sm:mb-12 text-center md:text-left">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-lg border-4 border-[var(--background)] ring-2 ring-[var(--primary-dark)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {/* Level badge overlay */}
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-xs font-black rounded-full w-8 h-8 flex items-center justify-center border-2 border-[var(--background)] shadow-lg">
              {user.level || 1}
            </div>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-1 sm:mb-2">{user.name}</h1>
            <p className="text-[var(--text-muted)] text-base sm:text-lg mb-3">{user.email}</p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[var(--surface-light)] border border-[var(--border)] gap-2">
              <span className="text-sm font-bold gradient-text uppercase tracking-wider">
                Level {user.level || 1} — {user.levelTitle || "Newbie"}
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

        {/* ═══ Level Progress Bar ═══ */}
        <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold">Level Progress</h3>
              <p className="text-xs text-[var(--text-muted)]">
                {user.xpToNextLevel > 0 ? `${user.xpToNextLevel} XP to Level ${(user.level || 1) + 1}` : "Max Level!"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black gradient-text">{levelProgress.percent}%</span>
            </div>
          </div>
          <div className="w-full h-3 bg-[#0a0a0f] rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--primary-dark)] via-[var(--primary)] to-[var(--accent)] transition-all duration-1000 ease-out relative rounded-full"
              style={{ width: `${levelProgress.percent}%` }}
            >
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }} />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[var(--text-muted)]">
            <span>{levelProgress.xpIntoLevel} XP into level</span>
            <span>{levelProgress.xpForLevel} XP needed</span>
          </div>
        </div>

        {/* ═══ Stats Grid ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total XP", value: user.xp || 0, icon: "⚡", color: "text-yellow-400" },
            { label: "Day Streak", value: user.streak || 0, icon: "🔥", color: "text-orange-500" },
            { label: "Lessons", value: completedLessons, icon: "📚", color: "text-blue-400" },
            { label: "Badges", value: myBadges.length, icon: "🏆", color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass border border-[var(--border)] rounded-xl p-4 text-center transform transition hover:scale-105">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ═══ Badge Showcase ═══ */}
        <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">🏆 Badge Showcase</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {allBadges.map((badge) => {
              const earned = earnedBadgeIds.includes(badge._id);
              const style = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
              return (
                <div
                  key={badge._id}
                  className={`relative rounded-xl p-3 border transition-all text-center ${
                    earned
                      ? `${style.border} ${style.bg} shadow-lg ${style.glow}`
                      : "border-[var(--border)] bg-[var(--surface-light)] opacity-30 grayscale"
                  }`}
                  title={`${badge.name}: ${badge.description}`}
                >
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <div className={`text-[10px] font-bold ${earned ? style.text : "text-[var(--text-muted)]"} truncate`}>
                    {badge.name}
                  </div>
                  <div className="text-[8px] text-[var(--text-muted)] mt-0.5 line-clamp-2">{badge.description}</div>
                  {earned && (
                    <div className={`absolute -top-1 -right-1 text-[7px] px-1.5 py-0.5 rounded-full font-bold ${style.bg} ${style.text} border ${style.border}`}>
                      {style.label}
                    </div>
                  )}
                  {!earned && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl opacity-50">🔒</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4 text-xs text-[var(--text-muted)]">
            {myBadges.length} / {allBadges.length} badges earned
          </div>
        </div>

        {/* ═══ Track Progress ═══ */}
        <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">📚 Track Progress</h3>
          <div className="space-y-3">
            {tracks.map((track) => {
              const completed = trackProgressMap[track._id] || 0;
              const total = track.totalLessons || 1;
              const pct = Math.round((completed / total) * 100);
              return (
                <div key={track._id} className="bg-[var(--surface-light)] border border-[var(--border)] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold truncate">{track.title}</h4>
                    <span className={`text-xs font-bold ${pct === 100 ? "text-emerald-400" : "text-[var(--primary-light)]"}`}>
                      {pct === 100 ? "✅ Complete" : `${pct}%`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct === 100
                          ? "bg-gradient-to-r from-emerald-500 to-green-400"
                          : "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">{completed}/{total} lessons completed</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ Overall Journey ═══ */}
        <div className="glass border border-[var(--border)] rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Overall Journey</h3>
              <p className="text-sm text-[var(--text-muted)]">Your progress across the entire LearnStack curriculum.</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black gradient-text">{overallPercent}%</span>
            </div>
          </div>
          <div className="w-full h-4 bg-[#0a0a0f] rounded-full overflow-hidden border border-[var(--border)] mt-6 relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[var(--primary-dark)] via-[var(--primary)] to-[var(--accent)] transition-all duration-1000 ease-out relative"
              style={{ width: `${overallPercent}%` }}
            >
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)' }}></div>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <span>{completedLessons} Completed</span>
            <span>{totalLessons} Total Lessons</span>
          </div>
        </div>

        {/* ═══ Recent XP History ═══ */}
        {xpHistory.length > 0 && (
          <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">📜 Recent XP History</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {xpHistory.slice(0, 20).map((entry) => (
                <div key={entry._id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--surface-light)] border border-[var(--border)]">
                  <div>
                    <div className="text-xs font-medium">{entry.description}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {new Date(entry.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-yellow-400">+{entry.amount} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
