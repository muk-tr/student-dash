"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [student, setStudent] = useState<any>(null)

  const handleLogin = (studentData: any) => {
    setStudent(studentData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setStudent(null)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Dynamic background with gradient and pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] filter contrast-150 brightness-100"></div>

        {/* Decorative circles - subtle and deep */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[100px]"></div>

        <div className="relative z-10 w-full max-w-md px-4">
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  return <Dashboard student={student} onLogout={handleLogout} />
}
