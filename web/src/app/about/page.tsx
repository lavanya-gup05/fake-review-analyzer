"use client";

import { useState } from "react";
import {
  GitBranch,
  Mail,
  FileText,
  Sparkles,
  Fingerprint,
  Layers,
  Database,
  ShieldAlert,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

const STACK = [
  { group: "Frontend", items: ["Next.js (App Router)", "React", "TypeScript", "Tailwind CSS"] },
  { group: "ML / NLP", items: ["Python", "scikit-learn", "NLTK (Porter stemmer)", "TF-IDF"] },
  { group: "Models compared", items: ["Logistic Regression", "Multinomial Naive Bayes", "Linear SVM"] },
  { group: "Bridge", items: ["Next.js API Route", "Node child_process → Python subprocess"] },
];

const LIMITATIONS = [
  {
    title: "Trained on synthetic data",
    body: "Real deceptive-review datasets are small, narrow (often hotel reviews only), or not freely downloadable. This project generates thousands of reviews from linguistically-motivated templates instead. That makes the class boundary cleaner than in the real world — hence the near-perfect test scores on the How It Works page — but it also means the model has learned this project's idea of 'fake-sounding' language, not necessarily every real deceptive reviewer's style.",
  },
  {
    title: "Style detection, not fact-checking",
    body: "The system cannot confirm someone was paid, that an account is a bot, or that a review is a duplicate of another listing. Those require account activity, transaction history, and cross-listing data this system doesn't have access to.",
  },
  {
    title: "Confidence is a model score, not a guarantee",
    body: "The confidence percentage comes from the classifier's probability estimate. It reflects how strongly the text matches learned patterns, not a certified truth value.",
  },
  {
    title: "English, single-review analysis",
    body: "The current model doesn't handle multilingual reviews and evaluates one review in isolation, without comparing it against other reviews for the same product or account.",
  },
];

const FUTURE = [
  "Train on a real, well-vetted deceptive-review corpus alongside the synthetic set",
  "Transformer-based classification (e.g. BERT) for messier, real-world phrasing",
  "Duplicate and near-duplicate review detection across a product's review set",
  "Multilingual review support",
  "Review-account behavioral signals (posting frequency, verified purchase status)",
  "Sentiment analysis as a complementary signal",
  "Persisted analysis history (MongoDB) for tracking predictions over time",
];

const DEVELOPERS = [
  {
    name: "Dhairya",
    role: "Full-Stack Developer",
    age: 22,
    branch: "Information Technology",
    college: "Dr. Akhilesh Das Gupta Institute of Professional Studies",
    bio: "Passionate about building scalable web applications and exploring system architecture.",
    contribution: "Architected the Next.js frontend, UI/UX, and bridged the Python ML backend via Node subprocesses.",
    stack: ["Next.js", "React", "Python", "Tailwind CSS"],
    github: "https://github.com/CodeDhairya100",
    linkedin: "https://www.linkedin.com/in/dhairya-gupta-3a8163294/",
    resume: "/devResume/Dhairya-AI.pdf",
    email: "mailto:dhairyaprofilo@gmail.com",
    image: "/aboutPics/2.png",
  },
  {
    name: "Lavanya Gupta",
    role: "AI-ML / Data Analyst",
    age: 21,
    branch: "Information Technology",
    college: "Dr. Akhilesh Das Gupta Institute of Professional Studies",
    bio: "Driven by data science, specializing in predictive modeling and natural language processing.",
    contribution: "Developed the synthetic dataset logic, feature extraction, and trained the NLP classification models.",
    stack: ["Python", "scikit-learn", "Numpy & Pandas", "Data Science"],
    github: "https://github.com/lavanya-gup05",
    linkedin: "https://www.linkedin.com/in/lavanya-gupta-206132298/",
    resume: "/devResume/lavanya.pdf",
    email: "mailto:lavanyaprofilo@gmail.com",
    image: "/aboutPics/1.png",
  },
];

/* ---------------------------------------------------------------- */
/* Section header with an animated accent bar                        */
/* ---------------------------------------------------------------- */
function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <h2 className="section-heading group flex items-center gap-2.5 font-display text-xl">
      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-ink-800 text-amber transition-all duration-300 group-hover:border-amber/50 group-hover:shadow-[0_0_14px_-3px_rgba(230,161,58,0.5)]">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      {children}
      <span className="section-heading-bar ml-2 h-px flex-1 bg-line" />
    </h2>
  );
}

