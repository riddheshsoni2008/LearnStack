"use client";
import { useState } from "react";

export default function QuestionDisplay({ question, index, total, answer, onAnswer }) {
  const [codeValue, setCodeValue] = useState(answer?.answer || question.codeTemplate || "");

  const handleMCQSelect = (optionIndex) => {
    onAnswer({
      questionId: question._id,
      selectedOptionIndex: optionIndex,
      answer: question.options[optionIndex]?.text || "",
    });
  };

  const handleTextAnswer = (value) => {
    setCodeValue(value);
    onAnswer({
      questionId: question._id,
      answer: value,
      selectedOptionIndex: -1,
    });
  };

  const TYPE_CONFIG = {
    mcq: { label: "Multiple Choice", bg: "bg-blue-500/20", text: "text-blue-400", icon: "🔘" },
    coding: { label: "Coding", bg: "bg-emerald-500/20", text: "text-emerald-400", icon: "💻" },
    case_study: { label: "Case Study", bg: "bg-purple-500/20", text: "text-purple-400", icon: "📖" },
    scenario: { label: "Scenario", bg: "bg-orange-500/20", text: "text-orange-400", icon: "🎯" },
    project: { label: "Project", bg: "bg-pink-500/20", text: "text-pink-400", icon: "🚀" },
  };

  const typeConfig = TYPE_CONFIG[question.questionType] || TYPE_CONFIG.mcq;

  const DIFF_COLORS = {
    easy: "text-green-400 bg-green-500/10 border-green-500/30",
    intermediate: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    advanced: "text-red-400 bg-red-500/10 border-red-500/30"
  };

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 transition-all border border-[var(--border)]">
      {/* Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center text-sm font-black text-[var(--primary-light)]">
            {index + 1}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${typeConfig.bg} ${typeConfig.text}`}>
              {typeConfig.icon} {typeConfig.label}
            </span>
            {question.difficulty && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${DIFF_COLORS[question.difficulty] || DIFF_COLORS.easy}`}>
                {question.difficulty}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">
            {index + 1}/{total || "?"}
          </span>
          <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full">
            +{question.points} pts
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="text-base sm:text-lg font-medium text-[var(--foreground)] mb-8 leading-relaxed whitespace-pre-wrap">
        {question.questionText}
      </div>

      {/* ═══ MCQ ═══ */}
      {question.questionType === "mcq" && (
        <div className="space-y-3">
          {question.options?.map((option, idx) => {
            const isSelected = answer?.selectedOptionIndex === idx;
            const letters = ["A", "B", "C", "D", "E", "F"];
            return (
              <button
                key={idx}
                onClick={() => handleMCQSelect(idx)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm font-medium group ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary-light)] shadow-[0_0_15px_rgba(108,92,231,0.2)]"
                    : "border-[var(--border)] bg-[var(--surface-light)] text-[var(--foreground)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    isSelected
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] group-hover:border-[var(--primary)]/40"
                  }`}>
                    {letters[idx] || idx + 1}
                  </div>
                  <span>{option.text}</span>
                </div>
              </button>
            );
          })}
          {(!question.options || question.options.length === 0) && (
            <div className="text-center text-[var(--text-muted)] py-6 text-sm">
              ⚠️ No options configured for this question.
            </div>
          )}
        </div>
      )}

      {/* ═══ Coding ═══ */}
      {question.questionType === "coding" && (
        <div className="space-y-4">
          {/* Sample test cases (if visible) */}
          {question.testCases && question.testCases.filter(t => !t.isHidden).length > 0 && (
            <div className="glass rounded-xl p-4 border border-[var(--border)]">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Sample Test Cases</h4>
              <div className="space-y-3">
                {question.testCases.filter(t => !t.isHidden).map((tc, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block mb-1">Input</span>
                      <pre className="bg-[var(--surface)] rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto">{tc.input}</pre>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold block mb-1">Expected Output</span>
                      <pre className="bg-[var(--surface)] rounded-lg p-3 text-xs font-mono text-blue-400 overflow-x-auto">{tc.expectedOutput}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              💻 Your Code
            </label>
            <textarea
              value={codeValue}
              onChange={(e) => handleTextAnswer(e.target.value)}
              className="w-full h-64 sm:h-80 p-4 rounded-xl bg-[#1a1a2e] border border-[var(--border)] text-emerald-400 font-mono text-sm resize-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 outline-none transition-all leading-relaxed"
              placeholder="// Write your solution here..."
              spellCheck="false"
            />
          </div>
        </div>
      )}

      {/* ═══ Case Study ═══ */}
      {question.questionType === "case_study" && (
        <div>
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
            📖 Your Analysis
          </label>
          <textarea
            value={codeValue}
            onChange={(e) => handleTextAnswer(e.target.value)}
            className="w-full h-48 sm:h-64 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] text-sm resize-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 outline-none transition-all leading-relaxed"
            placeholder="Analyze the case study and write your detailed response here..."
            spellCheck="true"
          />
          <div className="text-xs text-[var(--text-muted)] mt-2 text-right">
            {codeValue.length} characters
          </div>
        </div>
      )}

      {/* ═══ Scenario ═══ */}
      {question.questionType === "scenario" && (
        <div>
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
            🎯 Your Response
          </label>
          <textarea
            value={codeValue}
            onChange={(e) => handleTextAnswer(e.target.value)}
            className="w-full h-48 sm:h-64 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] text-sm resize-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 outline-none transition-all leading-relaxed"
            placeholder="Describe your approach to this scenario in detail..."
            spellCheck="true"
          />
          <div className="text-xs text-[var(--text-muted)] mt-2 text-right">
            {codeValue.length} characters
          </div>
        </div>
      )}

      {/* ═══ Project ═══ */}
      {question.questionType === "project" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
              🔗 Project Repository URL *
            </label>
            <input
              type="url"
              value={answer?.answer || ""}
              onChange={(e) => handleTextAnswer(e.target.value)}
              className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none transition-colors"
              placeholder="https://github.com/your-project"
            />
          </div>
          <div className="glass rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
            <h4 className="text-xs font-bold text-blue-400 mb-2">📌 Submission Guidelines</h4>
            <ul className="text-xs text-[var(--text-muted)] space-y-1">
              <li>• Include a clear README with setup instructions</li>
              <li>• Ensure the project is accessible (public repo or shared link)</li>
              <li>• Include relevant screenshots or a demo video</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
