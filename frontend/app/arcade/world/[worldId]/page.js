"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WorldLevels() {
  const router = useRouter();
  const params = useParams();
  const worldIdDecoded = decodeURIComponent(params.worldId);
  const { user, loading: authLoading } = useAuth();
  
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchLevels = async () => {
      try {
        const res = await fetch(`/api/arcade/worlds/${encodeURIComponent(worldIdDecoded)}`, { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success) {
          setLevels(json.data);
        }
      } catch (err) {
        console.error("Error fetching levels:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLevels();
    }
  }, [user, authLoading, router, worldIdDecoded]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0A051A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // To check if a level is unlocked, we look at user.arcadeProgress.
  // Level 1 is always unlocked. Level N is unlocked if Level N-1 is in arcadeProgress.
  const completedLevelIds = user?.arcadeProgress?.map(p => p.levelId.toString()) || [];

  return (
    <div className="min-h-screen bg-[#0A051A] text-white overflow-hidden relative pb-20">
      <AuthNavbar />
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      
      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <Link href="/arcade" className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2">
            <span>←</span> Back to Map
          </Link>
          <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Sector Overview</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            {worldIdDecoded}
          </h1>
          <p className="text-indigo-200 max-w-xl text-lg">Select a stage to begin. Complete previous stages to unlock the path forward.</p>
        </div>

        {/* Level List */}
        <div className="grid gap-4">
          {levels.map((level, index) => {
            const isFirstLevel = index === 0;
            const previousLevelId = index > 0 ? levels[index - 1]._id : null;
            const isUnlocked = isFirstLevel || completedLevelIds.includes(previousLevelId);
            const isCompleted = completedLevelIds.includes(level._id);

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={level._id} 
                className={`relative overflow-hidden rounded-2xl border ${isUnlocked ? (level.isBossLevel ? 'border-red-500/50 bg-red-950/30' : 'border-indigo-500/30 bg-indigo-950/40') : 'border-gray-800 bg-gray-900/50 opacity-60'} p-6 transition-all hover:scale-[1.01]`}
              >
                {/* Status Indicator */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b opacity-80" style={{
                  backgroundImage: isCompleted ? 'linear-gradient(to bottom, #10B981, #059669)' : (isUnlocked ? (level.isBossLevel ? 'linear-gradient(to bottom, #EF4444, #B91C1C)' : 'linear-gradient(to bottom, #6366F1, #4F46E5)') : 'linear-gradient(to bottom, #374151, #1F2937)')
                }} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${level.isBossLevel ? 'bg-red-900/50 text-red-400 border border-red-500/30' : 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30'}`}>
                        {level.isBossLevel ? 'BOSS BATTLE' : `STAGE ${level.levelNumber}`}
                      </span>
                      {isCompleted && <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded-full border border-green-500/30">✓ CLEARED</span>}
                      {!isUnlocked && <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-full">🔒 LOCKED</span>}
                    </div>
                    <h3 className={`text-2xl font-bold ${level.isBossLevel ? 'text-red-100' : 'text-white'} mb-2`}>{level.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{level.story}</p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Reward</div>
                      <div className="text-lg font-black text-yellow-400">⚡ {level.xpReward}</div>
                    </div>
                    
                    {isUnlocked ? (
                      <Link 
                        href={`/arcade/play/${level._id}`}
                        className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all text-center min-w-[140px] ${level.isBossLevel ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20 hover:shadow-red-500/40' : (isCompleted ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40')}`}
                      >
                        {isCompleted ? 'Replay' : (level.isBossLevel ? 'Fight Boss' : 'Start Level')}
                      </Link>
                    ) : (
                      <button disabled className="px-6 py-3 rounded-xl font-bold bg-gray-800 text-gray-500 cursor-not-allowed min-w-[140px]">
                        Locked
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