/* ---------------------------------------------------------------- */
/* Developer flip card                                               */
/* ---------------------------------------------------------------- */
function DeveloperCard({ dev, index }: { dev: (typeof DEVELOPERS)[0]; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="dev-card-enter relative h-[480px] w-full cursor-pointer [perspective:1200px]"
      style={{ animationDelay: `${index * 120}ms` }}
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setIsFlipped(!isFlipped);
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${dev.name} — ${isFlipped ? "showing details, press to flip back" : "press to see details"}`}
    >
      <div
        className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : "dev-card-idle"
        }`}
      >
        {/* FRONT FACE */}
        <div className="dev-card-face absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-line bg-ink-800 p-6 text-center [backface-visibility:hidden]">
          <div className="dev-card-shine pointer-events-none absolute inset-0" />

          <div className="dev-avatar-float relative mb-4 h-28 w-28 shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber via-transparent to-teal opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60" />
            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-amber/30 bg-ink-900 transition-transform duration-500 hover:scale-105">
              <img
                src={dev.image}
                alt={`${dev.name} Picture`}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/initials/svg?seed=${dev.name}&backgroundColor=111827&textColor=fbbf24`;
                }}
              />
            </div>
          </div>

          <h3 className="font-display text-2xl">{dev.name}</h3>
          <p className="relative mt-1 inline-block font-mono text-[10px] uppercase tracking-widest text-teal">
            {dev.role}
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-teal transition-transform duration-500 [.group:hover_&]:scale-x-100" />
          </p>

          <div className="mt-4 space-y-1 text-sm text-ink-muted">
            <p className="font-medium text-white">{dev.branch}</p>
            <p className="px-2 text-xs leading-relaxed">{dev.college}</p>
          </div>

          <div className="mt-5">
            <a
              href={dev.resume}
              target="_blank"
              rel="noreferrer"
              className="group/btn inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-ink-900 px-5 py-2 text-xs text-white transition-all duration-300 hover:border-teal hover:bg-teal hover:text-ink-900 hover:shadow-[0_0_18px_-4px_rgba(63,168,138,0.7)]"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:-translate-y-0.5" />
              View Resume
            </a>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-4 font-mono text-[11px] uppercase tracking-wide text-ink-muted/70">
            <span className="tap-pulse">Tap for details</span>
            <ArrowUpRight className="h-3.5 w-3.5 rotate-45 transition-transform duration-300 [.group:hover_&]:rotate-90" />
          </div>
        </div>

        {/* BACK FACE */}
        <div className="dev-card-face absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-amber/25 bg-ink-800 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber/10 blur-3xl" />

          <h3 className="relative border-b border-line pb-3 font-display text-xl text-amber">
            {dev.name} <span className="text-ink-muted">&mdash;</span> Details
          </h3>

          <div className="dev-scrollbar relative mt-4 flex-grow space-y-4 overflow-y-auto pr-1 text-[14px] text-ink-muted">
            <p>
              <strong className="font-medium text-white">Age:</strong> {dev.age}
            </p>
            <p>
              <strong className="font-medium text-white">Bio:</strong> {dev.bio}
            </p>
            <p>
              <strong className="font-medium text-white">Project Contribution:</strong> {dev.contribution}
            </p>

            <div className="pt-2">
              <span className="mb-2 block font-medium text-white">Tech Stack:</span>
              <div className="flex flex-wrap gap-2">
                {dev.stack.map((tech, i) => (
                  <span
                    key={tech}
                    className="tag-pop rounded-md border border-teal/20 bg-ink-900 px-2 py-1 font-mono text-[10px] text-teal transition-all duration-300 hover:-translate-y-0.5 hover:border-teal/60 hover:shadow-[0_0_10px_-2px_rgba(63,168,138,0.6)]"
                    style={{ animationDelay: `${i * 80 + 300}ms` }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-4 grid shrink-0 grid-cols-3 gap-3 border-t border-line pt-4">
            <a 
              href={dev.github}
              target="_blank"
              rel="noreferrer"
              aria-label={`${dev.name} on GitHub`}
              className="flex items-center justify-center gap-1.5 rounded bg-ink-900 py-2 text-xs text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-700 hover:text-amber"
              onClick={(e) => e.stopPropagation()}
            >
              <GitBranch className="h-3.5 w-3.5" /> GitHub
            </a>
            <a
              href={dev.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${dev.name} on LinkedIn`}
              className="flex items-center justify-center gap-1.5 rounded bg-ink-900 py-2 text-xs text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-700 hover:text-teal"
              onClick={(e) => e.stopPropagation()}
            >
              <FaLinkedin className="h-3.5 w-3.5" aria-hidden="true" />
              LinkedIn
            </a>
            <a
              href={dev.email}
              aria-label={`Email ${dev.name}`}
              className="flex items-center justify-center gap-1.5 rounded bg-ink-900 py-2 text-xs text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-700 hover:text-[#ece7db]"
              onClick={(e) => e.stopPropagation()}
          >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Page                                                               */
