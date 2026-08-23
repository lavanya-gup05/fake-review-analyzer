"""
predict.py

Single-review inference. Designed to be called as a subprocess from the
Next.js API route: it reads one JSON object from stdin, prints exactly one
JSON object to stdout, and exits. Keeping the contract that narrow makes it
trivial to call from Node's child_process without a fragile parsing layer.

Input (stdin):  {"reviewText": "...", "productName": "...", "productType": "..."}
Output (stdout): {
  "prediction": "Likely Fake Review" | "Likely Genuine Review",
  "label": 0 | 1,
  "confidence": 0-100,
  "riskLevel": "low" | "medium" | "high",
  "topFeatures": [{"term": "...", "contribution": float, "direction": "fake"|"genuine"}, ...],
  "explanation": "..."
}
"""

import json
import sys

import joblib
import numpy as np
from scipy.sparse import hstack, csr_matrix

from preprocess import preprocess

MODELS_DIR = "models"


def load_artifacts():
    vectorizer = joblib.load(f"{MODELS_DIR}/vectorizer.pkl")
    model = joblib.load(f"{MODELS_DIR}/model.pkl")
    try:
        type_encoder = joblib.load(f"{MODELS_DIR}/type_encoder.pkl")
    except FileNotFoundError:
        type_encoder = None  # older model trained before product_type support
    try:
        with open(f"{MODELS_DIR}/stem_map.json") as f:
            stem_map = json.load(f)
    except FileNotFoundError:
        stem_map = {}
    return vectorizer, model, type_encoder, stem_map


def display_term(term, stem_map):
    """Convert a (possibly stemmed, possibly bigram) vocabulary term into a
    reader-friendly phrase using the stem->original-word map. Category dummy
    columns (e.g. 'product_type=Electronics') are left as-is."""
    if term.startswith("product_type="):
        return term.split("=", 1)[1] + " category"
    return " ".join(stem_map.get(w, w) for w in term.split())


def get_probability_and_coefs(model, X):
    """Return (proba_fake, per-feature coefficient vector) regardless of
    whether the deployed model is LogisticRegression, MultinomialNB, or a
    CalibratedClassifierCV wrapping LinearSVC — each exposes probabilities
    differently."""
    proba = model.predict_proba(X)[0]
    # class order is [0, 1] = [genuine, fake] since labels are 0/1 and sklearn sorts classes
    proba_fake = float(proba[1])

    # Try to get a linear coefficient vector for explainability. Not all
    # wrapped models expose this identically, so we fall back gracefully.
    coefs = None
    if hasattr(model, "coef_"):
        coefs = model.coef_[0]
    elif hasattr(model, "calibrated_classifiers_"):
        try:
            coefs = model.calibrated_classifiers_[0].estimator.coef_[0]
        except Exception:
            coefs = None
    elif hasattr(model, "feature_log_prob_"):
        # Naive Bayes: log P(word|fake) - log P(word|genuine) approximates a "coefficient"
        coefs = model.feature_log_prob_[1] - model.feature_log_prob_[0]

    return proba_fake, coefs


def explain(feature_names, coefs, X_row, predicted_label, stem_map, top_k=5):
    """Find which features (words, phrases, or the product-type category)
    actually present in this review contributed most to the predicted class,
    using feature_value * coefficient as the contribution score. Returns a
    list of {term, contribution, direction} plus a plain-English explanation
    string."""
    if coefs is None:
        return [], "The selected model does not expose per-word weights, so a detailed explanation is unavailable for this prediction."

    row = X_row.toarray()[0]
    nonzero_idx = np.nonzero(row)[0]

    contributions = []
    for idx in nonzero_idx:
        contribution = row[idx] * coefs[idx]
        contributions.append((feature_names[idx], contribution))

    # Sort by how strongly each term pushed toward the PREDICTED class
    if predicted_label == 1:  # fake
        contributions.sort(key=lambda x: x[1], reverse=True)
        direction = "fake"
    else:
        contributions.sort(key=lambda x: x[1])
        direction = "genuine"

    top = [c for c in contributions if (c[1] > 0 if predicted_label == 1 else c[1] < 0)][:top_k]

    top_features = [
        {"term": display_term(term, stem_map), "contribution": round(float(val), 4), "direction": direction}
        for term, val in top
    ]

    if not top_features:
        explanation = (
            "No single word or phrase stood out strongly; the prediction is based on the "
            "overall balance of subtle patterns across the review rather than a few dominant terms."
        )
    else:
        terms_readable = ", ".join(f"\u201c{t['term']}\u201d" for t in top_features[:4])
        if direction == "fake":
            explanation = (
                f"The review leans toward promotional and generic language. Terms such as "
                f"{terms_readable} are strongly associated with deceptive or incentivized "
                f"reviews in the training data \u2014 overly enthusiastic phrasing, superlatives, "
                f"and low product-specific detail."
            )
        else:
            explanation = (
                f"The review shows the specific, measured language typical of genuine "
                f"experiences. Terms such as {terms_readable} are associated with authentic "
                f"reviews in the training data \u2014 concrete details, mixed sentiment, and "
                f"qualified statements rather than blanket praise."
            )

    return top_features, explanation


def main():
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)

    review_text = (payload.get("reviewText") or "").strip()
    if not review_text:
        print(json.dumps({"error": "reviewText is required"}))
        sys.exit(1)

    product_type = (payload.get("productType") or "").strip()

    vectorizer, model, type_encoder, stem_map = load_artifacts()

    clean = preprocess(review_text)
    X_text = vectorizer.transform([clean])

    if type_encoder is not None:
        X_cat = type_encoder.transform(np.array([[product_type]]))
        X = hstack([X_text, csr_matrix(X_cat)]).tocsr()
        feature_names = np.concatenate([
            vectorizer.get_feature_names_out(),
            [f"product_type={c}" for c in type_encoder.categories_[0]],
        ])
    else:
        # Backward compatibility: model was trained before product_type support.
        X = X_text
        feature_names = vectorizer.get_feature_names_out()

    proba_fake, coefs = get_probability_and_coefs(model, X)
    predicted_label = 1 if proba_fake >= 0.5 else 0
    confidence = proba_fake if predicted_label == 1 else (1 - proba_fake)
    confidence_pct = round(confidence * 100, 1)

    if confidence_pct >= 85:
        risk_level = "high" if predicted_label == 1 else "low"
    elif confidence_pct >= 65:
        risk_level = "medium"
    else:
        risk_level = "medium"

    top_features, explanation = explain(feature_names, coefs, X, predicted_label, stem_map)

    result = {
        "prediction": "Likely Fake Review" if predicted_label == 1 else "Likely Genuine Review",
        "label": predicted_label,
        "confidence": confidence_pct,
        "riskLevel": risk_level,
        "topFeatures": top_features,
        "explanation": explanation,
        "wordCount": len(review_text.split()),
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
