import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ── Typed helpers ────────────────────────────────────────────

export const db = {
  profiles: () => supabase.from('profiles'),
  stands: () => supabase.from('stands'),
  parts: () => supabase.from('parts'),
  memberships: () => supabase.from('part_memberships'),
  chat: () => supabase.from('chat_messages'),
  reviews: () => supabase.from('stand_reviews'),
}
