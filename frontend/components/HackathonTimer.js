"use client";
import { useState, useEffect } from "react";

export default function HackathonTimer({ endDate, title = "Hackathon Ends In...", subtitle }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="glass rounded-2xl p-6 mb-8 border border-[var(--primary)]/30 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent opacity-50"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            🏆 {title}
          </h2>
          <p className="text-[var(--text-muted)] text-sm">
            {subtitle || "Keep going — complete challenges and climb the leaderboard!"}
          </p>
        </div>
        
        <div className="flex gap-4" suppressHydrationWarning>
          <TimeUnit value={timeLeft.days} label="Days" />
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <TimeUnit value={timeLeft.seconds} label="Seconds" animate={true} />
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label, animate = false }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-[var(--surface-light)] rounded-xl flex items-center justify-center border border-[var(--border)] shadow-sm ${animate ? 'animate-pulse-glow' : ''}`}>
        <span className="text-2xl sm:text-3xl font-mono font-bold text-[var(--primary)]">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] mt-2 font-medium">
        {label}
      </span>
    </div>
  );
}
