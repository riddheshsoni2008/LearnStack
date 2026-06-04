"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useCelebration } from "@/context/CelebrationContext";

export default function MysteryBox({ cost, userBalance, onReward }) {
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState(null);
  const { addToast } = useCelebration();

  const handleOpen = async () => {
    if (opening || reward) return;
    if (userBalance < cost) {
      addToast({ type: "error", title: "Not enough XP", description: `You need ${cost} XP to open a box.` });
      return;
    }

    setOpening(true);

    try {
      const res = await fetch("/api/store/mystery-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const data = await res.json();

      if (data.success) {
        // Wait for shaking animation to finish before revealing
        setTimeout(() => {
          setOpening(false);
          setReward(data.data.reward);
          onReward(); // Update user balance/inventory
          
          // Fire confetti
          const colors = data.data.reward.rarity === 'epic' ? ['#a855f7', '#d946ef'] : 
                         data.data.reward.rarity === 'rare' ? ['#3b82f6', '#60a5fa'] : 
                         ['#fbbf24', '#f59e0b'];
                         
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors
          });

          if (data.data.reward.fallback) {
             setTimeout(() => {
               addToast({ type: "info", title: "Duplicate Item", description: data.data.reward.fallback });
             }, 2000);
          }
        }, 1500); // 1.5s shake duration
      } else {
        setOpening(false);
        addToast({ type: "error", title: "Error", description: data.message });
      }
    } catch (err) {
      setOpening(false);
      console.error(err);
    }
  };

  const boxVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -5, transition: { type: "spring", stiffness: 300 } },
    shaking: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      y: [0, -5, 5, -5, 5, -2, 2, 0],
      rotate: [0, -5, 5, -5, 5, -2, 2, 0],
      transition: { duration: 0.5, repeat: 3 }
    }
  };

  return (
    <div className="relative w-64 h-80 flex items-center justify-center perspective-[1000px]">
      <AnimatePresence mode="wait">
        {!reward ? (
          <motion.div
            key="box"
            variants={boxVariants}
            initial="idle"
            whileHover={!opening ? "hover" : ""}
            animate={opening ? "shaking" : "idle"}
            onClick={handleOpen}
            className={`w-48 h-48 rounded-3xl cursor-pointer flex flex-col items-center justify-center relative shadow-2xl transition-all ${
               opening ? "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/50" 
                       : "bg-gradient-to-br from-[var(--surface)] to-[var(--surface-light)] border-2 border-[var(--border)] hover:border-yellow-500/50"
            }`}
          >
            <div className="text-6xl mb-2">{opening ? "✨" : "🎁"}</div>
            {!opening && (
              <div className="bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-yellow-400 font-bold text-sm border border-yellow-500/30 flex items-center gap-1.5">
                💎 {cost} XP
              </div>
            )}
            {/* Glow pulse behind box */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full -z-10"
            />
          </motion.div>
        ) : (
          <motion.div
            key="reward"
            initial={{ rotateY: 90, scale: 0.5, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className={`w-full h-full rounded-3xl flex flex-col items-center justify-center relative p-6 border-2 shadow-2xl
              ${reward.rarity === 'epic' ? 'bg-gradient-to-b from-purple-900/80 to-black border-purple-500 shadow-purple-500/50' :
                reward.rarity === 'rare' ? 'bg-gradient-to-b from-blue-900/80 to-black border-blue-500 shadow-blue-500/50' :
                'bg-gradient-to-b from-[var(--surface)] to-black border-yellow-500 shadow-yellow-500/30'
              }
            `}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
               <motion.div 
                 animate={{ x: ['-100%', '200%'] }}
                 transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                 className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
               />
            </div>

            <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${
               reward.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
               reward.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
               'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {reward.rarity}
            </div>
            
            <div className="text-7xl mb-4 filter drop-shadow-lg">{reward.icon}</div>
            
            <h3 className="text-xl font-bold text-center text-white mb-6">
              {reward.name}
            </h3>
            
            <button
              onClick={() => setReward(null)}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-medium transition-colors border border-white/10"
            >
              Collect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
