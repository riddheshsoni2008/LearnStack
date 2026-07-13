"use client";
import { motion } from "framer-motion";

export default function PrizeCard({ rank, prize, delay = 0 }) {
  const RANK_STYLES = {
    1: {
      gradient: "from-yellow-500/30 via-amber-500/20 to-yellow-600/30",
      border: "border-yellow-500/40",
      glow: "shadow-[0_0_30px_rgba(234,179,8,0.2)]",
      emoji: "🥇",
      label: "1st Prize",
      textColor: "text-yellow-400",
    },
    2: {
      gradient: "from-gray-300/20 via-gray-400/10 to-gray-300/20",
      border: "border-gray-400/30",
      glow: "shadow-[0_0_20px_rgba(156,163,175,0.15)]",
      emoji: "🥈",
      label: "2nd Prize",
      textColor: "text-gray-300",
    },
    3: {
      gradient: "from-orange-600/20 via-amber-700/10 to-orange-600/20",
      border: "border-orange-600/30",
      glow: "shadow-[0_0_20px_rgba(234,88,12,0.15)]",
      emoji: "🥉",
      label: "3rd Prize",
      textColor: "text-orange-400",
    },
  };

  const style = RANK_STYLES[rank] || RANK_STYLES[3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`relative rounded-2xl p-6 border bg-gradient-to-br ${style.gradient} ${style.border} ${style.glow} backdrop-blur-sm overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 text-center">
        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {style.emoji}
        </div>
        <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${style.textColor}`}>
          {style.label}
        </div>
        <div className="text-xl sm:text-2xl font-black text-white">
          {prize}
        </div>
      </div>
    </motion.div>
  );
}
