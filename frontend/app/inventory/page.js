"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCelebration } from "@/context/CelebrationContext";
import AuthNavbar from "@/components/AuthNavbar";
import { motion } from "framer-motion";

const ICONS = {
  theme: "🎨",
  border: "✨",
  title: "👑",
};

export default function InventoryPage() {
  const { user, fetchUser } = useAuth();
  const { addToast } = useCelebration();
  const [loading, setLoading] = useState(false);
  const [equipping, setEquipping] = useState(null);

  // Create unified inventory list based on user context
  const getInventoryItems = () => {
    if (!user) return [];

    const items = [];

    // Themes
    if (user.ownedThemes) {
      user.ownedThemes.forEach(id => {
        if (id !== 'default') {
          items.push({ id, name: id.replace('theme_', '').toUpperCase() + ' Theme', type: 'theme', active: user.activeTheme === id });
        }
      });
    }
    // Default Theme
    items.push({ id: 'default', name: 'Default Theme', type: 'theme', active: user.activeTheme === 'default' });

    // Borders
    if (user.ownedBorders) {
      user.ownedBorders.forEach(id => {
        if (id !== 'none') {
          items.push({ id, name: id.replace('border_', '').toUpperCase() + ' Border', type: 'border', active: user.activeBorder === id });
        }
      });
    }
    // Default Border
    items.push({ id: 'none', name: 'No Border', type: 'border', active: user.activeBorder === 'none' });

    // Titles
    if (user.ownedTitles) {
      user.ownedTitles.forEach(id => {
        if (id !== 'Newbie') {
          items.push({ id, name: id.replace('title_', '').toUpperCase() + ' Title', type: 'title', active: user.activeTitle === id });
        }
      });
    }
    // Default Title
    items.push({ id: 'Newbie', name: 'Newbie Title', type: 'title', active: user.activeTitle === 'Newbie' });

    return items;
  };

  const inventoryItems = getInventoryItems();

  const handleEquip = async (item) => {
    setEquipping(item.id);
    try {
      const res = await fetch("/api/store/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, type: item.type }),
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        addToast({
          type: "success",
          title: "Equipped!",
          description: `You equipped the ${item.name}`,
        });
        fetchUser(); // Refresh user state
      } else {
        addToast({
          type: "error",
          title: "Failed",
          description: data.message,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEquipping(null);
    }
  };

  const renderSection = (title, type) => {
    const items = inventoryItems.filter(i => i.type === type);

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          {ICONS[type]} {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -5 }}
              className={`glass rounded-xl p-5 border relative overflow-hidden transition-all flex flex-col ${item.active
                ? "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20 bg-[var(--accent)]/10"
                : "border-[var(--border)]"
                }`}
            >
              {item.active && (
                <div className="absolute top-0 right-0 bg-[var(--accent)] text-[var(--accent-light)] text-[10px] font-bold uppercase px-2 py-1 rounded-bl-lg">
                  Equipped
                </div>
              )}

              <div className="text-3xl mb-3">{ICONS[item.type]}</div>
              <h3 className="font-bold text-lg mb-4 flex-grow">{item.name}</h3>

              <button
                onClick={() => handleEquip(item)}
                disabled={item.active || equipping === item.id}
                className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${equipping === item.id
                  ? "bg-[var(--surface-light)] text-[var(--text-muted)] flex justify-center"
                  : item.active
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface-light)] hover:bg-[var(--text-muted)] text-white"
                  }`}
              >
                {equipping === item.id ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : item.active ? (
                  "Active"
                ) : (
                  "Equip"
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Your <span className="gradient-text">Inventory</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg">
            Equip your purchased themes, borders, and titles to customize your profile.
          </p>
        </div>

        {renderSection("Profile Themes", "theme")}
        {renderSection("Avatar Borders", "border")}
        {renderSection("Titles", "title")}

      </main>
    </div>
  );
}
