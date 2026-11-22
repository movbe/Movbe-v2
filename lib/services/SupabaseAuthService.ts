import type { User } from '@supabase/supabase-js'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export class SupabaseAuthService {
  async signIn(email: string, password: string): Promise<User> {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      throw error ?? new Error('Sign in failed')
    }
    return data.user
  }

  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) throw new Error('Supabase is not configured')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0] },
      },
    })
    if (error || !data.user) {
      throw error ?? new Error('Sign up failed')
    }

    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      display_name: displayName || email.split('@')[0],
    })

    return data.user
  }

  async signOut(): Promise<void> {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async resetPassword(email: string, redirectTo?: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) throw new Error('Supabase is not configured')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
    })
    if (error) throw error
  }

  async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return null
    const { data } = await supabase.auth.getUser()
    return data.user ?? null
  }
}

export const supabaseAuthService = new SupabaseAuthService()
