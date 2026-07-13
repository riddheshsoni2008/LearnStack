"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCelebration } from "@/context/CelebrationContext";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function ArcadeGame() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, fetchUser } = useAuth();
  const { addToast } = useCelebration();
  const [level, setLevel] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [nextLevelId, setNextLevelId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchLevel = async () => {
      try {
        const res = await fetch(`/api/arcade/levels/${params.levelId}`, { credentials: "include" });
        if (!res.ok) {
          router.push("/arcade");
          return;
        }
        const json = await res.json();
        if (json.success) {
          setLevel(json.data);
          setCode(json.data.initialCode || "");
        } else {
          router.push("/arcade");
        }
      } catch (err) {
        console.error("Error fetching level:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLevel();
    }
  }, [user, authLoading, router, params.levelId]);

  const handleRunCode = async () => {
    setSubmitting(true);
    setOutput([{ type: "system", text: "> Compiling and executing in sandbox..." }]);

    try {
      const res = await fetch("/api/arcade/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId: params.levelId, code }),
        credentials: "include"
      });

      const data = await res.json();

      const newOutput = [];
      if (data.logs && data.logs.length > 0) {
        data.logs.slice(0, -1).forEach(l => newOutput.push({ type: "log", text: l }));
      }

      if (data.passed) {
        if (data.logs && data.logs.length > 0) {
          newOutput.push({ type: "success", text: "✅ " + data.logs[data.logs.length - 1] });
        }
        newOutput.push({ type: "success", text: "🏆 Level Cleared!" });

        if (data.xpAwarded > 0) {
          newOutput.push({ type: "system", text: `⚡ +${data.xpAwarded} XP Earned!` });
        }
        if (data.newAchievements && data.newAchievements.length > 0) {
          setNewAchievements(data.newAchievements);
          newOutput.push({ type: "system", text: `⭐ Unlocked ${data.newAchievements.length} new achievement(s)!` });
        }
        if (data.nextLevelId) {
          setNextLevelId(data.nextLevelId);
        }

        // Sync user context so the map and XP display update globally
        await fetchUser();

        setOutput(newOutput);
        setCleared(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#818cf8', '#c084fc', '#f472b6']
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
          title: "Level Cleared in Coding Arcade!",
          text: `🏆 I just cleared "${level?.title}" and earned +${level?.xpReward} XP on LearnStack's Coding Arcade!`,
          url: window.location.origin + "/arcade",
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {

      navigator.clipboard.writeText(`🏆 I just cleared "${level?.title}" and earned +${level?.xpReward} XP on LearnStack's Coding Arcade!`);
      addToast({ title: "Copied to clipboard!", type: "success" });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0A051A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-white flex flex-col ${level?.isBossLevel ? 'bg-[#1a0505]' : 'bg-[#0A051A]'}`}>

      <header className={`h-14 sm:h-16 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 ${level?.isBossLevel ? 'border-red-900/50 bg-red-950/20' : 'border-indigo-900/50 bg-indigo-950/20'}`}>
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Link href="/arcade" className="text-gray-400 hover:text-white transition-colors shrink-0">
            ←<span className="hidden sm:inline"> Back to Map</span>
          </Link>
          <div className="h-6 w-px bg-gray-700 shrink-0"></div>
          <h1 className="font-bold text-sm sm:text-lg truncate flex-1">{level?.title}</h1>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-2">
          <div className="text-[10px] sm:text-xs font-bold text-indigo-300 bg-indigo-900/40 px-2 sm:px-3 py-1 rounded-full border border-indigo-500/30 whitespace-nowrap">
            <span className="hidden sm:inline">Reward: </span>⚡ {level?.xpReward} XP
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

        <div className={`w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r ${level?.isBossLevel ? 'border-red-900/50 bg-[#140202]' : 'border-indigo-900/50 bg-[#070312]'} lg:overflow-y-auto`}>
          <div className="p-8">
            <div className="mb-8">
              <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-2">Transmission Received</div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 relative">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-gray-300 leading-relaxed font-serif italic">
                  "{level?.story}"
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-indigo-400">⚡</span> Objective
              </h2>
              <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-6">
                <p className="text-indigo-100 text-sm leading-relaxed">
                  {level?.challengeText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-[600px] lg:min-h-0 lg:h-[calc(100vh-64px)]">

          <div className="flex-1 flex flex-col relative bg-[#1E1E1E]">
            <div className="h-10 bg-[#2D2D2D] flex items-center px-4 justify-between shrink-0">
              <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                <span className="text-yellow-400">JS</span> main.js
              </div>
              <button
                onClick={handleRunCode}
                disabled={submitting || cleared}
                className={`text-xs font-bold px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2 ${submitting || cleared ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <div key={i} className={`
                    ${out.type === 'error' ? 'text-red-400' : ''}
                    ${out.type === 'success' ? 'text-green-400 font-bold' : ''}
                    ${out.type === 'system' ? 'text-indigo-400' : ''}
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

      {cleared && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gray-900 border border-indigo-500/30 p-6 md:p-12 rounded-3xl text-center w-[90%] md:w-auto max-w-lg shadow-[0_0_50px_rgba(79,70,229,0.2)]"
          >
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
              LEVEL CLEARED!
            </h2>
            <p className="text-gray-400 mb-6">
              Excellent logic. You have successfully conquered {level?.title}!
            </p>

            {newAchievements.length > 0 && (
              <div className="mb-8 space-y-3">
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest">⭐ New Achievements Unlocked!</h3>
                <div className="flex flex-col gap-3">
                  {newAchievements.map((ach) => (
                    <div key={ach._id} className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-4 text-left">
                      <div className="text-3xl">{ach.icon}</div>
                      <div>
                        <div className="font-bold text-yellow-300">{ach.name}</div>
                        <div className="text-xs text-yellow-500">{ach.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/arcade" className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-gray-800 hover:bg-gray-700 text-white transition-colors">
                Back to Map
              </Link>
              <button onClick={handleShare} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-[#25D366] hover:bg-[#128C7E] text-white transition-colors flex items-center justify-center gap-2">
                <span>📱</span> Share Win
              </button>
              {nextLevelId ? (
                <button onClick={() => router.push(`/arcade/play/${nextLevelId}`)} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
                  Next Level →
                </button>
              ) : (
                <button onClick={() => router.push(`/arcade`)} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all">
                  World Complete! 🌟
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
}
