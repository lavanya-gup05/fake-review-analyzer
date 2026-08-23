"""
generate_dataset.py

Generates a synthetic labelled dataset of product reviews (genuine vs. fake)
for the Fake Product Review Detection project.

Why synthetic data?
Real deceptive-review corpora are either small, domain-narrow (e.g. hotel
reviews only), or gated behind manual download. To get a large, balanced,
category-diverse training set without external downloads, this script
generates reviews compositionally from hand-designed sentence pools that
encode well-documented linguistic markers of genuine vs. deceptive reviews
(see README for citations/rationale). The goal is a dataset that is
*pattern-realistic* for teaching a classifier to pick up on style, not a
claim that these are real customer reviews.

Output: ml/data/reviews.csv with columns [review_text, product_name,
product_type, label] where label = 1 (fake) / 0 (genuine).
"""

import csv
import random

random.seed(42)

PRODUCT_TYPES = {
    "Electronics": ["Wireless Earbuds", "Bluetooth Speaker", "Phone Charger", "USB-C Cable",
                    "Laptop Stand", "Webcam", "Power Bank", "Smartwatch", "Gaming Mouse", "Keyboard"],
    "Kitchen": ["Non-stick Frying Pan", "Electric Kettle", "Coffee Maker", "Blender",
                "Air Fryer", "Knife Set", "Cutting Board", "Food Storage Containers"],
    "Beauty": ["Face Moisturizer", "Vitamin C Serum", "Hair Dryer", "Electric Toothbrush",
               "Sunscreen SPF 50", "Facial Cleanser", "Lip Balm Set"],
    "Clothing": ["Running Shoes", "Winter Jacket", "Cotton T-Shirt Pack", "Yoga Pants",
                 "Denim Jeans", "Wool Socks"],
    "Home": ["Memory Foam Pillow", "LED Desk Lamp", "Weighted Blanket", "Shower Curtain",
             "Storage Shelf", "Air Purifier"],
    "Toys": ["Building Block Set", "Remote Control Car", "Puzzle 1000-Piece", "Plush Toy"],
    "Books": ["Self-Help Paperback", "Cookbook", "Mystery Novel", "Children's Picture Book"],
    "Sports": ["Yoga Mat", "Resistance Bands Set", "Water Bottle", "Adjustable Dumbbells"],
}

BRAND_PREFIXES = ["Zenith", "Nova", "Orbit", "Crestline", "Pulse", "Vantage", "Everly",
                   "Ridgeline", "Lumen", "Arclight", "Meridian", "Trueform", "Northbay",
                   "Solace", "Kindred", "Basecamp", "", "", ""]  # empty = no brand prefix

# ---------------------------------------------------------------------------
# GENUINE review building blocks — specific, mixed sentiment, measured tone
# ---------------------------------------------------------------------------

GENUINE_OPENERS = [
    "I've been using this {product} for about {time} now.",
    "Bought this {product} for {reason}, and here's my honest take after {time}.",
    "After {time} of daily use, I have mixed feelings about this {product}.",
    "This was my second {product_type_lower} purchase this year, so I had a comparison point.",
    "Picked this up during a sale, wasn't expecting much given the price.",
    "My {relation} recommended this {product}, so I gave it a shot.",
    "Ordered this to replace one that broke after a year of use.",
    "Got this {product} last {time_unit}, figured I'd leave an update now that I've actually used it.",
]

GENUINE_MIDDLES = [
    "The build quality feels {quality_adj}, though the {part} is a bit {minor_flaw}.",
    "It does what it says, but {minor_complaint}.",
    "Setup took about {minutes} minutes, which was longer than the manual suggested.",
    "Battery life is around {number} hours for me, your mileage may vary depending on use.",
    "The color in photos is slightly different from what arrived — more {color_note} in person.",
    "Compared to the {competitor}, this one is {comparison_word} but costs less.",
    "One thing I'd note: the instructions were only in {language_note}, so I had to look up a video.",
    "It's held up fine through {usage_context}, no complaints there.",
    "Sizing ran a little {size_note}, so I'd recommend checking the chart first.",
    "Customer service was responsive when I had a question about {support_topic}.",
    "The {feature} works well, though I wish the {other_feature} was a little more {improvement_adj}.",
    "Not perfect, but for {price_range} I think it's a reasonable buy.",
]

GENUINE_CLOSERS = [
    "Overall I'd give it {rating} — solid but not amazing.",
    "Would probably buy again, though I'd shop around first.",
    "It's fine for casual use, wouldn't recommend for heavy/professional use.",
    "Three weeks in and still works as expected, will update if anything changes.",
    "Not life-changing, but it does the job.",
    "I'd say it's worth it if you catch it on sale.",
    "Might return it if the {issue} doesn't improve, but giving it more time.",
    "Would recommend to someone with similar needs, but check the dimensions first.",
]

