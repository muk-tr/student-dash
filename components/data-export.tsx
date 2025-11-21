"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { objectsToCSV } from "@/lib/csv-utils"

interface DataExportProps {
  title: string
  description: string
  fileName: string
  getData: () => any[]
  transformData?: (data: any[]) => any[]
}

export function DataExport({ title, description, fileName, getData, transformData = (data) => data }: DataExportProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = () => {
    setExporting(true)

    try {
      // Get and transform data
      const rawData = getData()
      const transformedData = transformData(rawData)

      // Convert to CSV
      const csv = objectsToCSV(transformedData)

      // Create download
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} disabled={exporting} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exporting..." : `Export to ${fileName}`}
        </Button>
      </CardContent>
    </Card>
  )
}
