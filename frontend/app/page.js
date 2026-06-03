"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ─── Navbar ─────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "glass py-3" : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110">
            L
          </div>
          <span className="text-xl font-bold tracking-tight">
            Learn<span className="gradient-text">Stack</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">Features</a>
          <a href="#tracks" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">Tracks</a>
          <a href="#how-it-works" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">How It Works</a>
          <a href="#community" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">Community</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!loading && user ? (
            <>
              <Link href="/profile" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">
                Profile
              </Link>
              <Link href="/dashboard" className="btn-primary text-sm !py-2.5 !px-6">
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors px-4 py-2">
                Log In
              </Link>
              <Link href="/register" className="btn-primary text-sm !py-2.5 !px-6">
                Start Learning — Free
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-[var(--foreground)] p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-xl p-6 animate-slide-up">
          <div className="flex flex-col gap-4">
            <a href="#features" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors font-medium" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#tracks" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors font-medium" onClick={() => setMobileOpen(false)}>Tracks</a>
            <a href="#how-it-works" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors font-medium" onClick={() => setMobileOpen(false)}>How It Works</a>
            <hr className="border-[var(--border)]" />
            {!loading && user ? (
              <>
                <Link href="/profile" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors font-medium">Profile</Link>
                <Link href="/dashboard" className="btn-primary text-center text-sm !py-3">Go to Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[var(--text-muted)] font-medium">Log In</Link>
                <Link href="/register" className="btn-primary text-center text-sm !py-3">Start Learning — Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ───────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full opacity-10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--accent)] rounded-full opacity-10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary-dark)] rounded-full opacity-5 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-sm text-[var(--text-muted)]">100% Free · No Credit Card Required</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Learn the Full Stack,<br />
          <span className="gradient-text animate-gradient">Step by Step</span>
        </h1>

        <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.3s" }}>
          Master web development with structured roadmaps, interactive quizzes, daily streaks, and earn certificates — all for free. From HTML to Full&nbsp;Stack Developer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <Link href="/register" className="btn-primary text-lg !py-4 !px-10 animate-pulse-glow">
            🚀 Start Learning for Free
          </Link>
          <a href="#how-it-works" className="btn-secondary text-lg !py-4 !px-10">
            See How It Works
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.7s" }}>
          {[
            { value: "7+", label: "Learning Tracks" },
            { value: "100+", label: "Lessons" },
            { value: "500+", label: "Quiz Questions" },
            { value: "Free", label: "Forever" },
          ].map((stat) => (
            <div key={stat.label} className="glass-light rounded-xl p-4">
              <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-[var(--border)] flex justify-center pt-2">
          <div className="w-1 h-3 bg-[var(--primary-light)] rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ───────────────────────────────────
const features = [
  { icon: "🗺️", title: "Structured Roadmaps", desc: "Follow a clear week-by-week learning path. No more confusion about what to learn next." },
  { icon: "🎮", title: "Gamified Learning", desc: "Earn XP, maintain streaks, unlock badges. Learning feels like playing a game." },
  { icon: "🧪", title: "Interactive Quizzes", desc: "Test your knowledge after every lesson with MCQ quizzes and instant feedback." },
  { icon: "📹", title: "Video Lessons", desc: "Watch curated YouTube videos with notes and code examples — all in one place." },
  { icon: "🏅", title: "Certificates", desc: "Complete a track and get a shareable certificate to showcase your skills." },
  { icon: "💬", title: "Community Q&A", desc: "Stuck on something? Ask the community. Help others and earn reputation." },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--accent)] rounded-full opacity-5 blur-[100px]" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[var(--accent)] font-semibold text-sm uppercase tracking-widest">Features</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            Everything you need to <span className="gradient-text">become a developer</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">
            Not just another tutorial site. LearnStack is built to make you a real developer with real skills.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="glass rounded-2xl p-7 card-hover" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 rounded-xl bg-[var(--surface-light)] flex items-center justify-center text-2xl mb-5">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tracks Section ─────────────────────────────────────
const tracks = [
  { slug: "html-css", icon: "🌐", title: "HTML & CSS", weeks: 3, lessons: 15, level: "Beginner", color: "#e17055", desc: "Build the foundation of every website" },
  { slug: "javascript", icon: "⚡", title: "JavaScript", weeks: 4, lessons: 20, level: "Beginner", color: "#fdcb6e", desc: "Make websites interactive and dynamic" },
  { slug: "react-js", icon: "⚛️", title: "React.js", weeks: 4, lessons: 20, level: "Intermediate", color: "#74b9ff", desc: "Build modern single-page applications" },
  { slug: "next-js", icon: "🚀", title: "Next.js", weeks: 3, lessons: 15, level: "Intermediate", color: "#a29bfe", desc: "Full-stack React framework for production" },
  { slug: "node-js-express", icon: "🛠️", title: "Node.js & Express", weeks: 3, lessons: 15, level: "Intermediate", color: "#55efc4", desc: "Build powerful backend APIs" },
  { slug: "mongodb", icon: "🗄️", title: "MongoDB", weeks: 2, lessons: 10, level: "Intermediate", color: "#00b894", desc: "Store and manage data like a pro" },
  { slug: "full-stack-project", icon: "💼", title: "Full Stack Project", weeks: 4, lessons: 20, level: "Advanced", color: "#fd79a8", desc: "Build a complete real-world application" },
];

function TracksSection() {
  return (
    <section id="tracks" className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[var(--primary)] rounded-full opacity-5 blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[var(--accent)] font-semibold text-sm uppercase tracking-widest">Learning Tracks</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            From <span className="gradient-text">Zero to Full Stack</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">
            Follow the path from complete beginner to building real-world full stack applications.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tracks.map((track) => (
            <Link href={`/course/${track.slug}`} key={track.title} className="glass rounded-2xl p-6 card-hover group relative overflow-hidden block">
              <div className="absolute top-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: track.color }} />
              <div className="text-3xl mb-4">{track.icon}</div>
              <h3 className="text-lg font-semibold mb-1">{track.title}</h3>
              <p className="text-[var(--text-muted)] text-sm mb-4">{track.desc}</p>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span>📅 {track.weeks} weeks</span>
                <span>📚 {track.lessons} lessons</span>
              </div>
              <div className="mt-4">
                <span className="inline-block text-xs font-medium px-3 py-1 rounded-full" style={{ background: `${track.color}20`, color: track.color }}>
                  {track.level}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-[var(--text-muted)] text-sm">
            Complete all tracks to become a <span className="gradient-text font-semibold">Full Stack Developer</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works Section ───────────────────────────────
const steps = [
  { num: "01", title: "Sign Up Free", desc: "Create your account in 30 seconds. No credit card, no hidden costs.", icon: "✍️" },
  { num: "02", title: "Take Assessment", desc: "A quick quiz to find your level — beginner, intermediate, or advanced.", icon: "📝" },
  { num: "03", title: "Follow Your Path", desc: "Learn through videos, notes, code examples, and quizzes — week by week.", icon: "🛤️" },
  { num: "04", title: "Earn & Grow", desc: "Complete lessons, earn XP, keep streaks alive, and unlock badges & certificates.", icon: "🏆" },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[var(--accent)] font-semibold text-sm uppercase tracking-widest">How It Works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            Start learning in <span className="gradient-text">4 simple steps</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-[2px] bg-[var(--border)]">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--primary)] opacity-40" />
                </div>
              )}
              <div className="glass rounded-2xl p-7 card-hover text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-xs font-bold text-[var(--primary-light)] mb-2 tracking-widest">STEP {step.num}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ────────────────────────────────────────
function CtaSection() {
  return (
    <section className="py-24 relative" id="community">
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--accent)] opacity-90" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Ready to become a developer?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of learners who are building real skills with LearnStack. It&apos;s completely free — start now.
            </p>
            <Link href="/register" className="inline-block bg-white text-[var(--primary-dark)] font-bold text-lg px-10 py-4 rounded-xl hover:bg-white/90 transition-all hover:scale-105 hover:shadow-2xl">
              🚀 Get Started for Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">L</div>
              <span className="text-lg font-bold">Learn<span className="gradient-text">Stack</span></span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">Learn the full stack, step by step. Free forever.</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-[var(--text-muted)]">Platform</h4>
            <ul className="space-y-2">
              {["Tracks", "Quizzes", "Certificates", "Community"].map((item) => (
                <li key={item}><a href="#" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-[var(--text-muted)]">Tracks</h4>
            <ul className="space-y-2">
              {["HTML & CSS", "JavaScript", "React.js", "Node.js"].map((item) => (
                <li key={item}><a href="#" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-[var(--text-muted)]">Connect</h4>
            <ul className="space-y-2">
              {["GitHub", "Twitter", "Discord", "Contact"].map((item) => (
                <li key={item}><a href="#" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-sm">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-muted)] text-sm">© 2026 LearnStack. Built by <span className="gradient-text font-medium">Soni Riddhesh</span></p>
          <p className="text-[var(--text-muted)] text-xs">Made with 💜 for developers</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="flex-1">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TracksSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
