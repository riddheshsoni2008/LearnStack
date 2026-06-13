"use client";
import React from "react";
import { HeroSkeleton, FeaturedCoursesSkeleton, CategoriesSkeleton } from "@/components/loaders/Skeletons";

export default function RootLoading() {
  return (
    <div className="flex-1 min-h-screen bg-[var(--background)] pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-6">
        <HeroSkeleton />
        <div className="border-t border-[var(--border)] my-16 opacity-30" />
        <div className="text-center mb-10">
          <div className="h-4 bg-[var(--surface-light)] w-24 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-8 bg-[var(--surface-light)] w-80 rounded mx-auto animate-pulse" />
        </div>
        <CategoriesSkeleton />
        <FeaturedCoursesSkeleton />
      </div>
    </div>
  );
}
