"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
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

  const wordCount = reviewText.trim() ? reviewText.trim().split(/\s+/).length : 0;

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
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
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not reach the analysis service. Is the app running locally?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
        Review analyzer
      </span>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Submit a review for examination</h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
        Paste a product review below. The model looks only at the text itself —
        product name and category are optional context shown alongside the result.
      </p>

      <form onSubmit={handleAnalyze} className="mt-10 space-y-5">
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
              className="mt-2 w-full rounded-lg border border-line bg-ink-800 px-4 py-3 text-[15px] outline-none placeholder:text-ink-muted/60 focus:border-amber"
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
              className="mt-2 w-full rounded-lg border border-line bg-ink-800 px-4 py-3 text-[15px] outline-none focus:border-amber"
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
            <span className="font-mono text-xs text-ink-muted">{wordCount} words</span>
          </div>
          <textarea
            id="reviewText"
            required
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={7}
            placeholder="Paste or write a product review here..."
            className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-800 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-ink-muted/60 focus:border-amber"
          />
        </div>

        <button
          type="submit"
          disabled={loading || wordCount < 3}
          className="inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 font-mono text-sm uppercase tracking-wide text-[#1c1305] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Examining..." : "Analyze review"}
        </button>
      </form>

      {error && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber/40 bg-amber/10 px-5 py-4 text-sm text-[#f0d9ae]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-12">
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
                className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-widest ${
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
                {result.topFeatures.map((f) => (
                  <span
                    key={f.term}
                    className={`rounded-full border px-3 py-1 font-mono text-xs ${
                      f.direction === "fake"
                        ? "border-amber/40 text-amber"
                        : "border-teal/40 text-teal"
                    }`}
                  >
                    {f.term}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
