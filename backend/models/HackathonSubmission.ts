import mongoose, { Document, Schema } from "mongoose";

export interface IHackathonSubmission extends Document {
  hackathonId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  roundNumber: 1 | 2 | 3;
  answers: {
    questionId: mongoose.Types.ObjectId;
    answer: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    pointsAwarded: number;
    timeTaken: number;
  }[];
  assignedQuestionIds: mongoose.Types.ObjectId[];
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  totalTimeTaken: number;
  startedAt?: Date;
  submittedAt?: Date;
  autoSubmitted: boolean;
  stats: {
    answered: number;
    correct: number;
    wrong: number;
    unanswered: number;
  };
  projectFiles: { path: string; content: string }[];
  lastSavedAt?: Date;
  evalReport: string;
  evalScoreBreakdown: {
    authentication: number;
    attendance: number;
    leaveSystem: number;
    reports: number;
    codeQuality: number;
    uiUx: number;
  };
  evalScores: {
    functionality: number;
    codeQuality: number;
    uiUx: number;
    databaseDesign: number;
    scalability: number;
    innovation: number;
  };
  judgeScores: {
    judgeId: mongoose.Types.ObjectId;
    score: number;
    feedback: string;
    evaluatedAt: Date;
  }[];
  status:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "AUTO_SUBMITTED"
    | "COMPLETED"
    | "QUALIFIED"
    | "DISQUALIFIED"
    | "evaluated"
    | "submitted";
}

// ═══════════════════════════════════════════════════════════════
// Hackathon Submission Schema — Per-Round Submissions
// ═══════════════════════════════════════════════════════════════

const AnswerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "HackathonQuestion",
      required: true,
    },
    answer: { type: String, default: "" },
    selectedOptionIndex: { type: Number, default: -1 }, // for MCQ
    isCorrect: { type: Boolean, default: false },
    pointsAwarded: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // seconds per question
  },
  { _id: false },
);

const HackathonSubmissionSchema = new Schema<IHackathonSubmission>(
  {
    hackathonId: {
      type: Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roundNumber: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },

    // ── Answers ──
    answers: [AnswerSchema],
    assignedQuestionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "HackathonQuestion",
      },
    ],

    // ── Scoring ──
    totalScore: { type: Number, default: 0 },
    maxPossibleScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    totalTimeTaken: { type: Number, default: 0 }, // seconds

    // ── Submission Info ──
    startedAt: { type: Date },
    submittedAt: { type: Date },
    autoSubmitted: { type: Boolean, default: false },

    // ── Detailed Stats ──
    stats: {
      answered: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 },
      unanswered: { type: Number, default: 0 },
    },

    // ── Workspace Code Submission (Round 2 & 3) ──
    projectFiles: [
      {
        path: { type: String, required: true },
        content: { type: String, default: "" },
      },
    ],
    lastSavedAt: { type: Date },

    // ── Automated Evaluation Report ──
    evalReport: { type: String, default: "" },
    evalScoreBreakdown: {
      authentication: { type: Number, default: 0 },
      attendance: { type: Number, default: 0 },
      leaveSystem: { type: Number, default: 0 },
      reports: { type: Number, default: 0 },
      codeQuality: { type: Number, default: 0 },
      uiUx: { type: Number, default: 0 },
    },

    // ── Automated Evaluation Scores (Round 2) ──
    evalScores: {
      functionality: { type: Number, default: 0 },
      codeQuality: { type: Number, default: 0 },
      uiUx: { type: Number, default: 0 },
      databaseDesign: { type: Number, default: 0 },
      scalability: { type: Number, default: 0 },
      innovation: { type: Number, default: 0 },
    },

    // ── Judge Evaluation (Round 3) ──
    judgeScores: [
      {
        judgeId: { type: Schema.Types.ObjectId, ref: "User" },
        score: { type: Number, default: 0 },
        feedback: { type: String, default: "" },
        evaluatedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Status ──
    status: {
      type: String,
      enum: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "AUTO_SUBMITTED",
        "COMPLETED",
        "QUALIFIED",
        "DISQUALIFIED",
        "evaluated",
        "submitted",
      ],
      default: "NOT_STARTED",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// ── One submission per user per hackathon per round ──
HackathonSubmissionSchema.index(
  { hackathonId: 1, userId: 1, roundNumber: 1 },
  { unique: true },
);

export default mongoose.model<IHackathonSubmission>(
  "HackathonSubmission",
  HackathonSubmissionSchema,
);
