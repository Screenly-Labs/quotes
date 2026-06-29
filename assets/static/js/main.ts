// Browser entry. Bun bundles this (inlining ./quotes) into a self-contained
// classic script with no exports, so it loads from a plain <script>. Keep it
// export-free and free of top-level await.

import { isQuote, pickRandomIndex, type Quote } from './quotes'

// Shown if the quotes file can't be fetched or is empty, so the screen is never
// blank on signage with flaky connectivity.
const FALLBACK: Quote = {
  text: 'The best way to predict the future is to create it.',
  author: 'Peter Drucker'
}

const DATA_URL = '/static/data/quotes.json'

const render = (quote: Quote): void => {
  const textEl = document.getElementById('quote-text')
  const authorEl = document.getElementById('quote-author')
  if (textEl) textEl.textContent = quote.text
  if (authorEl) authorEl.textContent = quote.author
  document.documentElement.dataset.state = 'ready'
}

const loadQuote = async (): Promise<Quote> => {
  try {
    // no-cache: revalidate so a redeploy's new quotes aren't masked by a stale
    // cached copy, while still working offline from cache when unreachable.
    const res = await fetch(DATA_URL, { cache: 'no-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: unknown = await res.json()
    const quotes = Array.isArray(data) ? data.filter(isQuote) : []
    if (quotes.length === 0) throw new Error('no valid quotes in payload')
    return quotes[pickRandomIndex(quotes.length)]
  } catch (error) {
    console.error('Quotes: using fallback —', error)
    return FALLBACK
  }
}

const init = (): void => {
  loadQuote().then(render)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
