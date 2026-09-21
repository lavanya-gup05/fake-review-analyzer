"use client";

import { useEffect, useState } from "react";
import { Database, SprayCan, Hash, Cpu, Gauge } from "lucide-react";
import Reveal from "@/components/Reveal";
import type { MetricsReport } from "@/lib/metrics";

const STEPS = [
  {
    icon: Database,
    title: "Dataset",
    body:
      "The model trains on a labelled set of product reviews, each tagged genuine (0) or fake (1). This project uses a synthetic dataset generated from linguistically-motivated templates — see Limitations on the About page for what that trade-off means.",
  },
  {
    icon: SprayCan,
    title: "NLP preprocessing",
    body:
      "Each review is lowercased, stripped of URLs/HTML/symbols, tokenized, filtered against a stopword list, and stemmed (Porter stemmer) so that 'recommend', 'recommends', and 'recommended' collapse to one signal.",
  },
  {
    icon: Hash,
    title: "TF-IDF feature extraction",
    body:
      "Cleaned text is converted into numeric features with TF-IDF over unigrams and bigrams, so both single words ('amazing') and short phrases ('highly recommend') can carry weight.",
  },
  {
    icon: Cpu,
    title: "Model training & selection",
    body:
      "Logistic Regression, Multinomial Naive Bayes, and a calibrated Linear SVM are trained and evaluated on a held-out test split. The deployed model is chosen for the best balance of F1-score and interpretability.",
  },
  {
    icon: Gauge,
    title: "Prediction & explanation",
    body:
      "For a new review, the same pipeline runs, the model outputs a probability, and the words that contributed most (tfidf value × model coefficient) are surfaced as the explanation.",
  },
];

function MetricBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value * 100), 150 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-xs text-ink-muted">
        <span className="uppercase tracking-widest">{label}</span>
        <span className="tabular-nums text-[#ece7db]">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full bg-amber transition-[width] duration-[900ms] ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function HowItWorksView({ report }: { report: MetricsReport | null }) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <Reveal>
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Methodology</span>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">The pipeline, step by step</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          A review makes this exact five-step trip, in this order, every time — from raw text
          typed into the analyzer to a verdict on screen.
        </p>
      </Reveal>

      <ol className="mt-12 space-y-8 border-l border-line pl-8">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 90}>
            <li className="step-item group relative">
              <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full border border-line bg-ink-900 font-mono text-xs text-amber transition-all duration-300 group-hover:border-amber/60 group-hover:shadow-[0_0_14px_-3px_rgba(230,161,58,0.6)]">
                {i + 1}
              </span>
              <div className="flex items-center gap-2">
                <step.icon
                  className="h-4 w-4 text-amber transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={1.75}
                />
                <h2 className="font-display text-xl">{step.title}</h2>
              </div>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{step.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>

      {report ? (
        <>
          <Reveal>
            <section className="mt-16">
              <h2 className="font-display text-2xl">Model comparison</h2>
              <p className="mt-2 text-[15px] text-ink-muted">
                Trained on {report.dataset_size.toLocaleString()} reviews ({report.train_size.toLocaleString()} train
                / {report.test_size.toLocaleString()} test), with a {report.vocabulary_size.toLocaleString()}-term
                TF-IDF vocabulary. Deployed model:{" "}
                <span className="font-mono text-amber">{report.model_selected.replace(/_/g, " ")}</span>.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {Object.entries(report.metrics).map(([name, m], i) => {
                  const selected = name === report.model_selected;
                  return (
                    <div
                      key={name}
                      className={`rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
                        selected
                          ? "selected-model border-amber/50 bg-amber/5 hover:shadow-[0_20px_45px_-25px_rgba(230,161,58,0.5)]"
                          : "border-line bg-ink-800 hover:border-amber/30 hover:shadow-[0_20px_45px_-25px_rgba(230,161,58,0.25)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-mono text-sm uppercase tracking-wide text-[#ece7db]">
                          {name.replace(/_/g, " ")}
                        </h3>
                        {selected && (
                          <span className="rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber">
                            Deployed
                          </span>
                        )}
                      </div>
                      <div className="mt-4 space-y-3">
                        <MetricBar label="Accuracy" value={m.accuracy} delay={i * 60} />
                        <MetricBar label="Precision" value={m.precision} delay={i * 60 + 40} />
                        <MetricBar label="Recall" value={m.recall} delay={i * 60 + 80} />
                        <MetricBar label="F1" value={m.f1} delay={i * 60 + 120} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-ink-muted">
                All three models score near-perfectly here because the synthetic training data has
                cleanly separable style patterns by construction. Real-world review text would show
                lower and more differentiated scores across models — see the About page.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section className="mt-16">
              <h2 className="font-display text-2xl">What the model learned to look for</h2>
              <p className="mt-2 max-w-2xl text-[15px] text-ink-muted">
                These are the terms with the strongest learned association with each class, drawn
                directly from the trained Logistic Regression coefficients.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-amber/30 bg-ink-800 p-6 transition-all duration-300 hover:border-amber/60 hover:shadow-[0_20px_45px_-25px_rgba(230,161,58,0.35)]">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-amber">Fake indicators</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.top_terms.fake_indicators.slice(0, 14).map((t, i) => (
                      <span
                        key={t.term}
                        className="term-chip rounded-full border border-amber/40 px-3 py-1 font-mono text-xs text-amber transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber/10"
                        style={{ animationDelay: `${i * 45}ms` }}
                      >
                        {t.term}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-teal/30 bg-ink-800 p-6 transition-all duration-300 hover:border-teal/60 hover:shadow-[0_20px_45px_-25px_rgba(63,168,138,0.35)]">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-teal">Genuine indicators</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.top_terms.genuine_indicators.slice(0, 14).map((t, i) => (
                      <span
                        key={t.term}
                        className="term-chip rounded-full border border-teal/40 px-3 py-1 font-mono text-xs text-teal transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal/10"
                        style={{ animationDelay: `${i * 45}ms` }}
                      >
                        {t.term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </Reveal>
        </>
      ) : (
        <Reveal>
          <div className="mt-16 rounded-2xl border border-amber/40 bg-amber/10 p-6 text-sm text-[#f0d9ae]">
            Model metrics aren&rsquo;t available yet. Run{" "}
            <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono">python3 train.py</code> inside the{" "}
            <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono">ml/</code> folder to generate them.
          </div>
        </Reveal>
      )}

      <style jsx global>{`
        @keyframes selected-glow-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(230, 161, 58, 0); }
          50% { box-shadow: 0 0 0 6px rgba(230, 161, 58, 0.08); }
        }
        .selected-model {
          animation: selected-glow-pulse 3s ease-in-out infinite;
        }

        @keyframes term-chip-in {
          from { opacity: 0; transform: translateY(6px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .term-chip {
          opacity: 0;
          animation: term-chip-in 0.4s ease forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .selected-model { animation: none; }
          .term-chip { opacity: 1; animation: none; }
        }
      `}</style>
    </div>
  );
}
