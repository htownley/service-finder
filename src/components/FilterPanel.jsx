export default function FilterPanel({
  categories, selectedSlugs, onToggleCategory, onSelectAll, onSelectNone,
  openNowOnly, onOpenNowChange,
  radius, onRadiusChange, radiusOptions, radiusEnabled,
  resultCount, totalCount
}) {
  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2>Filters</h2>
        <div className="count">{resultCount} of {totalCount}</div>
      </div>

      <div className="filter-group">
        <label className="toggle">
          <input
            type="checkbox"
            checked={openNowOnly}
            onChange={e => onOpenNowChange(e.target.checked)}
          />
          <span>Open now</span>
        </label>
      </div>

      <div className="filter-group">
        <label className={radiusEnabled ? 'select' : 'select disabled'}>
          <span>Within</span>
          <select
            value={radius}
            disabled={!radiusEnabled}
            onChange={e => onRadiusChange(Number(e.target.value))}
          >
            {radiusOptions.map(o => (
              <option key={o} value={o}>{o} {o === 1 ? 'mile' : 'miles'}</option>
            ))}
          </select>
        </label>
        {!radiusEnabled && (
          <div className="hint">Search an address to enable.</div>
        )}
      </div>

      <div className="filter-group categories">
        <div className="filter-subhead">
          <span>Service type</span>
          <div className="row-actions">
            <button onClick={onSelectAll}>All</button>
            <button onClick={onSelectNone}>None</button>
          </div>
        </div>
        <ul>
          {categories.map(c => (
            <li key={c.slug}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedSlugs.has(c.slug)}
                  onChange={() => onToggleCategory(c.slug)}
                />
                <span className="swatch" style={{ background: c.color }} aria-hidden="true" />
                <span className="cat-label">{c.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
