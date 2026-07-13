"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";

export default function HeroSection({ stats }) {
  const statItems = [
    { value: `${stats.tracks}+`, label: "Learning Tracks", type: "tracks" },
    { value: `${stats.lessons}+`, label: "Lessons", type: "lessons" },
    { value: `${stats.questions}+`, label: "Quiz Questions", type: "questions" },
    { value: `${stats.users}+`, label: "Global Learners", type: "learners" },
    { value: `${stats.certificates}+`, label: "Certificates", type: "certificates" },
    { value: `${stats.maxStreak}+`, label: "Streak Record", type: "streak", glow: true }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full opacity-10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--accent)] rounded-full opacity-10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary-dark)] rounded-full opacity-5 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-sm text-[var(--text-muted)]">100% Free · No Credit Card Required</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 100, damping: 15 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6"
        >
          Learn the Full Stack,<br />
          <span className="gradient-text animate-gradient">Step by Step</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Master web development with structured roadmaps, interactive quizzes, daily streaks, and earn certificates — all for free. From HTML to Full&nbsp;Stack Developer.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/register" className="btn-primary text-lg !py-4 !px-10 animate-pulse-glow">
            🚀 Start Learning for Free
          </Link>
          <a href="#how-it-works" className="btn-secondary text-lg !py-4 !px-10">
            See How It Works
          </a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5 max-w-6xl mx-auto"
        >
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 + index * 0.08 }}
            >
              <StatCard
                value={stat.value}
                label={stat.label}
                type={stat.type}
                glow={stat.glow}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-[var(--border)] flex justify-center pt-2">
          <div className="w-1 h-3 bg-[var(--primary-light)] rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
