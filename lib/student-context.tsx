"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
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
  addStudent: (student: any) => void
  updateStudent: (studentId: string, data: any) => void
  deleteStudent: (studentId: string) => void
  addCourseToStudent: (studentId: string, course: any) => void
  updateStudentCourse: (studentId: string, courseId: string, updates: any) => void
  deleteCourseFromStudent: (studentId: string, courseId: string) => void
  addCourseToCatalog: (courseId: string, courseData: any) => void
  updateCourseInCatalog: (courseId: string, courseData: any) => void
  deleteCourseFromCatalog: (courseId: string) => void
  addProgramToCatalog: (programName: string, programData: any) => void
  updateProgramInCatalog: (programName: string, programData: any) => void
  deleteProgramFromCatalog: (programName: string) => void
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<StudentData>({})
  const [coursesCatalog, setCoursesCatalog] = useState<CourseCatalog>({})
  const [programsCatalog, setProgramsCatalog] = useState<ProgramsCatalog>({})

  // Initialize from localStorage if available, otherwise use initial data
  useEffect(() => {
    const savedStudentData = localStorage.getItem("studentData")
    const savedCourseData = localStorage.getItem("coursesCatalog")
    const savedProgramData = localStorage.getItem("programsCatalog")

    if (savedStudentData) {
      try {
        setStudents(JSON.parse(savedStudentData))
      } catch (e) {
        console.error("Failed to parse saved student data", e)
        setStudents(initialStudentsData)
      }
    } else {
      setStudents(initialStudentsData)
    }

    if (savedCourseData) {
      try {
        setCoursesCatalog(JSON.parse(savedCourseData))
      } catch (e) {
        console.error("Failed to parse saved course data", e)
        setCoursesCatalog(initialCoursesCatalog)
      }
    } else {
      setCoursesCatalog(initialCoursesCatalog)
    }

    if (savedProgramData) {
      try {
        setProgramsCatalog(JSON.parse(savedProgramData))
      } catch (e) {
        console.error("Failed to parse saved program data", e)
        setProgramsCatalog(initialProgramsCatalog)
      }
    } else {
      setProgramsCatalog(initialProgramsCatalog)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (Object.keys(students).length > 0) {
      localStorage.setItem("studentData", JSON.stringify(students))
    }
  }, [students])

  useEffect(() => {
    if (Object.keys(coursesCatalog).length > 0) {
      localStorage.setItem("coursesCatalog", JSON.stringify(coursesCatalog))
    }
  }, [coursesCatalog])

  useEffect(() => {
    if (Object.keys(programsCatalog).length > 0) {
      localStorage.setItem("programsCatalog", JSON.stringify(programsCatalog))
    }
  }, [programsCatalog])

  const addStudent = (student: any) => {
    setStudents((prev) => ({
      ...prev,
      [student.id]: {
        ...student,
        courses: student.courses || [],
        gradeHistory: student.gradeHistory || [{ semester: student.semester || "1Qtr", gpa: 0 }],
      },
    }))
  }

  const updateStudent = (studentId: string, data: any) => {
    setStudents((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...data,
      },
    }))
  }

  const deleteStudent = (studentId: string) => {
    setStudents((prev) => {
      const newStudents = { ...prev }
      delete newStudents[studentId]
      return newStudents
    })
  }

  const addCourseToStudent = (studentId: string, course: any) => {
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
  }

  const updateStudentCourse = (studentId: string, courseId: string, updates: any) => {
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
  }

  const deleteCourseFromStudent = (studentId: string, courseId: string) => {
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
  }

  const addCourseToCatalog = (courseId: string, courseData: any) => {
    setCoursesCatalog((prev) => ({
      ...prev,
      [courseId]: courseData,
    }))
  }

  const updateCourseInCatalog = (courseId: string, courseData: any) => {
    setCoursesCatalog((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        ...courseData,
      },
    }))
  }

  const deleteCourseFromCatalog = (courseId: string) => {
    setCoursesCatalog((prev) => {
      const newCatalog = { ...prev }
      delete newCatalog[courseId]
      return newCatalog
    })
  }

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
