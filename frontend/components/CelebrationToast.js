"use client";

import { useCelebration } from "@/context/CelebrationContext";

const TOAST_STYLES = {
  xp: {
    bg: "from-yellow-500/20 to-amber-600/20",
    border: "border-yellow-500/40",
    icon: "⚡",
    glow: "shadow-yellow-500/20",
  },
  badge: {
    bg: "from-purple-500/20 to-indigo-600/20",
    border: "border-purple-500/40",
    icon: "🏆",
    glow: "shadow-purple-500/20",
  },
  streak: {
    bg: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/40",
    icon: "🔥",
    glow: "shadow-orange-500/20",
  },
  info: {
    bg: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/40",
    icon: "ℹ️",
    glow: "shadow-blue-500/20",
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
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-gradient-to-r ${style.bg} backdrop-blur-xl border ${style.border} rounded-2xl p-4 shadow-2xl ${style.glow} animate-slide-in`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0 animate-bounce-once">
                {style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-sm ${toast.rarity ? RARITY_COLORS[toast.rarity] : "text-white"}`}>
                  {toast.title}
                </div>
                {toast.description && (
                  <div className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed truncate">
                    {toast.description}
                  </div>
                )}
              </div>
            </div>
            {/* Progress bar timer */}
            <div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/30 rounded-full animate-toast-timer" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
