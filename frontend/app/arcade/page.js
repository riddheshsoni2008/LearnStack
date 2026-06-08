"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import Link from "next/link";

export default function ArcadeHub() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && user.totalXpEarned < 1000) {
      router.push("/dashboard");
      return;
    }

    const fetchHubData = async () => {
      try {
        const res = await fetch("/api/arcade/hub", { credentials: "include" });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching arcade hub:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHubData();
  }, [user, authLoading, router]);

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

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Coding Arcade
            </h1>
            <p className="text-indigo-200 text-lg font-medium">
              Where code becomes reality. Select your world to begin.
            </p>
          </div>

          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-6 backdrop-blur-sm shadow-[0_0_20px_rgba(79,70,229,0.15)]">
            <div className="text-center border-r border-indigo-500/30 pr-6">
              <div className="text-xs font-bold text-indigo-300 uppercase mb-1">Arcade Level</div>
              <div className="text-2xl font-black text-white">{data.stats.level}</div>
            </div>
            <div className="text-center border-r border-indigo-500/30 pr-6">
              <div className="text-xs font-bold text-indigo-300 uppercase mb-1">Game XP</div>
              <div className="text-2xl font-black text-cyan-400 flex items-center gap-2">
                ⚡ {data.stats.gameXp}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-indigo-300 uppercase mb-1">Bosses Defeated</div>
              <div className="text-2xl font-black text-red-400 flex items-center justify-center gap-2">
                👹 {data.stats.completedBosses}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">🗺️</span> Explore Worlds
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.worlds.map((world, idx) => {
                const isUnlocked = idx === 0 || data.stats.completedLevels >= (idx * 6);
                return (
                  <motion.div
                    whileHover={isUnlocked ? { y: -5, scale: 1.02 } : {}}
                    key={world.id}
                    className={`relative rounded-2xl p-6 border transition-all overflow-hidden ${isUnlocked
                      ? "bg-indigo-950/40 border-indigo-500/50 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] cursor-pointer"
                      : "bg-gray-900/50 border-gray-700 opacity-60 grayscale cursor-not-allowed"
                      }`}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-[#0A051A]/80 z-10 flex items-center justify-center backdrop-blur-sm">
                        <div className="text-4xl drop-shadow-xl">🔒</div>
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2 text-white">{world.name}</h3>
                    <p className="text-sm text-indigo-200 mb-6 h-10">{world.description}</p>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="bg-indigo-900/60 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                        {world.levelsCount} Levels
                      </span>
                      {isUnlocked && (
                        <Link href={`/arcade/world/${world.id}`} className="text-pink-400 hover:text-pink-300 transition-colors z-20">
                          Enter World →
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="text-3xl">🎯</span> Daily Mission
              </h2>
              <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/30 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-[40px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-xl font-bold text-white mb-2">Fix the Core Engine</h3>
                <p className="text-sm text-pink-200 mb-6">A critical bug was discovered in the core engine. Fix it before time runs out!</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold bg-cyan-900/30 px-3 py-1 rounded-full text-xs border border-cyan-500/30">
                    ⚡ +{data.dailyChallenge.reward} XP
                  </div>
                  {data.dailyChallenge.available ? (
                    <Link href="/arcade/daily" className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(219,39,119,0.4)]">
                      Start Mission
                    </Link>
                  ) : (
                    <button disabled className="bg-gray-800 text-gray-400 font-bold py-2 px-4 rounded-xl text-sm cursor-not-allowed">
                      Completed
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">🏆</span> Top Players
                </h2>
                <Link href="/arcade/leaderboard" className="text-sm text-indigo-400 hover:text-indigo-300 font-bold">
                  View All
                </Link>
              </div>
              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-center">
                <div className="space-y-4">
                  {data.topPlayers?.length > 0 ? data.topPlayers.map((player, idx) => (
                    <div key={player._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-200">{player.name}</span>
                      </div>
                      <span className="text-yellow-400 font-bold text-sm">#{idx + 1}</span>
                    </div>
                  )) : (
                    <div className="text-center text-gray-500 italic py-4">No players yet.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
