"""
train.py

Loads the labelled review dataset, applies NLP preprocessing, extracts
TF-IDF features, trains three classical ML models (Logistic Regression,
Naive Bayes, Linear SVM), evaluates them on a held-out test split, and
saves the vectorizer + chosen model + metrics report to ml/models/.

Run: python3 train.py
"""

import json
import time

import joblib
import numpy as np
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import OneHotEncoder
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
)

from preprocess import preprocess, build_stem_display_map

DATA_PATH = "data/reviews.csv"
MODELS_DIR = "models"


def load_data():
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} reviews ({df['label'].sum()} fake / {len(df) - df['label'].sum()} genuine)")
    print("Preprocessing text...")
    t0 = time.time()
    df["clean_text"] = df["review_text"].apply(preprocess)
    print(f"  done in {time.time() - t0:.1f}s")
    return df


def evaluate(name, model, X_test, y_test):
    preds = model.predict(X_test)
    metrics = {
        "accuracy": round(accuracy_score(y_test, preds), 4),
        "precision": round(precision_score(y_test, preds), 4),
        "recall": round(recall_score(y_test, preds), 4),
        "f1": round(f1_score(y_test, preds), 4),
        "confusion_matrix": confusion_matrix(y_test, preds).tolist(),
    }
    print(f"\n[{name}]")
    print(classification_report(y_test, preds, target_names=["Genuine", "Fake"]))
    return metrics


def main():
    df = load_data()

    X_train_text, X_test_text, pt_train, pt_test, y_train, y_test = train_test_split(
        df["clean_text"], df["product_type"], df["label"],
        test_size=0.2, random_state=42, stratify=df["label"]
    )

    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),   # unigrams + bigrams capture phrases like "highly recommend"
        min_df=2,
        sublinear_tf=True,
    )
    X_train_tfidf = vectorizer.fit_transform(X_train_text)
    X_test_tfidf = vectorizer.transform(X_test_text)
    print(f"\nTF-IDF vocabulary size: {len(vectorizer.vocabulary_)}")

    # Product type is a categorical signal, not text — one-hot encode it and
    # concatenate onto the TF-IDF matrix so the model can weigh "this is an
    # Electronics review" alongside the words themselves.
    type_encoder = OneHotEncoder(handle_unknown="ignore")
    pt_train_enc = type_encoder.fit_transform(pt_train.to_numpy().reshape(-1, 1))
    pt_test_enc = type_encoder.transform(pt_test.to_numpy().reshape(-1, 1))
    print(f"Product type categories: {list(type_encoder.categories_[0])}")

    X_train = hstack([X_train_tfidf, csr_matrix(pt_train_enc)]).tocsr()
    X_test = hstack([X_test_tfidf, csr_matrix(pt_test_enc)]).tocsr()

    # Combined feature name list — text vocabulary followed by one category
    # dummy per product type, in the same column order as X_train/X_test.
    feature_names = np.concatenate([
        vectorizer.get_feature_names_out(),
        [f"product_type={c}" for c in type_encoder.categories_[0]],
    ])

    all_metrics = {}

    # --- Logistic Regression ---
    lr = LogisticRegression(max_iter=1000, C=1.0)
    lr.fit(X_train, y_train)
    all_metrics["logistic_regression"] = evaluate("Logistic Regression", lr, X_test, y_test)

    # --- Multinomial Naive Bayes ---
    nb = MultinomialNB()
    nb.fit(X_train, y_train)
    all_metrics["naive_bayes"] = evaluate("Naive Bayes", nb, X_test, y_test)

    # --- Linear SVM (calibrated so we get usable probability estimates) ---
    svm_base = LinearSVC(max_iter=5000)
    svm = CalibratedClassifierCV(svm_base, cv=3)
    svm.fit(X_train, y_train)
    all_metrics["svm"] = evaluate("Linear SVM (calibrated)", svm, X_test, y_test)

    # --- Model selection ---
    # We pick Logistic Regression as the deployed model whenever its F1 is
    # within 1 point of the best performer: it gives directly-interpretable
    # per-word coefficients (needed for the explainability feature) and
    # well-calibrated predict_proba out of the box, without the extra
    # calibration step SVM needs. If another model clearly outperforms it,
    # we defer to performance instead.
    best_name = max(all_metrics, key=lambda k: all_metrics[k]["f1"])
    best_f1 = all_metrics[best_name]["f1"]
    lr_f1 = all_metrics["logistic_regression"]["f1"]

    if best_name == "logistic_regression" or (best_f1 - lr_f1) <= 0.01:
        chosen_name, chosen_model = "logistic_regression", lr
    elif best_name == "svm":
        chosen_name, chosen_model = "svm", svm
    else:
        chosen_name, chosen_model = "naive_bayes", nb

    print(f"\n=> Selected model for deployment: {chosen_name} "
          f"(F1={all_metrics[chosen_name]['f1']}, best available F1={best_f1} from {best_name})")

    joblib.dump(vectorizer, f"{MODELS_DIR}/vectorizer.pkl")
    joblib.dump(type_encoder, f"{MODELS_DIR}/type_encoder.pkl")
    joblib.dump(chosen_model, f"{MODELS_DIR}/model.pkl")

    print("Building stem -> display word map...")
    stem_map = build_stem_display_map(df["review_text"])
    with open(f"{MODELS_DIR}/stem_map.json", "w") as f:
        json.dump(stem_map, f)

    # Save top global weighted terms per class for the "How it works" page,
    # using the Logistic Regression coefficients (interpretable regardless of
    # which model was deployed). This now includes product_type= entries
    # alongside text terms, since product_type is part of the feature space.
    coefs = lr.coef_[0]
    top_fake_idx = coefs.argsort()[-20:][::-1]
    top_genuine_idx = coefs.argsort()[:20]
    top_terms = {
        "fake_indicators": [{"term": feature_names[i], "weight": round(float(coefs[i]), 3)} for i in top_fake_idx],
        "genuine_indicators": [{"term": feature_names[i], "weight": round(float(coefs[i]), 3)} for i in top_genuine_idx],
    }

    # Product-type-only view: how much does category alone shift the odds of
    # "fake", holding text aside? Pulled straight out of the same coefficient
    # vector, just filtered to the category dummy columns.
    category_effect = sorted(
        (
            {"product_type": c, "weight": round(float(coefs[len(vectorizer.get_feature_names_out()) + i]), 3)}
            for i, c in enumerate(type_encoder.categories_[0])
        ),
        key=lambda d: d["weight"],
        reverse=True,
    )

    report = {
        "model_selected": chosen_name,
        "dataset_size": len(df),
        "train_size": len(X_train_text),
        "test_size": len(X_test_text),
        "vocabulary_size": len(vectorizer.vocabulary_),
        "product_type_categories": list(type_encoder.categories_[0]),
        "metrics": all_metrics,
        "top_terms": top_terms,
        "category_effect": category_effect,
    }
    with open(f"{MODELS_DIR}/metrics.json", "w") as f:
        json.dump(report, f, indent=2)

    print(f"\nSaved vectorizer, model, and metrics.json to {MODELS_DIR}/")


if __name__ == "__main__":
    main()
