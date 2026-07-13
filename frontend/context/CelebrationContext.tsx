"use client";

import { createContext, useContext, useState, useCallback } from "react";

const CelebrationContext = createContext();

export const CelebrationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [levelUpData, setLevelUpData] = useState(null);

  // Add a toast notification
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // Show level-up modal
  const showLevelUp = useCallback((data) => {
    setLevelUpData(data);
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUpData(null);
  }, []);

  // Process gamification response from API
  const processGamification = useCallback((gamification, xpBreakdown = []) => {
    if (!gamification) return;

    // Show XP breakdown toasts
    if (xpBreakdown && xpBreakdown.length > 0) {
      const totalXP = xpBreakdown.reduce((sum, item) => sum + item.amount, 0);
      if (totalXP > 0) {
        addToast({
          type: "xp",
          title: `+${totalXP} XP Earned!`,
          description: xpBreakdown.map((x) => `${x.label}: +${x.amount}`).join(" • "),
        });
      }
    }

    // Streak celebration
    if (gamification.streakBonus > 0) {
      addToast({
        type: "streak",
        title: `🔥 ${gamification.streak}-Day Streak!`,
        description: `Streak milestone bonus: +${gamification.streakBonus} XP`,
      });
    }

    // Badge unlocks (grouped)
    if (gamification.newBadges && gamification.newBadges.length > 0) {
      if (gamification.newBadges.length === 1) {
        const badge = gamification.newBadges[0];
        addToast({
          type: "badge",
          title: `${badge.icon} Badge Unlocked!`,
          description: `${badge.name} — ${badge.description}`,
          rarity: badge.rarity,
        });
      } else {
        addToast({
          type: "badge",
          title: `🏆 ${gamification.newBadges.length} Badges Unlocked!`,
          description: gamification.newBadges
            .map((b) => `${b.icon} ${b.name}`)
            .join(" • "),
          rarity: "epic",
        });
      }
    }

    // Level up celebration (show modal)
    if (gamification.leveledUp) {
      setTimeout(() => {
        showLevelUp({
          oldLevel: gamification.oldLevel,
          newLevel: gamification.newLevel,
          levelTitle: gamification.levelTitle,
          totalXP: gamification.totalXP,
        });
      }, 1500); // Delay so XP toast shows first
    }
  }, [addToast, showLevelUp]);

  return (
    <CelebrationContext.Provider
      value={{
        toasts,
        addToast,
        levelUpData,
        showLevelUp,
        dismissLevelUp,
        processGamification,
      }}
    >
      {children}
    </CelebrationContext.Provider>
  );
};

export const useCelebration = () => useContext(CelebrationContext);
