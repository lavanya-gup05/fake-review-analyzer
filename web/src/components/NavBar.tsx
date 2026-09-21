"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ScanSearch } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/analyzer", label: "Analyzer" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-ink-900/90 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "border-line shadow-[0_8px_30px_-20px_rgba(0,0,0,0.8)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="logo-link group flex items-center gap-2 font-display text-xl tracking-tight text-[#ece7db]"
          onClick={() => setOpen(false)}
        >
          <ScanSearch
            className="h-6 w-6 text-amber transition-transform duration-500 group-hover:rotate-[18deg] group-hover:scale-110"
            strokeWidth={1.75}
          />
          <span>
            EVIDENT<span className="logo-dot text-amber">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link relative rounded-full px-4 py-2 font-mono text-[13px] uppercase tracking-wide transition-colors duration-300 ${
                  active ? "bg-ink-800 text-amber" : "text-ink-muted hover:text-[#ece7db]"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber" />
                )}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/analyzer"
          className="analyze-cta group relative hidden overflow-hidden rounded-full bg-amber px-4 py-2 font-mono text-[13px] uppercase tracking-wide text-[#1c1305] transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_8px_24px_-6px_rgba(230,161,58,0.6)] sm:block"
        >
          <span className="cta-shine pointer-events-none absolute inset-0" />
          <span className="relative">Analyze a review</span>
        </Link>

        <button
          className="relative h-6 w-6 text-[#ece7db] transition-transform duration-300 active:scale-90 sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
          >
            <Menu className="h-6 w-6" />
          </span>
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
            }`}
          >
            <X className="h-6 w-6" />
          </span>
        </button>
      </div>

      <div
        className="mobile-menu grid overflow-hidden transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:hidden"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <nav className="flex flex-col border-t border-line px-5 py-3">
            {LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 font-mono text-sm uppercase tracking-wide transition-all duration-300 ${
                  pathname === link.href
                    ? "text-amber"
                    : "text-ink-muted hover:translate-x-1 hover:text-[#ece7db]"
                }`}
                style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <style jsx global>{`
        .logo-dot {
          display: inline-block;
          transition: transform 0.3s ease;
        }
        .logo-link:hover .logo-dot {
          transform: scale(1.4);
        }

        .nav-link::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: rgba(230, 161, 58, 0.08);
          opacity: 0;
          transform: scale(0.85);
          transition: opacity 0.25s ease, transform 0.25s ease;
          z-index: -1;
        }
        .nav-link:hover::before {
          opacity: 1;
          transform: scale(1);
        }

        .cta-shine {
          background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
          background-size: 250% 250%;
          background-position: 200% 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .analyze-cta:hover .cta-shine {
          opacity: 1;
          animation: nav-shine-sweep 0.9s ease forwards;
        }
        @keyframes nav-shine-sweep {
          from { background-position: 200% 0; }
          to { background-position: -50% 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mobile-menu { transition: none; }
          .cta-shine { animation: none !important; }
        }
      `}</style>
    </header>
  );
}
