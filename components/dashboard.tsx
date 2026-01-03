"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/lib/auth-context"
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
} from "lucide-react"
import { ParticipantGradesView } from "@/components/participant-grades-view"
import { DetailedGradesView } from "@/components/detailed-grades-view"

export function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  if (!user) return null

  // Helper to format name
  const nameParts = user.fullName.split(' ')
  const firstName = nameParts[0]
  const avatarFallback = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : `${nameParts[0][0]}${nameParts[0][1] || ''}`.toUpperCase()

  // Calculate stats
  const completedModules = user.modules.filter(m => m.status === 'Completed')
  const inProgressModules = user.modules.filter(m => m.status === 'In Progress')
  const gpa = user.modules.length > 0
    ? (user.modules.reduce((sum, m) => sum + (m.gradePoint || 0), 0) / user.modules.length).toFixed(2)
    : "0.00"

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "In Progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Participant Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-white/50">
                  <AvatarFallback className="bg-white/10 text-white font-bold">{avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {firstName}!</h2>
                  <p className="text-blue-100">
                    {user.enrolledPrograms?.[0]?.title || "Program"}
                  </p>
                </div>
              </div>
              <div className="flex gap-8 text-center md:text-right">
                <div>
                  <div className="text-3xl font-bold">{gpa}</div>
                  <div className="text-blue-100 text-sm">GPA</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{user.modules.length}</div>
                  <div className="text-blue-100 text-sm">Modules</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Profile Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium truncate" title={user.fullName}>{user.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{"-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{user.parish || user.deanery || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="details">Detailed View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedModules.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inProgressModules.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Modules</CardTitle>
                <CardDescription>Modules you are currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressModules.length > 0 ? (
                    inProgressModules.map((mod) => (
                      <div key={mod._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <h4 className="font-medium">{mod.module.title}</h4>
                          {/* <p className="text-sm text-muted-foreground">{mod.module.code}</p> Code not in schema */}
                        </div>
                        <Badge className={getStatusColor(mod.status)}>{mod.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No active modules at the moment.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <ParticipantGradesView />
          </TabsContent>

          <TabsContent value="details">
            <DetailedGradesView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