GENUINE_FILLERS = [
    "The packaging was a little beat up when it arrived, but the product itself was fine.",
    "Delivery took longer than the estimate, about {extra_days} extra days.",
    "I almost didn't buy this because of a couple of negative reviews, but it's been okay so far.",
    "Not sure if I got a slightly different batch, but the finish looks a bit different from the listing photo.",
    "My {relation} tried it too and had a similar experience.",
]

QUALITY_ADJ = ["sturdy", "decent", "average", "a bit flimsy", "surprisingly solid", "okay, not great"]
PARTS = ["strap", "lid", "handle", "charging port", "zipper", "stitching", "hinge", "base"]
MINOR_FLAWS = ["loose", "a little stiff", "not perfectly aligned", "prone to scratching", "squeaky"]
MINOR_COMPLAINTS = [
    "the instructions could be clearer", "it runs a bit warmer than I expected",
    "the app pairing was finicky at first", "it's heavier than the listing suggested",
    "the color is slightly duller than the photos", "it's a little loud during use",
]
COMPETITORS = ["previous version", "brand I used before", "cheaper alternative I tried first"]
COMPARISON_WORDS = ["about the same", "a little better", "slightly worse", "comparable"]
LANGUAGE_NOTES = ["one language", "small print, hard to read", "a diagram with no text"]
USAGE_CONTEXTS = ["daily commuting", "regular kitchen use", "a full semester of classes",
                   "a couple of camping trips", "everyday wear", "gym sessions three times a week"]
SIZE_NOTES = ["small", "large", "narrow", "true to size but snug"]
SUPPORT_TOPICS = ["a missing part", "a warranty question", "a delayed shipment", "a sizing exchange"]
FEATURES = ["battery indicator", "noise cancellation", "non-stick coating", "grip", "screen brightness", "sound quality"]
OTHER_FEATURES = ["carrying case", "charging cable length", "companion app", "manual"]
IMPROVEMENT_ADJ = ["intuitive", "durable", "responsive", "detailed"]
PRICE_RANGES = ["this price point", "under $30", "a mid-range option", "the sale price I paid"]
ISSUES = ["squeak", "battery drain", "sizing", "smell"]
RELATIONS = ["sister", "coworker", "roommate", "partner", "neighbor"]
TIME_UNITS = ["week", "month"]
TIMES = ["two weeks", "a month", "six weeks", "three months", "about ten days"]
COLOR_NOTES = ["muted", "matte", "darker", "lighter"]

# ---------------------------------------------------------------------------
# FAKE review building blocks — generic superlatives, promotional, repetitive
# ---------------------------------------------------------------------------

FAKE_OPENERS = [
    "OMG this {product} is AMAZING!!!",
    "Best {product_type_lower} I have EVER purchased in my life!!",
    "I am blown away by this incredible {product}, exceeded all expectations!!!",
    "5 STARS!!! This {product} changed my life completely!",
    "Highly highly recommend this {product} to literally everyone I know!!!",
    "Perfect in every single way, this {product} is a total game changer!",
    "Absolutely LOVE LOVE LOVE this product, best purchase ever made!!!",
    "This {product} is hands down the best on the market, no competition at all!!",
]

FAKE_MIDDLES = [
    "The quality is outstanding, amazing, top-notch, and simply unbeatable!",
    "I use it every single day and it works perfectly every single time!!!",
    "Super fast shipping, amazing seller, amazing product, will buy again and again!!!",
    "This is 100% worth every penny, best value you will ever find anywhere!",
    "Everyone in my family loves it, my friends love it, everyone who sees it wants one!!!",
    "Five stars is not enough, I would give it ten stars if I could!!!",
    "Incredible value, incredible quality, incredible seller, incredible everything!!!",
    "This product is a MUST BUY, you will not regret it, trust me!!!",
    "Works like magic, absolutely perfect, could not ask for anything better!!!",
    "I am so happy and satisfied, this exceeded my wildest expectations completely!!!",
    "Better than any other {product_type_lower} I have tried, hands down the winner!!!",
    "Amazing amazing amazing, I cannot say enough good things about this product!!!",
]

FAKE_CLOSERS = [
    "Buy it now, you will NOT be disappointed, guaranteed!!!",
    "Highly recommend to everyone, 10/10 would recommend again and again!!!",
    "Best decision I ever made, thank you so much for this amazing product!!!",
    "Five stars all the way, this deserves every single star and more!!!",
    "Don't wait, buy this today, you will thank me later!!!",
    "Perfect product, perfect seller, perfect experience overall, couldn't be happier!!!",
    "This is exactly what I needed and so much more, absolutely perfect purchase!!!",
]

FAKE_FILLERS = [
    "Received this product and could not be happier with my purchase decision!!!",
    "So glad I found this amazing product, it is truly one of a kind!!!",
    "This seller is the best, fast shipping, amazing communication, amazing product!!!",
    "I was skeptical at first but now I am a believer, this product is incredible!!!",
    "Everyone needs this in their life, it will change everything for you too!!!",
]

