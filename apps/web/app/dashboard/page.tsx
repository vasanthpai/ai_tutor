import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/(auth)/actions'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Extra safety check — middleware handles this but belt-and-suspenders
  if (!user) redirect('/login')

  // Fetch the user's profile from our profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7f6f2',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#01696f' }}>
          AI Interview Mentor
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {profile?.full_name || user.email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              style={{
                padding: '0.4rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}! 👋
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Your interview prep dashboard is ready. Sessions and your skill profile will appear here.
          </p>

          {/* Debug info — remove later */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.875rem'
          }}>
            <strong>✅ Auth working:</strong>
            <br />User ID: {user.id}
            <br />Email: {user.email}
            <br />Tier: {profile?.tier || 'free'}
          </div>
        </div>
      </main>
    </div>
  )
}