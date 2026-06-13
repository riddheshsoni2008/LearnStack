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

// ═══════════════════════════════════════════════════════════════
// Cosmetic Styles
// ═══════════════════════════════════════════════════════════════
const THEME_STYLES = {
  default: "bg-[var(--background)]",
  theme_blue: "bg-gradient-to-br from-blue-950 via-[var(--background)] to-[var(--background)]",
  theme_neon: "bg-gradient-to-br from-purple-900/40 via-fuchsia-900/20 to-[var(--background)]",
  theme_galaxy: "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-[var(--background)]"
};

const BORDER_STYLES = {
  none: "border-4 border-[var(--background)] ring-2 ring-[var(--primary-dark)]",
  border_gold: "border-4 border-yellow-400 ring-2 ring-yellow-600 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse-glow",
  border_fire: "border-4 border-orange-500 ring-2 ring-red-600 shadow-[0_0_20px_rgba(249,115,22,0.8)]"
};

const TITLE_STYLES = {
  title_warrior: { text: "CODE WARRIOR", icon: "⚔️" },
  title_ninja: { text: "CODE NINJA", icon: "🥷" }
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, fetchUser } = useAuth();

  const [progress, setProgress] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [xpHistory, setXpHistory] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Auto-refresh Last Active every 60 seconds
  useEffect(() => {
    if (!user?._id) return;
    const intervalId = setInterval(() => {
      fetchUser();
    }, 60000);
    return () => clearInterval(intervalId);
  }, [user?._id, fetchUser]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      if (!user?._id) {
        setDataLoading(false);
        return;
      }
      try {
        const [progRes, tracksRes, badgesRes, myBadgesRes, xpRes, certRes] = await Promise.all([
          fetch("/api/progress/me", { cache: "no-store", credentials: "include" }),
          fetch("/api/tracks", { cache: "no-store", credentials: "include" }),
          fetch("/api/badges", { cache: "no-store", credentials: "include" }),
          fetch("/api/badges/me", { cache: "no-store", credentials: "include" }),
          fetch("/api/badges/xp-history", { cache: "no-store", credentials: "include" }),
          fetch("/api/certificates/me", { cache: "no-store", credentials: "include" }),
        ]);

        const parseIfOk = async (res) => {
          if (!res.ok) return null;
          return res.json();
        };

        const [progData, tracksData, badgesData, myBadgesData, xpData, certData] = await Promise.all([
          parseIfOk(progRes), parseIfOk(tracksRes), parseIfOk(badgesRes),
          parseIfOk(myBadgesRes), parseIfOk(xpRes), parseIfOk(certRes),
        ]);

        if (progData?.success) setProgress(progData.data);
        if (tracksData?.success) setTracks(tracksData.data);
        if (badgesData?.success) setAllBadges(badgesData.data);
        if (myBadgesData?.success) setMyBadges(myBadgesData.data);
        if (xpData?.success) setXpHistory(xpData.data);
        if (certData?.success) setCertificates(certData.data);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user?._id, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div key="loading-profile" className="min-h-screen bg-[var(--background)] pb-20">
        <AuthNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 animate-pulse">
          {/* Profile Header Skeleton */}
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 mb-10 sm:mb-12 text-center md:text-left">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[var(--surface-light)] border-4 border-[var(--surface)]"></div>
              <div className="absolute -bottom-1 -right-1 bg-[var(--surface-light)] rounded-full w-8 h-8 border-2 border-[var(--background)]"></div>
            </div>
            <div className="flex-1">
              <div className="h-8 bg-[var(--surface-light)] w-48 rounded mb-2 mx-auto md:mx-0"></div>
              <div className="h-4 bg-[var(--surface-light)] w-64 rounded mb-4 mx-auto md:mx-0"></div>
              <div className="h-8 bg-[var(--surface-light)] w-56 rounded-full mx-auto md:mx-0"></div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="h-3 bg-[var(--surface-light)] w-36 rounded"></div>
                <div className="h-3 bg-[var(--surface-light)] w-44 rounded"></div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar Skeleton */}
          <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="h-4 bg-[var(--surface-light)] w-28 rounded mb-1"></div>
                <div className="h-3 bg-[var(--surface-light)] w-36 rounded"></div>
              </div>
              <div className="h-6 bg-[var(--surface-light)] w-12 rounded"></div>
            </div>
            <div className="w-full h-3 bg-[#0a0a0f] rounded-full border border-[var(--border)]"></div>
            <div className="flex justify-between mt-2">
              <div className="h-3 bg-[var(--surface-light)] w-24 rounded"></div>
              <div className="h-3 bg-[var(--surface-light)] w-24 rounded"></div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass border border-[var(--border)] rounded-xl p-4 text-center">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-light)] mx-auto mb-1"></div>
                <div className="h-6 bg-[var(--surface-light)] w-12 rounded mx-auto mb-1"></div>
                <div className="h-3 bg-[var(--surface-light)] w-16 rounded mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Achievements / Badges Grid Skeleton */}
          <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8">
            <div className="h-5 bg-[var(--surface-light)] w-32 rounded mb-4"></div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[var(--surface-light)] border border-[var(--border)] rounded-xl p-3 h-28"></div>
              ))}
            </div>
          </div>

          {/* Track Progress Skeleton */}
          <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8">
            <div className="h-5 bg-[var(--surface-light)] w-32 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-[var(--surface-light)] border border-[var(--border)] rounded-xl p-4 h-24"></div>
              ))}
            </div>
          </div>
        </div>
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

  // Group badges
  const achievementBadges = allBadges.filter(b => !b.condition.startsWith('MYSTERY'));
  const exclusiveBadges = allBadges.filter(b => b.condition.startsWith('MYSTERY'));


  // Level progress
  const levelProgress = user.currentLevelProgress || { percent: 0, xpIntoLevel: 0, xpForLevel: 1 };

  let displayTitle = user?.levelTitle || "Learner";

  return (
    <div key="loaded-profile" className={`min-h-screen pb-20 bg-[var(--background)]`}>
      <AuthNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        {/* ═══ Profile Header ═══ */}
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 mb-10 sm:mb-12 text-center md:text-left">
          <div className="relative">
            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-lg border-4 border-[var(--surface)]`}>
              {user?.name?.charAt(0).toUpperCase()}
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
                Level {user.level || 1} — {displayTitle}
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
            { label: "Total XP", value: user.totalXpEarned || 0, icon: "⚡", color: "text-yellow-400" },
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

        {/* ═══ Certificates Showcase (Professional) ═══ */}
        {certificates.length > 0 && (
          <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8 shadow-xl shadow-yellow-500/10">
            <div className="border-b border-[var(--border)] pb-4 mb-6">
              <h3 className="text-xl font-bold tracking-wide uppercase text-yellow-400">🎓 Professional Certifications</h3>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Verified Credentials Archive</p>
            </div>

            {/* 🌟 BEST STUDENT HERO SECTION (PROFESSIONAL CERTIFICATES) 🌟 */}
            {certificates.filter(c => c.certificateType === 'PROFESSIONAL').map((cert) => (
              <div key={cert._id} className="mb-8 relative group overflow-hidden rounded-xl border-2 border-yellow-500 bg-gradient-to-br from-yellow-500/10 to-purple-500/10 p-1">
                <div className="absolute inset-0 bg-yellow-500/20 blur-2xl opacity-50 pointer-events-none"></div>
                <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 sm:p-10 text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h4 className="font-extrabold text-2xl sm:text-3xl text-yellow-400 mb-2 uppercase tracking-widest">
                    Best Student of LearnStack
                  </h4>
                  <p className="text-[var(--text-muted)] max-w-lg mx-auto mb-6 text-sm">
                    This incredibly rare credential is only awarded to individuals who have achieved 100% completion across all published courses on the platform.
                  </p>

                  <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs">
                    <div className="bg-[var(--surface-light)] border border-[var(--border)] px-4 py-2 rounded">
                      <span className="block text-[10px] uppercase text-[var(--text-muted)] mb-1">Credential</span>
                      <span className="font-mono text-[var(--text)]">{cert.certificateId}</span>
                    </div>
                    <div className="bg-[var(--surface-light)] border border-[var(--border)] px-4 py-2 rounded">
                      <span className="block text-[10px] uppercase text-[var(--text-muted)] mb-1">Completion</span>
                      <span className="font-bold text-emerald-400">{cert.completionPercentage}%</span>
                    </div>
                    <div className="bg-[var(--surface-light)] border border-[var(--border)] px-4 py-2 rounded">
                      <span className="block text-[10px] uppercase text-[var(--text-muted)] mb-1">Issued</span>
                      <span className="font-bold text-[var(--text)]">{new Date(cert.issuedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Link href={`/certificates/${cert.certificateId}`} className="bg-yellow-500 text-black text-sm font-bold uppercase tracking-wider py-3 px-8 rounded hover:bg-yellow-400 transition">
                      View Flagship Credential
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* STANDARD CERTIFICATES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.filter(c => c.certificateType !== 'PROFESSIONAL').map((cert) => (
                <div key={cert._id} className="bg-[var(--surface-light)] border border-[var(--border)] rounded-xl p-5 hover:bg-[var(--surface)] transition duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-3 rounded">
                        {cert.certificateType}
                      </span>
                      <h4 className="font-bold text-lg text-[var(--text)] leading-snug">
                        {cert.certificateType === 'ADVANCED' ? 'Advanced Developer Achievement' : cert.trackName}
                      </h4>
                    </div>
                    {cert.isRevoked ? (
                      <span className="text-red-400 font-bold text-xs uppercase tracking-widest border border-red-500/30 bg-red-500/10 px-2 py-1 rounded">Revoked</span>
                    ) : (
                      <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-6 text-xs">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-1">ID</span>
                      <span className="font-mono text-[var(--text)]">{cert.certificateId}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Date</span>
                      <span className="text-[var(--text)]">{new Date(cert.issuedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Score</span>
                      <span className="font-bold text-emerald-400">{cert.completionPercentage}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/certificates/${cert.certificateId}`} className="flex-1 bg-[var(--primary)] text-white text-center text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded hover:bg-[var(--primary-dark)] transition">
                      View
                    </Link>
                    <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-center text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded hover:bg-[var(--background)] transition">
                      Verify
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Badge Showcase ═══ */}
        <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">🏆 Achievements</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {achievementBadges.map((badge) => {
              const earned = earnedBadgeIds.includes(badge._id);
              const style = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
              return (
                <div
                  key={badge._id}
                  className={`relative rounded-xl p-3 border transition-all text-center ${earned
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
            {myBadges.filter(b => !b.condition.startsWith('MYSTERY')).length} / {achievementBadges.length} achievements earned
          </div>
        </div>

        {exclusiveBadges.length > 0 && (
          <div className="glass border border-[var(--border)] rounded-2xl p-6 mb-8 border-purple-500/30 shadow-lg shadow-purple-500/10">
            <h3 className="text-lg font-bold mb-4 text-purple-400"> Exclusive Rewards</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">Rare badges obtained only through the Mystery Box.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {exclusiveBadges.map((badge) => {
                const earned = earnedBadgeIds.includes(badge._id);
                const style = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
                return (
                  <div
                    key={badge._id}
                    className={`relative rounded-xl p-3 border transition-all text-center ${earned
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
              {myBadges.filter(b => b.condition.startsWith('MYSTERY')).length} / {exclusiveBadges.length} exclusive rewards earned
            </div>
          </div>
        )}

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
                      className={`h-full rounded-full transition-all duration-700 ${pct === 100
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
