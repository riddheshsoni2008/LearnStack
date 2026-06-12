"use client";

const BADGE_STYLES = {
  registered: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", icon: "📝", label: "Registered" },
  participating: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30", icon: "⚡", label: "Participating" },
  qualified: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", icon: "✅", label: "Qualified" },
  QUALIFIED: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", icon: "✅", label: "Qualified" },
  disqualified: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", icon: "❌", label: "Disqualified" },
  DISQUALIFIED: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", icon: "❌", label: "Disqualified" },
  COMPLETED: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", icon: "🏁", label: "Completed" },
  AUTO_SUBMITTED: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", icon: "⏱️", label: "Auto-Submitted" },
  winner: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", icon: "🏆", label: "Winner" },
  runner_up: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", icon: "🥈", label: "Runner Up" },
};

export default function QualificationBadge({ status, size = "md", showIcon = true }) {
  const style = BADGE_STYLES[status] || BADGE_STYLES.registered;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]}`}>
      {showIcon && <span>{style.icon}</span>}
      {style.label}
    </span>
  );
}
