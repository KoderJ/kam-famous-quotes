/**
 * Wisdom Vault — Vanilla JavaScript Client
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const quoteCategoryBadge = document.getElementById('quoteCategoryBadge');
  const btnNewQuote = document.getElementById('btnNewQuote');
  const btnCopyQuote = document.getElementById('btnCopyQuote');
  const btnTweetQuote = document.getElementById('btnTweetQuote');
  const searchInput = document.getElementById('searchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnResetAll = document.getElementById('btnResetAll');
  const quotesGrid = document.getElementById('quotesGrid');
  const resultsStats = document.getElementById('resultsStats');
  const emptyState = document.getElementById('emptyState');
  const btnEmptyReset = document.getElementById('btnEmptyReset');
  const toast = document.getElementById('toast');

  let currentQuote = null;
  let debounceTimeout = null;
  let toastTimeout = null;

  // Initialize
  init();

  async function init() {
    await loadCategories();
    await loadRandomQuote();
    await fetchAndRenderQuotes();
    attachEventListeners();
  }

  // --- API Handlers ---

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const categories = await res.json();

      categoryFilter.innerHTML = '<option value="">All Categories (100 quotes)</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = `${cat.name} (${cat.count})`;
        categoryFilter.appendChild(option);
      });
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async function loadRandomQuote() {
    const icon = btnNewQuote.querySelector('.btn-icon');
    if (icon) icon.classList.add('spinning');

    const selectedCategory = categoryFilter.value;
    const authorQuery = searchInput.value.trim();

    let url = '/api/quotes/random';
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (authorQuery) params.append('author', authorQuery);

    if ([...params].length > 0) {
      url += `?${params.toString()}`;
    }

    try {
      // Fade out effect
      quoteText.classList.add('fade-out');

      const res = await fetch(url);
      if (!res.ok) {
        // Fallback to purely random if filtered random has no match
        const fallbackRes = await fetch('/api/quotes/random');
        const fallbackData = await fallbackRes.json();
        updateSpotlightUI(fallbackData);
        return;
      }

      const quote = await res.json();
      setTimeout(() => {
        updateSpotlightUI(quote);
        quoteText.classList.remove('fade-out');
      }, 150);

    } catch (err) {
      console.error('Error fetching random quote:', err);
      quoteText.textContent = "Unable to fetch quote at this time.";
      quoteAuthor.textContent = "—";
      quoteText.classList.remove('fade-out');
    } finally {
      if (icon) {
        setTimeout(() => icon.classList.remove('spinning'), 500);
      }
    }
  }

  function updateSpotlightUI(quote) {
    currentQuote = quote;
    quoteText.textContent = `“${quote.quote}”`;
    quoteAuthor.textContent = `— ${quote.author}`;
    quoteCategoryBadge.textContent = quote.category;
    quoteCategoryBadge.dataset.category = quote.category;
  }

  async function fetchAndRenderQuotes() {
    const q = searchInput.value.trim();
    const category = categoryFilter.value;

    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category) params.append('category', category);

    const url = `/api/quotes/search?${params.toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      renderQuotesGrid(data.quotes);
      resultsStats.textContent = `Showing ${data.count} quote${data.count === 1 ? '' : 's'}`;
    } catch (err) {
      console.error('Error searching quotes:', err);
    }
  }

  function renderQuotesGrid(quotes) {
    quotesGrid.innerHTML = '';

    if (!quotes || quotes.length === 0) {
      emptyState.classList.remove('hidden');
      quotesGrid.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    quotesGrid.classList.remove('hidden');

    const fragment = document.createDocumentFragment();

    quotes.forEach(quote => {
      const card = document.createElement('article');
      card.className = 'mini-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Quote by ${quote.author}: ${quote.quote}`);

      card.innerHTML = `
        <p class="mini-quote">“${escapeHtml(quote.quote)}”</p>
        <div class="mini-footer">
          <div>
            <div class="mini-author">— ${escapeHtml(quote.author)}</div>
            <span class="mini-badge">${escapeHtml(quote.category)}</span>
          </div>
          <div class="mini-actions">
            <button class="btn-mini-copy" title="Copy quote to clipboard" aria-label="Copy quote">
              <span>📋</span> <span class="copy-label">Copy</span>
            </button>
          </div>
        </div>
      `;

      // Click card to spotlight quote
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-mini-copy')) return;
        updateSpotlightUI(quote);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      // Keyboard accessible
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          updateSpotlightUI(quote);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

      // Mini copy button
      const miniCopy = card.querySelector('.btn-mini-copy');
      miniCopy.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(`"${quote.quote}" — ${quote.author}`);
        const label = miniCopy.querySelector('.copy-label');
        if (label) label.textContent = 'Copied!';
        miniCopy.classList.add('copied');
        setTimeout(() => {
          if (label) label.textContent = 'Copy';
          miniCopy.classList.remove('copied');
        }, 1600);
      });

      fragment.appendChild(card);
    });

    quotesGrid.appendChild(fragment);
  }

  // --- Helpers & UI Feedback ---

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast('Quote copied to clipboard!'));
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('Quote copied to clipboard!');
      } catch (err) {
        showToast('Failed to copy quote.');
      }
      document.body.removeChild(textArea);
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function resetAllFilters() {
    searchInput.value = '';
    btnClearSearch.style.display = 'none';
    categoryFilter.value = '';
    fetchAndRenderQuotes();
  }

  // --- Event Listeners ---

  function attachEventListeners() {
    // New Random Quote
    btnNewQuote.addEventListener('click', () => {
      loadRandomQuote();
    });

    // Copy Current Spotlight Quote
    btnCopyQuote.addEventListener('click', () => {
      if (currentQuote) {
        copyToClipboard(`"${currentQuote.quote}" — ${currentQuote.author}`);
        const label = btnCopyQuote.querySelector('.btn-label');
        if (label) {
          const originalText = label.textContent;
          label.textContent = 'Copied!';
          setTimeout(() => { label.textContent = originalText; }, 1600);
        }
      }
    });

    // Export to CSV
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        const q = searchInput.value.trim();
        const category = categoryFilter.value;
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (category) params.append('category', category);

        const url = `/api/quotes/export/csv${params.toString() ? '?' + params.toString() : ''}`;
        window.location.href = url;
        showToast('Exporting quotes to CSV...');
      });
    }

    // Tweet / Share Quote
    btnTweetQuote.addEventListener('click', () => {
      if (!currentQuote) return;
      const text = encodeURIComponent(`"${currentQuote.quote}" — ${currentQuote.author}`);
      const tweetUrl = `https://twitter.com/intent/tweet?text=${text}`;
      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    });

    // Category Badge in Spotlight click -> filter by that category
    quoteCategoryBadge.addEventListener('click', () => {
      const cat = quoteCategoryBadge.dataset.category;
      if (cat) {
        categoryFilter.value = cat;
        fetchAndRenderQuotes();
        document.querySelector('.explorer-section').scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Search Input with Debounce & Clear Icon Toggle
    searchInput.addEventListener('input', () => {
      const hasValue = searchInput.value.trim().length > 0;
      btnClearSearch.style.display = hasValue ? 'block' : 'none';

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        fetchAndRenderQuotes();
      }, 250);
    });

    // Clear Search Input
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      btnClearSearch.style.display = 'none';
      fetchAndRenderQuotes();
      searchInput.focus();
    });

    // Category Dropdown Change
    categoryFilter.addEventListener('change', () => {
      fetchAndRenderQuotes();
    });

    // Reset Buttons
    btnResetAll.addEventListener('click', resetAllFilters);
    btnEmptyReset.addEventListener('click', resetAllFilters);
  }
});
