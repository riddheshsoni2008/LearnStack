"use client";
import React from "react";

// Helper pulse div to keep styling DRY
const PulseBar = ({ className = "h-4 bg-[var(--surface-light)] rounded", ...props }) => (
  <div className={`animate-pulse ${className}`} {...props} />
);

// ═══════════════════════════════════════════════════════════════
// 1. Homepage Skeletons
// ═══════════════════════════════════════════════════════════════

export function HeroSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center animate-pulse">
      <PulseBar className="h-14 bg-[var(--surface-light)] w-3/4 rounded-2xl mx-auto mb-6" />
      <PulseBar className="h-6 bg-[var(--surface-light)] w-2/3 rounded-lg mx-auto mb-10" />
      <div className="flex justify-center gap-4">
        <PulseBar className="h-12 bg-[var(--surface-light)] w-40 rounded-xl" />
        <PulseBar className="h-12 bg-[var(--surface-light)] w-40 rounded-xl" />
      </div>
    </div>
  );
}

export function FeaturedCoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-2xl p-5 border border-[var(--border)] flex flex-col justify-between gap-4 h-[320px]">
          <div>
            <PulseBar className="h-40 bg-[var(--surface-light)] w-full rounded-xl mb-4" />
            <PulseBar className="h-5 bg-[var(--surface-light)] w-3/4 mb-2" />
            <PulseBar className="h-3 bg-[var(--surface-light)] w-1/2" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <PulseBar className="h-4 bg-[var(--surface-light)] w-20" />
            <PulseBar className="h-8 bg-[var(--surface-light)] w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-3 py-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <PulseBar key={i} className="h-10 bg-[var(--surface-light)] w-28 rounded-full" />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. Dashboard Skeletons
// ═══════════════════════════════════════════════════════════════

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* XP Ring Card */}
      <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center h-[218px] animate-pulse">
        <div className="w-[110px] h-[110px] rounded-full border-8 border-[var(--surface-light)] flex items-center justify-center">
          <PulseBar className="w-10 h-6 bg-[var(--surface-light)]" />
        </div>
        <PulseBar className="h-4 bg-[var(--surface-light)] w-24 mt-4" />
      </div>

      {/* Streak Calendar */}
      <div className="glass rounded-2xl p-6 h-[218px] animate-pulse">
        <div className="flex justify-between mb-4">
          <PulseBar className="h-4 bg-[var(--surface-light)] w-28" />
          <PulseBar className="h-3 bg-[var(--surface-light)] w-16" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <PulseBar className="h-2 bg-[var(--surface-light)] w-6" />
              <div className="w-9 h-9 bg-[var(--surface-light)] rounded-lg border border-[var(--border)]" />
            </div>
          ))}
        </div>
        <PulseBar className="h-6 bg-[var(--surface-light)] w-20 mx-auto mt-4" />
      </div>

      {/* Quick Stats */}
      <div className="glass rounded-2xl p-6 flex flex-col justify-between gap-4 h-[218px] animate-pulse">
        <PulseBar className="h-4 bg-[var(--surface-light)] w-24" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <PulseBar className="h-3 bg-[var(--surface-light)] w-32" />
              <PulseBar className="h-4 bg-[var(--surface-light)] w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div className="glass rounded-2xl p-6 mb-8 animate-pulse">
      <PulseBar className="h-5 bg-[var(--surface-light)] w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-light)]/20">
            <div className="space-y-2 flex-1">
              <PulseBar className="h-4 bg-[var(--surface-light)] w-48" />
              <PulseBar className="h-3 bg-[var(--surface-light)] w-32" />
            </div>
            <PulseBar className="h-5 bg-[var(--surface-light)] w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. Profile Skeletons
// ═══════════════════════════════════════════════════════════════

export function AvatarSkeleton() {
  return (
    <div className="relative animate-pulse">
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[var(--surface-light)] border-4 border-[var(--surface)]" />
      <div className="absolute -bottom-1 -right-1 bg-[var(--surface-light)] rounded-full w-8 h-8 border-2 border-[var(--background)]" />
    </div>
  );
}

export function UserInfoSkeleton() {
  return (
    <div className="flex-1 animate-pulse space-y-3">
      <PulseBar className="h-8 bg-[var(--surface-light)] w-48 mx-auto md:mx-0" />
      <PulseBar className="h-4 bg-[var(--surface-light)] w-64 mx-auto md:mx-0" />
      <PulseBar className="h-8 bg-[var(--surface-light)] w-56 rounded-full mx-auto md:mx-0" />
      <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
        <PulseBar className="h-3 bg-[var(--surface-light)] w-36" />
        <PulseBar className="h-3 bg-[var(--surface-light)] w-44" />
      </div>
    </div>
  );
}

export function CertificatesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bg-[var(--surface-light)]/40 border border-[var(--border)] rounded-xl p-5 h-[200px] flex flex-col justify-between">
          <div className="space-y-3">
            <PulseBar className="h-3 bg-[var(--surface-light)] w-24 rounded" />
            <PulseBar className="h-5 bg-[var(--surface-light)] w-48 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <PulseBar className="h-8 bg-[var(--surface-light)] rounded" />
            <PulseBar className="h-8 bg-[var(--surface-light)] rounded" />
            <PulseBar className="h-8 bg-[var(--surface-light)] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. Course Skeletons
// ═══════════════════════════════════════════════════════════════

