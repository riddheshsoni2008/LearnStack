"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/CourseCard";
import AuthNavbar from "@/components/AuthNavbar";

export default function TracksPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Auth check
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    // 2. Fetch tracks
    const fetchTracks = async () => {
      if (!user) return; // Wait for user to be available
      try {
        const res = await fetch("/api/tracks", {
          cache: "no-store"
        });
        const data = await res.json();
        if (data.success) {
          setTracks(data.data);
        } else {
          setError(data.message || "Failed to load tracks.");
        }
      } catch (err) {
        setError("Error connecting to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--text-muted)] text-lg animate-pulse">Loading tracks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AuthNavbar />

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
          Select Your <span className="gradient-text">Learning Path</span>
        </h1>
        <p className="text-[var(--text-muted)] max-w-2xl">
          Start from zero and learn step-by-step with structured, gamified tracks. Earn XP, maintain your streak, and level up!
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {error ? (
          <div className="glass border border-red-500/30 rounded-2xl p-6 text-red-400 text-center max-w-lg mx-auto mt-10">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {tracks.map((track) => (
              <CourseCard key={track._id} track={track} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
