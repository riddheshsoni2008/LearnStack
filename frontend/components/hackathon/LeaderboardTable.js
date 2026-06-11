"use client";

export default function LeaderboardTable({ leaderboard, currentUserId }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-[var(--text-muted)]">No leaderboard data yet.</p>
      </div>
    );
  }

  const RANK_STYLES = {
    1: { bg: "bg-yellow-500/20", border: "border-yellow-500/40", text: "text-yellow-400", emoji: "🥇" },
    2: { bg: "bg-gray-300/10", border: "border-gray-400/30", text: "text-gray-300", emoji: "🥈" },
    3: { bg: "bg-orange-600/20", border: "border-orange-600/30", text: "text-orange-400", emoji: "🥉" },
  };

  const STATUS_COLORS = {
    qualified: "text-emerald-400",
    disqualified: "text-red-400",
    participating: "text-blue-400",
    winner: "text-yellow-400",
    runner_up: "text-purple-400",
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 bg-[var(--surface)] text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
        <div className="col-span-1">Rank</div>
        <div className="col-span-3">Name</div>
        <div className="col-span-2 hidden sm:block">College</div>
        <div className="col-span-2 hidden md:block">State</div>
        <div className="col-span-2 text-right">Score</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[var(--border)]">
        {leaderboard.map((entry) => {
          const rankStyle = RANK_STYLES[entry.rank];
          const isCurrentUser = currentUserId && entry.userId === currentUserId;

          return (
            <div
              key={entry.rank}
              className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 items-center transition-all ${
                isCurrentUser
                  ? "bg-[var(--primary)]/10 border-l-2 border-l-[var(--primary)]"
                  : rankStyle
                  ? `${rankStyle.bg} ${rankStyle.border}`
                  : "hover:bg-[var(--surface-light)]"
              }`}
            >
              {/* Rank */}
              <div className="col-span-1">
                <span className={`text-sm font-bold ${rankStyle?.text || "text-[var(--text-muted)]"}`}>
                  {rankStyle?.emoji || `#${entry.rank}`}
                </span>
              </div>

              {/* Name */}
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {entry.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <span className={`text-sm font-medium truncate ${isCurrentUser ? "text-[var(--primary-light)]" : "text-[var(--foreground)]"}`}>
                    {entry.name}
                    {isCurrentUser && <span className="text-[10px] text-[var(--primary-light)] ml-1">(You)</span>}
                  </span>
                </div>
              </div>

              {/* College */}
              <div className="col-span-2 hidden sm:block text-xs text-[var(--text-muted)] truncate">
                {entry.college || "—"}
              </div>

              {/* State */}
              <div className="col-span-2 hidden md:block text-xs text-[var(--text-muted)] truncate">
                {entry.state || "—"}
              </div>

              {/* Score */}
              <div className="col-span-2 text-right">
                <span className="text-sm font-bold text-[var(--foreground)]">
                  {entry.score}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 text-right">
                <span className={`text-[10px] font-bold uppercase ${STATUS_COLORS[entry.status] || "text-[var(--text-muted)]"}`}>
                  {entry.status?.replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
