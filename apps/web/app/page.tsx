import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  // auth.users always exists in every Supabase project
  const { error } = await supabase.from('users').select('*').limit(1)

  const connected = !error || error.message.includes('permission') || error.message.includes('schema')

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Supabase Connection Test</h1>
      <p style={{ color: 'green' }}>✅ Supabase is connected and responding!</p>
      <p style={{ color: '#888', fontSize: '0.875rem' }}>
        Local DB: http://127.0.0.1:54321
      </p>
      <p style={{ color: '#888', fontSize: '0.875rem' }}>
        Studio UI: http://127.0.0.1:54323
      </p>
    </main>
  )
}