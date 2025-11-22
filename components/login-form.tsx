"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, User, Lock, Users } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface LoginFormProps {
  onLogin: (student: any) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [participantId, setParticipantId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = getSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log(`[v0] Attempting login for ID: ${participantId}`)

    try {
      const { data: student, error: dbError } = await supabase
        .from("students")
        .select("*")
        .eq("id", participantId)
        .single()

      if (dbError) {
        console.error("[v0] Database error during login:", dbError)
      }

      if (dbError || !student) {
        console.log("[v0] Student not found or error")
        setError("Invalid participant ID. Please check your ID and try again.")
        setIsLoading(false)
        return
      }

      console.log("[v0] Student found:", { id: student.id, hasPassword: !!student.password_hash })

      // Compare plaintext passwords for this demo
      if (student.password_hash === password) {
        console.log("[v0] Password match successful")
        const studentData = {
          ...student,
          password: student.password_hash,
        }
        onLogin(studentData)
      } else {
        console.log("[v0] Password mismatch")
        setError("Invalid password. Please check your password and try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-slate-900 transition-colors duration-300">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold dark:text-white">Participant Portal</CardTitle>
          <CardDescription className="dark:text-gray-400">Sign in to access your academic dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participantId" className="dark:text-gray-200">
                Participant ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="participantId"
                  type="text"
                  placeholder="Enter your participant ID"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-200">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Demo Credentials:</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-medium">Participant ID</div>
                  <div>ST001</div>
                  <div>ST002</div>
                  <div>ST003</div>
                  <div>ST004</div>
                </div>
                <div>
                  <div className="font-medium">Password</div>
                  <div>john123</div>
                  <div>emily456</div>
                  <div>mike789</div>
                  <div>sarah321</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
