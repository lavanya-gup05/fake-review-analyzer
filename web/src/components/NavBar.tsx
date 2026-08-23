"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl tracking-tight text-[#ece7db]"
          onClick={() => setOpen(false)}
        >
          <ScanSearch className="h-6 w-6 text-amber" strokeWidth={1.75} />
          <span>
            EVIDENT<span className="text-amber">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 font-mono text-[13px] uppercase tracking-wide transition-colors ${
                  active
                    ? "bg-ink-800 text-amber"
                    : "text-ink-muted hover:text-[#ece7db]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/analyzer"
          className="hidden rounded-full bg-amber px-4 py-2 font-mono text-[13px] uppercase tracking-wide text-[#1c1305] transition-transform hover:scale-[1.03] sm:block"
        >
          Analyze a review
        </Link>

        <button
          className="text-[#ece7db] sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-line px-5 py-3 sm:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-3 font-mono text-sm uppercase tracking-wide ${
                pathname === link.href
                  ? "text-amber"
                  : "text-ink-muted hover:text-[#ece7db]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
