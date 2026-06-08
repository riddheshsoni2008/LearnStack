"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CertificatePage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!certificateId) return;

    const fetchCertificate = async () => {
      try {
        const res = await fetch(`/api/certificates/verify/${certificateId}`);
        const data = await res.json();

        if (data.success) {
          setCertificate(data.data);
        } else {
          setError(data.message || "Certificate not found");
        }
      } catch (err) {
        setError("Failed to verify certificate. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg">Verifying credential...</div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Verification Failed</h1>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-md font-bold hover:bg-gray-800 transition">
          Return Home
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`I just earned a certification on LearnStack!`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const getAchievementDescription = () => {
    if (certificate.certificateType === 'ADVANCED') {
      return "For successfully completing the LearnStack Advanced Developer Achievement";
    }
    if (certificate.certificateType === 'PROFESSIONAL') {
      return "For attaining the LearnStack Professional Developer Certification";
    }
    return `For successfully completing the ${certificate.trackName}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 print:bg-white print:py-0 print:px-0 flex flex-col items-center">
      
      {/* ═══ Action Bar (Hidden when printing) ═══ */}
      <div className="w-full max-w-[1000px] flex flex-wrap gap-4 justify-between items-center mb-8 print:hidden">
        <Link href="/" className="text-gray-600 font-bold hover:text-gray-900 transition flex items-center gap-2">
          ← Back to LearnStack
        </Link>
        <div className="flex gap-3">
          <button 
            onClick={shareOnLinkedIn}
            className="flex items-center gap-2 px-6 py-2 bg-[#0077b5] text-white font-bold rounded-sm hover:bg-[#005582] transition"
          >
            Share on LinkedIn
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white font-bold rounded-sm hover:bg-gray-800 transition"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* ═══ Professional Certificate Container ═══ */}
      <div className="w-full max-w-[1000px] aspect-[1.414/1] bg-white text-gray-900 shadow-sm border border-gray-200 print:shadow-none print:border-none relative flex p-8 sm:p-12 print:p-0">
        
        {/* Inner Borders */}
        <div className="w-full h-full border-[10px] border-gray-100 p-2 flex">
          <div className="w-full h-full border border-gray-300 relative flex flex-col items-center text-center px-8 py-12 print:px-12 print:py-16">
            
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 uppercase tracking-[0.3em]">
                LEARNSTACK
              </h1>
            </div>

            <h2 className="text-4xl sm:text-5xl font-serif text-gray-800 mb-8 uppercase tracking-[0.2em]">
              Certificate of Completion
            </h2>
            
            <p className="text-sm sm:text-base text-gray-500 mb-4 uppercase tracking-[0.2em]">
              Awarded To
            </p>

            <h3 className="text-5xl sm:text-6xl font-serif text-gray-900 mb-8 italic pb-2 border-b border-gray-300 min-w-[50%]">
              {certificate.studentName}
            </h3>

            <p className="text-base sm:text-lg text-gray-800 max-w-2xl leading-relaxed mb-16 font-serif">
              {getAchievementDescription()}<br/>
              and demonstrating proficiency in modern web development.
            </p>

            {/* Footer Grid */}
            <div className="grid grid-cols-3 w-full mt-auto items-end text-left">
              
              {/* Left Column: Dates & ID */}
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Credential ID</p>
                  <p className="font-mono text-sm text-gray-900">{certificate.certificateId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Issued</p>
                  <p className="text-sm text-gray-900 font-serif">
                    {new Date(certificate.issuedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Middle Column: Verification / Signature */}
              <div className="flex flex-col items-center justify-end px-4">
                <div className="w-48 border-b border-gray-400 mb-2 pb-2 text-center">
                  <span className="text-4xl text-gray-800" style={{ fontFamily: "var(--font-signature), cursive" }}>LearnStack Authority</span>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Authorized Signature</p>
              </div>

              {/* Right Column: Status */}
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">
                  {certificate.isRevoked ? "❌ Revoked Certificate" : "✓ Verified Certificate"}
                </p>
              </div>

            </div>

            {/* Revoked Overlay */}
            {certificate.isRevoked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="transform -rotate-12 border-4 border-red-500 text-red-500 font-black text-6xl py-4 px-12 tracking-widest opacity-20">
                  REVOKED
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* ═══ Footer (Hidden when printing) ═══ */}
      <div className="mt-8 text-center text-sm text-gray-500 print:hidden max-w-[1000px]">
        <p>This credential verifies that the individual has successfully completed all requirements.</p>
        <p className="mt-1">
          Verify at: <a href={certificate.verificationUrl} className="text-gray-900 hover:underline font-mono">{certificate.verificationUrl}</a>
        </p>
      </div>

    </div>
  );
}
