import { createClient } from "@supabase/supabase-js";

function getSupabaseEnv() {
  const url = "https://anmmmscvpeljxkfmfgma.supabase.co";
  const key = "sb_publishable_eI6j3t0F0VC996r63-vOYQ_73YSz725";

  if (!url || !key) {
    throw new Error("Variaveis de ambiente do Supabase nao configuradas.");
  }

  return { url, key };
}

export function createSupabaseApiClient() {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
