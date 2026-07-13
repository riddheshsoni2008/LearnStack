"use client";
import { useState } from "react";

export default function CodeEditor({ challenge, language }) {
  const [code, setCode] = useState(challenge?.starterCode || "");
  const [output, setOutput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'

  // Only pure JS can be safely executed in the browser
  const isRunnable = language === "js" || language === "javascript";

  // Strip non-structural punctuation but keep HTML/code structure chars like < > / = { }
  const normalize = (str) =>
    str
      .replace(/[!?,;:'"()]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();

  const checkKeywords = (userCode, expected) => {
    if (!expected) return true;
    const keywords = expected
      .split("\n")
      .map((line) => normalize(line))
      .filter((l) => l.length > 2);
    if (keywords.length === 0) return true;
    const cleaned = normalize(userCode);
    const matched = keywords.filter((kw) => cleaned.includes(kw)).length;
    return matched === keywords.length;
  };

  const handleRun = () => {
    if (isRunnable) {
      // Pure JS — safe to execute with sandboxed console
      try {
        let logs = [];
        const fakeConsole = {
          log: (...args) =>
            logs.push(
              args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")
            ),
          error: (...args) => logs.push("Error: " + args.join(" ")),
        };
        const fn = new Function("console", code);
        fn(fakeConsole);
        const result = logs.join("\n");
        setOutput(result || "(No output — add console.log() to see results)");

        if (challenge?.expectedOutput && normalize(result) === normalize(challenge.expectedOutput)) {
          setStatus("success");
        } else if (result) {
          setStatus(null);
        }
      } catch (err) {
        setOutput("❌ " + err.message);
        setStatus("error");
      }
    } else {
      // Non-executable: React, Node, HTML, CSS, MongoDB, Next.js, fullstack
      // Never try to run — just do smart keyword matching
      if (checkKeywords(code, challenge?.expectedOutput)) {
        setOutput(" Your solution looks correct! Great job.");
        setStatus("success");
      } else {
        setOutput("💡 Not quite there yet — check the hint for guidance!");
        setStatus(null);
      }
    }
  };

  const handleReset = () => {
    setCode(challenge?.starterCode || "");
    setOutput("");
    setStatus(null);
    setShowHint(false);
  };

  if (!challenge || !challenge.title) return null;

  return (
    <div className="glass border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[var(--surface-light)] border-b border-[var(--border)] px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧩</span>
          <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">
            Coding Challenge
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary-light)] font-semibold border border-[var(--primary)]/20">
            {language || "js"}
          </span>
          {status === "success" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              ✓ Passed
            </span>
          )}
        </div>
      </div>

      {/* Challenge Description */}
      <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-light)]/50">
        <h4 className="font-bold text-sm text-[var(--foreground)] mb-1">{challenge.title}</h4>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{challenge.description}</p>
      </div>

      {/* Code Editor Area */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => { setCode(e.target.value); if (status !== "success") setStatus(null); }}
          className="w-full min-h-[180px] sm:min-h-[200px] p-4 sm:p-6 bg-[#0a0a12] text-[var(--accent-light)] font-mono text-sm leading-relaxed resize-y border-none outline-none placeholder:text-[var(--text-muted)]/40"
          spellCheck="false"
          placeholder="Write your code here..."
          style={{ tabSize: 2 }}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const start = e.target.selectionStart;
              const end = e.target.selectionEnd;
              setCode(code.substring(0, start) + "  " + code.substring(end));
              setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; }, 0);
            }
          }}
        />
      </div>

      {/* Output Panel */}
      {output && (
        <div className={`border-t px-4 sm:px-6 py-3 font-mono text-xs whitespace-pre-wrap ${status === "success"
            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
            : status === "error"
              ? "border-red-500/30 bg-red-500/5 text-red-400"
              : "border-[var(--border)] bg-[var(--surface-light)] text-[var(--text-muted)]"
          }`}>
          <div className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-60">
            {status === "success" ? "✅ Output (Correct!)" : status === "error" ? "Output (Keep trying!)" : "Output"}
          </div>
          {output}
        </div>
      )}

      {/* Hint Panel */}
      {showHint && challenge.hint && (
        <div className="border-t border-amber-500/20 bg-amber-500/5 px-4 sm:px-6 py-3 text-xs text-amber-400">
          <span className="font-bold">💡 Hint:</span> {challenge.hint}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-light)]/30">
        <button
          onClick={handleRun}
          className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
        >
          ▶ Run Code
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-[var(--surface-light)] text-[var(--text-muted)] border border-[var(--border)] text-xs font-bold hover:text-white transition-colors"
        >
          ↺ Reset
        </button>
        {challenge.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-colors"
          >
            💡 {showHint ? "Hide Hint" : "Show Hint"}
          </button>
        )}
      </div>
    </div>
  );
}
