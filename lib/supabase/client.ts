import { createBrowserClient } from "@supabase/ssr"

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing. Please check your project configuration.")
    // Return a client with empty strings to prevent initialization crash,
    // requests will fail with authentication errors which can be handled.
    return createBrowserClient(supabaseUrl || "", supabaseAnonKey || "")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
