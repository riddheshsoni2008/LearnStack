"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";

export default function HackathonRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    collegeName: "",
    studentId: "",
    state: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    resumeUrl: ""
  });

  // Validation state
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/hackathon/${params.slug}/register`);
      return;
    }

    const fetchHackathon = async () => {
      try {
        const res = await fetch(`/api/hackathons/${params.slug}/details`);
        const data = await res.json();
        if (data.success) {
          setHackathon(data.data);
          // Check if already registered
          const statusRes = await fetch(`/api/hackathons/${params.slug}/my-status`, { credentials: "include" });
          const statusData = await statusRes.json();
          if (statusData.success && statusData.data.registered) {
            router.push(`/hackathon/${params.slug}`); // Already registered
          }
        } else {
          router.push("/hackathon");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHackathon();
    }
  }, [params.slug, user, authLoading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const errors = {};
    if (!form.collegeName.trim()) errors.collegeName = "College / University is required";
    if (!form.studentId.trim()) errors.studentId = "Student ID is required";
    if (!form.state.trim()) errors.state = "State is required";
    if (!form.githubUrl.trim()) errors.githubUrl = "GitHub profile is required";
    if (!form.linkedinUrl.trim()) errors.linkedinUrl = "LinkedIn profile is required";
    return errors;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      collegeName: true, studentId: true, state: true, githubUrl: true, linkedinUrl: true
    });

    if (!isValid) {
      setError("Please fill in all required fields.");
      return;
    }

    setRegistering(true);
    setError("");

    try {
      const res = await fetch(`/api/hackathons/${params.slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        const redirectSlug = data.redirectSlug || params.slug;
        router.push(`/hackathon/${redirectSlug}`);
      } else {
        setError(`❌ ${data.message || "Registration failed"}`);
      }
    } catch (err) {
      setError("❌ Network error. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20">
      <AuthNavbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 md:p-12 border border-[var(--primary)]/20 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="mb-8 relative z-10">
            <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
              📝 Registration
            </h1>
            <p className="text-[var(--text-muted)] text-lg">
              {hackathon.title}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 font-medium text-sm flex items-start gap-2 relative z-10">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Read-only User Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Full Name *</label>
                <input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm opacity-60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Email Address *</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            <hr className="border-[var(--border)] my-6" />

            {/* Required Hackathon Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">College / University *</label>
                <input
                  type="text"
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., IIT Bombay"
                  className={`w-full bg-[var(--surface-light)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${touched.collegeName && errors.collegeName ? 'border-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)]'}`}
                />
                {touched.collegeName && errors.collegeName && <p className="text-red-400 text-xs mt-1 font-medium">{errors.collegeName}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Student ID *</label>
                <input
                  type="text"
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 2024CS001"
                  className={`w-full bg-[var(--surface-light)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${touched.studentId && errors.studentId ? 'border-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)]'}`}
                />
                {touched.studentId && errors.studentId && <p className="text-red-400 text-xs mt-1 font-medium">{errors.studentId}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">State / Region *</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Maharashtra"
                  className={`w-full bg-[var(--surface-light)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${touched.state && errors.state ? 'border-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)]'}`}
                />
                {touched.state && errors.state && <p className="text-red-400 text-xs mt-1 font-medium">{errors.state}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">GitHub URL *</label>
                <input
                  type="url"
                  name="githubUrl"
                  value={form.githubUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://github.com/username"
                  className={`w-full bg-[var(--surface-light)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${touched.githubUrl && errors.githubUrl ? 'border-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)]'}`}
                />
                {touched.githubUrl && errors.githubUrl && <p className="text-red-400 text-xs mt-1 font-medium">{errors.githubUrl}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">LinkedIn URL *</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://linkedin.com/in/username"
                  className={`w-full bg-[var(--surface-light)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${touched.linkedinUrl && errors.linkedinUrl ? 'border-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)]'}`}
                />
                {touched.linkedinUrl && errors.linkedinUrl && <p className="text-red-400 text-xs mt-1 font-medium">{errors.linkedinUrl}</p>}
              </div>
            </div>

            <hr className="border-[var(--border)] my-6" />

            {/* Optional Fields */}
            <div>
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Optional Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={form.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Resume URL (Drive/Dropbox)</label>
                  <input
                    type="url"
                    name="resumeUrl"
                    value={form.resumeUrl}
                    onChange={handleChange}
                    placeholder="Link to PDF"
                    className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-[var(--border)] flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-xs text-[var(--text-muted)] font-medium text-center sm:text-left max-w-sm">
                By registering, you agree to the hackathon rules and guidelines. All fields marked with * are mandatory.
              </p>
              <button
                type="submit"
                disabled={registering}
                className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-bold py-3.5 px-8 rounded-xl shadow-[0_0_20px_rgba(108,92,231,0.4)] hover:shadow-[0_0_30px_rgba(108,92,231,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {registering ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : "Complete Registration"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
