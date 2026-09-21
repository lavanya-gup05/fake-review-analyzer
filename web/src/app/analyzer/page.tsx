"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, ScanLine } from "lucide-react";
import ExhibitCard, { TopFeature } from "@/components/ExhibitCard";

const PRODUCT_TYPES = [
  "Electronics",
  "Kitchen",
  "Beauty",
  "Clothing",
  "Home",
  "Toys",
  "Books",
  "Sports",
  "Other",
];

type AnalyzeResult = {
  prediction: string;
  label: 0 | 1;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  topFeatures: TopFeature[];
  explanation: string;
  wordCount: number;
};

export default function AnalyzerPage() {
  const [reviewText, setReviewText] = useState("");
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState(PRODUCT_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [resultKey, setResultKey] = useState(0);

  const wordCount = reviewText.trim() ? reviewText.trim().split(/\s+/).length : 0;
  const meetsMinimum = wordCount >= 3;

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewText, productName, productType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong analyzing this review.");
        setResult(null);
      } else {
        setResult(data);
        setResultKey((k) => k + 1);
      }
    } catch {
      setError("Could not reach the analysis service. Is the app running locally?");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <span className="fade-up inline-block font-mono text-[11px] uppercase tracking-widest text-ink-muted">
        Review analyzer
      </span>
      <h1 className="fade-up mt-3 font-display text-3xl sm:text-4xl" style={{ animationDelay: "70ms" }}>
        Submit a review for examination
      </h1>
      <p className="fade-up mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted" style={{ animationDelay: "130ms" }}>
        Paste a product review below. The model looks only at the text itself —
        product name and category are optional context shown alongside the result.
      </p>

      <form onSubmit={handleAnalyze} className="fade-up mt-10 space-y-5" style={{ animationDelay: "190ms" }}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="productName" className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              Product name <span className="text-ink-muted/60">(optional)</span>
            </label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Wireless Earbuds Pro"
              className="input-field mt-2 w-full rounded-lg border border-line bg-ink-800 px-4 py-3 text-[15px] outline-none placeholder:text-ink-muted/60 focus:border-amber"
            />
          </div>
          <div>
            <label htmlFor="productType" className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              Product type
            </label>
            <select
              id="productType"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="input-field mt-2 w-full rounded-lg border border-line bg-ink-800 px-4 py-3 text-[15px] outline-none focus:border-amber"
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="reviewText" className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              Review text
            </label>
            <span
              className={`font-mono text-xs transition-colors duration-300 ${
                meetsMinimum ? "text-teal" : "text-ink-muted"
              }`}
            >
              {wordCount} words
            </span>
          </div>
          <textarea
            id="reviewText"
            required
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={7}
            placeholder="Paste or write a product review here..."
            className="input-field mt-2 w-full resize-y rounded-lg border border-line bg-ink-800 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-ink-muted/60 focus:border-amber"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !meetsMinimum}
          className="analyze-btn group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-amber px-6 py-3 font-mono text-sm uppercase tracking-wide text-[#1c1305] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_30px_-8px_rgba(230,161,58,0.55)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <span className="btn-shine pointer-events-none absolute inset-0" />
          {loading ? (
            <>
              <Loader2 className="relative h-4 w-4 animate-spin" />
              <span className="relative">Examining...</span>
            </>
          ) : (
            <>
              <ScanLine className="relative h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="relative">Analyze review</span>
            </>
          )}
        </button>

        {loading && (
          <div className="relative h-0.5 w-full max-w-xs overflow-hidden rounded-full bg-ink-700">
            <div className="mini-scan-bar absolute inset-y-0 w-1/3 rounded-full bg-amber" />
          </div>
        )}
      </form>

      {error && (
        <div className="shake-in mt-8 flex items-start gap-3 rounded-xl border border-amber/40 bg-amber/10 px-5 py-4 text-sm text-[#f0d9ae]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div key={resultKey} className="result-in mt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-ink-muted">Result</h2>
          <div className="mt-4">
            <ExhibitCard
              reviewText={reviewText}
              productName={productName || undefined}
              productType={productType}
              verdict={result.label === 1 ? "fake" : "genuine"}
              confidence={result.confidence}
              topFeatures={result.topFeatures}
              caseNumber={String(Math.floor(Math.random() * 900) + 100)}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-ink-800 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`risk-badge rounded-full px-3 py-1 font-mono text-xs uppercase tracking-widest ${
                  result.riskLevel === "high"
                    ? "bg-amber-dim text-amber"
                    : result.riskLevel === "low"
                    ? "bg-teal-dim text-teal"
                    : "bg-ink-700 text-ink-muted"
                }`}
              >
                {result.riskLevel} risk
              </span>
              <span className="font-mono text-xs text-ink-muted">{result.wordCount} words analyzed</span>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-[#ece7db]">{result.explanation}</p>

            {result.topFeatures.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {result.topFeatures.map((f, i) => (
                  <span
                    key={f.term}
                    className={`chip-pop rounded-full border px-3 py-1 font-mono text-xs transition-all duration-300 hover:-translate-y-0.5 ${
                      f.direction === "fake"
                        ? "border-amber/40 text-amber hover:shadow-[0_0_10px_-2px_rgba(230,161,58,0.6)]"
                        : "border-teal/40 text-teal hover:shadow-[0_0_10px_-2px_rgba(63,168,138,0.6)]"
                    }`}
                    style={{ animationDelay: `${i * 70 + 150}ms` }}
                  >
                    {f.term}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-up-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          opacity: 0;
          animation: fade-up-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .input-field {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .input-field:focus {
          box-shadow: 0 0 0 3px rgba(230, 161, 58, 0.15);
        }
        .input-field:hover:not(:focus) {
          border-color: rgba(230, 161, 58, 0.35);
        }

        .btn-shine {
          background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.35) 50%, transparent 70%);
          background-size: 250% 250%;
          background-position: 200% 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .analyze-btn:hover:not(:disabled) .btn-shine {
          opacity: 1;
          animation: btn-shine-sweep 1s ease forwards;
        }
        @keyframes btn-shine-sweep {
          from { background-position: 200% 0; }
          to { background-position: -50% 0; }
        }

        .mini-scan-bar {
          animation: mini-scan-move 1.1s ease-in-out infinite;
        }
        @keyframes mini-scan-move {
          0% { left: -33%; }
          100% { left: 100%; }
        }

        @keyframes shake-in-x {
          0% { opacity: 0; transform: translateX(-6px); }
          30% { opacity: 1; transform: translateX(4px); }
          60% { transform: translateX(-2px); }
          100% { transform: translateX(0); }
        }
        .shake-in {
          animation: shake-in-x 0.45s ease-out;
        }

        @keyframes result-slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-in {
          animation: result-slide-in 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes risk-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(230, 161, 58, 0); }
          50% { box-shadow: 0 0 0 4px rgba(230, 161, 58, 0.12); }
        }
        .risk-badge {
          animation: risk-pulse 2.4s ease-in-out infinite;
        }

        @keyframes chip-pop-in {
          from { opacity: 0; transform: translateY(6px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chip-pop {
          opacity: 0;
          animation: chip-pop-in 0.4s ease forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-up, .result-in, .chip-pop { opacity: 1; animation: none; }
          .shake-in, .risk-badge, .mini-scan-bar { animation: none; }
        }
      `}</style>
    </div>
  );
}
