import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://bgnupdzekwbphwzqegtl.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbnVwZHpla3dicGh3enFlZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MDY3MDYsImV4cCI6MjEwMDE4MjcwNn0.cWOpseellzyzmbHKeIbdob24TYUnHGVoUOLIgvGl_Lc";

const envUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(/^['"]|['"]$/g, "").trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").replace(/^['"]|['"]$/g, "").trim();

const supabaseUrl = (envUrl.length > 0 && !envUrl.includes("placeholder") && !envUrl.includes("your-supabase")) ? envUrl : DEFAULT_URL;
const supabaseAnonKey = (envKey.length > 0 && !envKey.includes("placeholder") && !envKey.includes("your-supabase")) ? envKey : DEFAULT_KEY;

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});


