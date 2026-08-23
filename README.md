# Evident — ML-Based Fake Product Review Detection

A full-stack web application that classifies product reviews as **likely
genuine** or **likely fake** based on their textual characteristics, using
classical NLP + machine learning (TF-IDF + Logistic Regression, compared
against Naive Bayes and SVM) and a Next.js frontend.

```
project/
  ml/    Python: dataset generation, preprocessing, training, prediction
  web/   Next.js (TypeScript + Tailwind) frontend + API route
```

The two folders must stay **siblings** (both directly inside `project/`) —
the web app's API route calls the Python scripts using a relative path
(`../ml`), so if you move one without the other, update
`web/src/app/api/analyze/route.ts` and `web/src/lib/metrics.ts` accordingly.

---

## 1. Set up the ML pipeline

```bash
cd project/ml
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Generate the synthetic dataset (6,000 labelled reviews):

```bash
python3 generate_dataset.py
```

Train the models (trains Logistic Regression, Naive Bayes, and a calibrated
Linear SVM; evaluates all three; saves the best one plus a metrics report):

```bash
python3 train.py
```

This produces, inside `ml/models/`:
- `vectorizer.pkl` — the fitted TF-IDF vectorizer
- `model.pkl` — the selected classifier
- `stem_map.json` — stem → readable-word lookup, used for the explanation UI
- `metrics.json` — accuracy/precision/recall/F1 for all three models, shown
  on the site's **How It Works** page

Sanity-check inference directly, without the web app:

```bash
echo '{"reviewText": "OMG this product is AMAZING!!! Best purchase ever, highly recommend to everyone!!!"}' | python3 predict.py
```

You should see a JSON object with `"prediction": "Likely Fake Review"` and a
high confidence score.

**Keep the same Python environment active** (or note its path) — the Next.js
API route shells out to `python3` by default. If your Python lives at a
different path or under a different command (e.g. `python`), set the
`PYTHON_BIN` environment variable before starting the web app (see below).

## 2. Run the web app

```bash
cd project/web
npm install
npm run dev
```

Open **http://localhost:3000**. The Analyzer page will call `/api/analyze`,
which spawns `ml/predict.py` as a subprocess for each request.

If Python isn't on your `PATH` as `python3`:

```bash
PYTHON_BIN=python npm run dev        # macOS/Linux, if your command is `python`
# or point it at a venv directly:
PYTHON_BIN=/absolute/path/to/project/ml/venv/bin/python npm run dev
```

To build for production:

```bash
npm run build
npm run start
```

---

## Project pages

- **Home** — overview, live example, feature summary
- **Analyzer** — submit a review, get a verdict + confidence + explanation
- **How It Works** — the 5-step pipeline, model comparison table, and the
  actual top learned indicator terms (pulled live from `ml/models/metrics.json`)
- **About** — objective, tech stack, dataset notes, and a candid limitations
  section (read this before presenting — it explains why test accuracy is
  ~100% on the synthetic data and what that does/doesn't mean)

## Retraining or extending

- To change dataset size or add product categories: edit
  `ml/generate_dataset.py` and rerun `python3 generate_dataset.py && python3 train.py`.
- To swap in a real dataset: replace `ml/data/reviews.csv` with your own
  file using the same columns (`review_text, product_name, product_type,
  label`, where `label` is `0` for genuine / `1` for fake), then rerun
  `python3 train.py`.
- To change which model gets deployed: edit the selection logic at the
  bottom of `ml/train.py`.

## Known limitations (see also the in-app About page)

The training data is **synthetic** — generated from sentence templates
designed to encode documented style differences between genuine and
deceptive reviews, not scraped from a real marketplace. This is why the
held-out test accuracy is ~100%: the synthetic classes are cleanly
separable by construction. On real review text, expect lower and more
varied performance across models. Swapping in a real labelled dataset (see
above) is the natural next step before treating this as more than a
demonstration.
