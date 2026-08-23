"use client";

import Link from "next/link";
import { ArrowUp, Radio } from "lucide-react";

const LINKS = [
  { href: "/how-it-works", label: "Methodology" },
  { href: "/about", label: "Limitations" },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Footer() {
  return (
    <footer className="footer-shell relative border-t border-line">
      {/* animated hairline accent */}
      <div className="footer-glow-line pointer-events-none absolute inset-x-0 top-0 h-px" />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
          </span>
          <p className="font-mono text-xs uppercase tracking-wide transition-colors duration-300 hover:text-[#ece7db]">
            Evident — ML-based fake review detection
            <span className="mx-2 text-ink-muted/40">·</span>
            <span className="text-ink-muted/70">College minor project</span>
          </p>
        </div>

        <div className="flex items-center gap-7">
          <nav className="flex gap-6 font-mono text-xs uppercase tracking-wide">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="footer-link relative py-1 text-ink-muted transition-colors duration-300 hover:text-[#ece7db]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <span className="hidden h-4 w-px bg-line sm:block" />

          <div className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink-muted/60 sm:flex">
            <Radio className="h-3 w-3 text-teal" strokeWidth={2} />
            <span>Model live</span>
          </div>

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-ink-800 text-ink-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-amber/60 hover:text-amber hover:shadow-[0_0_16px_-2px_rgba(230,161,58,0.5)]"
          >
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .footer-glow-line {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(230, 161, 58, 0.35) 25%,
            rgba(63, 168, 138, 0.35) 50%,
            rgba(230, 161, 58, 0.35) 75%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: footer-shimmer 6s linear infinite;
        }

        @keyframes footer-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 1px;
          width: 100%;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.65, 0, 0.35, 1);
          opacity: 0.6;
        }

        .footer-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-glow-line {
            animation: none;
          }
        }
      `}</style>
    </footer>
  );
}