"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const STATUS_STYLES = {
  draft: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Draft" },
  registration_open: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Registration Open" },
  active: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Active" },
  completed: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Completed" },
  archived: { bg: "bg-gray-500/20", text: "text-gray-500", label: "Archived" },
};

export default function HackathonCard({ hackathon, index = 0 }) {
  const status = STATUS_STYLES[hackathon.status] || STATUS_STYLES.draft;

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/hackathon/${hackathon.slug}`}>
        <div className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-light)] hover:border-[var(--primary)]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(108,92,231,0.15)] cursor-pointer">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative p-6">
            {/* Status badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${status.bg} ${status.text} border border-current/20`}>
                {status.label}
              </span>
              {hackathon.registrationType === "paid" && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                  ₹{hackathon.entryFee}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--primary-light)] transition-colors line-clamp-2">
              {hackathon.title}
            </h3>

            {/* Short description */}
            <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">
              {hackathon.shortDescription || hackathon.description?.slice(0, 120) || "Join this exciting hackathon!"}
            </p>

            {/* Date + Participants */}
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1">
                📅 {formatDate(hackathon.startDate)}
              </div>
              <div className="flex items-center gap-1">
                👥 {hackathon.currentParticipants || 0}
                {hackathon.participantLimitMode === "custom" && hackathon.maxParticipants > 0
                  ? `/${hackathon.maxParticipants}`
                  : ""} registered
              </div>
            </div>

            {/* Prize info */}
            {hackathon.prizePool?.totalValue && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <span className="text-xs font-bold text-yellow-400">
                  🏆 Prize Pool: {hackathon.prizePool.totalValue}
                </span>
              </div>
            )}

            {/* Tags */}
            {hackathon.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {hackathon.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
