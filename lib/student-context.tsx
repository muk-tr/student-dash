"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "./supabase/client"
import {
  studentsDatabase as initialStudentsData,
  coursesCatalog as initialCoursesCatalog,
  programsCatalog as initialProgramsCatalog,
} from "./student-data"

type StudentData = typeof initialStudentsData
type CourseCatalog = typeof initialCoursesCatalog
type ProgramsCatalog = typeof initialProgramsCatalog

interface StudentContextType {
  students: StudentData
  coursesCatalog: CourseCatalog
  programsCatalog: ProgramsCatalog
  addStudent: (student: any) => Promise<void>
  updateStudent: (studentId: string, data: any) => Promise<void>
  deleteStudent: (studentId: string) => Promise<void>
  addCourseToStudent: (studentId: string, course: any) => Promise<void>
  updateStudentCourse: (studentId: string, courseId: string, updates: any) => Promise<void>
  deleteCourseFromStudent: (studentId: string, courseId: string) => Promise<void>
  addCourseToCatalog: (courseId: string, courseData: any) => Promise<void>
  updateCourseInCatalog: (courseId: string, courseData: any) => Promise<void>
  deleteCourseFromCatalog: (courseId: string) => Promise<void>
  addProgramToCatalog: (programName: string, programData: any) => void
  updateProgramInCatalog: (programName: string, programData: any) => void
  deleteProgramFromCatalog: (programName: string) => void
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<StudentData>({})
  const [coursesCatalog, setCoursesCatalog] = useState<CourseCatalog>({})
  const [programsCatalog, setProgramsCatalog] = useState<ProgramsCatalog>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadDataFromSupabase()
  }, [])

  const loadDataFromSupabase = async () => {
    try {
      // Load students
      const { data: studentsData, error: studentsError } = await supabase.from("students").select("*")

      if (studentsError) {
        // If table doesn't exist, we might get a specific error code like '42P01'
        if (studentsError.code === "42P01") {
          console.warn("Tables do not exist yet. Waiting for initialization.")
          // We can leave state empty or set a flag
        }
        throw studentsError
      }

      // Load student courses
      const { data: coursesData, error: coursesError } = await supabase.from("student_courses").select("*")

      if (coursesError) throw coursesError

      // Load grade history
      const { data: gradeHistoryData, error: gradeHistoryError } = await supabase.from("grade_history").select("*")

      if (gradeHistoryError) throw gradeHistoryError

      // Load courses catalog
      const { data: catalogData, error: catalogError } = await supabase.from("courses").select("*")

      if (catalogError) throw catalogError

      // Transform students data
      const studentsMap: any = {}
      studentsData?.forEach((student: any) => {
        const studentCourses = coursesData?.filter((c: any) => c.student_id === student.id) || []
        const studentGradeHistory = gradeHistoryData?.filter((g: any) => g.student_id === student.id) || []

        studentsMap[student.id] = {
          id: student.id,
          name: student.name,
          email: student.email,
          password: student.id.toLowerCase().replace("st", "") + "123", // Demo password
          program: student.program,
          year: student.year,
          semester: student.semester,
          avatar: student.avatar || "/placeholder.svg?height=100&width=100",
          courses: studentCourses.map((c: any) => ({
            id: c.course_id,
            name: c.course_name,
            credits: c.credits,
            grade: c.grade || "-",
            gpa: c.gpa || 0,
            status: c.status,
            progress: c.progress || 0,
            instructor: c.instructor || "TBD",
            semester: c.semester,
          })),
          gradeHistory: studentGradeHistory.map((g: any) => ({
            semester: g.semester,
            gpa: g.gpa,
          })),
        }
      })

      // Transform courses catalog
      const catalogMap: any = {}
      catalogData?.forEach((course: any) => {
        catalogMap[course.id] = {
          name: course.name,
          credits: course.credits,
          department: course.department,
        }
      })

      setStudents(studentsMap)
      setCoursesCatalog(catalogMap)

      // For now, keep programs in localStorage
      const savedProgramData = localStorage.getItem("programsCatalog")
      if (savedProgramData) {
        setProgramsCatalog(JSON.parse(savedProgramData))
      } else {
        setProgramsCatalog(initialProgramsCatalog)
      }
    } catch (error) {
      console.error("Error loading data from Supabase:", error)
      // Fallback to localStorage or initial data
      const savedStudentData = localStorage.getItem("studentData")
      if (savedStudentData) {
        setStudents(JSON.parse(savedStudentData))
      } else {
        setStudents(initialStudentsData)
      }

      const savedCourseData = localStorage.getItem("coursesCatalog")
      if (savedCourseData) {
        setCoursesCatalog(JSON.parse(savedCourseData))
      } else {
        setCoursesCatalog(initialCoursesCatalog)
      }

      const savedProgramData = localStorage.getItem("programsCatalog")
      if (savedProgramData) {
        setProgramsCatalog(JSON.parse(savedProgramData))
      } else {
        setProgramsCatalog(initialProgramsCatalog)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (Object.keys(students).length > 0 && !isLoading) {
      localStorage.setItem("studentData", JSON.stringify(students))
    }
  }, [students, isLoading])

  useEffect(() => {
    if (Object.keys(coursesCatalog).length > 0 && !isLoading) {
      localStorage.setItem("coursesCatalog", JSON.stringify(coursesCatalog))
    }
  }, [coursesCatalog, isLoading])

  useEffect(() => {
    if (Object.keys(programsCatalog).length > 0) {
      localStorage.setItem("programsCatalog", JSON.stringify(programsCatalog))
    }
  }, [programsCatalog])

  const addStudent = async (student: any) => {
    try {
      // Insert into Supabase
      const { error } = await supabase.from("students").insert({
        id: student.id,
        name: student.name,
        email: student.email || `${student.id.toLowerCase()}@university.edu`,
        password_hash: student.password,
        program: student.program,
        year: student.year,
        semester: student.semester,
        avatar: student.avatar === "/placeholder.svg?height=100&width=100" ? null : student.avatar,
      })

      if (error) throw error

      // Update local state
      setStudents((prev) => ({
        ...prev,
        [student.id]: {
          ...student,
          courses: student.courses || [],
          gradeHistory: student.gradeHistory || [{ semester: student.semester || "1Qtr", gpa: 0 }],
        },
      }))
    } catch (error) {
      console.error("Error adding student:", error)
      throw error
    }
  }

  const updateStudent = async (studentId: string, data: any) => {
    try {
      const updateData: any = {}
      if (data.name) updateData.name = data.name
      if (data.email) updateData.email = data.email
      if (data.program) updateData.program = data.program
      if (data.year) updateData.year = data.year
      if (data.semester) updateData.semester = data.semester
      if (data.avatar) {
        // Save avatar as base64 string in database
        updateData.avatar = data.avatar === "/placeholder.svg?height=100&width=100" ? null : data.avatar
      }
      if (data.password) {
        updateData.password_hash = data.password
      }

      const { error } = await supabase.from("students").update(updateData).eq("id", studentId)

      if (error) throw error

      // Update local state
      setStudents((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          ...data,
        },
      }))
    } catch (error) {
      console.error("Error updating student:", error)
      // Update local state anyway for immediate feedback
      setStudents((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          ...data,
        },
      }))
    }
  }

  const deleteStudent = async (studentId: string) => {
    try {
      const { error } = await supabase.from("students").delete().eq("id", studentId)

      if (error) throw error

      setStudents((prev) => {
        const newStudents = { ...prev }
        delete newStudents[studentId]
        return newStudents
      })
    } catch (error) {
      console.error("Error deleting student:", error)
      throw error
    }
  }

  const addCourseToStudent = async (studentId: string, course: any) => {
    try {
      const { error } = await supabase.from("student_courses").insert({
        student_id: studentId,
        course_id: course.id,
        course_name: course.name,
        credits: course.credits,
        grade: course.grade || "-",
        gpa: course.gpa || 0,
        status: course.status,
        progress: course.progress || 0,
        instructor: course.instructor,
        semester: course.semester,
      })

      if (error) throw error

      setStudents((prev) => {
        const student = prev[studentId]
        if (!student) return prev

        return {
          ...prev,
          [studentId]: {
            ...student,
            courses: [...student.courses, course],
          },
        }
      })
    } catch (error) {
      console.error("Error adding course to student:", error)
      throw error
    }
  }

  const updateStudentCourse = async (studentId: string, courseId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from("student_courses")
        .update({
          grade: updates.grade,
          gpa: updates.gpa,
          status: updates.status,
          progress: updates.progress,
        })
        .eq("student_id", studentId)
        .eq("course_id", courseId)

      if (error) throw error

      setStudents((prev) => {
        const student = prev[studentId]
        if (!student) return prev

        return {
          ...prev,
          [studentId]: {
            ...student,
            courses: student.courses.map((course) => (course.id === courseId ? { ...course, ...updates } : course)),
          },
        }
      })
    } catch (error) {
      console.error("Error updating course:", error)
      throw error
    }
  }

  const deleteCourseFromStudent = async (studentId: string, courseId: string) => {
    try {
      const { error } = await supabase
        .from("student_courses")
        .delete()
        .eq("student_id", studentId)
        .eq("course_id", courseId)

      if (error) throw error

      setStudents((prev) => {
        const student = prev[studentId]
        if (!student) return prev

        return {
          ...prev,
          [studentId]: {
            ...student,
            courses: student.courses.filter((course) => course.id !== courseId),
          },
        }
      })
    } catch (error) {
      console.error("Error deleting course:", error)
      throw error
    }
  }

  const addCourseToCatalog = async (courseId: string, courseData: any) => {
    try {
      const { error } = await supabase.from("courses").insert({
        id: courseId,
        name: courseData.name,
        credits: courseData.credits,
        department: courseData.department,
        instructor: courseData.instructor || null,
      })

      if (error) throw error

      setCoursesCatalog((prev) => ({
        ...prev,
        [courseId]: courseData,
      }))
    } catch (error) {
      console.error("Error adding course to catalog:", error)
      throw error
    }
  }

  const updateCourseInCatalog = async (courseId: string, courseData: any) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          name: courseData.name,
          credits: courseData.credits,
          department: courseData.department,
        })
        .eq("id", courseId)

      if (error) throw error

      setCoursesCatalog((prev) => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          ...courseData,
        },
      }))
    } catch (error) {
      console.error("Error updating course:", error)
      throw error
    }
  }

  const deleteCourseFromCatalog = async (courseId: string) => {
    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId)

      if (error) throw error

      setCoursesCatalog((prev) => {
        const newCatalog = { ...prev }
        delete newCatalog[courseId]
        return newCatalog
      })
    } catch (error) {
      console.error("Error deleting course:", error)
      throw error
    }
  }

  // Programs remain in localStorage for now
  const addProgramToCatalog = (programName: string, programData: any) => {
    setProgramsCatalog((prev) => ({
      ...prev,
      [programName]: programData,
    }))
  }

  const updateProgramInCatalog = (programName: string, programData: any) => {
    setProgramsCatalog((prev) => ({
      ...prev,
      [programName]: {
        ...prev[programName],
        ...programData,
      },
    }))
  }

  const deleteProgramFromCatalog = (programName: string) => {
    setProgramsCatalog((prev) => {
      const newCatalog = { ...prev }
      delete newCatalog[programName]
      return newCatalog
    })
  }

  return (
    <StudentContext.Provider
      value={{
        students,
        coursesCatalog,
        programsCatalog,
        addStudent,
        updateStudent,
        deleteStudent,
        addCourseToStudent,
        updateStudentCourse,
        deleteCourseFromStudent,
        addCourseToCatalog,
        updateCourseInCatalog,
        deleteCourseFromCatalog,
        addProgramToCatalog,
        updateProgramInCatalog,
        deleteProgramFromCatalog,
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudents() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudents must be used within a StudentProvider")
  }
  return context
}
