"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useStudents } from "@/lib/student-context"
import {
  Plus,
  LogOut,
  ShieldAlert,
  Trash2,
  UserX,
  BookPlus,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Database,
  Pencil,
  Save,
  Search,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatProgramDuration } from "@/lib/student-data"
import { FileImport } from "@/components/file-import"
import { DataExport } from "@/components/data-export"
import {
  generateStudentTemplateCSV,
  generateCourseTemplateCSV,
  generateGradeTemplateCSV, // Import generateGradeTemplateCSV
  generateProgramTemplateCSV,
  generateEnrollmentTemplateCSV,
} from "@/lib/csv-utils"
import { ModeToggle } from "@/components/mode-toggle"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function AdminPanel() {
  const router = useRouter()
  const {
    students,
    coursesCatalog,
    programsCatalog,
    addStudent,
    updateStudent,
    addCourseToStudent,
    updateStudentCourse,
    deleteStudent,
    deleteCourseFromStudent,
    addCourseToCatalog,
    updateCourseInCatalog,
    deleteCourseFromCatalog,
    addProgramToCatalog,
    updateProgramInCatalog,
    deleteProgramFromCatalog,
    addStudentCourse, // Assuming this function is now available from context or imported
  } = useStudents()

  // New student form state
  const [newStudent, setNewStudent] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    program: "",
    year: "",
    semester: "1Qtr",
    avatar: "/placeholder.svg?height=100&width=100",
    courses: [],
    gradeHistory: [{ semester: "1Qtr", gpa: 0 }],
    parish: "",
    deanery: "",
    phone: "",
  })

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false)

  // New module catalog form state
  const [newCatalogModule, setNewCatalogModule] = useState({
    id: "",
    name: "",
    credits: 3,
    department: "",
  })

  const [newProgram, setNewProgram] = useState({
    name: "",
    department: "",
    duration: 4,
  })

  // Course assignment form state
  const [selectedStudent, setSelectedStudent] = useState("")
  const [newCourse, setNewCourse] = useState({
    id: "",
    name: "",
    credits: 3,
    status: "Registered",
    mode: "Physical", // Changed from instructor to mode
    semester: "1Qtr",
  })

  // Edit student state
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Status messages
  const [statusMessage, setStatusMessage] = useState("")
  const [isInitializing, setIsInitializing] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")

  // Filtered students based on search term
  const filteredStudents = Object.values(students).filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.deanery.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const showStatus = (message: string, isError = false) => {
    setStatusMessage(message)
    setTimeout(() => setStatusMessage(""), 3000)
  }

  const getStudentsByDeaneryAndParish = () => {
    const grouped: Record<string, Record<string, any[]>> = {}

    Object.values(students).forEach((student) => {
      const deanery = student.deanery || "Unassigned Deanery"
      const parish = student.parish || "Unassigned Parish"

      if (!grouped[deanery]) grouped[deanery] = {}
      if (!grouped[deanery][parish]) grouped[deanery][parish] = []

      grouped[deanery][parish].push(student)
    })

    const sortedDeaneries = Object.keys(grouped).sort()
    return sortedDeaneries.map((deanery) => {
      const sortedParishes = Object.keys(grouped[deanery]).sort()
      return {
        name: deanery,
        parishes: sortedParishes.map((parish) => ({
          name: parish,
          students: grouped[deanery][parish].sort((a, b) => a.name.localeCompare(b.name)),
        })),
      }
    })
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewStudent({ ...newStudent, avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  // Generate a default password based on student name
  const generateDefaultPassword = (name: string, id: string) => {
    const firstName = name.split(" ")[0].toLowerCase()
    const lastThreeDigits = id.slice(-3)
    return `${firstName}${lastThreeDigits}`
  }

  const handleAddStudent = () => {
    console.log("Adding student:", newStudent)

    if (!newStudent.id || !newStudent.name || !newStudent.program || !newStudent.year) {
      showStatus("❌ Please fill in all required fields (ID, Name, Program, Year)", true)
      return
    }

    // Check if student ID already exists
    if (students[newStudent.id]) {
      showStatus("❌ Student ID already exists. Please use a different ID.", true)
      return
    }

    try {
      // Generate default password if not provided
      const password = newStudent.password || generateDefaultPassword(newStudent.name, newStudent.id)

      // Add the new student
      addStudent({
        ...newStudent,
        email: newStudent.email || `${newStudent.id.toLowerCase()}@university.edu`,
        password: password,
      })

      showStatus(`✅ Student ${newStudent.name} added successfully! Password: ${password}`)

      // Reset the form
      setNewStudent({
        id: "",
        name: "",
        email: "",
        password: "",
        program: "",
        year: "",
        semester: "1Qtr",
        avatar: "/placeholder.svg?height=100&width=100",
        courses: [],
        gradeHistory: [{ semester: "1Qtr", gpa: 0 }],
        parish: "",
        deanery: "",
        phone: "",
      })
    } catch (error) {
      console.error("Error adding student:", error)
      showStatus("❌ Error adding student. Please try again.", true)
    }
  }

  const handleAddModuleToCatalog = () => {
    console.log("Adding module to catalog:", newCatalogModule)

    if (!newCatalogModule.id || !newCatalogModule.name || !newCatalogModule.department) {
      showStatus("❌ Please fill in all required fields (Module ID, Name, Department)", true)
      return
    }

    // Check if module ID already exists
    if (coursesCatalog[newCatalogModule.id]) {
      showStatus("❌ Module ID already exists. Please use a different ID.", true)
      return
    }

    try {
      // Add the new module to catalog
      addCourseToCatalog(newCatalogModule.id, {
        name: newCatalogModule.name,
        credits: newCatalogModule.credits,
        department: newCatalogModule.department,
      })

      showStatus(`✅ Module "${newCatalogModule.name}" added to catalog successfully!`)

      // Reset the form
      setNewCatalogModule({
        id: "",
        name: "",
        credits: 3,
        department: "",
      })
    } catch (error) {
      console.error("Error adding module:", error)
      showStatus("❌ Error adding module. Please try again.", true)
    }
  }

  const handleDeleteStudent = (studentId: string) => {
    try {
      deleteStudent(studentId)
      showStatus("✅ Student deleted successfully!")
    } catch (error) {
      showStatus("❌ Error deleting student.", true)
    }
  }

  const handleDeleteCourseFromCatalog = (courseId: string) => {
    // Check if course is being used by any student
    const isInUse = Object.values(students).some((student) => student.courses.some((course) => course.id === courseId))

    if (isInUse) {
      showStatus("❌ Cannot delete course - it's assigned to students. Remove from students first.", true)
      return
    }

    try {
      deleteCourseFromCatalog(courseId)
      showStatus("✅ Course deleted from catalog!")
    } catch (error) {
      showStatus("❌ Error deleting course.", true)
    }
  }

  const handleAddCourse = async () => {
    // Added async keyword
    if (!selectedStudent || !newCourse.id || !newCourse.mode) {
      showStatus("❌ Please select student, course, and select mode of study", true)
      return
    }

    // Check if course already exists for this student
    const studentCourses = students[selectedStudent]?.courses || []
    if (studentCourses.some((course) => course.id === newCourse.id)) {
      showStatus("❌ Student is already enrolled in this course", true)
      return
    }

    // Get course details from catalog
    const catalogCourse = coursesCatalog[newCourse.id as keyof typeof coursesCatalog]
    if (!catalogCourse) {
      showStatus("❌ Course not found in catalog", true)
      return
    }

    try {
      // Call the new addStudentCourse function
      const result = await addStudentCourse(
        selectedStudent,
        newCourse.id,
        newCourse.name, // Assuming newCourse.name is populated correctly
        newCourse.credits,
        newCourse.mode, // Use mode here
        newCourse.semester,
        newCourse.status,
      )

      if (result.success) {
        showStatus(`✅ Course "${catalogCourse.name}" added to ${students[selectedStudent]?.name}!`)

        // Reset the course form but keep the selected student
        setNewCourse({
          id: "",
          name: "",
          credits: 3,
          status: "Registered",
          mode: "Physical", // Reset to default mode
          semester: "1Qtr",
        })
      } else {
        showStatus(`❌ ${result.message}`, true)
      }
    } catch (error) {
      console.error("Error adding course to student:", error)
      showStatus("❌ Error adding course to student. Please try again.", true)
    }
  }

  const handleDeleteCourse = (studentId: string, courseId: string) => {
    try {
      deleteCourseFromStudent(studentId, courseId)
      showStatus("✅ Course removed from student!")
    } catch (error) {
      showStatus("❌ Error removing course.", true)
    }
  }

  const handleAddProgram = () => {
    console.log("Adding program:", newProgram)

    if (!newProgram.name || !newProgram.department) {
      showStatus("❌ Please fill in all required fields (Program Name, Department)", true)
      return
    }

    // Check if program already exists
    if (programsCatalog[newProgram.name]) {
      showStatus("❌ Program already exists. Please use a different name.", true)
      return
    }

    try {
      addProgramToCatalog(newProgram.name, {
        name: newProgram.name,
        department: newProgram.department,
        duration: newProgram.duration,
      })

      showStatus(`✅ Program "${newProgram.name}" added successfully!`)

      // Reset the form
      setNewProgram({
        name: "",
        department: "",
        duration: 4,
      })
    } catch (error) {
      console.error("Error adding program:", error)
      showStatus("❌ Error adding program. Please try again.", true)
    }
  }

  const handleDeleteProgram = (programName: string) => {
    // Check if program is being used by any student
    const isInUse = Object.values(students).some((student) => student.program === programName)

    if (isInUse) {
      showStatus("❌ Cannot delete program - students are enrolled in it. Move students first.", true)
      return
    }

    try {
      deleteProgramFromCatalog(programName)
      showStatus("✅ Program deleted successfully!")
    } catch (error) {
      showStatus("❌ Error deleting program.", true)
    }
  }

  const handleUpdateGrade = (studentId: string, courseId: string, grade: string) => {
    // Map grade to GPA
    const gradeToGPA: Record<string, number> = {
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      F: 0.0,
      "-": 0.0,
    }

    const gpa = gradeToGPA[grade] || 0

    // Determine status based on grade
    let status = "Registered"
    let progress = 0

    if (grade === "-") {
      status = "Registered"
      progress = 0
    } else if (grade === "F") {
      status = "Completed"
      progress = 100
    } else if (grade !== "-") {
      status = "Completed"
      progress = 100
    }

    try {
      // Update the course
      updateStudentCourse(studentId, courseId, {
        grade,
        gpa,
        status,
        progress,
      })

      showStatus(`✅ Grade updated to ${grade} for course ${courseId} - Status: ${status}`)
    } catch (error) {
      showStatus("❌ Error updating grade.", true)
    }
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent) return

    try {
      await updateStudent(editingStudent.id, editingStudent)
      showStatus("✅ Participant updated successfully!")
      setIsEditDialogOpen(false)
      setEditingStudent(null)
    } catch (error) {
      console.error("Error updating participant:", error)
      showStatus("❌ Error updating participant", true)
    }
  }

  const openEditDialog = (student: any) => {
    setEditingStudent({ ...student })
    setIsEditDialogOpen(true)
  }

  // Import handlers
  const handleImportStudents = (data: any[]) => {
    let importCount = 0
    let updateCount = 0

    data.forEach((row) => {
      const studentId = row.id?.trim()
      if (!studentId) return

      const studentData = {
        id: studentId,
        name: row.name?.trim() || "Unknown",
        email: row.email?.trim() || `${studentId.toLowerCase()}@university.edu`,
        password: row.password?.trim() || generateDefaultPassword(row.name?.trim() || "Unknown", studentId),
        program: row.program?.trim() || "General Studies",
        year: row.year?.trim() || new Date().getFullYear() + 4,
        semester: row.semester?.trim() || "1Qtr",
        avatar: "/placeholder.svg?height=100&width=100",
        courses: students[studentId]?.courses || [],
        gradeHistory: students[studentId]?.gradeHistory || [{ semester: "1Qtr", gpa: 0 }],
        parish: row.parish?.trim() || "",
        deanery: row.deanery?.trim() || "",
        phone: row.phone?.trim() || "",
      }

      if (students[studentId]) {
        updateStudent(studentId, studentData)
        updateCount++
      } else {
        addStudent(studentData)
        importCount++
      }
    })

    showStatus(`✅ Imported ${importCount} new students and updated ${updateCount} existing students`)
  }

  const handleImportModules = (data: any[]) => {
    let importCount = 0
    let updateCount = 0

    data.forEach((row) => {
      const moduleId = row.id?.trim()
      if (!moduleId) return

      const moduleData = {
        name: row.name?.trim() || "Unknown Module",
        credits: Number.parseInt(row.credits) || 3,
        department: row.department?.trim() || "General",
      }

      if (coursesCatalog[moduleId]) {
        updateCourseInCatalog(moduleId, moduleData)
        updateCount++
      } else {
        addCourseToCatalog(moduleId, moduleData)
        importCount++
      }
    })

    showStatus(`✅ Imported ${importCount} new modules and updated ${updateCount} existing modules`)
  }

  const handleImportGrades = (data: any[]) => {
    let updateCount = 0
    let errorCount = 0

    data.forEach((row) => {
      const studentId = row.studentId?.trim()
      const courseId = row.courseId?.trim()
      const grade = row.grade?.trim()

      if (!studentId || !courseId || !grade) {
        errorCount++
        return
      }

      // Check if student exists
      if (!students[studentId]) {
        errorCount++
        return
      }

      // Check if student has this course
      const hasCourse = students[studentId].courses.some((c) => c.id === courseId)

      if (!hasCourse) {
        // If student is not enrolled, we skip or we could enroll them.
        // For "Import Grades", usually we expect them to be enrolled.
        // We'll count this as an error/warning
        errorCount++
        return
      }

      // Map grade to GPA
      const gradeToGPA: Record<string, number> = {
        A: 4.0,
        "A-": 3.7,
        "B+": 3.3,
        B: 3.0,
        "B-": 2.7,
        "C+": 2.3,
        C: 2.0,
        F: 0.0,
        "-": 0.0,
      }

      const gpa = gradeToGPA[grade] || 0

      // Determine status based on grade
      let status = "Registered"
      let progress = 0

      if (grade === "-") {
        status = "Registered"
        progress = 0
      } else if (grade === "F") {
        status = "Completed"
        progress = 100
      } else if (grade !== "-") {
        status = "Completed"
        progress = 100
      }

      try {
        updateStudentCourse(studentId, courseId, {
          grade,
          gpa,
          status,
          progress,
        })
        updateCount++
      } catch (error) {
        errorCount++
      }
    })

    showStatus(`✅ Updated grades for ${updateCount} enrollments (${errorCount} skipped/errors)`)
  }

  const handleImportEnrollments = (data: any[]) => {
    let importCount = 0
    let errorCount = 0

    data.forEach((row) => {
      const studentId = row.studentId?.trim()
      const courseId = row.courseId?.trim()

      if (!studentId || !courseId) {
        errorCount++
        return
      }

      // Check if student exists
      if (!students[studentId]) {
        errorCount++
        return
      }

      // Check if course exists in catalog
      if (!coursesCatalog[courseId]) {
        errorCount++
        return
      }

      // Check if student already has this course
      if (students[studentId].courses.some((c) => c.id === courseId)) {
        errorCount++
        return
      }

      const catalogCourse = coursesCatalog[courseId]
      const grade = row.grade?.trim() || "-"
      const status = row.status?.trim() || "Registered"
      const mode = row.mode?.trim() || "Physical" // Added mode

      // Map grade to GPA
      const gradeToGPA: Record<string, number> = {
        A: 4.0,
        "A-": 3.7,
        "B+": 3.3,
        B: 3.0,
        "B-": 2.7,
        "C+": 2.3,
        C: 2.0,
        F: 0.0,
        "-": 0.0,
      }

      const gpa = gradeToGPA[grade] || 0

      // Calculate progress based on status
      let progress = 0
      if (status === "Completed") progress = 100
      else if (status === "In Progress") progress = 50

      const courseData = {
        id: courseId,
        name: catalogCourse.name,
        credits: catalogCourse.credits,
        grade: grade,
        gpa: gpa,
        status: status,
        progress: progress,
        mode: mode, // Include mode
        semester: row.semester?.trim() || "1Qtr",
      }

      addCourseToStudent(studentId, courseData)
      importCount++
    })

    showStatus(`✅ Imported ${importCount} enrollments (${errorCount} errors)`)
  }

  const handleImportPrograms = (data: any[]) => {
    let importCount = 0
    let updateCount = 0

    data.forEach((row) => {
      const programName = row.name?.trim()
      if (!programName) return

      const programData = {
        name: programName,
        department: row.department?.trim() || "General",
        duration: Number.parseInt(row.duration) || 4,
      }

      if (programsCatalog[programName]) {
        updateProgramInCatalog(programName, programData)
        updateCount++
      } else {
        addProgramToCatalog(programName, programData)
        importCount++
      }
    })

    showStatus(`✅ Imported ${importCount} new programs and updated ${updateCount} existing programs`)
  }

  // Validation functions
  const validateStudentRow = (row: any) => {
    if (!row.id) return { valid: false, message: "Student ID is required" }
    if (!row.name) return { valid: false, message: "Student name is required" }
    if (!row.program) return { valid: false, message: "Program is required" }
    if (!row.year) return { valid: false, message: "Year is required" }
    return { valid: true }
  }

  const validateModuleRow = (row: any) => {
    if (!row.id) return { valid: false, message: "Module ID is required" }
    if (!row.name) return { valid: false, message: "Module name is required" }
    if (!row.department) return { valid: true }
  }

  const validateGradeRow = (row: any) => {
    if (!row.studentId) return { valid: false, message: "Student ID is required" }
    if (!row.courseId) return { valid: false, message: "Course ID is required" }
    if (!row.grade) return { valid: false, message: "Grade is required" }
    return { valid: true }
  }

  const validateProgramRow = (row: any) => {
    if (!row.name) return { valid: false, message: "Program name is required" }
    if (!row.department) return { valid: false, message: "Department is required" }
    return { valid: true }
  }

  const validateEnrollmentRow = (row: any) => {
    if (!row.studentId) return { valid: false, message: "Student ID is required" }
    if (!row.courseId) return { valid: false, message: "Course ID is required" }
    if (!students[row.studentId]) return { valid: false, message: `Student ${row.studentId} does not exist` }
    if (!coursesCatalog[row.courseId]) return { valid: false, message: `Course ${row.courseId} does not exist` }
    if (students[row.studentId].courses.some((c) => c.id === row.courseId)) {
      return { valid: false, message: `Student ${row.studentId} is already enrolled in course ${row.courseId}` }
    }
    return { valid: true }
  }

  // Export data transformers
  const transformStudentsForExport = () => {
    return Object.values(students).map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      password: student.password,
      program: student.program,
      year: student.year,
      semester: student.semester,
      parish: student.parish,
      deanery: student.deanery,
      phone: student.phone,
    }))
  }

  const transformModulesForExport = () => {
    return Object.entries(coursesCatalog).map(([id, course]) => ({
      id,
      name: course.name,
      credits: course.credits,
      department: course.department,
    }))
  }

  const transformProgramsForExport = () => {
    return Object.entries(programsCatalog).map(([name, program]) => ({
      name,
      department: program.department,
      duration: program.duration,
    }))
  }

  const transformEnrollmentsForExport = () => {
    const enrollments: any[] = []

    Object.entries(students).forEach(([studentId, student]) => {
      student.courses.forEach((course) => {
        enrollments.push({
          studentId,
          courseId: course.id,
          mode: course.mode, // Include mode
          semester: course.semester,
          status: course.status,
          grade: course.grade,
        })
      })
    })

    return enrollments
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated")
    router.push("/admin/login")
  }

  const handleInitializeDb = async () => {
    if (!confirm("This will reset the database tables and seed initial data. Are you sure?")) return

    setIsInitializing(true)
    showStatus("Initializing database...", false)

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        showStatus("✅ Database initialized successfully! Please refresh the page.")
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        showStatus(`❌ ${result.error}`, true)
      }
    } catch (error) {
      showStatus("❌ Failed to connect to server", true)
    } finally {
      setIsInitializing(false)
    }
  }

  const studentsByDeanery = filteredStudents.reduce(
    (acc, student) => {
      const deanery = student.deanery || "Unassigned Deanery"
      if (!acc[deanery]) {
        acc[deanery] = {}
      }
      const parish = student.parish || "Unassigned Parish"
      if (!acc[deanery][parish]) {
        acc[deanery][parish] = []
      }
      acc[deanery][parish].push(student)
      return acc
    },
    {} as Record<string, Record<string, typeof filteredStudents>>,
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShieldAlert className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage participant records and modules</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleInitializeDb}
              disabled={isInitializing}
              className="hidden md:flex bg-transparent"
            >
              <Database className="h-4 w-4 mr-2" />
              {isInitializing ? "Initializing..." : "Reset DB"}
            </Button>
            <ModeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Status Message */}
      {statusMessage && (
        <div className="mx-6 mt-4">
          <div
            className={`p-3 rounded-lg ${
              statusMessage.includes("❌") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {statusMessage}
          </div>
        </div>
      )}

      <div className="p-6 max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Participant Data Management</CardTitle>
            <CardDescription>Add participants, create modules, and manage enrollments</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="import">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import/Export
            </TabsTrigger>
            <TabsTrigger value="catalog">📚 Modules</TabsTrigger>
            <TabsTrigger value="programs">🎓 Programs</TabsTrigger>
            <TabsTrigger value="students">👥 Participants</TabsTrigger>
            <TabsTrigger value="enrollments">📝 Enrollments</TabsTrigger>
            <TabsTrigger value="grades">📊 Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileImport
                title="Import Participants"
                description="Upload a CSV file with participant data"
                templateFileName="student-template.csv"
                templateData={generateStudentTemplateCSV()}
                onImport={handleImportStudents}
                validateRow={validateStudentRow}
              />

              <DataExport
                title="Export Participants"
                description="Download all participant data as CSV"
                fileName="participants-export.csv"
                getData={() => Object.values(students)}
                transformData={transformStudentsForExport}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileImport
                title="Import Modules"
                description="Upload a CSV file with module data"
                templateFileName="course-template.csv"
                templateData={generateCourseTemplateCSV()}
                onImport={handleImportModules}
                validateRow={validateModuleRow}
              />

              <DataExport
                title="Export Modules"
                description="Download all module data as CSV"
                fileName="courses-export.csv"
                getData={() => Object.entries(coursesCatalog)}
                transformData={transformModulesForExport}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileImport
                title="Import Programs"
                description="Upload a CSV file with program data"
                templateFileName="program-template.csv"
                templateData={generateProgramTemplateCSV()}
                onImport={handleImportPrograms}
                validateRow={validateProgramRow}
              />

              <DataExport
                title="Export Programs"
                description="Download all program data as CSV"
                fileName="programs-export.csv"
                getData={() => Object.entries(programsCatalog)}
                transformData={transformProgramsForExport}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileImport
                title="Import Enrollments"
                description="Upload a CSV file with participant module enrollments"
                templateFileName="enrollment-template.csv"
                templateData={generateEnrollmentTemplateCSV()}
                onImport={handleImportEnrollments}
                validateRow={validateEnrollmentRow}
              />

              <DataExport
                title="Export Enrollments"
                description="Download all enrollment data as CSV"
                fileName="enrollments-export.csv"
                getData={() => Object.values(students)}
                transformData={transformEnrollmentsForExport}
              />
            </div>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📚 Create New Module</CardTitle>
                <CardDescription>Add a new module to the catalog that can be assigned to participants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courseId">Module ID * (e.g., CS501)</Label>
                    <Input
                      id="courseId"
                      placeholder="CS501"
                      value={newCatalogModule.id}
                      onChange={(e) => setNewCatalogModule({ ...newCatalogModule, id: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseName">Module Name * (e.g., Advanced Programming)</Label>
                    <Input
                      id="courseName"
                      placeholder="Advanced Programming"
                      value={newCatalogModule.name}
                      onChange={(e) => setNewCatalogModule({ ...newCatalogModule, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="credits">Credits *</Label>
                    <Select
                      value={newCatalogModule.credits.toString()}
                      onValueChange={(value) =>
                        setNewCatalogModule({ ...newCatalogModule, credits: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Credit</SelectItem>
                        <SelectItem value="2">2 Credits</SelectItem>
                        <SelectItem value="3">3 Credits</SelectItem>
                        <SelectItem value="4">4 Credits</SelectItem>
                        <SelectItem value="5">5 Credits</SelectItem>
                        <SelectItem value="6">6 Credits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={newCatalogModule.department}
                      onValueChange={(value) => setNewCatalogModule({ ...newCatalogModule, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAddModuleToCatalog}
                  disabled={!newCatalogModule.id || !newCatalogModule.name || !newCatalogModule.department}
                >
                  <BookPlus className="h-4 w-4 mr-2" />
                  Add Module to Catalog
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📋 Current Module Catalog ({Object.keys(coursesCatalog).length} modules)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(coursesCatalog).map(([courseId, course]) => (
                    <div key={courseId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">
                          {courseId} - {course.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {course.credits} credits • {course.department}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">{course.credits} credits</Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Module</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {course.name}? This will only work if it's not assigned
                                to any participants.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCourseFromCatalog(courseId)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {Object.keys(coursesCatalog).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No modules in catalog. Add your first module above! 👆</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🎓 Create New Program</CardTitle>
                <CardDescription>Add a new academic program that participants can enroll in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="programName">Program Name * (e.g., Computer Science)</Label>
                    <Input
                      id="programName"
                      placeholder="Computer Science"
                      value={newProgram.name}
                      onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="programDepartment">Department *</Label>
                    <Select
                      value={newProgram.department}
                      onValueChange={(value) => setNewProgram({ ...newProgram, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Sciences">Sciences</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Medicine">Medicine</SelectItem>
                        <SelectItem value="Law">Law</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (Years) *</Label>
                    <Select
                      value={newProgram.duration.toString()}
                      onValueChange={(value) => setNewProgram({ ...newProgram, duration: Number.parseFloat(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25">3 Months</SelectItem>
                        <SelectItem value="0.5">6 Months</SelectItem>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="2">2 Years</SelectItem>
                        <SelectItem value="3">3 Years</SelectItem>
                        <SelectItem value="4">4 Years</SelectItem>
                        <SelectItem value="5">5 Years</SelectItem>
                        <SelectItem value="6">6 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAddProgram}
                  disabled={!newProgram.name || !newProgram.department}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📋 Current Programs ({Object.keys(programsCatalog).length} programs)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(programsCatalog).map(([programName, program]) => (
                    <div key={programName} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{program.name}</h3>
                        <p className="text-sm text-gray-500">
                          {program.department} Department • {formatProgramDuration(program.duration)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Participants enrolled:{" "}
                          {Object.values(students).filter((s) => s.program === programName).length}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">{formatProgramDuration(program.duration)}</Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Program</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {program.name}? This will only work if no participants
                                are enrolled.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProgram(programName)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {Object.keys(programsCatalog).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No programs available. Add your first program above! 👆</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Participant Management</h2>
              <Button
                onClick={() => document.getElementById("add-student-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Participant
              </Button>
            </div>

            <div className="flex items-center space-x-2 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search Participant by name, ID, email, parish..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Add Student Form */}
            <Card id="add-student-form">
              <CardHeader>
                <CardTitle>Add New Participant</CardTitle>
                <CardDescription>Enter the details for the new participant.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Participant ID *</Label>
                    <Input
                      id="student-id"
                      placeholder="e.g., ST123"
                      value={newStudent.id}
                      onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Full Name *</Label>
                    <Input
                      id="student-name"
                      placeholder="e.g., John Doe"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      placeholder="e.g., john.doe@example.com"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="student-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Auto-generated if empty"
                        value={newStudent.password}
                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-generate.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-program">Program *</Label>
                    <Select
                      value={newStudent.program}
                      onValueChange={(value) => setNewStudent({ ...newStudent, program: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(programsCatalog).map(([programName, program]) => (
                          <SelectItem key={programName} value={programName}>
                            {program.name} ({program.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-year">Year/Level *</Label>
                    <Input
                      id="student-year"
                      placeholder="e.g., 2025"
                      value={newStudent.year}
                      onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-phone">Phone Number</Label>
                    <Input
                      id="student-phone"
                      placeholder="e.g., 555-0123"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-parish">Parish</Label>
                    <Input
                      id="student-parish"
                      placeholder="e.g., St. Mary"
                      value={newStudent.parish}
                      onChange={(e) => setNewStudent({ ...newStudent, parish: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-deanery">Deanery</Label>
                    <Input
                      id="student-deanery"
                      placeholder="e.g., North Deanery"
                      value={newStudent.deanery}
                      onChange={(e) => setNewStudent({ ...newStudent, deanery: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-avatar">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-muted border">
                        <img
                          src={newStudent.avatar || "/placeholder.svg?height=100&width=100"}
                          alt="Avatar Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <Input id="student-avatar" type="file" accept="image/*" onChange={handleAvatarUpload} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Recommended: Square image, max 2MB.</p>
                  </div>
                </div>
                <Button className="mt-6 w-full" onClick={handleAddStudent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Participant
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  All Participants ({searchTerm ? filteredStudents.length : Object.keys(students).length} found)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(students).length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                      {getStudentsByDeaneryAndParish()
                        .filter((deaneryGroup) => {
                          // Filter based on search term
                          if (!searchTerm) return true
                          return deaneryGroup.parishes.some((parishGroup) =>
                            parishGroup.students.some(
                              (student) =>
                                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                student.parish.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                student.deanery.toLowerCase().includes(searchTerm.toLowerCase()),
                            ),
                          )
                        })
                        .map((deaneryGroup, deaneryIndex) => (
                          <AccordionItem
                            key={deaneryGroup.name}
                            value={`deanery-${deaneryIndex}`}
                            className="border rounded-lg mb-2"
                          >
                            <AccordionTrigger className="px-4 hover:no-underline bg-gray-50 dark:bg-slate-900 rounded-t-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-indigo-700 dark:text-indigo-400">
                                  🏛️ {deaneryGroup.name}
                                </span>
                                <Badge variant="secondary">
                                  {deaneryGroup.parishes.reduce((sum, p) => sum + p.students.length, 0)} Participants
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 bg-white dark:bg-slate-950 rounded-b-lg">
                              <Accordion type="multiple" className="w-full space-y-2">
                                {deaneryGroup.parishes
                                  .filter((parishGroup) => {
                                    // Filter parishes based on search term
                                    if (!searchTerm) return true
                                    return parishGroup.students.some(
                                      (student) =>
                                        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        student.parish.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        student.deanery.toLowerCase().includes(searchTerm.toLowerCase()),
                                    )
                                  })
                                  .map((parishGroup, parishIndex) => {
                                    const parishStudents = searchTerm
                                      ? parishGroup.students.filter(
                                          (student) =>
                                            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            student.parish.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            student.deanery.toLowerCase().includes(searchTerm.toLowerCase()),
                                        )
                                      : parishGroup.students

                                    return (
                                      <AccordionItem
                                        key={parishGroup.name}
                                        value={`parish-${deaneryIndex}-${parishIndex}`}
                                        className="border rounded-md"
                                      >
                                        <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-gray-50 dark:hover:bg-slate-900">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                              ⛪ {parishGroup.name}
                                            </span>
                                            <Badge variant="outline">{parishStudents.length}</Badge>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4">
                                          <div className="space-y-4">
                                            {parishStudents.map((student) => (
                                              <Card key={student.id} className="overflow-hidden">
                                                <CardContent className="p-0">
                                                  <div className="flex items-center p-4 gap-4">
                                                    {/* Avatar */}
                                                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0">
                                                      <img
                                                        src={student.avatar || "/placeholder.svg?height=100&width=100"}
                                                        alt={student.name}
                                                        className="h-full w-full object-cover"
                                                      />
                                                    </div>

                                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                      <div>
                                                        <h3 className="font-bold truncate">{student.name}</h3>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                          ID: {student.id}
                                                        </p>
                                                        {student.phone && (
                                                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                                                            📞 {student.phone}
                                                          </p>
                                                        )}
                                                      </div>
                                                      <div>
                                                        <p className="text-sm truncate">{student.program}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                          Year: {student.year}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                                          ✉️ {student.email}
                                                        </p>
                                                      </div>
                                                      <div>
                                                        {student.parish && (
                                                          <p className="text-sm truncate">Parish: {student.parish}</p>
                                                        )}
                                                        {student.deanery && (
                                                          <p className="text-sm text-muted-foreground truncate">
                                                            Deanery: {student.deanery}
                                                          </p>
                                                        )}
                                                      </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                      <Badge variant="outline">{student.courses.length} modules</Badge>

                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditDialog(student)}
                                                      >
                                                        <Pencil className="h-4 w-4" />
                                                      </Button>

                                                      <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                          <Button size="sm" variant="destructive">
                                                            <UserX className="h-4 w-4" />
                                                          </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                          <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Participant</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                              Are you sure you want to delete {student.name}? This
                                                              action cannot be undone and will remove all their module
                                                              data.
                                                            </AlertDialogDescription>
                                                          </AlertDialogHeader>
                                                          <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                              onClick={() => handleDeleteStudent(student.id)}
                                                              className="bg-red-600 hover:bg-red-700"
                                                            >
                                                              Delete
                                                            </AlertDialogAction>
                                                          </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                      </AlertDialog>
                                                    </div>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            ))}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    )
                                  })}
                              </Accordion>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No participants found. Add your first participant above!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Student Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Edit Participant</DialogTitle>
                <DialogDescription>Make changes to the participant's profile.</DialogDescription>
              </DialogHeader>

              {editingStudent && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        value={editingStudent.name}
                        onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        value={editingStudent.email}
                        onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-program">Program</Label>
                      <Input
                        id="edit-program"
                        value={editingStudent.program}
                        onChange={(e) => setEditingStudent({ ...editingStudent, program: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-year">Year</Label>
                      <Input
                        id="edit-year"
                        value={editingStudent.year}
                        onChange={(e) => setEditingStudent({ ...editingStudent, year: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone Number</Label>
                      <Input
                        id="edit-phone"
                        value={editingStudent.phone || ""}
                        onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-parish">Parish</Label>
                      <Input
                        id="edit-parish"
                        value={editingStudent.parish || ""}
                        onChange={(e) => setEditingStudent({ ...editingStudent, parish: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-deanery">Deanery</Label>
                      <Input
                        id="edit-deanery"
                        value={editingStudent.deanery || ""}
                        onChange={(e) => setEditingStudent({ ...editingStudent, deanery: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-avatar">Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted border">
                          <img
                            src={editingStudent.avatar || "/placeholder.svg?height=100&width=100"}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Input
                          id="edit-avatar"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setEditingStudent({ ...editingStudent, avatar: reader.result as string })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStudent}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <TabsContent value="enrollments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enroll Participant in Module</CardTitle>
                <CardDescription>Assign modules from the catalog to participants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="selectStudent">Select Participant *</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a participant" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(students).map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courseId">Module *</Label>
                    <Select
                      value={newCourse.id}
                      onValueChange={(value) => {
                        const catalogCourse = coursesCatalog[value as keyof typeof coursesCatalog]
                        setNewCourse({
                          ...newCourse,
                          id: value,
                          name: catalogCourse?.name || "",
                          credits: catalogCourse?.credits || 3,
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(coursesCatalog).map(([id, course]) => (
                          <SelectItem key={id} value={id}>
                            {id} - {course.name} ({course.credits} credits)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mode">Mode of Study *</Label>
                    <Select
                      value={newCourse.mode}
                      onValueChange={(value) => setNewCourse({ ...newCourse, mode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Self study">Self study</SelectItem>
                        <SelectItem value="Physical">Physical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={newCourse.semester}
                      onValueChange={(value) => setNewCourse({ ...newCourse, semester: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1Qtr">1Qtr</SelectItem>
                        <SelectItem value="2Qtr">2Qtr</SelectItem>
                        <SelectItem value="3Qtr">3Qtr</SelectItem>
                        <SelectItem value="4Qtr">4Qtr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newCourse.status}
                      onValueChange={(value) => setNewCourse({ ...newCourse, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Registered">Registered</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleAddCourse} className="w-full" disabled={!selectedStudent || !newCourse.id}>
                  <Plus className="h-4 w-4 mr-2" />
                  Enroll Participant
                </Button>
              </CardContent>
            </Card>

            {/* Show courses for selected student */}
            {selectedStudent && students[selectedStudent] && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Current Enrollments for {students[selectedStudent].name} ({students[selectedStudent].courses.length}
                    )
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {students[selectedStudent].courses.map((course: any) => (
                      <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{course.id}</span>
                          <span className="text-xs text-gray-500">
                            {course.mode} • {course.semester} • {course.credits} credits
                          </span>
                          <div className="text-xs text-gray-400">
                            Progress: {course.progress}% • Grade: {course.grade}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              course.status === "Completed"
                                ? "default"
                                : course.status === "In Progress"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {course.status}
                          </Badge>
                          {course.grade !== "-" && (
                            <Badge variant="outline" className="text-xs">
                              {course.grade}
                            </Badge>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Enrollment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {course.name} from this participant's enrollments?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCourse(selectedStudent, course.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                    {students[selectedStudent].courses.length === 0 && (
                      <p className="text-center py-4 text-gray-500">No modules assigned to this participant yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Grades</CardTitle>
                <CardDescription>Upload a CSV file to update grades for existing enrollments.</CardDescription>
              </CardHeader>
              <CardContent>
                <FileImport
                  title="Import Grades"
                  description="Upload a CSV file with grade updates (studentId, courseId, grade)"
                  template={generateGradeTemplateCSV()}
                  onImport={handleImportGrades}
                  validateRow={validateGradeRow}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Update Grades</CardTitle>
                <CardDescription>Update grades for participants, organized by Deanery and Parish.</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(students).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No participants found. Add participants first to manage their grades.</p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {getStudentsByDeaneryAndParish().map((deaneryGroup, index) => (
                      <AccordionItem key={deaneryGroup.name} value={`deanery-${index}`}>
                        <AccordionTrigger className="text-lg font-bold bg-muted/30 px-4 rounded-t">
                          🏛️ {deaneryGroup.name}
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 px-2">
                          <Accordion type="multiple" className="w-full space-y-2">
                            {deaneryGroup.parishes.map((parishGroup, pIndex) => (
                              <AccordionItem key={parishGroup.name} value={`parish-${index}-${pIndex}`}>
                                <AccordionTrigger className="text-md font-semibold text-primary">
                                  ⛪ {parishGroup.name} ({parishGroup.students.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4 pt-2">
                                    {parishGroup.students.map((student) => (
                                      <div key={student.id} className="border rounded-lg p-4 bg-card shadow-sm">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                          {student.name}{" "}
                                          <span className="text-muted-foreground text-sm">({student.id})</span>
                                          <Badge variant="secondary" className="text-xs">
                                            {student.courses.length} modules
                                          </Badge>
                                        </h3>
                                        <div className="space-y-2">
                                          {student.courses.map((course: any) => (
                                            <div
                                              key={course.id}
                                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-muted/50 rounded"
                                            >
                                              <div className="flex-1">
                                                <span className="font-medium">{course.id}</span>
                                                <span className="text-sm text-gray-500 ml-2">{course.name}</span>
                                                <div className="text-xs text-gray-400">
                                                  {course.mode || "Physical"} • {course.semester} • {course.credits}{" "}
                                                  credits
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                  {course.status}
                                                </Badge>
                                                <Select
                                                  defaultValue={course.grade}
                                                  onValueChange={(value) =>
                                                    handleUpdateGrade(student.id, course.id, value)
                                                  }
                                                >
                                                  <SelectTrigger className="w-20">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="A">A</SelectItem>
                                                    <SelectItem value="A-">A-</SelectItem>
                                                    <SelectItem value="B+">B+</SelectItem>
                                                    <SelectItem value="B">B</SelectItem>
                                                    <SelectItem value="B-">B-</SelectItem>
                                                    <SelectItem value="C+">C+</SelectItem>
                                                    <SelectItem value="C">C</SelectItem>
                                                    <SelectItem value="F">F</SelectItem>
                                                    <SelectItem value="-">-</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </div>
                                          ))}
                                          {student.courses.length === 0 && (
                                            <p className="text-center py-2 text-gray-500 text-sm">
                                              No modules assigned
                                            </p>
                                          )}
                                        </div>
                                      </div>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
