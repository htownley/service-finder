import { useState } from 'react'

// Demo uses Nominatim (OpenStreetMap) for address search — no API key required.
// Swap GEOCODE_URL and the response parsing to use a different provider if needed.
const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search'

export default function SearchBar({ onSearch, onClear, searchPoint }) {
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (!query.trim()) return
    setBusy(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        q: `${query}, New York City, NY`,
        format: 'json',
        limit: '1',
        countrycodes: 'us'
      })
      const r = await fetch(`${GEOCODE_URL}?${params}`, { headers: { 'Accept': 'application/json' } })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const results = await r.json()
      if (!results.length) { setError('No match.'); return }
      onSearch({
        lon: parseFloat(results[0].lon),
        lat: parseFloat(results[0].lat),
        label: results[0].display_name
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="searchbar" onSubmit={submit}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by address or zip — e.g. “100 Gold St, Brooklyn”"
        aria-label="Search by address or zip"
      />
      <button type="submit" disabled={busy}>{busy ? 'Searching…' : 'Search'}</button>
      {searchPoint && (
        <button type="button" className="clear" onClick={() => { setQuery(''); onClear() }}>
          Clear
        </button>
      )}
      {error && <div className="search-error">{error}</div>}
      {searchPoint && (
        <div className="search-loc" title={searchPoint.label}>
          Centered on: {searchPoint.label.split(',').slice(0,2).join(', ')}
        </div>
      )}
    </form>
  )
}
