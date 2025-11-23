// CSV parsing and export utilities

// Parse CSV string into array of objects
export function parseCSV(csvString: string): any[] {
  // Split by lines and filter out empty lines
  const lines = csvString.split("\n").filter((line) => line.trim() !== "")

  if (lines.length === 0) return []

  // Extract headers from first line
  const headers = lines[0].split(",").map((header) => header.trim())

  // Parse data rows
  const data = lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim())
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })

    return row
  })

  return data
}

// Convert array of objects to CSV string
export function objectsToCSV(data: any[]): string {
  if (data.length === 0) return ""

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create header row
  const headerRow = headers.join(",")

  // Create data rows
  const dataRows = data.map((obj) => {
    return headers
      .map((header) => {
        // Handle values that might contain commas by wrapping in quotes
        const value = obj[header] === null || obj[header] === undefined ? "" : obj[header]
        const valueStr = String(value)
        return valueStr.includes(",") ? `"${valueStr}"` : valueStr
      })
      .join(",")
  })

  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n")
}

// Generate student template CSV
export function generateStudentTemplateCSV(): string {
  return "id,name,email,password,program,year,semester,parish,deanery,phone\nST001,John Doe,john@example.com,john123,Computer Science,2025,1Qtr,St. Mary Parish,Eastern Deanery,+1234567890"
}

// Generate module template CSV
export function generateCourseTemplateCSV(): string {
  return "id,name,credits,department\nCS501,Advanced Programming,3,Computer Science"
}

// Generate program template CSV
export function generateProgramTemplateCSV(): string {
  return "name,department,duration\nComputer Science,Engineering,4"
}

// Generate enrollment template CSV
export function generateEnrollmentTemplateCSV(): string {
  return "studentId,courseId,mode,semester,status,grade\nST001,CS101,Physical,1Qtr,In Progress,-"
}
