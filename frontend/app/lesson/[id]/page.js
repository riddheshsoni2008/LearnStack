"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import CodeEditor from "@/components/CodeEditor";

export default function LessonPage({ params }) {
  const router = useRouter();
  const { id: lessonId } = use(params);

  const { user, setUser, loading: authLoading } = useAuth();
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
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    // 2. Fetch lesson detail & progress status
    const fetchLessonData = async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`, { cache: "no-store" });
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
        const progressRes = await fetch("/api/progress/me", { cache: "no-store" });
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

    if (user) {
      fetchLessonData();
    }
  }, [lessonId, user, authLoading, router]);



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
      const res = await fetch(`/api/quiz/${lessonId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ answers: selectedAnswers })
      });
      const data = await res.json();

      if (data.success) {
        setQuizResult(data.data);
        if (data.data.passed) {
          setIsCompleted(true);
          // Update user XP in local context
          const updatedUser = { ...user, xp: user.xp + data.data.xpEarned };
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
      const res = await fetch(`/api/progress/complete/${lessonId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      const data = await res.json();

      if (data.success) {
        setIsCompleted(true);
        const updatedUser = { ...user, xp: user.xp + data.data.xpEarned };
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
      <AuthNavbar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb path */}
        <div className="mb-6 flex gap-2 text-xs text-[var(--text-muted)] uppercase tracking-wider">
          <Link href="/tracks" className="hover:text-[var(--primary-light)]">Tracks</Link>
          <span>/</span>
          <Link href={`/course/${lesson.trackId?.slug}`} className="hover:text-[var(--primary-light)]">{lesson.trackId?.title}</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-semibold">Lesson {lesson.order}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Lesson Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-3">{lesson.title}</h1>
              <p className="text-[var(--text-muted)] text-sm sm:text-base">{lesson.description}</p>
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
            <div className="glass border border-[var(--border)] rounded-2xl p-5 sm:p-8 space-y-4 sm:space-y-6 overflow-hidden">
              <h3 className="text-lg sm:text-xl font-bold border-b border-[var(--border)] pb-3">Concept Explanation</h3>
              <div className="text-[var(--foreground)] leading-relaxed space-y-4 whitespace-pre-line text-sm md:text-base">
                {lesson.content}
              </div>
            </div>

            {/* Interactive Coding Challenge */}
            {lesson.codingChallenge?.title && (
              <CodeEditor
                challenge={lesson.codingChallenge}
                language={lesson.language}
              />
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                }`}>
                {isCompleted ? "✓" : "⏰"}
              </div>
            </div>

            {/* Quiz Card */}
            {quiz ? (
              <div className="glass border border-[var(--border)] rounded-2xl p-5 sm:p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  🧪 Lesson Assessment Quiz
                </h3>

                {quizResult ? (
                  // Quiz Result screen
                  <div className="space-y-6">
                    <div className={`p-4 rounded-xl border text-center ${quizResult.passed
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}>
                      <div className="text-3xl font-extrabold mb-1">{quizResult.score}%</div>
                      <div className="text-sm font-semibold">{quizResult.passed ? "Passed!" : "Failed (Needs 60% to Pass)"}</div>
                      {quizResult.passed && <div className="text-xs mt-2 text-emerald-500">+ {quizResult.xpEarned} XP Awarded</div>}
                    </div>


                    <div className="space-y-4">
                      {quizResult.results.map((qResult, idx) => (
                        <div key={qResult.questionId} className="border-t border-[var(--border)] pt-4">
                          <p className="text-xs font-semibold mb-2">{idx + 1}. {qResult.question}</p>
                          <div className="flex flex-col gap-1 text-xs mb-2">
                            <span className={qResult.isCorrect ? "text-emerald-400" : "text-red-400 font-bold"}>
                              {qResult.isCorrect ? "Correct ✓" : "Incorrect ✗"}
                            </span>
                            {!qResult.isCorrect && (
                              <span className="text-emerald-400 font-medium">
                                Correct Answer: {quiz.questions.find(q => q._id === qResult.questionId)?.options[qResult.correctAnswer]}
                              </span>
                            )}
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
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-colors select-none ${isSelected
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
                  className={`btn-primary w-full text-center !py-3 ${isCompleted ? "!bg-[var(--surface-light)] !border !border-[var(--border)] !text-[var(--text-muted)] !cursor-not-allowed" : ""
                    }`}
                >
                  {isCompleted ? "Already Completed" : submitting ? "Saving..." : "Mark as Complete (+10 XP)"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation Links */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-0 border-t border-[var(--border)] mt-10 pt-6">
          {prevLesson ? (
            <Link
              href={`/lesson/${prevLesson._id}`}
              className="btn-secondary !py-3 sm:!py-2.5 px-4 text-sm text-center truncate w-full sm:w-auto"
            >
              ← Previous: {prevLesson.title}
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextLesson ? (
            <Link
              href={`/lesson/${nextLesson._id}`}
              className="btn-primary !py-3 sm:!py-2.5 px-4 text-sm text-center truncate w-full sm:w-auto"
            >
              Next: {nextLesson.title} →
            </Link>
          ) : (
            <Link
              href={`/course/${lesson.trackId?.slug}`}
              className="btn-primary !py-3 sm:!py-2.5 px-4 text-sm text-center w-full sm:w-auto"
            >
              Track Completed! Roadmap →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
