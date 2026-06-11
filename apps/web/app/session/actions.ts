'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function startSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Create a new session
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      session_type: 'practice',
      status: 'in_progress',
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create session:', error)
    redirect('/dashboard')
  }

  redirect(`/session?sessionId=${data.id}`)
}

export async function completeSession(sessionId: string, overallScore: number, aiSummary: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('sessions')
    .update({
      status: 'completed',
      overall_score: overallScore,
      ai_summary: aiSummary,
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to complete session:', error)
    redirect('/dashboard')
  }

  redirect('/dashboard')
}