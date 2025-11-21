"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { parseCSV } from "@/lib/csv-utils"

interface FileImportProps {
  title: string
  description: string
  templateFileName: string
  templateData: string
  onImport: (data: any[]) => void
  validateRow?: (row: any) => { valid: boolean; message?: string }
}

export function FileImport({
  title,
  description,
  templateFileName,
  templateData,
  onImport,
  validateRow = () => ({ valid: true }),
}: FileImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      setErrors([])
    }
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([templateData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = templateFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)
    setErrors([])

    try {
      const text = await file.text()
      const data = parseCSV(text)

      if (data.length === 0) {
        setResult({ success: false, message: "No data found in file or invalid format" })
        setImporting(false)
        return
      }

      // Validate each row
      const validationErrors: string[] = []
      const validData = data.filter((row, index) => {
        const validation = validateRow(row)
        if (!validation.valid) {
          validationErrors.push(`Row ${index + 2}: ${validation.message || "Invalid data"}`)
          return false
        }
        return true
      })

      setErrors(validationErrors)

      if (validData.length > 0) {
        onImport(validData)
        setResult({
          success: true,
          message: "Import completed successfully",
          count: validData.length,
        })
      } else {
        setResult({ success: false, message: "No valid data found in file" })
      }
    } catch (error) {
      console.error("Import error:", error)
      setResult({ success: false, message: "Error processing file" })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload CSV File</Label>
          <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer" />
          <p className="text-xs text-gray-500">File must be in CSV format with the correct headers</p>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button onClick={handleImport} disabled={!file || importing}>
            <Upload className="h-4 w-4 mr-2" />
            {importing ? "Importing..." : "Import Data"}
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.success && result.count && ` (${result.count} records imported)`}
            </AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Validation Errors:</h4>
            <div className="bg-red-50 p-3 rounded-md text-sm text-red-800 max-h-40 overflow-y-auto">
              <ul className="list-disc pl-5 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">Note: Existing records with the same ID will be updated</CardFooter>
    </Card>
  )
}
