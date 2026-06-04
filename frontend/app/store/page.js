"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCelebration } from "@/context/CelebrationContext";
import AuthNavbar from "@/components/AuthNavbar";
import MysteryBox from "./MysteryBox";
import confetti from "canvas-confetti";

export default function StorePage() {
  const { user, fetchUser } = useAuth();
  const { addToast } = useCelebration();
  const [items, setItems] = useState([]);
  const [mysteryBoxCost, setMysteryBoxCost] = useState(5);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    try {
      const res = await fetch("/api/store", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
        setMysteryBoxCost(data.data.mysteryBoxCost);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    setPurchasing(item.id);
    try {
      const res = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ffd700", "#ff8c00", "#ffffff"],
        });
        addToast({
          type: "success",
          title: "Purchase Successful!",
          description: `You bought ${item.name}`,
        });
        fetchUser(); // Refresh user balance and inventory
      } else {
        addToast({
          type: "error",
          title: "Purchase Failed",
          description: data.message,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPurchasing(null);
    }
  };

  const isOwned = (item) => {
    if (!user) return false;
    if (item.type === "theme") return user.ownedThemes?.includes(item.id);
    if (item.type === "border") return user.ownedBorders?.includes(item.id);
    if (item.type === "title") return user.ownedTitles?.includes(item.id);
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              XP <span className="gradient-text">Store</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg">
              Spend your hard-earned XP on profile customizations and mystery rewards.
            </p>
          </div>
          <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4 border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
            <div className="text-3xl">💎</div>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)]">Your Balance</p>
              <p className="text-2xl font-bold text-yellow-400">{user?.xpBalance || 0} XP</p>
            </div>
          </div>
        </div>

        {/* Mystery Box Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🎁 Premium Rewards
          </h2>
          <div className="glass rounded-3xl border border-[var(--border)] p-8 md:p-12 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[var(--accent)]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <h3 className="text-3xl font-bold text-white">Mystery Box</h3>
                <p className="text-[var(--text-muted)] text-lg leading-relaxed max-w-md">
                  Take a chance! Open a mystery box to win exclusive badges, rare titles, premium themes, or bonus XP multipliers.
                </p>
                <div className="flex gap-4">
                  <div className="bg-[var(--surface-light)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)]">
                    🟢 Common 70%
                  </div>
                  <div className="bg-[var(--surface-light)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-blue-400">
                    🔵 Rare 25%
                  </div>
                  <div className="bg-[var(--surface-light)] px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-purple-400">
                    🟣 Epic 5%
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto flex justify-center">
                <MysteryBox cost={mysteryBoxCost} userBalance={user?.xpBalance} onReward={fetchUser} />
              </div>
            </div>
          </div>
        </section>

        {/* Cosmetics Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🎨 Cosmetics
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass h-48 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const owned = isOwned(item);
                const canAfford = user?.xpBalance >= item.cost;
                
                return (
                  <motion.div
                    key={item.id}
                    whileHover={!owned ? { y: -5, scale: 1.02 } : {}}
                    className={`glass rounded-2xl border p-6 flex flex-col relative overflow-hidden transition-colors ${
                      owned ? "border-[var(--accent)]/50 bg-[var(--accent)]/5" : "border-[var(--border)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-4xl bg-[var(--surface-light)] w-14 h-14 rounded-xl flex items-center justify-center border border-[var(--border)] shadow-inner">
                        {item.icon}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 ${owned ? "bg-[var(--accent)]/20 text-[var(--accent-light)]" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                        {owned ? "Owned" : `💎 ${item.cost}`}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-[var(--text-muted)] text-sm mb-6 flex-grow">
                      {item.description}
                    </p>
                    
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={owned || !canAfford || purchasing === item.id}
                      className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        owned
                          ? "bg-[var(--surface-light)] text-[var(--text-muted)] cursor-not-allowed"
                          : canAfford
                          ? "bg-white text-black hover:bg-gray-200 active:scale-95 shadow-lg"
                          : "bg-[var(--surface-light)] text-red-400 cursor-not-allowed opacity-70 border border-red-500/20"
                      }`}
                    >
                      {purchasing === item.id ? (
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : owned ? (
                        "Already Owned"
                      ) : canAfford ? (
                        "Purchase"
                      ) : (
                        "Not Enough XP"
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
