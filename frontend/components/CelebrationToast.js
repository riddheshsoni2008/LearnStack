"use client";

import { useCelebration } from "@/context/CelebrationContext";
import { motion, AnimatePresence } from "framer-motion";

const TOAST_STYLES = {
  xp: {
    bg: "from-yellow-500/20 to-amber-600/20",
    border: "border-yellow-500/40",
    icon: "⚡",
    glow: "shadow-yellow-500/30",
  },
  badge: {
    bg: "from-purple-500/20 to-indigo-600/20",
    border: "border-purple-500/40",
    icon: "🏆",
    glow: "shadow-purple-500/30",
  },
  streak: {
    bg: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/40",
    icon: "🔥",
    glow: "shadow-orange-500/30",
  },
  success: {
    bg: "from-green-500/20 to-emerald-600/20",
    border: "border-green-500/40",
    icon: "✅",
    glow: "shadow-green-500/30",
  },
  error: {
    bg: "from-red-500/20 to-rose-600/20",
    border: "border-red-500/40",
    icon: "❌",
    glow: "shadow-red-500/30",
  },
  info: {
    bg: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/40",
    icon: "ℹ️",
    glow: "shadow-blue-500/30",
  },
};

const RARITY_COLORS = {
  common: "text-gray-300",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
};

export default function CelebrationToast() {
  const { toasts } = useCelebration();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`pointer-events-auto relative overflow-hidden bg-gradient-to-r ${style.bg} backdrop-blur-2xl border ${style.border} rounded-2xl p-4 shadow-2xl ${style.glow}`}
            >
              {/* Animated background glow pulse */}
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white/5 pointer-events-none"
              />

              <div className="flex items-start gap-3 relative z-10">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                  transition={{ 
                    scale: { type: "spring", delay: 0.1 },
                    rotate: { type: "keyframes", delay: 0.1, duration: 0.5 }
                  }}
                  className="text-3xl flex-shrink-0"
                >
                  {style.icon}
                </motion.div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className={`font-bold text-[15px] ${toast.rarity ? RARITY_COLORS[toast.rarity] : "text-white"}`}>
                    {toast.title}
                  </div>
                  {toast.description && (
                    <div className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                      {toast.description}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress bar timer (handled by framer motion) */}
              <div className="mt-4 h-1 bg-black/20 rounded-full overflow-hidden relative z-10">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-white/40 rounded-full"
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