/* ---------------------------------------------------------------- */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <span className="fade-up inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
        <Sparkles className="h-3 w-3 text-amber" />
        About this project
      </span>
      <h1 className="fade-up mt-3 font-display text-3xl sm:text-4xl" style={{ animationDelay: "80ms" }}>
        Objective, stack, and honest limits
      </h1>

      <section className="fade-up mt-10" style={{ animationDelay: "140ms" }}>
        <SectionHeading icon={Compass}>Objective</SectionHeading>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          To develop a full-stack, machine-learning-based web application using Natural Language
          Processing that classifies product reviews as likely genuine or potentially fake based
          on their textual characteristics — demonstrating the practical integration of NLP, ML,
          API development, and modern web development.
        </p>
      </section>

      <section className="fade-up mt-14" style={{ animationDelay: "200ms" }}>
        <SectionHeading icon={Fingerprint}>The Developers</SectionHeading>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {DEVELOPERS.map((dev, i) => (
            <DeveloperCard key={dev.name} dev={dev} index={i} />
          ))}
        </div>
      </section>

      <section className="fade-up mt-14" style={{ animationDelay: "260ms" }}>
        <SectionHeading icon={Layers}>Technology stack</SectionHeading>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {STACK.map((s, i) => (
            <div
              key={s.group}
              className="stack-card-enter group rounded-xl border border-line bg-ink-800 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-amber/40 hover:shadow-[0_16px_40px_-20px_rgba(230,161,58,0.35)]"
              style={{ animationDelay: `${320 + i * 90}ms` }}
            >
              <h3 className="font-mono text-xs uppercase tracking-widest text-amber transition-colors duration-300">
                {s.group}
              </h3>
              <ul className="mt-3 space-y-1.5 text-[14px] text-ink-muted">
                {s.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#ece7db]"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-line transition-colors duration-300 group-hover:bg-amber" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="fade-up mt-14" style={{ animationDelay: "320ms" }}>
        <SectionHeading icon={Database}>Dataset</SectionHeading>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          6,000 synthetic reviews (3,000 genuine / 3,000 fake) spanning eight product categories,
          generated compositionally from sentence pools that encode documented style differences
          between genuine reviews (specific detail, mixed sentiment, measured tone) and deceptive
          ones (superlatives, generic praise, promotional urgency, repetition). See{" "}
          <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono text-xs text-teal transition-colors duration-300 hover:bg-ink-700">
            ml/generate_dataset.py
          </code>{" "}
          for the exact generation logic.
        </p>
      </section>

      <section className="fade-up mt-14" style={{ animationDelay: "380ms" }}>
        <SectionHeading icon={ShieldAlert}>Limitations</SectionHeading>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {LIMITATIONS.map((l, i) => (
            <div
              key={l.title}
              className="limitation-card group relative border-l-2 border-amber/40 pl-5 transition-all duration-300 hover:border-amber"
              style={{ animationDelay: `${420 + i * 80}ms` }}
            >
              <div className="absolute inset-0 -left-px rounded-r-lg bg-amber/0 transition-colors duration-300 group-hover:bg-amber/5" />
              <h3 className="relative font-display text-base transition-colors duration-300 group-hover:text-amber">
                {l.title}
              </h3>
              <p className="relative mt-1.5 text-[14px] leading-relaxed text-ink-muted">{l.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="fade-up mt-14 mb-4" style={{ animationDelay: "440ms" }}>
        <SectionHeading icon={Compass}>Future scope</SectionHeading>
        <ul className="mt-5 grid gap-x-6 gap-y-2.5 text-[15px] text-ink-muted sm:grid-cols-2">
          {FUTURE.map((f) => (
            <li
              key={f}
              className="group flex items-center gap-2.5 transition-all duration-300 hover:translate-x-1 hover:text-[#ece7db]"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-teal transition-all duration-300 group-hover:h-2 group-hover:w-2 group-hover:shadow-[0_0_8px_1px_rgba(63,168,138,0.7)]" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      <style jsx global>{`
        @keyframes fade-up-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-up {
          opacity: 0;
          animation: fade-up-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .section-heading-bar {
          transition: background-color 0.3s ease;
        }
        .section-heading:hover .section-heading-bar {
          background: linear-gradient(90deg, var(--signal-amber), transparent);
        }

        @keyframes card-drop-in {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .dev-card-enter {
          opacity: 0;
          animation: card-drop-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes float-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .dev-avatar-float {
          animation: float-idle 4.5s ease-in-out infinite;
        }

        .dev-card-face {
          transition: box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .dev-card-face:hover {
          box-shadow: 0 20px 45px -25px rgba(230, 161, 58, 0.35);
          border-color: rgba(230, 161, 58, 0.35);
        }

        .dev-card-shine {
          background: linear-gradient(
            120deg,
            transparent 30%,
            rgba(255, 255, 255, 0.06) 45%,
            rgba(255, 255, 255, 0.02) 50%,
            transparent 65%
          );
          background-size: 250% 250%;
          background-position: 200% 0;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .dev-card-face:hover .dev-card-shine {
          opacity: 1;
          animation: shine-sweep 1.4s ease forwards;
        }
        @keyframes shine-sweep {
          from { background-position: 200% 0; }
          to { background-position: -50% 0; }
        }

        @keyframes tap-pulse-fade {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .tap-pulse {
          animation: tap-pulse-fade 2s ease-in-out infinite;
        }

        @keyframes tag-pop-in {
          from { opacity: 0; transform: translateY(6px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tag-pop {
          opacity: 0;
          animation: tag-pop-in 0.4s ease forwards;
        }

        .dev-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .dev-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .dev-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(230, 161, 58, 0.3);
          border-radius: 999px;
        }
        .dev-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(230, 161, 58, 0.55);
        }

        @keyframes stack-card-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stack-card-enter {
          opacity: 0;
          animation: stack-card-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .limitation-card {
          opacity: 0;
          animation: fade-up-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-up, .dev-card-enter, .stack-card-enter, .limitation-card, .tag-pop {
            opacity: 1;
            animation: none;
          }
          .dev-avatar-float, .tap-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
