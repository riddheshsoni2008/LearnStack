"use client";
import { motion } from "framer-motion";

export default function ProgressTracker({ rounds, currentRound, submissions }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
        📊 Round Progress
      </h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[var(--border)]" />

        <div className="space-y-6">
          {rounds.map((round, idx) => {
            const submission = submissions?.find(s => s.roundNumber === round.roundNumber);
            const isCompleted = submission && ['submitted', 'evaluated', 'qualified', 'disqualified'].includes(submission.status);
            const isActive = round.roundNumber === currentRound;
            const isLocked = round.roundNumber > currentRound;
            const isQualified = submission?.status === 'qualified';
            const isDisqualified = submission?.status === 'disqualified';

            return (
              <motion.div
                key={round.roundNumber}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="relative flex items-start gap-4 pl-1"
              >
                {/* Circle */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  isQualified
                    ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : isDisqualified
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : isActive
                    ? "bg-[var(--primary)] border-[var(--primary-light)] text-white shadow-[0_0_15px_rgba(108,92,231,0.4)] animate-pulse-glow"
                    : isCompleted
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-[var(--surface-light)] border-[var(--border)] text-[var(--text-muted)]"
                }`}>
                  {isQualified ? "✓" : isDisqualified ? "✗" : round.roundNumber}
                </div>

                {/* Content */}
                <div className={`flex-1 rounded-xl p-4 border transition-all ${
                  isActive
                    ? "bg-[var(--primary)]/10 border-[var(--primary)]/30"
                    : "bg-[var(--surface-light)] border-[var(--border)]"
                } ${isLocked ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">
                      {round.title || `Round ${round.roundNumber}`}
                    </h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      round.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      round.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {round.difficulty}
                    </span>
                  </div>

                  {round.description && (
                    <p className="text-xs text-[var(--text-muted)] mb-2">{round.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                    <span>⏱️ {round.duration} min</span>
                    <span>🎯 {round.qualifyingScore}% to qualify</span>
                    {submission && <span className="font-bold text-[var(--primary-light)]">Score: {submission.percentage}%</span>}
                  </div>

                  {isLocked && (
                    <div className="mt-2 text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      🔒 Qualify in Round {round.roundNumber - 1} to unlock
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
