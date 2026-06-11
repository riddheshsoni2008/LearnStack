"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import HackathonTimer from "@/components/HackathonTimer";
import PrizeCard from "@/components/hackathon/PrizeCard";
import QualificationBadge from "@/components/hackathon/QualificationBadge";

export default function HackathonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [hackathon, setHackathon] = useState(null);
  const [myStatus, setMyStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/hackathons/${params.slug}/details`);
        const data = await res.json();
        if (data.success) {
          setHackathon(data.data);
        } else {
          router.push("/hackathon");
          return;
        }

        if (user) {
          const statusRes = await fetch(`/api/hackathons/${params.slug}/my-status`, {
            credentials: "include",
          });
          const statusData = await statusRes.json();
          if (statusData.success) {
            setMyStatus(statusData.data);
          }
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchData();
  }, [params.slug, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!hackathon) return null;

  const isRegistered = myStatus?.registered;
  const regData = myStatus?.registration || {};
  const submissions = myStatus?.submissions || [];
  
  const now = new Date();
  const isActive = hackathon.status === "active";
  const isCompleted = hackathon.status === "completed";
  const canRegister = hackathon.status === "registration_open" || hackathon.status === "active";

  // ═══════════════════════════════════════════════════════════════
  // Participant Status System
  // ═══════════════════════════════════════════════════════════════
  let primaryState = "NOT_REGISTERED";
  let primaryCtaTitle = "🚀 Register for Hackathon";
  let primaryCtaLabel = "Register Now";
  let primaryCtaAction = () => router.push(`/hackathon/${params.slug}/register`);
  let primaryColor = "from-[#6c5ce7] to-[#00cec9]";

  if (isRegistered) {
    if (isCompleted || regData.status === "winner" || regData.status === "runner_up") {
      primaryState = "FINAL_COMPLETED";
      primaryCtaTitle = "🎉 Hackathon Completed";
      primaryCtaLabel = "View Results";
      primaryCtaAction = () => router.push(`/hackathon/${params.slug}/results`);
      primaryColor = "from-purple-500 to-pink-500";
    } else if (regData.status === "disqualified") {
      primaryState = "DISQUALIFIED";
      primaryCtaTitle = "❌ Disqualified";
      primaryCtaLabel = "View Results";
      primaryCtaAction = () => router.push(`/hackathon/${params.slug}/results`);
      primaryColor = "from-red-500 to-orange-500";
    } else {
      // Determine based on active rounds and submissions
      // regData.currentRound is the round they are eligible for (1-indexed)
      const eligibleRound = regData.currentRound || 1;
      const roundConfig = hackathon.rounds.find(r => r.roundNumber === eligibleRound);
      const submission = submissions.find(s => s.roundNumber === eligibleRound);

      if (submission && (submission.status === "in_progress" || submission.status === "submitted" || submission.status === "evaluated")) {
        // Round submitted, waiting for results or they are done with it and not yet qualified for next
        // Actually, 'evaluated' with qualified=false leads to disqualified, which is handled above.
        // If qualified=true, currentRound would be updated.
        primaryState = "ROUND_EVALUATION";
        primaryCtaTitle = `⏳ Round ${eligibleRound} Evaluation in Progress`;
        primaryCtaLabel = "View Results";
        primaryCtaAction = () => router.push(`/hackathon/${params.slug}/results`);
        primaryColor = "from-blue-500 to-indigo-500";
      } else if (roundConfig) {
        const isRoundActive = now >= new Date(roundConfig.startTime) && now <= new Date(roundConfig.endTime);
        if (isRoundActive && isActive) {
          primaryState = `ROUND_${eligibleRound}_AVAILABLE`;
          primaryCtaTitle = eligibleRound === 1 ? "🔥 Round 1 is Live" : eligibleRound === hackathon.rounds.length ? "🏆 Final Round Live" : "✅ Congratulations! You qualified for Round " + eligibleRound;
          primaryCtaLabel = eligibleRound === hackathon.rounds.length ? "Start Final Round" : `Start Round ${eligibleRound}`;
          primaryCtaAction = () => router.push(`/hackathon/${params.slug}/round/${eligibleRound}`);
          primaryColor = "from-green-500 to-emerald-500";
        } else {
          primaryState = "REGISTERED_WAITING";
          primaryCtaTitle = "✅ Registered Successfully";
          primaryCtaLabel = `Waiting for Round ${eligibleRound} to start`;
          primaryCtaAction = null; // Disabled button
          primaryColor = "from-gray-600 to-gray-500";
        }
      } else {
        primaryState = "COMPLETED_ALL_ROUNDS";
        primaryCtaTitle = "⏳ All Rounds Completed";
        primaryCtaLabel = "Waiting for Final Results";
        primaryCtaAction = () => router.push(`/hackathon/${params.slug}/results`);
        primaryColor = "from-blue-500 to-indigo-500";
      }
    }
  } else if (!canRegister) {
    primaryState = "REGISTRATION_CLOSED";
    primaryCtaTitle = "🔒 Registration Closed";
    primaryCtaLabel = "View Leaderboard";
    primaryCtaAction = () => router.push(`/hackathon/${params.slug}/leaderboard`);
    primaryColor = "from-gray-600 to-gray-500";
  }

  // Handle Login redirect
  if (!user && primaryState === "NOT_REGISTERED") {
    primaryCtaAction = () => router.push(`/login?redirect=/hackathon/${params.slug}/register`);
    primaryCtaLabel = "Login to Register";
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20">
      <AuthNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* ═══ Header ═══ */}
        <div className="mb-8">
          <Link href="/hackathon" className="text-sm text-[var(--primary-light)] hover:underline mb-4 inline-block">
            ← Back to Hackathons
          </Link>
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl sm:text-5xl font-black">{hackathon.title}</h1>
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  hackathon.status === "registration_open" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                  hackathon.status === "active" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                  "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                }`}>
                  {hackathon.status?.replace("_", " ")}
                </span>
              </div>
              <p className="text-[var(--text-muted)] max-w-2xl text-lg">{hackathon.description}</p>
            </div>
          </div>
        </div>

        {/* ═══ User Progress Visual Tracker ═══ */}
        {isRegistered && hackathon.rounds?.length > 0 && (
          <div className="mb-8 glass rounded-2xl p-6 overflow-x-auto hide-scrollbar">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-6">Your Progress Flow</h3>
            <div className="flex items-center min-w-max px-4">
              {/* Registration Node */}
              <div className="flex flex-col items-center relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-lg z-10">
                  ✅
                </div>
                <span className="text-xs font-bold mt-2">Registered</span>
              </div>
              
              {hackathon.rounds.map((round, idx) => {
                const isEligible = regData.currentRound >= round.roundNumber;
                const submission = submissions.find(s => s.roundNumber === round.roundNumber);
                const isDone = submission?.status === 'qualified' || submission?.status === 'submitted';
                const isFail = submission?.status === 'disqualified';
                
                // Determine line color from previous node
                const prevDone = idx === 0 ? true : submissions.find(s => s.roundNumber === round.roundNumber - 1)?.status === 'qualified';
                const lineClass = prevDone ? "bg-emerald-500" : "bg-[var(--border)]";

                // Determine node color
                let nodeClass = "bg-[var(--surface-light)] border-[var(--border)] text-[var(--text-muted)]";
                let icon = round.roundNumber;
                if (isDone) {
                  nodeClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                  icon = "✅";
                } else if (isFail) {
                  nodeClass = "bg-red-500/20 border-red-500 text-red-400";
                  icon = "❌";
                } else if (isEligible) {
                  nodeClass = "bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary-light)] animate-pulse";
                  icon = "🔥";
                }

                return (
                  <div key={round.roundNumber} className="flex items-center">
                    {/* Connecting Line */}
                    <div className={`w-16 sm:w-24 h-1 ${lineClass} transition-colors`} />
                    
                    {/* Node */}
                    <div className="flex flex-col items-center relative">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold z-10 transition-colors ${nodeClass}`}>
                        {icon}
                      </div>
                      <span className={`text-xs font-bold mt-2 absolute top-12 whitespace-nowrap ${isEligible && !isDone && !isFail ? 'text-[var(--primary-light)]' : 'text-[var(--text-muted)]'}`}>
                        Round {round.roundNumber}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Winner Node */}
              <div className="flex items-center">
                <div className={`w-16 sm:w-24 h-1 transition-colors ${regData.status === 'winner' ? "bg-yellow-500" : "bg-[var(--border)]"}`} />
                <div className="flex flex-col items-center relative">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg z-10 transition-colors ${
                    regData.status === 'winner' ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" : "bg-[var(--surface-light)] border-[var(--border)] grayscale opacity-50"
                  }`}>
                    🏆
                  </div>
                  <span className="text-xs font-bold mt-2 absolute top-12">Winner</span>
                </div>
              </div>
            </div>
            <div className="h-6" /> {/* Spacer for absolute text */}
          </div>
        )}

        {/* ═══ Primary Action Section (Giant CTA) ═══ */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden text-white shadow-2xl bg-gradient-to-br ${primaryColor}`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">{primaryCtaTitle}</h2>
              <p className="text-white/80 text-lg">
                {isRegistered ? `Current Score: ${regData.totalScore || 0} pts` : "Complete your registration to participate."}
              </p>
            </div>
            <button
              onClick={primaryCtaAction}
              disabled={!primaryCtaAction}
              className="bg-white text-black font-black py-4 px-10 rounded-2xl text-lg md:text-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {primaryCtaLabel}
            </button>
          </div>
        </motion.div>

        {/* ═══ Timer ═══ */}
        {hackathon.endDate && hackathon.status === "active" && (
          <HackathonTimer
            endDate={hackathon.endDate}
            title={`${hackathon.title} Ends In...`}
            subtitle="Complete your current round before time runs out!"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Rounds Section */}
            {hackathon.rounds?.length > 0 && (
              <div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="text-[var(--primary)]">📊</span> Hackathon Rounds
                </h2>
                <div className="grid gap-4">
                  {hackathon.rounds.map((round) => {
                    const isRoundActive = now >= new Date(round.startTime) && now <= new Date(round.endTime);
                    const submission = submissions.find(s => s.roundNumber === round.roundNumber);
                    
                    const isEligible = isRegistered && regData.currentRound >= round.roundNumber;
                    const isLocked = !isEligible && round.roundNumber > 1;
                    const isDone = submission?.status === 'qualified' || submission?.status === 'submitted' || submission?.status === 'disqualified';
                    const canAccess = isEligible && isRoundActive && !isDone && isActive;

                    let badgeColor = "bg-gray-500/20 text-gray-400";
                    let badgeLabel = "Locked";
                    if (isDone) {
                      badgeColor = "bg-purple-500/20 text-purple-400";
                      badgeLabel = "Completed";
                    } else if (canAccess) {
                      badgeColor = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
                      badgeLabel = "Available";
                    } else if (isEligible && !isRoundActive) {
                      badgeColor = "bg-yellow-500/20 text-yellow-400";
                      badgeLabel = "Waiting";
                    }

                    return (
                      <div key={round.roundNumber} className={`glass rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                        canAccess ? "border-[var(--primary)] shadow-[0_0_15px_rgba(108,92,231,0.2)]" : "border-[var(--border)] opacity-80"
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${
                            isDone ? "bg-purple-500/20 text-purple-400" :
                            canAccess ? "bg-[var(--primary)] text-white" :
                            "bg-[var(--surface)] text-[var(--text-muted)]"
                          }`}>
                            {isDone ? "✓" : round.roundNumber}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                              {round.title}
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                                {badgeLabel}
                              </span>
                            </h3>
                            <div className="text-xs text-[var(--text-muted)] mt-1 flex flex-wrap gap-2">
                              <span>⏱️ {round.duration} mins</span>
                              <span>•</span>
                              <span>🎯 {round.qualifyingScore}% to qualify</span>
                              <span>•</span>
                              <span className="uppercase text-[var(--primary-light)] font-bold">{round.difficulty}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full sm:w-auto flex-shrink-0">
                          {canAccess ? (
                            <Link href={`/hackathon/${params.slug}/round/${round.roundNumber}`} className="btn-primary !py-2 w-full sm:w-auto text-center block">
                              Start Round →
                            </Link>
                          ) : submission ? (
                            <QualificationBadge status={submission.status} size="md" />
                          ) : (
                            <button disabled className="btn-secondary !py-2 w-full sm:w-auto opacity-50 cursor-not-allowed">
                              {isLocked ? "🔒 Locked" : "Unavailable"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prize Pool */}
            {hackathon.prizePool && (hackathon.prizePool.first || hackathon.prizePool.second || hackathon.prizePool.third) && (
              <div className="pt-4">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="text-yellow-400">🏆</span> Prize Pool
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {hackathon.prizePool.first && <PrizeCard rank={1} prize={hackathon.prizePool.first} delay={0} />}
                  {hackathon.prizePool.second && <PrizeCard rank={2} prize={hackathon.prizePool.second} delay={0.1} />}
                  {hackathon.prizePool.third && <PrizeCard rank={3} prize={hackathon.prizePool.third} delay={0.2} />}
                </div>
              </div>
            )}

            {/* Rules */}
            {hackathon.rules?.length > 0 && (
              <div className="pt-4">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="text-[var(--primary)]">📋</span> Rules
                </h2>
                <div className="glass rounded-2xl p-6 space-y-3 border border-[var(--border)]">
                  {hackathon.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <span className="text-[var(--primary-light)] font-bold flex-shrink-0 bg-[var(--primary)]/10 w-6 h-6 rounded-full flex items-center justify-center">{idx + 1}</span>
                      <span className="text-[var(--text-muted)] mt-0.5">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {hackathon.faqs?.length > 0 && (
              <div className="pt-4">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="text-[var(--primary)]">❓</span> FAQ
                </h2>
                <div className="space-y-4">
                  {hackathon.faqs.map((faq, idx) => (
                    <div key={idx} className="glass rounded-2xl p-6 border border-[var(--border)]">
                      <div className="text-sm font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
                        <span className="text-[var(--primary)]">Q.</span> {faq.question}
                      </div>
                      <div className="text-sm text-[var(--text-muted)] pl-6">{faq.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="glass rounded-3xl p-6 border border-[var(--border)] sticky top-24">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">📌 Quick Info</h3>
              <div className="space-y-4 text-sm">
                {[
                  { label: "Participants", value: `${hackathon.currentParticipants || 0}${hackathon.participantLimitMode === "custom" ? `/${hackathon.maxParticipants}` : ""}`, icon: "👥" },
                  { label: "Total Rounds", value: hackathon.rounds?.length || 0, icon: "📊" },
                  { label: "Registration", value: hackathon.registrationType === "free" ? "Free" : `₹${hackathon.entryFee}`, icon: "💰" },
                  { label: "Mode", value: hackathon.hackathonMode === "team" ? "Team" : "Solo", icon: "🎯" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between pb-3 border-b border-[var(--border)] last:border-0 last:pb-0">
                    <span className="text-[var(--text-muted)] flex items-center gap-2">
                      <span className="opacity-70">{item.icon}</span> {item.label}
                    </span>
                    <span className="font-bold text-[var(--foreground)]">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href={`/hackathon/${params.slug}/leaderboard`}
                  className="btn-secondary !py-3 w-full text-center block text-sm border-[var(--border)] hover:border-[var(--primary)]"
                >
                  🏅 View Leaderboard
                </Link>
                {isRegistered && (
                  <Link
                    href={`/hackathon/${params.slug}/results`}
                    className="btn-secondary !py-3 w-full text-center block text-sm border-[var(--border)] hover:border-[var(--primary)]"
                  >
                    📊 View My Detailed Results
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
