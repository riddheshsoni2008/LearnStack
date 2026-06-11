"use client";
import { useState, useEffect, useCallback } from "react";

export default function RoundTimer({ endTime, duration, onTimeUp, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((end - now) / 1000));
  }, [endTime]);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onTimeUp]);

  if (!mounted) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 300; // Less than 5 minutes
  const isCritical = timeLeft < 60; // Less than 1 minute

  if (compact) {
    return (
      <div className={`font-mono text-lg font-bold ${isCritical ? "text-red-500 animate-pulse" : isUrgent ? "text-orange-400" : "text-[var(--primary-light)]"}`}>
        {hours > 0 && `${hours.toString().padStart(2, "0")}:`}
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl p-6 border transition-all ${isCritical ? "border-red-500/50 bg-red-500/10" : isUrgent ? "border-orange-500/30 bg-orange-500/5" : "border-[var(--primary)]/30 bg-[var(--primary)]/5"}`}>
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div
          className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${isCritical ? "bg-red-500" : isUrgent ? "bg-orange-400" : "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"}`}
          style={{ width: `${duration ? (timeLeft / (duration * 60)) * 100 : 100}%` }}
        />
      </div>

      <div className="relative z-10 text-center">
        <div className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-3">
          {isCritical ? "⚠️ HURRY UP!" : isUrgent ? "⏰ Time Running Out" : "⏱️ Time Remaining"}
        </div>
        <div className="flex items-center justify-center gap-3">
          {hours > 0 && <TimerBlock value={hours} label="HRS" urgent={isUrgent} critical={isCritical} />}
          <span className={`text-2xl font-bold ${isCritical ? "text-red-400" : "text-[var(--text-muted)]"}`}>:</span>
          <TimerBlock value={minutes} label="MIN" urgent={isUrgent} critical={isCritical} />
          <span className={`text-2xl font-bold ${isCritical ? "text-red-400" : "text-[var(--text-muted)]"}`}>:</span>
          <TimerBlock value={seconds} label="SEC" urgent={isUrgent} critical={isCritical} animate />
        </div>
      </div>
    </div>
  );
}

function TimerBlock({ value, label, urgent, critical, animate }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center border shadow-sm transition-all ${
          critical
            ? "bg-red-500/20 border-red-500/50 text-red-400"
            : urgent
            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
            : "bg-[var(--surface-light)] border-[var(--border)] text-[var(--primary)]"
        } ${animate && critical ? "animate-pulse" : ""}`}
      >
        <span className="text-2xl sm:text-3xl font-mono font-bold">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1.5 font-bold">
        {label}
      </span>
    </div>
  );
}
