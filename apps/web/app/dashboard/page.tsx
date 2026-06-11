import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/(auth)/actions'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f6f2', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#01696f' }}>
          AI Interview Mentor
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {profile?.full_name || user.email}
          </span>
          <form action={signOut}>
            <button type="submit" style={{
              padding: '0.4rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>

        {/* Welcome card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.4rem' }}>
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! 👋
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Preparing for: <strong style={{ color: '#1a1a1a' }}>{userProfile?.target_role}</strong>
            {' · '}
            {userProfile?.experience_years} years experience
            {userProfile?.interview_date && (
              <> · 🗓 Interview on <strong>{new Date(userProfile.interview_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></>
            )}
          </p>
        </div>

        {/* Profile summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              💪 Your Strengths
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {userProfile?.declared_strengths?.map((s: string) => (
                <span key={s} style={{
                  padding: '0.3rem 0.7rem',
                  backgroundColor: '#e6f4f4',
                  color: '#01696f',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🎯 Focus Areas
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {userProfile?.declared_weaknesses?.map((w: string) => (
                <span key={w} style={{
                  padding: '0.3rem 0.7rem',
                  backgroundColor: '#fff7ed',
                  color: '#c2410c',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                }}>
                  {w}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Target companies */}
        {userProfile?.target_companies?.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🏢 Target Companies
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {userProfile.target_companies.map((c: string) => (
                <span key={c} style={{
                  padding: '0.3rem 0.7rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}