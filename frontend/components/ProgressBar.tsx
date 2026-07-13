export default function ProgressBar({ progressPercent, completedCount, totalCount, label = "TRACK PROGRESS" }) {
  return (
    <div className="glass rounded-2xl p-6 border border-[var(--border)] mb-12">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-[var(--text-muted)] uppercase">{label}</span>
        <span className="text-sm font-bold text-[var(--accent)]">
          {progressPercent}% Completed ({completedCount}/{totalCount} lessons)
        </span>
      </div>
      <div className="w-full bg-[var(--surface-light)] rounded-full h-3 overflow-hidden border border-[var(--border)]">
        <div 
          className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
