import React, { useState, useEffect } from 'react'
import { message } from 'antd'
import { recyclingService } from '@/services/recycling.service'
import {
  Trash2,
  MapPin,
  Calendar,
  Weight,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  ChevronDown,
} from 'lucide-react'

const WASTE_TYPES = [
  { value: 'plastic', label: 'Plastic', icon: '♻️', color: '#3b82f6' },
  { value: 'glass', label: 'Glass', icon: '🪟', color: '#8b5cf6' },
  { value: 'paper', label: 'Paper', icon: '📄', color: '#f59e0b' },
  { value: 'metal', label: 'Metal', icon: '🔩', color: '#6b7280' },
  { value: 'ewaste', label: 'E-Waste', icon: '💻', color: '#ef4444' },
  { value: 'organic', label: 'Organic', icon: '🌿', color: '#10b981' },
]

const STATUS_CONFIG = {
  Pending: {
    icon: Clock,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.25)',
    label: 'Pending',
  },
  Accepted: {
    icon: CheckCircle2,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.25)',
    label: 'Accepted',
  },
  Collected: {
    icon: Package,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.25)',
    label: 'Collected',
  },
  Rejected: {
    icon: XCircle,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.25)',
    label: 'Rejected',
  },
}

const initialFormState = {
  wasteType: '',
  quantityKg: '',
  pickupDate: '',
  address: '',
  city: '',
  notes: '',
}

