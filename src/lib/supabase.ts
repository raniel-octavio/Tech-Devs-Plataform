import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);
export const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP !== 'false';

// Cliente 100% front-end: só usa a anon key (pública por design).
// A proteção dos dados é feita pelo RLS no Supabase (veja supabase/schema.sql).
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key',
);
