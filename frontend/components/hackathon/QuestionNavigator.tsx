"use client";

export default function QuestionNavigator({ questions, answers, currentIndex, onNavigate }) {
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;

  if (totalCount === 0) {
    return (
      <div className="glass rounded-2xl p-4 border border-[var(--border)]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Questions
        </h3>
        <div className="text-center text-[var(--text-muted)] text-xs py-4">
          ⚠️ No questions loaded
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 border border-[var(--border)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Questions
        </h3>
        <span className="text-xs font-bold text-[var(--primary-light)]">
          {answeredCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[var(--surface)] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full transition-all duration-500"
          style={{ width: `${(answeredCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Question grid */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q._id];
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={q._id}
              onClick={() => onNavigate(idx)}
              className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                isCurrent
                  ? "bg-[var(--primary)] text-white shadow-[0_0_12px_rgba(108,92,231,0.4)] scale-110"
                  : isAnswered
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-[var(--surface-light)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)]/40"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[var(--primary)]" />
          Current
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
          Answered
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[var(--surface-light)] border border-[var(--border)]" />
          Unanswered
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="glass rounded-lg p-2">
            <div className="text-lg font-black text-emerald-400">{answeredCount}</div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase font-bold">Answered</div>
          </div>
          <div className="glass rounded-lg p-2">
            <div className="text-lg font-black text-orange-400">{totalCount - answeredCount}</div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase font-bold">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}
