import pytest
from app import app, QUOTES

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_index_page(client):
    """Test that the homepage loads successfully."""
    response = client.get("/")
    assert response.status_code == 200
    assert b"Wisdom Vault" in response.data

def test_quotes_total_count():
    """Verify that there are exactly 100 quotes loaded."""
    assert len(QUOTES) == 100

def test_random_quote(client):
    """Test the random quote API endpoint."""
    response = client.get("/api/quotes/random")
    assert response.status_code == 200
    data = response.get_json()
    assert "id" in data
    assert "quote" in data
    assert "author" in data
    assert "category" in data

def test_random_quote_with_category(client):
    """Test random quote filtered by category."""
    response = client.get("/api/quotes/random?category=Philosophy")
    assert response.status_code == 200
    data = response.get_json()
    assert data["category"] == "Philosophy"

def test_random_quote_with_author(client):
    """Test random quote filtered by author."""
    response = client.get("/api/quotes/random?author=Einstein")
    assert response.status_code == 200
    data = response.get_json()
    assert "Einstein" in data["author"]

def test_random_quote_not_found(client):
    """Test random quote with invalid filter returns 404."""
    response = client.get("/api/quotes/random?category=NonExistentCategoryXYZ")
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data

def test_get_categories(client):
    """Test categories endpoint returns non-empty list and counts sum to 100."""
    response = client.get("/api/categories")
    assert response.status_code == 200
    categories = response.get_json()
    assert len(categories) > 0
    total_count = sum(c["count"] for c in categories)
    assert total_count == 100

def test_search_quotes_by_author(client):
    """Test search endpoint filtering by author."""
    response = client.get("/api/quotes/search?author=Socrates")
    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] >= 1
    assert all("Socrates" in q["author"] for q in data["quotes"])

def test_search_quotes_by_category(client):
    """Test search endpoint filtering by category."""
    response = client.get("/api/quotes/search?category=Philosophy")
    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] > 0
    assert all(q["category"].lower() == "philosophy" for q in data["quotes"])

def test_search_quotes_keyword(client):
    """Test search endpoint filtering by keyword."""
    response = client.get("/api/quotes/search?q=wisdom")
    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] > 0

def test_search_no_results(client):
    """Test search endpoint returns count 0 for unmatched queries."""
    response = client.get("/api/quotes/search?q=xyznonexistentword999")
    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 0
    assert data["quotes"] == []

def test_get_authors(client):
    """Test authors list endpoint."""
    response = client.get("/api/authors")
    assert response.status_code == 200
    authors = response.get_json()
    assert len(authors) > 0
    assert "Albert Einstein" in authors
