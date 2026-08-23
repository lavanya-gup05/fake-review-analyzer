"""
preprocess.py

Shared NLP preprocessing pipeline used identically at training time and at
prediction time. Keeping this in one module guarantees the live API and the
training script can never drift apart (a common source of bugs where a
deployed model sees differently-processed text than it was trained on).

Pipeline: lowercase -> strip URLs/HTML -> remove non-letter symbols ->
collapse whitespace -> tokenize -> drop stopwords -> stem (Porter).
"""

import re
from nltk.stem.porter import PorterStemmer

_stemmer = PorterStemmer()

# Hardcoded stopword list (avoids an NLTK corpus download at runtime, which
# would require network access this sandboxed environment doesn't allow).
STOPWORDS = set("""
a an the and or but if while of at by for with about against between into
through during before after above below to from up down in out on off over
under again further then once here there when where why how all any both
each few more most other some such no nor not only own same so than too
very s t can will just don should now i me my myself we our ours ourselves
you your yours yourself yourselves he him his himself she her hers herself
it its itself they them their theirs themselves what which who whom this
that these those am is are was were be been being have has had having do
does did doing would could shall might must
""".split())

_URL_RE = re.compile(r"https?://\S+|www\.\S+")
_HTML_RE = re.compile(r"<[^>]+>")
_NON_ALPHA_RE = re.compile(r"[^a-zA-Z\s]")
_WS_RE = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """Lowercase and strip URLs/HTML/symbols/extra whitespace."""
    text = text.lower()
    text = _URL_RE.sub(" ", text)
    text = _HTML_RE.sub(" ", text)
    text = _NON_ALPHA_RE.sub(" ", text)
    text = _WS_RE.sub(" ", text).strip()
    return text


def tokenize(text: str):
    return text.split()


def remove_stopwords(tokens):
    return [t for t in tokens if t not in STOPWORDS and len(t) > 1]


def stem(tokens):
    return [_stemmer.stem(t) for t in tokens]


def preprocess(text: str, use_stemming: bool = True) -> str:
    """Full pipeline: raw review text -> cleaned, stopword-free, stemmed string."""
    cleaned = clean_text(text)
    tokens = tokenize(cleaned)
    tokens = remove_stopwords(tokens)
    if use_stemming:
        tokens = stem(tokens)
    return " ".join(tokens)


def build_stem_display_map(raw_texts):
    """Build a stem -> most-common-original-word lookup so predictions can
    show a reader-friendly word ('highly') instead of the raw stem
    ('highli') in the explanation UI. Built once at training time from the
    training corpus and saved alongside the model."""
    from collections import Counter
    counts = {}
    for text in raw_texts:
        cleaned = clean_text(text)
        for tok in remove_stopwords(tokenize(cleaned)):
            s = _stemmer.stem(tok)
            counts.setdefault(s, Counter())[tok] += 1
    return {s: c.most_common(1)[0][0] for s, c in counts.items()}
