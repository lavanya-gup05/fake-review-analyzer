import { readMetrics } from "@/lib/metrics";
import { Database, SprayCan, Hash, Cpu, Gauge } from "lucide-react";
import HowItWorksView from "@/components/HowItWorksView";

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

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-xs text-ink-muted">
        <span className="uppercase tracking-widest">{label}</span>
        <span className="text-[#ece7db]">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full rounded-full bg-amber" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const report = readMetrics();
  return <HowItWorksView report={report} />;
}
