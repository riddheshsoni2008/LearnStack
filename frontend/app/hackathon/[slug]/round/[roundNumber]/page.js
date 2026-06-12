"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import RoundTimer from "@/components/hackathon/RoundTimer";
import QuestionDisplay from "@/components/hackathon/QuestionDisplay";
import QuestionNavigator from "@/components/hackathon/QuestionNavigator";

export default function RoundPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [roundData, setRoundData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchRound = async () => {
      try {
        const res = await fetch(`/api/hackathons/${params.slug}/rounds/${params.roundNumber}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRoundData(data.data);
          setQuestions(data.data.questions || []);
          if (data.data.started) {
            setExamStarted(true);
          }
        } else {
          setError(data.message || "Failed to load round.");
        }
      } catch (err) {
        setError("Failed to load round. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRound();
  }, [user, authLoading, router, params.slug, params.roundNumber]);

  const handleStartExam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hackathons/${params.slug}/rounds/${params.roundNumber}/start`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data.questions || []);
        setRoundData(prev => ({
          ...prev,
          startedAt: data.data.startedAt,
          started: true
        }));
        setExamStarted(true);
      } else {
        setError(data.message || "Failed to start exam.");
      }
    } catch (err) {
      setError("Failed to start exam.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = useCallback((answerData) => {
    setAnswers((prev) => ({
      ...prev,
      [answerData.questionId]: answerData,
    }));
  }, []);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || hasAutoSubmitted.current) return;
    if (auto) hasAutoSubmitted.current = true;
    setSubmitting(true);

    try {
      const answerArray = Object.values(answers).map((a) => ({
        questionId: a.questionId,
        answer: a.answer || "",
        selectedOptionIndex: a.selectedOptionIndex ?? -1,
        timeTaken: 0,
      }));

      const res = await fetch(`/api/hackathons/${params.slug}/rounds/${params.roundNumber}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          answers: answerArray,
          autoSubmitted: auto,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/hackathon/${params.slug}/results`);
      } else {
        setError(data.message);
        setSubmitting(false);
      }
    } catch (err) {
      setError("Submission failed. Please try again.");
      setSubmitting(false);
    }
  }, [answers, params.slug, params.roundNumber, router, submitting]);

  const handleTimeUp = useCallback(() => {
    handleSubmit(true);
  }, [handleSubmit]);

  // ═══ Loading State ═══
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  // ═══ Error State ═══
  if (error && !roundData) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <AuthNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="glass rounded-3xl p-12 border border-red-500/30">
            <div className="text-6xl mb-6">🚫</div>
            <h1 className="text-2xl font-black mb-4 text-red-400">{error}</h1>
            <p className="text-[var(--text-muted)] text-sm mb-8">
              This could mean you are not registered, the round hasn't started yet, or you have already submitted.
            </p>
            <button onClick={() => router.push(`/hackathon/${params.slug}`)} className="btn-primary !py-3 !px-8">
              ← Back to Hackathon
            </button>
          </div>
        </div>
      </div>
    );
  }

  const round = roundData?.round;
  const hasQuestions = questions.length > 0;

  // ═══ Pre-Exam Briefing Screen ═══
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <AuthNavbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 md:p-12 border border-[var(--primary)]/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">📝</div>
                <h1 className="text-3xl font-black mb-2">{round?.title || `Round ${params.roundNumber}`}</h1>
                <p className="text-[var(--text-muted)]">Review the details below before starting</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass rounded-xl p-4 text-center border border-[var(--border)]">
                  <div className="text-2xl font-black text-[var(--primary-light)]">{round?.duration || "—"}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase font-bold mt-1">Minutes</div>
                </div>
                <div className="glass rounded-xl p-4 text-center border border-[var(--border)]">
                  <div className="text-2xl font-black text-emerald-400">{hasQuestions ? questions.length : "—"}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase font-bold mt-1">Questions</div>
                </div>
                <div className="glass rounded-xl p-4 text-center border border-[var(--border)]">
                  <div className="text-2xl font-black text-yellow-400">{round?.qualifyingScore || 20}</div>
                  <div className="text-xs text-[var(--text-muted)] uppercase font-bold mt-1">Pts to Qualify</div>
                </div>
                <div className="glass rounded-xl p-4 text-center border border-[var(--border)]">
                  <div className={`text-2xl font-black ${
                    round?.difficulty === 'easy' ? 'text-green-400' :
                    round?.difficulty === 'intermediate' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(round?.difficulty || 'easy').charAt(0).toUpperCase() + (round?.difficulty || 'easy').slice(1)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] uppercase font-bold mt-1">Difficulty</div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 mb-8 border border-yellow-500/20 bg-yellow-500/5">
                <h3 className="text-sm font-bold text-yellow-400 mb-2">⚠️ Important Rules</h3>
                <ul className="text-xs text-[var(--text-muted)] space-y-1.5">
                  <li>• The timer starts once you click <strong>"Start Exam"</strong>.</li>
                  <li>• Answers are auto-submitted when the timer reaches zero.</li>
                  <li>• You cannot pause or restart the exam.</li>
                  <li>• Navigate freely between questions using the sidebar.</li>
                </ul>
              </div>

              {!round ? (
                <div className="text-center">
                  <div className="glass rounded-xl p-6 border border-orange-500/30 bg-orange-500/5 mb-4">
                    <div className="text-3xl mb-3">⚠️</div>
                    <h3 className="text-lg font-bold text-orange-400 mb-2">Round Details Unavailable</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      Please contact the organizer or try again later.
                    </p>
                  </div>
                  <button onClick={() => router.push(`/hackathon/${params.slug}`)} className="btn-secondary !py-3 !px-8">
                    ← Back to Hackathon
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartExam}
                  className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-black py-4 rounded-2xl text-lg shadow-[0_0_20px_rgba(108,92,231,0.4)] hover:shadow-[0_0_30px_rgba(108,92,231,0.6)] transition-all hover:scale-[1.02]"
                >
                  🚀 Start Exam ({round?.duration} min)
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══ Exam Interface ═══
  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* ═══ Top Bar ═══ */}
      <div className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[var(--primary-light)]">
              Round {params.roundNumber}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {round?.title}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {roundData?.startedAt && (
              <RoundTimer
                endTime={new Date(new Date(roundData.startedAt).getTime() + round.duration * 60000).toISOString()}
                duration={round.duration}
                onTimeUp={handleTimeUp}
                compact
              />
            )}
            <button
              onClick={() => hasQuestions ? setShowConfirm(true) : null}
              disabled={submitting || !hasQuestions}
              className="btn-primary !py-2 !px-5 !text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ═══ Timer (full) ═══ */}
        {roundData?.startedAt && (
          <div className="mb-6">
            <RoundTimer
              endTime={new Date(new Date(roundData.startedAt).getTime() + round.duration * 60000).toISOString()}
              duration={round.duration}
              onTimeUp={handleTimeUp}
            />
          </div>
        )}

        {error && (
          <div className="glass rounded-xl p-4 mb-6 text-sm text-red-400 font-medium border border-red-500/30">
            ⚠️ {error}
          </div>
        )}

        {/* ═══ No Questions Warning ═══ */}
        {!hasQuestions && (
          <div className="glass rounded-2xl p-12 text-center border border-orange-500/30 bg-orange-500/5">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-orange-400 mb-2">No Questions Available</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              No questions have been assigned to this round. Please contact the hackathon organizer.
            </p>
            <button onClick={() => router.push(`/hackathon/${params.slug}`)} className="btn-primary !py-3 !px-6">
              ← Back to Hackathon
            </button>
          </div>
        )}

        {/* ═══ Main Layout ═══ */}
        {hasQuestions && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Display (3/4 width) */}
            <div className="lg:col-span-3">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <QuestionDisplay
                    question={currentQuestion}
                    index={currentIndex}
                    total={questions.length}
                    answer={answers[currentQuestion._id]}
                    onAnswer={handleAnswer}
                  />
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="btn-secondary !py-3 !px-6 !text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-sm text-[var(--text-muted)] font-bold">
                  {currentIndex + 1} of {questions.length}
                </span>
                <button
                  onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="btn-secondary !py-3 !px-6 !text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Navigator Sidebar (1/4 width) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <QuestionNavigator
                  questions={questions}
                  answers={answers}
                  currentIndex={currentIndex}
                  onNavigate={setCurrentIndex}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Submit Confirmation Modal ═══ */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 sm:p-8 w-full max-w-md text-center"
          >
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-3">Submit Round {params.roundNumber}?</h2>
            <p className="text-sm text-[var(--text-muted)] mb-2">
              You have answered <span className="font-bold text-[var(--primary-light)]">{Object.keys(answers).length}</span> out of <span className="font-bold">{questions.length}</span> questions.
            </p>
            {Object.keys(answers).length < questions.length && (
              <p className="text-xs text-orange-400 mb-4">
                ⚠️ {questions.length - Object.keys(answers).length} questions are unanswered!
              </p>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="btn-primary !py-3 flex-1"
              >
                {submitting ? "Submitting..." : "Confirm Submit"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary !py-3 flex-1"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
