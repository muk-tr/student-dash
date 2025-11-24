"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  MODE_LABELS,
  PARTICIPATION_LABELS,
  SUBMISSION_LABELS,
  type ModuleCategory,
  type Module,
  type StudentModuleAssessment,
} from "@/lib/module-types"
import { BookOpen, CheckCircle2, XCircle, AlertCircle, TrendingUp, Award, Target } from "lucide-react"
import {
  Bar,
  BarChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Legend,
} from "recharts"

interface ParticipantGradesViewProps {
  studentId: string
}

const CATEGORY_COLORS: Record<string, string> = {
  "Self Awareness": "#3b82f6", // Blue
  Relating: "#8b5cf6", // Purple
  Collaborating: "#ec4899", // Pink
  "Leading Others": "#f59e0b", // Amber
  Strengths: "#10b981", // Green
  Gifts: "#6366f1", // Indigo
  "Parish Guidelines": "#ef4444", // Red
  "Deanery & LALC Guidelines": "#06b6d4", // Cyan
}

const PARTICIPATION_DISPLAY = [
  { score: 0, label: "No Participation (0)", description: "Did not participate", color: "#ef4444" },
  { score: 1, label: "Minimal (1)", description: "Very little participation", color: "#f59e0b" },
  { score: 2, label: "Few (2)", description: "Some participation", color: "#eab308" },
  { score: 3, label: "Moderate (3)", description: "Good participation", color: "#3b82f6" },
  { score: 4, label: "Great (4)", description: "Excellent participation", color: "#10b981" },
]

