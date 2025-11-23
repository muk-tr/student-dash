"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User, ShieldCheck } from "lucide-react"
import { loginAdmin } from "@/lib/auth"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await loginAdmin(username, password)

    if (result.success) {
      router.push("/admin")
      router.refresh()
    } else {
      setError(result.error || "Invalid credentials")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-950 to-gray-900 opacity-100 z-0"></div>

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shadow-inner ring-1 ring-emerald-100/50 dark:ring-emerald-900/30">
            <ShieldCheck className="h-10 w-10 text-emerald-700 dark:text-emerald-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-100">Admin Access</CardTitle>
          <CardDescription className="text-base mt-2 text-slate-600 dark:text-slate-400">
            Secure portal for academic administration
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Administrator ID
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Secure Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-3 rounded-md text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 text-lg font-medium bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white transition-all shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Login to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
