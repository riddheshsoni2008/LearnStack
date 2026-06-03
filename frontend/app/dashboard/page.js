"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AuthNavbar />

      {/* Dashboard content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Hello, <span className="gradient-text">{user.name}</span> 👋
        </h1>
        <p className="text-[var(--text-muted)] mb-10">Here is your learning progress</p>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: "XP Points", value: user.xp || 0, icon: "⚡", color: "#fdcb6e" },
            { label: "Day Streak", value: user.streak || 0, icon: "🔥", color: "#e17055" },
            { label: "Level", value: user.level === "not_assessed" ? "Take Quiz" : user.level, icon: "📊", color: "#74b9ff" },
            { label: "Badges", value: user.badges?.length || 0, icon: "🏅", color: "#55efc4" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: `${stat.color}20`, color: stat.color }}>
                  {stat.label}
                </span>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Continue learning */}
        <div className="glass rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-2">Start Your First Track!</h2>
          <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            Choose a learning track and begin your journey to becoming a full stack developer.
          </p>
          <Link href="/tracks" className="btn-primary !py-3 !px-8">
            Browse Learning Tracks
          </Link>
        </div>
      </div>
    </div>
  );
}
