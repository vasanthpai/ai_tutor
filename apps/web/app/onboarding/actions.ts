'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface OnboardingData {
  target_role: string
  experience_years: number
  current_company: string
  target_companies: string[]
  interview_date: string | null
  declared_strengths: string[]
  declared_weaknesses: string[]
}

export async function saveOnboarding(data: OnboardingData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: user.id,
      target_role: data.target_role,
      experience_years: data.experience_years,
      current_company: data.current_company || null,
      target_companies: data.target_companies,
      interview_date: data.interview_date || null,
      declared_strengths: data.declared_strengths,
      declared_weaknesses: data.declared_weaknesses,
    })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}