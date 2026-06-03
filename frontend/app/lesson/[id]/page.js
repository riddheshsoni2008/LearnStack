"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LessonPage({ params }) {
  const router = useRouter();
  const { id: lessonId } = use(params);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [prevLesson, setPrevLesson] = useState(null);
  
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Auth check
    const storedToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!storedToken || !userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    setToken(storedToken);

    // 2. Fetch lesson detail & progress status
    const fetchLessonData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/lessons/${lessonId}`);
        const data = await res.json();
        
        if (!data.success) {
          setError(data.message || "Failed to load lesson details.");
          setLoading(false);
          return;
        }

        setLesson(data.data.lesson);
        setQuiz(data.data.quiz);
        setNextLesson(data.data.nextLesson);
        setPrevLesson(data.data.prevLesson);

        // Fetch user progress to check if completed
        const progressRes = await fetch("http://localhost:5000/api/progress/me", {
          headers: {
            "Authorization": `Bearer ${storedToken}`
          }
        });
        const progressData = await progressRes.json();

        if (progressData.success) {
          const completed = progressData.data.some(
            (p) => p.lessonId?._id === lessonId && p.completed
          );
          setIsCompleted(completed);
        }
      } catch (err) {
        setError("Error connecting to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    if (quizResult) return; // Disable changes after submission
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (quizResult || submitting) return;

    // Check that all questions have answers
    const unansweredCount = quiz.questions.filter(q => selectedAnswers[q._id] === undefined).length;
    if (unansweredCount > 0) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/quiz/${lessonId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ answers: selectedAnswers })
      });
      const data = await res.json();

      if (data.success) {
        setQuizResult(data.data);
        if (data.data.passed) {
          setIsCompleted(true);
          // Update user XP in localstorage
          const updatedUser = { ...user, xp: user.xp + data.data.xpEarned };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        alert(data.message || "Failed to submit quiz.");
      }
    } catch (err) {
      alert("Error submitting quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteDirect = async () => {
    if (isCompleted || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/progress/complete/${lessonId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setIsCompleted(true);
        const updatedUser = { ...user, xp: user.xp + data.data.xpEarned };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        alert(data.message || "Failed to complete lesson.");
      }
    } catch (err) {
      alert("Error saving progress. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setQuizResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--text-muted)] text-lg animate-pulse">Loading lesson content...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-[var(--background)] py-20 px-6">
        <div className="glass border border-red-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <p className="text-red-400 text-lg mb-6">{error || "Lesson not found."}</p>
          <Link href="/tracks" className="btn-primary">
            Back to Tracks
          </Link>
        </div>
      </div>
    );
  }

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
            <Link href={`/tracks/${lesson.trackId?._id}`} className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
              Roadmap
            </Link>
            <div className="text-sm text-[var(--accent)] font-semibold flex items-center gap-1.5 bg-[var(--accent)]/10 px-3 py-1 rounded-full">
              ⚡ {user?.xp} XP
            </div>
            <div className="text-sm text-[var(--text-muted)] border-l border-[var(--border)] pl-6">
              Welcome, <span className="text-[var(--foreground)] font-medium">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb path */}
        <div className="mb-6 flex gap-2 text-xs text-[var(--text-muted)] uppercase tracking-wider">
          <Link href="/tracks" className="hover:text-[var(--primary-light)]">Tracks</Link>
          <span>/</span>
          <Link href={`/tracks/${lesson.trackId?._id}`} className="hover:text-[var(--primary-light)]">{lesson.trackId?.title}</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-semibold">Lesson {lesson.order}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Lesson Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold mb-3">{lesson.title}</h1>
              <p className="text-[var(--text-muted)]">{lesson.description}</p>
            </div>

            {/* Video Player Box */}
            {lesson.videoUrl && (
              <div className="glass border border-[var(--border)] rounded-2xl overflow-hidden aspect-video relative shadow-xl">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${lesson.videoUrl}`}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Concept Explanation Markdown */}
            <div className="glass border border-[var(--border)] rounded-2xl p-8 space-y-6">
              <h3 className="text-xl font-bold border-b border-[var(--border)] pb-3">Concept Explanation</h3>
              <div className="text-[var(--foreground)] leading-relaxed space-y-4 whitespace-pre-line text-sm md:text-base">
                {lesson.content}
              </div>
            </div>

            {/* Code Snippet Box */}
            {lesson.codeSnippet && (
              <div className="glass border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg">
                <div className="flex justify-between items-center bg-[var(--surface-light)] border-b border-[var(--border)] px-6 py-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">
                    💻 Interactive Code Viewer ({lesson.language || "javascript"})
                  </span>
                </div>
                <div className="p-6 bg-[#040406] overflow-x-auto">
                  <pre className="font-mono text-sm text-[var(--accent-light)] whitespace-pre">
                    <code>
                      {lesson.codeSnippet.split("\n").map((line, idx) => (
                        <div key={idx} className="table-row">
                          <span className="table-cell text-right pr-6 select-none opacity-20 text-xs w-6">{idx + 1}</span>
                          <span className="table-cell whitespace-pre">{line}</span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Quiz and Actions (1/3 width) */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="glass border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Lesson Status</span>
                <h4 className="text-lg font-bold">{isCompleted ? "Completed ✓" : "In Progress"}</h4>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
              }`}>
                {isCompleted ? "✓" : "⏰"}
              </div>
            </div>

            {/* Quiz Card */}
            {quiz ? (
              <div className="glass border border-[var(--border)] rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  🧪 Lesson Assessment Quiz
                </h3>

                {quizResult ? (
                  // Quiz Result screen
                  <div className="space-y-6">
                    <div className={`p-4 rounded-xl border text-center ${
                      quizResult.passed 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                      <div className="text-3xl font-extrabold mb-1">{quizResult.score}%</div>
                      <div className="text-sm font-semibold">{quizResult.passed ? "Passed!" : "Failed (Needs 60% to Pass)"}</div>
                      {quizResult.passed && <div className="text-xs mt-2 text-emerald-500">+ {quizResult.xpEarned} XP Awarded</div>}
                    </div>

                    {/* Explanations for each question */}
                    <div className="space-y-4">
                      {quizResult.results.map((qResult, idx) => (
                        <div key={qResult.questionId} className="border-t border-[var(--border)] pt-4">
                          <p className="text-xs font-semibold mb-2">{idx + 1}. {qResult.question}</p>
                          <div className="flex gap-2 items-center text-xs mb-2">
                            <span className={qResult.isCorrect ? "text-emerald-400" : "text-red-400"}>
                              {qResult.isCorrect ? "Correct ✓" : "Incorrect ✗"}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] bg-[var(--surface-light)] p-2.5 rounded-lg border border-[var(--border)] italic">
                            💡 {qResult.explanation}
                          </p>
                        </div>
                      ))}
                    </div>

                    {!quizResult.passed ? (
                      <button onClick={handleRetryQuiz} className="btn-primary w-full text-center">
                        Try Again
                      </button>
                    ) : (
                      <div className="text-xs text-[var(--text-muted)] text-center">
                        Quiz successfully passed! Keep learning.
                      </div>
                    )}
                  </div>
                ) : (
                  // Quiz Form screen
                  <form onSubmit={handleQuizSubmit} className="space-y-6">
                    {quiz.questions.map((q, qIdx) => (
                      <div key={q._id} className="space-y-2">
                        <p className="text-xs font-bold text-[var(--foreground)]">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[q._id] === oIdx;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleOptionSelect(q._id, oIdx)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-colors select-none ${
                                  isSelected 
                                    ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary-light)] font-medium" 
                                    : "bg-[var(--surface-light)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full text-center !py-3 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Quiz"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              // No Quiz (Direct Completion) Card
              <div className="glass border border-[var(--border)] rounded-2xl p-6 text-center">
                <h3 className="text-lg font-bold mb-2">No Quiz Assessment</h3>
                <p className="text-xs text-[var(--text-muted)] mb-6">
                  This is a reading / resource lesson. Mark it as completed to claim your XP and unlock the next lesson.
                </p>
                <button
                  onClick={handleCompleteDirect}
                  disabled={isCompleted || submitting}
                  className={`btn-primary w-full text-center !py-3 ${
                    isCompleted ? "!bg-[var(--surface-light)] !border !border-[var(--border)] !text-[var(--text-muted)] !cursor-not-allowed" : ""
                  }`}
                >
                  {isCompleted ? "Already Completed" : submitting ? "Saving..." : "Mark as Complete (+10 XP)"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation Links */}
        <div className="flex justify-between items-center border-t border-[var(--border)] mt-12 pt-6">
          {prevLesson ? (
            <Link 
              href={`/lesson/${prevLesson._id}`} 
              className="btn-secondary !py-2.5 !px-5 text-sm"
            >
              ← Previous: {prevLesson.title}
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link 
              href={`/lesson/${nextLesson._id}`} 
              className="btn-primary !py-2.5 !px-5 text-sm"
            >
              Next: {nextLesson.title} →
            </Link>
          ) : (
            <Link 
              href={`/tracks/${lesson.trackId?._id}`} 
              className="btn-primary !py-2.5 !px-5 text-sm"
            >
              Track Completed! Roadmap →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
