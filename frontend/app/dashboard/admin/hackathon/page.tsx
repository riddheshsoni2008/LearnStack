"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import Editor from "@monaco-editor/react";

// ═══════════════════════════════════════════════════════════════
// Hackathon Admin Panel — /dashboard/admin/hackathon
// ═══════════════════════════════════════════════════════════════

const TABS = ["hackathons", "questions", "participants"];

export default function HackathonAdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("hackathons");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AuthNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">
            🛡️ <span className="gradient-text">Hackathon Admin</span>
          </h1>
          <p className="text-[var(--text-muted)]">Manage hackathons, questions, and participants</p>
        </div>

        {/* ═══ Tabs ═══ */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[var(--primary)] text-white shadow-[0_0_15px_rgba(108,92,231,0.3)]"
                  : "bg-[var(--surface-light)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)]/40"
              }`}
            >
              {tab === "hackathons" ? "🏆 Hackathons" : tab === "questions" ? "📝 Question Bank" : "👥 Participants"}
            </button>
          ))}
        </div>

        {/* ═══ Tab Content ═══ */}
        {activeTab === "hackathons" && <HackathonsTab />}
        {activeTab === "questions" && <QuestionsTab />}
        {activeTab === "participants" && <ParticipantsTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Hackathons Tab
// ═══════════════════════════════════════════════════════════════
function HackathonsTab() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(getDefaultHackathonForm());
  

  const fetchHackathons = useCallback(async () => {
    try {
      const res = await fetch("/api/hackathons/admin/all", { credentials: "include" });
      const data = await res.json();
      if (data.success) setHackathons(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHackathons(); }, [fetchHackathons]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/hackathons/${editing}` : "/api/hackathons";
      const method = editing ? "PUT" : "POST";

      const body = {
        ...form,
        rules: form.rules.split("\n").filter((r: any) => r.trim()),
        faqs: form.faqs,
        rounds: form.rounds,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditing(null);
        setForm(getDefaultHackathonForm());
        fetchHackathons();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error saving hackathon");
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this hackathon?")) return;
    try {
      await fetch(`/api/hackathons/${id}`, { method: "DELETE", credentials: "include" });
      fetchHackathons();
    } catch (err) {
      alert("Error deleting");
    }
  };

  const handleEdit = (h: any) => {
    setEditing(h._id);
    setForm({
      title: h.title || "",
      description: h.description || "",
      shortDescription: h.shortDescription || "",
      status: h.status || "draft",
      startDate: h.startDate?.slice(0, 16) || "",
      endDate: h.endDate?.slice(0, 16) || "",
      registrationType: h.registrationType || "free",
      entryFee: h.entryFee || 0,
      participantLimitMode: h.participantLimitMode || "unlimited",
      maxParticipants: h.maxParticipants || 0,
      questionBankMode: h.questionBankMode || "global",
      hackathonMode: h.hackathonMode || "solo",
      prizeFirst: h.prizePool?.first || "",
      prizeSecond: h.prizePool?.second || "",
      prizeThird: h.prizePool?.third || "",
      prizeTotalValue: h.prizePool?.totalValue || "",
      rules: (h.rules || []).join("\n"),
      faqs: h.faqs || [],
      rounds: h.rounds || [],
    });
    setShowForm(true);
  };

  if (loading) return <div className="text-center text-[var(--text-muted)] animate-pulse py-10">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">All Hackathons ({hackathons.length})</h2>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(getDefaultHackathonForm()); }}
          className="btn-primary !py-2.5 !px-5 !text-sm"
        >
          + Create Hackathon
        </button>
      </div>

      {/* Hackathon List */}
      <div className="space-y-3">
        {hackathons.map((h: any) => (
          <div key={h._id} className="glass rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold">{h.title}</h3>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    h.status === "active" ? "bg-blue-500/20 text-blue-400" :
                    h.status === "registration_open" ? "bg-emerald-500/20 text-emerald-400" :
                    h.status === "completed" ? "bg-purple-500/20 text-purple-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {h.status?.replace("_", " ")}
                  </span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {h.currentParticipants || 0} participants • {h.rounds?.length || 0} rounds • {h.questionBankMode} questions
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(h)} className="text-xs font-bold text-[var(--primary-light)] hover:underline">Edit</button>
                <button onClick={() => handleDelete(h._id)} className="text-xs font-bold text-red-400 hover:underline">Delete</button>
              </div>
            </div>

            {/* Round Question Summary */}
            {h.rounds?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
                {h.rounds.map((r: any) => (
                  <span key={r.roundNumber} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    (r.questionIds?.length || 0) > 0
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}>
                    R{r.roundNumber}: {r.questionIds?.length || 0} Qs
                  </span>
                ))}
                <RoundQuestionManager hackathonId={h._id} rounds={h.rounds} onUpdated={fetchHackathons} />
                <AIGenerateButton hackathonId={h._id} onDone={fetchHackathons} />
              </div>
            )}
          </div>
        ))}
        {hackathons.length === 0 && (
          <div className="text-center text-[var(--text-muted)] py-10">No hackathons yet. Create one!</div>
        )}
      </div>

      {/* ═══ Create/Edit Form Modal ═══ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 sm:p-8 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-6">
              {editing ? "✏️ Edit Hackathon" : "🏆 Create Hackathon"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
              <Field label="Short Description" value={form.shortDescription} onChange={(v) => setForm({ ...form, shortDescription: v })} />
              <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />

              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })}
                  options={["draft", "registration_open", "active", "completed", "archived"]} />
                <SelectField label="Registration Type" value={form.registrationType} onChange={(v) => setForm({ ...form, registrationType: v })}
                  options={["free", "paid"]} />
              </div>

              {form.registrationType === "paid" && (
                <Field label="Entry Fee (₹)" value={form.entryFee} onChange={(v) => setForm({ ...form, entryFee: Number(v) })} type="number" />
              )}

              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Participant Limit" value={form.participantLimitMode} onChange={(v) => setForm({ ...form, participantLimitMode: v })}
                  options={["unlimited", "custom"]} />
                {form.participantLimitMode === "custom" && (
                  <Field label="Max Participants" value={form.maxParticipants} onChange={(v) => setForm({ ...form, maxParticipants: Number(v) })} type="number" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Question Bank" value={form.questionBankMode} onChange={(v) => setForm({ ...form, questionBankMode: v })}
                  options={["global", "private"]} />
                <SelectField label="Hackathon Mode" value={form.hackathonMode} onChange={(v) => setForm({ ...form, hackathonMode: v })}
                  options={["solo", "team"]} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} type="datetime-local" />
                <Field label="End Date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} type="datetime-local" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="1st Prize" value={form.prizeFirst} onChange={(v) => setForm({ ...form, prizeFirst: v })} />
                <Field label="2nd Prize" value={form.prizeSecond} onChange={(v) => setForm({ ...form, prizeSecond: v })} />
                <Field label="3rd Prize" value={form.prizeThird} onChange={(v) => setForm({ ...form, prizeThird: v })} />
                <Field label="Total Value" value={form.prizeTotalValue} onChange={(v) => setForm({ ...form, prizeTotalValue: v })} />
              </div>

              <Field label="Rules (one per line)" value={form.rules} onChange={(v) => setForm({ ...form, rules: v })} textarea />

              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="btn-primary !py-3 flex-1">{editing ? "Update" : "Create"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary !py-3 flex-1">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Questions Tab
// ═══════════════════════════════════════════════════════════════
function QuestionsTab() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filters, setFilters] = useState({ category: '', difficulty: '', questionType: '', scope: '' });
  const [form, setForm] = useState<any>(getDefaultQuestionForm());
  

  const fetchQuestions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/hackathon-questions?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setQuestions(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/hackathon-questions/${editing}` : "/api/hackathon-questions";
      const method = editing ? "PUT" : "POST";

      const body = {
        ...form,
        options: form.options.filter((o: any) => o.text.trim()),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditing(null);
        setForm(getDefaultQuestionForm());
        fetchQuestions();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error saving question");
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/hackathon-questions/${id}`, { method: "DELETE", credentials: "include" });
    fetchQuestions();
  };

  const handleEdit = (q: any) => {
    setEditing(q._id);
    setForm({
      questionText: q.questionText || "",
      questionType: q.questionType || "mcq",
      category: q.category || "web_dev",
      difficulty: q.difficulty || "easy",
      points: q.points || 10,
      scope: q.scope || "global",
      correctAnswer: q.correctAnswer || "",
      explanation: q.explanation || "",
      options: q.options?.length > 0 ? q.options : [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }],
    });
    setShowForm(true);
  };

  const CATEGORIES = ["web_dev", "frontend", "backend", "database", "sql", "ai_ml", "cybersecurity", "cloud_computing", "problem_solving", "logical_reasoning", "system_design"];
  const TYPES = ["mcq", "coding", "case_study", "scenario", "project"];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select className="input-field !w-auto !py-2 !text-xs" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c: string) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
        </select>
        <select className="input-field !w-auto !py-2 !text-xs" value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select className="input-field !w-auto !py-2 !text-xs" value={filters.questionType} onChange={(e) => setFilters({ ...filters, questionType: e.target.value })}>
          <option value="">All Types</option>
          {TYPES.map((t: string) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
        </select>
        <select className="input-field !w-auto !py-2 !text-xs" value={filters.scope} onChange={(e) => setFilters({ ...filters, scope: e.target.value })}>
          <option value="">All Scopes</option>
          <option value="global">Global</option>
          <option value="private">Private</option>
        </select>

        <div className="ml-auto">
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(getDefaultQuestionForm()); }} className="btn-primary !py-2.5 !px-5 !text-sm">
            + Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center text-[var(--text-muted)] animate-pulse py-10">Loading...</div>
      ) : (
        <div className="space-y-2">
          {questions.map((q: any) => (
            <div key={q._id} className="glass rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--foreground)] mb-1 line-clamp-2">{q.questionText}</div>
                <div className="flex flex-wrap items-center gap-2 text-[9px]">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase">{q.questionType?.replace("_", " ")}</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold uppercase">{q.category?.replace("_", " ")}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                    q.difficulty === "easy" ? "bg-green-500/20 text-green-400" :
                    q.difficulty === "intermediate" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>{q.difficulty}</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 font-bold">{q.scope}</span>
                  <span className="text-yellow-400 font-bold">+{q.points} pts</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(q)} className="text-xs font-bold text-[var(--primary-light)] hover:underline">Edit</button>
                <button onClick={() => handleDelete(q._id)} className="text-xs font-bold text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="text-center text-[var(--text-muted)] py-10">No questions yet. Add some!</div>
          )}
        </div>
      )}

      {/* Question Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 sm:p-8 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-6">{editing ? "✏️ Edit Question" : "📝 Add Question"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Question Text *" value={form.questionText} onChange={(v) => setForm({ ...form, questionText: v })} textarea required />

              <div className="grid grid-cols-3 gap-4">
                <SelectField label="Type" value={form.questionType} onChange={(v) => setForm({ ...form, questionType: v })} options={TYPES} />
                <SelectField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES} />
                <SelectField label="Difficulty" value={form.difficulty} onChange={(v) => setForm({ ...form, difficulty: v })} options={["easy", "intermediate", "advanced"]} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Points" value={form.points} onChange={(v) => setForm({ ...form, points: Number(v) })} type="number" />
                <SelectField label="Scope" value={form.scope} onChange={(v) => setForm({ ...form, scope: v })} options={["global", "private"]} />
              </div>

              {form.questionType === "mcq" && (
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">MCQ Options</label>
                  {form.options.map((opt: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...form.options];
                          newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                          setForm({ ...form, options: newOpts });
                        }}
                        className="input-field !py-2 !text-sm flex-1"
                        placeholder={`Option ${idx + 1}`}
                      />
                      <label className="flex items-center gap-1 text-xs text-[var(--text-muted)] cursor-pointer whitespace-nowrap">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => {
                            const newOpts = form.options.map((o: any, i: number) => ({ ...o, isCorrect: i === idx }));
                            setForm({ ...form, options: newOpts });
                          }}
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {form.questionType !== "mcq" && (
                <Field label="Correct Answer" value={form.correctAnswer} onChange={(v) => setForm({ ...form, correctAnswer: v })} textarea />
              )}

              <Field label="Explanation (shown after answer)" value={form.explanation} onChange={(v) => setForm({ ...form, explanation: v })} textarea />

              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="btn-primary !py-3 flex-1">{editing ? "Update" : "Create"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary !py-3 flex-1">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Participants Tab
// ═══════════════════════════════════════════════════════════════
function ParticipantsTab() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState('list');
   // "list" or "review"

  useEffect(() => {
    const fetch_ = async () => {
      const res = await fetch("/api/hackathons/admin/all", { credentials: "include" });
      const data = await res.json();
      if (data.success) setHackathons(data.data);
    };
    fetch_();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const fetch_ = async () => {
      setLoading(true);
      const res = await fetch(`/api/hackathons/${selected}/participants`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setParticipants(data.data);
      setLoading(false);
    };
    fetch_();
  }, [selected]);

  const handleExport = async (format: string) => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/hackathons/${selected}/export`, { credentials: "include" });
      const data = await res.json();
      if (!data.success) return;

      const exportData = data.data;

      if (format === "json") {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        downloadBlob(blob, `hackathon-results-${selected}.json`);
      } else if (format === "csv") {
        const csvContent = convertToCSV(exportData.participants);
        const blob = new Blob([csvContent], { type: "text/csv" });
        downloadBlob(blob, `hackathon-results-${selected}.csv`);
      }
    } catch (err) {
      alert("Export failed");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          className="input-field !w-auto !py-2 !text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select Hackathon</option>
          {hackathons.map((h: any) => <option key={h._id} value={h._id}>{h.title}</option>)}
        </select>

        {selected && (
          <div className="flex items-center gap-2 bg-[var(--surface-light)] p-1 rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setSubTab("list")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${subTab === "list" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}
            >
              👥 Registered Participants
            </button>
            <button
              onClick={() => setSubTab("review")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${subTab === "review" ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}
            >
              💻 Code Submissions Review
            </button>
          </div>
        )}

        {selected && subTab === "list" && (
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => handleExport("json")} className="btn-secondary !py-2 !px-4 !text-xs">📄 JSON</button>
            <button onClick={() => handleExport("csv")} className="btn-secondary !py-2 !px-4 !text-xs">📊 CSV</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-[var(--text-muted)] animate-pulse py-10">Loading...</div>
      ) : selected && subTab === "list" && participants.length > 0 ? (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--surface)] text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-bold">#</th>
                  <th className="px-4 py-3 text-left font-bold">Name</th>
                  <th className="px-4 py-3 text-left font-bold">Email</th>
                  <th className="px-4 py-3 text-left font-bold">College</th>
                  <th className="px-4 py-3 text-left font-bold">Student ID</th>
                  <th className="px-4 py-3 text-left font-bold">State</th>
                  <th className="px-4 py-3 text-left font-bold">Links</th>
                  <th className="px-4 py-3 text-right font-bold">Score</th>
                  <th className="px-4 py-3 text-right font-bold">Round</th>
                  <th className="px-4 py-3 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {participants.map((p: any, idx: number) => (
                  <tr key={p._id} className="hover:bg-[var(--surface-light)] transition-colors">
                    <td className="px-4 py-3 text-[var(--text-muted)]">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{p.email}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{p.college || "—"}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{p.studentId || "—"}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{p.state || "—"}</td>
                    <td className="px-4 py-3">
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-[var(--primary-light)] hover:underline">GitHub</a>}
                      {p.githubUrl && p.linkedinUrl && <span className="mx-1 text-[var(--border)]">|</span>}
                      {p.linkedinUrl && <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#0a66c2] hover:underline">LinkedIn</a>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{p.totalScore}</td>
                    <td className="px-4 py-3 text-right">{p.currentRound}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        p.status === "qualified" ? "bg-emerald-500/20 text-emerald-400" :
                        p.status === "disqualified" ? "bg-red-500/20 text-red-400" :
                        p.status === "winner" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selected && subTab === "review" ? (
        <CodeSubmissionsReview hackathonId={selected} />
      ) : selected ? (
        <div className="text-center text-[var(--text-muted)] py-10">No participants yet.</div>
      ) : (
        <div className="text-center text-[var(--text-muted)] py-10">Select a hackathon to view participants.</div>
      )}
    </div>
  );
}

interface CodeSubmissionsReviewProps {
  hackathonId: string;
}

function CodeSubmissionsReview({ hackathonId }: CodeSubmissionsReviewProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRound, setSelectedRound] = useState(2);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [comparedSubs, setComparedSubs] = useState<any[]>([]);
  const [checkedIds, setCheckedIds] = useState<any[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  

  const fetchSubmissions = useCallback(async () => {
    if (!hackathonId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rounds/admin/submissions?hackathonId=${hackathonId}&roundNumber=${selectedRound}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const sorted = (data.data || []).sort((a: any, b: any) => (b.totalScore || 0) - (a.totalScore || 0));
        setSubmissions(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, selectedRound]);

  useEffect(() => {
    fetchSubmissions();
    setCheckedIds([]);
  }, [fetchSubmissions]);

  const handleToggleCheck = (subId: any) => {
    setCheckedIds(prev => {
      if (prev.includes(subId)) {
        return prev.filter((id: any) => id !== subId);
      } else {
        if (prev.length >= 2) {
          alert("You can select at most 2 submissions for comparison.");
          return prev;
        }
        return [...prev, subId];
      }
    });
  };

  const handleCompare = () => {
    if (checkedIds.length !== 2) return;
    const subsToCompare = submissions.filter((s: any) => checkedIds.includes(s._id));
    if (subsToCompare.length === 2) {
      setComparedSubs(subsToCompare);
    }
  };

  const handleEvaluate = async () => {
    if (!confirm("Are you sure you want to run automated evaluation for all Round 2 submissions?")) return;
    setEvaluating(true);
    try {
      const res = await fetch("/api/rounds/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hackathonId })
      });
      const data = await res.json();
      if (data.success) {
        alert("Evaluation complete!");
        fetchSubmissions();
      } else {
        alert(data.message || "Failed to evaluate.");
      }
    } catch (err) {
      alert("Error evaluating.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleFinalize = async () => {
    if (!confirm("Are you sure you want to finalize the top 20 and open Round 3?")) return;
    setFinalizing(true);
    try {
      const res = await fetch("/api/rounds/select-top-20", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hackathonId })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Top 20 selected and Round 3 opened!");
        fetchSubmissions();
      } else {
        alert(data.message || "Failed to finalize.");
      }
    } catch (err) {
      alert("Error finalizing.");
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 bg-[var(--surface-light)] p-4 rounded-2xl border border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-bold">Round:</span>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(parseInt(e.target.value))}
            className="input-field !w-auto !py-1.5 !text-xs font-bold"
          >
            <option value={2}>Round 2</option>
            <option value={3}>Round 3</option>
          </select>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={handleCompare}
            disabled={checkedIds.length !== 2}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-all shadow-md"
          >
            📊 Compare Selected ({checkedIds.length}/2)
          </button>
          
          {selectedRound === 2 && (
            <>
              <button
                onClick={handleEvaluate}
                disabled={evaluating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-40 text-xs font-bold text-white transition-all shadow-md"
              >
                {evaluating ? "Evaluating..." : "🤖 Run Automated Scoring"}
              </button>
              <button
                onClick={handleFinalize}
                disabled={finalizing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-40 text-xs font-bold text-white transition-all shadow-md"
              >
                {finalizing ? "Finalizing..." : "🏆 Select Top 20 & Open R3"}
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[var(--text-muted)] animate-pulse py-10">Loading submissions...</div>
      ) : submissions.length > 0 ? (
        <div className="glass rounded-xl overflow-hidden border border-[var(--border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--surface)] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left font-bold w-12">Select</th>
                  <th className="px-4 py-3 text-left font-bold w-12">Rank</th>
                  <th className="px-4 py-3 text-left font-bold">Participant</th>
                  <th className="px-4 py-3 text-left font-bold">Language</th>
                  <th className="px-4 py-3 text-left font-bold">Last Saved</th>
                  <th className="px-4 py-3 text-right font-bold">Total Score</th>
                  <th className="px-4 py-3 text-right font-bold">Status</th>
                  <th className="px-4 py-3 text-center font-bold w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {submissions.map((sub: any, idx: number) => {
                  const isChecked = checkedIds.includes(sub._id);
                  return (
                    <tr key={sub._id} className="hover:bg-[var(--surface-light)] transition-colors">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCheck(sub._id)}
                          className="w-4 h-4 cursor-pointer accent-[var(--primary)]"
                        />
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] font-bold">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[var(--foreground)]">{sub.userId?.name || "Unknown"}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{sub.userId?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase text-[9px]">
                          {sub.language}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        {sub.lastSavedAt ? new Date(sub.lastSavedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-sm text-[var(--foreground)]">
                        {sub.totalScore || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          sub.status === "submitted" || sub.status === "COMPLETED" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                          sub.status === "evaluated" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                          "bg-gray-500/10 text-gray-400"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="px-3 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary-light)] border border-[var(--primary)]/20 font-bold hover:bg-[var(--primary)]/20 transition-all text-[10px]"
                        >
                          👁️ View Code
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center text-[var(--text-muted)] py-12 bg-[var(--surface-light)] border border-[var(--border)] rounded-2xl">
          <div className="text-3xl mb-2">📂</div>
          <p>No workspace submissions found for this round.</p>
        </div>
      )}

      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-6 sm:p-8 w-full max-w-4xl border border-gray-800 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Code Submission by {selectedSub.userId?.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{selectedSub.userId?.email} • {selectedSub.language} solution</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition-all"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 min-h-[400px] border border-gray-800 rounded-2xl overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={selectedSub.language}
                value={selectedSub.sourceCode}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  fontSize: 13,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  automaticLayout: true
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {comparedSubs.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-6 w-full max-w-[95vw] border border-gray-800 h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-white">Side-by-Side Code Comparison</h3>
                <p className="text-xs text-[var(--text-muted)]">Compare code architecture, database designs, and implementation flows</p>
              </div>
              <button
                onClick={() => setComparedSubs([])}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition-all"
              >
                ✕ Close Comparison
              </button>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
              {comparedSubs.map((sub: any, idx: number) => (
                <div key={sub._id} className="flex flex-col h-full border border-gray-800 rounded-2xl overflow-hidden bg-[#0c0d12]">
                  <div className="h-10 bg-[#12131a] border-b border-gray-800 flex items-center justify-between px-4">
                    <span className="text-xs font-black text-gray-300">
                      {idx + 1}. {sub.userId?.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Score: <strong className="text-yellow-400">{sub.totalScore || 0}</strong> • {sub.language}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <Editor
                      height="100%"
                      language={sub.language}
                      value={sub.sourceCode}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        fontSize: 12,
                        minimap: { enabled: false },
                        wordWrap: "on",
                        automaticLayout: true
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helper Components & Functions
// ═══════════════════════════════════════════════════════════════

interface FieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  textarea?: boolean;
  required?: boolean;
}

function Field({ label, value, onChange, type = "text", textarea = false, required = false }: FieldProps) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div>
      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">{label}</label>
      <Tag
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field !text-sm ${textarea ? "!h-24 resize-none" : ""}`}
        required={required}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  options: string[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field !text-sm">
        {options.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
      </select>
    </div>
  );
}

function getDefaultHackathonForm(): any {
  return {
    title: "", description: "", shortDescription: "", status: "draft",
    startDate: "", endDate: "",
    registrationType: "free", entryFee: 0,
    participantLimitMode: "unlimited", maxParticipants: 0,
    questionBankMode: "global", hackathonMode: "solo",
    prizeFirst: "", prizeSecond: "", prizeThird: "", prizeTotalValue: "",
    rules: "", faqs: [], rounds: [],
  };
}

function getDefaultQuestionForm() {
  return {
    questionText: "", questionType: "mcq", category: "web_dev", difficulty: "easy",
    points: 10, scope: "global", correctAnswer: "", explanation: "",
    options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }],
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function convertToCSV(data: any[]) {
  if (!data || data.length === 0) return "";
  const headers = ["rank", "name", "email", "college", "studentId", "state", "githubUrl", "linkedinUrl", "status", "totalScore", "totalTimeTaken", "currentRound"];
  const rows = data.map(d => headers.map(h => `"${(d[h] || "").toString().replace(/"/g, '""')}"`).join(","));
  return [headers.join(","), ...rows].join("\n");
}

// ═══════════════════════════════════════════════════════════════
// Round Question Manager (Assign/Remove questions to rounds)
// ═══════════════════════════════════════════════════════════════
interface RoundQuestionManagerProps {
  hackathonId: string;
  rounds: any[];
  onUpdated?: () => void;
}

function RoundQuestionManager({ hackathonId, rounds, onUpdated }: RoundQuestionManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingQs, setLoadingQs] = useState(false);
  

  const openForRound = async (round: any) => {
    setSelectedRound(round);
    setSelectedIds(round.questionIds?.map((id: any) => typeof id === 'object' ? (id._id || id) : id.toString()) || []);
    setOpen(true);
    setLoadingQs(true);

    try {
      const res = await fetch("/api/hackathon-questions", { credentials: "include" });
      const data = await res.json();
      if (data.success) setAllQuestions(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQs(false);
    }
  };

  const toggleQuestion = (qId: any) => {
    setSelectedIds(prev =>
      prev.includes(qId) ? prev.filter((id: any) => id !== qId) : [...prev, qId]
    );
  };

  const handleSave = async () => {
    if (!selectedRound) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/hackathons/${hackathonId}/rounds/${selectedRound.roundNumber}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ questionIds: selectedIds }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setOpen(false);
        if (onUpdated) onUpdated();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const DIFF_COLORS = {
    easy: "bg-green-500/20 text-green-400",
    intermediate: "bg-yellow-500/20 text-yellow-400",
    advanced: "bg-red-500/20 text-red-400"
  };

  return (
    <>
      <button
        onClick={() => openForRound(rounds[0])}
        className="text-[10px] font-bold text-[var(--primary-light)] hover:underline ml-auto"
      >
        📝 Manage Questions
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 sm:p-8 w-full max-w-3xl my-8 max-h-[85vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-2">📝 Manage Round Questions</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Select which questions to assign to each round.
            </p>

            {/* Round Tabs */}
            <div className="flex items-center gap-2 mb-6">
              {rounds.map((r: any) => (
                <button
                  key={r.roundNumber}
                  onClick={() => openForRound(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedRound?.roundNumber === r.roundNumber
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-light)] text-[var(--text-muted)] border border-[var(--border)]"
                  }`}
                >
                  Round {r.roundNumber} ({r.questionIds?.length || 0})
                </button>
              ))}
            </div>

            {loadingQs ? (
              <div className="text-center text-[var(--text-muted)] py-10 animate-pulse">Loading questions...</div>
            ) : (
              <>
                <div className="text-xs text-[var(--text-muted)] mb-3">
                  Selected: <span className="font-bold text-[var(--primary-light)]">{selectedIds.length}</span> questions
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {allQuestions.map((q: any) => {
                    const isSelected = selectedIds.includes(q._id);
                    return (
                      <button
                        key={q._id}
                        onClick={() => toggleQuestion(q._id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-[var(--border)] bg-[var(--surface-light)] hover:border-[var(--primary)]/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]"
                          }`}>
                            {isSelected && <span className="text-white text-[10px]">✓</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="line-clamp-2 text-[var(--foreground)] font-medium mb-1">{q.questionText}</div>
                            <div className="flex flex-wrap gap-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-400">{q.questionType?.replace("_"," ")}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${DIFF_COLORS[q.difficulty as keyof typeof DIFF_COLORS] || DIFF_COLORS.easy}`}>{q.difficulty}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-500/20 text-purple-400">{q.category?.replace("_"," ")}</span>
                              <span className="text-[9px] font-bold text-yellow-400">+{q.points}pts</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {allQuestions.length === 0 && (
                    <div className="text-center text-[var(--text-muted)] py-6">No questions in question bank. Create some first!</div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-6 mt-4 border-t border-[var(--border)]">
                  <button onClick={handleSave} disabled={saving} className="btn-primary !py-3 flex-1">
                    {saving ? "Saving..." : `Save (${selectedIds.length} Questions)`}
                  </button>
                  <button onClick={() => setOpen(false)} className="btn-secondary !py-3 flex-1">Cancel</button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// AI Generate Button (Generate / Regenerate Questions)
// ═══════════════════════════════════════════════════════════════
interface AIGenerateButtonProps {
  hackathonId: string;
  onDone?: () => void;
}

function AIGenerateButton({ hackathonId, onDone }: AIGenerateButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  

  const handleGenerate = async (forceRegenerate: boolean = false) => {
    if (generating) return;
    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ forceRegenerate }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ type: "success", message: data.message, data: data.data });
        if (onDone) onDone();
      } else {
        setResult({ type: "error", message: data.message });
      }
    } catch (err) {
      setResult({ type: "error", message: "Failed to generate questions." });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <button
        onClick={() => handleGenerate(false)}
        disabled={generating}
        className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
          generating
            ? "bg-purple-500/20 text-purple-400 animate-pulse cursor-wait"
            : "bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20"
        }`}
      >
        {generating ? "⏳ Generating..." : "🤖 AI Generate"}
      </button>
      <button
        onClick={() => handleGenerate(true)}
        disabled={generating}
        className="text-[10px] font-bold text-orange-400 hover:underline disabled:opacity-40"
        title="Regenerate all questions (replaces existing)"
      >
        🔄
      </button>
      {result && (
        <span className={`text-[9px] font-bold ${result.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
          {result.type === "success"
            ? `✅ R1:${result.data?.newQuestions?.round1 || 0} R2:${result.data?.newQuestions?.round2 || 0} R3:${result.data?.newQuestions?.round3 || 0}`
            : `❌ ${result.message}`
          }
        </span>
      )}
    </div>
  );
}
