# 🕵️ Evident — Fake Review Analyzer

An ML-powered web application that analyzes product reviews and predicts whether a review is **Likely Genuine** or **Likely Fake**.

The project combines a **Python NLP/ML pipeline** with a **Next.js frontend** to provide predictions, confidence scores, explanations, and model performance insights.

## ✨ Features

* 🔍 Analyze product reviews in real time
* 🤖 Fake/Genuine review classification
* 📊 Confidence score for predictions
* 💡 Explanation of important review indicators
* 🧠 Comparison of multiple ML models
* 📈 Model performance metrics
* 🌐 Interactive Next.js web interface
* 🐳 Docker support
* 🔄 Easy model retraining with new datasets

## 🧠 How It Works

```text
User enters a review
        ↓
Next.js Frontend
        ↓
/api/analyze
        ↓
Python Prediction Pipeline
        ↓
Text Preprocessing
        ↓
TF-IDF Vectorization
        ↓
ML Classifier
        ↓
Prediction + Confidence
        ↓
Result displayed in UI
```

The ML pipeline compares:

* Logistic Regression
* Naive Bayes
* Linear SVM

The best-performing model is selected and saved for inference.

## 🛠️ Tech Stack

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* NLP
* TF-IDF
* Logistic Regression
* Naive Bayes
* Linear SVM

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* React

### Backend / Integration

* Next.js API Routes
* Python subprocess
* JSON-based communication

### Deployment & Tools

* Docker
* Git
* GitHub

## 📂 Project Structure

```text
fake-review-analyzer/
│
├── ml/
│   ├── data/
│   ├── models/
│   ├── generate_dataset.py
│   ├── train.py
│   ├── predict.py
│   └── requirements.txt
│
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   └── api/
│   │   │       └── analyze/
│   │   └── lib/
│   ├── package.json
│   └── ...
│
├── Dockerfile
├── .gitignore
└── README.md
```

The `ml` and `web` directories must remain siblings because the Next.js API route accesses the Python ML pipeline using a relative path.

## ⚙️ ML Pipeline

The project generates a labelled dataset and trains multiple classification models.

### 1. Generate Dataset

```bash
cd ml

python generate_dataset.py
```

This generates **6,000 labelled synthetic reviews**.

### 2. Train Models

```bash
python train.py
```

The training process:

```text
Dataset
   ↓
Preprocessing
   ↓
TF-IDF Vectorization
   ↓
Train Multiple Models
   ↓
Evaluate Models
   ↓
Select Best Model
   ↓
Save Model
```

Generated files include:

```text
ml/models/
├── vectorizer.pkl
├── model.pkl
├── stem_map.json
└── metrics.json
```

These store the trained vectorizer, selected classifier, explanation mapping, and evaluation metrics.

## 🚀 Run Locally

### 1. S
