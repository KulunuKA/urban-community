import React, { useState, useEffect, useCallback } from 'react'
import { recyclingService } from '@/services/recycling.service'
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Recycle,
  Loader2,
  X,
  Filter,
  Building2,
} from 'lucide-react'

const WASTE_TYPES = [
  { value: 'plastic', label: 'Plastic', icon: '♻️', color: '#3b82f6' },
  { value: 'glass', label: 'Glass', icon: '🪟', color: '#8b5cf6' },
  { value: 'paper', label: 'Paper', icon: '📄', color: '#f59e0b' },
  { value: 'metal', label: 'Metal', icon: '🔩', color: '#6b7280' },
  { value: 'ewaste', label: 'E-Waste', icon: '💻', color: '#ef4444' },
  { value: 'organic', label: 'Organic', icon: '🌿', color: '#10b981' },
]

export default function RecyclingCentersPage() {
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [wasteFilter, setWasteFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchCenters = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchText.trim()) params.search = searchText.trim()
      if (cityFilter.trim()) params.city = cityFilter.trim()
      if (wasteFilter) params.wasteType = wasteFilter
      const res = await recyclingService.searchCenters(params)
      setCenters(res.data || [])
    } catch (err) {
      console.error('Failed to fetch centers:', err)
      setCenters([])
    } finally {
      setLoading(false)
    }
  }, [searchText, cityFilter, wasteFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCenters()
    }, 350)
    return () => clearTimeout(timer)
  }, [fetchCenters])

  const clearFilters = () => {
    setSearchText('')
    setCityFilter('')
    setWasteFilter('')
  }

  const hasActiveFilters = searchText || cityFilter || wasteFilter

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
            }}
          >
            <Recycle size={26} color="#fff" />
          </div>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#0f172a',
                fontFamily: "'Lora', Georgia, serif",
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Recycling Centers
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#64748b',
                margin: '4px 0 0',
                fontWeight: 500,
              }}
            >
              Find nearby recycling centers and drop-off points
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div
        style={{
          borderRadius: 16,
          border: '1px solid rgba(226, 232, 240, 0.9)',
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 4px 16px rgba(148, 163, 184, 0.1)',
          backdropFilter: 'blur(12px)',
          padding: 20,
          marginBottom: 20,
        }}
      >
        {/* Main search input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="#94a3b8"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            id="center-search"
            type="text"
            placeholder="Search by name, address, or city..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 14px 13px 44px',
              borderRadius: 12,
              border: '1.5px solid #e2e8f0',
              fontSize: 14,
              color: '#1e293b',
              background: '#f8fafc',
              outline: 'none',
              transition: 'border 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#8b5cf6')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText('')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                color: '#94a3b8',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
          }}
        >
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              background: showFilters ? '#f5f3ff' : '#fff',
              color: showFilters ? '#7c3aed' : '#64748b',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Filter size={14} />
            Filters
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: '#fef2f2',
                color: '#ef4444',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid #f1f5f9',
            }}
          >
            {/* City filter */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <Building2 size={12} color="#8b5cf6" />
                City
              </label>
              <input
                id="center-city-filter"
                type="text"
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #e2e8f0',
                  fontSize: 13,
                  color: '#1e293b',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#8b5cf6')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* Waste type filter */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <Recycle size={12} color="#8b5cf6" />
                Waste Type
              </label>
              <select
                id="center-waste-filter"
                value={wasteFilter}
                onChange={(e) => setWasteFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #e2e8f0',
                  fontSize: 13,
                  color: wasteFilter ? '#1e293b' : '#94a3b8',
                  background: '#f8fafc',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">All types</option>
                {WASTE_TYPES.map((wt) => (
                  <option key={wt.value} value={wt.value}>
                    {wt.icon} {wt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 8px 32px rgba(148, 163, 184, 0.12)',
          }}
        >
          <Loader2
            size={32}
            color="#8b5cf6"
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <p
            style={{
              marginTop: 12,
              color: '#64748b',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Searching recycling centers...
          </p>
        </div>
      ) : centers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 8px 32px rgba(148, 163, 184, 0.12)',
          }}
        >
          <Recycle size={40} color="#cbd5e1" />
          <p
            style={{
              marginTop: 12,
              color: '#64748b',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            No recycling centers found
          </p>
          <p
            style={{
              marginTop: 4,
              color: '#94a3b8',
              fontSize: 13,
            }}
          >
            {hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'No centers have been added yet'}
          </p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p
            style={{
              fontSize: 13,
              color: '#94a3b8',
              fontWeight: 500,
              marginBottom: 14,
            }}
          >
            {centers.length} center{centers.length !== 1 ? 's' : ''} found
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {centers.map((center) => (
              <div
                key={center._id}
                style={{
                  borderRadius: 18,
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  background: 'rgba(255,255,255,0.92)',
                  boxShadow: '0 4px 20px rgba(148, 163, 184, 0.1)',
                  backdropFilter: 'blur(12px)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 8px 30px rgba(139, 92, 246, 0.12)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 4px 20px rgba(148, 163, 184, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Card header */}
                <div style={{ padding: '20px 24px 0' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: '#1e293b',
                          margin: 0,
                        }}
                      >
                        {center.name}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          marginTop: 6,
                          color: '#64748b',
                          fontSize: 13,
                        }}
                      >
                        <MapPin size={13} />
                        <span>
                          {center.address}, {center.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Waste type chips */}
                <div
                  style={{
                    padding: '14px 24px 0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}
                >
                  {center.wasteTypes?.map((wt) => {
                    const info = WASTE_TYPES.find((w) => w.value === wt)
                    return (
                      <span
                        key={wt}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: info
                            ? `${info.color}12`
                            : 'rgba(100,116,139,0.1)',
                          color: info ? info.color : '#64748b',
                          border: `1px solid ${info ? `${info.color}30` : 'rgba(100,116,139,0.2)'}`,
                        }}
                      >
                        <span style={{ fontSize: 13 }}>
                          {info?.icon || '🗑️'}
                        </span>
                        {info?.label || wt}
                      </span>
                    )
                  })}
                </div>

                {/* Contact info row */}
                <div
                  style={{
                    padding: '16px 24px 18px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 18,
                  }}
                >
                  {center.contactNumber && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        color: '#64748b',
                      }}
                    >
                      <Phone size={13} color="#8b5cf6" />
                      <span>{center.contactNumber}</span>
                    </div>
                  )}
                  {center.openHours && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        color: '#64748b',
                      }}
                    >
                      <Clock size={13} color="#8b5cf6" />
                      <span>{center.openHours}</span>
                    </div>
                  )}
                  {!center.contactNumber && !center.openHours && (
                    <span
                      style={{
                        fontSize: 12,
                        color: '#cbd5e1',
                        fontStyle: 'italic',
                      }}
                    >
                      No contact info available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
