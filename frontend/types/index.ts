export interface Track {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  level: string;
  totalWeeks: number | string;
  totalLessons: number | string;
  slug: string;
  tags?: string[];
  lessons?: any[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  arcadeProgress?: Array<{
    levelId: string;
    completedAt: string;
    score: number;
  }>;
  streak?: number;
  xp?: number;
}

export interface Hackathon {
  _id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "completed";
  slug: string;
  bannerUrl?: string;
  prizes?: Array<{
    place: number;
    amount: number;
    title: string;
  }>;
  rounds?: any[];
}

export interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points?: number;
}

export interface Submission {
  _id: string;
  hackathonId: string;
  userId: string;
  roundNumber: number;
  status: "IN_PROGRESS" | "submitted" | "evaluated" | "disqualified";
  startedAt?: string;
  submittedAt?: string;
  score?: number;
  answers?: any[];
}
