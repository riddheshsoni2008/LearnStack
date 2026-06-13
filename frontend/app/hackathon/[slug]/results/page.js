"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import QualificationBadge from "@/components/hackathon/QualificationBadge";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/hackathons/${params.slug}/results`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchResults();
  }, [user, authLoading, router, params.slug]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <AuthNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-2xl font-bold mb-3">No Results Found</h1>
          <p className="text-[var(--text-muted)] mb-6">You haven&apos;t participated in any rounds yet.</p>
          <Link href={`/hackathon/${params.slug}`} className="btn-primary !py-3 !px-6">
            Go to Hackathon
          </Link>
        </div>
      </div>
    );
  }

  const { registration, submissions, rank, totalParticipants, hackathonTitle } = results;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AuthNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href={`/hackathon/${params.slug}`} className="text-sm text-[var(--primary-light)] hover:underline mb-6 inline-block">
          ← Back to {hackathonTitle}
        </Link>

        {/* ═══ Summary Header ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black mb-2">Your Results</h1>
                <p className="text-[var(--text-muted)]">{hackathonTitle}</p>
              </div>
              <QualificationBadge status={registration.status} size="lg" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Rank", value: rank > 0 ? `#${rank}` : "—", subtext: `of ${totalParticipants}`, icon: "🏅" },
                { label: "Total Score", value: registration.totalScore, icon: "⭐" },
                { label: "Time Taken", value: `${Math.round(registration.totalTimeTaken / 60)}m`, icon: "⏱️" },
                { label: "Rounds", value: `${submissions.length}`, icon: "📊" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[var(--surface-light)] rounded-xl p-4 border border-[var(--border)] text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className="text-xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">{stat.label}</div>
                  {stat.subtext && <div className="text-[10px] text-[var(--text-muted)]">{stat.subtext}</div>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ Round-by-Round Results ═══ */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📋 Round Breakdown</h2>
        <div className="space-y-4">
          {submissions.map((sub, idx) => (
            <motion.div
              key={sub._id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-xl p-5 border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${sub.status === "qualified" ? "bg-emerald-500/20 text-emerald-400" :
                      sub.status === "disqualified" ? "bg-red-500/20 text-red-400" :
                        "bg-[var(--primary)]/20 text-[var(--primary-light)]"
                    }`}>
                    {sub.roundNumber}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">Round {sub.roundNumber}</h3>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      }) : "Not submitted"}
                      {sub.autoSubmitted && " • Auto-submitted"}
                    </span>
                  </div>
                </div>
                <QualificationBadge status={sub.status} size="sm" />
              </div>

              {/* Score Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">Score</span>
                  <span className="font-bold">
                    {sub.totalScore}/{sub.maxPossibleScore} ({sub.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[var(--surface)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${sub.status === "QUALIFIED"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : sub.status === "DISQUALIFIED"
                          ? "bg-gradient-to-r from-red-500 to-red-400"
                          : "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                      }`}
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>
              </div>

              {/* Qualification Status */}
              {(sub.status === "QUALIFIED" || sub.status === "DISQUALIFIED") && (
                <div className={`rounded-xl p-3 mb-4 text-center text-sm font-bold ${sub.status === "QUALIFIED"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}>
                  {sub.status === "QUALIFIED"
                    ? `✅ Qualified for Round ${sub.roundNumber + 1}!`
                    : `❌ Did Not Qualify — Required: ${sub.maxPossibleScore > 0 ? Math.round((20 / sub.maxPossibleScore) * sub.maxPossibleScore) : 20} pts`
                  }
                </div>
              )}

              {sub.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <div className="bg-[var(--surface-light)] rounded-lg p-2 text-center border border-[var(--border)]">
                    <div className="text-sm font-bold text-blue-400">{sub.stats.answered}</div>
                    <div className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Answered</div>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg p-2 text-center border border-emerald-500/20">
                    <div className="text-sm font-bold text-emerald-400">{sub.stats.correct}</div>
                    <div className="text-[9px] uppercase text-emerald-500/70 font-bold">Correct</div>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-2 text-center border border-red-500/20">
                    <div className="text-sm font-bold text-red-400">{sub.stats.wrong}</div>
                    <div className="text-[9px] uppercase text-red-500/70 font-bold">Wrong</div>
                  </div>
                  <div className="bg-orange-500/10 rounded-lg p-2 text-center border border-orange-500/20">
                    <div className="text-sm font-bold text-orange-400">{sub.stats.unanswered}</div>
                    <div className="text-[9px] uppercase text-orange-500/70 font-bold">Unanswered</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
                <span>⏱️ {Math.round(sub.totalTimeTaken / 60)} minutes</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ═══ Actions ═══ */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 w-full">
          <Link href={`/hackathon/${params.slug}/leaderboard`} className="btn-primary !py-3 !px-6 w-full sm:w-auto text-center">
            🏅 View Leaderboard
          </Link>
          <Link href={`/hackathon/${params.slug}`} className="btn-secondary !py-3 !px-6 w-full sm:w-auto text-center">
            Back to Hackathon
          </Link>
        </div>
      </div>
    </div>
  );
}
