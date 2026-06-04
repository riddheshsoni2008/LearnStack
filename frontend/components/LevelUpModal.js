"use client";

import { useEffect } from "react";
import { useCelebration } from "@/context/CelebrationContext";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function LevelUpModal() {
  const { levelUpData, dismissLevelUp } = useCelebration();

  useEffect(() => {
    if (levelUpData) {
      // Fire premium confetti burst when modal appears
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [levelUpData]);

  return (
    <AnimatePresence>
      {levelUpData && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={dismissLevelUp}
          />

          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="relative glass border border-[var(--primary)]/40 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl shadow-[var(--primary)]/30 overflow-hidden"
          >
            {/* Background Glow */}
            <motion.div
              animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 blur-3xl rounded-full -z-10"
            />

            {/* Content */}
            <div className="relative z-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 10, 0] }}
                transition={{ 
                  scale: { type: "spring", delay: 0.2 },
                  rotate: { type: "keyframes", delay: 0.2, duration: 0.5 }
                }}
                className="text-7xl mb-6"
              >
                🎉
              </motion.div>
              
              <h2 className="text-4xl font-black gradient-text mb-2 tracking-tight">LEVEL UP!</h2>

              <div className="flex items-center justify-center gap-6 my-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--surface-light)] border-2 border-[var(--border)] flex items-center justify-center text-2xl font-black text-[var(--text-muted)]">
                    {levelUpData.oldLevel}
                  </div>
                </div>

                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl text-[var(--primary)] font-bold"
                >
                  →
                </motion.div>

                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.7 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-[var(--primary)]/50 border-4 border-white/10"
                  >
                    {levelUpData.newLevel}
                  </motion.div>
                </div>
              </div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="text-xl text-[var(--primary-light)] font-bold mb-4 uppercase tracking-widest">
                  {levelUpData.levelTitle}
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-8 max-w-sm mx-auto leading-relaxed">
                  You are now <span className="text-white font-bold">Level {levelUpData.newLevel}</span>!
                  Your dedication is paying off. Keep pushing forward to unlock more exclusive rewards and titles.
                </p>

                <button
                  onClick={dismissLevelUp}
                  className="btn-primary w-full !py-4 text-lg font-bold shadow-xl shadow-[var(--primary)]/20 active:scale-95 transition-transform"
                >
                  🚀 Keep Learning
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
