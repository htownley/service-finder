import { useEffect, useRef } from 'react'
import Map from '@arcgis/core/Map.js'
import EsriMapView from '@arcgis/core/views/MapView.js'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js'
import Graphic from '@arcgis/core/Graphic.js'
import Point from '@arcgis/core/geometry/Point.js'
import Circle from '@arcgis/core/geometry/Circle.js'
import { CATEGORY_BY_SLUG } from '../config/categories.js'

const NYC_CENTER = [-73.94, 40.72]
const NYC_ZOOM = 10

export default function MapView({ features, searchPoint, radius, onSelect }) {
  const containerRef = useRef(null)
  const viewRef = useRef(null)
  const pointsLayerRef = useRef(null)
  const overlayLayerRef = useRef(null)

  // Init the map once.
  useEffect(() => {
    const map = new Map({ basemap: 'gray-vector' })
    const view = new EsriMapView({
      container: containerRef.current,
      map,
      center: NYC_CENTER,
      zoom: NYC_ZOOM,
      popup: { dockEnabled: false, dockOptions: { buttonEnabled: false, breakpoint: false } }
    })
    const pointsLayer = new GraphicsLayer({ id: 'providers' })
    const overlayLayer = new GraphicsLayer({ id: 'overlay' })
    map.addMany([overlayLayer, pointsLayer])
    pointsLayerRef.current = pointsLayer
    overlayLayerRef.current = overlayLayer
    viewRef.current = view

    view.on('click', event => {
      view.hitTest(event).then(res => {
        const hit = res.results.find(r => r.graphic && r.graphic.layer === pointsLayer)
        if (hit) onSelect?.(hit.graphic.attributes.dftaId)
      })
    })

    return () => {
      view?.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render the points whenever filtered features change.
  useEffect(() => {
    const layer = pointsLayerRef.current
    if (!layer) return
    layer.removeAll()
    const graphics = features.map(f => {
      const cat = CATEGORY_BY_SLUG[f.properties.categorySlug]
      const color = cat?.color || '#555'
      const [lon, lat] = f.geometry.coordinates
      return new Graphic({
        geometry: new Point({ longitude: lon, latitude: lat }),
        symbol: {
          type: 'simple-marker',
          color,
          size: 9,
          outline: { color: '#ffffff', width: 1.25 }
        },
        attributes: f.properties,
        popupTemplate: {
          title: '{name}',
          content: buildPopupContent
        }
      })
    })
    layer.addMany(graphics)
  }, [features])

  // Re-draw the search center + radius ring when search changes.
  useEffect(() => {
    const layer = overlayLayerRef.current
    const view = viewRef.current
    if (!layer || !view) return
    layer.removeAll()
    if (!searchPoint) return
    const center = new Point({ longitude: searchPoint.lon, latitude: searchPoint.lat })
    layer.add(new Graphic({
      geometry: center,
      symbol: { type: 'simple-marker', style: 'diamond', color: '#0a3161', size: 14, outline: { color: '#fff', width: 2 } }
    }))
    layer.add(new Graphic({
      geometry: new Circle({ center, radius, radiusUnit: 'miles', geodesic: true }),
      symbol: {
        type: 'simple-fill',
        color: [10, 49, 97, 0.08],
        outline: { color: [10, 49, 97, 0.55], width: 1.5, style: 'dash' }
      }
    }))
    view.goTo({ target: center, zoom: 13 }, { duration: 600 }).catch(() => {})
  }, [searchPoint, radius])

  return <div ref={containerRef} className="map-container" />
}

function buildPopupContent(graphic) {
  const a = graphic.graphic.attributes
  const today = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]
  const h = a.hoursByDay?.[today]
  const hoursStr = h?.closed ? 'Closed today' : (h ? `Today: ${fmt(h.open)} – ${fmt(h.close)}` : '')
  const phoneEl = a.phone ? `<a href="tel:${a.phone.replace(/[^\d]/g,'')}">${a.phone}</a>` : ''
  return `
    <div class="popup">
      <div class="popup-cat">${a.category}</div>
      ${a.sponsor ? `<div class="popup-sponsor">${a.sponsor}</div>` : ''}
      <div class="popup-addr">${a.address}${a.borough ? `, ${titleCase(a.borough)}` : ''} ${a.zip || ''}</div>
      ${phoneEl ? `<div class="popup-phone">${phoneEl}</div>` : ''}
      ${hoursStr ? `<div class="popup-hours">${hoursStr}</div>` : ''}
    </div>
  `
}

function fmt(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = ((h + 11) % 12) + 1
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2,'0')} ${period}`
}
function titleCase(s) { return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) }
