import Link from "next/link";

export default function CourseCard({ track }) {
  return (
    <div className="glass rounded-2xl p-8 border border-[var(--border)] card-hover flex flex-col justify-between">
      <div>
        {/* Category level and tags */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary-light)]">
            ⚡ {track.level}
          </span>
          <div className="flex gap-2">
            {track.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--surface-light)] text-[var(--text-muted)]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-bold mb-3">{track.title}</h3>
        <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed line-clamp-3">
          {track.description}
        </p>

        {/* Track specs */}
        <div className="grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-6 mb-8 text-center">
          <div>
            <div className="text-xs text-[var(--text-muted)] mb-1">Duration</div>
            <div className="text-base font-bold">{track.totalWeeks} Weeks</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] mb-1">Lessons</div>
            <div className="text-base font-bold">{track.totalLessons} Parts</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] mb-1">Curriculum</div>
            <div className="text-base font-bold text-[var(--accent)]">100% Free</div>
          </div>
        </div>
      </div>

      {/* CTA Action */}
      <Link href={`/course/${track.slug}`} className="btn-primary text-center !py-3 w-full">
        Start Track
      </Link>
    </div>
  );
}
