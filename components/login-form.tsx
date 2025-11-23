"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, User, Lock, ArrowRight } from "lucide-react"
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

    try {
      const { data: student, error: dbError } = await supabase
        .from("students")
        .select("*")
        .eq("id", participantId)
        .single()

      if (dbError) {
        console.error("Database connection error:", dbError.message)
        setError("Unable to connect to student database. Please try again later.")
        setIsLoading(false)
        return
      }

      if (!student) {
        setError("Invalid participant ID. Please check your ID and try again.")
        setIsLoading(false)
        return
      }

      if (student.password_hash === password) {
        const { data: coursesData } = await supabase.from("student_courses").select("*").eq("student_id", student.id)
        const { data: gradeHistoryData } = await supabase.from("grade_history").select("*").eq("student_id", student.id)

        const studentData = {
          ...student,
          password: student.password_hash,
          courses:
            coursesData?.map((c: any) => ({
              id: c.course_id,
              name: c.course_name,
              credits: c.credits,
              grade: c.grade || "-",
              gpa: c.gpa || 0,
              status: c.status,
              progress: c.progress || 0,
              mode: c.mode || "Physical",
              semester: c.semester,
            })) || [],
          gradeHistory:
            gradeHistoryData?.map((g: any) => ({
              semester: g.semester,
              gpa: g.gpa,
            })) || [],
        }

        onLogin(studentData)
      } else {
        setError("Invalid password. Please check your password and try again.")
      }
    } catch (err) {
      console.error("Login exception:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600"></div>
      <CardHeader className="text-center pt-8 pb-2">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 shadow-inner ring-1 ring-indigo-100/50 dark:ring-indigo-900/30">
          <GraduationCap className="h-10 w-10 text-indigo-700 dark:text-indigo-400" />
        </div>
        <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</CardTitle>
        <CardDescription className="text-base mt-2 text-slate-600 dark:text-slate-400">
          Access your academic records and results
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="participantId" className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
              Participant ID
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <Input
                id="participantId"
                type="text"
                placeholder="Enter your ID"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className="pl-10 h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all rounded-lg"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
              Password
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all rounded-lg"
                required
              />
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-red-100 dark:border-red-900/50">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0" />
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-indigo-700 to-blue-700 hover:from-indigo-800 hover:to-blue-800 text-white shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all duration-300 rounded-lg group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Sign In</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
