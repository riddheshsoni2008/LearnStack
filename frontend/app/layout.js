import { Inter, Great_Vibes } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata = {
  title: "LearnStack — Learn the Full Stack, Step by Step",
  description:
    "A free, gamified coding learning platform. Master web development with structured roadmaps, quizzes, streaks, badges, and certificates.",
  keywords: "learn coding, web development, full stack, javascript, react, nextjs, free courses",
};

import HackathonBanner from "@/components/HackathonBanner";
import GlobalLoader from "@/components/loaders/GlobalLoader";

export default function RootLayout({ children }) {
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
