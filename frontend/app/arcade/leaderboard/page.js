"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import Link from "next/link";

export default function ArcadeLeaderboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("global");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/arcade/leaderboard?timeframe=${timeframe}`, { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          setLeaderboard(json.data);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLeaderboard();
    }
  }, [user, authLoading, router, timeframe]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0A051A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A051A] text-white overflow-hidden relative pb-20">
      <AuthNavbar />
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      
      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Link href="/arcade" className="text-gray-400 hover:text-white transition-colors mb-4 block">
              ← Back to Arcade
            </Link>
            <h1 className="text-4xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
              Leaderboard
            </h1>
            <p className="text-indigo-200">The top coders in the Arcade.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-indigo-950/50 p-1.5 rounded-xl border border-indigo-500/30">
            {["global", "monthly", "weekly"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${timeframe === tf ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-indigo-900/50'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.15)]">
          
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-indigo-500/30 bg-indigo-950/60 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-3 text-right">Game XP</div>
            <div className="col-span-3 text-center">Bosses Defeated</div>
          </div>

          <div className="divide-y divide-indigo-500/10">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-400 italic">No players have entered the Arcade yet.</div>
            ) : (
              leaderboard.map((player) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={player.id} 
                  className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-indigo-900/30 ${player.id === user?._id ? 'bg-indigo-900/40 border-l-4 border-l-yellow-400' : ''}`}
                >
                  <div className="col-span-1 text-center font-black text-xl">
                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : <span className="text-gray-500">#{player.rank}</span>}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-inner border border-indigo-400/50">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base">{player.name} {player.id === user?._id && <span className="text-xs text-yellow-400 ml-2">(You)</span>}</div>
                      <div className="text-xs text-indigo-300">Lvl {player.level} • {player.completedLevels} Levels Cleared</div>
                    </div>
                  </div>
                  <div className="col-span-3 text-right font-black text-cyan-400 text-lg">
                    ⚡ {player.gameXp}
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <div className="bg-red-900/30 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      👹 {player.bossesDefeated}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
