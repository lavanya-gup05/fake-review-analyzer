import Link from "next/link";
import { ArrowRight, FileSearch, Percent, MessageSquareText, Layers } from "lucide-react";
import ExhibitCard from "@/components/ExhibitCard";

const DEMO_REVIEW =
  "Absolutely LOVE this product!!! Best purchase ever, highly recommend to everyone, five stars all the way, you will not regret it!!!";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Textual pattern detection",
    body: "TF-IDF features feed a trained classifier that picks up on promotional phrasing, superlative overload, and generic praise — not just keyword blacklists.",
  },
  {
    icon: Percent,
    title: "Confidence scoring",
    body: "Every verdict ships with a probability, not just a label, so you can see how strongly the model leans one way.",
  },
  {
    icon: MessageSquareText,
    title: "Plain-language explanation",
    body: "The specific words and phrases that moved the prediction are surfaced and highlighted directly in the review text.",
  },
  {
    icon: Layers,
    title: "Full-stack, not a notebook",
    body: "A Next.js interface, an API layer, and a Python ML service work together end to end — the way a real product would.",
  },
];

const EXAMPLES = [
  {
    verdict: "genuine" as const,
    confidence: 91.4,
    productName: "Ceramic Non-stick Pan",
    productType: "Kitchen",
    text: "The coating has held up fine after about a month of near-daily use, though the handle gets a little warm on high heat. Sizing is accurate to the listing. Would recommend for the price, but not for heavy commercial use.",
    features: ["though", "month", "price"],
  },
  {
    verdict: "fake" as const,
    confidence: 96.8,
    productName: "Wireless Earbuds Pro",
    productType: "Electronics",
    text: "Best earbuds I have EVER purchased in my life!!! Incredible quality, incredible sound, incredible everything, highly recommend to everyone, five stars, buy it now!!!",
    features: ["incredible", "highly recommend", "everyone"],
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div>
            <span className="inline-block rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-ink-muted">
              NLP · Machine Learning · Next.js
            </span>
            <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] tracking-tight sm:text-[3.4rem]">
              Every review leaves a
              <span className="italic text-amber"> paper trail.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-muted">
              Evident reads a product review the way an examiner reads a document —
              looking for the linguistic tells of promotional, incentivized, or
              bot-written text, and showing its work.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/analyzer"
                className="group inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 font-mono text-sm uppercase tracking-wide text-[#1c1305] transition-transform hover:scale-[1.03]"
              >
                Analyze a review
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/how-it-works"
                className="font-mono text-sm uppercase tracking-wide text-ink-muted underline decoration-line underline-offset-4 hover:text-[#ece7db]"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-amber/10 via-transparent to-teal/10 blur-2xl" />
            <ExhibitCard
              reviewText={DEMO_REVIEW}
              productName="Wireless Earbuds Pro"
              productType="Electronics"
              verdict="fake"
              confidence={96.8}
              topFeatures={[
                { term: "highly recommend", contribution: 0.4, direction: "fake" },
                { term: "incredible", contribution: 0.4, direction: "fake" },
                { term: "everyone", contribution: 0.3, direction: "fake" },
              ]}
              showScanline
              caseNumber="0417"
            />
          </div>
        </div>
      </section>

      {/* Problem framing */}
      <section className="border-y border-line bg-ink-800/40">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl">Why this matters</h2>
          <p className="mt-5 text-[16px] leading-relaxed text-ink-muted">
            Online reviews shape purchasing decisions more than almost any other
            piece of product information. When a meaningful share of them are
            paid, incentivized, or machine-generated, ratings stop reflecting
            real experience — misleading shoppers, propping up low-quality
            products, and eroding trust in the marketplace itself.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-muted">
            Evident approaches this narrowly and honestly: it analyzes the{" "}
            <em className="text-[#ece7db] not-italic">textual characteristics</em>{" "}
            of a review — phrasing, specificity, sentiment balance — and reports
            a probability, not a verdict of fact. It cannot confirm someone was
            paid or that an account is a bot; that requires data this system
            doesn&rsquo;t have access to.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="font-display text-2xl sm:text-3xl">What it does</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-ink-800 p-6 transition-colors hover:border-amber/40"
            >
              <Icon className="h-5 w-5 text-amber" strokeWidth={1.75} />
              <h3 className="mt-4 font-display text-lg">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example exhibits */}
      <section className="border-t border-line bg-ink-800/40">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl">Two exhibits, side by side</h2>
          <p className="mt-3 max-w-2xl text-[15px] text-ink-muted">
            The same model, examining two different reviews. Highlighted terms are
            the words that moved the prediction most.
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {EXAMPLES.map((ex) => (
              <ExhibitCard
                key={ex.productName}
                reviewText={ex.text}
                productName={ex.productName}
                productType={ex.productType}
                verdict={ex.verdict}
                confidence={ex.confidence}
                topFeatures={ex.features.map((t) => ({
                  term: t,
                  contribution: 0.3,
                  direction: ex.verdict,
                }))}
                caseNumber={ex.verdict === "fake" ? "0288" : "0112"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8">
        <h2 className="font-display text-2xl sm:text-3xl">Try it on a review of your own</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-muted">
          Paste a real or made-up review and see the model&rsquo;s reasoning in real time.
        </p>
        <Link
          href="/analyzer"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 font-mono text-sm uppercase tracking-wide text-[#1c1305] transition-transform hover:scale-[1.03]"
        >
          Open the analyzer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
