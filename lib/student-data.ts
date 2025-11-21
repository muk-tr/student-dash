// Student Database with passwords
export const studentsDatabase = {
  ST001: {
    id: "ST001",
    name: "John Smith",
    email: "john.smith@university.edu",
    password: "john123", // Individual password for John
    program: "Computer Science",
    year: "2025",
    semester: "1Qtr",
    avatar: "/placeholder.svg?height=100&width=100",
    courses: [
      {
        id: "CS301",
        name: "Data Structures & Algorithms",
        credits: 4,
        grade: "A",
        gpa: 4.0,
        status: "Completed",
        progress: 100,
        instructor: "Dr. Smith",
        semester: "2Qtr",
      },
      {
        id: "CS302",
        name: "Database Systems",
        credits: 3,
        grade: "A-",
        gpa: 3.7,
        status: "Completed",
        progress: 100,
        instructor: "Prof. Johnson",
        semester: "2Qtr",
      },
      {
        id: "CS401",
        name: "Machine Learning",
        credits: 4,
        grade: "B+",
        gpa: 3.3,
        status: "In Progress",
        progress: 75,
        instructor: "Dr. Williams",
        semester: "1Qtr",
      },
      {
        id: "CS402",
        name: "Software Engineering",
        credits: 3,
        grade: "-",
        gpa: 0,
        status: "Registered",
        progress: 25,
        instructor: "Prof. Davis",
        semester: "1Qtr",
      },
      {
        id: "MATH301",
        name: "Statistics",
        credits: 3,
        grade: "A",
        gpa: 4.0,
        status: "Completed",
        progress: 100,
        instructor: "Dr. Brown",
        semester: "2Qtr",
      },
    ],
    gradeHistory: [
      { semester: "1Qtr", gpa: 3.4 },
      { semester: "2Qtr", gpa: 3.8 },
      { semester: "3Qtr", gpa: 3.5 },
    ],
  },
  ST002: {
    id: "ST002",
    name: "Emily Johnson",
    email: "emily.johnson@university.edu",
    password: "emily456", // Individual password for Emily
    program: "Information Technology",
    year: "2026",
    semester: "1Qtr",
    avatar: "/placeholder.svg?height=100&width=100",
    courses: [
      {
        id: "IT201",
        name: "Network Fundamentals",
        credits: 3,
        grade: "A",
        gpa: 4.0,
        status: "Completed",
        progress: 100,
        instructor: "Prof. Wilson",
        semester: "2Qtr",
      },
      {
        id: "IT202",
        name: "Web Development",
        credits: 4,
        grade: "A-",
        gpa: 3.7,
        status: "Completed",
        progress: 100,
        instructor: "Dr. Martinez",
        semester: "2Qtr",
      },
      {
        id: "IT301",
        name: "Cybersecurity",
        credits: 3,
        grade: "B+",
        gpa: 3.3,
        status: "In Progress",
        progress: 60,
        instructor: "Prof. Anderson",
        semester: "1Qtr",
      },
      {
        id: "IT302",
        name: "Cloud Computing",
        credits: 3,
        grade: "-",
        gpa: 0,
        status: "Registered",
        progress: 15,
        instructor: "Dr. Thompson",
        semester: "1Qtr",
      },
    ],
    gradeHistory: [
      { semester: "1Qtr", gpa: 3.6 },
      { semester: "2Qtr", gpa: 3.85 },
      { semester: "3Qtr", gpa: 3.3 },
    ],
  },
  ST003: {
    id: "ST003",
    name: "Michael Brown",
    email: "michael.brown@university.edu",
    password: "mike789", // Individual password for Michael
    program: "Data Science",
    year: "2025",
    semester: "1Qtr",
    avatar: "/placeholder.svg?height=100&width=100",
    courses: [
      {
        id: "DS401",
        name: "Advanced Machine Learning",
        credits: 4,
        grade: "A",
        gpa: 4.0,
        status: "Completed",
        progress: 100,
        instructor: "Dr. Chen",
        semester: "2Qtr",
      },
      {
        id: "DS402",
        name: "Big Data Analytics",
        credits: 3,
        grade: "A",
        gpa: 4.0,
        status: "Completed",
        progress: 100,
        instructor: "Prof. Lee",
        semester: "2Qtr",
      },
      {
        id: "DS403",
        name: "Deep Learning",
        credits: 4,
        grade: "A-",
        gpa: 3.7,
        status: "In Progress",
        progress: 80,
        instructor: "Dr. Kumar",
        semester: "1Qtr",
      },
      {
        id: "DS404",
        name: "Data Visualization",
        credits: 3,
        grade: "-",
        gpa: 0,
        status: "Registered",
        progress: 30,
        instructor: "Prof. Garcia",
        semester: "1Qtr",
      },
    ],
    gradeHistory: [
      { semester: "1Qtr", gpa: 3.8 },
      { semester: "2Qtr", gpa: 3.9 },
      { semester: "3Qtr", gpa: 3.95 },
      { semester: "4Qtr", gpa: 4.0 },
    ],
  },
  ST004: {
    id: "ST004",
    name: "Sarah Davis",
    email: "sarah.davis@university.edu",
    password: "sarah321", // Individual password for Sarah
    program: "Software Engineering",
    year: "2027",
    semester: "1Qtr",
    avatar: "/placeholder.svg?height=100&width=100",
    courses: [
      {
        id: "SE101",
        name: "Introduction to Programming",
        credits: 4,
        grade: "A-",
        gpa: 3.7,
        status: "Completed",
        progress: 100,
        instructor: "Prof. White",
        semester: "2Qtr",
      },
      {
        id: "SE102",
        name: "Software Design Principles",
        credits: 3,
        grade: "B+",
        gpa: 3.3,
        status: "In Progress",
        progress: 70,
        instructor: "Dr. Taylor",
        semester: "1Qtr",
      },
      {
        id: "MATH101",
        name: "Calculus I",
        credits: 4,
        grade: "-",
        gpa: 0,
        status: "Registered",
        progress: 40,
        instructor: "Prof. Miller",
        semester: "1Qtr",
      },
      {
        id: "ENG101",
        name: "Technical Writing",
        credits: 3,
        grade: "-",
        gpa: 0,
        status: "Registered",
        progress: 20,
        instructor: "Dr. Roberts",
        semester: "1Qtr",
      },
    ],
    gradeHistory: [
      { semester: "2Qtr", gpa: 3.7 },
      { semester: "1Qtr", gpa: 3.5 },
    ],
  },
}

