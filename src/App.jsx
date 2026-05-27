import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES } from './config/categories.js'
import { appConfig } from './config/appConfig.js'
import MapView from './components/MapView.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import SearchBar from './components/SearchBar.jsx'
import ListView from './components/ListView.jsx'
import PhoneHeader from './components/PhoneHeader.jsx'
import GoogleTranslate from './components/GoogleTranslate.jsx'

const DEFAULT_RADIUS = 1

export default function App() {
  const [features, setFeatures] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [selectedSlugs, setSelectedSlugs] = useState(() => new Set(CATEGORIES.map(c => c.slug)))
  const [openNowOnly, setOpenNowOnly] = useState(false)
  const [searchPoint, setSearchPoint] = useState(null) // { lon, lat, label }
  const [radius, setRadius] = useState(DEFAULT_RADIUS) // miles
  const [view, setView] = useState('map') // 'map' | 'list'
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/providers.geojson`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(fc => setFeatures(fc.features))
      .catch(err => setLoadError(err.message))
  }, [])

  const filtered = useMemo(() => {
    if (!features) return []
    const now = new Date()
    return features
      .filter(f => selectedSlugs.has(f.properties.categorySlug))
      .filter(f => !openNowOnly || isOpenNow(f.properties.hoursByDay, now))
      .map(f => searchPoint
        ? { ...f, _distance: milesBetween(searchPoint, { lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] }) }
        : f
      )
      .filter(f => !searchPoint || f._distance <= radius)
      .sort((a, b) => searchPoint
        ? a._distance - b._distance
        : a.properties.name.localeCompare(b.properties.name)
      )
  }, [features, selectedSlugs, openNowOnly, searchPoint, radius])

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-mark">NYC</div>
          <div className="brand-text">
            <div className="brand-title">DFTA Service Finder</div>
            <div className="brand-sub">NYC Department for the Aging — local demo</div>
          </div>
        </div>
        <div className="header-tools">
          <GoogleTranslate />
          <PhoneHeader phone={appConfig.phone} />
        </div>
      </header>

      <SearchBar
        onSearch={p => setSearchPoint(p)}
        onClear={() => setSearchPoint(null)}
        searchPoint={searchPoint}
      />

      <div className="main">
        <aside className="sidebar">
          <FilterPanel
            categories={CATEGORIES}
            selectedSlugs={selectedSlugs}
            onToggleCategory={slug => {
              setSelectedSlugs(prev => {
                const next = new Set(prev)
                if (next.has(slug)) next.delete(slug); else next.add(slug)
                return next
              })
            }}
            onSelectAll={() => setSelectedSlugs(new Set(CATEGORIES.map(c => c.slug)))}
            onSelectNone={() => setSelectedSlugs(new Set())}
            openNowOnly={openNowOnly}
            onOpenNowChange={setOpenNowOnly}
            radius={radius}
            onRadiusChange={setRadius}
            radiusOptions={appConfig.filter.distanceFilter.options}
            radiusEnabled={!!searchPoint}
            resultCount={filtered.length}
            totalCount={features?.length ?? 0}
          />
        </aside>

        <section className="content">
          <div className="view-toggle">
            <button className={view==='map'?'active':''} onClick={() => setView('map')}>Map</button>
            <button className={view==='list'?'active':''} onClick={() => setView('list')}>List</button>
          </div>

          {loadError && (
            <div className="error">
              Could not load data: {loadError}.<br/>
              Run <code>npm run refresh-data</code> to bake the provider snapshot, then reload.
            </div>
          )}

          {!features && !loadError && (
            <div className="empty">Loading providers…</div>
          )}

          {features && view === 'map' && (
            <MapView
              features={filtered}
              searchPoint={searchPoint}
              radius={radius}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}

          {features && view === 'list' && (
            <ListView
              features={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              hasSearch={!!searchPoint}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function isOpenNow(hoursByDay, now) {
  const day = ['sun','mon','tue','wed','thu','fri','sat'][now.getDay()]
  const h = hoursByDay?.[day]
  if (!h || h.closed) return false
  const m = now.getHours()*60 + now.getMinutes()
  const [oh, om] = h.open.split(':').map(Number)
  const [ch, cm] = h.close.split(':').map(Number)
  return m >= oh*60 + om && m < ch*60 + cm
}

function milesBetween(a, b) {
  const R = 3958.8
  const toRad = d => d * Math.PI / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2
  return 2 * R * Math.asin(Math.sqrt(s))
}
