"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TrackDetailPage({ params }) {
  const router = useRouter();
  const { id: trackId } = use(params);

  const [user, setUser] = useState(null);
  const [track, setTrack] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Auth check
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));

    // 2. Fetch track data & user progress
    const fetchData = async () => {
      try {
        // Fetch track + lessons
        const trackRes = await fetch(`http://localhost:5000/api/tracks/${trackId}`);
        const trackData = await trackRes.json();
        
        if (!trackData.success) {
          setError(trackData.message || "Failed to load track details.");
          setLoading(false);
          return;
        }

        setTrack(trackData.data.track);
        setLessons(trackData.data.lessons);

        // Fetch user progress
        const progressRes = await fetch("http://localhost:5000/api/progress/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const progressData = await progressRes.json();

        if (progressData.success) {
          setProgress(progressData.data);
        }
      } catch (err) {
        setError("Error connecting to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trackId, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--text-muted)] text-lg animate-pulse">Loading roadmap...</div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen bg-[var(--background)] py-20 px-6">
        <div className="glass border border-red-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <p className="text-red-400 text-lg mb-6">{error || "Track not found."}</p>
          <Link href="/tracks" className="btn-primary">
            Back to Tracks
          </Link>
        </div>
      </div>
    );
  }

  // Map progress into a Set of completed lesson IDs
  const completedLessonIds = new Set(
    progress
      .filter((p) => p.completed && p.trackId === trackId)
      .map((p) => p.lessonId)
  );

  // Group lessons by week number
  const lessonsByWeek = {};
  lessons.forEach((lesson) => {
    const w = lesson.weekNumber || 1;
    if (!lessonsByWeek[w]) {
      lessonsByWeek[w] = [];
    }
    lessonsByWeek[w].push(lesson);
  });

  // Calculate progress percentage
  const totalLessonsCount = lessons.length;
  const completedCount = lessons.filter(l => completedLessonIds.has(l._id)).length;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top nav */}
      <nav className="glass border-b border-[var(--border)] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">L</div>
            <span className="text-lg font-bold">Learn<span className="gradient-text">Stack</span></span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/tracks" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
              Tracks
            </Link>
            <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
              Dashboard
            </Link>
            <div className="text-sm text-[var(--text-muted)] border-l border-[var(--border)] pl-6">
              Welcome, <span className="text-[var(--foreground)] font-medium">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Track Header */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
        <Link href="/tracks" className="text-sm text-[var(--primary-light)] hover:text-[var(--primary)] transition-colors mb-6 inline-block">
          ← Back to Tracks
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">{track.title}</h1>
        <p className="text-[var(--text-muted)] mb-8 leading-relaxed">{track.description}</p>

        {/* Progress Bar Card */}
        <div className="glass rounded-2xl p-6 border border-[var(--border)] mb-12">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-[var(--text-muted)]">TRACK PROGRESS</span>
            <span className="text-sm font-bold text-[var(--accent)]">{progressPercent}% Completed ({completedCount}/{totalLessonsCount} lessons)</span>
          </div>
          <div className="w-full bg-[var(--surface-light)] rounded-full h-3 overflow-hidden border border-[var(--border)]">
            <div 
              className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Weekly Roadmap */}
        <h2 className="text-2xl font-bold mb-8">Roadmap Curriculum</h2>
        
        <div className="space-y-12 relative border-l-2 border-[var(--border)] ml-4 pl-8">
          {Object.keys(lessonsByWeek).sort((a, b) => Number(a) - Number(b)).map((week) => (
            <div key={week} className="relative">
              {/* Bullet node for the week */}
              <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-[var(--surface)] border-2 border-[var(--primary)] flex items-center justify-center z-10">
                <div className="w-2 h-2 rounded-full bg-[var(--primary-light)] animate-ping" />
              </div>

              <h3 className="text-xl font-bold mb-6 text-[var(--primary-light)]">
                Week {week} — Foundation Phase
              </h3>

              <div className="space-y-4">
                {lessonsByWeek[week].map((lesson) => {
                  const isCompleted = completedLessonIds.has(lesson._id);
                  return (
                    <div 
                      key={lesson._id} 
                      className={`glass rounded-2xl p-6 border transition-all duration-300 ${
                        isCompleted ? "border-emerald-500/20" : "border-[var(--border)]"
                      } hover:border-[var(--primary)] card-hover`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--surface-light)] text-[var(--text-muted)]">
                              ⚡ {lesson.xpReward} XP
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-bold mb-1">{lesson.title}</h4>
                          <p className="text-sm text-[var(--text-muted)]">{lesson.description}</p>
                        </div>
                        <Link 
                          href={`/lesson/${lesson._id}`} 
                          className={`btn-primary !py-2.5 !px-6 text-sm text-center shrink-0 ${
                            isCompleted ? "!bg-[var(--surface-light)] !border !border-[var(--border)] !text-[var(--text-muted)] hover:!border-emerald-500" : ""
                          }`}
                        >
                          {isCompleted ? "Review Lesson" : "Start Lesson"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
