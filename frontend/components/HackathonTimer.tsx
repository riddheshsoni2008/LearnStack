"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/**
 * HackathonTimer — Self-fetching real-time countdown timer.
 *
 * Usage:
 *   <HackathonTimer />                         — auto-fetches current hackathon from API
 *   <HackathonTimer hackathon={hackathonObj} /> — uses the provided hackathon object directly
 */
interface HackathonTimerProps {
  hackathon?: any;
  title?: string;
  subtitle?: string;
}

export default function HackathonTimer({
  hackathon: hackathonProp = null,
  title: titleOverride,
  subtitle: subtitleOverride,
}: HackathonTimerProps = {}) {
  const [hackathon, setHackathon] = useState(hackathonProp || null);
  const [loading, setLoading] = useState(!hackathonProp);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // If a hackathon prop is provided, sync it
  useEffect(() => {
    if (hackathonProp) {
      setHackathon(hackathonProp);
      setLoading(false);
    }
  }, [hackathonProp]);

  // Fetch from API only when no hackathon prop is given
  useEffect(() => {
    if (hackathonProp) return; // Skip fetch when prop is provided

    const fetchCurrentHackathon = async () => {
      try {
        const res = await fetch("/api/hackathons/current", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setHackathon(data.data);
          }
        }
      } catch {
        // Silently fail — banner just won't show
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentHackathon();
  }, [hackathonProp]);

  // Determine which date to count down to
  const isActive = hackathon?.status === "active";
  const targetDate = isActive ? hackathon?.endDate : hackathon?.startDate;

  // Countdown timer — runs every second once we have a target date
  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const difference = new Date(targetDate).getTime() - new Date().getTime();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }, [targetDate]);

  useEffect(() => {
    if (!targetDate) return;

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, calculateTimeLeft]);

  // Don't render anything while loading or if there's no hackathon
  if (loading || !hackathon) return null;

  // If both endDate and startDate are in the past, hide the banner
  const endDiff = hackathon.endDate
    ? new Date(hackathon.endDate).getTime() - new Date().getTime()
    : -1;
  const startDiff = hackathon.startDate
    ? new Date(hackathon.startDate).getTime() - new Date().getTime()
    : -1;
  if (endDiff <= 0 && startDiff <= 0) return null;

  // Determine display text
  const title =
    titleOverride ||
    (isActive ? "Hackathon Ends In..." : "Hackathon Starts In...");
  const subtitle =
    subtitleOverride ||
    hackathon.shortDescription ||
    "Keep going — complete challenges and climb the leaderboard!";

  return (
    <div className="glass rounded-2xl p-6 mb-8 border border-[var(--primary)]/30 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent opacity-50"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            🏆 {title}
          </h2>
          <p className="text-[var(--text-muted)] text-sm mb-3">{subtitle}</p>
          {hackathon.slug && (
            <Link
              href={`/hackathon/${hackathon.slug}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary-light)] hover:underline"
            >
              {isActive ? "Go to Hackathon →" : "Register Now →"}
            </Link>
          )}
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

interface TimeUnitProps {
  value: any;
  label: string;
  animate?: boolean;
}

function TimeUnit({ value, label, animate = false }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 bg-[var(--surface-light)] rounded-xl flex items-center justify-center border border-[var(--border)] shadow-sm ${animate ? "animate-pulse-glow" : ""}`}
      >
        <span className="text-2xl sm:text-3xl font-mono font-bold text-[var(--primary)]">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] mt-2 font-medium">
        {label}
      </span>
    </div>
  );
}
