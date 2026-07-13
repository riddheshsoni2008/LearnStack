import Link from "next/link";

export default function LessonList({ lessonsByWeek, completedLessonIds }) {
  return (
    <div className="space-y-12 mb-20">
      {Object.keys(lessonsByWeek).map((weekString) => {
        const weekNum = parseInt(weekString, 10);
        const weekLessons = lessonsByWeek[weekString];

        // check if entire week is completed
        const isWeekCompleted = weekLessons.every(l => completedLessonIds.has(l._id));

        return (
          <div key={`week-${weekNum}`} className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border-2 ${
                isWeekCompleted 
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30" 
                  : "bg-[var(--surface-light)] text-[var(--foreground)] border-[var(--border)]"
              }`}>
                W{weekNum}
              </div>
              <h2 className="text-xl font-bold">Week {weekNum}</h2>
              {isWeekCompleted && <span className="text-[var(--accent)] text-xs font-bold px-2 py-1 bg-[var(--accent)]/10 rounded-full uppercase tracking-wider">Completed</span>}
            </div>

            <div className="grid gap-3 pl-5 md:pl-14 border-l-2 border-[var(--border)] ml-5 md:ml-0 relative">
              {weekLessons.map((lesson) => {
                const isDone = completedLessonIds.has(lesson._id);
                return (
                  <Link 
                    href={`/lesson/${lesson._id}`} 
                    key={lesson._id}
                    className={`block p-5 rounded-xl border transition-all ${
                      isDone 
                        ? "bg-[var(--surface-light)]/50 border-[var(--border)] opacity-70 hover:opacity-100" 
                        : "glass border-[var(--border)] hover:border-[var(--primary)] hover:-translate-y-1 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {isDone ? (
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs">✓</div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] flex items-center justify-center text-[10px] text-[var(--text-muted)] font-bold">{lesson.order}</div>
                          )}
                          <h3 className={`font-semibold ${isDone ? "text-[var(--text-muted)] line-through decoration-[var(--text-muted)]/30" : "text-[var(--foreground)]"}`}>
                            {lesson.title}
                          </h3>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] pl-8 line-clamp-2">{lesson.description}</p>
                      </div>
                      <div className="hidden sm:flex shrink-0 px-3 py-1 bg-[var(--primary)]/10 rounded-lg text-xs font-bold text-[var(--primary-light)]">
                        +{lesson.xpReward} XP
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
