"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";
import LearnStackLogo from "./LearnStackLogo";

export default function GlobalLoader() {
  const { isLoading, transitioning } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050508]/85 backdrop-blur-xl"
          role="status"
          aria-live="polite"
          aria-label="Loading page content"
        >
          {/* Subtle glowing halo behind the logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.2 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-[var(--primary)]/20 to-[var(--accent)]/20 blur-3xl pointer-events-none"
          />

          <div className="relative flex items-center justify-center">
            {/* Infinite rotating dash-ring around the logo */}
            <svg className="w-24 h-24 absolute" viewBox="0 0 100 100">
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                stroke="url(#loaderRingGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="70 200"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "linear",
                }}
                style={{ transformOrigin: "50px 50px" }}
              />
              <defs>
                <linearGradient id="loaderRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary, #6c5ce7)" />
                  <stop offset="100%" stopColor="var(--accent, #00cec9)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Pulsing logo core */}
            <motion.div
              animate={{
                scale: [0.95, 1.05, 0.95],
                filter: [
                  "drop-shadow(0 0 8px rgba(108, 92, 231, 0.2))",
                  "drop-shadow(0 0 20px rgba(0, 206, 201, 0.5))",
                  "drop-shadow(0 0 8px rgba(108, 92, 231, 0.2))",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="z-10"
            >
              <LearnStackLogo size={52} variant="default" />
            </motion.div>
          </div>

          {/* Premium micro-loading label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-col items-center gap-1.5 z-10"
          >
            <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-[var(--accent-light, #81ecec)]">
              LearnStack
            </span>
            <div className="h-0.5 w-12 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                style={{ width: "60%" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
