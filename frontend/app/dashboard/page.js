"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";

// ═══════════════════════════════════════════════════════════════
// XP Progress Ring Component
// ═══════════════════════════════════════════════════════════════
function XPRing({ level, levelTitle, progress, xp }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="140" height="140" className="transform -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(108,92,231,0.15)" strokeWidth="8" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke="url(#xpGradient)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6c5ce7" />
            <stop offset="100%" stopColor="#00cec9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-black gradient-text">{level}</div>
        <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">{levelTitle}</div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs text-[var(--text-muted)]">{progress}% to Level {level + 1}</div>
        <div className="text-xs font-bold text-yellow-400">⚡ {xp} XP</div>
      </div>
    </div>
  );
}

function StreakCalendar({ streak, longestStreak }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      day: days[d.getDay()],
      date: d.getDate(),
      active: i >= (7 - Math.min(streak, 7)),
      isToday: i === 6,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[var(--foreground)]">🔥 Streak Calendar</h3>
        <div className="text-xs text-[var(--text-muted)]">
          Best: <span className="text-orange-400 font-bold">{longestStreak}</span> days
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {last7Days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="text-[10px] text-[var(--text-muted)] uppercase">{d.day}</div>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${d.active
                ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                : "bg-[var(--surface-light)] text-[var(--text-muted)] border border-[var(--border)]"
                } ${d.isToday ? "ring-2 ring-orange-400/50" : ""}`}
            >
              {d.active ? "🔥" : d.date}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center">
        <span className="text-2xl font-black text-orange-400">{streak}</span>
        <span className="text-xs text-[var(--text-muted)] ml-1">day streak</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Badge Card
// ═══════════════════════════════════════════════════════════════
const RARITY_STYLES = {
  common: { border: "border-gray-500/30", bg: "bg-gray-500/10", text: "text-gray-300", label: "Common" },
  rare: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", label: "Rare" },
  epic: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400", label: "Epic" },
  legendary: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Legendary" },
};

function BadgeCard({ badge, earned = false }) {
  const style = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
  return (
    <div
      className={`relative rounded-xl p-3 border transition-all ${earned
        ? `${style.border} ${style.bg} shadow-lg`
        : "border-[var(--border)] bg-[var(--surface-light)] opacity-40 grayscale"
        }`}
    >
      <div className="text-center">
        <div className="text-2xl mb-1">{badge.icon}</div>
        <div className={`text-[10px] font-bold ${earned ? style.text : "text-[var(--text-muted)]"}`}>
          {badge.name}
        </div>
      </div>
      {earned && (
        <div className={`absolute -top-1 -right-1 text-[8px] px-1.5 py-0.5 rounded-full font-bold ${style.bg} ${style.text} border ${style.border}`}>
          {style.label}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Dashboard Page
// ═══════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      try {
        const [badgesRes, myBadgesRes, tracksRes, progressRes] = await Promise.all([
          fetch("/api/badges", { cache: "no-store" }),
          fetch("/api/badges/me", { cache: "no-store" }),
          fetch("/api/tracks", { cache: "no-store" }),
          fetch("/api/progress/me", { cache: "no-store" }),
        ]);

        const [badgesData, myBadgesData, tracksData, progressData] = await Promise.all([
          badgesRes.json(), myBadgesRes.json(), tracksRes.json(), progressRes.json(),
        ]);

        if (badgesData.success) setAllBadges(badgesData.data);
        if (myBadgesData.success) setMyBadges(myBadgesData.data);
        if (tracksData.success) setTracks(tracksData.data);
        if (progressData.success) setProgress(progressData.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-muted)] animate-pulse">Loading...</div>
      </div>
    );
  }

  const earnedBadgeIds = myBadges.map((b) => b._id);
  const completedLessons = progress.filter((p) => p.completed).length;
  const totalLessons = tracks.reduce((acc, t) => acc + (t.totalLessons || 0), 0);
  const overallPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Track progress map
  const trackProgressMap = {};
  progress.forEach((p) => {
    if (p.trackId?._id) {
      trackProgressMap[p.trackId._id] = (trackProgressMap[p.trackId._id] || 0) + 1;
    }
  });

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <AuthNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Welcome back, <span className="gradient-text">{user.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Here&apos;s your learning dashboard</p>
        </div>

        {/* ═══ Top Stats Row ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* XP Ring Card */}
          <div className="glass rounded-2xl p-6 flex items-center justify-center">
            <XPRing
              level={user.level || 1}
              levelTitle={user.levelTitle || "Newbie"}
              progress={user.currentLevelProgress?.percent || 0}
              xp={user.totalXpEarned || 0}
            />
          </div>

          {/* Streak Calendar */}
          <div className="glass rounded-2xl p-6">
            <StreakCalendar streak={user.streak || 0} longestStreak={user.longestStreak || 0} />
          </div>

          {/* Quick Stats */}
          <div className="glass rounded-2xl p-6 flex flex-col justify-between gap-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">📊 Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: "Lessons Completed", value: completedLessons, icon: "📚", color: "text-blue-400" },
                { label: "Overall Progress", value: `${overallPercent}%`, icon: "📈", color: "text-emerald-400" },
                { label: "Badges Earned", value: myBadges.length, icon: "🏆", color: "text-purple-400" },
                { label: "Tracks Started", value: Object.keys(trackProgressMap).length, icon: "🗺️", color: "text-cyan-400" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">{stat.icon} {stat.label}</span>
                  <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Badges Section ═══ */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">🏆 Achievements</h3>
            <Link href="/profile" className="text-xs text-[var(--primary-light)] hover:underline">
              View All →
            </Link>
          </div>
          {dataLoading ? (
            <div className="text-xs text-[var(--text-muted)] animate-pulse">Loading badges...</div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
              {allBadges.slice(0, 9).map((badge) => (
                <BadgeCard
                  key={badge._id}
                  badge={badge}
                  earned={earnedBadgeIds.includes(badge._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ═══ Track Progress ═══ */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">📚 Track Progress</h3>
            <Link href="/tracks" className="text-xs text-[var(--primary-light)] hover:underline">
              All Tracks →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => {
              const completed = trackProgressMap[track._id] || 0;
              const total = track.totalLessons || 1;
              const pct = Math.round((completed / total) * 100);
              return (
                <Link key={track._id} href={`/course/${track.title.toLowerCase().replace(/[\s&]+/g, "-").replace(/[.]/g, "-js")}`}>
                  <div className="bg-[var(--surface-light)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)] transition-all cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-bold group-hover:text-[var(--primary-light)] transition-colors truncate">{track.title}</h4>
                      <span className="text-xs font-bold text-[var(--primary-light)]">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1">{completed}/{total} lessons</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ═══ Continue Learning ═══ */}
        <div className="glass rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-2">
            {completedLessons > 0 ? "Keep Going!" : "Start Your Journey!"}
          </h2>
          <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto text-sm">
            {completedLessons > 0
              ? `You've completed ${completedLessons} lessons. Pick up where you left off!`
              : "Choose a learning track and begin your journey to becoming a full stack developer."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/tracks" className="btn-primary !py-3 !px-8 text-sm">
              Browse Tracks
            </Link>
            <Link href="/leaderboard" className="btn-secondary !py-3 !px-8 text-sm">
              🏅 Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
