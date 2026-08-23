import fs from "fs";
import path from "path";

export type ModelMetrics = {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusion_matrix: number[][];
};

export type MetricsReport = {
  model_selected: string;
  dataset_size: number;
  train_size: number;
  test_size: number;
  vocabulary_size: number;
  metrics: Record<string, ModelMetrics>;
  top_terms: {
    fake_indicators: { term: string; weight: number }[];
    genuine_indicators: { term: string; weight: number }[];
  };
};

const METRICS_PATH = path.join(process.cwd(), "..", "ml", "models", "metrics.json");

export function readMetrics(): MetricsReport | null {
  try {
    const raw = fs.readFileSync(METRICS_PATH, "utf-8");
    return JSON.parse(raw) as MetricsReport;
  } catch {
    return null;
  }
}
