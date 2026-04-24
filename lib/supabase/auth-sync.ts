import { supabase } from './client'

export async function syncSessionToCookies() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const response = await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        }),
      })
      return response.ok
    }
    return false
  } catch (error) {
    console.error('Failed to sync session to cookies:', error)
    return false
  }
}