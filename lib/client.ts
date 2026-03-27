import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseKey = "sb_publishable_eI6j3t0F0VC996r63-vOYQ_73YSz725"

  return createBrowserClient(
    "https://anmmmscvpeljxkfmfgma.supabase.co"!,
    supabaseKey!
  )
}
