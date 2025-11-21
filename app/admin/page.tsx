"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminPanel } from "@/components/admin-panel"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = sessionStorage.getItem("adminAuthenticated")
    console.log("Admin auth status:", adminAuth) // Debug log

    if (adminAuth === "true") {
      setIsAuthenticated(true)
      setIsLoading(false)
    } else {
      console.log("Not authenticated, redirecting to login") // Debug log
      setIsLoading(false)
      router.push("/admin/login")
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return <AdminPanel />
}
