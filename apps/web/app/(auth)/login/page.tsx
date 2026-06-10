'use client'

import { useState } from 'react'
import { signIn } from '../actions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7f6f2',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Welcome back
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Sign in to continue your interview prep
        </p>

        <form action={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem' }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '0.6rem 0.8rem',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem' }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="Your password"
              style={{
                width: '100%', padding: '0.6rem 0.8rem',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '0.75rem',
              color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.75rem',
              backgroundColor: loading ? '#9ca3af' : '#01696f',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          No account yet?{' '}
          <Link href="/signup" style={{ color: '#01696f', fontWeight: '500' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}