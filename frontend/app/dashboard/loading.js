"use client";
import React from "react";
import AuthNavbar from "@/components/AuthNavbar";
import { StatsCardsSkeleton } from "@/components/loaders/Skeletons";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <AuthNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-[var(--surface-light)] w-64 rounded mb-2" />
          <div className="h-4 bg-[var(--surface-light)] w-48 rounded" />
        </div>
        <StatsCardsSkeleton />
        <div className="glass rounded-2xl p-6 h-[220px] mb-8 border border-[var(--border)]">
          <div className="h-5 bg-[var(--surface-light)] w-32 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-[var(--surface-light)] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
