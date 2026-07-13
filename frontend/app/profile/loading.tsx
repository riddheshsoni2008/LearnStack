"use client";
import React from "react";
import AuthNavbar from "@/components/AuthNavbar";
import { AvatarSkeleton, UserInfoSkeleton, CertificatesSkeleton } from "@/components/loaders/Skeletons";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <AuthNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 animate-pulse space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
          <AvatarSkeleton />
          <UserInfoSkeleton />
        </div>
        <div className="glass border border-[var(--border)] rounded-2xl p-6 h-36">
          <div className="h-4 bg-[var(--surface-light)] w-28 rounded mb-2" />
          <div className="h-3 bg-[var(--surface-light)] w-40 rounded mb-4" />
          <div className="w-full h-3 bg-[var(--surface-light)] rounded-full" />
        </div>
        <CertificatesSkeleton />
      </div>
    </div>
  );
}
