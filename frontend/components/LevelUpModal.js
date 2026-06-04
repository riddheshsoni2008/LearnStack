"use client";

import { useCelebration } from "@/context/CelebrationContext";

export default function LevelUpModal() {
  const { levelUpData, dismissLevelUp } = useCelebration();

  if (!levelUpData) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={dismissLevelUp}
      />

      {/* Modal */}
      <div className="relative glass border border-[var(--primary)]/40 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl shadow-[var(--primary)]/20 animate-level-up-pop">
        {/* Confetti burst effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#3B82F6', '#F97316'][i % 6],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="text-6xl mb-4 animate-bounce-once">🎉</div>
          <h2 className="text-3xl font-black gradient-text mb-2">LEVEL UP!</h2>

          <div className="flex items-center justify-center gap-4 my-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--surface-light)] border-2 border-[var(--border)] flex items-center justify-center text-2xl font-black text-[var(--text-muted)]">
                {levelUpData.oldLevel}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Before</div>
            </div>

            <div className="text-2xl text-[var(--primary)]">→</div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-[var(--primary)]/30 animate-pulse-glow">
                {levelUpData.newLevel}
              </div>
              <div className="text-xs text-[var(--primary-light)] mt-1 font-bold">
                {levelUpData.levelTitle}
              </div>
            </div>
          </div>

          <p className="text-sm text-[var(--text-muted)] mb-6">
            You are now <span className="text-[var(--primary-light)] font-bold">Level {levelUpData.newLevel}</span> — <span className="font-semibold">{levelUpData.levelTitle}</span>!
            <br />
            Keep learning to unlock more achievements.
          </p>

          <button
            onClick={dismissLevelUp}
            className="btn-primary !py-3 !px-8 text-sm font-bold"
          >
            🚀 Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
