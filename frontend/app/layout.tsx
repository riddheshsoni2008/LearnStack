import React from "react";
import "./globals.css";
import { Providers } from "./providers";

// Mocking fonts to support offline build in sandbox environment
const inter = { variable: "font-sans" };
const greatVibes = { variable: "font-serif" };

export const metadata = {
  title: "LearnStack — Learn the Full Stack, Step by Step",
  description:
    "A free, gamified coding learning platform. Master web development with structured roadmaps, quizzes, streaks, badges, and certificates.",
  keywords: "learn coding, web development, full stack, javascript, react, nextjs, free courses",
};

import HackathonBanner from "@/components/HackathonBanner";
import GlobalLoader from "@/components/loaders/GlobalLoader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${greatVibes.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
        <Providers>
          <GlobalLoader />
          <HackathonBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
