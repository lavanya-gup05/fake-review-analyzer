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

/** Wraps occurrences of the given terms in <mark> for in-text highlighting. */
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
      ? "bg-amber/25 text-[#5a3c0c] decoration-amber"
      : "bg-teal/20 text-[#123a2f] decoration-teal";
  return parts.map((part, i) =>
    escaped.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <mark key={i} className={`rounded-sm px-0.5 underline decoration-2 ${toneClass}`}>
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

  return (
    <div className="relative overflow-hidden rounded-2xl border border-paper-line bg-paper paper-grain shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]">
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
          <span className="text-sm text-paper-ink">{confidence.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 flex-1 max-w-[140px] overflow-hidden rounded-full bg-[#e2d9c2]">
          <div
            className={`h-full rounded-full ${isFake ? "bg-amber" : "bg-teal"}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Verdict stamp */}
      <div
        className={`stamp-appear pointer-events-none absolute right-5 top-16 select-none rounded-md border-[3px] px-3 py-1 font-display text-lg font-bold uppercase tracking-wider sm:right-8 sm:top-20 sm:px-4 sm:py-1.5 sm:text-2xl ${
          isFake
            ? "border-amber text-amber"
            : "border-teal text-teal"
        }`}
        style={{ transform: "rotate(-8deg)" }}
      >
        <span className="flex items-center gap-2">
          {isFake ? <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" /> : <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />}
          {isFake ? "Flagged" : "Verified"}
        </span>
      </div>
    </div>
  );
}
