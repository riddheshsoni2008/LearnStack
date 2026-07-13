"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCelebration } from "@/context/CelebrationContext";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function DailyMission() {
  const router = useRouter();
  const { user, loading: authLoading, fetchUser } = useAuth();
  const { addToast } = useCelebration();
  const [dailyData, setDailyData] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchDaily = async () => {
      try {
        const res = await fetch(`/api/arcade/daily`, { credentials: "include" });
        if (!res.ok) {
          router.push("/arcade");
          return;
        }
        const json = await res.json();
        if (json.success) {
          setDailyData(json.data);
          setCode(json.data.level.initialCode || "");
          if (json.data.isCompletedToday) {
            setCleared(true);
            setOutput([{ type: "success", text: "✓ Daily Mission already completed today!" }]);
          }
        } else {
          router.push("/arcade");
        }
      } catch (err) {
        console.error("Error fetching daily mission:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDaily();
    }
  }, [user, authLoading, router]);

  const handleRunCode = async () => {
    setSubmitting(true);
    setOutput([{ type: "system", text: "> Compiling and executing in sandbox..." }]);

    try {
      const res = await fetch("/api/arcade/daily/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId: dailyData.level._id, code }),
        credentials: "include"
      });

      const data = await res.json();

      const newOutput = [];
      // If there are standard logs, show them first
      if (data.logs && data.logs.length > 0) {
        data.logs.slice(0, -1).forEach(l => newOutput.push({ type: "log", text: l }));
      }

      if (data.passed) {
        // The last log is the successful output
        if (data.logs && data.logs.length > 0) {
          newOutput.push({ type: "success", text: "✅ " + data.logs[data.logs.length - 1] });
        }
        newOutput.push({ type: "success", text: "🏆 Daily Mission Complete" });

        if (data.xpAwarded > 0) {
          newOutput.push({ type: "system", text: `⚡ +${data.xpAwarded} XP` });
        }
        if (data.streakUpdated) {
          newOutput.push({ type: "system", text: `🔥 Streak extended to ${data.newStreak} days!` });
        }

        // Sync user context so the XP and Streak display update globally
        await fetchUser();

        setOutput(newOutput);
        setCleared(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FBBF24', '#F59E0B', '#D97706']
        });
      } else {
        newOutput.push({ type: "error", text: "❌ " + data.message });
        setOutput(newOutput);
      }
    } catch (err) {
      setOutput([{ type: "error", text: "✗ Network error connecting to game engine." }]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Mission Cleared!",
          text: `🔥 I just cleared the Daily Mission and extended my streak to ${dailyData?.currentStreak + 1 || 1} on LearnStack's Coding Arcade!`,
          url: window.location.origin + "/arcade",
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(`🔥 I just cleared the Daily Mission on LearnStack's Coding Arcade!`);
      addToast({ title: "Copied to clipboard!", type: "success" });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0A051A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const level = dailyData?.level;

  return (
    <div className="min-h-screen text-white flex flex-col bg-[#0f0a00]">

      {/* Header Bar */}
      <header className="h-14 sm:h-16 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 border-yellow-900/50 bg-yellow-950/20">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Link href="/arcade" className="text-gray-400 hover:text-white transition-colors shrink-0">
            ←<span className="hidden sm:inline"> Back to Map</span>
          </Link>
          <div className="h-6 w-px bg-gray-700 shrink-0"></div>
          <h1 className="font-bold text-sm sm:text-lg text-yellow-500 truncate flex-1">🔥 Daily Mission</h1>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-2">
          <div className="text-[10px] sm:text-xs font-bold text-yellow-300 bg-yellow-900/40 px-2 sm:px-3 py-1 rounded-full border border-yellow-500/30 whitespace-nowrap">
            <span className="hidden sm:inline">Reward: </span>⚡ 100 XP
          </div>
        </div>
      </header>

      {/* Main Game Interface */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

        {/* Left Panel: Narrative & Challenge */}
        <div className="w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r border-yellow-900/50 bg-[#120c02] lg:overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <div className="text-[10px] uppercase tracking-widest text-yellow-500 font-bold mb-2">Daily Transmission</div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 relative">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-gray-300 leading-relaxed font-serif italic">
                  "{level?.story}"
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-yellow-500">⚡</span> Objective
              </h2>
              <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-xl p-6">
                <p className="text-yellow-100 text-sm leading-relaxed">
                  {level?.challengeText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor & Console */}
        <div className="flex-1 flex flex-col min-h-[600px] lg:min-h-0 lg:h-[calc(100vh-64px)]">

          <div className="flex-1 flex flex-col relative bg-[#1E1E1E]">
            <div className="h-10 bg-[#2D2D2D] flex items-center px-4 justify-between shrink-0">
              <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                <span className="text-yellow-400">JS</span> daily.js
              </div>
              <button
                onClick={handleRunCode}
                disabled={submitting || cleared}
                className={`text-xs font-bold px-4 py-1.5 rounded bg-yellow-600 hover:bg-yellow-500 text-white transition-colors flex items-center gap-2 ${submitting || cleared ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Running...' : '▶ Run Code'}
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={cleared}
              className="flex-1 w-full bg-[#1E1E1E] text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-0 leading-relaxed"
              spellCheck="false"
              placeholder="Write your code here..."
            />
          </div>

          <div className="h-64 shrink-0 bg-[#0A0A0A] border-t border-gray-800 flex flex-col">
            <div className="h-8 bg-[#141414] flex items-center px-4 text-xs text-gray-500 font-mono shrink-0">
              Terminal Output
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-2">
              {output.length === 0 ? (
                <div className="text-gray-600">Waiting for execution...</div>
              ) : (
                output.map((out, i) => (
                  <div key={i} className={`whitespace-pre-wrap
                    ${out.type === 'error' ? 'text-red-400' : ''}
                    ${out.type === 'success' ? 'text-green-400 font-bold' : ''}
                    ${out.type === 'system' ? 'text-yellow-400 font-bold' : ''}
                    ${out.type === 'log' ? 'text-gray-300' : ''}
                  `}>
                    {out.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      {cleared && !dailyData?.isCompletedToday && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gray-900 border border-yellow-500/30 p-6 md:p-12 rounded-3xl text-center w-[90%] md:w-auto max-w-lg shadow-[0_0_50px_rgba(245,158,11,0.2)]"
          >
            <div className="text-6xl mb-6">🔥</div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
              MISSION CLEARED!
            </h2>
            <p className="text-gray-400 mb-6">
              You earned +100 XP and extended your streak. Come back tomorrow for a new mission!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/arcade" className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-gray-800 hover:bg-gray-700 text-white transition-colors">
                Back to Map
              </Link>
              <button onClick={handleShare} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-[#25D366] hover:bg-[#128C7E] text-white transition-colors flex items-center justify-center gap-2">
                <span>📱</span> Share Win
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