export function ParticipantGradesView({ studentId }: ParticipantGradesViewProps) {
  const [categories, setCategories] = useState<ModuleCategory[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [assessments, setAssessments] = useState<StudentModuleAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadModuleData()
  }, [studentId])

  const loadModuleData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("module_categories")
        .select("*")
        .order("order_index")

      if (categoriesError) throw categoriesError

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .order("category_id, order_index")

      if (modulesError) throw modulesError

      // Load assessments for this student
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("student_module_assessments")
        .select("*")
        .eq("student_id", studentId)

      if (assessmentsError) throw assessmentsError

      setCategories(categoriesData || [])
      setModules(modulesData || [])
      setAssessments(assessmentsData || [])
    } catch (err: any) {
      console.error("Error loading module data:", err)
      setError(err.message || "Failed to load module data")
    } finally {
      setLoading(false)
    }
  }

  const getModulesForCategory = (categoryId: string) => {
    return modules.filter((m) => m.category_id === categoryId)
  }

  const getAssessmentForModule = (moduleId: string) => {
    return assessments.find((a) => a.module_id === moduleId)
  }

  const calculateCategoryCompletion = (categoryId: string) => {
    const categoryModules = getModulesForCategory(categoryId)
    if (categoryModules.length === 0) return 0

    const completedModules = categoryModules.filter((module) => {
      const assessment = getAssessmentForModule(module.id)
      return assessment && assessment.attendance === 1
    })

    return Math.round((completedModules.length / categoryModules.length) * 100)
  }

  const renderAttendanceBadge = (attendance: number) => {
    if (attendance === 1) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Attended
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
        <XCircle className="h-3 w-3 mr-1" />
        Not Attended
      </Badge>
    )
  }

  const calculateChartData = () => {
    const categoryData = categories.map((category) => ({
      name: category.name.substring(0, 15) + (category.name.length > 15 ? "..." : ""),
      fullName: category.name,
      completion: calculateCategoryCompletion(category.id),
      attended: getModulesForCategory(category.id).filter((m) => {
        const assessment = getAssessmentForModule(m.id)
        return assessment && assessment.attendance === 1
      }).length,
      total: getModulesForCategory(category.id).length,
    }))

    const participationCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
    assessments.forEach((a) => {
      participationCounts[a.participation]++
    })
    const participationData = PARTICIPATION_DISPLAY.map((item) => ({
      name: item.label,
      description: item.description,
      value: participationCounts[item.score as 0 | 1 | 2 | 3 | 4],
      score: item.score,
      fill: item.color,
    })).filter((d) => d.value > 0) // Only show levels that have data

    // Submission quality distribution
    const submissionCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
    assessments.forEach((a) => {
      submissionCounts[a.submission]++
    })
    const submissionData = Object.entries(submissionCounts).map(([score, count]) => ({
      label: SUBMISSION_LABELS[Number.parseInt(score) as 0 | 1 | 2 | 3 | 4].substring(0, 20),
      value: count,
      score: Number.parseInt(score),
    }))

    // Radar chart for overall performance
    const radarData = categories.slice(0, 6).map((category) => {
      const categoryModules = getModulesForCategory(category.id)
      const categoryAssessments = categoryModules
        .map((m) => getAssessmentForModule(m.id))
        .filter((a) => a) as StudentModuleAssessment[]

      const avgParticipation =
        categoryAssessments.length > 0
          ? categoryAssessments.reduce((sum, a) => sum + a.participation, 0) / categoryAssessments.length
          : 0

      return {
        category: category.name.substring(0, 12),
        score: Math.round(avgParticipation * 25), // Scale to 0-100
      }
    })

    // Quiz performance
    const quizModules = modules.filter((m) => m.has_quiz)
    const quizAssessments = quizModules
      .map((m) => getAssessmentForModule(m.id))
      .filter((a) => a) as StudentModuleAssessment[]
    const quizPassed = quizAssessments.filter((a) => a.quiz_score === 1).length
    const quizTotal = quizAssessments.length

    return { categoryData, participationData, submissionData, radarData, quizPassed, quizTotal }
  }

  const chartData = calculateChartData()

  if (loading) {
    return (
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your module assessments...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-900 dark:border-gray-800 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Module System Not Initialized</h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                The detailed module tracking system is not yet available. Please contact your administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No modules have been set up yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="space-y-4">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((assessments.filter((a) => a.attendance === 1).length / modules.length) * 100)}%
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <Progress
                value={(assessments.filter((a) => a.attendance === 1).length / modules.length) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {assessments.filter((a) => a.attendance === 1).length} of {modules.length} modules completed
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiz Performance</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {chartData.quizTotal > 0 ? Math.round((chartData.quizPassed / chartData.quizTotal) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {chartData.quizPassed}/{chartData.quizTotal} passed
                  </p>
                </div>
                <Award className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active learning areas</p>
                </div>
                <Target className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Completion Bar Chart */}
        <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Category Completion</CardTitle>
            <CardDescription className="dark:text-gray-400">Your progress across all module categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completion: {
                  label: "Completion %",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completion" radius={[8, 8, 0, 0]}>
                    {chartData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.fullName] || "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {chartData.categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.fullName] || "#6b7280" }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Radar and Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Performance Overview</CardTitle>
            <CardDescription className="dark:text-gray-400">Average scores across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                score: {
                  label: "Score",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData.radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9ca3af" }} />
                  <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Participation Distribution */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Participation Quality Breakdown</CardTitle>
            <CardDescription className="dark:text-gray-400">
              How your participation is rated across all modules (0-4 scale)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Participation Scale:</strong> 0 = None, 1 = Minimal, 2 = Few, 3 = Moderate, 4 = Great
              </p>
            </div>
            <ChartContainer
              config={{
                value: {
                  label: "Modules",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.participationData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={({ name, value }) => `${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {payload?.map((entry, index) => (
                          <div key={`legend-${index}`} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{data.description}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                              {data.value} module{data.value !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Module Categories Tabs */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Module Assessments by Category</CardTitle>
          <CardDescription className="dark:text-gray-400">
            View your attendance, participation, and performance across all modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={categories[0]?.id} className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 h-auto bg-transparent p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:text-white whitespace-normal h-auto py-2 px-3 text-xs"
                  style={{
                    backgroundColor: category.id === categories[0]?.id ? CATEGORY_COLORS[category.name] : undefined,
                  }}
                  data-category={category.name}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-center">{category.name}</span>
                    <span className="text-[10px] opacity-80 mt-1">
                      {calculateCategoryCompletion(category.id)}% complete
                    </span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                {getModulesForCategory(category.id).length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No modules in this category yet.</p>
                ) : (
                  <div className="space-y-3">
                    {getModulesForCategory(category.id).map((module) => {
                      const assessment = getAssessmentForModule(module.id)

                      return (
                        <Card key={module.id} className="dark:bg-gray-800 dark:border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">{module.name}</h4>
                                {assessment?.term && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Term: {assessment.term}</p>
                                )}
                              </div>
                              {assessment ? renderAttendanceBadge(assessment.attendance) : renderAttendanceBadge(0)}
                            </div>

                            {assessment ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {assessment.mode && (
                                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">Mode</p>
                                    <p className="font-medium dark:text-white">{MODE_LABELS[assessment.mode]}</p>
                                  </div>
                                )}

                                <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                  <p className="text-gray-600 dark:text-gray-400 text-xs">Participation</p>
                                  <p className="font-medium dark:text-white">
                                    {PARTICIPATION_LABELS[assessment.participation]}
                                  </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                  <p className="text-gray-600 dark:text-gray-400 text-xs">Submission</p>
                                  <p className="font-medium dark:text-white">
                                    {SUBMISSION_LABELS[assessment.submission]}
                                  </p>
                                </div>

                                {module.has_quiz && assessment.quiz_score !== undefined && (
                                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">Quiz</p>
                                    <p className="font-medium dark:text-white">
                                      {assessment.quiz_score === 1 ? "Passed" : "Not Passed"}
                                    </p>
                                  </div>
                                )}

                                {module.has_posts && (
                                  <>
                                    {assessment.post1 !== undefined && (
                                      <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Post 1</p>
                                        <p className="font-medium dark:text-white">
                                          {SUBMISSION_LABELS[assessment.post1]}
                                        </p>
                                      </div>
                                    )}
                                    {assessment.post2 !== undefined && (
                                      <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">Post 2</p>
                                        <p className="font-medium dark:text-gray-300">
                                          {SUBMISSION_LABELS[assessment.post2]}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                No assessment recorded yet
                              </p>
                            )}

                            {assessment?.notes && (
                              <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Notes:</p>
                                <p className="text-sm dark:text-gray-300">{assessment.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