# A small pool of near-duplicate "bot template" reviews to simulate spam/duplicate
# fake reviews that get repeated with tiny variations across products.
BOT_TEMPLATES = [
    "Great product great price great seller fast shipping highly recommend A+++",
    "Excellent product, excellent seller, excellent shipping, five stars, will buy again!",
    "This product is amazing, arrived fast, works perfectly, highly recommend to all buyers!",
    "Very good product very fast delivery very satisfied will order again thank you seller",
    "Perfect item as described fast shipping great communication highly recommended seller A+",
]

RATINGS = ["3 out of 5", "3.5 stars", "4 out of 5"]
EXTRA_DAYS = ["two", "three", "four", "five"]
MINUTES = ["five", "ten", "fifteen", "twenty"]
NUMBERS = ["4", "5", "6", "7", "8"]


def a_or_an(word):
    return "an" if word[0].lower() in "aeiou" else "a"


def make_product_name(product_type):
    base = random.choice(PRODUCT_TYPES[product_type])
    brand = random.choice(BRAND_PREFIXES)
    return f"{brand} {base}".strip()


def fill(template, **overrides):
    ctx = {
        "time": random.choice(TIMES),
        "time_unit": random.choice(TIME_UNITS),
        "reason": random.choice(["my home office", "a gift", "everyday use", "travel", "my kids"]),
        "relation": random.choice(RELATIONS),
        "quality_adj": random.choice(QUALITY_ADJ),
        "part": random.choice(PARTS),
        "minor_flaw": random.choice(MINOR_FLAWS),
        "minor_complaint": random.choice(MINOR_COMPLAINTS),
        "minutes": random.choice(MINUTES),
        "number": random.choice(NUMBERS),
        "color_note": random.choice(COLOR_NOTES),
        "competitor": random.choice(COMPETITORS),
        "comparison_word": random.choice(COMPARISON_WORDS),
        "language_note": random.choice(LANGUAGE_NOTES),
        "usage_context": random.choice(USAGE_CONTEXTS),
        "size_note": random.choice(SIZE_NOTES),
        "support_topic": random.choice(SUPPORT_TOPICS),
        "feature": random.choice(FEATURES),
        "other_feature": random.choice(OTHER_FEATURES),
        "improvement_adj": random.choice(IMPROVEMENT_ADJ),
        "price_range": random.choice(PRICE_RANGES),
        "issue": random.choice(ISSUES),
        "rating": random.choice(RATINGS),
        "extra_days": random.choice(EXTRA_DAYS),
    }
    ctx.update(overrides)
    try:
        return template.format(**ctx)
    except KeyError:
        return template


def make_genuine_review(product, product_type):
    ctx = {"product": product, "product_type_lower": product_type.lower()}
    n_middles = random.randint(1, 3)
    parts = [fill(random.choice(GENUINE_OPENERS), **ctx)]
    for _ in range(n_middles):
        parts.append(fill(random.choice(GENUINE_MIDDLES), **ctx))
    if random.random() < 0.4:
        parts.append(fill(random.choice(GENUINE_FILLERS), **ctx))
    parts.append(fill(random.choice(GENUINE_CLOSERS), **ctx))
    return " ".join(parts)


def make_fake_review(product, product_type):
    ctx = {"product": product, "product_type_lower": product_type.lower()}
    # ~15% of fake reviews are near-duplicate bot templates (spam pattern)
    if random.random() < 0.15:
        text = random.choice(BOT_TEMPLATES)
        if random.random() < 0.5:
            text = f"{text} Bought the {product} and it's perfect!"
        return text
    n_middles = random.randint(1, 3)
    parts = [fill(random.choice(FAKE_OPENERS), **ctx)]
    for _ in range(n_middles):
        parts.append(fill(random.choice(FAKE_MIDDLES), **ctx))
    if random.random() < 0.5:
        parts.append(fill(random.choice(FAKE_FILLERS), **ctx))
    parts.append(fill(random.choice(FAKE_CLOSERS), **ctx))
    return " ".join(parts)


def generate(n_per_class=3000):
    rows = []
    product_types = list(PRODUCT_TYPES.keys())
    for _ in range(n_per_class):
        pt = random.choice(product_types)
        product = make_product_name(pt)
        rows.append((make_genuine_review(product, pt), product, pt, 0))
    for _ in range(n_per_class):
        pt = random.choice(product_types)
        product = make_product_name(pt)
        rows.append((make_fake_review(product, pt), product, pt, 1))
    random.shuffle(rows)
    return rows


if __name__ == "__main__":
    rows = generate(n_per_class=3000)
    out_path = "data/reviews.csv"
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["review_text", "product_name", "product_type", "label"])
        writer.writerows(rows)
    print(f"Wrote {len(rows)} reviews to {out_path}")
    print(f"  Genuine (0): {sum(1 for r in rows if r[3] == 0)}")
    print(f"  Fake    (1): {sum(1 for r in rows if r[3] == 1)}")
