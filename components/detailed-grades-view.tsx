"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Module, ModuleCategory, StudentModuleAssessment, ModeType } from "@/lib/module-types"
import { MODE_LABELS, PARTICIPATION_LABELS, SUBMISSION_LABELS } from "@/lib/module-types"
import { Save, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DetailedGradesViewProps {
  students: any[]
}

export function DetailedGradesView({ students }: DetailedGradesViewProps) {
  const [categories, setCategories] = useState<ModuleCategory[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [assessments, setAssessments] = useState<Record<string, StudentModuleAssessment>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState("Aug-22")
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    loadModulesData()
  }, [])

  useEffect(() => {
    if (modules.length > 0) {
      loadAssessments()
    }
  }, [modules, selectedTerm])

  const loadModulesData = async () => {
    try {
      const { data: categoriesData, error: catError } = await supabase
        .from("module_categories")
        .select("*")
        .order("order_index")

      if (catError) {
        console.error("[v0] Module categories table error:", catError)
        setError("Module tracking tables not yet initialized. Click 'Reset DB' to set up the database.")
        setLoading(false)
        return
      }

      const { data: modulesData, error: modError } = await supabase.from("modules").select("*").order("order_index")

      if (modError) {
        console.error("[v0] Modules table error:", modError)
        setError("Module tracking tables not yet initialized. Click 'Reset DB' to set up the database.")
        setLoading(false)
        return
      }

      if (categoriesData) setCategories(categoriesData)
      if (modulesData) setModules(modulesData)
    } catch (error) {
      console.error("[v0] Error loading modules:", error)
      setError("Failed to load module data. Please ensure database is properly initialized.")
    } finally {
      setLoading(false)
    }
  }

  const loadAssessments = async () => {
    try {
      const { data } = await supabase.from("student_module_assessments").select("*").eq("term", selectedTerm)

      const assessmentsMap: Record<string, StudentModuleAssessment> = {}
      data?.forEach((assessment) => {
        const key = `${assessment.student_id}_${assessment.module_id}`
        assessmentsMap[key] = assessment
      })
      setAssessments(assessmentsMap)
    } catch (error) {
      console.error("[v0] Error loading assessments:", error)
    }
  }

  const updateAssessment = (studentId: string, moduleId: string, field: string, value: any) => {
    const key = `${studentId}_${moduleId}`
    setAssessments((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        student_id: studentId,
        module_id: moduleId,
        term: selectedTerm,
        [field]: value,
      } as StudentModuleAssessment,
    }))
  }

  const saveAssessment = async (studentId: string, moduleId: string) => {
    const key = `${studentId}_${moduleId}`
    const assessment = assessments[key]

    if (!assessment) return

    setSaving(true)
    try {
      const { error } = await supabase.from("student_module_assessments").upsert({
        student_id: studentId,
        module_id: moduleId,
        term: selectedTerm,
        attendance: assessment.attendance || 0,
        mode: assessment.mode,
        participation: assessment.participation || 0,
        submission: assessment.submission || 0,
        post1: assessment.post1,
        post2: assessment.post2,
        quiz_score: assessment.quiz_score,
        notes: assessment.notes,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Assessment saved successfully",
      })
    } catch (error) {
      console.error("Error saving assessment:", error)
      toast({
        title: "Error",
        description: "Failed to save assessment",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getStudentsByDeaneryAndParish = () => {
    const grouped: Record<string, Record<string, any[]>> = {}

    students.forEach((student) => {
      const deanery = student.deanery || "Unassigned"
      const parish = student.parish || "Unassigned"

      if (!grouped[deanery]) grouped[deanery] = {}
      if (!grouped[deanery][parish]) grouped[deanery][parish] = []

      grouped[deanery][parish].push(student)
    })

    return grouped
  }

  const studentsByDeaneryAndParish = getStudentsByDeaneryAndParish()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (categories.length === 0 || modules.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No modules configured yet. Click 'Reset DB' button to initialize the module tracking system with sample
          modules.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detailed Module Assessments</h3>
          <p className="text-sm text-gray-600">Track attendance, participation, submissions, and quiz scores</p>
        </div>
        <div className="flex items-center gap-2">
          <Label>Term:</Label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aug-22">Aug-22</SelectItem>
              <SelectItem value="Jan-23">Jan-23</SelectItem>
              <SelectItem value="Aug-23">Aug-23</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {Object.entries(studentsByDeaneryAndParish).map(([deanery, parishes]) => (
          <AccordionItem key={deanery} value={deanery} className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{deanery}</Badge>
                <span className="text-sm text-gray-600">({Object.values(parishes).flat().length} participants)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="multiple" className="px-4 space-y-2">
                {Object.entries(parishes).map(([parish, parishStudents]) => (
                  <AccordionItem key={parish} value={parish} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{parish}</Badge>
                        <span className="text-sm text-gray-600">({parishStudents.length} participants)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-4 space-y-4">
                        {parishStudents.map((student) => (
                          <Card key={student.id}>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between">
                                <span>
                                  {student.name} ({student.id})
                                </span>
                                <span className="text-sm font-normal text-gray-600">{student.email}</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Tabs defaultValue={categories[0]?.id} className="w-full">
                                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                                  {categories.map((category) => (
                                    <TabsTrigger key={category.id} value={category.id} className="text-xs">
                                      {category.name.split(" ")[0]}
                                    </TabsTrigger>
                                  ))}
                                </TabsList>
                                {categories.map((category) => (
                                  <TabsContent key={category.id} value={category.id} className="space-y-4">
                                    {modules
                                      .filter((m) => m.category_id === category.id)
                                      .map((module) => {
                                        const key = `${student.id}_${module.id}`
                                        const assessment = assessments[key] || {}

                                        return (
                                          <Card key={module.id} className="p-4">
                                            <div className="flex items-center justify-between mb-4">
                                              <h4 className="font-medium">{module.name}</h4>
                                              <Button
                                                size="sm"
                                                onClick={() => saveAssessment(student.id, module.id)}
                                                disabled={saving}
                                              >
                                                {saving ? (
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                  <>
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save
                                                  </>
                                                )}
                                              </Button>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                              <div>
                                                <Label>Attendance</Label>
                                                <Select
                                                  value={String(assessment.attendance || 0)}
                                                  onValueChange={(v) =>
                                                    updateAssessment(student.id, module.id, "attendance", Number(v))
                                                  }
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="0">Absent</SelectItem>
                                                    <SelectItem value="1">Present</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div>
                                                <Label>Mode</Label>
                                                <Select
                                                  value={assessment.mode || ""}
                                                  onValueChange={(v) =>
                                                    updateAssessment(student.id, module.id, "mode", v as ModeType)
                                                  }
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select mode" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {Object.entries(MODE_LABELS).map(([key, label]) => (
                                                      <SelectItem key={key} value={key}>
                                                        {label}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div>
                                                <Label>Participation</Label>
                                                <Select
                                                  value={String(assessment.participation || 0)}
                                                  onValueChange={(v) =>
                                                    updateAssessment(student.id, module.id, "participation", Number(v))
                                                  }
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {Object.entries(PARTICIPATION_LABELS).map(([key, label]) => (
                                                      <SelectItem key={key} value={key}>
                                                        {key} - {label}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div>
                                                <Label>Submission</Label>
                                                <Select
                                                  value={String(assessment.submission || 0)}
                                                  onValueChange={(v) =>
                                                    updateAssessment(student.id, module.id, "submission", Number(v))
                                                  }
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {Object.entries(SUBMISSION_LABELS).map(([key, label]) => (
                                                      <SelectItem key={key} value={key}>
                                                        {key} - {label}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              {module.has_posts && (
                                                <>
                                                  <div>
                                                    <Label>Post 1</Label>
                                                    <Select
                                                      value={String(assessment.post1 || 0)}
                                                      onValueChange={(v) =>
                                                        updateAssessment(student.id, module.id, "post1", Number(v))
                                                      }
                                                    >
                                                      <SelectTrigger>
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        {Object.entries(SUBMISSION_LABELS).map(([key, label]) => (
                                                          <SelectItem key={key} value={key}>
                                                            {key}
                                                          </SelectItem>
                                                        ))}
                                                      </SelectContent>
                                                    </Select>
                                                  </div>
                                                  <div>
                                                    <Label>Post 2</Label>
                                                    <Select
                                                      value={String(assessment.post2 || 0)}
                                                      onValueChange={(v) =>
                                                        updateAssessment(student.id, module.id, "post2", Number(v))
                                                      }
                                                    >
                                                      <SelectTrigger>
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        {Object.entries(SUBMISSION_LABELS).map(([key, label]) => (
                                                          <SelectItem key={key} value={key}>
                                                            {key}
                                                          </SelectItem>
                                                        ))}
                                                      </SelectContent>
                                                    </Select>
                                                  </div>
                                                </>
                                              )}
                                              {module.has_quiz && (
                                                <div>
                                                  <Label>Quiz Score</Label>
                                                  <Select
                                                    value={String(assessment.quiz_score || 0)}
                                                    onValueChange={(v) =>
                                                      updateAssessment(student.id, module.id, "quiz_score", Number(v))
                                                    }
                                                  >
                                                    <SelectTrigger>
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="0">Below 60</SelectItem>
                                                      <SelectItem value="1">Above 60</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              )}
                                            </div>
                                          </Card>
                                        )
                                      })}
                                  </TabsContent>
                                ))}
                              </Tabs>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
