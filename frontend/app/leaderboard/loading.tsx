"use client";
import React from "react";
import AuthNavbar from "@/components/AuthNavbar";
import { LeaderboardSkeleton } from "@/components/loaders/Skeletons";

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <AuthNavbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
        <div className="text-center">
          <div className="h-10 bg-[var(--surface-light)] w-48 rounded mx-auto mb-2" />
          <div className="h-4 bg-[var(--surface-light)] w-64 rounded mx-auto" />
        </div>
        <div className="glass border border-[var(--primary)]/30 rounded-2xl p-6 h-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-light)]" />
              <div className="h-4 bg-[var(--surface-light)] w-32 rounded" />
            </div>
            <div className="h-6 bg-[var(--surface-light)] w-16 rounded" />
          </div>
        </div>
        <LeaderboardSkeleton />
      </div>
    </div>
  );
}
