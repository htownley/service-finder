// Config for the finder app: field-name mappings, filters, search settings.
// Points the UI at the property names used in providers.geojson.

export const appConfig = {
  appId: 'dfta-service-finder',
  appInfo: { logoFirst: false },

  search: {
    searchLocFieldName: 'name',
    geoCodeURL: 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer',
    searchInitialBufferDistance: 1
  },

  filter: {
    showOpenNowFilter: true,
    categoryFilters: [
      { filter_fields: ['categorySlug'], filter_type: 'checkbox' }
    ],
    distanceFilter: {
      unit: 'miles',
      options: [0.5, 1, 2, 5],
      show_sidelabel: false
    }
  },

  fields: {
    locObjectIDFieldname: 'dftaId',
    locTitleFieldname: 'name',
    locSubtitleFieldname: 'sponsor',
    locAddressFieldname: 'address',
    locPhoneFieldname: 'phone',
    locCategoryFieldname: 'categorySlug',
    locCategoryLabelFieldname: 'category',
    locHoursFieldname: 'hoursByDay'
  },

  landing: {
    backgroundImage: null,
    importantLinks: [
      { url: 'https://www.nyc.gov/site/dfta/index.page', label: 'NYC Department for the Aging' },
      { url: 'https://access.nyc.gov/', label: 'ACCESS NYC' }
    ]
  },

  detailSections: [{ isOperatingHours: true }],

  phone: {
    info: '212-244-6469',  // Aging Connect
    info_label: 'Aging Connect',
    cityInfo: '311',
    tty: '212-504-4115'
  },

  useGoogleTranslate: true
}
