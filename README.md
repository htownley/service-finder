# NYC services for older adults — local map demo

A small map-based finder for NYC Department for the Aging contracted-provider locations, built with React + ArcGIS JS API. Data comes from NYC Open Data — [`cqc8-am9x`](https://data.cityofnewyork.us/Social-Services/Department-for-the-Aging-NYC-Aging-All-Contracted-/cqc8-am9x).

## Run

```bash
npm install
npm run refresh-data   # bakes public/data/providers.geojson from NYC Open Data
npm run dev            # http://localhost:3000
```

Re-run `refresh-data` whenever you want fresher data.

## Stack

- React 18 + Vite
- `@arcgis/core` (ArcGIS JavaScript API)
- Esri public basemap and (optional) geocoder services
- OpenStreetMap Nominatim for address search in this demo
- Google Translate widget for in-page translation

## Layout

```
service-finder/
├── public/
│   └── data/providers.geojson    # baked snapshot from NYC Open Data
├── scripts/refresh-data.mjs      # Socrata → GeoJSON
└── src/
    ├── App.jsx
    ├── components/                # MapView, FilterPanel, SearchBar, ListView, ResultCard, PhoneHeader, GoogleTranslate
    ├── config/
    │   ├── categories.js          # 11 service categories
    │   └── appConfig.js           # field mappings + filter setup
    └── styles/App.css
```

## Data notes

- `cqc8-am9x` is monthly-refresh, pre-geocoded, ~468 rows. The bake script drops administrative-contract rows and any rows missing geo coordinates, leaving ~465 visible providers across 11 service categories.
- Hours in the source data are stored in 12-hour format without AM/PM disambiguation; the bake script applies a heuristic so typical schedules (e.g. `08:00`–`04:00`) parse correctly as 8 AM – 4 PM.
- Search in this demo uses OpenStreetMap Nominatim (no API key needed).
