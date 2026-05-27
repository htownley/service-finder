// 11 service categories. The dataset contains a 12th providertype value
// (CITY MEALS ADMINISTRATIVE SERVICES CONTRACTS) which is administrative
// rather than location-based and is not shown.
// Colors are a categorical ramp chosen for distinguishability on a map.

export const CATEGORIES = [
  { slug: 'oac',          dataValue: 'OLDER ADULT CENTER CONTRACTS',                      label: 'Older Adult Center',        color: '#1f77b4' },
  { slug: 'case-mgmt',    dataValue: 'CASE MANAGEMENT SERVICES CONTRACTS',                label: 'Case Management',           color: '#ff7f0e' },
  { slug: 'homecare',     dataValue: 'HOMECARE SERVICES CONTRACTS',                       label: 'Home Care',                 color: '#2ca02c' },
  { slug: 'hdm',          dataValue: 'HOME DELIVERED MEAL SERVICE CONTRACTS',             label: 'Home Delivered Meals',      color: '#d62728' },
  { slug: 'legal',        dataValue: 'LEGAL SERVICES CONTRACTS',                          label: 'Legal Services',            color: '#9467bd' },
  { slug: 'caregivers',   dataValue: 'CAREGIVER SERVICES CONTRACTS',                      label: 'Caregiver Support',         color: '#8c564b' },
  { slug: 'norc',         dataValue: 'NATURALLY OCCURING RETIREMENT COMMUNITY CONTRACTS', label: 'NORC',                      color: '#e377c2' },
  { slug: 'transport',    dataValue: 'TRANSPORTATION SERVICES CONTRACTS',                 label: 'Transportation',            color: '#17becf' },
  { slug: 'elder-abuse',  dataValue: 'ELDER ABUSE SERVICES CONTRACTS',                    label: 'Elder Abuse Prevention',    color: '#bcbd22' },
  { slug: 'geriatric-mh', dataValue: 'GERIATRIC MENTAL HEALTH SERVICES CONTRACTS',        label: 'Geriatric Mental Health',   color: '#7f7f7f' },
  { slug: 'ny-connects',  dataValue: 'NEW YORK CONNECTS CONTRACTS',                       label: 'NY Connects',               color: '#aec7e8' }
]

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]))
