// scripts/refresh-data.mjs
// Pulls NYC Aging - All Contracted Providers (cqc8-am9x) from Socrata
// and bakes a GeoJSON snapshot into src/data/providers.geojson.
// Re-run any time to refresh. Node 22+ (uses built-in fetch).

import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const SOCRATA = 'https://data.cityofnewyork.us/resource/cqc8-am9x.json?$limit=2000'
const OUT_URL = new URL('../public/data/providers.geojson', import.meta.url)

// Optional: pass a local JSON file path as argv[2] to skip the network fetch
// (useful when DNS or egress is restricted; pre-download with curl).
const LOCAL_INPUT = process.argv[2]

// providertype → display category. Any value not listed is dropped.
// CITY MEALS ADMINISTRATIVE SERVICES is administrative (not a service location).
const CATEGORIES = {
  'OLDER ADULT CENTER CONTRACTS':                     { slug: 'oac',          label: 'Older Adult Center' },
  'HOME DELIVERED MEAL SERVICE CONTRACTS':            { slug: 'hdm',          label: 'Home Delivered Meals' },
  'CASE MANAGEMENT SERVICES CONTRACTS':               { slug: 'case-mgmt',    label: 'Case Management' },
  'HOMECARE SERVICES CONTRACTS':                      { slug: 'homecare',     label: 'Home Care' },
  'LEGAL SERVICES CONTRACTS':                         { slug: 'legal',        label: 'Legal Services' },
  'CAREGIVER SERVICES CONTRACTS':                     { slug: 'caregivers',   label: 'Caregiver Support' },
  'NATURALLY OCCURING RETIREMENT COMMUNITY CONTRACTS':{ slug: 'norc',         label: 'NORC' },
  'TRANSPORTATION SERVICES CONTRACTS':                { slug: 'transport',    label: 'Transportation' },
  'ELDER ABUSE SERVICES CONTRACTS':                   { slug: 'elder-abuse',  label: 'Elder Abuse Prevention' },
  'GERIATRIC MENTAL HEALTH SERVICES CONTRACTS':       { slug: 'geriatric-mh', label: 'Geriatric Mental Health' },
  'NEW YORK CONNECTS CONTRACTS':                      { slug: 'ny-connects',  label: 'NY Connects (Info & Referral)' }
}

const DAYS = ['mon','tue','wed','thu','fri','sat','sun']

// Socrata stores hours in 12-hour clock without AM/PM. Heuristic: assume open is
// AM-leaning and close is PM-leaning, so if close-hour < open-hour numerically,
// shift close by +12. Both "00:00" means closed that day.
function parseHours(row) {
  const hoursByDay = {}
  for (const d of DAYS) {
    const open = row[`${d}houropen`] || ''
    const close = row[`${d}hourclose`] || ''
    const closed = (!open || !close) || (open === '00:00' && close === '00:00')
    if (closed) {
      hoursByDay[d] = { open: null, close: null, closed: true }
      continue
    }
    const [oh, om] = open.split(':').map(Number)
    let [ch, cm] = close.split(':').map(Number)
    if (ch < oh) ch += 12
    hoursByDay[d] = {
      open: `${String(oh).padStart(2,'0')}:${String(om).padStart(2,'0')}`,
      close: `${String(ch).padStart(2,'0')}:${String(cm).padStart(2,'0')}`,
      closed: false
    }
  }
  return hoursByDay
}

let rows
if (LOCAL_INPUT) {
  console.log(`→ Reading local input: ${LOCAL_INPUT}`)
  rows = JSON.parse(await readFile(LOCAL_INPUT, 'utf8'))
} else {
  console.log(`→ Fetching ${SOCRATA}`)
  const res = await fetch(SOCRATA)
  if (!res.ok) {
    console.error(`Fetch failed: HTTP ${res.status}`)
    process.exit(1)
  }
  rows = await res.json()
}
console.log(`← ${rows.length} rows`)

const features = []
const skipped = { unmapped: 0, noGeo: 0 }
for (const row of rows) {
  const cat = CATEGORIES[row.providertype]
  if (!cat) { skipped.unmapped++; continue }
  if (!row.latitude || !row.longitude) { skipped.noGeo++; continue }
  const lon = parseFloat(row.longitude)
  const lat = parseFloat(row.latitude)
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) { skipped.noGeo++; continue }
  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lon, lat] },
    properties: {
      dftaId: row.dfta_id || '',
      name: row.programname || '',
      sponsor: row.sponsorname || '',
      address: row.programaddress || '',
      city: row.programcity || '',
      zip: row.programzipcode || '',
      borough: row.borough || '',
      phone: row.programphone || '',
      categorySlug: cat.slug,
      category: cat.label,
      providerType: row.providertype,
      hoursByDay: parseHours(row)
    }
  })
}

await mkdir(dirname(fileURLToPath(OUT_URL)), { recursive: true })
await writeFile(OUT_URL, JSON.stringify({ type: 'FeatureCollection', features }, null, 2))

const counts = {}
for (const f of features) counts[f.properties.category] = (counts[f.properties.category] || 0) + 1
console.log(`✓ Wrote ${features.length} features to public/data/providers.geojson`)
console.log(`  Skipped: ${skipped.unmapped} unmapped providertype, ${skipped.noGeo} missing geo`)
console.log('  By category:')
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(v).padStart(4)}  ${k}`)
}
