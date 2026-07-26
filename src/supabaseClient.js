import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes. Ajoute-les dans les réglages de ton hébergeur (Environment Variables)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