export default function GarbagePickupRequestPage() {
  const [form, setForm] = useState(initialFormState)
  const [submitting, setSubmitting] = useState(false)
  const [requests, setRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [activeTab, setActiveTab] = useState('form') // 'form' | 'history'

  useEffect(() => {
    fetchMyRequests()
  }, [])

  const fetchMyRequests = async () => {
    setLoadingRequests(true)
    try {
      const res = await recyclingService.getMyPickupRequests()
      setRequests(res.data || [])
    } catch (err) {
      console.error('Failed to load requests:', err)
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleWasteSelect = (wasteType) => {
    setForm((prev) => ({ ...prev, wasteType }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.wasteType) {
      message.warning('Please select a waste type')
      return
    }
    if (!form.quantityKg || Number(form.quantityKg) <= 0) {
      message.warning('Please enter a valid quantity')
      return
    }
    if (!form.pickupDate) {
      message.warning('Please select a pickup date')
      return
    }
    if (!form.address.trim()) {
      message.warning('Please enter your address')
      return
    }
    if (!form.city.trim()) {
      message.warning('Please enter your city')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        quantityKg: Number(form.quantityKg),
      }
      await recyclingService.createPickupRequest(payload)
      message.success('Pickup request submitted successfully!')
      setForm(initialFormState)
      setActiveTab('history')
      fetchMyRequests()
    } catch (err) {
      const errMsg =
        err.response?.data?.message || 'Failed to submit pickup request'
      message.error(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const selectedWaste = WASTE_TYPES.find((w) => w.value === form.wasteType)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Page Header */}
      <header style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Trash2 size={26} color="#fff" />
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
              Garbage Pickup Request
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#64748b',
                margin: '4px 0 0',
                fontWeight: 500,
              }}
            >
              Schedule a waste collection from your doorstep
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          borderRadius: 14,
          background: '#f1f5f9',
          marginBottom: 28,
        }}
      >
        {[
          { key: 'form', label: 'New Request', icon: Send },
          { key: 'history', label: 'My Requests', icon: Clock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 11,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === key ? '#fff' : 'transparent',
              color: activeTab === key ? '#10b981' : '#64748b',
              boxShadow:
                activeTab === key
                  ? '0 2px 8px rgba(0,0,0,0.08)'
                  : 'none',
            }}
          >
            <Icon size={16} />
            {label}
            {key === 'history' && requests.length > 0 && (
              <span
                style={{
                  background:
                    activeTab === key ? '#10b981' : '#94a3b8',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: 20,
                  minWidth: 20,
                  textAlign: 'center',
                }}
              >
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Form Tab */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmit}>
          <div
            style={{
              borderRadius: 20,
              border: '1px solid rgba(226, 232, 240, 0.9)',
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 8px 32px rgba(148, 163, 184, 0.12)',
              backdropFilter: 'blur(12px)',
              overflow: 'hidden',
            }}
          >
            {/* Waste Type Selection */}
            <div style={{ padding: '28px 28px 0' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <Trash2 size={14} color="#10b981" />
                Waste Type
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                }}
              >
                {WASTE_TYPES.map((wt) => {
                  const isSelected = form.wasteType === wt.value
                  return (
                    <button
                      key={wt.value}
                      type="button"
                      onClick={() => handleWasteSelect(wt.value)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        padding: '14px 8px',
                        borderRadius: 14,
                        border: `2px solid ${isSelected ? wt.color : '#e2e8f0'}`,
                        background: isSelected
                          ? `${wt.color}10`
                          : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{wt.icon}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: isSelected ? wt.color : '#64748b',
                        }}
                      >
                        {wt.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity & Date Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                padding: '24px 28px 0',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <Weight size={14} color="#10b981" />
                  Quantity (kg)
                </label>
                <input
                  id="pickup-quantity"
                  type="number"
                  name="quantityKg"
                  value={form.quantityKg}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  min="1"
                  step="0.5"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 14,
                    color: '#1e293b',
                    background: '#f8fafc',
                    outline: 'none',
                    transition: 'border 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = '#10b981')
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = '#e2e8f0')
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <Calendar size={14} color="#10b981" />
                  Pickup Date
                </label>
                <input
                  id="pickup-date"
                  type="date"
                  name="pickupDate"
                  value={form.pickupDate}
                  onChange={handleChange}
                  min={today}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #e2e8f0',
                    fontSize: 14,
                    color: '#1e293b',
                    background: '#f8fafc',
                    outline: 'none',
                    transition: 'border 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = '#10b981')
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = '#e2e8f0')
                  }
                />
              </div>
            </div>

            {/* Address */}
            <div style={{ padding: '24px 28px 0' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <MapPin size={14} color="#10b981" />
                Address
              </label>
              <input
                id="pickup-address"
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Your street address"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #e2e8f0',
                  fontSize: 14,
                  color: '#1e293b',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = '#10b981')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = '#e2e8f0')
                }
              />
            </div>

            {/* City */}
            <div style={{ padding: '24px 28px 0' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <MapPin size={14} color="#10b981" />
                City
              </label>
              <input
                id="pickup-city"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Your city"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #e2e8f0',
                  fontSize: 14,
                  color: '#1e293b',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = '#10b981')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = '#e2e8f0')
                }
              />
            </div>

            {/* Notes */}
            <div style={{ padding: '24px 28px 0' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <FileText size={14} color="#10b981" />
                Notes{' '}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    color: '#94a3b8',
                    textTransform: 'none',
                    letterSpacing: 0,
                  }}
                >
                  (optional)
                </span>
              </label>
              <textarea
                id="pickup-notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any additional instructions for the collector..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1.5px solid #e2e8f0',
                  fontSize: 14,
                  color: '#1e293b',
                  background: '#f8fafc',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'border 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = '#10b981')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = '#e2e8f0')
                }
              />
            </div>

            {/* Submit Button */}
            <div style={{ padding: '28px' }}>
              <button
                id="pickup-submit-btn"
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '14px 24px',
                  borderRadius: 14,
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                  background: submitting
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: submitting
                    ? 'none'
                    : '0 6px 20px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.02em',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      style={{
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Pickup Request
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          {loadingRequests ? (
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
                color="#10b981"
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
                Loading your requests...
              </p>
            </div>
          ) : requests.length === 0 ? (
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
              <Package size={40} color="#cbd5e1" />
              <p
                style={{
                  marginTop: 12,
                  color: '#64748b',
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                No pickup requests yet
              </p>
              <p
                style={{
                  marginTop: 4,
                  color: '#94a3b8',
                  fontSize: 13,
                }}
              >
                Submit your first request using the "New Request" tab
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {requests.map((req) => {
                const wasteInfo = WASTE_TYPES.find(
                  (w) => w.value === req.wasteType,
                )
                const statusInfo =
                  STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending
                const StatusIcon = statusInfo.icon

                return (
                  <div
                    key={req._id}
                    style={{
                      borderRadius: 16,
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      background: 'rgba(255,255,255,0.92)',
                      boxShadow: '0 4px 16px rgba(148, 163, 184, 0.1)',
                      backdropFilter: 'blur(12px)',
                      padding: '20px 24px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 22 }}>
                          {wasteInfo?.icon || '🗑️'}
                        </span>
                        <div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#1e293b',
                              margin: 0,
                            }}
                          >
                            {wasteInfo?.label || req.wasteType} —{' '}
                            {req.quantityKg} kg
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: '#94a3b8',
                              margin: '2px 0 0',
                            }}
                          >
                            {new Date(req.pickupDate).toLocaleDateString(
                              'en-US',
                              {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          borderRadius: 20,
                          background: statusInfo.bg,
                          border: `1px solid ${statusInfo.border}`,
                        }}
                      >
                        <StatusIcon size={13} color={statusInfo.color} />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#64748b',
                        fontSize: 13,
                      }}
                    >
                      <MapPin size={13} />
                      <span>
                        {req.address}, {req.city}
                      </span>
                    </div>

                    {req.notes && (
                      <p
                        style={{
                          fontSize: 13,
                          color: '#94a3b8',
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: '1px solid #f1f5f9',
                          fontStyle: 'italic',
                        }}
                      >
                        {req.notes}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
