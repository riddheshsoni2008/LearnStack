"use client";
import { motion } from "framer-motion";

export default function TimelineStep({ step, index, isLast }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const STATUS_ICONS = {
    completed: "✅",
    active: "🔵",
    upcoming: "⏳",
  };

  const isPast = step.status === "completed";
  const isActive = step.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex gap-4"
    >
      {/* Timeline line & dot */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 z-10 transition-all ${isPast
          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
          : isActive
            ? "bg-[var(--primary)] border-[var(--primary-light)] text-white animate-pulse-glow"
            : "bg-[var(--surface-light)] border-[var(--border)] text-[var(--text-muted)]"
          }`}>
          <span className="text-sm">
            {STATUS_ICONS[step.status] || STATUS_ICONS.upcoming}
          </span>
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[2rem] ${isPast ? "bg-emerald-500/40" : "bg-[var(--border)]"
            }`} />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
        <div className={`rounded-xl p-4 border transition-all ${isActive
          ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 shadow-[0_0_15px_rgba(108,92,231,0.1)]"
          : "bg-[var(--surface-light)] border-[var(--border)]"
          } ${isPast ? "opacity-70" : ""}`}>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-[var(--foreground)]">{step.title}</h4>
            <span className="text-[10px] font-bold text-[var(--text-muted)]">
              {formatDate(step.date)}
            </span>
          </div>
          {step.description && (
            <p className="text-xs text-[var(--text-muted)]">{step.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
