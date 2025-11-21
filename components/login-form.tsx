"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, User, Lock, Users } from "lucide-react"
import { studentsDatabase } from "@/lib/student-data"

interface LoginFormProps {
  onLogin: (student: any) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [participantId, setParticipantId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      // Get participant directly from studentsDatabase
      const participant = studentsDatabase[participantId as keyof typeof studentsDatabase]

      if (participant && participant.password === password) {
        onLogin(participant)
      } else if (participant && participant.password !== password) {
        setError("Invalid password. Please check your password and try again.")
      } else {
        setError("Invalid participant ID. Please check your ID and try again.")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Participant Portal</CardTitle>
          <CardDescription>Sign in to access your academic dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participantId">Participant ID</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="participantId"
                  type="text"
                  placeholder="Enter your participant ID"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Demo Credentials:</span>
            </div>
            <div className="text-xs text-gray-600 space-y-2">
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
