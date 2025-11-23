import { createBrowserClient } from "@supabase/ssr"

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are missing. Check your .env file or Vercel project settings.")
    // Return a dummy client that will fail gracefully on requests rather than crashing immediately
    return createBrowserClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
