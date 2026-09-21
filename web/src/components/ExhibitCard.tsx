"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export type TopFeature = {
  term: string;
  contribution: number;
  direction: "fake" | "genuine";
};

type ExhibitCardProps = {
  reviewText: string;
  productName?: string;
  productType?: string;
  verdict: "fake" | "genuine";
  confidence: number;
  topFeatures?: TopFeature[];
  showScanline?: boolean;
  caseNumber?: string;
};

function highlightTerms(text: string, terms: string[], tone: "fake" | "genuine") {
  if (!terms.length) return text;
  const escaped = terms
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  if (!escaped.length) return text;
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  const toneClass =
    tone === "fake"
      ? "bg-amber/25 text-[#5a3c0c] decoration-amber hover:bg-amber/40"
      : "bg-teal/20 text-[#123a2f] decoration-teal hover:bg-teal/35";
  return parts.map((part, i) =>
    escaped.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <mark key={i} className={`rounded-sm px-0.5 underline decoration-2 transition-colors duration-300 ${toneClass}`}>
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function ExhibitCard({
  reviewText,
  productName,
  productType,
  verdict,
  confidence,
  topFeatures = [],
  showScanline = false,
  caseNumber = "0001",
}: ExhibitCardProps) {
  const isFake = verdict === "fake";
  const terms = topFeatures.map((f) => f.term);

  // Animate the confidence bar filling in from zero on mount and whenever a
  // new prediction comes in, instead of snapping straight to its final width.
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    setBarWidth(0);
    const t = setTimeout(() => setBarWidth(confidence), 80);
    return () => clearTimeout(t);
  }, [confidence, verdict, reviewText]);

  return (
    <div
      className={`exhibit-card relative overflow-hidden rounded-2xl border border-paper-line bg-paper paper-grain shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-1.5 ${
        isFake
          ? "hover:shadow-[0_35px_70px_-25px_rgba(230,161,58,0.35)]"
          : "hover:shadow-[0_35px_70px_-25px_rgba(63,168,138,0.35)]"
      }`}
    >
      {showScanline && <div className="scanline" />}

      <div className="flex items-center justify-between border-b border-dashed border-paper-line px-6 py-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#6b6151]">
          Exhibit №{caseNumber}
        </span>
        {productName && (
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#6b6151]">
            {productType ? `${productType} · ` : ""}
            {productName}
          </span>
        )}
      </div>

      <div className="px-6 py-6">
        <p className="font-body text-[15px] leading-relaxed text-paper-ink">
          {highlightTerms(reviewText, terms, verdict)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-dashed border-paper-line px-6 py-4">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#6b6151]">
          <span>Confidence</span>
          <span className="tabular-nums text-sm text-paper-ink">{confidence.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 flex-1 max-w-[140px] overflow-hidden rounded-full bg-[#e2d9c2]">
          <div
            className={`h-full rounded-full transition-[width] duration-[1100ms] ease-out ${isFake ? "bg-amber" : "bg-teal"}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Verdict stamp */}
      <div
        className={`stamp-anim pointer-events-none absolute right-5 top-16 select-none rounded-md border-[3px] px-3 py-1 font-display text-lg font-bold uppercase tracking-wider sm:right-8 sm:top-20 sm:px-4 sm:py-1.5 sm:text-2xl ${
          isFake ? "border-amber text-amber" : "border-teal text-teal"
        }`}
      >
        <span className="flex items-center gap-2">
          {isFake ? <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" /> : <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />}
          {isFake ? "Flagged" : "Verified"}
        </span>
      </div>

      <style jsx global>{`
        @keyframes stamp-pop-in {
          0% { transform: scale(2.2) rotate(-8deg); opacity: 0; }
          60% { transform: scale(0.94) rotate(-8deg); opacity: 1; }
          80% { transform: scale(1.04) rotate(-8deg); }
          100% { transform: scale(1) rotate(-8deg); opacity: 1; }
        }
        @keyframes stamp-idle-wobble {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(-6.5deg); }
        }
        .stamp-anim {
          animation:
            stamp-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
            stamp-idle-wobble 5s ease-in-out 0.6s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .stamp-anim {
            animation: none;
            transform: rotate(-8deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
