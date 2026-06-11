"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AuthNavbar from "@/components/AuthNavbar";
import HackathonCard from "@/components/hackathon/HackathonCard";
import PrizeCard from "@/components/hackathon/PrizeCard";
import TimelineStep from "@/components/hackathon/TimelineStep";

export default function HackathonLandingPage() {
  const [hackathons, setHackathons] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await fetch("/api/hackathons");
        const data = await res.json();
        if (data.success) {
          setHackathons(data.data);
          // Feature the first active or registration_open hackathon
          const feat = data.data.find(h => h.status === "active" || h.status === "registration_open");
          setFeatured(feat || data.data[0] || null);
        }
      } catch (err) {
        console.error("Error fetching hackathons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      <AuthNavbar />

      {/* ═══ Hero Section ═══ */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/15 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-sm font-medium text-[var(--primary-light)] mb-6">
              <span className="animate-pulse">🔴</span> Live Hackathons
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Code. Compete.{" "}
              <span className="gradient-text">Conquer.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Join India&apos;s most exciting online hackathons. Test your skills across
              Web Development, AI, Cybersecurity, and more. Win prizes, earn certificates, and get recognized.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {featured ? (
                <Link href={`/hackathon/${featured.slug}`} className="btn-primary !py-4 !px-10 text-lg">
                  🚀 Register Now
                </Link>
              ) : (
                <span className="btn-primary !py-4 !px-10 text-lg opacity-60 cursor-not-allowed">
                  Coming Soon
                </span>
              )}
              <a href="#hackathons" className="btn-secondary !py-4 !px-10 text-lg">
                View All Hackathons
              </a>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 glass rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {[
              { label: "Active Hackathons", value: hackathons.filter(h => h.status === "active" || h.status === "registration_open").length, icon: "🏆" },
              { label: "Total Participants", value: hackathons.reduce((a, h) => a + (h.currentParticipants || 0), 0), icon: "👥" },
              { label: "Categories", value: "11+", icon: "📚" },
              { label: "Certificates", value: "3 Types", icon: "🎓" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Prize Pool Section ═══ */}
      {featured?.prizePool && (featured.prizePool.first || featured.prizePool.second || featured.prizePool.third) && (
        <section className="py-16 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black mb-3">
                🏆 <span className="gradient-text">Prize Pool</span>
              </h2>
              {featured.prizePool.description && (
                <p className="text-[var(--text-muted)]">{featured.prizePool.description}</p>
              )}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featured.prizePool.first && <PrizeCard rank={1} prize={featured.prizePool.first} delay={0.1} />}
              {featured.prizePool.second && <PrizeCard rank={2} prize={featured.prizePool.second} delay={0.2} />}
              {featured.prizePool.third && <PrizeCard rank={3} prize={featured.prizePool.third} delay={0.3} />}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Timeline Section ═══ */}
      {featured?.rounds?.length > 0 && (
        <section className="py-16 relative">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black mb-3">
                📅 <span className="gradient-text">Hackathon Timeline</span>
              </h2>
              <p className="text-[var(--text-muted)]">Your journey from registration to victory</p>
            </motion.div>

            <div>
              {/* Registration step */}
              <TimelineStep
                step={{
                  title: "Registration Opens",
                  date: featured.registrationStart,
                  description: "Sign up and reserve your spot.",
                  status: new Date() > new Date(featured.registrationStart) ? "completed" : "upcoming",
                }}
                index={0}
                isLast={false}
              />
              {/* Round steps */}
              {featured.rounds.map((round, idx) => (
                <TimelineStep
                  key={round.roundNumber}
                  step={{
                    title: round.title || `Round ${round.roundNumber}`,
                    date: round.startTime,
                    description: `${round.difficulty?.charAt(0).toUpperCase() + round.difficulty?.slice(1)} • ${round.duration} minutes • ${round.qualifyingScore}% to qualify`,
                    status: round.status || "upcoming",
                  }}
                  index={idx + 1}
                  isLast={idx === featured.rounds.length - 1}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Rules Section ═══ */}
      {featured?.rules?.length > 0 && (
        <section className="py-16 bg-[var(--surface)]/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black mb-3">
                📋 <span className="gradient-text">Rules & Guidelines</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featured.rules.map((rule, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass rounded-xl p-4 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--primary-light)] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-[var(--foreground)]">{rule}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FAQ Section ═══ */}
      {featured?.faqs?.length > 0 && (
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black mb-3">
                ❓ <span className="gradient-text">Frequently Asked Questions</span>
              </h2>
            </motion.div>

            <div className="space-y-4">
              {featured.faqs.map((faq, idx) => (
                <FAQItem key={idx} question={faq.question} answer={faq.answer} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Sponsors Section ═══ */}
      {featured?.sponsors?.length > 0 && (
        <section className="py-16 bg-[var(--surface)]/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black mb-3">
                🤝 <span className="gradient-text">Our Sponsors</span>
              </h2>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-8">
              {featured.sponsors.map((sponsor, idx) => (
                <motion.a
                  key={idx}
                  href={sponsor.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="glass rounded-xl px-6 py-4 text-center hover:border-[var(--primary)]/40 transition-all"
                >
                  <div className="text-lg font-bold text-[var(--foreground)]">{sponsor.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">
                    {sponsor.tier} sponsor
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Previous Winners Section ═══ */}
      {featured?.previousWinners?.length > 0 && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black mb-3">
                🌟 <span className="gradient-text">Previous Winners</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.previousWinners.map((winner, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass rounded-xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                      {winner.rank <= 3 ? ["🥇", "🥈", "🥉"][winner.rank - 1] : `#${winner.rank}`}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--foreground)]">{winner.name}</div>
                      {winner.college && (
                        <div className="text-[10px] text-[var(--text-muted)]">{winner.college}</div>
                      )}
                    </div>
                  </div>
                  {winner.projectTitle && (
                    <div className="text-xs text-[var(--text-muted)] mb-1">
                      📁 {winner.projectTitle}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    {winner.state && <span>📍 {winner.state}</span>}
                    {winner.year && <span>📅 {winner.year}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ All Hackathons Section ═══ */}
      <section id="hackathons" className="py-16 bg-[var(--surface)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              🎯 <span className="gradient-text">All Hackathons</span>
            </h2>
            <p className="text-[var(--text-muted)]">Browse and join upcoming hackathons</p>
          </motion.div>

          {hackathons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map((hackathon, idx) => (
                <HackathonCard key={hackathon._id || idx} hackathon={hackathon} index={idx} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold mb-2">No Hackathons Yet</h3>
              <p className="text-[var(--text-muted)]">
                Stay tuned! Exciting hackathons are coming soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary)]/5 to-transparent" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Ready to <span className="gradient-text">Compete</span>?
            </h2>
            <p className="text-[var(--text-muted)] mb-8 text-lg">
              Join thousands of students from across India. Show your skills, win prizes, and earn recognition.
            </p>
            {featured ? (
              <Link href={`/hackathon/${featured.slug}`} className="btn-primary !py-4 !px-10 text-lg">
                🚀 Register Now — It&apos;s Free!
              </Link>
            ) : (
              <Link href="/dashboard" className="btn-primary !py-4 !px-10 text-lg">
                Go to Dashboard
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ═══ FAQ Accordion Item ═══
function FAQItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--surface-light)] transition-colors"
      >
        <span className="text-sm font-bold text-[var(--foreground)] pr-4">{question}</span>
        <span className={`text-[var(--primary-light)] transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{answer}</p>
        </div>
      )}
    </motion.div>
  );
}