export function CourseCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[var(--surface-light)]/30 border border-[var(--border)] rounded-xl p-4 h-24 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <PulseBar className="h-4 bg-[var(--surface-light)] w-32" />
            <PulseBar className="h-4 bg-[var(--surface-light)] w-10" />
          </div>
          <PulseBar className="w-full h-2 bg-[var(--surface-light)] rounded-full" />
          <PulseBar className="h-3 bg-[var(--surface-light)] w-16" />
        </div>
      ))}
    </div>
  );
}

export function VideoPlayerSkeleton() {
  return (
    <div className="aspect-video w-full bg-[var(--surface-light)]/20 border border-[var(--border)] rounded-2xl flex flex-col justify-between p-6 animate-pulse">
      <div className="flex justify-between">
        <PulseBar className="h-6 bg-[var(--surface-light)] w-48" />
        <PulseBar className="h-6 bg-[var(--surface-light)] w-12" />
      </div>
      <div className="w-16 h-16 rounded-full bg-[var(--surface-light)] mx-auto flex items-center justify-center">
        <div className="w-4 h-4 border-t-8 border-b-8 border-l-[12px] border-y-transparent border-l-white ml-1.5" />
      </div>
      <div className="space-y-3">
        <PulseBar className="h-2 bg-[var(--surface-light)] w-full" />
        <div className="flex justify-between">
          <PulseBar className="h-3 bg-[var(--surface-light)] w-12" />
          <PulseBar className="h-3 bg-[var(--surface-light)] w-12" />
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <PulseBar className="h-5 bg-[var(--surface-light)] w-40" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-light)]/20">
            <div className="w-5 h-5 rounded-full bg-[var(--surface-light)]" />
            <div className="flex-1 space-y-1.5">
              <PulseBar className="h-3.5 bg-[var(--surface-light)] w-3/4" />
              <PulseBar className="h-2.5 bg-[var(--surface-light)] w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. Hackathon Skeletons
// ═══════════════════════════════════════════════════════════════

export function HackathonBannerSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 mb-8 border border-[var(--border)] animate-pulse">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <PulseBar className="h-8 bg-[var(--surface-light)] w-48" />
          <PulseBar className="h-4 bg-[var(--surface-light)] w-64" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--surface-light)] rounded-xl border border-[var(--border)]" />
              <PulseBar className="h-3 bg-[var(--surface-light)] w-10 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuestionSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 border border-[var(--border)] animate-pulse space-y-6">
      <div className="space-y-2">
        <PulseBar className="h-6 bg-[var(--surface-light)] w-12" />
        <PulseBar className="h-5 bg-[var(--surface-light)] w-5/6" />
      </div>
      
      {/* Code Editor Box Mock */}
      <div className="h-48 bg-[#0a0a0f] border border-[var(--border)] rounded-xl p-4 space-y-2.5">
        <PulseBar className="h-3.5 bg-[var(--surface-light)]/30 w-1/3" />
        <PulseBar className="h-3.5 bg-[var(--surface-light)]/30 w-1/2" />
        <PulseBar className="h-3.5 bg-[var(--surface-light)]/30 w-1/4" />
        <PulseBar className="h-3.5 bg-[var(--surface-light)]/30 w-2/3" />
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 border border-[var(--border)] rounded-xl p-4 bg-[var(--surface-light)]/20" />
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-light)]/35 h-[74px]">
          <div className="w-10 flex-shrink-0 flex justify-center">
            <div className="h-6 w-6 bg-[var(--surface-light)] rounded" />
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--surface-light)] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <PulseBar className="h-4 bg-[var(--surface-light)] w-32" />
            <PulseBar className="h-3 bg-[var(--surface-light)] w-24" />
          </div>
          <div className="text-right flex-shrink-0 flex flex-col items-end space-y-2">
            <PulseBar className="h-4 bg-[var(--surface-light)] w-12" />
            <PulseBar className="h-3 bg-[var(--surface-light)] w-6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. Certificate Preview Skeleton
// ═══════════════════════════════════════════════════════════════

export function CertificatePreviewSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto border-4 border-double border-[var(--border)] rounded-2xl p-8 sm:p-16 bg-[var(--surface)] relative overflow-hidden animate-pulse min-h-[500px] flex flex-col justify-between text-center">
      {/* Intricate border line decorative */}
      <div className="absolute inset-4 border border-[var(--border)]/60 pointer-events-none" />
      
      <div className="space-y-6">
        <PulseBar className="h-8 bg-[var(--surface-light)] w-32 mx-auto rounded" />
        <PulseBar className="h-12 bg-[var(--surface-light)] w-72 mx-auto rounded-lg" />
      </div>

      <div className="space-y-4">
        <PulseBar className="h-4 bg-[var(--surface-light)] w-64 mx-auto" />
        <PulseBar className="h-8 bg-[var(--surface-light)] w-48 mx-auto rounded" />
        <PulseBar className="h-4 bg-[var(--surface-light)] w-96 mx-auto" />
      </div>

      <div className="flex justify-between items-end pt-10 px-8">
        <div className="space-y-2">
          <div className="w-32 h-0.5 bg-[var(--border)]" />
          <PulseBar className="h-3.5 bg-[var(--surface-light)] w-24 mx-auto" />
        </div>
        <div className="w-20 h-20 rounded-full border-2 border-[var(--border)] bg-[var(--surface-light)] flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-dashed border-[var(--border)]" />
        </div>
        <div className="space-y-2">
          <div className="w-32 h-0.5 bg-[var(--border)]" />
          <PulseBar className="h-3.5 bg-[var(--surface-light)] w-24 mx-auto" />
        </div>
      </div>
    </div>
  );
}
