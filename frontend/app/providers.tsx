"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CelebrationProvider } from "@/context/CelebrationContext";
import { LoadingProvider } from "@/context/LoadingContext";
import CelebrationToast from "@/components/CelebrationToast";
import LevelUpModal from "@/components/LevelUpModal";

export function Providers({ children }) {
  return (
    <LoadingProvider>
      <AuthProvider>
        <CelebrationProvider>
          {children}
          <CelebrationToast />
          <LevelUpModal />
        </CelebrationProvider>
      </AuthProvider>
    </LoadingProvider>
  );
}
