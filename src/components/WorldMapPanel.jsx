import { useEffect, useMemo, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'

const GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'
const MAP_WIDTH = 960
const MAP_HEIGHT = 500

function getFeatureCode(feature) {
  const code = feature.properties?.['ISO3166-1-Alpha-2']
  if (!code || code === '-99') return null
  return code
}

function getFeatureName(feature) {
  return feature.properties?.name || null
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0)
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' })
  } catch {
    return null
  }
})()

function getCountryLabel(code, fallbackName) {
  if (fallbackName) return fallbackName
  if (!code) return 'Unknown'

  const normalized = String(code).trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return String(code)

  try {
    return regionNames?.of(normalized) || normalized
  } catch {
    return normalized
  }
}

function getCountryFill(count, maxCount, isHovered) {
  if (!count) return 'var(--map-empty)'
  const intensity = maxCount > 0 ? count / maxCount : 0
  const alpha = 0.35 + intensity * 0.65
  if (isHovered) return `rgba(255, 208, 96, ${Math.min(alpha + 0.1, 1)})`
  return `rgba(201, 162, 39, ${alpha})`
}

export default function WorldMapPanel({ geoStats, loading }) {
  const [world, setWorld] = useState(null)
  const [hoveredCode, setHoveredCode] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false

    fetch(GEOJSON_URL)
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setWorld(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load world map.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const countByCode = useMemo(() => {
    const map = new Map()
    for (const row of geoStats?.countries || []) {
      map.set(row.code, row)
    }
    return map
  }, [geoStats])

  const maxCount = geoStats?.countries?.[0]?.count || 0

  const projection = useMemo(() => {
    if (!world) return null
    return geoNaturalEarth1().fitSize([MAP_WIDTH, MAP_HEIGHT], world)
  }, [world])

  const pathGenerator = useMemo(() => {
    if (!projection) return null
    return geoPath(projection)
  }, [projection])

  const hoveredCountry = hoveredCode ? countByCode.get(hoveredCode) : null
  const activeCountry = hoveredCountry || geoStats?.countries?.[0] || null

  return (
    <section className="panel geo-panel">
      <div className="panel-header">
        <div>
          <h2>User locations</h2>
          <p className="panel-subtitle">
            Countries and states/regions highlighted by registered users with location enabled
          </p>
        </div>
        <div className="geo-summary-pill">
          {formatNumber(geoStats?.locatedUsers || 0)} located users
        </div>
      </div>

      {loading ? (
        <p className="muted geo-loading">Loading location analytics…</p>
      ) : (
        <div className="geo-layout">
          <div className="geo-map-wrap">
            {loadError && <p className="error-banner">{loadError}</p>}

            {!loadError && world && pathGenerator && (
              <>
                <svg
                  viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                  className="geo-map"
                  role="img"
                  aria-label="World map of user locations"
                >
                  <rect width={MAP_WIDTH} height={MAP_HEIGHT} className="geo-map-ocean" />
                  {world.features.map((feature) => {
                    const code = getFeatureCode(feature)
                    if (!code) return null

                    const country = countByCode.get(code)
                    const count = country?.count || 0
                    const isHovered = hoveredCode === code
                    const countryLabel = getCountryLabel(code, country?.name || getFeatureName(feature))

                    return (
                      <path
                        key={code}
                        d={pathGenerator(feature)}
                        className={`geo-country${count ? ' geo-country-active' : ''}${isHovered ? ' geo-country-hover' : ''}`}
                        fill={getCountryFill(count, maxCount, isHovered)}
                        stroke={isHovered ? '#ffd060' : count ? 'rgba(255, 208, 96, 0.85)' : 'rgba(60, 70, 92, 0.9)'}
                        strokeWidth={isHovered ? 1.5 : count ? 1 : 0.5}
                        onMouseEnter={() => setHoveredCode(code)}
                        onMouseLeave={() => setHoveredCode(null)}
                      >
                        <title>
                          {countryLabel + (count ? `: ${count} users` : ': No users')}
                        </title>
                      </path>
                    )
                  })}
                </svg>

                <div className="geo-legend">
                  <span>Low</span>
                  <div className="geo-legend-bar" />
                  <span>High</span>
                </div>
              </>
            )}

            {!loadError && !world && <p className="muted geo-loading">Loading map…</p>}
          </div>

          <aside className="geo-side">
            <div className="geo-side-card">
              <h3>{activeCountry ? getCountryLabel(activeCountry.code, activeCountry.name) : 'No location data yet'}</h3>
              {activeCountry ? (
                <>
                  <p className="geo-side-count">{formatNumber(activeCountry.count)} users</p>
                  <p className="muted geo-side-meta">Country code: {activeCountry.code}</p>
                </>
              ) : (
                <p className="muted">
                  Users appear here after they sign in and allow browser location access.
                </p>
              )}
            </div>

            <div className="geo-side-card">
              <h4>Top countries</h4>
              {geoStats?.countries?.length ? (
                <ul className="geo-list">
                  {geoStats.countries.slice(0, 8).map((row) => (
                    <li key={row.code}>
                      <button
                        type="button"
                        className={`geo-list-btn${hoveredCode === row.code ? ' active' : ''}`}
                        onMouseEnter={() => setHoveredCode(row.code)}
                        onMouseLeave={() => setHoveredCode(null)}
                        onFocus={() => setHoveredCode(row.code)}
                        onBlur={() => setHoveredCode(null)}
                      >
                        <span>{getCountryLabel(row.code, row.name)}</span>
                        <strong>{formatNumber(row.count)}</strong>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No country data yet.</p>
              )}
            </div>

            <div className="geo-side-card">
              <h4>Top states / regions</h4>
              {geoStats?.regions?.length ? (
                <ul className="geo-list">
                  {geoStats.regions.slice(0, 10).map((row) => (
                    <li key={`${row.countryCode}-${row.region}`}>
                      <div className="geo-region-row">
                        <span>
                          {row.region}
                          <em>{row.country || getCountryLabel(row.countryCode)}</em>
                        </span>
                        <strong>{formatNumber(row.count)}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Region data appears after reverse geocoding user coordinates.</p>
              )}
            </div>

            {geoStats?.pendingGeocode > 0 && (
              <p className="muted geo-note">
                {formatNumber(geoStats.pendingGeocode)} users still need geocoding. Refresh again in a moment.
              </p>
            )}
          </aside>
        </div>
      )}
    </section>
  )
}
