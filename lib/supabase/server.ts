import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const cookieStorage = async () => {
  const cookieStore = await cookies()

  console.log(cookieStorage);

  return {
    getItem: (key: string) => cookieStore.get(key)?.value ?? null,
    // setItem / removeItem throw in server components (read-only);
    // wrapping in try-catch lets server components call getUser() safely.
    setItem: (key: string, value: string) => {
      try {
        cookieStore.set(key, value)
      } catch {
        // no-op in server components
      }
      return undefined
    },
    removeItem: (key: string) => {
      try {
        cookieStore.delete(key)
      } catch {
        // no-op in server components
      }
      return undefined
    },
  }
}

export const createServerAuthClient = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add these values to your .env.local file.'
    )
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: await cookieStorage(),
    },
  })
}

export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing server-side Supabase environment variables. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env.local file. You can find the service role key in your Supabase dashboard under Settings > API.'
    )
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  })
}
