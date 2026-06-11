'use client'

import { useState } from 'react'
import { saveOnboarding, type OnboardingData } from './actions'

// ─── Constants ──────────────────────────────────────────────
const ROLES = [
  'Software Engineer (SDE-1)',
  'Software Engineer (SDE-2)',
  'Senior Software Engineer',
  'Staff Engineer',
  'Engineering Manager',
]

const COMPANIES = ['Google', 'Meta', 'Apple', 'Amazon', 'Netflix', 'Microsoft', 'Flipkart', 'Swiggy', 'Zepto', 'Other']

const SKILLS = ['DSA', 'System Design', 'Behavioral', 'React/Frontend', 'Backend/APIs', 'Databases', 'Leadership', 'Problem Solving']

// ─── Styles (reusable objects) ───────────────────────────────
const card: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '16px',
  padding: '2.5rem',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  width: '100%',
  maxWidth: '520px',
}

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  marginBottom: '0.5rem',
  color: '#374151',
}

const input: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1a1a1a',
}

const select: React.CSSProperties = { ...input, backgroundColor: 'white' }

const primaryBtn: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#01696f',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
}

const secondaryBtn: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  backgroundColor: 'white',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
}

const chipBase: React.CSSProperties = {
  padding: '0.4rem 0.9rem',
  borderRadius: '999px',
  fontSize: '0.875rem',
  cursor: 'pointer',
  border: '1.5px solid #d1d5db',
  backgroundColor: 'white',
  color: '#374151',
  fontWeight: '500',
  transition: 'all 0.15s',
}

const chipActive: React.CSSProperties = {
  ...chipBase,
  backgroundColor: '#e6f4f4',
  borderColor: '#01696f',
  color: '#01696f',
}

// ─── Chip Toggle Component ───────────────────────────────────
function ChipGroup({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
}) {
  function toggle(item: string) {
    onChange(
      selected.includes(item)
        ? selected.filter(s => s !== item)
        : [...selected, item]
    )
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          style={selected.includes(option) ? chipActive : chipBase}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// ─── Progress Bar ────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        fontSize: '0.8rem',
        color: '#6b7280',
      }}>
        <span>Step {step} of {total}</span>
        <span>{Math.round((step / total) * 100)}% complete</span>
      </div>
      <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '999px' }}>
        <div style={{
          height: '100%',
          width: `${(step / total) * 100}%`,
          backgroundColor: '#01696f',
          borderRadius: '999px',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState<OnboardingData>({
    target_role: '',
    experience_years: 0,
    current_company: '',
    target_companies: [],
    interview_date: null,
    declared_strengths: [],
    declared_weaknesses: [],
  })

  function update(fields: Partial<OnboardingData>) {
    setData(prev => ({ ...prev, ...fields }))
  }

  // ── Step validation ──
  function canProceed(): boolean {
    if (step === 1) return data.target_role !== '' && data.experience_years >= 0
    if (step === 2) return true // optional fields
    if (step === 3) return data.declared_strengths.length > 0 && data.declared_weaknesses.length > 0
    return false
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const result = await saveOnboarding(data)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7f6f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={card}>
        <ProgressBar step={step} total={3} />

        {/* ── Step 1: Role and Experience ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.4rem' }}>
              What are you preparing for?
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
              This helps the mentor tailor questions to your target level.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={label}>Target Role</label>
              <select
                style={select}
                value={data.target_role}
                onChange={e => update({ target_role: e.target.value })}
              >
                <option value="">Select a role...</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={label}>Years of Experience</label>
              <input
                style={input}
                type="number"
                min={0}
                max={30}
                value={data.experience_years}
                onChange={e => update({ experience_years: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 5"
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={label}>Current Company <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span></label>
              <input
                style={input}
                type="text"
                value={data.current_company}
                onChange={e => update({ current_company: e.target.value })}
                placeholder="e.g. DAZN, TCS, Infosys..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{ ...primaryBtn, opacity: canProceed() ? 1 : 0.5 }}
                disabled={!canProceed()}
                onClick={() => setStep(2)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Target Companies + Interview Date ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.4rem' }}>
              Where do you want to work?
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
              Optional — helps the mentor focus on company-specific patterns.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={label}>Target Companies</label>
              <ChipGroup
                options={COMPANIES}
                selected={data.target_companies}
                onChange={val => update({ target_companies: val })}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={label}>Upcoming Interview Date <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span></label>
              <input
                style={input}
                type="date"
                value={data.interview_date || ''}
                onChange={e => update({ interview_date: e.target.value || null })}
              />
              {data.interview_date && (
                <p style={{ fontSize: '0.8rem', color: '#01696f', marginTop: '0.4rem' }}>
                  ⚡ Urgency mode will activate closer to this date
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button style={secondaryBtn} onClick={() => setStep(1)}>← Back</button>
              <button style={primaryBtn} onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Strengths and Weaknesses ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.4rem' }}>
              Know yourself
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
              The mentor uses this to focus on what matters most. Be honest — it helps!
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={label}>Your Strengths <span style={{ color: '#6b7280', fontWeight: '400' }}>(pick at least 1)</span></label>
              <ChipGroup
                options={SKILLS}
                selected={data.declared_strengths}
                onChange={val => update({ declared_strengths: val })}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={label}>Your Weaknesses <span style={{ color: '#6b7280', fontWeight: '400' }}>(pick at least 1)</span></label>
              <ChipGroup
                options={SKILLS}
                selected={data.declared_weaknesses}
                onChange={val => update({ declared_weaknesses: val })}
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.75rem',
                color: '#dc2626',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={secondaryBtn} onClick={() => setStep(2)}>← Back</button>
              <button
                style={{ ...primaryBtn, opacity: canProceed() && !loading ? 1 : 0.5 }}
                disabled={!canProceed() || loading}
                onClick={handleSubmit}
              >
                {loading ? 'Saving...' : 'Start preparing 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}