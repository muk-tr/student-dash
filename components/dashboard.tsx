"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useStudents } from "@/lib/student-context"
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  Clock,
  LogOut,
  Star,
  Trophy,
  Target,
  BarChart3,
  Camera,
} from "lucide-react"
import { calculateGPA } from "@/lib/student-data"

interface DashboardProps {
  student: any
  onLogout: () => void
}

export function Dashboard({ student, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const { updateStudent } = useStudents()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const completedCourses = student.courses.filter((course: any) => course.status === "Completed")
  const inProgressCourses = student.courses.filter((course: any) => course.status === "In Progress")
  const registeredCourses = student.courses.filter((course: any) => course.status === "Registered")

  const overallProgress = Math.round(
    student.courses.reduce((sum: number, course: any) => sum + course.progress, 0) / student.courses.length,
  )

  const currentGPA = calculateGPA(student.courses)

  // Check for Certified Specialist achievement (grades above 90%)
  const hasHighGrades = completedCourses.some((course: any) => course.grade === "A" || course.grade === "A-")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Registered":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade === "A") return "text-green-600 font-bold"
    if (grade === "A-") return "text-green-500 font-bold"
    if (grade === "B+" || grade === "B") return "text-blue-600 font-bold"
    if (grade === "B-" || grade === "C+") return "text-yellow-600 font-bold"
    return "text-gray-500"
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateStudent(student.id, { avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Participant Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="h-16 w-16 border-2 border-white transition-opacity group-hover:opacity-80">
                    <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                    <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">
                      {student.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                    <Camera className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {student.name}!</h2>
                  <p className="text-blue-100">
                    {student.program} • {student.semester} • Class of {student.year}
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-3xl font-bold">{currentGPA}</div>
                <div className="text-blue-100">Current GPA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Modules</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.courses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCourses.length}</p>
                </div>
                <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressCourses.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-900 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Modules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Current Modules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inProgressCourses.map((course: any) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{course.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{course.instructor}</p>
                      </div>
                      <div className="text-right">
                        <Progress value={course.progress} className="w-20 mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">{course.progress}%</p>
                      </div>
                    </div>
                  ))}
                  {inProgressCourses.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No modules in progress</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasHighGrades && (
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-800 rounded-lg border border-yellow-200 dark:border-yellow-600">
                      <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-100">Certified Specialist</h4>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300">
                          Excellence in Performance (90%+ grades)
                        </p>
                      </div>
                    </div>
                  )}
                  {completedCourses.length >= 3 && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-800 rounded-lg border border-green-200 dark:border-green-600">
                      <Award className="h-6 w-6 text-green-600 dark:text-green-300" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-100">Module Completion</h4>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          Completed {completedCourses.length} modules
                        </p>
                      </div>
                    </div>
                  )}
                  {Number.parseFloat(currentGPA) >= 3.5 && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-800 rounded-lg border border-blue-200 dark:border-blue-600">
                      <Target className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-100">High Achiever</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300">GPA above 3.5</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">All Modules</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Your complete module enrollment and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.courses.map((course: any) => (
                    <div key={course.id} className="border dark:border-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold dark:text-white">{course.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {course.instructor} • {course.credits} credits • {course.semester}
                          </p>
                        </div>
                        <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Progress value={course.progress} className="flex-1 mr-4" />
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{course.progress}%</span>
                          {course.grade !== "-" && (
                            <span className={`text-sm font-medium ${getGradeColor(course.grade)}`}>{course.grade}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className="dark:text-white">Grade Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium dark:text-gray-400">Current GPA</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentGPA}</span>
                    </div>
                    <div className="space-y-2">
                      {student.gradeHistory.map((record: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b dark:border-gray-800"
                        >
                          <span className="text-sm dark:text-gray-400">{record.semester}</span>
                          <span className="font-medium dark:text-white">{record.gpa.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-white">Module Grades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedCourses.map((course: any) => (
                      <div
                        key={course.id}
                        className="flex justify-between items-center py-2 border-b dark:border-gray-800"
                      >
                        <div>
                          <p className="font-medium dark:text-white">{course.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{course.credits} credits</p>
                        </div>
                        <span className={`font-bold ${getGradeColor(course.grade)}`}>{course.grade}</span>
                      </div>
                    ))}
                    {completedCourses.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">No completed modules yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span className="dark:text-white">Your Achievements</span>
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Recognition for your academic excellence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasHighGrades && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-800 dark:to-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-600">
                      <div className="flex items-center space-x-3 mb-2">
                        <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-300" />
                        <div>
                          <h3 className="font-bold text-yellow-800 dark:text-yellow-100">Certified Specialist</h3>
                          <p className="text-sm text-yellow-600 dark:text-yellow-300">Excellence in Performance</p>
                        </div>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        Awarded for achieving grades of 90% or above (A/A- grades)
                      </p>
                    </div>
                  )}

                  {completedCourses.length >= 3 && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-800 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-600">
                      <div className="flex items-center space-x-3 mb-2">
                        <Award className="h-8 w-8 text-green-600 dark:text-green-300" />
                        <div>
                          <h3 className="font-bold text-green-800 dark:text-green-100">Module Completion</h3>
                          <p className="text-sm text-green-600 dark:text-green-300">
                            {completedCourses.length} Modules Completed
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Successfully completed multiple academic modules
                      </p>
                    </div>
                  )}

                  {Number.parseFloat(currentGPA) >= 3.5 && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-600">
                      <div className="flex items-center space-x-3 mb-2">
                        <Target className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                        <div>
                          <h3 className="font-bold text-blue-800 dark:text-blue-100">High Achiever</h3>
                          <p className="text-sm text-blue-600 dark:text-blue-300">GPA: {currentGPA}</p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-400">Maintained a GPA above 3.5</p>
                    </div>
                  )}

                  {overallProgress >= 75 && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-800 dark:to-purple-900 rounded-lg border border-purple-200 dark:border-purple-600">
                      <div className="flex items-center space-x-3 mb-2">
                        <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                        <div>
                          <h3 className="font-bold text-purple-800 dark:text-purple-100">Progress Champion</h3>
                          <p className="text-sm text-purple-600 dark:text-purple-300">{overallProgress}% Complete</p>
                        </div>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-400">
                        Excellent progress across all modules
                      </p>
                    </div>
                  )}
                </div>

                {!hasHighGrades &&
                  completedCourses.length < 3 &&
                  Number.parseFloat(currentGPA) < 3.5 &&
                  overallProgress < 75 && (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Keep working hard to unlock achievements!</p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
