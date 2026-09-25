# Wisdom Vault — Famous Quotes Web App

A clean, modern web application built with **Python Flask**, **plain Vanilla JavaScript**, and **semantic HTML5/CSS3** to explore, filter, and search a curated vault of **100 well-known quotes** from history's most notable thinkers and leaders.

---

## Features

- **Spotlight Random Quote**: Instantly displays an inspiring quote with category tags and smooth fade transitions.
- **Search & Filter**:
  - Live real-time search by author name or quote text with debouncing.
  - Category dropdown filter populated dynamically from the backend API.
  - Interactive category badges on cards to filter instantly.
- **100 Curated Quotes**: Spanning 6 distinct categories:
  - Philosophy
  - Science & Innovation
  - Literature & Art
  - Leadership & History
  - Motivation & Wisdom
  - Life & Happiness
- **Utility Actions**:
  - One-click copy-to-clipboard with toast notification.
  - Share quote directly to X / Twitter.
  - Click any card in the grid to spotlight it.
- **Automated Tests**: Comprehensive Pytest suite covering all API endpoints and data validation.

---

## Project Structure

```text
famous-quotes/
├── app.py                   # Flask server & REST API
├── quotes.json              # 100 curated quotes dataset
├── requirements.txt         # Project dependencies (Flask, pytest)
├── pytest.ini               # Pytest configuration
├── templates/
│   └── index.html           # Semantic HTML5 template
├── static/
│   ├── css/
│   │   └── style.css        # Responsive styling & glassmorphism UI
│   └── js/
│       └── app.js           # Vanilla JavaScript application logic
├── tests/
│   └── test_app.py          # Pytest suite
└── .gitignore               # Git ignore rules
```

---

## Quickstart

### 1. Prerequisites
- Python 3.10+

### 2. Setup Virtual Environment & Install Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the Application
```bash
python app.py
```
Open **http://127.0.0.1:5001** in your browser.

---

## Running Tests

```bash
.venv/bin/pytest tests/test_app.py
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Web UI |
| `GET` | `/api/quotes/random` | Returns a random quote (`?category=...&author=...`) |
| `GET` | `/api/quotes/search` | Search quotes (`?q=...&category=...&author=...`) |
| `GET` | `/api/categories` | List all categories with quote counts |
| `GET` | `/api/authors` | List all unique authors |
