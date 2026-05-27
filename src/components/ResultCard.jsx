import { CATEGORY_BY_SLUG } from '../config/categories.js'

const DAY_NAMES = { mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat', sun:'Sun' }

export default function ResultCard({ feature, selected, onSelect, showDistance }) {
  const p = feature.properties
  const cat = CATEGORY_BY_SLUG[p.categorySlug]
  const today = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]
  const h = p.hoursByDay?.[today]
  const openNow = isOpenNow(p.hoursByDay)
  const todayText = h?.closed ? 'Closed today' : (h ? `Today ${fmt(h.open)} – ${fmt(h.close)}` : '')

  return (
    <li
      className={`result-card${selected ? ' selected' : ''}`}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
    >
      <div className="card-head">
        <span className="cat-badge" style={{ background: cat?.color || '#666' }}>{cat?.label || p.category}</span>
        {showDistance && Number.isFinite(feature._distance) && (
          <span className="distance">{feature._distance.toFixed(1)} mi</span>
        )}
      </div>
      <h3 className="card-title">{p.name}</h3>
      {p.sponsor && <div className="card-sponsor">{p.sponsor}</div>}
      <div className="card-addr">
        {p.address}{p.borough ? `, ${titleCase(p.borough)}` : ''} {p.zip}
      </div>
      <div className="card-meta">
        {p.phone && <a href={`tel:${p.phone.replace(/[^\d]/g,'')}`} onClick={e => e.stopPropagation()}>{p.phone}</a>}
        {todayText && (
          <span className={`hours-pill${openNow ? ' open' : (h?.closed ? ' closed' : '')}`}>
            {openNow ? 'Open · ' : ''}{todayText}
          </span>
        )}
      </div>
    </li>
  )
}

function isOpenNow(hoursByDay) {
  const now = new Date()
  const day = ['sun','mon','tue','wed','thu','fri','sat'][now.getDay()]
  const h = hoursByDay?.[day]
  if (!h || h.closed) return false
  const m = now.getHours()*60 + now.getMinutes()
  const [oh, om] = h.open.split(':').map(Number)
  const [ch, cm] = h.close.split(':').map(Number)
  return m >= oh*60 + om && m < ch*60 + cm
}
function fmt(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = ((h + 11) % 12) + 1
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2,'0')} ${period}`
}
function titleCase(s) { return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) }
