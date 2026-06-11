"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function HackathonBanner() {
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth() || {};
  const router = useRouter();

  // We fetch every minute to stay in sync with the auto lifecycle
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const res = await fetch("/api/hackathons/current");
        const data = await res.json();
        if (data.success && data.data) {
          setHackathon(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch current hackathon");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrent();
    const interval = setInterval(fetchCurrent, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  // Fallback if DB is literally empty (cron hasn't run yet)
  if (!hackathon) {
    return (
      <div className="bg-gradient-to-r from-[#6c5ce7] via-[#4834d4] to-[#00cec9] text-white relative z-[60] w-full border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center text-sm sm:text-base font-medium">
          <span className="text-xl animate-bounce mr-2">🔥</span>
          <strong>New Hackathon Coming Soon!</strong>
        </div>
      </div>
    );
  }

  // Determine State
  const isActive = hackathon.status === "active";
  const isBreak = hackathon.status === "registration_open"; // "Break" period before start

  const handleJoinClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Redirect to the dedicated registration page
    router.push(`/hackathon/${hackathon.slug}/register`);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-[#6c5ce7] via-[#4834d4] to-[#00cec9] text-white relative z-[60] w-full border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm sm:text-base font-medium">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="text-xl animate-bounce">{isActive ? "🚀" : "⏳"}</span>
            <span>
              <strong>{isActive ? "Hackathon Live Now!" : "Next Hackathon Starting Soon!"}</strong>{" "}
              {hackathon.title} — {hackathon.shortDescription}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleJoinClick}
              className="bg-white text-[#4834d4] px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-100 transition shadow-sm whitespace-nowrap"
            >
              {isActive ? "Join Hackathon" : "Register Early"}
            </button>
          </div>
        </div>
      </div>

    </>
  );
}
