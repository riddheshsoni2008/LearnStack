"use client";
import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

// ─── Stat Card Icons (Animated SVGs) ───────────────────────────────────

// 1. Learning Tracks SVG
function TracksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent)] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

// 2. Lessons SVG
function LessonsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-light)] transition-transform duration-500 group-hover:scale-125">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      <circle cx="8" cy="12" r="2" fill="currentColor" className="animate-pulse" />
    </svg>
  );
}

// 3. Quiz Questions SVG
function QuizIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff7675] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-115">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  );
}

// 4. Global Learners SVG
function LearnersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#fdcb6e] transition-transform duration-500 group-hover:-translate-y-1">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// 5. Certificates SVG
function CertificatesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#55efc4] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
      <path d="M12 15l-2 5 2 2 2-2-2-5z" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
      <circle cx="12" cy="9" r="3" fill="currentColor" />
    </svg>
  );
}

// 6. Streak SVG
function StreakIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff7675] transition-transform duration-500 group-hover:scale-120 group-hover:rotate-12">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

const iconMap = {
  tracks: <TracksIcon />,
  lessons: <LessonsIcon />,
  questions: <QuizIcon />,
  learners: <LearnersIcon />,
  certificates: <CertificatesIcon />,
  streak: <StreakIcon />
};

export default function StatCard({ value, label, type, glow = false }) {
  const cardRef = useRef(null);

  // Motion values for spring 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative mouse position from the center of the card (-0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);

    // Update CSS custom properties for GPU glow borders
    const absoluteX = e.clientX - rect.left;
    const absoluteY = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${absoluteX}px`);
    card.style.setProperty("--mouse-y", `${absoluteY}px`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-1000">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`stat-card relative rounded-2xl p-4 sm:p-5 glass-light border border-white/5 transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${
          glow ? "animate-pulse-cyan shadow-[0_0_20px_rgba(0,206,201,0.15)] border-cyan-500/20" : ""
        }`}
      >
        {/* Glow spotlight tracking cursor */}
        <div className="stat-card-glow" />
        
        {/* Outer glowing border tracking cursor */}
        <div className="stat-card-border-glow" />

        {/* Content wrapping with 3D depth */}
        <div style={{ transform: "translateZ(50px)" }} className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
          {/* Animated Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-[var(--surface)] border border-white/5 flex items-center justify-center shadow-inner group">
            {iconMap[type]}
          </div>

          {/* Metric Details */}
          <div className="flex flex-col justify-center">
            <div className="text-xl sm:text-2xl font-black gradient-text leading-none mb-1">
              {value}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase leading-tight">
              {label}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
