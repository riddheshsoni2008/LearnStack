"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProgressBar from "@/components/ProgressBar";
import LessonList from "@/components/LessonList";
import AuthNavbar from "@/components/AuthNavbar";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const { user, loading: authLoading } = useAuth();
  
  const [track, setTrack] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch track by slug
        const res = await fetch(`/api/tracks/slug/${slug}`, {
          cache: "no-store",
          credentials: "include"
        });

        if (!res.ok) {
          setError("Failed to load course.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        
        if (data.success) {
          setTrack(data.data.track);
          setLessons(data.data.lessons);
          
          // Fetch user progress
          const progRes = await fetch("/api/progress/me", {
            cache: "no-store",
            credentials: "include"
          });
          if (progRes.ok) {
            const progData = await progRes.json();
            if (progData.success) {
              setProgress(progData.data);
            }
          }
        } else {
          setError(data.message || "Failed to load course.");
        }
      } catch (err) {
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, user, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--text-muted)] text-lg animate-pulse">Loading course data...</div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
        <div className="glass border border-red-500/30 rounded-2xl p-8 text-center max-w-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">Oops!</h2>
          <p className="text-[var(--text-muted)] mb-6">{error || "Course not found"}</p>
          <Link href="/tracks" className="btn-primary">Back to Tracks</Link>
        </div>
      </div>
    );
  }

  // Map progress into a Set of completed lesson IDs
  const completedLessonIds = new Set(
    progress
      .filter((p) => p.completed && (p.trackId === track._id || p.trackId?._id === track._id))
      .map((p) => p.lessonId?._id || p.lessonId)
  );

  // Group lessons by week number
  const lessonsByWeek = {};
  lessons.forEach((lesson) => {
    const w = lesson.weekNumber || 1;
    if (!lessonsByWeek[w]) {
      lessonsByWeek[w] = [];
    }
    lessonsByWeek[w].push(lesson);
  });

  const totalLessonsCount = lessons.length;
  const completedCount = lessons.filter(l => completedLessonIds.has(l._id)).length;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AuthNavbar />

      {/* Track Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
        <Link href="/tracks" className="text-sm text-[var(--primary-light)] hover:text-[var(--primary)] transition-colors mb-4 sm:mb-6 inline-block">
          ← Back to Tracks
        </Link>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3">{track.title}</h1>
        <p className="text-[var(--text-muted)] mb-8 leading-relaxed">{track.description}</p>

        <ProgressBar 
          progressPercent={progressPercent} 
          completedCount={completedCount} 
          totalCount={totalLessonsCount} 
        />

        <LessonList 
          lessonsByWeek={lessonsByWeek} 
          completedLessonIds={completedLessonIds} 
        />
      </div>
    </div>
  );
}