// Available courses catalog (keeping the name as coursesCatalog for compatibility)
export const coursesCatalog = {
  // Computer Science Modules
  CS101: { name: "Introduction to Computer Science", credits: 3, department: "Computer Science" },
  CS201: { name: "Object-Oriented Programming", credits: 4, department: "Computer Science" },
  CS301: { name: "Data Structures & Algorithms", credits: 4, department: "Computer Science" },
  CS302: { name: "Database Systems", credits: 3, department: "Computer Science" },
  CS401: { name: "Machine Learning", credits: 4, department: "Computer Science" },
  CS402: { name: "Software Engineering", credits: 3, department: "Computer Science" },

  // Information Technology Modules
  IT201: { name: "Network Fundamentals", credits: 3, department: "Information Technology" },
  IT202: { name: "Web Development", credits: 4, department: "Information Technology" },
  IT301: { name: "Cybersecurity", credits: 3, department: "Information Technology" },
  IT302: { name: "Cloud Computing", credits: 3, department: "Information Technology" },

  // Data Science Modules
  DS401: { name: "Advanced Machine Learning", credits: 4, department: "Data Science" },
  DS402: { name: "Big Data Analytics", credits: 3, department: "Data Science" },
  DS403: { name: "Deep Learning", credits: 4, department: "Data Science" },
  DS404: { name: "Data Visualization", credits: 3, department: "Data Science" },

  // Software Engineering Modules
  SE101: { name: "Introduction to Programming", credits: 4, department: "Software Engineering" },
  SE102: { name: "Software Design Principles", credits: 3, department: "Software Engineering" },

  // Math Modules
  MATH101: { name: "Calculus I", credits: 4, department: "Mathematics" },
  MATH301: { name: "Statistics", credits: 3, department: "Mathematics" },

  // English Modules
  ENG101: { name: "Technical Writing", credits: 3, department: "English" },
}

// Available programs with extended duration options
export const programsCatalog = {
  "Computer Science": { name: "Computer Science", department: "Engineering", duration: 4 },
  "Information Technology": { name: "Information Technology", department: "Engineering", duration: 4 },
  "Data Science": { name: "Data Science", department: "Engineering", duration: 4 },
  "Software Engineering": { name: "Software Engineering", department: "Engineering", duration: 4 },
  "Business Administration": { name: "Business Administration", department: "Business", duration: 4 },
  Mathematics: { name: "Mathematics", department: "Sciences", duration: 4 },
  Physics: { name: "Physics", department: "Sciences", duration: 4 },
  "English Literature": { name: "English Literature", department: "Arts", duration: 4 },
  "Certificate Program": { name: "Certificate Program", department: "Professional", duration: 0.25 }, // 3 months
  "Diploma Course": { name: "Diploma Course", department: "Professional", duration: 0.5 }, // 6 months
  "Foundation Year": { name: "Foundation Year", department: "Preparatory", duration: 1 }, // 1 year
}

// Helper function to get student data
export function getStudentData(studentId: string) {
  return studentsDatabase[studentId as keyof typeof studentsDatabase] || null
}

// Helper function to calculate GPA
export function calculateGPA(courses: any[]) {
  const completedCourses = courses.filter((course) => course.status === "Completed" && course.gpa > 0)
  if (completedCourses.length === 0) return "0.00"

  const totalCredits = completedCourses.reduce((sum, course) => sum + course.credits, 0)
  const totalGradePoints = completedCourses.reduce((sum, course) => sum + course.credits * course.gpa, 0)

  return (totalGradePoints / totalCredits).toFixed(2)
}

// Helper function to get graduation year based on current year and program duration
export function getGraduationYears() {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 8 }, (_, i) => currentYear + i)
}

// Helper function to format program duration
export function formatProgramDuration(duration: number): string {
  if (duration < 1) {
    const months = Math.round(duration * 12)
    return `${months} month${months !== 1 ? "s" : ""}`
  }
  return `${duration} year${duration !== 1 ? "s" : ""}`
}
