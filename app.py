from flask import Flask, jsonify, render_template, request
import json
import random
from pathlib import Path

app = Flask(__name__)

DATA_PATH = Path(__file__).parent / "quotes.json"

def load_quotes():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

QUOTES = load_quotes()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/quotes/random")
def get_random_quote():
    category = request.args.get("category", "").strip()
    author = request.args.get("author", "").strip()
    
    pool = QUOTES
    if category:
        pool = [q for q in pool if q["category"].lower() == category.lower()]
    if author:
        pool = [q for q in pool if author.lower() in q["author"].lower()]
        
    if not pool:
        return jsonify({
            "error": "No quotes found matching criteria",
            "category": category,
            "author": author
        }), 404
        
    quote = random.choice(pool)
    return jsonify(quote)

@app.route("/api/quotes/search")
def search_quotes():
    q = request.args.get("q", "").strip().lower()
    author = request.args.get("author", "").strip().lower()
    category = request.args.get("category", "").strip().lower()

    results = QUOTES
    if category:
        results = [quote for quote in results if quote["category"].lower() == category]
    if author:
        results = [quote for quote in results if author in quote["author"].lower()]
    if q:
        results = [
            quote for quote in results
            if q in quote["quote"].lower() or q in quote["author"].lower()
        ]

    return jsonify({
        "count": len(results),
        "quotes": results
    })

@app.route("/api/quotes")
def get_all_quotes():
    return search_quotes()

@app.route("/api/categories")
def get_categories():
    categories = sorted(list({q["category"] for q in QUOTES}))
    category_counts = {}
    for q in QUOTES:
        cat = q["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
        
    data = [
        {"name": cat, "count": category_counts[cat]}
        for cat in categories
    ]
    return jsonify(data)

@app.route("/api/authors")
def get_authors():
    authors = sorted(list({q["author"] for q in QUOTES}))
    return jsonify(authors)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
