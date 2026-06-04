"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CelebrationProvider } from "@/context/CelebrationContext";
import CelebrationToast from "@/components/CelebrationToast";
import LevelUpModal from "@/components/LevelUpModal";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CelebrationProvider>
        {children}
        <CelebrationToast />
        <LevelUpModal />
      </CelebrationProvider>
    </AuthProvider>
  );
}
