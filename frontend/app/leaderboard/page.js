"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";

const RANK_STYLES = {
  1: { bg: "from-yellow-500/20 to-amber-600/20", border: "border-yellow-500/40", medal: "🥇", glow: "shadow-yellow-500/20" },
  2: { bg: "from-gray-300/20 to-gray-400/20", border: "border-gray-400/40", medal: "🥈", glow: "shadow-gray-400/20" },
  3: { bg: "from-amber-700/20 to-orange-800/20", border: "border-amber-700/40", medal: "🥉", glow: "shadow-amber-700/20" },
};

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchLeaderboard = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/leaderboard", {
          cache: "no-store",
          credentials: "include"
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error("Leaderboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, authLoading, router]);

  const togglePrivacy = async () => {
    try {
      await fetch("/api/leaderboard/privacy", {
        method: "PUT",
        credentials: "include"
      });
      // Refresh
      const res = await fetch("/api/leaderboard", {
        cache: "no-store",
        credentials: "include"
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error("Toggle privacy error:", err);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <AuthNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[var(--text-muted)] animate-pulse">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  const leaderboard = data?.leaderboard || [];
  const myRank = data?.myRank;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <AuthNavbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">
            🏅 <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Top learners ranked by XP • {data?.totalUsers || 0} total learners
          </p>
        </div>

        {/* My Rank Card */}
        {myRank && (
          <div className="glass border border-[var(--primary)]/30 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg shadow-[var(--primary)]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-lg font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm">{user.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Level {myRank.level} • {myRank.levelTitle}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black gradient-text">#{myRank.rank}</div>
                <div className="text-xs text-yellow-400 font-bold">⚡ {myRank.totalXpEarned} XP</div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={togglePrivacy}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--surface-light)] border border-[var(--border)] text-[var(--text-muted)] hover:text-white transition-colors"
          >
            {user.hideFromLeaderboard ? "👁️ Show on Leaderboard" : "🙈 Hide from Leaderboard"}
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isMe = entry._id === user._id;
            const rankStyle = RANK_STYLES[entry.rank];
            const isTop3 = entry.rank <= 3;

            return (
              <div
                key={entry._id}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all ${
                  isMe
                    ? "border-[var(--primary)]/40 bg-[var(--primary)]/5 shadow-lg shadow-[var(--primary)]/10"
                    : isTop3 && rankStyle
                    ? `bg-gradient-to-r ${rankStyle.bg} ${rankStyle.border} shadow-lg ${rankStyle.glow}`
                    : "border-[var(--border)] bg-[var(--surface-light)] hover:border-[var(--primary)]/30"
                }`}
              >
                {/* Rank */}
                <div className="w-10 text-center flex-shrink-0">
                  {isTop3 && rankStyle ? (
                    <span className="text-2xl">{rankStyle.medal}</span>
                  ) : (
                    <span className="text-sm font-bold text-[var(--text-muted)]">#{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                  isMe ? "bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]" : "bg-[var(--surface)] border border-[var(--border)]"
                }`}>
                  {entry.initial}
                </div>

                {/* Name & Level */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold truncate ${isMe ? "text-[var(--primary-light)]" : ""}`}>
                    {entry.name} {isMe && "(You)"}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Lvl {entry.level} • {entry.levelTitle}
                    {entry.streak > 0 && <span className="ml-1">🔥{entry.streak}</span>}
                    {entry.badgesCount > 0 && <span className="ml-1">🏆{entry.badgesCount}</span>}
                  </div>
                </div>

                {/* XP */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-black text-yellow-400">⚡ {entry.totalXpEarned}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">XP</div>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <div className="text-4xl mb-3">🏅</div>
              <p className="text-sm">No leaderboard data yet. Start learning to earn XP!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
