"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import AuthNavbar from "@/components/AuthNavbar";
import LeaderboardTable from "@/components/hackathon/LeaderboardTable";
import { useAuth } from "@/context/AuthContext";

export default function HackathonLeaderboardPage() {
  const params = useParams();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/hackathons/${params.slug}/leaderboard`);
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AuthNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href={`/hackathon/${params.slug}`} className="text-sm text-[var(--primary-light)] hover:underline mb-6 inline-block">
          ← Back to Hackathon
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            🏅 Leaderboard
          </h1>
          <p className="text-[var(--text-muted)]">
            {leaderboard.length} participant{leaderboard.length !== 1 ? "s" : ""} ranked
          </p>
        </motion.div>

        {/* ═══ Top 3 Podium ═══ */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-5 text-center border border-gray-400/20 self-end"
            >
              <div className="text-3xl mb-2">🥈</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold mx-auto mb-2">
                {leaderboard[1].name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="text-sm font-bold truncate">{leaderboard[1].name}</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{leaderboard[1].college || "—"}</div>
              <div className="text-lg font-black text-gray-300 mt-1">{leaderboard[1].score}</div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5 text-center border border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_30px_rgba(234,179,8,0.1)]"
            >
              <div className="text-4xl mb-2">🥇</div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                {leaderboard[0].name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="text-sm font-bold truncate">{leaderboard[0].name}</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{leaderboard[0].college || "—"}</div>
              <div className="text-2xl font-black text-yellow-400 mt-1">{leaderboard[0].score}</div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5 text-center border border-orange-600/20 self-end"
            >
              <div className="text-3xl mb-2">🥉</div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold mx-auto mb-2">
                {leaderboard[2].name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="text-sm font-bold truncate">{leaderboard[2].name}</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{leaderboard[2].college || "—"}</div>
              <div className="text-lg font-black text-orange-400 mt-1">{leaderboard[2].score}</div>
            </motion.div>
          </div>
        )}

        {/* ═══ Full Leaderboard Table ═══ */}
        <LeaderboardTable
          leaderboard={leaderboard}
          currentUserId={user?._id}
        />
      </div>
    </div>
  );
}
