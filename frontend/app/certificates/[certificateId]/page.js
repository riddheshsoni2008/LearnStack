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
        if (!res.ok) {
          setError("Certificate not found or server error.");
          setLoading(false);
          return;
        }
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
      return (
        <>
          <span className="block font-bold text-gray-900 mb-2 text-lg sm:text-xl">Has been rigorously evaluated and awarded the Advanced Developer Achievement.</span>
          <span className="text-gray-600 italic">This certifies that the candidate has demonstrated exceptional mastery over complex programming concepts, advanced architectural patterns, and elite software engineering practices, exceeding the standard curriculum requirements.</span>
        </>
      );
    }
    if (certificate.certificateType === 'PROFESSIONAL') {
      return (
        <>
           <span className="block font-bold text-gray-900 mb-2 text-lg sm:text-xl">Has met all stringent requirements for Professional Developer Certification.</span>
           <span className="text-gray-600 italic">This prestigious credential acknowledges deep technical expertise, unwavering dedication to code quality, and the proven ability to construct scalable, production-ready applications at an industry-standard level.</span>
        </>
      );
    }
    return (
      <>
        <span className="block font-bold text-gray-900 mb-2 text-lg sm:text-xl">Has successfully completed the comprehensive curriculum for {certificate.trackName}.</span>
        <span className="text-gray-600 italic">This acknowledges the successful completion of rigorous technical training, demonstrating a solid foundational understanding and practical proficiency in core development technologies and methodologies.</span>
      </>
    );
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
      <div className="w-full max-w-[1000px] min-h-[500px] sm:min-h-[700px] bg-white text-gray-900 shadow-sm border border-gray-200 print:shadow-none print:border-none relative flex p-4 sm:p-8 md:p-12 print:p-0 mt-4">
        
        {/* Inner Borders */}
        <div className="w-full h-full border-[4px] sm:border-[10px] border-gray-100 p-1 sm:p-2 flex flex-col md:flex-row">
          <div className="w-full h-full border border-gray-300 relative flex flex-col items-center text-center px-4 py-8 sm:px-8 sm:py-12 print:px-12 print:py-16">
            
            {/* Header */}
            <div className="mb-6 sm:mb-12">
              <h1 className="text-xl sm:text-3xl font-serif font-bold text-gray-900 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                LEARNSTACK
              </h1>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-gray-800 mb-6 sm:mb-8 uppercase tracking-[0.1em] sm:tracking-[0.2em] leading-tight">
              Certificate of Completion
            </h2>
            
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-3 sm:mb-4 uppercase tracking-[0.2em]">
              Awarded To
            </p>

            <h3 className="text-3xl sm:text-5xl md:text-6xl font-serif text-gray-900 mb-6 sm:mb-8 italic pb-2 border-b border-gray-300 min-w-[70%] md:min-w-[50%]">
              {certificate.studentName}
            </h3>

            <p className="text-sm sm:text-base md:text-lg text-gray-800 max-w-2xl leading-relaxed mb-10 sm:mb-16 font-serif px-2">
              {getAchievementDescription()}
            </p>

            {/* Footer Grid */}
            <div className="flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-4 w-full mt-auto items-center md:items-end text-center md:text-left">
              
              {/* Left Column: Dates & ID */}
              <div className="flex flex-col gap-4 md:gap-6 items-center md:items-start w-full md:w-auto border-b md:border-none border-gray-200 pb-6 md:pb-0">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">Credential ID</p>
                  <p className="font-mono text-xs sm:text-sm text-gray-900">{certificate.certificateId}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">Issued</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-serif">
                    {new Date(certificate.issuedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Middle Column: Verification / Signature */}
              <div className="flex flex-col items-center justify-end px-4 w-full md:w-auto border-b md:border-none border-gray-200 pb-6 md:pb-0">
                <div className="w-40 sm:w-48 border-b border-gray-400 mb-2 pb-2 text-center">
                  <span className="text-2xl sm:text-4xl text-gray-800" style={{ fontFamily: "var(--font-signature), cursive" }}>LearnStack Authority</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Authorized Signature</p>
              </div>

              {/* Right Column: Status */}
              <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
                <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">
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
