import { getSupabaseBrowserClient } from "./supabase/client"

export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false
  return localStorage.getItem("adminAuthenticated") === "true"
}

export async function loginAdmin(username: string, password: string) {
  // Check against hardcoded credentials for demo stability
  // In a real app, this would verify against the database hash securely
  if (username === "admin" && password === "admin123") {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminAuthenticated", "true")
      // Also set a cookie for middleware if needed
      document.cookie = "adminAuthenticated=true; path=/"
    }
    return { success: true }
  }

  // Optional: Check against database if hardcoded fails
  try {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.from("admins").select("*").eq("username", username).single()

    if (data && !error) {
      // Note: In production, compare hashes. For now/demo, direct comparison if plain text (not recommended)
      // or just return success if the row exists and we assume auth is handled elsewhere?
      // Since we only seeded one admin with a hash, and we don't have bcrypt on client...
      // We'll stick to the hardcoded check above for the main "admin" user.
    }
  } catch (e) {
    console.error("Auth check failed", e)
  }

  return { success: false, error: "Invalid credentials" }
}

export function logoutAdmin() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminAuthenticated")
    document.cookie = "adminAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}
